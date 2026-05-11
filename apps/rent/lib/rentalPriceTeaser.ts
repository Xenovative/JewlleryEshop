import { formatPrice } from "@/lib/format";
import type { DictKey } from "@/lib/i18n";
import { CHECKOUT_CURRENCY } from "@lumiere/db/commerce";
import { planPercentForDays } from "@/lib/rentalPlanPricing";

export function rentalPriceTeaser(
  product: { priceCents: number },
  settings: { rental4DayPercentOfPrice: number; rental7DayPercentOfPrice: number },
  t: (key: DictKey, vars?: Record<string, string | number>) => string,
  locale: string
): string {
  if (product.priceCents <= 0) {
    return t("rental.card.priceOnRequest");
  }
  const toPrice = (days: 4 | 8) =>
    Math.max(
      1,
      Math.round(
        (product.priceCents *
          planPercentForDays(days, settings.rental4DayPercentOfPrice, settings.rental7DayPercentOfPrice)) /
          100
      )
    );
  const p4 = toPrice(4);
  const p8 = toPrice(8);
  return t("rental.card.plans", {
    price4: formatPrice(p4, CHECKOUT_CURRENCY, locale),
    price8: formatPrice(p8, CHECKOUT_CURRENCY, locale),
    tbc: t("rental.card.planTbcShort"),
  });
}
