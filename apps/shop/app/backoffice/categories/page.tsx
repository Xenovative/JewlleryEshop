import { prisma, sortCategoriesForDisplay } from "@lumiere/db";
import { CategoriesAdmin } from "@/components/backoffice/CategoriesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = sortCategoriesForDisplay(
    await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    })
  );
  return <CategoriesAdmin initial={categories} />;
}
