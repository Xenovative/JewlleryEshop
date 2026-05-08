import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  const csv = toCsv(
    [
      "slug",
      "name",
      "description",
      "priceCents",
      "currency",
      "imageUrl",
      "stock",
      "categorySlug",
      "sku",
      "buyable",
      "rentable",
      "rentPricingType",
      "rentDailyCents",
      "rentFixedCents",
      "rentFixedDurationDays",
      "rentCopiesCount",
      "waiverFeeCents",
      "featured",
      "position",
      "seoTitle",
      "seoDescription",
      "lowStockThreshold",
      "material",
      "gemstone",
      "weightGrams",
    ],
    products.map((p) => [
      p.slug,
      p.name,
      p.description,
      p.priceCents,
      p.currency,
      p.imageUrl,
      p.stock,
      p.category.slug,
      p.sku ?? "",
      p.buyable,
      p.rentable,
      p.rentPricingType ?? "",
      p.rentDailyCents ?? "",
      p.rentFixedCents ?? "",
      p.rentFixedDurationDays ?? "",
      p.rentCopiesCount,
      p.waiverFeeCents ?? "",
      p.featured,
      p.position,
      p.seoTitle ?? "",
      p.seoDescription ?? "",
      p.lowStockThreshold ?? "",
      p.material ?? "",
      p.gemstone ?? "",
      p.weightGrams ?? "",
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="products.csv"`,
    },
  });
}
