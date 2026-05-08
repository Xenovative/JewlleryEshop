import { addDays } from "./format";

export type RentalPlanDays = 4 | 7;

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
  const pct = planDays === 4 ? percent4 : percent7;
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
