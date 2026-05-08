import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCALE_COOKIE } from "@/lib/i18n";

const Body = z.object({ locale: z.enum(["en", "zh-Hant", "zh-Hans"]) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, parsed.data.locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
