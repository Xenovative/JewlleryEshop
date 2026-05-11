import Link from "next/link";
import { safeHref } from "@/lib/homepageConfig";

type Props = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  defaultHref: string;
  variant?: "default" | "rental";
};

export function CtaBannerSection({
  title,
  body,
  ctaLabel,
  ctaHref,
  defaultHref,
  variant = "default",
}: Props) {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  const cleanCtaLabel = ctaLabel.trim();
  if (!cleanTitle && !cleanBody && !cleanCtaLabel) return null;
  const isRental = variant === "rental";
  const wrap = isRental
    ? "bg-gradient-to-r from-brand-700 to-brand-900 text-white"
    : "bg-brand-50 text-brand-900";
  const btn = isRental
    ? "bg-white text-brand-800 hover:bg-brand-50"
    : "bg-brand-700 text-white hover:bg-brand-800";
  const bodyClass = isRental ? "text-brand-50/85" : "text-gray-700";
  return (
    <section
      className={`rounded-2xl px-8 py-10 md:px-12 md:py-12 border border-brand-100 motion-safe:animate-fade-in-soft transition-shadow duration-500 ease-out hover:shadow-md motion-reduce:hover:shadow-none ${wrap}`}
    >
      <div className="grid md:grid-cols-[1fr_auto] items-center gap-6">
        <div>
          {cleanTitle && (
            <h2 className="font-serif text-2xl md:text-3xl leading-tight">{cleanTitle}</h2>
          )}
          {cleanBody && (
            <p className={`mt-3 text-sm md:text-base leading-relaxed max-w-2xl ${bodyClass}`}>
              {cleanBody}
            </p>
          )}
        </div>
        {cleanCtaLabel && (
          <Link
            href={safeHref(ctaHref, defaultHref)}
            className={`inline-flex justify-center items-center px-6 py-3 rounded font-medium transition-all duration-200 ease-out motion-reduce:transition-colors active:scale-[0.98] motion-reduce:active:scale-100 whitespace-nowrap ${btn}`}
          >
            {cleanCtaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
