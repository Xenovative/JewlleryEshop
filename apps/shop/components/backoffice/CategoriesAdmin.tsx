"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

type Cat = {
  id: string;
  slug: string;
  name: string;
  _count: { products: number };
};

export function CategoriesAdmin({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const t = useT();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setError(null);
    const res = await fetch("/api/backoffice/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("admin.categories.failed"));
      return;
    }
    setName("");
    setSlug("");
    router.refresh();
  };

  const update = async (id: string, name: string, slug: string) => {
    const res = await fetch(`/api/backoffice/categories/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    if (res.ok) router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm(t("admin.categories.confirmDelete"))) return;
    const res = await fetch(`/api/backoffice/categories/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? t("admin.categories.deleteFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">{t("admin.categories.title")}</h1>

      <div className="bg-white border border-brand-100 rounded p-4 flex gap-2 items-end">
        <label className="flex-1 text-sm">
          <span className="text-gray-600">{t("admin.categories.name")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-brand-200 rounded px-2 py-1"
          />
        </label>
        <label className="flex-1 text-sm">
          <span className="text-gray-600">{t("admin.categories.slug")}</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full border border-brand-200 rounded px-2 py-1"
          />
        </label>
        <button
          onClick={create}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
        >
          {t("admin.categories.add")}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border border-brand-100 rounded">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left">
            <tr>
              <th className="px-3 py-2">{t("admin.categories.name")}</th>
              <th className="px-3 py-2">{t("admin.categories.slug")}</th>
              <th className="px-3 py-2">{t("admin.categories.col.products")}</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <Row key={c.id} cat={c} onSave={update} onDelete={remove} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  cat,
  onSave,
  onDelete,
}: {
  cat: Cat;
  onSave: (id: string, name: string, slug: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useT();
  const [name, setName] = useState(cat.name);
  const [slug, setSlug] = useState(cat.slug);
  return (
    <tr className="border-t border-brand-100">
      <td className="px-3 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-brand-200 rounded px-2 py-1"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border border-brand-200 rounded px-2 py-1"
        />
      </td>
      <td className="px-3 py-2">{cat._count.products}</td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={() => onSave(cat.id, name, slug)}
          className="text-brand-600 hover:underline mr-3"
        >
          {t("admin.categories.save")}
        </button>
        <button
          onClick={() => onDelete(cat.id)}
          className="text-red-600 hover:underline"
        >
          {t("admin.categories.delete")}
        </button>
      </td>
    </tr>
  );
}
