import { formatPrice } from "@/lib/format";
import type { DictKey } from "@/lib/i18n";
import { CHECKOUT_CURRENCY } from "@lumiere/db/commerce";

export function rentalPriceTeaser(
  product: { priceCents: number },
  settings: { rental4DayPercentOfPrice: number; rental7DayPercentOfPrice: number },
  t: (key: DictKey, vars?: Record<string, string | number>) => string,
  locale: string
): string {
  if (product.priceCents <= 0) {
    return t("rental.card.priceOnRequest");
  }
  const p4 = Math.max(1, Math.round((product.priceCents * settings.rental4DayPercentOfPrice) / 100));
  const p7 = Math.max(1, Math.round((product.priceCents * settings.rental7DayPercentOfPrice) / 100));
  return t("rental.card.plans", {
    price4: formatPrice(p4, CHECKOUT_CURRENCY, locale),
    price7: formatPrice(p7, CHECKOUT_CURRENCY, locale),
  });
}
