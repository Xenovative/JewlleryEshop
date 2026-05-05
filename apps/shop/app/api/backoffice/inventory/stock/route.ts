import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Body = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).nullable(),
  delta: z.number().int(),
});

export async function POST(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { productId, variantId, delta } = parsed.data;
  if (variantId) {
    const v = await prisma.variant.findUnique({ where: { id: variantId } });
    if (!v) return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    const next = Math.max(0, v.stock + delta);
    await prisma.variant.update({
      where: { id: variantId },
      data: { stock: next },
    });
  } else {
    const p = await prisma.product.findUnique({ where: { id: productId } });
    if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const next = Math.max(0, p.stock + delta);
    await prisma.product.update({
      where: { id: productId },
      data: { stock: next },
    });
  }
  await audit(
    user,
    "stock_adjust",
    variantId ? "Variant" : "Product",
    variantId ?? productId,
    undefined,
    { delta }
  );
  return NextResponse.json({ ok: true });
}
