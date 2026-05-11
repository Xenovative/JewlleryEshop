import type { Prisma } from "@prisma/client";

export type CartLineForStock = {
  productId: string;
  variantId?: string;
  qty: number;
};

export async function decrementStockForCartLines(
  tx: Prisma.TransactionClient,
  lines: CartLineForStock[]
): Promise<void> {
  for (const item of lines) {
    if (item.variantId) {
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.qty } },
      });
    } else {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }
  }
}
