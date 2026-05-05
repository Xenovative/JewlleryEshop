import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Props = {
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string;
  locale?: string;
};

export function ProductCard({
  slug,
  name,
  priceCents,
  currency,
  imageUrl,
  locale = "en-US",
}: Props) {
  return (
    <Link
      href={`/product/${slug}`}
      className="group block bg-white rounded-lg overflow-hidden border border-brand-100 hover:border-brand-500 transition"
    >
      <div className="aspect-square bg-brand-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg">{name}</h3>
        <p className="text-brand-700 mt-1">{formatPrice(priceCents, currency, locale)}</p>
      </div>
    </Link>
  );
}
