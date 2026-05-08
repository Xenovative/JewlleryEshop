import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getStripe, FOB_HONG_KONG_OFFICE, CHECKOUT_CURRENCY } from "@lumiere/db";

const Body = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        qty: z.number().int().positive(),
      })
    )
    .min(1)
    .max(100),
});

export async function POST(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }
  const { items } = parsed.data;

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  type LineItem = {
    quantity: number;
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; description?: string; images?: string[] };
    };
  };
  const lineItems: LineItem[] = [];
  const cartSnapshot: Array<{
    productId: string;
    variantId?: string;
    name: string;
    qty: number;
    priceCents: number;
  }> = [];

  for (const item of items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p) {
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 }
      );
    }
    let variantLabel: string | undefined;
    let stock = p.stock;
    if (item.variantId) {
      const v = p.variants.find((x) => x.id === item.variantId);
      if (!v) {
        return NextResponse.json({ error: "Variant not found" }, { status: 400 });
      }
      variantLabel = v.label;
      stock = v.stock;
    }
    if (item.qty > stock) {
      return NextResponse.json(
        { error: `Not enough stock for ${p.name}` },
        { status: 400 }
      );
    }

    const baseName = variantLabel ? `${p.name} (${variantLabel})` : p.name;
    lineItems.push({
      quantity: item.qty,
      price_data: {
        currency: CHECKOUT_CURRENCY,
        unit_amount: p.priceCents,
        product_data: {
          name: baseName,
          description: FOB_HONG_KONG_OFFICE,
          images: [p.imageUrl],
        },
      },
    });
    cartSnapshot.push({
      productId: p.id,
      variantId: item.variantId,
      name: variantLabel ? `${p.name} (${variantLabel})` : p.name,
      qty: item.qty,
      priceCents: p.priceCents,
    });
  }

  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: { cart: JSON.stringify(cartSnapshot) },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe error", e);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
