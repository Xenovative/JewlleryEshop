"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import type { DictKey } from "@/lib/i18n";

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  currency: string;
  priceCents: number;
  stock: number;
  lowStockThreshold: number | null;
  rentable: boolean;
  variants: { id: string; label: string; stock: number; sku: string | null }[];
};

type CopyRow = {
  id: string;
  productId: string;
  productName: string;
  label: string;
  status: string;
  notes: string | null;
};

type ActiveBooking = { id: string; customerName: string; endDate: string };

const STATUSES = ["available", "out", "maintenance", "retired"] as const;

export function InventoryAdmin({
  tab,
  products,
  copies,
  activeBookingsByProduct,
}: {
  tab: "stock" | "copies";
  products: ProductRow[];
  copies: CopyRow[];
  activeBookingsByProduct: Record<string, ActiveBooking[]>;
}) {
  const router = useRouter();
  const t = useT();

  const setTab = (v: "stock" | "copies") => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", v);
    router.replace(url.pathname + url.search);
  };

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl">{t("bo.inventory.title")}</h1>

      <div className="border-b border-brand-100 flex gap-4 text-sm">
        <button
          onClick={() => setTab("stock")}
          className={`pb-2 ${
            tab === "stock"
              ? "border-b-2 border-brand-600 text-brand-700 font-medium"
              : "text-gray-500 hover:text-brand-600"
          }`}
        >
          {t("bo.inventory.tab.stock")}
        </button>
        <button
          onClick={() => setTab("copies")}
          className={`pb-2 ${
            tab === "copies"
              ? "border-b-2 border-brand-600 text-brand-700 font-medium"
              : "text-gray-500 hover:text-brand-600"
          }`}
        >
          {t("bo.inventory.tab.fleet")}
        </button>
      </div>

      {tab === "stock" ? (
        <StockTab products={products} />
      ) : (
        <FleetTab
          products={products}
          copies={copies}
          activeBookingsByProduct={activeBookingsByProduct}
          statusLabel={(s) => t(`bo.inventory.status.${s}` as DictKey)}
        />
      )}
    </div>
  );
}

