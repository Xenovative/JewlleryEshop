import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { intlLocale, type DictKey } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, seoTitle: true, seoDescription: true, imageUrl: true },
  });
  if (!p) return {};
  return {
    title: p.seoTitle || p.name,
    description: p.seoDescription || p.description.slice(0, 160),
    openGraph: {
      title: p.seoTitle || p.name,
      description: p.seoDescription || p.description.slice(0, 160),
      images: p.imageUrl ? [p.imageUrl] : undefined,
    },
  };
}

const CAT_KEYS: Record<string, DictKey> = {
  rings: "nav.rings",
  necklaces: "nav.necklaces",
  earrings: "nav.earrings",
  bracelets: "nav.bracelets",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await enforceShopFrontendEnabled();
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { label: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!product) notFound();

  const t = await getT();
  const locale = await getLocale();
  const totalStock = product.variants.length
    ? product.variants.reduce((n, v) => n + v.stock, 0)
    : product.stock;
  const inStock = totalStock > 0;
  const catLabel =
    CAT_KEYS[product.category.slug] && t(CAT_KEYS[product.category.slug]);

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <ProductGallery
        hero={{ url: product.imageUrl, alt: product.name }}
        images={product.images}
      />

      <div>
        <span className="inline-block text-xs uppercase tracking-wide px-2 py-1 rounded bg-brand-50 text-brand-700 border border-brand-100 mb-3">
          Shop
        </span>
        <Link
          href={`/category/${product.category.slug}`}
          className="text-sm text-brand-600 hover:underline"
        >
          ← {catLabel || product.category.name}
        </Link>
        <h1 className="font-serif text-3xl mt-2">{product.name}</h1>
        <p className="text-2xl text-brand-700 mt-2">
          {formatPrice(product.priceCents, product.currency, intlLocale(locale))}
        </p>

        <p className="mt-6 text-gray-700 leading-relaxed">{product.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {product.material && (
            <>
              <dt className="text-gray-500">{t("product.material")}</dt>
              <dd>{product.material}</dd>
            </>
          )}
          {product.gemstone && (
            <>
              <dt className="text-gray-500">{t("product.gemstone")}</dt>
              <dd>{product.gemstone}</dd>
            </>
          )}
          {product.weightGrams != null && (
            <>
              <dt className="text-gray-500">{t("product.weight")}</dt>
              <dd>{product.weightGrams} g</dd>
            </>
          )}
        </dl>

        <div className="mt-8">
          <AddToCartButton
            productId={product.id}
            variants={product.variants}
            inStock={inStock}
          />
        </div>
      </div>
    </div>
  );
}
