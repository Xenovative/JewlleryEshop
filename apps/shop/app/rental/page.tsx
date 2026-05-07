import type { Metadata } from "next";
import { prisma, getSettings } from "@lumiere/db";
import { intlLocale, type DictKey } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { formatPrice } from "@/lib/format";
import {
  parseRentalHomeConfig,
  RENTAL_HOME_DEFAULT,
} from "@/lib/homepageConfig";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustStripSection } from "@/components/home/TrustStripSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PolicyHighlightsSection } from "@/components/home/PolicyHighlightsSection";
import { CtaBannerSection } from "@/components/home/CtaBannerSection";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";
import { rentItemUrl } from "@/lib/rentBase";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("rental.title"),
    description: t("rental.metadata.description"),
  };
}

export default async function RentalHomePage() {
  await enforceShopFrontendEnabled();
  const t = await getT();
  const locale = await getLocale();
  const intl = intlLocale(locale);
  const settings = await getSettings();
  if (!settings.rentalEnabled) {
    redirect("/");
  }
  const config = parseRentalHomeConfig(settings.rentalHomeJson);

  const featuredOrder =
    config.featuredSource === "latest"
      ? [{ createdAt: "desc" as const }]
      : [
          { featured: "desc" as const },
          { position: "asc" as const },
          { createdAt: "desc" as const },
        ];

  const featured = await prisma.product.findMany({
    where: { rentable: true },
    orderBy: featuredOrder,
    take: 8,
    include: {
      rentalTiers: true,
    },
  });
  const rentableCount = await prisma.product.count({ where: { rentable: true } });
  const copiesCount = featured.reduce((acc, p) => acc + p.rentCopiesCount, 0);
  const tierCount = featured.reduce((acc, p) => acc + p.rentalTiers.length, 0);

  const trustItems = config.trustStrip
    .map((it) => it.label.trim())
    .filter(Boolean);
  const trustFallback = [
    t("rental.trust.insured"),
    t("rental.trust.delivery"),
    t("rental.trust.returns"),
  ];
  const trustToShow = trustItems.length > 0 ? trustItems : trustFallback;

  const stepDefaults = [
    { title: t("rental.steps.1.title"), body: t("rental.steps.1.body") },
    { title: t("rental.steps.2.title"), body: t("rental.steps.2.body") },
    { title: t("rental.steps.3.title"), body: t("rental.steps.3.body") },
  ];
  const stepsToShow = config.steps.map((s, i) => ({
    title: s.title.trim() || stepDefaults[i]?.title || "",
    body: s.body.trim() || stepDefaults[i]?.body || "",
  }));
  const stepsFinal =
    stepsToShow.length === 0 ? stepDefaults : stepsToShow;

  const policyDefaults = [
    {
      title: t("rental.policy.insurance.title"),
      body: t("rental.policy.insurance.body"),
    },
    {
      title: t("rental.policy.cleaning.title"),
      body: t("rental.policy.cleaning.body"),
    },
    {
      title: t("rental.policy.flexibility.title"),
      body: t("rental.policy.flexibility.body"),
    },
  ];
  const policiesToShow = config.policies.map((p, i) => ({
    title: p.title.trim() || policyDefaults[i]?.title || "",
    body: p.body.trim() || policyDefaults[i]?.body || "",
  }));
  const policiesFinal =
    policiesToShow.length === 0 ? policyDefaults : policiesToShow;

  const sections = config.sections.filter((s) => s.enabled);

  return (
    <div className="space-y-14">
      <HeroSection
        hero={config.hero}
        defaults={{
          eyebrow: t("rental.hero.eyebrow"),
          title: t("rental.hero.title"),
          subtitle: t("rental.hero.subtitle"),
          primaryCtaLabel: t("rental.hero.primaryCta"),
          primaryCtaHref: RENTAL_HOME_DEFAULT.hero.primaryCtaHref,
          secondaryCtaLabel: t("rental.hero.secondaryCta"),
          secondaryCtaHref: RENTAL_HOME_DEFAULT.hero.secondaryCtaHref,
        }}
        variant="rental"
      />

      {sections.map((s) => {
        switch (s.id) {
          case "trustStrip":
            return <TrustStripSection key={s.id} items={trustToShow} />;
          case "howItWorks":
            return (
              <HowItWorksSection
                key={s.id}
                id="howItWorks"
                title={t("rental.howItWorks.title")}
                subtitle={t("rental.howItWorks.subtitle")}
                steps={stepsFinal}
              />
            );
          case "featuredRentals":
            return (
              <section key={s.id} id="featuredRentals" className="scroll-mt-20 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <SnapshotCard
                    label={t("rental.snapshot.available")}
                    value={String(rentableCount)}
                  />
                  <SnapshotCard
                    label={t("rental.snapshot.copies")}
                    value={String(copiesCount)}
                  />
                  <SnapshotCard
                    label={t("rental.snapshot.tiers")}
                    value={String(tierCount)}
                  />
                </div>

                <div>
                  <h2 className="font-serif text-2xl md:text-3xl">
                    {t("rental.featured.title")}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                    {t("rental.featured.subtitle")}
                  </p>
                </div>

                {featured.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">{t("rental.featured.empty")}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featured.map((p) => (
                      <article
                        key={p.id}
                        className="bg-white border border-brand-100 rounded-xl p-4 hover:border-brand-300 transition"
                      >
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-brand-50 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-lg leading-tight">{p.name}</h3>
                            <p className="text-sm text-brand-700 mt-1">
                              {rentalPriceText(p, t, intl)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                              <span className="px-2 py-1 rounded bg-brand-50 border border-brand-100">
                                {p.rentCopiesCount} copies
                              </span>
                              <span className="px-2 py-1 rounded bg-brand-50 border border-brand-100">
                                {p.rentalTiers.length} tiers
                              </span>
                            </div>
                            <a
                              href={rentItemUrl(p.slug)}
                              className="inline-block mt-3 text-sm font-medium text-brand-700 hover:underline"
                            >
                              {t("rental.card.view")} →
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          case "policyHighlights":
            return (
              <PolicyHighlightsSection
                key={s.id}
                title={t("rental.policies.title")}
                subtitle={t("rental.policies.subtitle")}
                policies={policiesFinal}
              />
            );
          case "ctaBanner":
            return (
              <CtaBannerSection
                key={s.id}
                title={config.ctaBanner.title || t("rental.cta.title")}
                body={config.ctaBanner.body || t("rental.cta.body")}
                ctaLabel={config.ctaBanner.ctaLabel || t("rental.cta.button")}
                ctaHref={config.ctaBanner.ctaHref}
                defaultHref="#featuredRentals"
                variant="rental"
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-brand-100 rounded-lg px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-2xl font-serif text-brand-700 mt-1">{value}</div>
    </div>
  );
}

function rentalPriceText(
  product: {
    priceCents: number;
    rentPricingType: string | null;
    rentDailyCents: number | null;
    rentFixedCents: number | null;
    rentFixedDurationDays: number | null;
    rentalTiers: { priceCents: number }[];
    currency: string;
  },
  t: (key: DictKey, vars?: Record<string, string | number>) => string,
  locale: string
) {
  if (product.rentPricingType === "fixed" && product.rentFixedCents) {
    return t("rental.card.fixed", {
      days: product.rentFixedDurationDays ?? 1,
      price: formatPrice(product.rentFixedCents, product.currency, locale),
    });
  }
  if (product.rentPricingType === "daily" && product.rentDailyCents) {
    return t("rental.card.daily", {
      price: formatPrice(product.rentDailyCents, product.currency, locale),
    });
  }
  const tierMin =
    product.rentalTiers.length > 0
      ? Math.min(...product.rentalTiers.map((x) => x.priceCents))
      : null;
  const base = tierMin ?? product.rentDailyCents ?? product.priceCents;
  return t("rental.card.from", {
    price: formatPrice(base, product.currency, locale),
  });
}
