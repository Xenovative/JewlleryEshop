import { redirect } from "next/navigation";
import { prisma, getSettings } from "@lumiere/db";
import { normalizeWhatsAppDigits } from "@/lib/whatsappBookingMessage";
import { dayDiff, fromIsoDate, isoDate } from "@/lib/format";
import { getT } from "@/lib/i18n.server";
import { enforceRentalFrontendEnabled } from "@/lib/frontendMode";
import { CheckoutReviewClient } from "@/components/CheckoutReviewClient";

export const dynamic = "force-dynamic";

export default async function RentCheckoutReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  await enforceRentalFrontendEnabled();
  const t = await getT();
  const { bookingId } = await searchParams;
  if (!bookingId) redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { product: true },
  });
  if (!booking || booking.status !== "pending") redirect("/");

  const pickupSlot = isoDate(booking.startDate);

  const returnSlot =
    booking.returnSlot != null
      ? booking.returnSlot.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const planDays = dayDiff(
    fromIsoDate(isoDate(booking.startDate)),
    fromIsoDate(isoDate(booking.endDate))
  );

  const settings = await getSettings();
  const whatsappCheckoutEnabled = !!normalizeWhatsAppDigits(settings.whatsappCheckoutNumber);

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="font-serif text-2xl mb-2">{t("review.title")}</h1>
      <p className="text-sm text-gray-600 mb-3">{t("review.subtitle")}</p>
      <div className="mb-6 rounded-lg border border-brand-100 bg-brand-50/50 p-3 text-sm text-gray-700 leading-relaxed">
        {t("review.paymentMethodsNote")}
      </div>
      <CheckoutReviewClient
        bookingId={booking.id}
        whatsappCheckoutEnabled={whatsappCheckoutEnabled}
        productName={booking.product.name}
        startDate={isoDate(booking.startDate)}
        endDate={isoDate(booking.endDate)}
        rentalPlanTier={booking.rentalPlanTier}
        planDays={planDays}
        rentalCents={booking.rentalCents}
        depositCents={booking.depositCents}
        totalCents={booking.totalCents}
        pickupSlot={pickupSlot}
        returnSlot={returnSlot}
        customerName={booking.customerName}
        customerPhone={booking.customerPhone ?? ""}
        email={booking.email}
      />
    </div>
  );
}
