/** Security deposit from retail reference price (HKD cents). */
export function computeRentalDepositCents(priceCents: number, percent: number): number {
  if (percent <= 0 || priceCents <= 0) return 0;
  return Math.max(1, Math.round((priceCents * percent) / 100));
}
