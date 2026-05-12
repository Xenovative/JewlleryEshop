import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, upsertCustomerByEmail, getWhatsappCheckoutDigits } from "@lumiere/db";
import { CHECKOUT_CURRENCY } from "@lumiere/db/commerce";
import { CheckoutItemsSchema, resolveCheckoutItems } from "@/lib/checkoutCart";
import { sendAdminSms } from "@/lib/sms";

const Body = CheckoutItemsSchema.extend({
  email: z.string().email(),
  name: z.string().max(200).optional(),
  phone: z.string().max(80).optional(),
  method: z.enum(["bank_fps", "kpay_alipay", "generic_gateway", "whatsapp"]),
});

export async function POST(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, name, phone, method, items } = parsed.data;

  if (method === "whatsapp") {
    const digits = await getWhatsappCheckoutDigits();
    if (!digits) {
      return NextResponse.json(
        { error: "whatsapp_not_configured" },
        { status: 400 }
      );
    }
  }

  const resolved = await resolveCheckoutItems(items);
  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.error },
      { status: resolved.status }
    );
  }
  const { cartSnapshot, amountTotalCents } = resolved.data;

  let customerId: string | null = null;
  try {
    customerId = await upsertCustomerByEmail({
      email,
      name: name?.trim() || null,
      phone: phone?.trim() || null,
    });
  } catch (e) {
    console.error("Customer upsert failed", e);
  }

  const order = await prisma.order.create({
    data: {
      stripeSessionId: null,
      paymentProvider: method,
      status: "awaiting_payment",
      amountTotalCents,
      currency: CHECKOUT_CURRENCY,
      email,
      itemsJson: JSON.stringify(cartSnapshot),
      ...(customerId ? { customerId } : {}),
    },
  });

  // guarded: fire-and-forget SMS; non-blocking
  setImmediate(() => {
    sendAdminSms({
      type: "order_awaiting_payment",
      orderId: order.id,
      amountCents: amountTotalCents,
      currency: CHECKOUT_CURRENCY,
      email: email ?? null,
    }).catch((smsErr: unknown) =>
      console.error("Admin SMS failed for alternate order:", smsErr)
    );
  });

  return NextResponse.json({
    orderId: order.id,
    redirectUrl: `${baseUrl}/checkout/alternate?orderId=${encodeURIComponent(order.id)}`,
  });
}
