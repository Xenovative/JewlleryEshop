import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Patch = z.object({
  label: z.string().min(1).optional(),
  status: z.enum(["available", "out", "maintenance", "retired"]).optional(),
  notes: z.string().nullable().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const before = await prisma.rentalCopy.findUnique({ where: { id } });
  const updated = await prisma.rentalCopy.update({
    where: { id },
    data: parsed.data,
  });
  await audit(user, "update", "RentalCopy", id, before, parsed.data);
  return NextResponse.json({ copy: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;
  const copy = await prisma.rentalCopy.findUnique({ where: { id } });
  if (!copy) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.rentalCopy.delete({ where: { id } });
  const remaining = await prisma.rentalCopy.count({
    where: { productId: copy.productId },
  });
  await prisma.product.update({
    where: { id: copy.productId },
    data: { rentCopiesCount: remaining },
  });
  await audit(user, "delete", "RentalCopy", id, copy);
  return NextResponse.json({ ok: true });
}
