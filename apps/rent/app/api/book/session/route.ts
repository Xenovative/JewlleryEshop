import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getStripe, FOB_HONG_KONG_OFFICE, CHECKOUT_CURRENCY } from "@lumiere/db";
import { isoDate } from "@/lib/format";

const Body = z.object({
  bookingId: z.string().min(1),
});

export async function POST(req: Request) {
  const baseUrl = process.env.RENT_BASE_URL ?? "http://localhost:3001";
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { product: true },
  });
  if (!booking || booking.status !== "pending") {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const stripe = await getStripe();
  if (booking.stripeSessionId) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
      if (existing.status === "open" && existing.url) {
        return NextResponse.json({ url: existing.url, bookingId: booking.id });
      }
    } catch {
      /* create a new session */
    }
  }

  const desc = `${isoDate(booking.startDate)} → ${isoDate(booking.endDate)} · ${FOB_HONG_KONG_OFFICE}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CHECKOUT_CURRENCY,
            unit_amount: booking.rentalCents,
            product_data: {
              name: `Rental: ${booking.product.name}`,
              description: desc,
            },
          },
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?bookingId=${booking.id}`,
      customer_email: booking.email,
      metadata: { kind: "rental", bookingId: booking.id },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });
    return NextResponse.json({ url: session.url, bookingId: booking.id });
  } catch (e) {
    console.error("Stripe error", e);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
