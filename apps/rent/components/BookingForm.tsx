"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice, isoDate, fromIsoDate, addDays } from "@/lib/format";
import { quote } from "@/lib/pricing";
import { useT, useLocale } from "./I18nProvider";
import { intlLocale } from "@/lib/i18n";

type Tier = { days: number; priceCents: number; label: string };

type Props = {
  productId: string;
  productName: string;
  currency: string;
  pricingType: string;
  rentDailyCents: number | null;
  rentFixedCents: number | null;
  rentFixedDurationDays: number | null;
  tiers: Tier[];
  waiverFeeCents: number | null;
};

export function BookingForm(props: Props) {
  const t = useT();
  const intl = intlLocale(useLocale());
  const fmt = (cents: number) => formatPrice(cents, props.currency, intl);

  const today = useMemo(() => isoDate(new Date()), []);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState<string>("");
  const [fullyBooked, setFullyBooked] = useState<Set<string>>(new Set());
  const [fulfillment, setFulfillment] = useState<"ship" | "pickup">("ship");
  const [waiver, setWaiver] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pickupSlot, setPickupSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/availability/${props.productId}`)
      .then((r) => r.json())
      .then((data) => setFullyBooked(new Set<string>(data.fullyBooked ?? [])))
      .catch(() => undefined);
  }, [props.productId]);

  useEffect(() => {
    if (props.pricingType === "fixed" && props.rentFixedDurationDays && start) {
      const e = addDays(fromIsoDate(start), props.rentFixedDurationDays - 1);
      setEnd(isoDate(e));
    }
  }, [props.pricingType, props.rentFixedDurationDays, start]);

  const priceQuote = useMemo(() => {
    if (!start) return null;
    return quote(
      {
        rentPricingType: props.pricingType,
        rentDailyCents: props.rentDailyCents,
        rentFixedCents: props.rentFixedCents,
        rentFixedDurationDays: props.rentFixedDurationDays,
        rentalTiers: props.tiers,
      },
      fromIsoDate(start),
      end ? fromIsoDate(end) : null
    );
  }, [start, end, props]);

  const rangeHasBookedDay = useMemo(() => {
    if (!start || !end) return false;
    let d = fromIsoDate(start);
    const final = fromIsoDate(end);
    while (d <= final) {
      if (fullyBooked.has(isoDate(d))) return true;
      d = addDays(d, 1);
    }
    return false;
  }, [start, end, fullyBooked]);

  const waiverAvailable = props.waiverFeeCents != null && props.waiverFeeCents > 0;
  const waiverCents = waiver && waiverAvailable ? (props.waiverFeeCents ?? 0) : 0;
  const subtotal =
    priceQuote && priceQuote.ok ? priceQuote.rentalCents + waiverCents : 0;

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
    if (!name || !email) {
      setError(t("book.errNameEmail"));
      return;
    }
    if (fulfillment === "ship" && !address) {
      setError(t("book.errAddress"));
      return;
    }
    if (fulfillment === "pickup" && !pickupSlot) {
      setError(t("book.errPickup"));
      return;
    }

    setBusy(true);
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: props.productId,
        startDate: start,
        endDate: isoDate(priceQuote.endDate),
        fulfillment,
        email,
        customerName: name,
        shippingAddress: fulfillment === "ship" ? address : null,
        pickupSlot: fulfillment === "pickup" ? pickupSlot : null,
        waiver,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t("book.errCheckout"));
      return;
    }
    window.location.href = data.url;
  };

  const priceLabel = (() => {
    if (props.pricingType === "daily" && props.rentDailyCents != null) {
      return t("book.priceLabel.daily", { price: fmt(props.rentDailyCents) });
    }
    if (props.pricingType === "fixed" && props.rentFixedCents != null) {
      return t("book.priceLabel.fixed", {
        price: fmt(props.rentFixedCents),
        days: props.rentFixedDurationDays ?? 0,
      });
    }
    if (props.pricingType === "tiered" && props.tiers.length > 0) {
      return props.tiers
        .map((tier) => `${tier.label}: ${fmt(tier.priceCents)}`)
        .join(t("book.priceLabel.tieredJoin"));
    }
    return t("book.priceLabel.none");
  })();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl">{t("book.title")}</h2>
        <p className="text-sm text-gray-500">{priceLabel}</p>
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

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-gray-600">{t("book.startDate")}</span>
          <input
            type="date"
            min={today}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-gray-600">
            {props.pricingType === "fixed" ? t("book.endDateAuto") : t("book.endDate")}
          </span>
          <input
            type="date"
            min={start || today}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            disabled={props.pricingType === "fixed"}
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 disabled:bg-gray-100"
          />
        </label>
      </div>

      {priceQuote && priceQuote.ok && (
        <p className="text-sm">
          {t("book.daysSummary", {
            days: priceQuote.days,
            price: fmt(priceQuote.rentalCents),
          })}
        </p>
      )}
      {priceQuote && !priceQuote.ok && (
        <p className="text-sm text-amber-700">{priceQuote.error}</p>
      )}

      <fieldset className="text-sm">
        <legend className="text-gray-600 mb-1">{t("book.fulfillment")}</legend>
        <label className="mr-4">
          <input
            type="radio"
            checked={fulfillment === "ship"}
            onChange={() => setFulfillment("ship")}
          />{" "}
          {t("book.ship")}
        </label>
        <label>
          <input
            type="radio"
            checked={fulfillment === "pickup"}
            onChange={() => setFulfillment("pickup")}
          />{" "}
          {t("book.pickup")}
        </label>
      </fieldset>

      {fulfillment === "ship" ? (
        <label className="text-sm block">
          <span className="text-gray-600">{t("book.shippingAddress")}</span>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
      ) : (
        <label className="text-sm block">
          <span className="text-gray-600">{t("book.pickupSlot")}</span>
          <input
            type="datetime-local"
            value={pickupSlot}
            onChange={(e) => setPickupSlot(e.target.value)}
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-gray-600">{t("book.yourName")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-gray-600">{t("book.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
          />
        </label>
      </div>

      {waiverAvailable && (
        <label className="flex items-start gap-2 text-sm bg-brand-50 rounded p-3">
          <input
            type="checkbox"
            checked={waiver}
            onChange={(e) => setWaiver(e.target.checked)}
            className="mt-1"
          />
          <span>{t("book.waiver", { price: fmt(props.waiverFeeCents ?? 0) })}</span>
        </label>
      )}

      {priceQuote && priceQuote.ok && (
        <div className="border-t border-brand-100 pt-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>{t("book.rental")}</span>
            <span>{fmt(priceQuote.rentalCents)}</span>
          </div>
          {waiverCents > 0 && (
            <div className="flex justify-between">
              <span>{t("book.damageWaiver")}</span>
              <span>{fmt(waiverCents)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span>{t("book.total")}</span>
            <span>{fmt(subtotal)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium py-3 rounded transition"
      >
        {busy ? t("book.redirecting") : t("book.cta")}
      </button>
    </div>
  );
}