function StockTab({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const t = useT();
  const [busy, setBusy] = useState(false);

  const adjust = async (
    productId: string,
    variantId: string | null,
    delta: number
  ) => {
    setBusy(true);
    await fetch("/api/backoffice/inventory/stock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, variantId, delta }),
    });
    setBusy(false);
    router.refresh();
  };

  type Row = {
    productId: string;
    variantId: string | null;
    name: string;
    sku: string;
    sub: string;
    stock: number;
    threshold: number | null;
  };
  const rows: Row[] = [];
  for (const p of products) {
    if (p.variants.length === 0) {
      rows.push({
        productId: p.id,
        variantId: null,
        name: p.name,
        sku: p.sku?.trim() || "—",
        sub: p.category,
        stock: p.stock,
        threshold: p.lowStockThreshold,
      });
    } else {
      for (const v of p.variants) {
        const sku =
          v.sku?.trim() || p.sku?.trim() || "—";
        rows.push({
          productId: p.id,
          variantId: v.id,
          name: p.name,
          sku,
          sub: `${p.category} · ${v.label}`,
          stock: v.stock,
          threshold: p.lowStockThreshold,
        });
      }
    }
  }

  return (
    <div className="bg-white border border-brand-100 rounded">
      <table className="w-full text-sm">
        <thead className="bg-brand-50 text-left">
          <tr>
            <th className="px-3 py-2">{t("bo.inventory.col.product")}</th>
            <th className="px-3 py-2 w-36">{t("bo.inventory.col.sku")}</th>
            <th className="px-3 py-2">{t("bo.inventory.col.variant")}</th>
            <th className="px-3 py-2 w-32">{t("bo.inventory.col.stock")}</th>
            <th className="px-3 py-2 w-44">{t("bo.inventory.col.adjust")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const low =
              r.threshold !== null && r.stock <= r.threshold;
            return (
              <tr
                key={`${r.productId}-${r.variantId ?? "_"}-${i}`}
                className="border-t border-brand-100"
              >
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-gray-700">
                  {r.sku}
                </td>
                <td className="px-3 py-2 text-gray-500">{r.sub}</td>
                <td
                  className={`px-3 py-2 font-mono ${
                    low ? "text-red-600 font-semibold" : ""
                  }`}
                >
                  {r.stock}
                  {low && (
                    <span className="ml-2 text-xs">
                      {t("bo.inventory.lowFlag")}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {[-10, -1, +1, +10].map((d) => (
                      <button
                        key={d}
                        disabled={busy}
                        onClick={() =>
                          adjust(r.productId, r.variantId, d)
                        }
                        className="border border-brand-200 rounded px-2 py-0.5 text-xs hover:bg-brand-50 disabled:opacity-50"
                      >
                        {d > 0 ? `+${d}` : d}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FleetTab({
  products,
  copies,
  activeBookingsByProduct,
  statusLabel,
}: {
  products: ProductRow[];
  copies: CopyRow[];
  activeBookingsByProduct: Record<string, ActiveBooking[]>;
  statusLabel: (s: string) => string;
}) {
  const router = useRouter();
  const t = useT();
  const [busy, setBusy] = useState(false);

  const rentable = products.filter((p) => p.rentable);
  const grouped = rentable.map((p) => ({
    product: p,
    items: copies.filter((c) => c.productId === p.id),
    booked: activeBookingsByProduct[p.id] ?? [],
  }));

  const setStatus = async (id: string, status: string) => {
    setBusy(true);
    await fetch(`/api/backoffice/inventory/copies/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  };

  const setNotes = async (id: string, notes: string) => {
    setBusy(true);
    await fetch(`/api/backoffice/inventory/copies/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ notes: notes || null }),
    });
    setBusy(false);
    router.refresh();
  };

  const addCopy = async (productId: string) => {
    setBusy(true);
    await fetch("/api/backoffice/inventory/copies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setBusy(false);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm(t("bo.inventory.confirmRemoveCopy"))) return;
    setBusy(true);
    await fetch(`/api/backoffice/inventory/copies/${id}`, {
      method: "DELETE",
    });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {grouped.length === 0 && (
        <p className="text-gray-500 text-sm">{t("bo.inventory.noRentable")}</p>
      )}
      {grouped.map(({ product, items, booked }) => (
        <section
          key={product.id}
          className="bg-white border border-brand-100 rounded p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-lg">{product.name}</h2>
              {product.sku?.trim() && (
                <p className="text-xs text-gray-500 font-mono">
                  {t("bo.inventory.col.sku")}: {product.sku}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {t("bo.inventory.fleetSummary", {
                  total: items.length,
                  available: items.filter((i) => i.status === "available").length,
                  out: items.filter((i) => i.status === "out").length,
                  booked: booked.length,
                })}
              </p>
            </div>
            <button
              onClick={() => addCopy(product.id)}
              disabled={busy}
              className="text-sm bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-3 py-1 rounded"
            >
              {t("bo.inventory.addCopy")}
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-gray-500">{t("bo.inventory.noCopies")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="py-1">{t("bo.inventory.col.copy")}</th>
                  <th className="py-1">{t("bo.inventory.col.status")}</th>
                  <th className="py-1">{t("bo.inventory.col.notes")}</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t border-brand-100">
                    <td className="py-2 pr-2">{c.label}</td>
                    <td className="py-2 pr-2">
                      <select
                        value={c.status}
                        onChange={(e) => setStatus(c.id, e.target.value)}
                        className={`border border-brand-200 rounded px-2 py-1 bg-white text-xs ${
                          c.status === "out"
                            ? "text-amber-700"
                            : c.status === "maintenance"
                              ? "text-orange-700"
                              : c.status === "retired"
                                ? "text-gray-500"
                                : "text-green-700"
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        defaultValue={c.notes ?? ""}
                        onBlur={(e) => {
                          if ((e.target.value || "") !== (c.notes ?? "")) {
                            setNotes(c.id, e.target.value);
                          }
                        }}
                        className="border border-brand-200 rounded px-2 py-1 w-full text-xs"
                        placeholder={t("bo.inventory.notesPlaceholder")}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => remove(c.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        {t("bo.inventory.removeCopy")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  );
}
