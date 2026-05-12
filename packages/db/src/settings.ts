import { prisma } from "./prisma";
import { normalizeWhatsAppDigits } from "./whatsappDigits";

const SINGLETON_ID = "singleton";

export async function getSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: SINGLETON_ID } });
}

/** When DB and storefront processes disagree on DATABASE_URL, set this on the rent/shop host. */
export function getWhatsappCheckoutDigitsFromEnv(): string | null {
  const raw =
    process.env.LUMIERE_WHATSAPP_CHECKOUT_NUMBER?.trim() ||
    process.env.WHATSAPP_CHECKOUT_NUMBER?.trim() ||
    null;
  return normalizeWhatsAppDigits(raw);
}

/** Merge DB value with env without a second DB round-trip. */
export function getWhatsappCheckoutDigitsFromSettings(
  s: Pick<{ whatsappCheckoutNumber: string | null }, "whatsappCheckoutNumber">
): string | null {
  return normalizeWhatsAppDigits(s.whatsappCheckoutNumber) ?? getWhatsappCheckoutDigitsFromEnv();
}

/** Settings row first, then env fallback (same validation as payment routes). */
export async function getWhatsappCheckoutDigits(): Promise<string | null> {
  const s = await getSettings();
  return getWhatsappCheckoutDigitsFromSettings(s);
}

export async function updateSettings(
  data: Partial<{
    stripeSecretKey: string | null;
    stripeWebhookSecret: string | null;
    totpSecret: string | null;
    totpEnabled: boolean;
    shopEnabled: boolean;
    rentalEnabled: boolean;
    shopHomeJson: string | null;
    rentalHomeJson: string | null;
    rental4DayPercentOfPrice: number;
    rental7DayPercentOfPrice: number;
    rentalDepositPercentOfPrice: number;
    bankFpsInstructions: string | null;
    kpayAlipayBaseUrl: string | null;
    adminPhone: string | null;
    twilioAccountSid: string | null;
    twilioAuthToken: string | null;
    twilioFromNumber: string | null;
    genericGatewayBaseUrl: string | null;
    genericGatewayWebhookSecret: string | null;
    genericGatewayLabel: string | null;
    whatsappCheckoutNumber: string | null;
  }>
) {
  await getSettings();
  return prisma.settings.update({ where: { id: SINGLETON_ID }, data });
}

export async function getStripeSecretKey(): Promise<string | null> {
  const s = await getSettings();
  return s.stripeSecretKey || process.env.STRIPE_SECRET_KEY || null;
}

export async function getStripeWebhookSecret(): Promise<string | null> {
  const s = await getSettings();
  return s.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || null;
}
