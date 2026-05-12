export function normalizeWhatsAppDigits(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const d = raw.replace(/\D/g, "");
  return d.length >= 8 ? d : null;
}

function formatMoney(cents: number, currency: string): string {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

export function buildRentalBookingWhatsAppMessage(params: {
  bookingId: string;
  productName: string;
  periodLabel: string;
  rentalCents: number;
  depositCents: number;
  totalCents: number;
  currency: string;
  email: string;
  customerName: string;
  customerPhone: string;
  pickupSlot: string;
  returnSlot: string;
  rentalPlanTier: string | null;
}): string {
  const lines = [
    "New rental booking (payment pending)",
    "",
    `Booking ID: ${params.bookingId}`,
    `Item: ${params.productName}`,
    `Period: ${params.periodLabel}`,
    `Pickup: ${params.pickupSlot}`,
    `Return: ${params.returnSlot}`,
    `Plan: ${params.rentalPlanTier ?? "—"}`,
    "",
    `Rental: ${formatMoney(params.rentalCents, params.currency)}`,
    `Deposit: ${formatMoney(params.depositCents, params.currency)}`,
    `Total due: ${formatMoney(params.totalCents, params.currency)}`,
    "",
    `Email: ${params.email}`,
    `Name: ${params.customerName}`,
    `Phone: ${params.customerPhone || "—"}`,
    "",
    "Confirm payment in backoffice when settled.",
  ];
  return lines.join("\n");
}

export function buildWhatsAppMeUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
