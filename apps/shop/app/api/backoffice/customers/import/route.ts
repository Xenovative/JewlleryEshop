import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { parseCsv, rowToObject } from "@/lib/csv";

export async function POST(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing CSV file" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return NextResponse.json({ error: "CSV has no data rows" }, { status: 400 });
  }

  const header = rows[0]!.map((h) => h.trim().toLowerCase());
  const emailIdx = header.indexOf("email");
  if (emailIdx < 0) {
    return NextResponse.json({ error: "CSV must include email column" }, { status: 400 });
  }

  let imported = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]!;
    const rec = rowToObject(header, row);
    const email = (rec.email ?? "").trim().toLowerCase();
    if (!email) {
      errors.push(`Row ${i + 1}: missing email`);
      continue;
    }

    await prisma.customer.upsert({
      where: { email },
      update: {
        name: rec.name?.trim() || null,
        phone: rec.phone?.trim() || null,
        notes: rec.notes?.trim() || null,
      },
      create: {
        email,
        name: rec.name?.trim() || null,
        phone: rec.phone?.trim() || null,
        notes: rec.notes?.trim() || null,
      },
    });
    imported++;
  }

  return NextResponse.json({
    ok: true,
    imported,
    failed: errors.length,
    errors: errors.slice(0, 50),
  });
}
