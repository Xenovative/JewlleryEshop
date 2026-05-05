"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";
import type { DictKey } from "@/lib/i18n";

type Role = "owner" | "staff" | "viewer";
type Row = {
  id: string;
  username: string;
  role: string;
  disabled: boolean;
  totpEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export function BackofficeUsersAdmin({
  initial,
  currentUserId,
}: {
  initial: Row[];
  currentUserId: string;
}) {
  const router = useRouter();
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    role: Role;
  }>({ username: "", password: "", role: "staff" });

  const create = async () => {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/backoffice/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed");
      return;
    }
    setNewUser({ username: "", password: "", role: "staff" });
    router.refresh();
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/backoffice/users/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed");
      return;
    }
    router.refresh();
  };

  const resetPassword = async (id: string, username: string) => {
    const pwd = prompt(t("bo.users.resetPwdPrompt", { user: username }));
    if (!pwd) return;
    if (pwd.length < 8) {
      alert(t("bo.users.passwordTooShort"));
      return;
    }
    await patch(id, { password: pwd });
  };

  const remove = async (id: string, username: string) => {
    if (!confirm(t("bo.users.confirmDelete", { user: username }))) return;
    const res = await fetch(`/api/backoffice/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed");
      return;
    }
    router.refresh();
  };

  const roleLabel = (r: string) => t(`bo.users.role.${r}` as DictKey);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">{t("bo.users.title")}</h1>

      <div className="bg-white border border-brand-100 rounded p-4 grid grid-cols-4 gap-3 items-end">
        <label className="text-sm">
          <span className="text-gray-600">{t("bo.users.username")}</span>
          <input
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            className="mt-1 block w-full border border-brand-200 rounded px-2 py-1"
          />
        </label>
        <label className="text-sm">
          <span className="text-gray-600">{t("bo.users.password")}</span>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="mt-1 block w-full border border-brand-200 rounded px-2 py-1"
          />
        </label>
        <label className="text-sm">
          <span className="text-gray-600">{t("bo.users.role")}</span>
          <select
            value={newUser.role}
            onChange={(e) =>
              setNewUser({ ...newUser, role: e.target.value as Role })
            }
            className="mt-1 block w-full border border-brand-200 rounded px-2 py-1 bg-white"
          >
            <option value="owner">{roleLabel("owner")}</option>
            <option value="staff">{roleLabel("staff")}</option>
            <option value="viewer">{roleLabel("viewer")}</option>
          </select>
        </label>
        <button
          onClick={create}
          disabled={busy || !newUser.username || newUser.password.length < 8}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
        >
          {t("bo.users.create")}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border border-brand-100 rounded">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left">
            <tr>
              <th className="px-3 py-2">{t("bo.users.username")}</th>
              <th className="px-3 py-2">{t("bo.users.role")}</th>
              <th className="px-3 py-2">{t("bo.users.col.twofa")}</th>
              <th className="px-3 py-2">{t("bo.users.col.lastLogin")}</th>
              <th className="px-3 py-2">{t("bo.users.col.status")}</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {initial.map((u) => {
              const isMe = u.id === currentUserId;
              return (
                <tr key={u.id} className="border-t border-brand-100 align-top">
                  <td className="px-3 py-2">
                    {u.username}
                    {isMe && (
                      <span className="ml-2 text-xs text-brand-600">
                        ({t("bo.users.you")})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      onChange={(e) => patch(u.id, { role: e.target.value })}
                      className="border border-brand-200 rounded px-2 py-1 bg-white text-sm"
                    >
                      <option value="owner">{roleLabel("owner")}</option>
                      <option value="staff">{roleLabel("staff")}</option>
                      <option value="viewer">{roleLabel("viewer")}</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {u.totpEnabled ? (
                      <span className="text-green-700">
                        {t("bo.users.twofa.on")}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {t("bo.users.twofa.off")}
                      </span>
                    )}
                    {u.totpEnabled && !isMe && (
                      <button
                        onClick={() =>
                          patch(u.id, { disable2fa: true })
                        }
                        className="ml-2 text-xs text-red-600 hover:underline"
                      >
                        {t("bo.users.twofa.reset")}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={u.disabled}
                        onChange={(e) =>
                          patch(u.id, { disabled: e.target.checked })
                        }
                        disabled={isMe}
                      />
                      {t("bo.users.disabled")}
                    </label>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => resetPassword(u.id, u.username)}
                      className="text-brand-600 hover:underline mr-3"
                    >
                      {t("bo.users.resetPwd")}
                    </button>
                    {!isMe && (
                      <button
                        onClick={() => remove(u.id, u.username)}
                        className="text-red-600 hover:underline"
                      >
                        {t("bo.users.delete")}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
