import { cookies } from "next/headers";
import { LOCALE_COOKIE, makeT, type Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(LOCALE_COOKIE)?.value;
  return v === "zh-Hant" ? "zh-Hant" : "en";
}

export async function getT() {
  const locale = await getLocale();
  return makeT(locale);
}
