import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const ALLOWED = new Set([
  "shoplogo.png",
  "headerlogo.png",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "site.webmanifest",
]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  if (!ALLOWED.has(name)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const root = path.resolve(process.cwd(), "..", "..");
  const target =
    name === "shoplogo.png" || name === "headerlogo.png"
      ? path.join(root, name)
      : path.join(root, "favicons", name);

  try {
    const data = await readFile(target);
    const ext = path.extname(name).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "content-type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "cache-control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
