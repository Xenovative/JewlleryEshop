import { prisma } from "@lumiere/db";
import { requireRole } from "@/lib/rbac";
import { BackofficeUsersAdmin } from "@/components/backoffice/BackofficeUsersAdmin";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireRole("owner");
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
  return (
    <BackofficeUsersAdmin
      currentUserId={me.userId}
      initial={users.map((u) => ({
        ...u,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
