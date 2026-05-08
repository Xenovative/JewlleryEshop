"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { useT, useLocale } from "./I18nProvider";
import { intlLocale } from "@/lib/i18n";
import { CHECKOUT_CURRENCY } from "@lumiere/db/commerce";

type Props = {
  bookingId: string;
  productName: string;
  startDate: string;
  endDate: string;
  planDays: number;
  rentalCents: number;
  pickupSlot: string;
  customerName: string;
  email: string;
};

export function CheckoutReviewClient(props: Props) {
  const t = useT();
  const intl = intlLocale(useLocale());
  const fmt = (cents: number) => formatPrice(cents, CHECKOUT_CURRENCY, intl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/book/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId: props.bookingId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t("review.errPay"));
      return;
    }
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-100 rounded-lg p-6 space-y-3 text-sm">
        <h2 className="font-serif text-lg">{t("review.item")}</h2>
        <p>{props.productName}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-gray-500">{t("review.period")}</dt>
          <dd>
            {props.startDate} → {props.endDate} ({props.planDays} {t("review.days")})
          </dd>
          <dt className="text-gray-500">{t("book.pickupSlot")}</dt>
          <dd>{props.pickupSlot}</dd>
          <dt className="text-gray-500">{t("book.yourName")}</dt>
          <dd>{props.customerName}</dd>
          <dt className="text-gray-500">{t("book.email")}</dt>
          <dd>{props.email}</dd>
        </dl>
      </div>

      <div className="border-t border-brand-100 pt-4 text-sm space-y-2">
        <div className="flex justify-between gap-2">
          <span>{t("book.rental")}</span>
          <span className="text-right">
            {fmt(props.rentalCents)}
            <span className="block text-xs text-gray-500">{t("book.fobTerms")}</span>
          </span>
        </div>
        <div className="flex justify-between font-medium">
          <span>{t("book.total")}</span>
          <span>{fmt(props.rentalCents)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium py-3 rounded transition"
      >
        {busy ? t("review.paying") : t("review.payCta")}
      </button>
    </div>
  );
}
