export function formatPrice(
  cents: number,
  currency = "hkd",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function fromIsoDate(s: string): Date {
  // Treat as UTC midnight to avoid timezone drift in date-only logic.
  return new Date(`${s}T00:00:00.000Z`);
}

export function dayDiff(start: Date, end: Date): number {
  const ms = fromIsoDate(isoDate(end)).getTime() - fromIsoDate(isoDate(start)).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000)) + 1; // inclusive
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + n);
  return out;
}
