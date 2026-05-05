import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getStripe, upsertCustomerByEmail } from "@lumiere/db";
import { fromIsoDate, isoDate } from "@/lib/format";
import { quote } from "@/lib/pricing";

const Body = z.object({
  productId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fulfillment: z.enum(["ship", "pickup"]),
  email: z.string().email(),
  customerName: z.string().min(1),
  shippingAddress: z.string().nullable().optional(),
  pickupSlot: z.string().nullable().optional(),
  waiver: z.boolean().default(false),
});

export async function POST(req: Request) {
  const baseUrl = process.env.RENT_BASE_URL ?? "http://localhost:3001";
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    include: { rentalTiers: true },
  });
  if (!product || !product.rentable) {
    return NextResponse.json({ error: "Item not available" }, { status: 404 });
  }

  const start = fromIsoDate(data.startDate);
  const end = fromIsoDate(data.endDate);
  if (start > end) {
    return NextResponse.json({ error: "End must be on/after start" }, { status: 400 });
  }
  if (start < fromIsoDate(isoDate(new Date()))) {
    return NextResponse.json({ error: "Start cannot be in the past" }, { status: 400 });
  }

  // Re-quote on the server (do not trust client price).
  const q = quote(
    {
      rentPricingType: product.rentPricingType,
      rentDailyCents: product.rentDailyCents,
      rentFixedCents: product.rentFixedCents,
      rentFixedDurationDays: product.rentFixedDurationDays,
      rentalTiers: product.rentalTiers,
    },
    start,
    end
  );
  if (!q.ok) return NextResponse.json({ error: q.error }, { status: 400 });

  // Authoritative end date (esp. for "fixed").
  const finalEnd = q.endDate;

  // Availability check: count overlapping bookings, reject if >= copies.
  const overlapping = await prisma.booking.count({
    where: {
      productId: product.id,
      status: { in: ["pending", "confirmed", "active"] },
      // Overlap = startDate <= finalEnd AND endDate >= start
      startDate: { lte: finalEnd },
      endDate: { gte: start },
    },
  });
  if (overlapping >= product.rentCopiesCount) {
    return NextResponse.json(
      { error: "Sorry, this item is fully booked for the chosen dates." },
      { status: 409 }
    );
  }

  const waiverFee =
    data.waiver && product.waiverFeeCents != null && product.waiverFeeCents > 0
      ? product.waiverFeeCents
      : 0;
  const total = q.rentalCents + waiverFee;

  const customerId = await upsertCustomerByEmail({
    email: data.email,
    name: data.customerName,
  });

  const booking = await prisma.booking.create({
    data: {
      productId: product.id,
      startDate: start,
      endDate: finalEnd,
      status: "pending",
      fulfillment: data.fulfillment,
      email: data.email,
      customerName: data.customerName,
      customerId,
      shippingAddressJson:
        data.fulfillment === "ship" && data.shippingAddress
          ? JSON.stringify({ raw: data.shippingAddress })
          : null,
      pickupSlot:
        data.fulfillment === "pickup" && data.pickupSlot
          ? new Date(data.pickupSlot)
          : null,
      waiverIncluded: waiverFee > 0,
      waiverFeeCents: waiverFee,
      rentalCents: q.rentalCents,
      totalCents: total,
      currency: product.currency,
    },
  });

  // Create Stripe Checkout Session.
  const lineItems: {
    quantity: number;
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; description?: string };
    };
  }[] = [
    {
      quantity: 1,
      price_data: {
        currency: product.currency,
        unit_amount: q.rentalCents,
        product_data: {
          name: `Rental: ${product.name}`,
          description: `${data.startDate} → ${isoDate(finalEnd)}`,
        },
      },
    },
  ];
  if (waiverFee > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: product.currency,
        unit_amount: waiverFee,
        product_data: { name: "Damage waiver" },
      },
    });
  }

  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?bookingId=${booking.id}`,
      customer_email: data.email,
      metadata: { kind: "rental", bookingId: booking.id },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });
    return NextResponse.json({ url: session.url, bookingId: booking.id });
  } catch (e) {
    console.error("Stripe error", e);
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "canceled" },
    });
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
