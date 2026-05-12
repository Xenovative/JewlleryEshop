/** E.164-style digits only; min length so obviously not a typo fragment. */
export function normalizeWhatsAppDigits(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const d = raw.replace(/\D/g, "");
  return d.length >= 8 ? d : null;
}
