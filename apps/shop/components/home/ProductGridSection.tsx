import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string;
};

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  emptyText?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  locale: string;
};

export function ProductGridSection({
  id,
  title,
  subtitle,
  products,
  emptyText,
  viewAllLabel,
  viewAllHref,
  locale,
}: Props) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-end justify-between flex-wrap gap-2 mb-5">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {viewAllLabel && viewAllHref && products.length > 0 && (
          <Link
            href={viewAllHref}
            className="text-sm text-brand-700 hover:underline font-medium"
          >
            {viewAllLabel} →
          </Link>
        )}
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500 italic">{emptyText ?? ""}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
