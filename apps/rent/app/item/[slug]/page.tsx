import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, getSettings } from "@lumiere/db";
import { BookingForm } from "@/components/BookingForm";
import { ItemGallery } from "@/components/ItemGallery";
import type { DictKey } from "@/lib/i18n";
import { getT } from "@/lib/i18n.server";
import { enforceRentalFrontendEnabled } from "@/lib/frontendMode";

export const dynamic = "force-dynamic";

const CAT_KEYS: Record<string, DictKey> = {
  rings: "nav.rings",
  necklaces: "nav.necklaces",
  earrings: "nav.earrings",
  bracelets: "nav.bracelets",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      imageUrl: true,
    },
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

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await enforceRentalFrontendEnabled();
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!product || !product.rentable) notFound();

  const settings = await getSettings();
  const t = await getT();
  const catKey = CAT_KEYS[product.category.slug];
  const catLabel = catKey ? t(catKey) : product.category.name;
  return (
    <div className="grid md:grid-cols-2 gap-10">
      <ItemGallery
        hero={{ url: product.imageUrl, alt: product.name }}
        images={product.images}
      />

      <div>
        <span className="inline-block text-xs uppercase tracking-wide px-2 py-1 rounded bg-brand-50 text-brand-700 border border-brand-100 mb-2">
          Rental
        </span>
        <p className="text-sm text-brand-600">
          <Link
            href={`/browse?category=${encodeURIComponent(product.category.slug)}`}
            className="hover:underline"
          >
            {catLabel}
          </Link>
        </p>
        <h1 className="font-serif text-3xl mt-1">{product.name}</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {product.material && (
            <>
              <dt className="text-gray-500">{t("item.material")}</dt>
              <dd>{product.material}</dd>
            </>
          )}
          {product.gemstone && (
            <>
              <dt className="text-gray-500">{t("item.gemstone")}</dt>
              <dd>{product.gemstone}</dd>
            </>
          )}
        </dl>

        <div className="mt-8">
          {product.rentCopiesCount > 0 ? (
            <BookingForm
              productId={product.id}
              productName={product.name}
              sellPriceCents={product.priceCents}
              rental4DayPercentOfPrice={settings.rental4DayPercentOfPrice}
              rental7DayPercentOfPrice={settings.rental7DayPercentOfPrice}
              rentalDepositPercentOfPrice={settings.rentalDepositPercentOfPrice}
            />
          ) : (
            <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              {t("item.noCopiesYet")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
