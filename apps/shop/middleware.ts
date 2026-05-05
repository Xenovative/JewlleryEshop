import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/backoffice/:path*", "/api/backoffice/:path*"],
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public auth endpoints (login form + API).
  if (
    path === "/backoffice/login" ||
    path.startsWith("/api/backoffice/auth/")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (session) return NextResponse.next();

  if (path.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/backoffice/login";
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}
