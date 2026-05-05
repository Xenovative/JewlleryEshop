import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Body = z.object({
  productId: z.string().min(1),
  label: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const count = await prisma.rentalCopy.count({
    where: { productId: parsed.data.productId },
  });
  const created = await prisma.rentalCopy.create({
    data: {
      productId: parsed.data.productId,
      label: parsed.data.label ?? `Copy ${count + 1}`,
      status: "available",
    },
  });
  // Keep Product.rentCopiesCount in sync for back-compat with the rent storefront
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { rentCopiesCount: count + 1 },
  });
  await audit(user, "create", "RentalCopy", created.id, undefined, {
    productId: parsed.data.productId,
    label: created.label,
  });
  return NextResponse.json({ copy: created });
}
