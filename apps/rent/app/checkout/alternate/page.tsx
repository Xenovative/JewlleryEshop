import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, getSettings, buildKpayCheckoutUrl } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { getT, getLocale } from "@/lib/i18n.server";
import { intlLocale } from "@/lib/i18n";
import { enforceRentalFrontendEnabled } from "@/lib/frontendMode";

export const dynamic = "force-dynamic";

export default async function RentAlternateCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  await enforceRentalFrontendEnabled();
  const { bookingId } = await searchParams;
  if (!bookingId) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { product: true },
  });
  if (
    !booking ||
    booking.status !== "pending" ||
    (booking.paymentProvider !== "bank_fps" &&
      booking.paymentProvider !== "kpay_alipay")
  ) {
    notFound();
  }

  const settings = await getSettings();
  const t = await getT();
  const intl = intlLocale(await getLocale());
  const kpayUrl =
    booking.paymentProvider === "kpay_alipay"
      ? buildKpayCheckoutUrl(
          settings.kpayAlipayBaseUrl,
          booking.id,
          booking.totalCents,
          booking.currency
        )
      : null;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8 px-4">
      <h1 className="font-serif text-2xl">{t("alt.title")}</h1>
      <p className="text-sm text-gray-600">{t("alt.intro")}</p>

      <div className="bg-white border border-brand-100 rounded-lg p-4 text-sm space-y-2">
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">{t("alt.ref")}</span>
          <code className="text-xs break-all">{booking.id}</code>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">{t("alt.amount")}</span>
          <span>{formatPrice(booking.totalCents, booking.currency, intl)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500">{t("alt.method")}</span>
          <span>
            {booking.paymentProvider === "bank_fps"
              ? t("alt.methodBank")
              : t("alt.methodKpay")}
          </span>
        </div>
        <div className="text-xs text-gray-500 pt-1">{booking.product.name}</div>
      </div>

      {booking.paymentProvider === "bank_fps" && settings.bankFpsInstructions ? (
        <div
          className="text-sm text-gray-800 max-w-none border border-brand-100 rounded-lg p-4 bg-brand-50/30 [&_a]:text-brand-600 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: settings.bankFpsInstructions }}
        />
      ) : booking.paymentProvider === "bank_fps" ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">
          {t("alt.bankNotConfigured")}
        </p>
      ) : null}

      {booking.paymentProvider === "kpay_alipay" && kpayUrl ? (
        <a
          href={kpayUrl}
          className="inline-flex items-center justify-center w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded transition"
          rel="noopener noreferrer"
        >
          {t("alt.openKpay")}
        </a>
      ) : booking.paymentProvider === "kpay_alipay" ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">
          {t("alt.kpayNotConfigured")}
        </p>
      ) : null}

      <p className="text-xs text-gray-500">{t("alt.footerNote")}</p>

      <Link href="/browse" className="text-sm text-brand-600 hover:underline block">
        {t("alt.backBrowse")}
      </Link>
    </div>
  );
}
