import { NextResponse } from "next/server";
import { z } from "zod";
import {
  prisma,
  upsertCustomerByEmail,
  getSettings,
  CHECKOUT_CURRENCY,
} from "@lumiere/db";
import { fromIsoDate, isoDate } from "@/lib/format";
import { quoteRetailPlan } from "@/lib/rentalPlanPricing";

const Body = z.object({
  productId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  planDays: z.union([z.literal(4), z.literal(7)]),
  email: z.string().email(),
  customerName: z.string().min(1),
  pickupSlot: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const settings = await getSettings();
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });
  if (!product || !product.rentable) {
    return NextResponse.json({ error: "Item not available" }, { status: 404 });
  }

  const start = fromIsoDate(data.startDate);
  if (start < fromIsoDate(isoDate(new Date()))) {
    return NextResponse.json({ error: "Start cannot be in the past" }, { status: 400 });
  }

  const q = quoteRetailPlan(
    product.priceCents,
    data.planDays,
    settings.rental4DayPercentOfPrice,
    settings.rental7DayPercentOfPrice,
    start
  );
  if (!q.ok) return NextResponse.json({ error: q.error }, { status: 400 });

  const finalEnd = q.endDate;

  const overlapping = await prisma.booking.count({
    where: {
      productId: product.id,
      status: { in: ["pending", "confirmed", "active"] },
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
      fulfillment: "pickup",
      email: data.email,
      customerName: data.customerName,
      customerId,
      shippingAddressJson: null,
      pickupSlot: new Date(data.pickupSlot),
      waiverIncluded: false,
      waiverFeeCents: 0,
      rentalCents: q.rentalCents,
      totalCents: q.rentalCents,
      currency: CHECKOUT_CURRENCY,
    },
  });

  return NextResponse.json({ bookingId: booking.id });
}
