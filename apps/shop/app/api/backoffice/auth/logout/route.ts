import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

function clearAndRedirect(target: string) {
  const res = NextResponse.redirect(target, 303);
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const target = `${url.origin}/backoffice/login`;
  // Form posts get a redirect; programmatic clients still get the cookie cleared.
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  }
  return clearAndRedirect(target);
}
