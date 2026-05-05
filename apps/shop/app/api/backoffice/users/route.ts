import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Body = z.object({
  username: z.string().min(2).max(64),
  password: z.string().min(8),
  role: z.enum(["owner", "staff", "viewer"]),
});

export async function GET() {
  const user = await requireApiRole("owner");
  if (user instanceof NextResponse) return user;
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      role: true,
      disabled: true,
      totpEnabled: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const user = await requireApiRole("owner");
  if (user instanceof NextResponse) return user;
  const actor = user;
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const exists = await prisma.adminUser.findUnique({
    where: { username: body.data.username },
  });
  if (exists) {
    return NextResponse.json({ error: "Username already exists" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(body.data.password, 10);
  const created = await prisma.adminUser.create({
    data: {
      username: body.data.username,
      passwordHash,
      role: body.data.role,
    },
    select: { id: true, username: true, role: true },
  });
  await audit(actor, "create", "AdminUser", created.id, undefined, {
    username: created.username,
    role: created.role,
  });
  return NextResponse.json({ user: created });
}
