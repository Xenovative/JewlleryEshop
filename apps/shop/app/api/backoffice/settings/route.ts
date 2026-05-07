import { NextResponse } from "next/server";
import { z } from "zod";
import { getSettings, updateSettings } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

export async function GET() {
  const guard = await requireApiRole("owner");
  if (guard instanceof NextResponse) return guard;
  const s = await getSettings();
  return NextResponse.json({
    stripeSecretKeyMasked: maskKey(s.stripeSecretKey),
    stripeWebhookSecretMasked: maskKey(s.stripeWebhookSecret),
    stripeSecretKeyEnvFallback: !s.stripeSecretKey && !!process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecretEnvFallback:
      !s.stripeWebhookSecret && !!process.env.STRIPE_WEBHOOK_SECRET,
    totpEnabled: s.totpEnabled,
    shopEnabled: s.shopEnabled,
    rentalEnabled: s.rentalEnabled,
  });
}

const Body = z.object({
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  shopEnabled: z.boolean().optional(),
  rentalEnabled: z.boolean().optional(),
});

export async function PUT(req: Request) {
  const guard = await requireApiRole("owner");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const data: Record<string, string | boolean | null> = {};
  // Empty string clears the value (falls back to env). Undefined leaves untouched.
  if (parsed.data.stripeSecretKey !== undefined) {
    data.stripeSecretKey = parsed.data.stripeSecretKey || null;
  }
  if (parsed.data.stripeWebhookSecret !== undefined) {
    data.stripeWebhookSecret = parsed.data.stripeWebhookSecret || null;
  }
  if (parsed.data.shopEnabled !== undefined) {
    data.shopEnabled = parsed.data.shopEnabled;
  }
  if (parsed.data.rentalEnabled !== undefined) {
    data.rentalEnabled = parsed.data.rentalEnabled;
  }
  await updateSettings(data);
  await audit(user, "update", "Settings", "singleton", undefined, {
    stripeSecretKeyChanged: parsed.data.stripeSecretKey !== undefined,
    stripeWebhookSecretChanged: parsed.data.stripeWebhookSecret !== undefined,
    shopEnabledChanged: parsed.data.shopEnabled !== undefined,
    rentalEnabledChanged: parsed.data.rentalEnabled !== undefined,
  });
  return NextResponse.json({ ok: true });
}

function maskKey(v: string | null): string | null {
  if (!v) return null;
  if (v.length <= 8) return "••••";
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}
