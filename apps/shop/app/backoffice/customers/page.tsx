import Link from "next/link";
import { prisma } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getT();
  const intl = intlLocale(await getLocale());

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q.toLowerCase() } },
            { name: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { orders: true, bookings: true } },
      orders: { select: { amountTotalCents: true, currency: true } },
      bookings: { select: { totalCents: true, currency: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">{t("bo.customers.title")}</h1>
        <form className="flex gap-2 items-center">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("bo.customers.searchPlaceholder")}
            className="border border-brand-200 rounded px-2 py-1 text-sm"
          />
          <button className="text-sm text-brand-600">
            {t("bo.customers.search")}
          </button>
        </form>
      </div>

      {customers.length === 0 ? (
        <p className="text-gray-500 text-sm">{t("bo.customers.empty")}</p>
      ) : (
        <div className="bg-white border border-brand-100 rounded">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-left">
              <tr>
                <th className="px-3 py-2">{t("bo.customers.col.email")}</th>
                <th className="px-3 py-2">{t("bo.customers.col.name")}</th>
                <th className="px-3 py-2">{t("bo.customers.col.orders")}</th>
                <th className="px-3 py-2">{t("bo.customers.col.bookings")}</th>
                <th className="px-3 py-2">{t("bo.customers.col.ltv")}</th>
                <th className="px-3 py-2">{t("bo.customers.col.since")}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const ltvByCurrency: Record<string, number> = {};
                for (const o of c.orders)
                  ltvByCurrency[o.currency] =
                    (ltvByCurrency[o.currency] ?? 0) + o.amountTotalCents;
                for (const b of c.bookings)
                  ltvByCurrency[b.currency] =
                    (ltvByCurrency[b.currency] ?? 0) + b.totalCents;
                const ltvText = Object.entries(ltvByCurrency)
                  .map(([cur, n]) => formatPrice(n, cur, intl))
                  .join(" + ");
                return (
                  <tr key={c.id} className="border-t border-brand-100">
                    <td className="px-3 py-2">
                      <Link
                        href={`/backoffice/customers/${c.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {c.email}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{c.name ?? "—"}</td>
                    <td className="px-3 py-2">{c._count.orders}</td>
                    <td className="px-3 py-2">{c._count.bookings}</td>
                    <td className="px-3 py-2">{ltvText || "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString(intl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
