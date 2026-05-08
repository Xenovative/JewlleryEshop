import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@lumiere/db";
import { ProductCard } from "@/components/ProductCard";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  const t = await getT();
  const base = t("search.title");
  if (term) return { title: `"${term}" · ${base}` };
  return { title: base };
}

export default async function ShopSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await enforceShopFrontendEnabled();
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const t = await getT();
  const locale = await getLocale();

  const products =
    q ?
      await prisma.product.findMany({
        where: {
          buyable: true,
          OR: [{ name: { contains: q } }, { description: { contains: q } }],
        },
        orderBy: [
          { featured: "desc" },
          { position: "asc" },
          { createdAt: "desc" },
        ],
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          {t("search.backHome")}
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-700 mt-4">{t("search.title")}</h1>
      </div>

      {!q ? (
        <p className="text-gray-600 max-w-xl">{t("search.prompt")}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">{t("search.noResults", { q })}</p>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            {t("search.showingFor", { q, n: products.length })}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} locale={intlLocale(locale)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
