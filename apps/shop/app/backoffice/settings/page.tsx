import { SettingsAdmin } from "@/components/backoffice/SettingsAdmin";
import { getSettings, prisma } from "@lumiere/db";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireRole("owner");
  const s = await getSettings();
  const me = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { totpEnabled: true },
  });
  return (
    <SettingsAdmin
      stripeSecretKeyMasked={maskKey(s.stripeSecretKey)}
      stripeWebhookSecretMasked={maskKey(s.stripeWebhookSecret)}
      stripeSecretKeyEnvFallback={!s.stripeSecretKey && !!process.env.STRIPE_SECRET_KEY}
      stripeWebhookSecretEnvFallback={
        !s.stripeWebhookSecret && !!process.env.STRIPE_WEBHOOK_SECRET
      }
      shopEnabled={s.shopEnabled}
      rentalEnabled={s.rentalEnabled}
      rental4DayPercentOfPrice={s.rental4DayPercentOfPrice}
      rental7DayPercentOfPrice={s.rental7DayPercentOfPrice}
      rentalDepositPercentOfPrice={s.rentalDepositPercentOfPrice}
      bankFpsInstructions={s.bankFpsInstructions}
      kpayAlipayBaseUrl={s.kpayAlipayBaseUrl}
      adminPhone={s.adminPhone}
      twilioAccountSidMasked={maskKey(s.twilioAccountSid)}
      twilioAuthTokenMasked={maskKey(s.twilioAuthToken)}
      twilioFromNumber={s.twilioFromNumber}
      twilioAccountSidEnvFallback={!s.twilioAccountSid && !!process.env.TWILIO_ACCOUNT_SID}
      twilioAuthTokenEnvFallback={!s.twilioAuthToken && !!process.env.TWILIO_AUTH_TOKEN}
      twilioFromNumberEnvFallback={!s.twilioFromNumber && !!process.env.TWILIO_FROM_NUMBER}
      genericGatewayBaseUrl={s.genericGatewayBaseUrl}
      genericGatewayWebhookSecretMasked={maskKey(s.genericGatewayWebhookSecret)}
      genericGatewayLabel={s.genericGatewayLabel}
      totpEnabled={!!me?.totpEnabled}
      whatsappCheckoutNumber={s.whatsappCheckoutNumber}
    />
  );
}

function maskKey(v: string | null): string | null {
  if (!v) return null;
  if (v.length <= 8) return "****";
  return `${v.slice(0, 4)}...${v.slice(-4)}`;
}
