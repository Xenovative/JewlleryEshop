"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export function LoginForm({ next }: { next: string }) {
  const t = useT();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/backoffice/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password, totp: totp || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      if (data.needsTotp) setNeedsTotp(true);
      setError(data.error ?? t("admin.login.failed"));
      return;
    }
    window.location.href = next || "/backoffice";
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-brand-100 rounded-lg p-6 space-y-4"
    >
      <label className="block text-sm">
        <span className="text-gray-600">{t("admin.login.username")}</span>
        <input
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-gray-600">{t("admin.login.password")}</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
        />
      </label>
      {needsTotp && (
        <label className="block text-sm">
          <span className="text-gray-600">{t("admin.login.totp")}</span>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 tracking-widest text-center"
            placeholder="123456"
            autoFocus
          />
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white py-2 rounded"
      >
        {busy ? t("admin.login.signingIn") : t("admin.login.signIn")}
      </button>
    </form>
  );
}
