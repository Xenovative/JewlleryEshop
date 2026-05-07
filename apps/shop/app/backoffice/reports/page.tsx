import { prisma } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

type CartItem = {
  productId: string;
  name?: string;
  qty: number;
  priceCents: number;
};

export default async function ReportsPage() {
  const t = await getT();
  const intl = intlLocale(await getLocale());
  const now = new Date();
  const d30 = daysAgo(now, 30);
  const d90 = daysAgo(now, 90);
  const d365 = daysAgo(now, 365);
  const monthsBack = 12;
  const trendStart = monthsAgo(now, monthsBack - 1);

  const [orders30, orders90, orders365, bookings30, bookings90, bookings365] =
    await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: d30 } } }),
      prisma.order.findMany({ where: { createdAt: { gte: d90 } } }),
      prisma.order.findMany({ where: { createdAt: { gte: d365 } } }),
      prisma.booking.findMany({
        where: {
          createdAt: { gte: d30 },
          status: { not: "canceled" },
        },
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.booking.findMany({
        where: {
          createdAt: { gte: d90 },
          status: { not: "canceled" },
        },
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.booking.findMany({
        where: {
          createdAt: { gte: d365 },
          status: { not: "canceled" },
        },
        include: { product: { select: { id: true, name: true } } },
      }),
    ]);

  const [trendOrders, trendBookings, rentables] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: trendStart } },
      select: { createdAt: true, amountTotalCents: true, currency: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: trendStart }, status: { not: "canceled" } },
      select: { createdAt: true, totalCents: true, currency: true },
    }),
    prisma.product.findMany({
      where: { rentable: true },
      select: { id: true, name: true, rentCopiesCount: true },
    }),
  ]);

  // Revenue split by channel for each window
  const totals = {
    "30": revenueSplit(orders30, bookings30),
    "90": revenueSplit(orders90, bookings90),
    "365": revenueSplit(orders365, bookings365),
  };

  // Top products (90d window)
  const topShop = topProductsFromOrders(orders90, 10);
  const topRent = topProductsFromBookings(bookings90, 10);

  // Monthly trend
  const trend = monthlyTrend(trendOrders, trendBookings, now, monthsBack);

  // Occupancy in last 90d
  const occupancy = await rentalOccupancy(rentables, d90, now);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl">{t("bo.reports.title")}</h1>

      {/* Revenue cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["30", "90", "365"] as const).map((k) => (
          <div
            key={k}
            className="bg-white border border-brand-100 rounded p-4 space-y-1"
          >
            <h3 className="text-xs uppercase tracking-wide text-gray-500">
              {t(`bo.reports.window.${k}`)}
            </h3>
            <div className="text-sm">
              <span className="text-brand-700 mr-2">●</span>
              {t("bo.reports.shop")}:{" "}
              {fmtAll(totals[k].shop, intl)}
            </div>
            <div className="text-sm">
              <span className="text-green-700 mr-2">●</span>
              {t("bo.reports.rent")}:{" "}
              {fmtAll(totals[k].rent, intl)}
            </div>
            <div className="text-sm font-medium pt-1 border-t border-brand-100 mt-1">
              {t("bo.reports.total")}: {fmtAll(totals[k].total, intl)}
            </div>
          </div>
        ))}
      </section>

      {/* Monthly trend */}
      <section className="bg-white border border-brand-100 rounded p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-lg">{t("bo.reports.trend")}</h2>
          <a
            href={"/api/backoffice/reports/trend.csv"}
            className="text-xs text-brand-600 hover:underline"
          >
            {t("bo.reports.exportCsv")}
          </a>
        </div>
        <TrendChart trend={trend} />
      </section>

      {/* Top products */}
      <section className="grid md:grid-cols-2 gap-4">
        <TopList
          title={t("bo.reports.topShop")}
          items={topShop}
          intl={intl}
        />
        <TopList
          title={t("bo.reports.topRent")}
          items={topRent}
          intl={intl}
        />
      </section>

      {/* Occupancy */}
      <section className="bg-white border border-brand-100 rounded p-4">
        <h2 className="font-serif text-lg mb-2">{t("bo.reports.occupancy")}</h2>
        <p className="text-xs text-gray-500 mb-3">
          {t("bo.reports.occupancyHelp")}
        </p>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-1">{t("bo.reports.col.product")}</th>
              <th className="py-1">{t("bo.reports.col.copies")}</th>
              <th className="py-1">{t("bo.reports.col.bookedDays")}</th>
              <th className="py-1">{t("bo.reports.col.occupancyPct")}</th>
            </tr>
          </thead>
          <tbody>
            {occupancy.map((row) => (
              <tr key={row.id} className="border-t border-brand-100">
                <td className="py-1 pr-2">{row.name}</td>
                <td className="py-1">{row.copies}</td>
                <td className="py-1">{row.bookedDays}</td>
                <td className="py-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-brand-100 rounded h-2 flex-1 max-w-[120px]">
                      <div
                        className="bg-brand-600 h-2 rounded"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="text-xs">{row.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function daysAgo(from: Date, n: number) {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}
function monthsAgo(from: Date, n: number) {
  const d = new Date(from.getFullYear(), from.getMonth() - n, 1);
  return d;
}

function revenueSplit(
  orders: { amountTotalCents: number; currency: string }[],
  bookings: { totalCents: number; currency: string }[]
) {
  const shop: Record<string, number> = {};
  const rent: Record<string, number> = {};
  for (const o of orders)
    shop[o.currency] = (shop[o.currency] ?? 0) + o.amountTotalCents;
  for (const b of bookings)
    rent[b.currency] = (rent[b.currency] ?? 0) + b.totalCents;
  const total: Record<string, number> = {};
  for (const [cur, n] of Object.entries(shop)) total[cur] = (total[cur] ?? 0) + n;
  for (const [cur, n] of Object.entries(rent)) total[cur] = (total[cur] ?? 0) + n;
  return { shop, rent, total };
}

function fmtAll(byCur: Record<string, number>, intl: string) {
  const entries = Object.entries(byCur);
  if (entries.length === 0) return "—";
  return entries.map(([cur, n]) => formatPrice(n, cur, intl)).join(" + ");
}

function topProductsFromOrders(
  orders: { itemsJson: string; currency: string }[],
  n: number
) {
  const totals: Record<
    string,
    { name: string; revenue: number; currency: string }
  > = {};
  for (const o of orders) {
    let items: CartItem[] = [];
    try {
      items = JSON.parse(o.itemsJson);
    } catch {
      items = [];
    }
    for (const it of items) {
      const k = it.productId;
      if (!totals[k])
        totals[k] = {
          name: it.name ?? k,
          revenue: 0,
          currency: o.currency,
        };
      totals[k].revenue += (it.priceCents ?? 0) * (it.qty ?? 0);
    }
  }
  return Object.values(totals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

function topProductsFromBookings(
  bookings: {
    totalCents: number;
    currency: string;
    product: { id: string; name: string };
  }[],
  n: number
) {
  const totals: Record<
    string,
    { name: string; revenue: number; currency: string }
  > = {};
  for (const b of bookings) {
    const k = b.product.id;
    if (!totals[k])
      totals[k] = {
        name: b.product.name,
        revenue: 0,
        currency: b.currency,
      };
    totals[k].revenue += b.totalCents;
  }
  return Object.values(totals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

type Bucket = { key: string; shop: number; rent: number };
function monthlyTrend(
  orders: { createdAt: Date; amountTotalCents: number; currency: string }[],
  bookings: { createdAt: Date; totalCents: number; currency: string }[],
  now: Date,
  count: number
): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = monthsAgo(now, i);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      shop: 0,
      rent: 0,
    });
  }
  const idx = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  for (const o of orders) {
    const k = idx(o.createdAt);
    const b = buckets.find((x) => x.key === k);
    if (b) b.shop += o.amountTotalCents;
  }
  for (const o of bookings) {
    const k = idx(o.createdAt);
    const b = buckets.find((x) => x.key === k);
    if (b) b.rent += o.totalCents;
  }
  return buckets;
}

async function rentalOccupancy(
  products: { id: string; name: string; rentCopiesCount: number }[],
  start: Date,
  end: Date
) {
  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86_400_000)
  );
  const ids = products.map((p) => p.id);
  if (ids.length === 0) return [];
  const bookings = await prisma.booking.findMany({
    where: {
      productId: { in: ids },
      status: { in: ["confirmed", "active", "returned"] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
    select: { productId: true, startDate: true, endDate: true },
  });
  return products
    .map((p) => {
      const productBookings = bookings.filter((b) => b.productId === p.id);
      let bookedDays = 0;
      for (const b of productBookings) {
        const s = b.startDate < start ? start : b.startDate;
        const e = b.endDate > end ? end : b.endDate;
        bookedDays += Math.max(
          0,
          Math.ceil((e.getTime() - s.getTime()) / 86_400_000) + 1
        );
      }
      const capacity = Math.max(1, p.rentCopiesCount * totalDays);
      const pct = Math.min(100, Math.round((bookedDays / capacity) * 100));
      return {
        id: p.id,
        name: p.name,
        copies: p.rentCopiesCount,
        bookedDays,
        pct,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

function TrendChart({ trend }: { trend: Bucket[] }) {
  const w = 720;
  const h = 160;
  const pad = 24;
  const max = Math.max(1, ...trend.map((b) => b.shop + b.rent));
  const barW = (w - pad * 2) / trend.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <line
        x1={pad}
        y1={h - pad}
        x2={w - pad}
        y2={h - pad}
        stroke="#e5e7eb"
      />
      {trend.map((b, i) => {
        const x = pad + i * barW;
        const shopH = ((h - pad * 2) * b.shop) / max;
        const rentH = ((h - pad * 2) * b.rent) / max;
        return (
          <g key={b.key}>
            <rect
              x={x + 2}
              y={h - pad - shopH}
              width={barW - 4}
              height={shopH}
              fill="#a78bfa"
            />
            <rect
              x={x + 2}
              y={h - pad - shopH - rentH}
              width={barW - 4}
              height={rentH}
              fill="#34d399"
            />
            <text
              x={x + barW / 2}
              y={h - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {b.key.slice(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TopList({
  title,
  items,
  intl,
}: {
  title: string;
  items: { name: string; revenue: number; currency: string }[];
  intl: string;
}) {
  return (
    <div className="bg-white border border-brand-100 rounded p-4">
      <h3 className="font-serif text-lg mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">—</p>
      ) : (
        <ol className="text-sm space-y-1">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between">
              <span className="truncate pr-2">
                {i + 1}. {it.name}
              </span>
              <span className="text-gray-600">
                {formatPrice(it.revenue, it.currency, intl)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
