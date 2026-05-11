import { NextResponse } from "next/server";
import { prisma, upsertCustomerByEmail } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { sendAdminSms } from "@/lib/sms";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (
    !booking ||
    booking.status !== "pending" ||
    booking.stripeSessionId ||
    (booking.paymentProvider !== "bank_fps" &&
      booking.paymentProvider !== "kpay_alipay")
  ) {
    return NextResponse.json(
      { error: "Booking not eligible for manual confirmation" },
      { status: 400 }
    );
  }

  let customerId: string | undefined;
  try {
    customerId = await upsertCustomerByEmail({
      email: booking.email,
      name: booking.customerName,
      phone: booking.customerPhone ?? null,
    });
  } catch (e) {
    console.error("Customer upsert failed", e);
  }

  await prisma.booking.update({
    where: { id },
    data: {
      status: "confirmed",
      ...(customerId ? { customerId } : {}),
    },
  });

  await audit(user, "update", "Booking", id, { status: "pending" }, {
    status: "confirmed",
    action: "confirm_alternate_payment",
    paymentProvider: booking.paymentProvider,
  });

  // guarded: fire-and-forget SMS with already-fetched booking details
  setImmediate(() => {
    sendAdminSms({
      type: "booking_confirmed",
      bookingId: id,
      amountCents: booking.totalCents,
      currency: booking.currency,
      email: booking.email,
      customerName: booking.customerName,
    }).catch((smsErr) => console.error("Admin SMS failed for confirmed booking:", smsErr));
  });

  return NextResponse.json({ ok: true });
}
