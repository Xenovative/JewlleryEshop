import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

type PreviewRow = { name: string; qty: number; lineCents: number };

export default async function StorefrontPreviewPage() {
  const t = await getT();
  const intl = intlLocale(await getLocale());
  const demoEmail = "customer@example.com";
  const demoOrderId = "demo-ORD-10042";
  const demoWhen = new Date("2026-05-01T14:30:00");
  const currency = "usd";

  const rows: PreviewRow[] = [
    { name: t("bo.storefrontPreview.demo.item1"), qty: 1, lineCents: 12900 },
    { name: t("bo.storefrontPreview.demo.item2"), qty: 2, lineCents: 8900 * 2 },
  ];
  const subtotal = rows.reduce((s, r) => s + r.lineCents, 0);

  const extLink =
    "inline-flex items-center gap-1 text-brand-600 hover:underline font-medium text-sm";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl">{t("bo.storefrontPreview.title")}</h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {t("bo.storefrontPreview.intro")}
        </p>
      </div>

      <section className="bg-white border border-brand-100 rounded-lg p-5 space-y-3">
        <h2 className="font-medium text-sm text-gray-700">
          {t("bo.storefrontPreview.openLinks")}
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a className={extLink} href="/" target="_blank" rel="noopener noreferrer">
              {t("bo.storefrontPreview.link.home")} ↗
            </a>
          </li>
          <li>
            <a className={extLink} href="/rental" target="_blank" rel="noopener noreferrer">
              {t("nav.rental")} ↗
            </a>
          </li>
          <li>
            <a className={extLink} href="/cart" target="_blank" rel="noopener noreferrer">
              {t("bo.storefrontPreview.link.cart")} ↗
            </a>
          </li>
          <li>
            <a
              className={extLink}
              href="/checkout/cancel"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("bo.storefrontPreview.link.cancel")} ↗
            </a>
          </li>
          <li className="pt-1 border-t border-brand-50">
            <a
              className={extLink}
              href="/checkout/success"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("bo.storefrontPreview.link.success")} ↗
            </a>
            <p className="mt-1 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
              {t("bo.storefrontPreview.link.successWarning")}
            </p>
          </li>
        </ul>
        <p className="text-xs text-gray-500 pt-1">{t("bo.storefrontPreview.stripeNote")}</p>
        <p className="text-xs">
          <Link href="/backoffice/storefront" className="text-brand-600 hover:underline font-medium">
            {t("bo.nav.storefrontEditor")}
          </Link>
          <span className="text-gray-500"> · </span>
          <Link href="/backoffice/orders" className="text-brand-600 hover:underline">
            {t("admin.orders.title")}
          </Link>
          <span className="text-gray-500"> — {t("admin.orders.storefrontPreviewHint")}</span>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-brand-700">
          {t("bo.storefrontPreview.receiptTitle")}
        </h2>
        <div className="border border-brand-100 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="bg-brand-50 px-4 py-2 flex flex-wrap items-center gap-2 justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-800">
              {t("bo.storefrontPreview.receiptBadge")}
            </span>
          </div>
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="font-serif text-2xl text-brand-700">{t("success.title")}</h3>
              <p className="mt-2 text-sm text-gray-600">{t("success.body")}</p>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-brand-100 pt-4">
              <div>
                <dt className="text-gray-500">{t("bo.storefrontPreview.receiptOrder")}</dt>
                <dd className="font-mono text-xs mt-0.5">{demoOrderId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">{t("bo.storefrontPreview.receiptEmail")}</dt>
                <dd className="mt-0.5">{demoEmail}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">{t("bo.storefrontPreview.receiptDate")}</dt>
                <dd className="mt-0.5">{demoWhen.toLocaleString(intl)}</dd>
              </div>
            </dl>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-gray-500">
                  <th className="py-2 pr-2 font-medium">{t("bo.storefrontPreview.receiptCol.item")}</th>
                  <th className="py-2 px-2 font-medium w-16">{t("bo.storefrontPreview.receiptCol.qty")}</th>
                  <th className="py-2 pl-2 font-medium text-right">
                    {t("bo.storefrontPreview.receiptCol.line")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-brand-50">
                    <td className="py-2 pr-2">{r.name}</td>
                    <td className="py-2 px-2 tabular-nums">{r.qty}</td>
                    <td className="py-2 pl-2 text-right tabular-nums">
                      {formatPrice(r.lineCents, currency, intl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-brand-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("bo.storefrontPreview.receiptSubtotal")}</span>
                <span className="tabular-nums">{formatPrice(subtotal, currency, intl)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-1">
                <span>{t("bo.storefrontPreview.receiptTotal")}</span>
                <span className="tabular-nums">{formatPrice(subtotal, currency, intl)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">{t("bo.storefrontPreview.receiptNote")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
