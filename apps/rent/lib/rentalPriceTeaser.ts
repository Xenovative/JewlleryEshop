import { formatPrice } from "@/lib/format";
import type { DictKey } from "@/lib/i18n";

export function rentalPriceTeaser(
  product: {
    priceCents: number;
    rentPricingType: string | null;
    rentDailyCents: number | null;
    rentFixedCents: number | null;
    rentFixedDurationDays: number | null;
    rentalTiers: { priceCents: number }[];
    currency: string;
  },
  t: (key: DictKey, vars?: Record<string, string | number>) => string,
  locale: string
): string {
  if (product.rentPricingType === "fixed" && product.rentFixedCents) {
    return t("rental.card.fixed", {
      days: product.rentFixedDurationDays ?? 1,
      price: formatPrice(product.rentFixedCents, product.currency, locale),
    });
  }
  if (product.rentPricingType === "daily" && product.rentDailyCents) {
    return t("rental.card.daily", {
      price: formatPrice(product.rentDailyCents, product.currency, locale),
    });
  }
  const tierMin =
    product.rentalTiers.length > 0
      ? Math.min(...product.rentalTiers.map((x) => x.priceCents))
      : null;
  const base = tierMin ?? product.rentDailyCents ?? product.priceCents;
  return t("rental.card.from", {
    price: formatPrice(base, product.currency, locale),
  });
}
