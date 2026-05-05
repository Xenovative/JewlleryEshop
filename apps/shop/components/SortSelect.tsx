"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useT } from "./I18nProvider";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useT();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params.toString());
    if (e.target.value) next.set("sort", e.target.value);
    else next.delete("sort");
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <select
      value={value}
      onChange={onChange}
      className="border border-brand-200 rounded px-2 py-1 bg-white text-sm"
    >
      <option value="">{t("category.sort.newest")}</option>
      <option value="price-asc">{t("category.sort.priceAsc")}</option>
      <option value="price-desc">{t("category.sort.priceDesc")}</option>
    </select>
  );
}
