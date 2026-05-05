import { prisma } from "@lumiere/db";
import type { SessionUser } from "./rbac";

type Json = unknown;

/**
 * Persist an audit-log entry.
 * Fire-and-forget: failures should not break the main mutation, so callers can
 * `await audit(...)` (cheap) but errors are swallowed and only logged.
 */
export async function audit(
  user: SessionUser | null,
  action: string,
  entityType: string,
  entityId: string | null,
  before?: Json,
  after?: Json,
  meta?: Json
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.userId ?? null,
        username: user?.username ?? "system",
        action,
        entityType,
        entityId,
        beforeJson: before === undefined ? null : JSON.stringify(before),
        afterJson: after === undefined ? null : JSON.stringify(after),
        metaJson: meta === undefined ? null : JSON.stringify(meta),
      },
    });
  } catch (e) {
    console.error("[audit] failed to log", { action, entityType, entityId, e });
  }
}
