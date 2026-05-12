import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, getSettings, buildKpayCheckoutUrl } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { getT, getLocale } from "@/lib/i18n.server";
import { intlLocale } from "@/lib/i18n";
import {
  buildShopOrderWhatsAppMessage,
  buildWhatsAppMeUrl,
  normalizeWhatsAppDigits,
} from "@/lib/whatsappOrderMessage";
import type { CartSnapshotItem } from "@/lib/checkoutCart";

export const dynamic = "force-dynamic";

function buildGenericGatewayUrl(
  baseUrl: string | null | undefined,
  orderId: string,
  amountCents: number,
  currency: string
): string | null {
  if (!baseUrl?.trim()) return null;
  try {
    const u = new URL(baseUrl.trim());
    u.searchParams.set("ref", orderId);
    u.searchParams.set("amountCents", String(amountCents));
    u.searchParams.set("currency", currency);
    return u.toString();
  } catch {
    return null;
  }
}

export default async function ShopAlternateCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });
  if (!order || order.status !== "awaiting_payment") notFound();

  const settings = await getSettings();
  const t = await getT();
  const intl = intlLocale(await getLocale());

  const kpayUrl =
    order.paymentProvider === "kpay_alipay"
      ? buildKpayCheckoutUrl(
          settings.kpayAlipayBaseUrl,
          order.id,
          order.amountTotalCents,
          order.currency
        )
      : null;

  const genericUrl =
    order.paymentProvider === "generic_gateway"
      ? buildGenericGatewayUrl(
          settings.genericGatewayBaseUrl,
          order.id,
          order.amountTotalCents,
          order.currency
        )
      : null;

  const genericLabel = settings.genericGatewayLabel?.trim() || t("checkout.alt.methodGeneric");

  let cartItems: CartSnapshotItem[] = [];
  try {
    cartItems = JSON.parse(order.itemsJson) as CartSnapshotItem[];
  } catch {
    cartItems = [];
  }

  const whatsappDigits = normalizeWhatsAppDigits(settings.whatsappCheckoutNumber);
  const whatsappUrl =
    order.paymentProvider === "whatsapp" && whatsappDigits
      ? buildWhatsAppMeUrl(
          whatsappDigits,
          buildShopOrderWhatsAppMessage({
            orderId: order.id,
            amountTotalCents: order.amountTotalCents,
            currency: order.currency,
            email: order.email,
            name: order.customer?.name ?? null,
            phone: order.customer?.phone ?? null,
            items: cartItems,
          })
        )
      : null;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8 px-4">
      <h1 className="font-serif text-2xl">{t("checkout.alt.title")}</h1>
      <p className="text-sm text-gray-600">{t("checkout.alt.intro")}</p>
      <p className="text-sm text-gray-600">{t("checkout.altPendingNote")}</p>

      <div className="bg-white border border-brand-100 rounded-lg p-4 text-sm space-y-2">
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">{t("checkout.alt.ref")}</span>
          <code className="text-xs break-all">{order.id}</code>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">{t("checkout.alt.amount")}</span>
          <span>{formatPrice(order.amountTotalCents, order.currency, intl)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">{t("checkout.alt.method")}</span>
          <span>
            {order.paymentProvider === "bank_fps"
              ? t("checkout.alt.methodBank")
              : order.paymentProvider === "kpay_alipay"
                ? t("checkout.alt.methodKpay")
                : order.paymentProvider === "whatsapp"
                  ? t("checkout.alt.methodWhatsapp")
                  : order.paymentProvider === "generic_gateway"
                    ? genericLabel
                    : t("checkout.alt.methodStripe")}
          </span>
        </div>
      </div>

      {order.paymentProvider === "bank_fps" && settings.bankFpsInstructions ? (
        <div
          className="text-sm text-gray-800 max-w-none border border-brand-100 rounded-lg p-4 bg-brand-50/30 [&_a]:text-brand-600 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: settings.bankFpsInstructions }}
        />
      ) : order.paymentProvider === "bank_fps" ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">
          {t("checkout.alt.bankNotConfigured")}
        </p>
      ) : null}

      {order.paymentProvider === "kpay_alipay" && kpayUrl ? (
        <a
          href={kpayUrl}
          className="inline-flex items-center justify-center w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded transition"
          rel="noopener noreferrer"
        >
          {t("checkout.alt.openKpay")}
        </a>
      ) : order.paymentProvider === "kpay_alipay" ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">
          {t("checkout.alt.kpayNotConfigured")}
        </p>
      ) : null}

      {order.paymentProvider === "generic_gateway" && genericUrl ? (
        <a
          href={genericUrl}
          className="inline-flex items-center justify-center w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded transition"
          rel="noopener noreferrer"
        >
          {t("checkout.alt.openGenericGateway", { label: genericLabel })}
        </a>
      ) : order.paymentProvider === "generic_gateway" ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">
          {t("checkout.alt.genericGatewayNotConfigured")}
        </p>
      ) : null}

      {order.paymentProvider === "whatsapp" && whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-3 rounded transition"
        >
          {t("checkout.alt.openWhatsapp")}
        </a>
      ) : order.paymentProvider === "whatsapp" ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">
          {t("checkout.alt.whatsappNotConfigured")}
        </p>
      ) : null}

      <p className="text-xs text-gray-500">{t("checkout.alt.footerNote")}</p>

      <Link href="/" className="text-sm text-brand-600 hover:underline block">
        {t("checkout.alt.backHome")}
      </Link>
    </div>
  );
}
