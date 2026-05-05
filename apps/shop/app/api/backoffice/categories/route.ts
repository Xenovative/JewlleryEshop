import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Body = z.object({ name: z.string().min(1), slug: z.string().min(1) });

export async function POST(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  try {
    const c = await prisma.category.create({ data: parsed.data });
    await audit(user, "create", "Category", c.id, undefined, parsed.data);
    return NextResponse.json(c);
  } catch {
    return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
  }
}
