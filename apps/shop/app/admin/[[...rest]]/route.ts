import { NextResponse, type NextRequest } from "next/server";

// Permanent redirect from the old /admin/* paths to the unified /backoffice/*.
export function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = url.pathname.replace(/^\/admin/, "/backoffice");
  return NextResponse.redirect(url, 308);
}
