import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/backoffice/:path*", "/api/backoffice/:path*"],
};

const BO_PATH_HEADER = "x-lumiere-bo-path";

function nextWithBoPath(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(BO_PATH_HEADER, req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public auth endpoints (login form + API).
  if (
    path === "/backoffice/login" ||
    path.startsWith("/api/backoffice/auth/")
  ) {
    return nextWithBoPath(req);
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (session) return nextWithBoPath(req);

  if (path.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/backoffice/login";
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}
