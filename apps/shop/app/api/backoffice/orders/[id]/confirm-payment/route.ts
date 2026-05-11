import { NextResponse } from "next/server";
import { prisma, decrementStockForCartLines } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { sendAdminSms } from "@/lib/sms";

type CartLine = {
  productId: string;
  variantId?: string;
  name?: string;
  qty: number;
  priceCents?: number;
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order || order.status !== "awaiting_payment") {
        throw new Error("INVALID");
      }
      let cart: CartLine[] = [];
      try {
        cart = JSON.parse(order.itemsJson) as CartLine[];
      } catch {
        cart = [];
      }
      const lines = cart.map((c) => ({
        productId: c.productId,
        variantId: c.variantId,
        qty: c.qty,
      }));

      await tx.order.update({
        where: { id },
        data: { status: "paid" },
      });
      await decrementStockForCartLines(tx, lines);
    });
  } catch (e) {
    if ((e as Error).message === "INVALID") {
      return NextResponse.json(
        { error: "Order not found or not awaiting payment" },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Confirm failed" }, { status: 500 });
  }

  await audit(user, "update", "Order", id, { status: "awaiting_payment" }, {
    status: "paid",
    action: "confirm_alternate_payment",
  });

  // guarded: fetch order details for SMS; fire-and-forget
  const orderForSms = await prisma.order.findUnique({
    where: { id },
    select: { amountTotalCents: true, currency: true, email: true },
  });
  if (orderForSms) {
    setImmediate(() => {
      sendAdminSms({
        type: "order_paid",
        orderId: id,
        amountCents: orderForSms.amountTotalCents,
        currency: orderForSms.currency,
        email: orderForSms.email,
      }).catch((smsErr) => console.error("Admin SMS failed for confirmed order:", smsErr));
    });
  }

  return NextResponse.json({ ok: true });
}
