import { prisma } from "@lumiere/db";
import { BookingsAdmin } from "@/components/backoffice/BookingsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const bookings = await prisma.booking.findMany({
    where: status ? { status } : undefined,
    orderBy: { startDate: "asc" },
    include: { product: true },
  });
  return (
    <BookingsAdmin
      initial={bookings.map((b) => ({
        id: b.id,
        status: b.status,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        email: b.email,
        productName: b.product.name,
        fulfillment: b.fulfillment,
        totalCents: b.totalCents,
        currency: b.currency,
        waiverIncluded: b.waiverIncluded,
      }))}
      currentStatus={status ?? ""}
    />
  );
}
