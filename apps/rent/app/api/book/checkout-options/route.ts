import { NextResponse } from "next/server";
import { getSettings } from "@lumiere/db";
import { normalizeWhatsAppDigits } from "@/lib/whatsappBookingMessage";

export const dynamic = "force-dynamic";

/** Public: whether WhatsApp checkout is configured (same Settings as shop). */
export async function GET() {
  const s = await getSettings().catch(() => null);
  return NextResponse.json({
    whatsappCheckout: !!normalizeWhatsAppDigits(s?.whatsappCheckoutNumber),
  });
}
