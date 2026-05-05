import Link from "next/link";
import { prisma } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [
    productCount,
    categoryCount,
    orderCount,
    customerCount,
    recentOrders,
    products,
    activeRentals,
    copiesOut,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.product.findMany({
      where: { lowStockThreshold: { not: null } },
      include: { variants: true },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["confirmed", "active"] },
        startDate: { lte: tomorrow },
        endDate: { gte: today },
      },
    }),
    prisma.rentalCopy.count({ where: { status: "out" } }),
  ]);

  const lowStockCount = products.filter((p) => {
    if (p.lowStockThreshold === null) return false;
    const stock =
      p.variants.length > 0
        ? p.variants.reduce((n, v) => n + v.stock, 0)
        : p.stock;
    return stock <= p.lowStockThreshold;
  }).length;

  const t = await getT();
  const locale = await getLocale();
  const intl = intlLocale(locale);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl">{t("admin.dashboard.title")}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={t("admin.dashboard.products")} value={productCount} />
        <Stat label={t("admin.dashboard.categories")} value={categoryCount} />
        <Stat label={t("admin.dashboard.orders")} value={orderCount} />
        <Stat label={t("bo.nav.customers")} value={customerCount} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <LinkStat
          href="/backoffice/inventory"
          label={t("bo.dashboard.lowStock")}
          value={lowStockCount}
          tone={lowStockCount > 0 ? "warn" : "ok"}
        />
        <LinkStat
          href="/backoffice/calendar"
          label={t("bo.dashboard.activeRentals")}
          value={activeRentals}
          tone="ok"
        />
        <LinkStat
          href="/backoffice/inventory?tab=copies"
          label={t("bo.dashboard.copiesOut")}
          value={copiesOut}
          tone="ok"
        />
      </div>

      <div>
        <h2 className="font-serif text-xl mb-2">
          {t("admin.dashboard.recentOrders")}
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">{t("admin.dashboard.noOrders")}</p>
        ) : (
          <ul className="divide-y divide-brand-100 bg-white border border-brand-100 rounded">
            {recentOrders.map((o) => (
              <li key={o.id} className="px-4 py-2 flex justify-between text-sm">
                <span>{o.email ?? "—"}</span>
                <span>{formatPrice(o.amountTotalCents, o.currency)}</span>
                <span className="text-gray-500">{o.status}</span>
                <span className="text-gray-500">
                  {new Date(o.createdAt).toLocaleString(intl)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-brand-100 rounded-lg p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-serif">{value}</div>
    </div>
  );
}

function LinkStat({
  href,
  label,
  value,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  tone: "ok" | "warn";
}) {
  return (
    <Link
      href={href}
      className={`block bg-white border rounded-lg p-4 transition ${
        tone === "warn"
          ? "border-amber-300 hover:border-amber-500"
          : "border-brand-100 hover:border-brand-500"
      }`}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`text-2xl font-serif ${
          tone === "warn" && value > 0 ? "text-amber-700" : ""
        }`}
      >
        {value}
      </div>
    </Link>
  );
}
