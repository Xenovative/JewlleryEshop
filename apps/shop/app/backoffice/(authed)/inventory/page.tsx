import { prisma } from "@lumiere/db";
import { InventoryAdmin } from "@/components/backoffice/InventoryAdmin";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [products, copies, activeBookings] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { label: "asc" } }, category: true },
    }),
    prisma.rentalCopy.findMany({
      orderBy: [{ productId: "asc" }, { label: "asc" }],
      include: { product: { select: { name: true, slug: true, currency: true } } },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ["confirmed", "active"] },
        startDate: { lte: tomorrow },
        endDate: { gte: today },
      },
      include: { product: { select: { name: true } } },
    }),
  ]);

  return (
    <InventoryAdmin
      tab={tab === "copies" ? "copies" : "stock"}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category.name,
        currency: p.currency,
        priceCents: p.priceCents,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        rentable: p.rentable,
        variants: p.variants.map((v) => ({
          id: v.id,
          label: v.label,
          stock: v.stock,
          sku: v.sku,
        })),
      }))}
      copies={copies.map((c) => ({
        id: c.id,
        productId: c.productId,
        productName: c.product.name,
        label: c.label,
        status: c.status,
        notes: c.notes,
      }))}
      activeBookingsByProduct={activeBookings.reduce<
        Record<string, { id: string; customerName: string; endDate: string }[]>
      >((acc, b) => {
        (acc[b.productId] ??= []).push({
          id: b.id,
          customerName: b.customerName,
          endDate: b.endDate.toISOString(),
        });
        return acc;
      }, {})}
    />
  );
}
