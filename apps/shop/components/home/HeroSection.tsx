import Link from "next/link";
import { safeHref, type HeroConfig } from "@/lib/homepageConfig";

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
  const imageUrl = hero.imageUrl?.trim();

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
      className={`rounded-2xl overflow-hidden ${wrapperBg} shadow-sm border border-brand-100/60`}
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
                  className={`inline-flex items-center px-6 py-3 rounded font-medium transition ${primaryBtn}`}
                >
                  {primaryLabel}
                </Link>
              )}
              {secondaryLabel.trim() && (
                <Link
                  href={secondaryHref}
                  className={`inline-flex items-center px-6 py-3 rounded font-medium transition ${secondaryBtn}`}
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
                className="absolute inset-0 w-full h-full object-cover"
              />
            </>
          ) : (
            <DecorativeMonogram tone={isRental ? "light" : "dark"} />
          )}
        </div>
      </div>
    </section>
  );
}

function DecorativeMonogram({ tone }: { tone: "light" | "dark" }) {
  const stroke = tone === "light" ? "rgba(255,255,255,0.45)" : "rgba(135,86,42,0.35)";
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.6" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#heroGlow)" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="120"
        fill={stroke}
        opacity="0.55"
      >
        L
      </text>
    </svg>
  );
}
