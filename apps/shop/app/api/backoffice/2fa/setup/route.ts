import { NextResponse } from "next/server";
import qrcode from "qrcode";
import { prisma } from "@lumiere/db";
import { buildTotp, generateSecretBase32 } from "@/lib/totp";
import { requireApiRole } from "@/lib/rbac";

// Begin per-user 2FA setup: generate a pending secret and return otpauth URI + QR.
export async function POST() {
  const user = await requireApiRole("viewer");
  if (user instanceof NextResponse) return user;

  const target = await prisma.adminUser.findUnique({ where: { id: user.userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.totpEnabled) {
    return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
  }

  const secret = generateSecretBase32();
  await prisma.adminUser.update({
    where: { id: target.id },
    data: { totpSecret: secret, totpEnabled: false },
  });

  const totp = buildTotp(secret, { account: target.username });
  const uri = totp.toString();
  const qrDataUrl = await qrcode.toDataURL(uri, { margin: 1, width: 240 });
  return NextResponse.json({ secret, uri, qrDataUrl });
}
