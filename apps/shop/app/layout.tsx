import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Link from "next/link";
import { CartIndicator } from "@/components/CartIndicator";
import { I18nProvider } from "@/components/I18nProvider";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ProductSearchBar } from "@/components/ProductSearchBar";
import { getLocale, getT } from "@/lib/i18n.server";
import { rentStorefrontHomeUrl } from "@/lib/rentBase";
import { getSettings } from "@lumiere/db";

export const metadata: Metadata = {
  title: "Lumière Jewellery",
  description: "Handcrafted fine jewellery.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getT();
  const settings = await getSettings();
  const rentEntryHref = rentStorefrontHomeUrl();

  return (
    <html lang={locale === "en" ? "en" : locale}>
      <body className="min-h-screen flex flex-col">
        <I18nProvider locale={locale}>
          <header className="border-b border-brand-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Link href="/" className="font-serif text-2xl text-brand-700 shrink-0">
                    {t("brand.name")}
                  </Link>
                  {(settings.shopEnabled || settings.rentalEnabled) && (
                    <div className="hidden md:flex items-center gap-2 text-xs shrink-0">
                      {settings.shopEnabled && (
                        <span className="px-2 py-1 rounded bg-brand-600 text-white">Shop</span>
                      )}
                      {settings.rentalEnabled && (
                        <a
                          href={rentEntryHref}
                          className="px-2 py-1 rounded border border-brand-200 text-brand-700 hover:bg-brand-50"
                        >
                          Rental
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <LangSwitcher />
                  <CartIndicator />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link href="/category/rings" className="hover:text-brand-600">
                    {t("nav.rings")}
                  </Link>
                  <Link href="/category/necklaces" className="hover:text-brand-600">
                    {t("nav.necklaces")}
                  </Link>
                  <Link href="/category/earrings" className="hover:text-brand-600">
                    {t("nav.earrings")}
                  </Link>
                  <Link href="/category/bracelets" className="hover:text-brand-600">
                    {t("nav.bracelets")}
                  </Link>
                  {settings.rentalEnabled && (
                    <a href={rentEntryHref} className="hover:text-brand-600 font-medium">
                      {t("nav.rental")}
                    </a>
                  )}
                </nav>
                <Suspense
                  fallback={
                    <div className="w-full lg:flex-1 lg:max-w-md lg:ml-auto h-10 rounded-lg bg-brand-50 border border-brand-100 animate-pulse" />
                  }
                >
                  <ProductSearchBar action="/search" className="w-full lg:flex-1 lg:max-w-md lg:ml-auto" />
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
              <Link href="/backoffice" className="hover:text-brand-600">
                {t("nav.admin")}
              </Link>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
