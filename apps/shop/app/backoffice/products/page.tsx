import { prisma, sortCategoriesForDisplay } from "@lumiere/db";
import { ProductsAdmin } from "@/components/backoffice/ProductsAdmin";
import { DataTransferControls } from "@/components/backoffice/DataTransferControls";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categoriesRaw] = await Promise.all([
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
  const categories = sortCategoriesForDisplay(categoriesRaw);
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DataTransferControls
          exportHref="/api/backoffice/products/export"
          importHref="/api/backoffice/products/import"
        />
      </div>
      <ProductsAdmin initialProducts={products} categories={categories} />
    </div>
  );
}
