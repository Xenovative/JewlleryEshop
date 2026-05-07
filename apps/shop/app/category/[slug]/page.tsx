import { notFound } from "next/navigation";
import { prisma } from "@lumiere/db";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import { intlLocale, type DictKey } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";

export const dynamic = "force-dynamic";

const CAT_KEYS: Record<string, DictKey> = {
  rings: "nav.rings",
  necklaces: "nav.necklaces",
  earrings: "nav.earrings",
  bracelets: "nav.bracelets",
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  await enforceShopFrontendEnabled();
  const { slug } = await params;
  const { sort } = await searchParams;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const t = await getT();
  const locale = await getLocale();

  const orderBy =
    sort === "price-asc"
      ? [{ priceCents: "asc" as const }]
      : sort === "price-desc"
        ? [{ priceCents: "desc" as const }]
        : [
            { featured: "desc" as const },
            { position: "asc" as const },
            { createdAt: "desc" as const },
          ];

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, buyable: true },
    orderBy,
  });

  const titleKey = CAT_KEYS[category.slug];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">
          {titleKey ? t(titleKey) : category.name}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t("category.sortLabel")}</span>
          <SortSelect value={sort ?? ""} />
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">{t("category.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} locale={intlLocale(locale)} />
          ))}
        </div>
      )}
    </div>
  );
}
