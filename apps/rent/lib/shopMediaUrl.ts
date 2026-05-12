/**
 * Product uploads live under the shop Next app (`apps/shop/public/uploads`).
 * Relative `/uploads/…` URLs must be loaded from the shop origin; on the rental
 * host they would otherwise 404. Full `http(s):` URLs are unchanged.
 */
export function resolveShopHostedMediaUrl(url: string | null | undefined): string {
  const u = url?.trim() ?? "";
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/uploads")) {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    return `${base}${u}`;
  }
  return u;
}
