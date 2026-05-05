import { prisma } from "@lumiere/db";
import { requireRole } from "@/lib/rbac";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { AuditTable } from "@/components/backoffice/AuditTable";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    user?: string;
    entity?: string;
    action?: string;
  }>;
}) {
  await requireRole("staff");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const t = await getT();
  const intl = intlLocale(await getLocale());

  const where: Record<string, unknown> = {};
  if (sp.user) where.username = { contains: sp.user };
  if (sp.entity) where.entityType = sp.entity;
  if (sp.action) where.action = sp.action;

  const [total, logs, entityTypes, actions] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog
      .findMany({ select: { entityType: true }, distinct: ["entityType"] })
      .then((r) => r.map((x) => x.entityType).sort()),
    prisma.auditLog
      .findMany({ select: { action: true }, distinct: ["action"] })
      .then((r) => r.map((x) => x.action).sort()),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl">{t("bo.audit.title")}</h1>
      <p className="text-xs text-gray-500">
        {t("bo.audit.totalShown", {
          shown: logs.length,
          total,
          page,
          pages: totalPages,
        })}
      </p>

      <form className="flex flex-wrap gap-2 items-end text-sm">
        <label>
          <span className="block text-xs text-gray-500">
            {t("bo.audit.filter.user")}
          </span>
          <input
            name="user"
            defaultValue={sp.user ?? ""}
            className="border border-brand-200 rounded px-2 py-1"
          />
        </label>
        <label>
          <span className="block text-xs text-gray-500">
            {t("bo.audit.filter.entity")}
          </span>
          <select
            name="entity"
            defaultValue={sp.entity ?? ""}
            className="border border-brand-200 rounded px-2 py-1 bg-white"
          >
            <option value="">—</option>
            {entityTypes.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-xs text-gray-500">
            {t("bo.audit.filter.action")}
          </span>
          <select
            name="action"
            defaultValue={sp.action ?? ""}
            className="border border-brand-200 rounded px-2 py-1 bg-white"
          >
            <option value="">—</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <button className="bg-brand-600 hover:bg-brand-700 text-white rounded px-3 py-1">
          {t("bo.audit.apply")}
        </button>
        <a
          href="/backoffice/audit"
          className="text-gray-500 hover:text-brand-600"
        >
          {t("bo.audit.reset")}
        </a>
      </form>

      <AuditTable
        rows={logs.map((l) => ({
          id: l.id,
          createdAt: l.createdAt.toISOString(),
          username: l.username,
          action: l.action,
          entityType: l.entityType,
          entityId: l.entityId,
          beforeJson: l.beforeJson,
          afterJson: l.afterJson,
          metaJson: l.metaJson,
        }))}
        intl={intl}
      />

      {totalPages > 1 && (
        <div className="flex justify-between text-sm">
          {page > 1 ? (
            <a
              className="text-brand-600 hover:underline"
              href={`?${new URLSearchParams({
                ...sp,
                page: String(page - 1),
              }).toString()}`}
            >
              ← {t("bo.audit.prev")}
            </a>
          ) : (
            <span />
          )}
          {page < totalPages && (
            <a
              className="text-brand-600 hover:underline"
              href={`?${new URLSearchParams({
                ...sp,
                page: String(page + 1),
              }).toString()}`}
            >
              {t("bo.audit.next")} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
