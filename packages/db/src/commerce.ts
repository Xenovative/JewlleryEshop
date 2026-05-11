/** Shown next to prices at checkout and on invoices (Stripe line items). */
export const FOB_HONG_KONG_OFFICE = "FOB - Hong Kong Office";

/** Stripe and storefront checkout currency for this deployment. */
export const CHECKOUT_CURRENCY = "hkd";

/**
 * Append reference and amount to a KPay (or similar) payment entry URL configured in Settings.
 * KPay’s real query contract may differ; adjust the base URL or use a gateway that accepts these keys.
 */
export function buildKpayCheckoutUrl(
  baseUrl: string | null | undefined,
  ref: string,
  amountCents: number,
  currency: string
): string | null {
  if (!baseUrl?.trim()) return null;
  try {
    const u = new URL(baseUrl.trim());
    u.searchParams.set("ref", ref);
    u.searchParams.set("amountCents", String(amountCents));
    u.searchParams.set("currency", currency);
    return u.toString();
  } catch {
    return null;
  }
}
