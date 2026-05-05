import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";

export async function GET() {
  const guard = await requireApiRole("viewer");
  if (guard instanceof NextResponse) return guard;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const [orders, bookings] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, amountTotalCents: true, currency: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: start }, status: { not: "canceled" } },
      select: { createdAt: true, totalCents: true, currency: true },
    }),
  ]);
  type B = { key: string; shop: number; rent: number; currency: string };
  const buckets: B[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      shop: 0,
      rent: 0,
      currency: "",
    });
  }
  const idx = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  for (const o of orders) {
    const b = buckets.find((x) => x.key === idx(o.createdAt));
    if (b) {
      b.shop += o.amountTotalCents;
      b.currency = b.currency || o.currency;
    }
  }
  for (const o of bookings) {
    const b = buckets.find((x) => x.key === idx(o.createdAt));
    if (b) {
      b.rent += o.totalCents;
      b.currency = b.currency || o.currency;
    }
  }
  const lines = ["month,shop_cents,rent_cents,currency"];
  for (const b of buckets) {
    lines.push(`${b.key},${b.shop},${b.rent},${b.currency || "usd"}`);
  }
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="revenue-trend.csv"',
    },
  });
}
