"use client";

import { LOCALES } from "@/lib/i18n";
import { useLocale } from "./I18nProvider";

export function LangSwitcher() {
  const current = useLocale();

  const change = async (code: string) => {
    if (code === current) return;
    await fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale: code }),
    });
    window.location.reload();
  };

  return (
    <select
      value={current}
      onChange={(e) => change(e.target.value)}
      aria-label="Language"
      className="text-sm bg-transparent border border-brand-200 rounded px-2 py-1"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
