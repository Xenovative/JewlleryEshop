import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Link from "next/link";
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { I18nProvider } from "@/components/I18nProvider";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ProductSearchBar } from "@/components/ProductSearchBar";
import { getLocale, getT } from "@/lib/i18n.server";
import { getSettings } from "@lumiere/db";

export const metadata: Metadata = {
  title: "Lumière By Dynasty Rentals",
  description: "Rent fine jewellery for any occasion.",
  icons: {
    icon: [
      { url: "/api/brand-assets/favicon.ico" },
      {
        url: "/api/brand-assets/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/api/brand-assets/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: [{ url: "/api/brand-assets/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/api/brand-assets/favicon.ico"],
  },
  manifest: "/api/brand-assets/site.webmanifest",
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
  const address = t("footer.contact.address");
  const phone = t("footer.contact.phone");
  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;
  const whatsappHref = "https://api.whatsapp.com/send/?phone=85223682618";
  return (
    <html lang={locale === "en" ? "en" : locale}>
      <body className="min-h-screen flex flex-col">
        <I18nProvider locale={locale}>
          <header className="border-b border-brand-100 bg-white motion-safe:animate-fade-in">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/"
                  className="group min-w-0 text-brand-700 leading-tight flex items-center gap-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/api/brand-assets/headerlogo.png"
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-auto max-h-10 object-contain shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                  />
                  <div className="min-w-0">
                    <span className="block font-serif text-2xl">{t("brand.name")}</span>
                    <span className="block text-[11px] text-brand-500">{t("brand.byline")}</span>
                  </div>
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
                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center [&_a]:transition-colors [&_a]:duration-200">
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
          <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 motion-safe:animate-fade-in-soft">
            {children}
          </main>
          <footer className="border-t border-brand-100 mt-12">
            <div className="max-w-6xl mx-auto px-6 py-6">
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex gap-3">
                  <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-400 flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt className="text-lg" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-gray-500">{t("footer.contact.addressLabel")}</p>
                    <a href={mapsHref} target="_blank" rel="noreferrer" className="hover:text-brand-600 hover:underline">
                      {address}
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-400 flex items-center justify-center shrink-0">
                    <FaPhoneAlt className="text-base" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-gray-500">{t("footer.contact.phoneLabel")}</p>
                    <a href={telHref} className="hover:text-brand-600 hover:underline">
                      {phone}
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-400 flex items-center justify-center shrink-0">
                    <FaWhatsapp className="text-lg" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-gray-500">{t("footer.contact.whatsappLabel")}</p>
                    <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-brand-600 hover:underline">
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-brand-100 text-sm text-gray-500 flex justify-between">
                <span>
                  © {new Date().getFullYear()} {t("footer.copyright")}
                </span>
                <div className="flex items-center gap-4">
                  <Link href="/terms" className="hover:text-brand-600">
                    {t("nav.terms")}
                  </Link>
                  <a href={backofficeUrl} className="hover:text-brand-600">
                    {t("nav.admin")}
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
