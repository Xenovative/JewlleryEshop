"use client";

import { useState } from "react";

type Img = { url: string; alt: string | null };

export function ProductGallery({
  hero,
  images,
}: {
  hero: Img;
  images: Img[];
}) {
  const all: Img[] = images.length > 0 ? images : [hero];
  const [active, setActive] = useState(0);
  const current = all[active] ?? hero;

  return (
    <div>
      <div className="aspect-square bg-brand-50 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt ?? ""}
          className="w-full h-full object-cover"
        />
      </div>
      {all.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {all.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square rounded overflow-hidden border-2 ${
                i === active ? "border-brand-600" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
