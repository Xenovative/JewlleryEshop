"use client";

import { useSearchParams } from "next/navigation";
import { useT } from "@/components/I18nProvider";

export function ProductSearchBar({
  action,
  className = "",
}: {
  action: string;
  className?: string;
}) {
  const t = useT();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category")?.trim();

  return (
    <form action={action} method="get" className={`flex gap-2 items-stretch ${className}`}>
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <label htmlFor="rent-product-search" className="sr-only">
        {t("search.placeholder")}
      </label>
      <input
        id="rent-product-search"
        type="search"
        name="q"
        defaultValue={q}
        placeholder={t("search.placeholder")}
        autoComplete="off"
        className="flex-1 min-w-0 border border-brand-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
      />
      <button
        type="submit"
        className="shrink-0 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition"
      >
        {t("search.submit")}
      </button>
    </form>
  );
}
