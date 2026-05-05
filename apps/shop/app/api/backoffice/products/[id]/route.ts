import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { ProductBody } from "@/lib/productSchema";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;
  const before = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, rentalTiers: true, images: true },
  });
  const json = await req.json().catch(() => null);
  const parsed = ProductBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 }
    );
  }
  const { variants, rentalTiers, images, ...data } = parsed.data;
  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({ where: { id }, data });
      await tx.variant.deleteMany({ where: { productId: id } });
      if (variants.length) {
        for (const v of variants) {
          await tx.variant.create({ data: { ...v, productId: id } });
        }
      }
      await tx.rentalTier.deleteMany({ where: { productId: id } });
      if (rentalTiers.length) {
        for (const t of rentalTiers) {
          await tx.rentalTier.create({ data: { ...t, productId: id } });
        }
      }
      await tx.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await tx.productImage.create({
          data: {
            productId: id,
            url: img.url,
            alt: img.alt ?? null,
            position: i,
          },
        });
      }
      return updated;
    });
    await audit(user, "update", "Product", id, before, parsed.data);
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not update" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;
  const before = await prisma.product.findUnique({ where: { id } });
  try {
    await prisma.$transaction([
      prisma.variant.deleteMany({ where: { productId: id } }),
      prisma.rentalTier.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.rentalCopy.deleteMany({ where: { productId: id } }),
      prisma.booking.updateMany({
        where: { productId: id },
        data: { status: "canceled" },
      }),
      prisma.product.delete({ where: { id } }),
    ]);
    await audit(user, "delete", "Product", id, before);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
