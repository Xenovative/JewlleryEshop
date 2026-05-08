"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, updateQty, removeFromCart, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useT, useLocale } from "./I18nProvider";
import { intlLocale } from "@/lib/i18n";
import { CHECKOUT_CURRENCY, FOB_HONG_KONG_OFFICE } from "@lumiere/db/commerce";

type ResolvedItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  priceCents: number;
  currency: string;
  variantId?: string;
  variantLabel?: string;
  qty: number;
  stock: number;
};

export function CheckoutView() {
  const t = useT();
  const localeCode = intlLocale(useLocale());
  const [items, setItems] = useState<ResolvedItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const local = readCart();
    if (local.length === 0) {
      setItems([]);
      return;
    }
    const res = await fetch("/api/cart/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: local }),
    });
    const data = await res.json();
    setItems(data.items as ResolvedItem[]);
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
  }, []);

  const pay = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: readCart() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  if (items === null) return <p>{t("cart.loading")}</p>;
  if (items.length === 0) {
    return (
      <div className="text-gray-500">
        {t("cart.empty")}{" "}
        <Link href="/" className="text-brand-600 hover:underline">
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.priceCents * i.qty, 0);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        {items.map((i) => (
          <div
            key={`${i.productId}:${i.variantId ?? ""}`}
            className="flex gap-4 bg-white border border-brand-100 rounded-lg p-4"
          >
            <div className="w-24 h-24 bg-brand-50 rounded overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <Link href={`/product/${i.slug}`} className="font-serif text-lg hover:underline">
                {i.name}
              </Link>
              {i.variantLabel && (
                <p className="text-sm text-gray-500">{i.variantLabel}</p>
              )}
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-brand-700">
                  {formatPrice(i.priceCents, CHECKOUT_CURRENCY, localeCode)}
                </p>
                <span className="text-xs text-gray-500">{FOB_HONG_KONG_OFFICE}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={i.stock}
                  value={i.qty}
                  onChange={(e) =>
                    updateQty(
                      i.productId,
                      i.variantId,
                      Math.max(1, Math.min(i.stock, Number(e.target.value) || 1))
                    )
                  }
                  className="w-16 border border-brand-200 rounded px-2 py-1"
                />
                <button
                  onClick={() => removeFromCart(i.productId, i.variantId)}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  {t("cart.remove")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="bg-white border border-brand-100 rounded-lg p-6 h-fit">
        <h2 className="font-serif text-xl">{t("checkout.summary")}</h2>
        <p className="text-xs text-gray-500 mt-2">{t("checkout.allPricesNote")}</p>
        <div className="mt-4 flex justify-between gap-2">
          <span>{t("cart.subtotal")}</span>
          <span className="text-right">
            {formatPrice(subtotal, CHECKOUT_CURRENCY, localeCode)}
            <span className="block text-xs text-gray-500 font-normal">
              {FOB_HONG_KONG_OFFICE}
            </span>
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-3">{t("checkout.stripeNote")}</p>
        <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50/40 p-3 text-sm space-y-1">
          <p>
            {t("checkout.reserveCta")}
            <sup className="ml-0.5 text-[10px] align-super">#1</sup>
          </p>
          <p className="text-xs text-gray-600">{t("checkout.reserveFeeNote")}</p>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={pay}
          disabled={loading}
          className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium py-3 rounded transition"
        >
          {loading ? t("cart.redirecting") : t("checkout.payStripe")}
        </button>
        <Link
          href="/cart"
          className="mt-3 block text-center text-sm text-brand-600 hover:underline"
        >
          {t("checkout.backToCart")}
        </Link>
      </aside>
    </div>
  );
}

export type { CartItem };
