"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { useT } from "./I18nProvider";

type Variant = { id: string; label: string; stock: number };

export function AddToCartButton({
  productId,
  variants,
  inStock,
}: {
  productId: string;
  variants: Variant[];
  inStock: boolean;
}) {
  const t = useT();
  const hasVariants = variants.length > 0;
  const [variantId, setVariantId] = useState<string>(
    hasVariants ? variants[0]?.id ?? "" : ""
  );
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (hasVariants && !variantId) return;
    addToCart({ productId, variantId: hasVariants ? variantId : undefined, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const disabled = !inStock || (hasVariants && !variantId);

  return (
    <div className="space-y-3">
      {hasVariants && (
        <label className="block text-sm">
          <span className="text-gray-600">{t("product.size")}</span>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="mt-1 block w-full rounded border border-brand-200 bg-white px-3 py-2"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.label}
                {v.stock <= 0 ? t("product.outOfStockSuffix") : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium py-3 rounded transition"
      >
        {!inStock
          ? t("product.outOfStock")
          : added
            ? t("product.added")
            : t("product.addToCart")}
      </button>
    </div>
  );
}
