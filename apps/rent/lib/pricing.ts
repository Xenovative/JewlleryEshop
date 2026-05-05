import { dayDiff, addDays } from "./format";

type RentalTier = { days: number; priceCents: number };
type RentProduct = {
  rentPricingType: string | null;
  rentDailyCents: number | null;
  rentFixedCents: number | null;
  rentFixedDurationDays: number | null;
  rentalTiers: RentalTier[];
};

export type PriceQuote = {
  ok: true;
  rentalCents: number;
  days: number;
  endDate: Date;
} | {
  ok: false;
  error: string;
};

// For "fixed" the customer only chooses startDate; endDate auto-derived.
export function quote(
  product: RentProduct,
  startDate: Date,
  endDate: Date | null
): PriceQuote {
  switch (product.rentPricingType) {
    case "daily": {
      if (!endDate) return { ok: false, error: "Pick an end date" };
      const days = dayDiff(startDate, endDate);
      if (days < 1) return { ok: false, error: "End date must be on or after start date" };
      if (!product.rentDailyCents) return { ok: false, error: "Daily price not set" };
      return { ok: true, rentalCents: product.rentDailyCents * days, days, endDate };
    }
    case "fixed": {
      if (!product.rentFixedCents || !product.rentFixedDurationDays) {
        return { ok: false, error: "Fixed price not set" };
      }
      const computedEnd = addDays(startDate, product.rentFixedDurationDays - 1);
      return {
        ok: true,
        rentalCents: product.rentFixedCents,
        days: product.rentFixedDurationDays,
        endDate: computedEnd,
      };
    }
    case "tiered": {
      if (!endDate) return { ok: false, error: "Pick an end date" };
      const days = dayDiff(startDate, endDate);
      if (days < 1) return { ok: false, error: "End date must be on or after start date" };
      const tiers = [...product.rentalTiers].sort((a, b) => a.days - b.days);
      if (tiers.length === 0) return { ok: false, error: "No tiers configured" };
      const tier = tiers.find((t) => t.days >= days) ?? tiers[tiers.length - 1];
      return { ok: true, rentalCents: tier.priceCents, days: tier.days, endDate };
    }
    default:
      return { ok: false, error: "Pricing model not configured" };
  }
}
