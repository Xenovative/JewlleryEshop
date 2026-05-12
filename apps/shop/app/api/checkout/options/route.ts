import { NextResponse } from "next/server";
import { getSettings, getWhatsappCheckoutDigitsFromSettings, getWhatsappCheckoutDigitsFromEnv } from "@lumiere/db";

export const dynamic = "force-dynamic";

/** Public: which non-Stripe checkout affordances are configured (no secrets). */
export async function GET() {
  const s = await getSettings().catch(() => null);
  const hasGateway = !!s?.genericGatewayBaseUrl?.trim();
  const waDigits = s
    ? getWhatsappCheckoutDigitsFromSettings(s)
    : getWhatsappCheckoutDigitsFromEnv();
  return NextResponse.json({
    genericGatewayLabel: hasGateway ? (s?.genericGatewayLabel?.trim() || null) : null,
    whatsappCheckout: !!waDigits,
  });
}
