"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useT } from "@/components/I18nProvider";

type Variant = { id?: string; label: string; stock: number; sku?: string | null };
type Tier = { id?: string; label: string; days: number; priceCents: number };
type Image = { id?: string; url: string; alt: string | null };
type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string;
  stock: number;
  material: string | null;
  gemstone: string | null;
  weightGrams: number | null;
  categoryId: string;
  category?: Category;
  sku: string | null;
  variants: Variant[];
  buyable: boolean;
  rentable: boolean;
  rentPricingType: string | null;
  rentDailyCents: number | null;
  rentFixedCents: number | null;
  rentFixedDurationDays: number | null;
  rentCopiesCount: number;
  waiverFeeCents: number | null;
  rentalTiers: Tier[];
  featured: boolean;
  position: number;
  seoTitle: string | null;
  seoDescription: string | null;
  lowStockThreshold: number | null;
  images: Image[];
};

const empty = (categoryId: string): Product => ({
  id: "",
  slug: "",
  name: "",
  description: "",
  priceCents: 0,
  currency: "usd",
  imageUrl: "",
  stock: 0,
  material: "",
  gemstone: "",
  weightGrams: null,
  categoryId,
  sku: null,
  variants: [],
  buyable: true,
  rentable: false,
  rentPricingType: null,
  rentDailyCents: null,
  rentFixedCents: null,
  rentFixedDurationDays: null,
  rentCopiesCount: 0,
  waiverFeeCents: null,
  rentalTiers: [],
  featured: false,
  position: 0,
  seoTitle: "",
  seoDescription: "",
  lowStockThreshold: null,
  images: [],
});

/** URL-safe slug from display name (supports letters/numbers across scripts). */
function slugifyProductName(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  const slug = base
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, 200);
}

