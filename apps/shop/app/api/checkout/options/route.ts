import { NextResponse } from "next/server";
import { getSettings } from "@lumiere/db";

/** Public: which non-Stripe checkout affordances are configured (no secrets). */
export async function GET() {
  const s = await getSettings().catch(() => null);
  const hasGateway = !!s?.genericGatewayBaseUrl?.trim();
  return NextResponse.json({
    genericGatewayLabel: hasGateway ? (s?.genericGatewayLabel?.trim() || null) : null,
    whatsappCheckout: !!s?.whatsappCheckoutNumber?.trim(),
  });
}
