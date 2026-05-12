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
  rentalPlanTier: string | null;
  planDays: number;
  rentalCents: number;
  depositCents: number;
  totalCents: number;
  pickupSlot: string;
  returnSlot: string;
  customerName: string;
  customerPhone: string;
  email: string;
};

type ReviewPayMethod = "stripe" | "bank_fps" | "kpay_alipay" | "whatsapp";

function optionClass(selected: boolean) {
  return [
    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
    selected
      ? "border-brand-500 bg-brand-50/80 ring-1 ring-brand-500/25"
      : "border-brand-100 bg-white hover:border-brand-200",
  ].join(" ");
}

export function CheckoutReviewClient(props: Props) {
  const t = useT();
  const intl = intlLocale(useLocale());
  const fmt = (cents: number) => formatPrice(cents, CHECKOUT_CURRENCY, intl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<ReviewPayMethod>("stripe");

  const payStripe = async () => {
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

  const payAlternate = async (method: "bank_fps" | "kpay_alipay" | "whatsapp") => {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/book/payment-alternate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId: props.bookingId, method }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      if (data.error === "whatsapp_not_configured") {
        setError(t("review.whatsappNotConfigured"));
        return;
      }
      setError(data.error ?? t("review.errAlt"));
      return;
    }
    if (data.redirectUrl) window.location.href = data.redirectUrl;
  };

  const submitPayment = async () => {
    if (paymentMethod === "stripe") {
      await payStripe();
    } else {
      await payAlternate(paymentMethod);
    }
  };

  const optionTitle = (m: ReviewPayMethod) => {
    if (m === "stripe") return t("review.payCta");
    if (m === "bank_fps") return t("review.payBank");
    if (m === "kpay_alipay") return t("review.payKpay");
    return t("review.payWhatsapp");
  };

  const payOptions: ReviewPayMethod[] = [
    "stripe",
    "bank_fps",
    "kpay_alipay",
    "whatsapp",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-100 rounded-lg p-6 space-y-3 text-sm">
        <h2 className="font-serif text-lg">{t("review.item")}</h2>
        <p>{props.productName}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-gray-500">{t("review.period")}</dt>
          <dd>
            {props.startDate} → {props.endDate}
            {props.rentalPlanTier === "extended_tbc" ? (
              <> — {t("review.extendedTbcBadge")}</>
            ) : (
              <>
                {" "}
                ({props.planDays} {t("review.days")})
              </>
            )}
          </dd>
          <dt className="text-gray-500">{t("book.pickupSlot")}</dt>
          <dd>{props.pickupSlot}</dd>
          <dt className="text-gray-500">{t("review.returnSlot")}</dt>
          <dd>{props.returnSlot}</dd>
          <dt className="text-gray-500">{t("book.yourName")}</dt>
          <dd>{props.customerName}</dd>
          <dt className="text-gray-500">{t("review.phone")}</dt>
          <dd>{props.customerPhone || "—"}</dd>
          <dt className="text-gray-500">{t("book.email")}</dt>
          <dd>{props.email}</dd>
        </dl>
      </div>

      <div className="border-t border-brand-100 pt-4 text-sm space-y-2">
        <div className="flex justify-between gap-2">
          <span>{t("book.rental")}</span>
          <span className="text-right">
            {props.rentalPlanTier === "extended_tbc" && props.rentalCents < 1 ? (
              t("book.rentalPriceTbc")
            ) : (
              fmt(props.rentalCents)
            )}
            <span className="block text-xs text-gray-500">{t("book.fobTerms")}</span>
          </span>
        </div>
        {props.depositCents > 0 && (
          <div className="flex justify-between gap-2">
            <span className="text-gray-700">{t("book.deposit")}</span>
            <span className="text-right">
              {fmt(props.depositCents)}
              <span className="block text-xs text-gray-500">{t("book.depositRefundHint")}</span>
            </span>
          </div>
        )}
        <div className="flex justify-between font-medium">
          <span>{t("book.total")}</span>
          <span>{fmt(props.totalCents)}</span>
        </div>
      </div>

      <fieldset className="border-0 p-0 m-0 space-y-2">
        <legend className="text-sm font-medium text-gray-800">
          {t("review.paymentMethodLabel")}
        </legend>
        <div
          className="space-y-2"
          role="radiogroup"
          aria-label={t("review.paymentMethodLabel")}
        >
          {payOptions.map((m) => (
            <label key={m} className={optionClass(paymentMethod === m)}>
              <input
                type="radio"
                name="rent-checkout-payment"
                value={m}
                checked={paymentMethod === m}
                onChange={() => {
                  setError(null);
                  setPaymentMethod(m);
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
              />
              <span className="min-w-0 flex-1 text-sm font-medium text-brand-900">
                {optionTitle(m)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {paymentMethod === "stripe" ? (
        <p className="text-xs text-gray-500 -mt-2">{t("review.stripeNote")}</p>
      ) : null}

      <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-3 text-sm space-y-1">
        <p>
          {t("review.reserveCta")}
          <sup className="ml-0.5 text-[10px] align-super">#1</sup>
        </p>
        <p className="text-xs text-gray-600">{t("review.reserveFeeNote")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => void submitPayment()}
        disabled={busy}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium py-3 rounded transition"
      >
        {busy ? t("review.processing") : optionTitle(paymentMethod)}
      </button>
      {paymentMethod !== "stripe" ? (
        <p className="text-xs text-gray-500 text-center">{t("review.alternateConfirmNote")}</p>
      ) : null}
    </div>
  );
}
