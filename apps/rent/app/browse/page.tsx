import type { Metadata } from "next";
import Link from "next/link";
import { prisma, getSettings } from "@lumiere/db";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import type { DictKey } from "@/lib/i18n";
import { enforceRentalFrontendEnabled } from "@/lib/frontendMode";
import { rentalPriceTeaser } from "@/lib/rentalPriceTeaser";

export const dynamic = "force-dynamic";

const CAT_KEYS: Record<string, DictKey> = {
  rings: "nav.rings",
  necklaces: "nav.necklaces",
  earrings: "nav.earrings",
  bracelets: "nav.bracelets",
  other: "nav.other",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: `${t("browse.title")} · ${t("rental.title")}`,
    description: t("browse.subtitle"),
  };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await enforceRentalFrontendEnabled();
  const t = await getT();
  const locale = await getLocale();
  const intl = intlLocale(locale);
  const { category: categorySlug, q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";

  const category =
    categorySlug?.trim() ?
      await prisma.category.findUnique({ where: { slug: categorySlug.trim() } })
    : null;

  const settings = await getSettings();
  const products = await prisma.product.findMany({
    where: {
      rentable: true,
      ...(category ? { categoryId: category.id } : {}),
      ...(q ?
        {
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        }
      : {}),
    },
    orderBy: [
      { featured: "desc" },
      { position: "asc" },
      { createdAt: "desc" },
    ],
  });

  const categoryLabel =
    category ?
      CAT_KEYS[category.slug] ? t(CAT_KEYS[category.slug]) : category.name
    : null;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          {t("browse.back")}
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-700 mt-4">
          {t("browse.title")}
        </h1>
        <p className="mt-2 text-gray-600 max-w-2xl">{t("browse.subtitle")}</p>
        {categoryLabel && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-700">
              {t("browse.inCategory", { name: categoryLabel })}
            </span>
            <Link href="/browse" className="text-brand-600 hover:underline font-medium">
              {t("browse.clearCategory")}
            </Link>
          </div>
        )}
        {q && products.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-700">{t("search.showingFor", { q, n: products.length })}</span>
            <Link
              href={category ? `/browse?category=${encodeURIComponent(category.slug)}` : "/browse"}
              className="text-brand-600 hover:underline font-medium"
            >
              {t("search.clear")}
            </Link>
          </div>
        )}
        {q && products.length === 0 && (
          <div className="mt-3">
            <Link
              href={category ? `/browse?category=${encodeURIComponent(category.slug)}` : "/browse"}
              className="text-sm text-brand-600 hover:underline font-medium"
            >
              {t("search.clear")}
            </Link>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">
          {q ? t("search.noResults", { q }) : category ? t("browse.emptyCategory") : t("browse.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/item/${p.slug}`}
              className="group block bg-white rounded-lg overflow-hidden border border-brand-100 hover:border-brand-500 transition"
            >
              <div className="aspect-square bg-brand-50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4">
                <h2 className="font-serif text-lg">{p.name}</h2>
                <p className="text-brand-700 mt-1 text-sm">
                  {rentalPriceTeaser(
                    p,
                    {
                      rental4DayPercentOfPrice: settings.rental4DayPercentOfPrice,
                      rental7DayPercentOfPrice: settings.rental7DayPercentOfPrice,
                    },
                    t,
                    intl
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
