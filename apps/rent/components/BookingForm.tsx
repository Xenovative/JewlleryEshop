"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { formatPrice, isoDate, fromIsoDate, addDays } from "@/lib/format";
import { quoteRetailPlan, type RentalPlanDays } from "@/lib/rentalPlanPricing";
import { computeRentalDepositCents } from "@/lib/rentalDeposit";
import { useT, useLocale } from "./I18nProvider";
import { intlLocale } from "@/lib/i18n";
import { CHECKOUT_CURRENCY } from "@lumiere/db/commerce";

type Props = {
  productId: string;
  productName: string;
  sellPriceCents: number;
  rental4DayPercentOfPrice: number;
  rental7DayPercentOfPrice: number;
  rentalDepositPercentOfPrice: number;
};

export function BookingForm(props: Props) {
  const router = useRouter();
  const t = useT();
  const intl = intlLocale(useLocale());
  const fmt = (cents: number) => formatPrice(cents, CHECKOUT_CURRENCY, intl);

  const today = useMemo(() => isoDate(new Date()), []);
  const [start, setStart] = useState(today);
  const [planDays, setPlanDays] = useState<RentalPlanDays>(4);
  const [fullyBooked, setFullyBooked] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupSlot, setPickupSlot] = useState("");
  const [returnSlot, setReturnSlot] = useState("");
  const endIsoRef = useRef("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/availability/${props.productId}`)
      .then((r) => r.json())
      .then((data) => setFullyBooked(new Set<string>(data.fullyBooked ?? [])))
      .catch(() => undefined);
  }, [props.productId]);

  const priceQuote = useMemo(() => {
    if (!start) return null;
    return quoteRetailPlan(
      props.sellPriceCents,
      planDays,
      props.rental4DayPercentOfPrice,
      props.rental7DayPercentOfPrice,
      fromIsoDate(start)
    );
  }, [start, planDays, props]);

  const depositCents = useMemo(
    () =>
      computeRentalDepositCents(props.sellPriceCents, props.rentalDepositPercentOfPrice),
    [props.sellPriceCents, props.rentalDepositPercentOfPrice]
  );

  const endIso =
    priceQuote && priceQuote.ok ? isoDate(priceQuote.endDate) : "";

  useEffect(() => {
    if (!endIso) {
      endIsoRef.current = "";
      setReturnSlot("");
      return;
    }
    if (endIsoRef.current !== endIso) {
      endIsoRef.current = endIso;
      setReturnSlot(`${endIso}T17:00`);
    }
  }, [endIso]);

  const rangeHasBookedDay = useMemo(() => {
    if (!start || !endIso || !priceQuote?.ok) return false;
    let d = fromIsoDate(start);
    const final = fromIsoDate(endIso);
    while (d <= final) {
      if (fullyBooked.has(isoDate(d))) return true;
      d = addDays(d, 1);
    }
    return false;
  }, [start, endIso, fullyBooked, priceQuote]);

  const blockedDates = Array.from(fullyBooked).sort();

  const submit = async () => {
    setError(null);
    if (!priceQuote || !priceQuote.ok) {
      setError(priceQuote && !priceQuote.ok ? priceQuote.error : t("book.errPickDates"));
      return;
    }
    if (rangeHasBookedDay) {
      setError(t("book.errOverlap"));
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError(t("book.errContact"));
      return;
    }
    if (phone.trim().length < 5) {
      setError(t("book.errPhone"));
      return;
    }
    if (!pickupSlot) {
      setError(t("book.errPickup"));
      return;
    }
    if (!returnSlot.trim()) {
      setError(t("book.errReturnSlot"));
      return;
    }
    const returnDay = returnSlot.trim().split("T")[0] ?? "";
    if (returnDay !== endIso) {
      setError(t("book.errReturnDay", { end: endIso }));
      return;
    }

    setBusy(true);
    const res = await fetch("/api/book/prepare", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: props.productId,
        startDate: start,
        planDays,
        email: email.trim(),
        customerName: name.trim(),
        customerPhone: phone.trim(),
        pickupSlot,
        returnSlot,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t("book.errCheckout"));
      return;
    }
    router.push(`/checkout/review?bookingId=${encodeURIComponent(data.bookingId)}`);
  };

  const planHint = t("book.planHint", {
    pct4: props.rental4DayPercentOfPrice,
    pct7: props.rental7DayPercentOfPrice,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl">{t("book.title")}</h2>
        <p className="text-sm text-gray-500">{planHint}</p>
        <p className="text-sm text-gray-600 mt-1">{t("book.pickupOnly")}</p>
        {props.rentalDepositPercentOfPrice > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {t("book.depositPolicy", { pct: props.rentalDepositPercentOfPrice })}
          </p>
        )}
      </div>

      {blockedDates.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">
            {t("book.bookedDays", { n: blockedDates.length })}
          </summary>
          <div className="mt-1 max-h-24 overflow-y-auto font-mono">
            {blockedDates.join(", ")}
          </div>
        </details>
      )}

      <fieldset className="text-sm">
        <legend className="text-gray-600 mb-2">{t("book.rentalPlan")}</legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="plan"
              checked={planDays === 4}
              onChange={() => setPlanDays(4)}
            />
            <span>
              {t("book.plan4")} —{" "}
              {priceQuote?.ok && planDays === 4
                ? fmt(priceQuote.rentalCents)
                : fmt(
                    Math.max(
                      1,
                      Math.round(
                        (props.sellPriceCents * props.rental4DayPercentOfPrice) / 100
                      )
                    )
                  )}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="plan"
              checked={planDays === 7}
              onChange={() => setPlanDays(7)}
            />
            <span>
              {t("book.plan7")} —{" "}
              {priceQuote?.ok && planDays === 7
                ? fmt(priceQuote.rentalCents)
                : fmt(
                    Math.max(
                      1,
                      Math.round(
                        (props.sellPriceCents * props.rental7DayPercentOfPrice) / 100
                      )
                    )
                  )}
            </span>
          </label>
        </div>
      </fieldset>

      <label className="text-sm block">
        <span className="text-gray-600">{t("book.startDate")}</span>
        <input
          type="date"
          min={today}
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
        />
      </label>

      {priceQuote && priceQuote.ok && (
        <p className="text-sm">
          {t("book.periodSummary", {
            start,
            end: endIso,
            days: priceQuote.days,
            price: fmt(priceQuote.rentalCents),
            pct: priceQuote.percentUsed,
          })}
        </p>
      )}
      {priceQuote && !priceQuote.ok && (
        <p className="text-sm text-amber-700">{priceQuote.error}</p>
      )}

      <label className="text-sm block">
        <span className="text-gray-600">{t("book.pickupSlot")}</span>
        <input
          type="datetime-local"
          value={pickupSlot}
          onChange={(e) => setPickupSlot(e.target.value)}
          required
          className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
        />
      </label>

      <label className="text-sm block">
        <span className="text-gray-600">{t("book.returnSlot")}</span>
        <input
          type="datetime-local"
          value={returnSlot}
          onChange={(e) => setReturnSlot(e.target.value)}
          min={endIso ? `${endIso}T00:00` : undefined}
          max={endIso ? `${endIso}T23:59` : undefined}
          required
          className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
        />
        <span className="mt-1 block text-xs text-gray-500">{t("book.returnSlotHint")}</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="text-gray-600">{t("book.yourName")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-gray-600">{t("book.phone")}</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-1">
          <span className="text-gray-600">{t("book.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
      </div>

      {priceQuote && priceQuote.ok && (
        <div className="border-t border-brand-100 pt-3 text-sm space-y-1">
          <div className="flex justify-between gap-2">
            <span>{t("book.rental")}</span>
            <span className="text-right">
              {fmt(priceQuote.rentalCents)}
              <span className="block text-xs text-gray-500 font-normal">
                {t("book.fobTerms")}
              </span>
            </span>
          </div>
          {depositCents > 0 && (
            <div className="flex justify-between gap-2">
              <span>{t("book.deposit")}</span>
              <span className="text-right">
                {fmt(depositCents)}
                <span className="block text-xs text-gray-500 font-normal">
                  {t("book.depositRefundHint")}
                </span>
              </span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span>{t("book.total")}</span>
            <span>{fmt(priceQuote.rentalCents + depositCents)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium py-3 rounded transition"
      >
        {busy ? t("book.redirecting") : t("book.ctaReview")}
      </button>
    </div>
  );
}
