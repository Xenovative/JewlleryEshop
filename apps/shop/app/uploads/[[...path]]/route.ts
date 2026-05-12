import { NextResponse } from "next/server";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { shopPublicDir } from "@/lib/shopPublicDir";

export const runtime = "nodejs";

const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await params;
  if (!segments.length) {
    return new NextResponse(null, { status: 404 });
  }

  // `[[...path]]` is everything after `/uploads/` (e.g. `products/uuid.jpg`).
  // Files on disk live under `public/uploads/...`, not `public/products/...`.
  const publicRoot = path.resolve(shopPublicDir());
  const uploadsRoot = path.join(publicRoot, "uploads");
  const abs = path.resolve(uploadsRoot, ...segments);
  const rel = path.relative(uploadsRoot, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return new NextResponse(null, { status: 400 });
  }

  const stat = await fsPromises.stat(abs).catch(() => null);
  if (!stat?.isFile()) {
    return new NextResponse(null, { status: 404 });
  }

  const buf = await fsPromises.readFile(abs);
  const ext = path.extname(abs).toLowerCase();
  const contentType = EXT_MIME[ext] ?? "application/octet-stream";

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=3600",
    },
  });
}
