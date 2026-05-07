import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@lumiere/db";
import { BookingForm } from "@/components/BookingForm";
import { ItemGallery } from "@/components/ItemGallery";
import { getT } from "@/lib/i18n.server";
import { enforceRentalFrontendEnabled } from "@/lib/frontendMode";

export const dynamic = "force-dynamic";

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
      rentalTiers: { orderBy: { days: "asc" } },
      category: true,
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!product || !product.rentable) notFound();

  const t = await getT();
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
        <p className="text-sm text-brand-600">{product.category.name}</p>
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
          <BookingForm
            productId={product.id}
            productName={product.name}
            currency={product.currency}
            pricingType={product.rentPricingType ?? ""}
            rentDailyCents={product.rentDailyCents}
            rentFixedCents={product.rentFixedCents}
            rentFixedDurationDays={product.rentFixedDurationDays}
            tiers={product.rentalTiers.map((t) => ({
              days: t.days,
              priceCents: t.priceCents,
              label: t.label,
            }))}
            waiverFeeCents={product.waiverFeeCents}
          />
        </div>
      </div>
    </div>
  );
}
