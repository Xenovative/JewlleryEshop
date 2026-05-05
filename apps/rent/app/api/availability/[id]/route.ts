import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { addDays, isoDate, fromIsoDate } from "@/lib/format";

// Returns an array of ISO dates (YYYY-MM-DD) where the item is fully booked
// across the next ~120 days, given its rentCopiesCount.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || !product.rentable) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const today = fromIsoDate(isoDate(new Date()));
  const horizon = addDays(today, 120);

  const bookings = await prisma.booking.findMany({
    where: {
      productId: id,
      status: { in: ["pending", "confirmed", "active"] },
      endDate: { gte: today },
      startDate: { lte: horizon },
    },
    select: { startDate: true, endDate: true },
  });

  const counts = new Map<string, number>();
  for (const b of bookings) {
    let d = new Date(b.startDate);
    const end = new Date(b.endDate);
    if (d < today) d = today;
    while (d <= end && d <= horizon) {
      const key = isoDate(d);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      d = addDays(d, 1);
    }
  }

  const fullyBooked: string[] = [];
  for (const [day, count] of counts.entries()) {
    if (count >= product.rentCopiesCount) fullyBooked.push(day);
  }

  return NextResponse.json({
    fullyBooked: fullyBooked.sort(),
    copies: product.rentCopiesCount,
  });
}
