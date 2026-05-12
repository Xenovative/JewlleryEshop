import type { CartSnapshotItem } from "./checkoutCart";

export { normalizeWhatsAppDigits } from "@lumiere/db";

function formatMoney(cents: number, currency: string): string {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

/** Plain-text body for wa.me ?text= (keep concise; WhatsApp URL length is limited). */
export function buildShopOrderWhatsAppMessage(params: {
  orderId: string;
  amountTotalCents: number;
  currency: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  items: CartSnapshotItem[];
}): string {
  const lines: string[] = [
    "New shop order (payment pending)",
    "",
    `Order ID: ${params.orderId}`,
    `Total: ${formatMoney(params.amountTotalCents, params.currency)}`,
    `Email: ${params.email ?? "—"}`,
    `Name: ${params.name ?? "—"}`,
    `Phone: ${params.phone ?? "—"}`,
    "",
    "Items:",
  ];
  for (const it of params.items) {
    const lineTotal = it.priceCents * it.qty;
    lines.push(`• ${it.name} × ${it.qty} → ${formatMoney(lineTotal, params.currency)}`);
  }
  lines.push("", "Confirm payment in backoffice when settled.");
  return lines.join("\n");
}

export function buildWhatsAppMeUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
