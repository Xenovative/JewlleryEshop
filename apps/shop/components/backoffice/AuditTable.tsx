"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

type Row = {
  id: string;
  createdAt: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeJson: string | null;
  afterJson: string | null;
  metaJson: string | null;
};

export function AuditTable({ rows, intl }: { rows: Row[]; intl: string }) {
  const t = useT();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-500">{t("bo.audit.empty")}</p>
    );
  }

  return (
    <div className="bg-white border border-brand-100 rounded">
      <table className="w-full text-sm">
        <thead className="bg-brand-50 text-left">
          <tr>
            <th className="px-3 py-2 w-44">{t("bo.audit.col.when")}</th>
            <th className="px-3 py-2">{t("bo.audit.col.user")}</th>
            <th className="px-3 py-2">{t("bo.audit.col.action")}</th>
            <th className="px-3 py-2">{t("bo.audit.col.entity")}</th>
            <th className="px-3 py-2">{t("bo.audit.col.id")}</th>
            <th className="px-3 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const hasDetail = r.beforeJson || r.afterJson || r.metaJson;
            const isOpen = open.has(r.id);
            return (
              <>
                <tr key={r.id} className="border-t border-brand-100 align-top">
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString(intl)}
                  </td>
                  <td className="px-3 py-2">{r.username}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 text-xs">
                      {r.action}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.entityType}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {r.entityId ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {hasDetail ? (
                      <button
                        onClick={() => toggle(r.id)}
                        className="text-brand-600 hover:underline text-xs"
                      >
                        {isOpen ? "▲" : "▼"}
                      </button>
                    ) : null}
                  </td>
                </tr>
                {isOpen && hasDetail && (
                  <tr className="bg-brand-50/50">
                    <td colSpan={6} className="px-3 py-2">
                      <div className="grid md:grid-cols-3 gap-3 text-xs">
                        {r.beforeJson && (
                          <div>
                            <div className="font-medium text-gray-500 mb-1">
                              {t("bo.audit.before")}
                            </div>
                            <pre className="bg-white border border-brand-100 rounded p-2 overflow-x-auto">
                              {pretty(r.beforeJson)}
                            </pre>
                          </div>
                        )}
                        {r.afterJson && (
                          <div>
                            <div className="font-medium text-gray-500 mb-1">
                              {t("bo.audit.after")}
                            </div>
                            <pre className="bg-white border border-brand-100 rounded p-2 overflow-x-auto">
                              {pretty(r.afterJson)}
                            </pre>
                          </div>
                        )}
                        {r.metaJson && (
                          <div>
                            <div className="font-medium text-gray-500 mb-1">
                              {t("bo.audit.meta")}
                            </div>
                            <pre className="bg-white border border-brand-100 rounded p-2 overflow-x-auto">
                              {pretty(r.metaJson)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function pretty(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}
