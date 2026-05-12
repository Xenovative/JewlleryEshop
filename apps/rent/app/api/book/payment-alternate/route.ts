import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, getSettings } from "@lumiere/db";
import { normalizeWhatsAppDigits } from "@/lib/whatsappBookingMessage";

const Body = z.object({
  bookingId: z.string().min(1),
  method: z.enum(["bank_fps", "kpay_alipay", "whatsapp"]),
});

export async function POST(req: Request) {
  const baseUrl = process.env.RENT_BASE_URL ?? "http://localhost:3001";
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (parsed.data.method === "whatsapp") {
    const settings = await getSettings();
    if (!normalizeWhatsAppDigits(settings.whatsappCheckoutNumber)) {
      return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 400 });
    }
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
  });
  if (!booking || booking.status !== "pending") {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.stripeSessionId) {
    return NextResponse.json(
      { error: "Card checkout already started; complete or cancel it first." },
      { status: 400 }
    );
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { paymentProvider: parsed.data.method },
  });

  return NextResponse.json({
    redirectUrl: `${baseUrl}/checkout/alternate?bookingId=${encodeURIComponent(booking.id)}`,
  });
}
