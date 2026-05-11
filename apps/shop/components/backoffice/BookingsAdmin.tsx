"use client";

import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useT } from "@/components/I18nProvider";
import type { DictKey } from "@/lib/i18n";

type Row = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  customerName: string;
  customerPhone: string | null;
  email: string;
  productName: string;
  fulfillment: string;
  totalCents: number;
  currency: string;
  waiverIncluded: boolean;
  stripeSessionId: string | null;
  paymentProvider: string | null;
};

const STATUSES = ["", "pending", "confirmed", "active", "returned", "canceled"];

export function BookingsAdmin({
  initial,
  currentStatus,
}: {
  initial: Row[];
  currentStatus: string;
}) {
  const router = useRouter();
  const t = useT();

  const statusLabel = (s: string) =>
    s ? t(`admin.bookings.status.${s}` as DictKey) : t("admin.bookings.allStatuses");

  const setStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/backoffice/bookings/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) router.refresh();
  };

  const confirmAlternate = async (id: string) => {
    const res = await fetch(`/api/backoffice/bookings/${id}/confirm-alternate-payment`, {
      method: "POST",
    });
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      window.alert((data as { error?: string }).error ?? "Failed");
    }
  };

  const payMethodLabel = (b: Row) => {
    if (b.stripeSessionId) return "Stripe";
    if (b.paymentProvider === "bank_fps") return t("checkout.alt.methodBank");
    if (b.paymentProvider === "kpay_alipay") return t("checkout.alt.methodKpay");
    return "—";
  };

  const showConfirmAlternate = (b: Row) =>
    b.status === "pending" &&
    !b.stripeSessionId &&
    (b.paymentProvider === "bank_fps" || b.paymentProvider === "kpay_alipay");

  const filter = (s: string) => {
    const url = new URL(window.location.href);
    if (s) url.searchParams.set("status", s);
    else url.searchParams.delete("status");
    router.replace(url.pathname + url.search);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">{t("admin.bookings.title")}</h1>
        <select
          value={currentStatus}
          onChange={(e) => filter(e.target.value)}
          className="border border-brand-200 rounded px-2 py-1 text-sm bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {initial.length === 0 ? (
        <p className="text-gray-500 text-sm">{t("admin.bookings.empty")}</p>
      ) : (
        <div className="bg-white border border-brand-100 rounded">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-left">
              <tr>
                <th className="px-3 py-2">{t("admin.bookings.col.dates")}</th>
                <th className="px-3 py-2">{t("admin.bookings.col.item")}</th>
                <th className="px-3 py-2">{t("admin.bookings.col.customer")}</th>
                <th className="px-3 py-2">{t("admin.bookings.col.fulfillment")}</th>
                <th className="px-3 py-2">{t("admin.bookings.col.total")}</th>
                <th className="px-3 py-2">{t("admin.bookings.col.payment")}</th>
                <th className="px-3 py-2">{t("admin.bookings.col.status")}</th>
                <th className="px-3 py-2 w-32" />
              </tr>
            </thead>
            <tbody>
              {initial.map((b) => (
                <tr key={b.id} className="border-t border-brand-100 align-top">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {b.startDate.slice(0, 10)} → {b.endDate.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2">{b.productName}</td>
                  <td className="px-3 py-2">
                    <div>{b.customerName}</div>
                    {b.customerPhone ? (
                      <div className="text-xs text-gray-500">{b.customerPhone}</div>
                    ) : null}
                    <div className="text-xs text-gray-500">{b.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    {b.fulfillment}
                    {b.waiverIncluded && (
                      <div className="text-xs text-brand-600">
                        {t("admin.bookings.waiverFlag")}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {formatPrice(b.totalCents, b.currency)}
                  </td>
                  <td className="px-3 py-2 text-xs">{payMethodLabel(b)}</td>
                  <td className="px-3 py-2">
                    <select
                      value={b.status}
                      onChange={(e) => setStatus(b.id, e.target.value)}
                      className="border border-brand-200 rounded px-2 py-1 bg-white"
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {showConfirmAlternate(b) ? (
                      <button
                        type="button"
                        onClick={() => confirmAlternate(b.id)}
                        className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-2 py-1 rounded"
                      >
                        {t("admin.bookings.confirmAlternate")}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
