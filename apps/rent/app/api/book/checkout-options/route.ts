import { NextResponse } from "next/server";
import { getWhatsappCheckoutDigits } from "@lumiere/db";

export const dynamic = "force-dynamic";

/** Public: whether WhatsApp checkout is configured (same Settings as shop). */
export async function GET() {
  const digits = await getWhatsappCheckoutDigits().catch(() => null);
  return NextResponse.json({
    whatsappCheckout: !!digits,
  });
}
