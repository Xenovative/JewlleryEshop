import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Link from "next/link";
import { I18nProvider } from "@/components/I18nProvider";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ProductSearchBar } from "@/components/ProductSearchBar";
import { getLocale, getT } from "@/lib/i18n.server";
import { getSettings } from "@lumiere/db";

export const metadata: Metadata = {
  title: "Lumière Rentals",
  description: "Rent fine jewellery for any occasion.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getT();
  const settings = await getSettings();
  const shopUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const backofficeUrl = `${shopUrl.replace(/\/$/, "")}/backoffice`;
  return (
    <html lang={locale === "en" ? "en" : locale}>
      <body className="min-h-screen flex flex-col">
        <I18nProvider locale={locale}>
          <header className="border-b border-brand-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href="/" className="font-serif text-2xl text-brand-700 min-w-0">
                  {t("brand.name")}{" "}
                  <span className="text-brand-500 text-base">{t("brand.tagline")}</span>
                </Link>
                {(settings.shopEnabled || settings.rentalEnabled) && (
                  <div className="hidden md:flex items-center gap-2 text-xs shrink-0">
                    {settings.shopEnabled && (
                      <a
                        href={shopUrl}
                        className="px-2 py-1 rounded border border-brand-200 text-brand-700 hover:bg-brand-50"
                      >
                        Shop
                      </a>
                    )}
                    {settings.rentalEnabled && (
                      <span className="px-2 py-1 rounded bg-brand-600 text-white">Rental</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center">
                  <Link href="/browse" className="hover:text-brand-600">
                    {t("nav.browse")}
                  </Link>
                  <Link href="/how-it-works" className="hover:text-brand-600">
                    {t("nav.howItWorks")}
                  </Link>
                  {settings.shopEnabled && (
                    <a
                      href={shopUrl}
                      className="hover:text-brand-600"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("nav.buyAt")}
                    </a>
                  )}
                  <LangSwitcher />
                </nav>
                <Suspense
                  fallback={
                    <div className="w-full md:flex-1 md:max-w-md md:ml-auto h-10 rounded-lg bg-brand-50 border border-brand-100 animate-pulse" />
                  }
                >
                  <ProductSearchBar action="/browse" className="w-full md:flex-1 md:max-w-md md:ml-auto" />
                </Suspense>
              </div>
            </div>
          </header>
          <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
          <footer className="border-t border-brand-100 mt-12">
            <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500 flex justify-between">
              <span>
                © {new Date().getFullYear()} {t("footer.copyright")}
              </span>
              <a href={backofficeUrl} className="hover:text-brand-600">
                {t("nav.admin")}
              </a>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
