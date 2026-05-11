import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n.server";
import { enforceRentalFrontendEnabled } from "@/lib/frontendMode";
import type { DictKey } from "@/lib/i18n";

const STEP_KEYS: Array<[DictKey, DictKey]> = [
  ["how.s1", "how.s1.body"],
  ["how.s2", "how.s2.body"],
  ["how.s3", "how.s3.body"],
  ["how.s4", "how.s4.body"],
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: `${t("how.title")} · ${t("rental.title")}`,
    description: t("how.subtitle"),
  };
}

export default async function HowItWorksPage() {
  await enforceRentalFrontendEnabled();
  const t = await getT();

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-50/80 to-transparent"
      />
      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16 lg:py-20">
        <header className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600/90 mb-2">
            {t("brand.tagline")}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-brand-900 tracking-tight">
            {t("how.title")}
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
            {t("how.subtitle")}
          </p>
        </header>

        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 list-none p-0 m-0">
          {STEP_KEYS.map(([titleKey, bodyKey], i) => (
            <li key={titleKey}>
              <article
                className="group h-full flex flex-col bg-white border border-brand-100 rounded-xl p-6 md:p-7 shadow-sm transition duration-200 hover:border-brand-200/80 hover:shadow-md"
                aria-labelledby={`how-step-${i + 1}-title`}
              >
                <div className="flex gap-4">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 font-serif text-xl text-brand-700 tabular-nums group-hover:bg-brand-100/80 group-hover:border-brand-200 transition-colors"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2
                      id={`how-step-${i + 1}-title`}
                      className="font-serif text-lg md:text-xl text-brand-900 leading-snug"
                    >
                      {t(titleKey)}
                    </h2>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {t(bodyKey)}
                    </p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/browse"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {t("how.browseCta")}
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-brand-700 underline-offset-4 hover:underline"
          >
            {t("browse.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
