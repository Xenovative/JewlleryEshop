import Link from "next/link";
import { prisma } from "@lumiere/db";
import { formatPrice } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";
import { getT, getLocale } from "@/lib/i18n.server";
import { ConfirmAwaitingOrderButton } from "@/components/backoffice/ConfirmAwaitingOrderButton";

export const dynamic = "force-dynamic";

function paymentLabel(
  t: Awaited<ReturnType<typeof getT>>,
  provider: string
): string {
  if (provider === "bank_fps") return t("checkout.alt.methodBank");
  if (provider === "kpay_alipay") return t("checkout.alt.methodKpay");
  if (provider === "whatsapp") return t("checkout.alt.methodWhatsapp");
  if (provider === "generic_gateway") return t("checkout.alt.methodGeneric");
  return "Stripe";
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  const t = await getT();
  const intl = intlLocale(await getLocale());
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        <Link
          href="/backoffice/storefront-preview"
          className="text-brand-600 hover:underline font-medium"
        >
          {t("admin.orders.storefrontPreviewLink")}
        </Link>
        <span className="text-gray-500"> — {t("admin.orders.storefrontPreviewHint")}</span>
      </p>
      <h1 className="font-serif text-2xl">{t("admin.orders.title")}</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">{t("admin.orders.empty")}</p>
      ) : (
        <div className="bg-white border border-brand-100 rounded">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-left">
              <tr>
                <th className="px-3 py-2">{t("admin.orders.col.date")}</th>
                <th className="px-3 py-2">{t("admin.orders.col.email")}</th>
                <th className="px-3 py-2">{t("admin.orders.col.status")}</th>
                <th className="px-3 py-2">{t("admin.orders.col.total")}</th>
                <th className="px-3 py-2">{t("admin.orders.col.payment")}</th>
                <th className="px-3 py-2">{t("admin.orders.col.items")}</th>
                <th className="px-3 py-2 w-28" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                let items: Array<{ name: string; qty: number }> = [];
                try {
                  items = JSON.parse(o.itemsJson);
                } catch {
                  items = [];
                }
                return (
                  <tr key={o.id} className="border-t border-brand-100 align-top">
                    <td className="px-3 py-2">
                      {new Date(o.createdAt).toLocaleString(intl)}
                    </td>
                    <td className="px-3 py-2">{o.email ?? "—"}</td>
                    <td className="px-3 py-2">{o.status}</td>
                    <td className="px-3 py-2">
                      {formatPrice(o.amountTotalCents, o.currency)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {paymentLabel(t, o.paymentProvider)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {items
                        .map((i) => `${i.name} × ${i.qty}`)
                        .join(", ")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {o.status === "awaiting_payment" ? (
                        <ConfirmAwaitingOrderButton orderId={o.id} />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
