import { prisma } from "@lumiere/db";
import { ProductsAdmin } from "@/components/backoffice/ProductsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        variants: true,
        rentalTiers: true,
        images: { orderBy: { position: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <ProductsAdmin initialProducts={products} categories={categories} />;
}
