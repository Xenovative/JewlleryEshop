import { prisma, getSettings } from "@lumiere/db";
import { intlLocale, type DictKey } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { parseShopHomeConfig, SHOP_HOME_DEFAULT } from "@/lib/homepageConfig";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustStripSection } from "@/components/home/TrustStripSection";
import { CategoryGridSection } from "@/components/home/CategoryGridSection";
import { ProductGridSection } from "@/components/home/ProductGridSection";
import { CtaBannerSection } from "@/components/home/CtaBannerSection";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";

export const dynamic = "force-dynamic";

const CAT_KEYS: Record<string, DictKey> = {
  rings: "nav.rings",
  necklaces: "nav.necklaces",
  earrings: "nav.earrings",
  bracelets: "nav.bracelets",
};

export default async function HomePage() {
  await enforceShopFrontendEnabled();
  const t = await getT();
  const locale = await getLocale();
  const settings = await getSettings();
  const config = parseShopHomeConfig(settings.shopHomeJson);

  const featuredOrder =
    config.featuredSource === "latest"
      ? [{ createdAt: "desc" as const }]
      : [
          { featured: "desc" as const },
          { position: "asc" as const },
          { createdAt: "desc" as const },
        ];

  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { buyable: true },
      orderBy: featuredOrder,
      take: 8,
    }),
  ]);

  const trustItems = config.trustStrip
    .map((it) => it.label.trim())
    .filter(Boolean);
  const trustFallback = [
    t("home.trust.crafted"),
    t("home.trust.shipping"),
    t("home.trust.returns"),
  ];
  const trustToShow = trustItems.length > 0 ? trustItems : trustFallback;

  const intl = intlLocale(locale);

  const sections = config.sections.filter((s) => s.enabled);

  return (
    <div className="space-y-14">
      <HeroSection
        hero={config.hero}
        defaults={{
          eyebrow: t("home.hero.eyebrow"),
          title: t("home.hero.title"),
          subtitle: t("home.hero.subtitle"),
          primaryCtaLabel: t("home.hero.primaryCta"),
          primaryCtaHref: SHOP_HOME_DEFAULT.hero.primaryCtaHref,
          secondaryCtaLabel: t("home.hero.secondaryCta"),
          secondaryCtaHref: SHOP_HOME_DEFAULT.hero.secondaryCtaHref,
        }}
        variant="shop"
      />

      {sections.map((s) => {
        switch (s.id) {
          case "trustStrip":
            return <TrustStripSection key={s.id} items={trustToShow} />;
          case "categoryGrid":
            return (
              <CategoryGridSection
                key={s.id}
                categories={categories}
                title={t("home.shopByCategory")}
                catKeyMap={CAT_KEYS}
                t={t}
              />
            );
          case "featuredProducts":
            return (
              <ProductGridSection
                key={s.id}
                title={t("home.featured")}
                subtitle={t("home.featured.subtitle")}
                products={featured}
                viewAllLabel={t("home.viewAll")}
                viewAllHref="/category/rings"
                locale={intl}
              />
            );
          case "rentalPromo":
            return (
              <CtaBannerSection
                key={s.id}
                title={config.rentalPromo.title || t("home.rentalPromo.title")}
                body={config.rentalPromo.body || t("home.rentalPromo.body")}
                ctaLabel={
                  config.rentalPromo.ctaLabel || t("home.rentalPromo.cta")
                }
                ctaHref={config.rentalPromo.ctaHref}
                defaultHref="/rental"
                variant="rental"
              />
            );
          case "ctaBanner":
            return (
              <CtaBannerSection
                key={s.id}
                title={config.ctaBanner.title || t("home.cta.title")}
                body={config.ctaBanner.body || t("home.cta.body")}
                ctaLabel={config.ctaBanner.ctaLabel || t("home.cta.button")}
                ctaHref={config.ctaBanner.ctaHref}
                defaultHref="/category/rings"
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
