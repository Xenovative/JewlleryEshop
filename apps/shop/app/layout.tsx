import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { CartIndicator } from "@/components/CartIndicator";
import { I18nProvider } from "@/components/I18nProvider";
import { LangSwitcher } from "@/components/LangSwitcher";
import { getLocale, getT } from "@/lib/i18n.server";
import { rentStorefrontHomeUrl } from "@/lib/rentBase";

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
  const rentEntryHref = rentStorefrontHomeUrl();

  return (
    <html lang={locale === "zh-Hant" ? "zh-Hant" : "en"}>
      <body className="min-h-screen flex flex-col">
        <I18nProvider locale={locale}>
          <header className="border-b border-brand-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-serif text-2xl text-brand-700">
                {t("brand.name")}
              </Link>
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-brand-600 text-white">Shop</span>
                <a
                  href={rentEntryHref}
                  className="px-2 py-1 rounded border border-brand-200 text-brand-700 hover:bg-brand-50"
                >
                  Rental
                </a>
              </div>
              <nav className="flex gap-6 text-sm">
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
                <a href={rentEntryHref} className="hover:text-brand-600 font-medium">
                  {t("nav.rental")}
                </a>
              </nav>
              <div className="flex items-center gap-3">
                <LangSwitcher />
                <CartIndicator />
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
