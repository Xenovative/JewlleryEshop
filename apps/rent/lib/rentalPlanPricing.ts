import { addDays } from "./format";

/** Inclusive calendar days blocked for “8+ days, price TBC” until staff confirms dates. */
export const EXTENDED_TBC_CALENDAR_DAYS = 14;

export type RetailPlanTier = "4" | "8" | "extended_tbc";

export type RetailPlanQuote =
  | {
      ok: true;
      rentalCents: number;
      /** Inclusive rental length in days (used for copy and calendar). */
      calendarDays: number;
      endDate: Date;
      percentUsed: number;
      tier: RetailPlanTier;
    }
  | { ok: false; error: string };

/**
 * Retail % of reference price for published 4- and 8-day plans.
 * `percent8Anchor` is the configured 8-day rate (stored as `rental7DayPercentOfPrice` for history).
 */
export function planPercentForDays(
  days: 4 | 8,
  percent4: number,
  percent8Anchor: number
): number {
  return days === 4 ? percent4 : percent8Anchor;
}

export function quoteRetailPlanByTier(
  sellPriceCents: number,
  tier: RetailPlanTier,
  percent4: number,
  percent7: number,
  startDate: Date
): RetailPlanQuote {
  if (tier === "extended_tbc") {
    if (sellPriceCents <= 0) {
      return { ok: false, error: "Retail reference price is not set for this item." };
    }
    const calendarDays = EXTENDED_TBC_CALENDAR_DAYS;
    const endDate = addDays(startDate, calendarDays - 1);
    return {
      ok: true,
      rentalCents: 0,
      calendarDays,
      endDate,
      percentUsed: 0,
      tier,
    };
  }

  if (sellPriceCents <= 0) {
    return { ok: false, error: "Retail reference price is not set for this item." };
  }
  const days = tier === "4" ? 4 : 8;
  const pct = planPercentForDays(days, percent4, percent7);
  if (pct <= 0 || pct > 100) {
    return { ok: false, error: "Rental percentages are not configured correctly." };
  }
  const rentalCents = Math.round((sellPriceCents * pct) / 100);
  if (rentalCents < 1) {
    return { ok: false, error: "Computed rental amount is too small." };
  }
  const endDate = addDays(startDate, days - 1);
  return {
    ok: true,
    rentalCents,
    calendarDays: days,
    endDate,
    percentUsed: pct,
    tier,
  };
}
