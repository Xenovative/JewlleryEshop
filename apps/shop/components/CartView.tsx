"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart, updateQty, removeFromCart, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useT, useLocale } from "./I18nProvider";
import { intlLocale } from "@/lib/i18n";

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

export function CartView() {
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

  const checkout = async () => {
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
  const currency = items[0]?.currency ?? "usd";

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
              <p className="text-brand-700 mt-1">
                {formatPrice(i.priceCents, i.currency, localeCode)}
              </p>
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
        <h2 className="font-serif text-xl">{t("cart.summary")}</h2>
        <div className="mt-4 flex justify-between">
          <span>{t("cart.subtotal")}</span>
          <span>{formatPrice(subtotal, currency, localeCode)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t("cart.shippingNote")}</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={checkout}
          disabled={loading}
          className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium py-3 rounded transition"
        >
          {loading ? t("cart.redirecting") : t("cart.checkout")}
        </button>
      </aside>
    </div>
  );
}

export type { CartItem };
