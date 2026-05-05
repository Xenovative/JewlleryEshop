import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";

const Body = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        qty: z.number().int().positive(),
      })
    )
    .max(100),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { items } = parsed.data;
  if (items.length === 0) return NextResponse.json({ items: [] });

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  const resolved = items.flatMap((item) => {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return [];
    const variant = item.variantId
      ? p.variants.find((v) => v.id === item.variantId)
      : undefined;
    if (item.variantId && !variant) return [];
    const stock = variant ? variant.stock : p.stock;
    return [
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: p.imageUrl,
        priceCents: p.priceCents,
        currency: p.currency,
        variantId: variant?.id,
        variantLabel: variant?.label,
        qty: item.qty,
        stock,
      },
    ];
  });

  return NextResponse.json({ items: resolved });
}
