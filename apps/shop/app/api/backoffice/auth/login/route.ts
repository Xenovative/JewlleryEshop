import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@lumiere/db";
import { verifyTotp } from "@/lib/totp";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type Role,
} from "@/lib/session";
import { audit } from "@/lib/audit";

const Body = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  totp: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { username, password, totp } = parsed.data;

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user || user.disabled) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (user.totpEnabled) {
    if (!user.totpSecret) {
      return NextResponse.json(
        { error: "2FA is enabled but no secret is configured for this user" },
        { status: 500 }
      );
    }
    if (!totp) {
      return NextResponse.json(
        { error: "Authenticator code required", needsTotp: true },
        { status: 401 }
      );
    }
    if (!verifyTotp(user.totpSecret, totp)) {
      return NextResponse.json(
        { error: "Invalid authenticator code", needsTotp: true },
        { status: 401 }
      );
    }
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const sessionUser = {
    username: user.username,
    userId: user.id,
    role: user.role as Role,
  };
  await audit(sessionUser, "login", "AdminUser", user.id);
  const token = await createSessionToken(sessionUser);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
