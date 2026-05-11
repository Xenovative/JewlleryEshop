import Link from "next/link";
import type { DictKey } from "@/lib/i18n";

type Category = { id: string; slug: string; name: string };

type Props = {
  categories: Category[];
  title: string;
  catKeyMap: Record<string, DictKey>;
  t: (k: DictKey) => string;
};

export function CategoryGridSection({ categories, title, catKeyMap, t }: Props) {
  if (categories.length === 0) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((c) => {
          const key = catKeyMap[c.slug];
          return (
            <Link
              key={c.id}
              href={`/browse?category=${encodeURIComponent(c.slug)}`}
              className="interactive-card group bg-white border border-brand-100 rounded-lg p-6 text-center hover:border-brand-500 hover:shadow-md motion-safe:hover:-translate-y-0.5"
            >
              <span className="font-serif text-lg block">
                {key ? t(key) : c.name}
              </span>
              <span className="text-xs text-gray-500 mt-1 block group-hover:text-brand-600 transition">
                ↗
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
