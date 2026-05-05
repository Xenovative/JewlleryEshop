import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

const Patch = z.object({
  role: z.enum(["owner", "staff", "viewer"]).optional(),
  disabled: z.boolean().optional(),
  password: z.string().min(8).optional(),
  disable2fa: z.boolean().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireApiRole("owner");
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const body = Patch.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prevent the only owner from being demoted/disabled and locking everyone out.
  if (target.role === "owner" && (body.data.role && body.data.role !== "owner" || body.data.disabled === true)) {
    const ownerCount = await prisma.adminUser.count({
      where: { role: "owner", disabled: false, NOT: { id } },
    });
    if (ownerCount === 0) {
      return NextResponse.json(
        { error: "Cannot demote or disable the last active owner" },
        { status: 400 }
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (body.data.role !== undefined) data.role = body.data.role;
  if (body.data.disabled !== undefined) data.disabled = body.data.disabled;
  if (body.data.password) data.passwordHash = await bcrypt.hash(body.data.password, 10);
  if (body.data.disable2fa) {
    data.totpEnabled = false;
    data.totpSecret = null;
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      role: true,
      disabled: true,
      totpEnabled: true,
    },
  });
  await audit(
    user,
    "update",
    "AdminUser",
    id,
    { role: target.role, disabled: target.disabled, totpEnabled: target.totpEnabled },
    {
      ...updated,
      passwordChanged: !!body.data.password,
      twofaReset: !!body.data.disable2fa,
    }
  );
  return NextResponse.json({ user: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireApiRole("owner");
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.role === "owner") {
    const ownerCount = await prisma.adminUser.count({
      where: { role: "owner", disabled: false, NOT: { id } },
    });
    if (ownerCount === 0) {
      return NextResponse.json(
        { error: "Cannot delete the last active owner" },
        { status: 400 }
      );
    }
  }
  if (target.id === user.userId) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });
  await audit(user, "delete", "AdminUser", id, {
    username: target.username,
    role: target.role,
  });
  return NextResponse.json({ ok: true });
}
