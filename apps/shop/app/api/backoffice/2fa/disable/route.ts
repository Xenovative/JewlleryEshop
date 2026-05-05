import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { verifyTotp } from "@/lib/totp";
import { requireApiRole } from "@/lib/rbac";

const Body = z.object({ code: z.string().min(6).max(6) });

export async function POST(req: Request) {
  const user = await requireApiRole("viewer");
  if (user instanceof NextResponse) return user;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  const target = await prisma.adminUser.findUnique({ where: { id: user.userId } });
  if (!target?.totpEnabled || !target.totpSecret) {
    return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 });
  }
  if (!verifyTotp(target.totpSecret, parsed.data.code)) {
    return NextResponse.json({ error: "Code did not match" }, { status: 400 });
  }
  await prisma.adminUser.update({
    where: { id: target.id },
    data: { totpEnabled: false, totpSecret: null },
  });
  return NextResponse.json({ ok: true });
}
