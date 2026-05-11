import { z } from "zod";
import { prisma, CHECKOUT_CURRENCY, FOB_HONG_KONG_OFFICE } from "@lumiere/db";

export const CheckoutItemsSchema = z.object({
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

export type CartSnapshotItem = {
  productId: string;
  variantId?: string;
  name: string;
  qty: number;
  priceCents: number;
};

export type CheckoutLineItem = {
  quantity: number;
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: { name: string; description?: string; images?: string[] };
  };
};

export type ResolvedCheckout = {
  lineItems: CheckoutLineItem[];
  cartSnapshot: CartSnapshotItem[];
  amountTotalCents: number;
};

export async function resolveCheckoutItems(
  items: z.infer<typeof CheckoutItemsSchema>["items"]
): Promise<
  | { ok: true; data: ResolvedCheckout }
  | { ok: false; error: string; status: number }
> {
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  const lineItems: CheckoutLineItem[] = [];
  const cartSnapshot: CartSnapshotItem[] = [];

  for (const item of items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p) {
      return {
        ok: false,
        error: `Product not found: ${item.productId}`,
        status: 400,
      };
    }
    let variantLabel: string | undefined;
    let stock = p.stock;
    if (item.variantId) {
      const v = p.variants.find((x) => x.id === item.variantId);
      if (!v) {
        return { ok: false, error: "Variant not found", status: 400 };
      }
      variantLabel = v.label;
      stock = v.stock;
    }
    if (item.qty > stock) {
      return {
        ok: false,
        error: `Not enough stock for ${p.name}`,
        status: 400,
      };
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

  const amountTotalCents = cartSnapshot.reduce(
    (s, i) => s + i.priceCents * i.qty,
    0
  );

  return { ok: true, data: { lineItems, cartSnapshot, amountTotalCents } };
}
