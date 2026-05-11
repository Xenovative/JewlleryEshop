import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { sendAdminSms } from "@/lib/sms";

const Body = z.object({
  status: z.enum(["pending", "confirmed", "active", "returned", "canceled"]),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const before = await prisma.booking.findUnique({
    where: { id },
    select: { status: true, email: true, customerName: true },
  });
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    await audit(
      user,
      "update",
      "Booking",
      id,
      before,
      { status: parsed.data.status }
    );

    // guarded: notify on meaningful status changes only
    if (before && before.status !== parsed.data.status) {
      setImmediate(() => {
        sendAdminSms({
          type: "booking_status_changed",
          bookingId: id,
          oldStatus: before.status,
          newStatus: parsed.data.status,
          email: before.email ?? "",
          customerName: before.customerName ?? "",
        }).catch((smsErr) => console.error("Admin SMS failed for booking status change:", smsErr));
      });
    }

    return NextResponse.json(booking);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}
