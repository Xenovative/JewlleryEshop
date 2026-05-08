"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useT } from "@/components/I18nProvider";
import type { DictKey } from "@/lib/i18n";

type Product = { id: string; name: string; rentCopiesCount: number };
type Booking = {
  id: string;
  productId: string;
  startDate: string;
  endDate: string;
  status: string;
  customerName: string;
  customerPhone: string | null;
  email: string;
  returnSlot: string | null;
  totalCents: number;
  currency: string;
  waiverIncluded: boolean;
  fulfillment: string;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-200 text-amber-900",
  confirmed: "bg-brand-200 text-brand-800",
  active: "bg-green-200 text-green-900",
  returned: "bg-gray-200 text-gray-700",
  canceled: "bg-red-200 text-red-900",
};

export function RentalCalendar({
  year,
  month,
  daysInMonth,
  products,
  bookings,
  intl,
  selectedId,
  drawerBooking,
}: {
  year: number;
  month: number; // 0-indexed
  daysInMonth: number;
  products: Product[];
  bookings: Booking[];
  intl: string;
  selectedId: string | null;
  drawerBooking: Booking | null;
}) {
  const router = useRouter();
  const t = useT();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/backoffice/bookings/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, daysInMonth);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="overflow-x-auto bg-white border border-brand-100 rounded">
        <div
          className="grid text-xs"
          style={{
            gridTemplateColumns: `160px repeat(${daysInMonth}, minmax(24px, 1fr))`,
          }}
        >
          <div className="bg-brand-50 px-2 py-1 font-medium border-b border-brand-100">
            {t("bo.calendar.col.product")}
          </div>
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const date = new Date(year, month, d);
            const dow = date.getDay();
            const weekend = dow === 0 || dow === 6;
            return (
              <div
                key={d}
                className={`px-1 py-1 text-center border-b border-brand-100 ${
                  weekend ? "bg-brand-50/50" : "bg-brand-50"
                }`}
              >
                {d}
              </div>
            );
          })}

          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              bookings={bookings.filter((b) => b.productId === p.id)}
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              monthStart={monthStart}
              monthEnd={monthEnd}
              monthStr={monthStr}
              selectedId={selectedId}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3 px-3 py-2 text-xs text-gray-600 border-t border-brand-100">
          {(
            ["pending", "confirmed", "active", "returned"] as const
          ).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span
                className={`w-3 h-3 rounded-sm inline-block ${STATUS_COLOR[s]}`}
              />
              {t(`bo.calendar.status.${s}` as DictKey)}
            </span>
          ))}
        </div>
      </div>

      <aside className="bg-white border border-brand-100 rounded p-4 h-fit">
        {drawerBooking ? (
          <div className="space-y-3">
            <h2 className="font-serif text-lg">
              {drawerBooking.customerName}
            </h2>
            <p className="text-xs text-gray-500">{drawerBooking.email}</p>
            {drawerBooking.customerPhone ? (
              <p className="text-xs text-gray-500">{drawerBooking.customerPhone}</p>
            ) : null}
            {drawerBooking.returnSlot ? (
              <p className="text-xs text-gray-600 mt-1">
                {t("bo.calendar.return")}:{" "}
                {new Date(drawerBooking.returnSlot).toLocaleString(intl, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            ) : null}
            <p className="text-sm">
              {new Date(drawerBooking.startDate).toLocaleDateString(intl)} →{" "}
              {new Date(drawerBooking.endDate).toLocaleDateString(intl)}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">
                {t("bo.calendar.fulfillment")}:
              </span>{" "}
              {drawerBooking.fulfillment}
              {drawerBooking.waiverIncluded && (
                <span className="ml-2 text-xs text-green-700">
                  + {t("bo.calendar.waiver")}
                </span>
              )}
            </p>
            <p className="font-medium">
              {formatPrice(
                drawerBooking.totalCents,
                drawerBooking.currency,
                intl
              )}
            </p>
            <div className="space-y-1">
              <label className="block text-xs text-gray-500">
                {t("bo.calendar.changeStatus")}
              </label>
              <select
                value={drawerBooking.status}
                onChange={(e) => setStatus(drawerBooking.id, e.target.value)}
                className="border border-brand-200 rounded px-2 py-1 text-sm bg-white w-full"
              >
                {(
                  [
                    "pending",
                    "confirmed",
                    "active",
                    "returned",
                    "canceled",
                  ] as const
                ).map((s) => (
                  <option key={s} value={s}>
                    {t(`bo.calendar.status.${s}` as DictKey)}
                  </option>
                ))}
              </select>
            </div>
            {drawerBooking.status !== "returned" && (
              <button
                onClick={() => setStatus(drawerBooking.id, "returned")}
                className="w-full text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded"
              >
                {t("bo.calendar.markReturned")}
              </button>
            )}
            <Link
              href={`/backoffice/calendar?month=${monthStr}`}
              className="block text-xs text-gray-500 hover:underline text-center pt-2"
            >
              {t("bo.calendar.close")}
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("bo.calendar.clickHelp")}</p>
        )}
      </aside>
    </div>
  );
}

