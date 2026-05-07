/**
 * Base URL of the rental Next.js app (no trailing slash).
 * Set `RENT_BASE_URL` in production (see `.env.example`).
 */
export function rentPublicBaseUrl(): string | null {
  const raw = process.env.RENT_BASE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/**
 * URL for a rentable item on the rental app (`/item/[slug]`).
 * Falls back to local dev port when `RENT_BASE_URL` is unset (monorepo default).
 */
export function rentItemUrl(slug: string): string {
  const base = rentPublicBaseUrl();
  const path = `/item/${encodeURIComponent(slug)}`;
  if (base) return `${base}${path}`;
  return `http://localhost:3001${path}`;
}
