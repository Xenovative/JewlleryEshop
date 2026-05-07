import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { I18nProvider } from "@/components/I18nProvider";
import { LangSwitcher } from "@/components/LangSwitcher";
import { getLocale, getT } from "@/lib/i18n.server";

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
  const shopUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return (
    <html lang={locale === "zh-Hant" ? "zh-Hant" : "en"}>
      <body className="min-h-screen flex flex-col">
        <I18nProvider locale={locale}>
          <header className="border-b border-brand-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-serif text-2xl text-brand-700">
                {t("brand.name")}{" "}
                <span className="text-brand-500 text-base">{t("brand.tagline")}</span>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-xs">
                <a
                  href={shopUrl}
                  className="px-2 py-1 rounded border border-brand-200 text-brand-700 hover:bg-brand-50"
                >
                  Shop
                </a>
                <span className="px-2 py-1 rounded bg-brand-600 text-white">Rental</span>
              </div>
              <nav className="flex gap-6 text-sm items-center">
                <Link href="/" className="hover:text-brand-600">
                  {t("nav.browse")}
                </Link>
                <Link href="/how-it-works" className="hover:text-brand-600">
                  {t("nav.howItWorks")}
                </Link>
                <a
                  href={shopUrl}
                  className="hover:text-brand-600"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("nav.buyAt")}
                </a>
                <LangSwitcher />
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
          <footer className="border-t border-brand-100 mt-12">
            <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500">
              © {new Date().getFullYear()} {t("footer.copyright")}
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
