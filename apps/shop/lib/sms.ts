import { getSettings } from "@lumiere/db";

type SmsEvent =
  | { type: "order_paid"; orderId: string; amountCents: number; currency: string; email?: string | null }
  | { type: "order_awaiting_payment"; orderId: string; amountCents: number; currency: string; email?: string | null }
  | { type: "booking_confirmed"; bookingId: string; amountCents: number; currency: string; email: string; customerName: string }
  | { type: "booking_status_changed"; bookingId: string; oldStatus: string; newStatus: string; email: string; customerName: string };

function formatCurrency(cents: number, currency: string): string {
  const symbol = currency.toUpperCase() === "HKD" ? "HK$" : currency.toUpperCase();
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  if (fraction === 0) return `${symbol}${whole}`;
  return `${symbol}${whole}.${String(fraction).padStart(2, "0")}`;
}

function buildMessage(payload: SmsEvent): string {
  switch (payload.type) {
    case "order_paid":
      return `Lumiere: Order paid ${payload.orderId.slice(-6)} — ${formatCurrency(payload.amountCents, payload.currency)}${payload.email ? ` (${payload.email})` : ""}`;
    case "order_awaiting_payment":
      return `Lumiere: Order awaiting payment ${payload.orderId.slice(-6)} — ${formatCurrency(payload.amountCents, payload.currency)}${payload.email ? ` (${payload.email})` : ""}`;
    case "booking_confirmed":
      return `Lumiere: Booking confirmed ${payload.bookingId.slice(-6)} — ${formatCurrency(payload.amountCents, payload.currency)} (${payload.customerName})`;
    case "booking_status_changed":
      return `Lumiere: Booking ${payload.bookingId.slice(-6)} status changed from ${payload.oldStatus} to ${payload.newStatus} (${payload.customerName})`;
  }
}

export async function sendAdminSms(payload: SmsEvent): Promise<void> {
  const settings = await getSettings().catch(() => null);

  const accountSid =
    settings?.twilioAccountSid?.trim() ||
    process.env.TWILIO_ACCOUNT_SID?.trim() ||
    null;
  const authToken =
    settings?.twilioAuthToken?.trim() ||
    process.env.TWILIO_AUTH_TOKEN?.trim() ||
    null;
  const fromNumber =
    settings?.twilioFromNumber?.trim() ||
    process.env.TWILIO_FROM_NUMBER?.trim() ||
    null;

  // guarded: skip silently if Twilio credentials are not configured
  if (!accountSid || !authToken || !fromNumber) {
    return;
  }

  const adminPhone = settings?.adminPhone?.trim();

  // guarded: skip silently if no admin phone is configured
  if (!adminPhone) {
    return;
  }

  const messageBody = buildMessage(payload);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const bodyParams = new URLSearchParams({
    To: adminPhone,
    From: fromNumber,
    Body: messageBody,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown");
      console.error("Twilio SMS failed:", res.status, text);
    }
  } catch (e) {
    console.error("Twilio SMS network error:", e);
  }
}
