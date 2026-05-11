import { NextResponse } from "next/server";
import {
  prisma,
  getStripe,
  getStripeWebhookSecret,
  upsertCustomerByEmail,
  decrementStockForCartLines,
} from "@lumiere/db";
import { sendAdminSms } from "@/lib/sms";
import type Stripe from "stripe";

export const runtime = "nodejs";

type CartSnapshotItem = {
  productId: string;
  variantId?: string;
  name: string;
  qty: number;
  priceCents: number;
};

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = await getStripeWebhookSecret();
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });
  }
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("Webhook signature failed", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const kind = session.metadata?.kind;

    if (kind === "rental") {
      await handleRental(session);
    } else {
      await handleOrder(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleRental(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;
  try {
    const email = session.customer_details?.email ?? undefined;
    let customerId: string | undefined;
    if (email) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { customerName: true, customerPhone: true },
      });
      customerId = await upsertCustomerByEmail({
        email,
        name: booking?.customerName ?? null,
        phone: booking?.customerPhone ?? null,
      });
    }
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "confirmed",
        stripeSessionId: session.id,
        paymentProvider: "stripe",
        email,
        ...(customerId ? { customerId } : {}),
      },
    });

    const bookingForSms = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { totalCents: true, currency: true, customerName: true },
    });

    // guarded: fire-and-forget SMS; non-blocking
    setImmediate(() => {
      if (bookingForSms) {
        sendAdminSms({
          type: "booking_confirmed",
          bookingId: bookingId,
          amountCents: bookingForSms.totalCents,
          currency: bookingForSms.currency,
          email: email ?? "",
          customerName: bookingForSms.customerName ?? "",
        }).catch((smsErr) => console.error("Admin SMS failed for booking:", smsErr));
      }
    });
  } catch (e) {
    console.error("Booking confirm failed", e);
  }
}

async function handleOrder(session: Stripe.Checkout.Session) {
  const cartRaw = session.metadata?.cart;
  let cart: CartSnapshotItem[] = [];
  try {
    cart = cartRaw ? JSON.parse(cartRaw) : [];
  } catch {
    cart = [];
  }

  try {
    const email = session.customer_details?.email ?? null;
    let customerId: string | null = null;
    if (email) {
      customerId = await upsertCustomerByEmail({
        email,
        name: session.customer_details?.name ?? null,
        phone: session.customer_details?.phone ?? null,
      });
    }
    await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { stripeSessionId: session.id },
      });
      if (existing) return;

      await tx.order.create({
        data: {
          stripeSessionId: session.id,
          paymentProvider: "stripe",
          status: "paid",
          amountTotalCents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          email,
          itemsJson: JSON.stringify(cart),
          ...(customerId ? { customerId } : {}),
        },
      });

      await decrementStockForCartLines(
        tx,
        cart.map((c) => ({
          productId: c.productId,
          variantId: c.variantId,
          qty: c.qty,
        }))
      );
    });

    // guarded: fire-and-forget SMS; wrapped in setImmediate to avoid blocking webhook response
    setImmediate(() => {
      sendAdminSms({
        type: "order_paid",
        orderId: session.id,
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        email: session.customer_details?.email ?? null,
      }).catch((smsErr) => console.error("Admin SMS failed for order:", smsErr));
    });
  } catch (e) {
    console.error("Order persistence failed", e);
  }
}
