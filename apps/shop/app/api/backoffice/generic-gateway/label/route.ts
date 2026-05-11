import { NextResponse } from "next/server";
import { getSettings } from "@lumiere/db";

export async function GET() {
  const settings = await getSettings().catch(() => null);
  // guarded: only expose label if a gateway URL is actually configured
  const isConfigured = !!settings?.genericGatewayBaseUrl?.trim();
  return NextResponse.json({
    label: isConfigured ? (settings?.genericGatewayLabel?.trim() || null) : null,
  });
}
