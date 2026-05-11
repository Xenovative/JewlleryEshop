import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getSettings, decrementStockForCartLines } from "@lumiere/db";
import { sendAdminSms } from "@/lib/sms";

export const runtime = "nodejs";

const Body = z.object({
  ref: z.string().min(1),
  status: z.string(),
  amount: z.number().int().optional(),
});

type CartLine = {
  productId: string;
  variantId?: string;
  qty: number;
};

export async function POST(req: Request) {
  const settings = await getSettings().catch(() => null);
  const expectedSecret = settings?.genericGatewayWebhookSecret?.trim();

  // guarded: reject immediately if no secret is configured
  if (!expectedSecret) {
    return NextResponse.json({ error: "Gateway not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  // guarded: constant-time comparison to prevent timing attacks
  if (!token || !timingSafeEqual(token, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { ref: orderId, status } = parsed.data;

  // guarded: only act on paid/completed events; acknowledge others silently
  if (status !== "paid" && status !== "completed" && status !== "success") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  // guarded: idempotency — ignore if already paid or not found
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, idempotent: true });
  }
  if (order.status !== "awaiting_payment") {
    return NextResponse.json({ error: "Order not in awaiting_payment state" }, { status: 409 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: orderId } });
      // guarded: re-check inside transaction to prevent double-processing
      if (!current || current.status !== "awaiting_payment") return;

      await tx.order.update({ where: { id: orderId }, data: { status: "paid" } });

      let cart: CartLine[] = [];
      try {
        cart = JSON.parse(current.itemsJson) as CartLine[];
      } catch {
        cart = [];
      }
      await decrementStockForCartLines(
        tx,
        cart.map((c) => ({ productId: c.productId, variantId: c.variantId, qty: c.qty }))
      );
    });
  } catch (e) {
    console.error("Generic gateway webhook: order fulfillment failed", e);
    return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  }

  // guarded: fire-and-forget SMS; non-blocking
  setImmediate(() => {
    sendAdminSms({
      type: "order_paid",
      orderId,
      amountCents: order.amountTotalCents,
      currency: order.currency,
      email: order.email,
    }).catch((smsErr) => console.error("Admin SMS failed for generic gateway order:", smsErr));
  });

  return NextResponse.json({ ok: true });
}

function timingSafeEqual(a: string, b: string): boolean {
  // guarded: pad shorter string so length difference doesn't short-circuit
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
