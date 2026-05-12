import Link from "next/link";
import { safeHref, type HeroConfig } from "@/lib/homepageConfig";
import { resolveShopHostedMediaUrl } from "@/lib/shopMediaUrl";

type Props = {
  hero: HeroConfig;
  defaults: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  variant?: "shop" | "rental";
};

export function HeroSection({ hero, defaults, variant = "shop" }: Props) {
  const eyebrow = hero.eyebrow.trim() || defaults.eyebrow;
  const title = hero.title.trim() || defaults.title;
  const subtitle = hero.subtitle.trim() || defaults.subtitle;
  const primaryLabel = hero.primaryCtaLabel.trim() || defaults.primaryCtaLabel;
  const secondaryLabel =
    hero.secondaryCtaLabel.trim() || defaults.secondaryCtaLabel;
  const primaryHref = safeHref(hero.primaryCtaHref, defaults.primaryCtaHref);
  const secondaryHref = safeHref(hero.secondaryCtaHref, defaults.secondaryCtaHref);
  const imageUrl = resolveShopHostedMediaUrl(hero.imageUrl?.trim());

  const isRental = variant === "rental";
  const wrapperBg = isRental
    ? "bg-gradient-to-br from-brand-700 to-brand-900 text-white"
    : "bg-gradient-to-br from-brand-50 via-white to-brand-100/60 text-brand-900";
  const subtitleClass = isRental ? "text-brand-50/85" : "text-gray-600";
  const eyebrowClass = isRental
    ? "text-brand-100/80"
    : "text-brand-600";
  const primaryBtn = isRental
    ? "bg-white text-brand-800 hover:bg-brand-50"
    : "bg-brand-700 text-white hover:bg-brand-800";
  const secondaryBtn = isRental
    ? "bg-brand-100 text-brand-900 border border-brand-100 hover:bg-white"
    : "border border-brand-200 text-brand-700 hover:bg-brand-50";

  return (
    <section
      className={`rounded-2xl overflow-hidden ${wrapperBg} shadow-sm border border-brand-100/60 motion-safe:animate-fade-in-up transition-shadow duration-500 ease-out`}
    >
      <div className="grid md:grid-cols-2 items-stretch">
        <div className="px-8 py-12 md:px-12 md:py-16 flex flex-col justify-center">
          {eyebrow && (
            <p
              className={`text-xs uppercase tracking-[0.18em] font-medium ${eyebrowClass}`}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mt-3">
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-5 text-base md:text-lg leading-relaxed max-w-xl ${subtitleClass}`}>
              {subtitle}
            </p>
          )}
          {(primaryLabel.trim() || secondaryLabel.trim()) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryLabel.trim() && (
                <Link
                  href={primaryHref}
                  className={`inline-flex items-center px-6 py-3 rounded font-medium transition-all duration-200 ease-out motion-reduce:transition-colors active:scale-[0.98] motion-reduce:active:scale-100 ${primaryBtn}`}
                >
                  {primaryLabel}
                </Link>
              )}
              {secondaryLabel.trim() && (
                <Link
                  href={secondaryHref}
                  className={`inline-flex items-center px-6 py-3 rounded font-medium transition-all duration-200 ease-out motion-reduce:transition-colors active:scale-[0.98] motion-reduce:active:scale-100 ${secondaryBtn}`}
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          )}
        </div>
        <div
          className={
            "relative min-h-[280px] md:min-h-[420px] " +
            (isRental ? "bg-brand-900/40" : "bg-brand-100/60")
          }
        >
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover motion-safe:animate-fade-in duration-700 ease-out"
              />
            </>
          ) : (
            <FallbackShopLogo tone={isRental ? "light" : "dark"} />
          )}
        </div>
      </div>
    </section>
  );
}

function FallbackShopLogo({ tone }: { tone: "light" | "dark" }) {
  const ringStroke = tone === "light" ? "rgba(255,255,255,0.4)" : "rgba(135,86,42,0.35)";
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="w-56 h-56 md:w-72 md:h-72 rounded-full border overflow-hidden bg-white/90"
        style={{ borderColor: ringStroke }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/api/brand-assets/shoplogo.png"
          alt="Lumière logo"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