function ProductRow({
  product,
  bookings,
  year,
  month,
  daysInMonth,
  monthStart,
  monthEnd,
  monthStr,
  selectedId,
}: {
  product: Product;
  bookings: Booking[];
  year: number;
  month: number;
  daysInMonth: number;
  monthStart: Date;
  monthEnd: Date;
  monthStr: string;
  selectedId: string | null;
}) {
  const cellW = "100%";
  return (
    <>
      <div className="px-2 py-1 border-b border-brand-100 bg-white text-sm truncate sticky left-0">
        {product.name}
        <span className="block text-[10px] text-gray-400">
          {product.rentCopiesCount} copies
        </span>
      </div>
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const d = i + 1;
        const date = new Date(year, month, d);
        const dow = date.getDay();
        const weekend = dow === 0 || dow === 6;
        return (
          <div
            key={d}
            className={`relative h-8 border-b border-brand-50 ${
              weekend ? "bg-brand-50/30" : "bg-white"
            }`}
            style={{ width: cellW }}
          />
        );
      })}
      {/* Overlay booking spans absolutely positioned across the row */}
      <BookingOverlay
        bookings={bookings}
        daysInMonth={daysInMonth}
        monthStart={monthStart}
        monthEnd={monthEnd}
        monthStr={monthStr}
        selectedId={selectedId}
      />
    </>
  );
}

function BookingOverlay({
  bookings,
  daysInMonth,
  monthStart,
  monthEnd,
  monthStr,
  selectedId,
}: {
  bookings: Booking[];
  daysInMonth: number;
  monthStart: Date;
  monthEnd: Date;
  monthStr: string;
  selectedId: string | null;
}) {
  if (bookings.length === 0) return null;
  return (
    <div
      className="contents"
      // span across all day cells: column 2..daysInMonth+1
    >
      <div
        className="-mt-8 relative h-0"
        style={{ gridColumn: `2 / span ${daysInMonth}` }}
      >
        <div className="relative h-8">
          {bookings.map((b) => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            const s = start < monthStart ? monthStart : start;
            const e = end > monthEnd ? monthEnd : end;
            const startDay = s.getDate();
            const endDay = e.getDate();
            const left = ((startDay - 1) / daysInMonth) * 100;
            const width = ((endDay - startDay + 1) / daysInMonth) * 100;
            const color =
              STATUS_COLOR[b.status] ?? "bg-gray-200 text-gray-700";
            const isSelected = selectedId === b.id;
            return (
              <Link
                key={b.id}
                href={`/backoffice/calendar?month=${monthStr}&selected=${b.id}`}
                title={`${b.customerName} (${b.status})`}
                className={`absolute top-1 h-6 px-1.5 text-[10px] truncate rounded ${color} ${
                  isSelected ? "ring-2 ring-brand-700" : ""
                }`}
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                {b.customerName}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
