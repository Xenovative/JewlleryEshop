import { prisma } from "./prisma";

const SINGLETON_ID = "singleton";

export async function getSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: SINGLETON_ID } });
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
