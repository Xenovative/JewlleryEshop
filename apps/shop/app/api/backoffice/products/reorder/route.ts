import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Body = z.object({
  order: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await prisma.$transaction(
    parsed.data.order.map((id, i) =>
      prisma.product.update({ where: { id }, data: { position: i } })
    )
  );
  await audit(user, "reorder", "Product", null, undefined, {
    order: parsed.data.order,
  });
  return NextResponse.json({ ok: true });
}
