"use client";

import { createContext, useContext } from "react";
import { dict, type Locale, type DictKey } from "@/lib/i18n";

type T = (key: DictKey, vars?: Record<string, string | number>) => string;
type Ctx = { locale: Locale; t: T };

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t: T = (k, vars) => {
    const base = dict[locale];
    const raw = base[k] ?? dict.en[k];
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, key) =>
      vars[key] !== undefined ? String(vars[key]) : `{${key}}`
    );
  };
  return <I18nCtx.Provider value={{ locale, t }}>{children}</I18nCtx.Provider>;
}

export function useT() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useT must be used inside I18nProvider");
  return ctx.t;
}

export function useLocale(): Locale {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useLocale must be used inside I18nProvider");
  return ctx.locale;
}
