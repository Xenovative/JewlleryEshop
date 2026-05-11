import { NextResponse } from "next/server";
import { getStripe } from "@lumiere/db";
import { CheckoutItemsSchema, resolveCheckoutItems } from "@/lib/checkoutCart";

export async function POST(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const body = await req.json().catch(() => null);
  const parsed = CheckoutItemsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const resolved = await resolveCheckoutItems(parsed.data.items);
  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.error },
      { status: resolved.status }
    );
  }
  const { lineItems, cartSnapshot } = resolved.data;

  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: { cart: JSON.stringify(cartSnapshot) },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe error", e);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