export function ProductsAdmin({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingReplaceIndex = useRef<number | null>(null);
  /** After user edits slug, do not overwrite it from name changes (new products only). */
  const slugEditedManually = useRef(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const startNew = () => {
    slugEditedManually.current = false;
    setEditing(empty(categories[0]?.id ?? ""));
  };
  const startEdit = (p: Product) => {
    slugEditedManually.current = true;
    setEditing(JSON.parse(JSON.stringify(p)));
  };
  const cancel = () => {
    setEditing(null);
    setError(null);
    setDragOver(false);
  };

  const uploadFilesToGallery = async (files: File[], replaceIndex?: number) => {
    if (!editing) return;
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setUploadBusy(true);
    setError(null);
    try {
      const toSend =
        replaceIndex !== undefined ? imageFiles.slice(0, 1) : imageFiles;
      const urls: string[] = [];
      for (const f of toSend) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/backoffice/uploads/product-image", {
          method: "POST",
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            (data.error as string) || t("bo.products.uploadFailed")
          );
        }
        urls.push(data.url as string);
      }
      if (replaceIndex !== undefined) {
        const next = [...editing.images];
        if (!next[replaceIndex]) {
          next[replaceIndex] = { url: urls[0] ?? "", alt: "" };
        } else {
          next[replaceIndex] = { ...next[replaceIndex], url: urls[0] ?? "" };
        }
        setEditing({ ...editing, images: next });
      } else {
        setEditing({
          ...editing,
          images: [
            ...editing.images,
            ...urls.map((url) => ({ url, alt: "" as string | null })),
          ],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("bo.products.uploadFailed"));
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onGalleryFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !editing) return;
    const idx = pendingReplaceIndex.current;
    pendingReplaceIndex.current = null;
    const list = Array.from(files);
    if (idx !== null) {
      await uploadFilesToGallery(list, idx);
    } else {
      await uploadFilesToGallery(list);
    }
  };

  const openBulkFilePicker = () => {
    pendingReplaceIndex.current = null;
    fileRef.current?.click();
  };

  const openRowFilePicker = (idx: number) => {
    pendingReplaceIndex.current = idx;
    fileRef.current?.click();
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    const payload = {
      slug: editing.slug,
      name: editing.name,
      description: editing.description,
      priceCents: Number(editing.priceCents),
      currency: editing.currency || "usd",
      imageUrl:
        editing.imageUrl.trim() ||
        (editing.images.find((img) => img.url.trim() !== "")?.url ?? ""),
      stock: Number(editing.stock),
      sku: editing.sku?.trim() || null,
      material: editing.material || null,
      gemstone: editing.gemstone || null,
      weightGrams:
        editing.weightGrams === null || (editing.weightGrams as unknown) === ""
          ? null
          : Number(editing.weightGrams),
      categoryId: editing.categoryId,
      variants: editing.variants.map((v) => ({
        label: v.label,
        stock: Number(v.stock),
        sku: v.sku?.trim() || null,
      })),
      buyable: editing.buyable,
      rentable: editing.rentable,
      rentPricingType: editing.rentable ? editing.rentPricingType : null,
      rentDailyCents:
        editing.rentable && editing.rentPricingType === "daily"
          ? Number(editing.rentDailyCents) || 0
          : null,
      rentFixedCents:
        editing.rentable && editing.rentPricingType === "fixed"
          ? Number(editing.rentFixedCents) || 0
          : null,
      rentFixedDurationDays:
        editing.rentable && editing.rentPricingType === "fixed"
          ? Number(editing.rentFixedDurationDays) || 0
          : null,
      rentCopiesCount: editing.rentable ? Number(editing.rentCopiesCount) || 0 : 0,
      waiverFeeCents:
        editing.rentable && editing.waiverFeeCents
          ? Number(editing.waiverFeeCents)
          : null,
      rentalTiers:
        editing.rentable && editing.rentPricingType === "tiered"
          ? editing.rentalTiers.map((t) => ({
              label: t.label,
              days: Number(t.days),
              priceCents: Number(t.priceCents),
            }))
          : [],
      featured: editing.featured,
      position: Number(editing.position) || 0,
      seoTitle: editing.seoTitle || null,
      seoDescription: editing.seoDescription || null,
      lowStockThreshold:
        editing.lowStockThreshold === null ||
        (editing.lowStockThreshold as unknown) === ""
          ? null
          : Number(editing.lowStockThreshold),
      images: editing.images
        .filter((img) => img.url.trim() !== "")
        .map((img) => ({ url: img.url, alt: img.alt || null })),
    };
    const res = await fetch(
      editing.id ? `/api/backoffice/products/${editing.id}` : "/api/backoffice/products",
      {
        method: editing.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("admin.products.saveFailed"));
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm(t("admin.products.confirmDelete"))) return;
    setBusy(true);
    const res = await fetch(`/api/backoffice/products/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  };

  const move = async (id: string, dir: -1 | 1) => {
    const ids = initialProducts.map((p) => p.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setBusy(true);
    const res = await fetch("/api/backoffice/products/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ order: ids }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">{t("admin.products.title")}</h1>
        <button
          onClick={startNew}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
        >
          {t("admin.products.new")}
        </button>
      </div>

      <div className="bg-white border border-brand-100 rounded">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left">
            <tr>
              <th className="px-2 py-2 w-10"></th>
              <th className="px-3 py-2">{t("admin.products.col.name")}</th>
              <th className="px-3 py-2 w-28">{t("admin.products.field.sku")}</th>
              <th className="px-3 py-2">{t("admin.products.col.category")}</th>
              <th className="px-3 py-2">{t("admin.products.col.price")}</th>
              <th className="px-3 py-2">{t("admin.products.col.stock")}</th>
              <th className="px-3 py-2">{t("bo.products.col.visibility")}</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((p, idx) => {
              const stock =
                p.variants.length > 0
                  ? p.variants.reduce((n, v) => n + v.stock, 0)
                  : p.stock;
              const skuLabel = (() => {
                if (p.variants.length === 0) return p.sku?.trim() || "—";
                const resolved = p.variants.map(
                  (v) => v.sku?.trim() || p.sku?.trim() || ""
                );
                const nonEmpty = resolved.filter(Boolean);
                if (nonEmpty.length === 0) return "—";
                const unique = new Set(nonEmpty);
                if (unique.size === 1) return [...unique][0]!;
                return t("admin.products.skuMixed");
              })();
              return (
                <tr key={p.id} className="border-t border-brand-100">
                  <td className="px-2 py-2 align-middle">
                    <div className="flex flex-col text-xs leading-none">
                      <button
                        type="button"
                        disabled={idx === 0 || busy}
                        onClick={() => move(p.id, -1)}
                        className="text-gray-400 hover:text-brand-600 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === initialProducts.length - 1 || busy}
                        onClick={() => move(p.id, 1)}
                        className="text-gray-400 hover:text-brand-600 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {p.featured && (
                      <span
                        className="text-amber-500 mr-1"
                        title={t("bo.products.featuredOn")}
                      >
                        ★
                      </span>
                    )}
                    {p.name}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700">
                    {skuLabel}
                  </td>
                  <td className="px-3 py-2">{p.category?.name}</td>
                  <td className="px-3 py-2">{formatPrice(p.priceCents, p.currency)}</td>
                  <td className="px-3 py-2">{stock}</td>
                  <td className="px-3 py-2 text-xs">
                    {p.buyable && (
                      <span className="inline-block bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded mr-1">
                        {t("bo.products.badge.shop")}
                      </span>
                    )}
                    {p.rentable && (
                      <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        {t("bo.products.badge.rent", { n: p.rentCopiesCount })}
                      </span>
                    )}
                    {!p.buyable && !p.rentable && (
                      <span className="text-gray-400">
                        {t("bo.products.badge.hidden")}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-brand-600 hover:underline mr-3"
                    >
                      {t("admin.products.edit")}
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      {t("admin.products.delete")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-serif text-xl mb-4">
              {editing.id
                ? t("admin.products.editTitle")
                : t("admin.products.newTitle")}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t("admin.products.field.name")}>
                <input
                  className="input"
                  value={editing.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const isNew = !editing.id;
                    const nextSlug =
                      isNew && !slugEditedManually.current
                        ? slugifyProductName(name)
                        : editing.slug;
                    setEditing({ ...editing, name, slug: nextSlug });
                  }}
                />
              </Field>
              <Field label={t("admin.products.field.slug")}>
                <input
                  className="input"
                  value={editing.slug}
                  onChange={(e) => {
                    slugEditedManually.current = true;
                    setEditing({ ...editing, slug: e.target.value });
                  }}
                />
              </Field>
              <Field label={t("admin.products.field.sku")}>
                <input
                  className="input"
                  value={editing.sku ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, sku: e.target.value || null })
                  }
                  placeholder={t("admin.products.field.skuPlaceholder")}
                />
              </Field>
              <Field label={t("admin.products.field.category")}>
                <select
                  className="input"
                  value={editing.categoryId}
                  onChange={(e) =>
                    setEditing({ ...editing, categoryId: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("admin.products.field.salePrice")}>
                <input
                  type="number"
                  className="input"
                  value={editing.priceCents}
                  onChange={(e) =>
                    setEditing({ ...editing, priceCents: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label={t("admin.products.field.currency")}>
                <input
                  className="input"
                  value={editing.currency}
                  onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                />
              </Field>
              <Field label={t("admin.products.field.stockNoVariants")}>
                <input
                  type="number"
                  className="input"
                  value={editing.stock}
                  onChange={(e) =>
                    setEditing({ ...editing, stock: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label={t("admin.products.field.imageUrl")} full>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      className="input flex-1 min-w-[200px]"
                      value={editing.imageUrl}
                      onChange={(e) =>
                        setEditing({ ...editing, imageUrl: e.target.value })
                      }
                      placeholder="https://… or /uploads/…"
                    />
                    <button
                      type="button"
                      className="text-xs border border-brand-200 rounded px-2 py-1 hover:bg-brand-50 whitespace-nowrap disabled:opacity-40"
                      disabled={!editing.images[0]?.url?.trim()}
                      onClick={() =>
                        setEditing({
                          ...editing,
                          imageUrl: editing.images[0]?.url ?? editing.imageUrl,
                        })
                      }
                    >
                      {t("bo.products.syncHero")}
                    </button>
                  </div>
                  {editing.imageUrl?.trim() && (
                    <div className="w-20 h-20 rounded border border-brand-100 overflow-hidden bg-brand-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editing.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </Field>
              <Field label={t("admin.products.field.description")} full>
                <textarea
                  className="input"
                  rows={3}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </Field>
              <Field label={t("admin.products.field.material")}>
                <input
                  className="input"
                  value={editing.material ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, material: e.target.value })
                  }
                />
              </Field>
              <Field label={t("admin.products.field.gemstone")}>
                <input
                  className="input"
                  value={editing.gemstone ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, gemstone: e.target.value })
                  }
                />
              </Field>
              <Field label={t("bo.products.lowStockThreshold")}>
                <input
                  type="number"
                  className="input"
                  value={editing.lowStockThreshold ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      lowStockThreshold:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </Field>
            </div>

            <div className="mt-6 border-t border-brand-100 pt-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={onGalleryFileInput}
              />

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-serif text-lg mb-1">
                    {t("bo.products.gallery")}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xl">
                    {t("bo.products.galleryHelp")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("bo.products.uploadLimits")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={uploadBusy}
                  onClick={openBulkFilePicker}
                  className="text-sm border border-brand-600 text-brand-700 px-3 py-1.5 rounded hover:bg-brand-50 disabled:opacity-50"
                >
                  {uploadBusy ? t("bo.products.uploading") : t("bo.products.chooseFiles")}
                </button>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  void uploadFilesToGallery(Array.from(e.dataTransfer.files));
                }}
                className={`mt-3 border-2 border-dashed rounded-lg p-6 text-center text-sm transition ${
                  dragOver
                    ? "border-brand-500 bg-brand-50"
                    : "border-brand-200 bg-brand-50/30"
                }`}
              >
                {t("bo.products.dropzone")}
              </div>

              <div className="mt-4 space-y-3">
                {editing.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap gap-3 items-start p-3 border border-brand-100 rounded-lg bg-white"
                  >
                    <div className="w-24 h-24 shrink-0 rounded border border-brand-100 overflow-hidden bg-brand-50">
                      {img.url.trim() ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={img.url}
                          alt={img.alt || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 px-1 text-center">
                          {t("bo.products.noPreview")}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <label className="block text-xs text-gray-600">
                        {t("bo.products.imageUrlOrUpload")}
                        <input
                          className="input mt-0.5"
                          placeholder="https://…"
                          value={img.url}
                          onChange={(e) => {
                            const next = [...editing.images];
                            next[idx] = { ...img, url: e.target.value };
                            setEditing({ ...editing, images: next });
                          }}
                        />
                      </label>
                      <label className="block text-xs text-gray-600">
                        {t("bo.products.imageAlt")}
                        <input
                          className="input mt-0.5"
                          placeholder={t("bo.products.altPlaceholder")}
                          value={img.alt ?? ""}
                          onChange={(e) => {
                            const next = [...editing.images];
                            next[idx] = { ...img, alt: e.target.value };
                            setEditing({ ...editing, images: next });
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <button
                        type="button"
                        disabled={uploadBusy}
                        onClick={() => openRowFilePicker(idx)}
                        className="text-xs bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-2 py-1 rounded whitespace-nowrap"
                      >
                        {t("bo.products.uploadReplace")}
                      </button>
                      <div className="flex gap-0.5 text-xs">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...editing.images];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            setEditing({ ...editing, images: next });
                          }}
                          className="text-gray-500 disabled:opacity-30 px-1"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === editing.images.length - 1}
                          onClick={() => {
                            const next = [...editing.images];
                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                            setEditing({ ...editing, images: next });
                          }}
                          className="text-gray-500 disabled:opacity-30 px-1"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = editing.images.filter((_, i) => i !== idx);
                            setEditing({ ...editing, images: next });
                          }}
                          className="text-red-600 px-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    images: [...editing.images, { url: "", alt: "" }],
                  })
                }
                className="text-sm text-brand-600 hover:underline mt-3"
              >
                {t("bo.products.addImage")}
              </button>
            </div>

            <div className="mt-6 border-t border-brand-100 pt-4">
              <h3 className="font-serif text-lg mb-2">{t("bo.products.seo")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("bo.products.seoTitle")} full>
                  <input
                    className="input"
                    value={editing.seoTitle ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, seoTitle: e.target.value })
                    }
                  />
                </Field>
                <Field label={t("bo.products.seoDescription")} full>
                  <textarea
                    className="input"
                    rows={2}
                    value={editing.seoDescription ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        seoDescription: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) =>
                    setEditing({ ...editing, featured: e.target.checked })
                  }
                />
                {t("bo.products.featured")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.buyable}
                  onChange={(e) =>
                    setEditing({ ...editing, buyable: e.target.checked })
                  }
                />
                {t("admin.products.buyable")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.rentable}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      rentable: e.target.checked,
                      rentPricingType:
                        e.target.checked && !editing.rentPricingType
                          ? "daily"
                          : editing.rentPricingType,
                    })
                  }
                />
                {t("admin.products.rentable")}
              </label>
            </div>

            {editing.rentable && (
              <div className="mt-6 border-t border-brand-100 pt-4 space-y-3">
                <h3 className="font-serif text-lg">
                  {t("admin.products.rentSection")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("admin.products.field.pricingModel")}>
                    <select
                      className="input"
                      value={editing.rentPricingType ?? "daily"}
                      onChange={(e) =>
                        setEditing({ ...editing, rentPricingType: e.target.value })
                      }
                    >
                      <option value="daily">
                        {t("admin.products.pricing.daily")}
                      </option>
                      <option value="fixed">
                        {t("admin.products.pricing.fixed")}
                      </option>
                      <option value="tiered">
                        {t("admin.products.pricing.tiered")}
                      </option>
                    </select>
                  </Field>
                  <Field label={t("admin.products.field.copies")}>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={editing.rentCopiesCount}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          rentCopiesCount: Number(e.target.value),
                        })
                      }
                    />
                  </Field>

                  {editing.rentPricingType === "daily" && (
                    <Field label={t("admin.products.field.dailyPrice")}>
                      <input
                        type="number"
                        className="input"
                        value={editing.rentDailyCents ?? 0}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            rentDailyCents: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                  )}
                  {editing.rentPricingType === "fixed" && (
                    <>
                      <Field label={t("admin.products.field.fixedPrice")}>
                        <input
                          type="number"
                          className="input"
                          value={editing.rentFixedCents ?? 0}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              rentFixedCents: Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label={t("admin.products.field.fixedDays")}>
                        <input
                          type="number"
                          className="input"
                          value={editing.rentFixedDurationDays ?? 0}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              rentFixedDurationDays: Number(e.target.value),
                            })
                          }
                        />
                      </Field>
                    </>
                  )}

                  <Field label={t("admin.products.field.waiverFee")}>
                    <input
                      type="number"
                      className="input"
                      value={editing.waiverFeeCents ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          waiverFeeCents:
                            e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>

                {editing.rentPricingType === "tiered" && (
                  <div>
                    <h4 className="text-sm font-medium mt-2">
                      {t("admin.products.tiers")}
                    </h4>
                    {editing.rentalTiers.map((tier, idx) => (
                      <div key={idx} className="flex gap-2 mt-2">
                        <input
                          className="input flex-1"
                          placeholder={t("admin.products.tier.label")}
                          value={tier.label}
                          onChange={(e) => {
                            const next = [...editing.rentalTiers];
                            next[idx] = { ...tier, label: e.target.value };
                            setEditing({ ...editing, rentalTiers: next });
                          }}
                        />
                        <input
                          className="input w-24"
                          type="number"
                          placeholder={t("admin.products.tier.days")}
                          value={tier.days}
                          onChange={(e) => {
                            const next = [...editing.rentalTiers];
                            next[idx] = { ...tier, days: Number(e.target.value) };
                            setEditing({ ...editing, rentalTiers: next });
                          }}
                        />
                        <input
                          className="input w-32"
                          type="number"
                          placeholder={t("admin.products.tier.price")}
                          value={tier.priceCents}
                          onChange={(e) => {
                            const next = [...editing.rentalTiers];
                            next[idx] = { ...tier, priceCents: Number(e.target.value) };
                            setEditing({ ...editing, rentalTiers: next });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = editing.rentalTiers.filter((_, i) => i !== idx);
                            setEditing({ ...editing, rentalTiers: next });
                          }}
                          className="text-red-600 px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          rentalTiers: [
                            ...editing.rentalTiers,
                            { label: "", days: 1, priceCents: 0 },
                          ],
                        })
                      }
                      className="text-sm text-brand-600 hover:underline mt-2"
                    >
                      {t("admin.products.addTier")}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 border-t border-brand-100 pt-4">
              <h3 className="font-serif text-lg mb-2">
                {t("admin.products.variants")}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {t("admin.products.variantsHelp")}
              </p>
              {editing.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2 items-center"
                >
                  <input
                    className="input sm:col-span-4"
                    placeholder={t("admin.products.variant.label")}
                    value={v.label}
                    onChange={(e) => {
                      const variants = [...editing.variants];
                      variants[idx] = { ...v, label: e.target.value };
                      setEditing({ ...editing, variants });
                    }}
                  />
                  <input
                    className="input sm:col-span-4 font-mono text-sm"
                    placeholder={t("admin.products.variant.sku")}
                    value={v.sku ?? ""}
                    onChange={(e) => {
                      const variants = [...editing.variants];
                      variants[idx] = {
                        ...v,
                        sku: e.target.value || null,
                      };
                      setEditing({ ...editing, variants });
                    }}
                  />
                  <input
                    type="number"
                    className="input sm:col-span-2"
                    placeholder={t("admin.products.variant.stock")}
                    value={v.stock}
                    onChange={(e) => {
                      const variants = [...editing.variants];
                      variants[idx] = { ...v, stock: Number(e.target.value) };
                      setEditing({ ...editing, variants });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const variants = editing.variants.filter((_, i) => i !== idx);
                      setEditing({ ...editing, variants });
                    }}
                    className="text-red-600 px-2 sm:col-span-2 text-left sm:text-right"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    variants: [
                      ...editing.variants,
                      { label: "", stock: 0, sku: null },
                    ],
                  })
                }
                className="text-sm text-brand-600 hover:underline"
              >
                {t("admin.products.addVariant")}
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={cancel} className="px-4 py-2 text-sm">
                {t("admin.products.cancel")}
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
              >
                {busy ? t("admin.products.saving") : t("admin.products.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e6d2a8;
          border-radius: 4px;
          padding: 6px 10px;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm ${full ? "col-span-2" : ""}`}>
      <span className="text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
