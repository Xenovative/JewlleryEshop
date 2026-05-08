import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { parseCsv, rowToObject } from "@/lib/csv";

const asInt = (v: string, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};
const asFloatOrNull = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const asIntOrNull = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};
const asBool = (v: string, fallback = false) => {
  const t = v.trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(t)) return true;
  if (["0", "false", "no", "n"].includes(t)) return false;
  return fallback;
};

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

  const header = rows[0]!.map((h) => h.trim());
  const required = ["slug", "name", "description", "priceCents", "categorySlug"];
  for (const key of required) {
    if (!header.includes(key)) {
      return NextResponse.json({ error: `CSV missing required column: ${key}` }, { status: 400 });
    }
  }

  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let imported = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const rec = rowToObject(header, rows[i]!);
    const slug = (rec.slug ?? "").trim();
    const name = (rec.name ?? "").trim();
    const description = (rec.description ?? "").trim();
    const categorySlug = (rec.categorySlug ?? "").trim();
    const categoryId = catBySlug.get(categorySlug);
    if (!slug || !name || !description || !categoryId) {
      errors.push(`Row ${i + 1}: missing required values or unknown categorySlug`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        description,
        priceCents: asInt(rec.priceCents ?? "0", 0),
        currency: (rec.currency ?? "hkd").trim() || "hkd",
        imageUrl: (rec.imageUrl ?? "").trim(),
        stock: asInt(rec.stock ?? "0", 0),
        categoryId,
        sku: rec.sku?.trim() || null,
        buyable: asBool(rec.buyable ?? "true", true),
        rentable: asBool(rec.rentable ?? "false", false),
        rentPricingType: rec.rentPricingType?.trim() || null,
        rentDailyCents: asIntOrNull(rec.rentDailyCents ?? ""),
        rentFixedCents: asIntOrNull(rec.rentFixedCents ?? ""),
        rentFixedDurationDays: asIntOrNull(rec.rentFixedDurationDays ?? ""),
        rentCopiesCount: asInt(rec.rentCopiesCount ?? "0", 0),
        waiverFeeCents: asIntOrNull(rec.waiverFeeCents ?? ""),
        featured: asBool(rec.featured ?? "false", false),
        position: asInt(rec.position ?? "0", 0),
        seoTitle: rec.seoTitle?.trim() || null,
        seoDescription: rec.seoDescription?.trim() || null,
        lowStockThreshold: asIntOrNull(rec.lowStockThreshold ?? ""),
        material: rec.material?.trim() || null,
        gemstone: rec.gemstone?.trim() || null,
        weightGrams: asFloatOrNull(rec.weightGrams ?? ""),
      },
      create: {
        slug,
        name,
        description,
        priceCents: asInt(rec.priceCents ?? "0", 0),
        currency: (rec.currency ?? "hkd").trim() || "hkd",
        imageUrl: (rec.imageUrl ?? "").trim(),
        stock: asInt(rec.stock ?? "0", 0),
        categoryId,
        sku: rec.sku?.trim() || null,
        buyable: asBool(rec.buyable ?? "true", true),
        rentable: asBool(rec.rentable ?? "false", false),
        rentPricingType: rec.rentPricingType?.trim() || null,
        rentDailyCents: asIntOrNull(rec.rentDailyCents ?? ""),
        rentFixedCents: asIntOrNull(rec.rentFixedCents ?? ""),
        rentFixedDurationDays: asIntOrNull(rec.rentFixedDurationDays ?? ""),
        rentCopiesCount: asInt(rec.rentCopiesCount ?? "0", 0),
        waiverFeeCents: asIntOrNull(rec.waiverFeeCents ?? ""),
        featured: asBool(rec.featured ?? "false", false),
        position: asInt(rec.position ?? "0", 0),
        seoTitle: rec.seoTitle?.trim() || null,
        seoDescription: rec.seoDescription?.trim() || null,
        lowStockThreshold: asIntOrNull(rec.lowStockThreshold ?? ""),
        material: rec.material?.trim() || null,
        gemstone: rec.gemstone?.trim() || null,
        weightGrams: asFloatOrNull(rec.weightGrams ?? ""),
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
