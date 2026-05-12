import { NextResponse } from "next/server";
import path from "node:path";
import fsPromises from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { shopPublicDir } from "@/lib/shopPublicDir";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected multipart field 'file'" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  const ext = MIME_EXT[mime];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported type. Use JPEG, PNG, WebP, or GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5 MB)" },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}${ext}`;
  const rel = `/uploads/products/${name}`;
  const uploadRoot = path.join(shopPublicDir(), "uploads", "products");
  await fsPromises.mkdir(uploadRoot, { recursive: true });
  const abs = path.join(uploadRoot, name);
  await fsPromises.writeFile(abs, buf);

  // Same-origin path survives deploys and avoids NEXT_PUBLIC_BASE_URL / host drift.
  await audit(user, "upload", "ProductImage", null, undefined, {
    pathrel: rel,
    bytes: buf.length,
    mime,
  });

  return NextResponse.json({ url: rel, pathrel: rel });
}
