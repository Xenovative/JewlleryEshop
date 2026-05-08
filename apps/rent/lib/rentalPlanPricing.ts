import { addDays } from "./format";

export const MIN_RENTAL_PLAN_DAYS = 4;
export const MAX_RENTAL_PLAN_DAYS = 8;
export type RentalPlanDays = 4 | 5 | 6 | 7 | 8;

export type RetailPlanQuote =
  | {
      ok: true;
      rentalCents: number;
      days: number;
      endDate: Date;
      percentUsed: number;
    }
  | { ok: false; error: string };

export function quoteRetailPlan(
  sellPriceCents: number,
  planDays: RentalPlanDays,
  percent4: number,
  percent7: number,
  startDate: Date
): RetailPlanQuote {
  if (sellPriceCents <= 0) {
    return { ok: false, error: "Retail reference price is not set for this item." };
  }
  const pct = planPercentForDays(planDays, percent4, percent7);
  if (pct <= 0 || pct > 100) {
    return { ok: false, error: "Rental percentages are not configured correctly." };
  }
  const rentalCents = Math.round((sellPriceCents * pct) / 100);
  if (rentalCents < 1) {
    return { ok: false, error: "Computed rental amount is too small." };
  }
  const endDate = addDays(startDate, planDays - 1);
  return { ok: true, rentalCents, days: planDays, endDate, percentUsed: pct };
}

export function planPercentForDays(
  days: RentalPlanDays,
  percent4: number,
  percent7: number
): number {
  // Interpolate day 5-6 between configured 4/7 anchors, and extend to day 8.
  // step = (p7 - p4) / 3 so day 8 is one step above day 7.
  const step = (percent7 - percent4) / 3;
  return percent4 + (days - MIN_RENTAL_PLAN_DAYS) * step;
}
