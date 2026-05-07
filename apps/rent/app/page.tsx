import Link from "next/link";
import { prisma } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { intlLocale, type DictKey } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { enforceRentalFrontendEnabled } from "@/lib/frontendMode";

type T = (key: DictKey, vars?: Record<string, string | number>) => string;

export const dynamic = "force-dynamic";

export default async function RentHomePage() {
  await enforceRentalFrontendEnabled();
  const t = await getT();
  const locale = await getLocale();
  const intl = intlLocale(locale);
  const products = await prisma.product.findMany({
    where: { rentable: true, rentCopiesCount: { gt: 0 } },
    include: { rentalTiers: { orderBy: { days: "asc" } } },
    orderBy: [
      { featured: "desc" },
      { position: "asc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-brand-50 rounded-lg">
        <h1 className="font-serif text-4xl md:text-5xl text-brand-700">
          {t("home.hero.title")}
        </h1>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">{t("home.hero.subtitle")}</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">{t("home.available")}</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">{t("home.empty")}</p>
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
                  <h3 className="font-serif text-lg">{p.name}</h3>
                  <p className="text-brand-700 mt-1 text-sm">
                    {priceTeaser(p, t, intl)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function priceTeaser(
  p: {
    rentPricingType: string | null;
    rentDailyCents: number | null;
    rentFixedCents: number | null;
    rentFixedDurationDays: number | null;
    rentalTiers: { days: number; priceCents: number }[];
    currency: string;
  },
  t: T,
  intl: string
): string {
  if (p.rentPricingType === "daily" && p.rentDailyCents != null) {
    return t("price.perDay", { price: formatPrice(p.rentDailyCents, p.currency, intl) });
  }
  if (p.rentPricingType === "fixed" && p.rentFixedCents != null) {
    return t("price.fixedFor", {
      price: formatPrice(p.rentFixedCents, p.currency, intl),
      days: p.rentFixedDurationDays ?? 0,
    });
  }
  if (p.rentPricingType === "tiered" && p.rentalTiers.length > 0) {
    const min = Math.min(...p.rentalTiers.map((t) => t.priceCents));
    return t("price.from", { price: formatPrice(min, p.currency, intl) });
  }
  return t("price.dash");
}

