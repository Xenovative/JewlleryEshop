import { notFound } from "next/navigation";
import { prisma } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { CustomerNotes } from "@/components/backoffice/CustomerNotes";

export const dynamic = "force-dynamic";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getT();
  const intl = intlLocale(await getLocale());
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      bookings: {
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true } } },
      },
    },
  });
  if (!customer) notFound();

  type Item =
    | { kind: "order"; date: Date; label: string; amount: string; status: string }
    | {
        kind: "booking";
        date: Date;
        label: string;
        amount: string;
        status: string;
      };
  const timeline: Item[] = [
    ...customer.orders.map<Item>((o) => ({
      kind: "order",
      date: o.createdAt,
      label: t("bo.customers.timeline.order"),
      amount: formatPrice(o.amountTotalCents, o.currency, intl),
      status: o.status,
    })),
    ...customer.bookings.map<Item>((b) => ({
      kind: "booking",
      date: b.createdAt,
      label: t("bo.customers.timeline.booking", { item: b.product.name }),
      amount: formatPrice(b.totalCents, b.currency, intl),
      status: b.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">{customer.name ?? customer.email}</h1>
        <p className="text-sm text-gray-500">{customer.email}</p>
        {customer.phone && (
          <p className="text-sm text-gray-500">{customer.phone}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {t("bo.customers.since", {
            date: customer.createdAt.toLocaleDateString(intl),
          })}
        </p>
      </div>

      <CustomerNotes id={customer.id} initialNotes={customer.notes ?? ""} />

      <div>
        <h2 className="font-serif text-lg mb-2">
          {t("bo.customers.history")} ({timeline.length})
        </h2>
        {timeline.length === 0 ? (
          <p className="text-sm text-gray-500">{t("bo.customers.noHistory")}</p>
        ) : (
          <ul className="bg-white border border-brand-100 rounded divide-y divide-brand-100 text-sm">
            {timeline.map((it, i) => (
              <li key={i} className="px-4 py-2 flex justify-between gap-4">
                <span className="text-xs text-gray-500 w-32 shrink-0">
                  {it.date.toLocaleString(intl)}
                </span>
                <span className="flex-1">{it.label}</span>
                <span className="w-32 text-right">{it.amount}</span>
                <span className="w-24 text-right text-xs uppercase tracking-wide text-gray-500">
                  {it.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
