import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Patch = z.object({
  notes: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;
  const body = Patch.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const before = await prisma.customer.findUnique({ where: { id } });
  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ...(body.data.notes !== undefined ? { notes: body.data.notes || null } : {}),
      ...(body.data.name !== undefined ? { name: body.data.name || null } : {}),
      ...(body.data.phone !== undefined ? { phone: body.data.phone || null } : {}),
    },
  });
  await audit(user, "update", "Customer", id, before, body.data);
  return NextResponse.json({ customer: updated });
}
