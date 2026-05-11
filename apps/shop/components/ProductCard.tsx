import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { CHECKOUT_CURRENCY } from "@lumiere/db/commerce";

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
  currency: _currency,
  imageUrl,
  locale = "en-US",
}: Props) {
  return (
    <Link
      href={`/product/${slug}`}
      className="interactive-card group block bg-white rounded-lg overflow-hidden border border-brand-100 hover:border-brand-500 hover:shadow-md motion-safe:hover:-translate-y-0.5"
    >
      <div className="aspect-square bg-brand-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-out motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg">{name}</h3>
        <p className="text-brand-700 mt-1">
          {formatPrice(priceCents, CHECKOUT_CURRENCY, locale)}
        </p>
      </div>
    </Link>
  );
}
