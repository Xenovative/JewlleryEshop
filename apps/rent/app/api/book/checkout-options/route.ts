import { NextResponse } from "next/server";
import { getSettings } from "@lumiere/db";

/** Public: whether WhatsApp checkout is configured (same Settings as shop). */
export async function GET() {
  const s = await getSettings().catch(() => null);
  return NextResponse.json({
    whatsappCheckout: !!s?.whatsappCheckoutNumber?.trim(),
  });
}
