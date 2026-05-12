/**
 * Stripe and Open Graph require absolute image URLs. Same-origin paths like
 * `/uploads/...` are expanded using NEXT_PUBLIC_BASE_URL.
 */
export function absolutizePublicUrl(url: string | null | undefined): string {
  const u = url?.trim() ?? "";
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    return `${base}${u}`;
  }
  return u;
}
