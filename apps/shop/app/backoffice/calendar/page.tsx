import Link from "next/link";
import { prisma } from "@lumiere/db";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { RentalCalendar } from "@/components/backoffice/RentalCalendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; selected?: string }>;
}) {
  const { month, selected } = await searchParams;
  const t = await getT();
  const intl = intlLocale(await getLocale());

  const now = new Date();
  const [yearStr, monthStr] = (month ?? "").split("-");
  const year = Number(yearStr) || now.getFullYear();
  const m = Number(monthStr) ? Number(monthStr) - 1 : now.getMonth();
  const start = new Date(year, m, 1);
  const end = new Date(year, m + 1, 0); // last day of month
  const daysInMonth = end.getDate();

  const products = await prisma.product.findMany({
    where: { rentable: true },
    orderBy: [{ position: "asc" }, { name: "asc" }],
    select: { id: true, name: true, rentCopiesCount: true },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["pending", "confirmed", "active", "returned"] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
    select: {
      id: true,
      productId: true,
      startDate: true,
      endDate: true,
      status: true,
      customerName: true,
      customerPhone: true,
      email: true,
      returnSlot: true,
      totalCents: true,
      currency: true,
      waiverIncluded: true,
      fulfillment: true,
    },
  });

  const drawerBooking = selected
    ? bookings.find((b) => b.id === selected) ?? null
    : null;

  // Prev / next month links
  const prev = new Date(year, m - 1, 1);
  const next = new Date(year, m + 1, 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">{t("bo.calendar.title")}</h1>
        <div className="flex gap-2 items-center text-sm">
          <Link
            href={`/backoffice/calendar?month=${fmt(prev)}`}
            className="px-2 py-1 border border-brand-200 rounded hover:bg-brand-50"
          >
            ←
          </Link>
          <span className="font-medium">
            {start.toLocaleDateString(intl, {
              year: "numeric",
              month: "long",
            })}
          </span>
          <Link
            href={`/backoffice/calendar?month=${fmt(next)}`}
            className="px-2 py-1 border border-brand-200 rounded hover:bg-brand-50"
          >
            →
          </Link>
        </div>
      </div>

      <RentalCalendar
        year={year}
        month={m}
        daysInMonth={daysInMonth}
        products={products}
        bookings={bookings.map((b) => ({
          ...b,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          returnSlot: b.returnSlot ? b.returnSlot.toISOString() : null,
        }))}
        intl={intl}
        selectedId={selected ?? null}
        drawerBooking={
          drawerBooking
            ? {
                ...drawerBooking,
                startDate: drawerBooking.startDate.toISOString(),
                endDate: drawerBooking.endDate.toISOString(),
                returnSlot: drawerBooking.returnSlot
                  ? drawerBooking.returnSlot.toISOString()
                  : null,
              }
            : null
        }
      />
    </div>
  );
}
