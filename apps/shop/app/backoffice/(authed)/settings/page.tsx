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
      totpEnabled={!!me?.totpEnabled}
    />
  );
}

function maskKey(v: string | null): string | null {
  if (!v) return null;
  if (v.length <= 8) return "****";
  return `${v.slice(0, 4)}...${v.slice(-4)}`;
}
