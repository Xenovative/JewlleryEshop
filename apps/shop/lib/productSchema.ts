import { z } from "zod";

/** Optional SKU: trim, empty → null, max 64 chars */
const skuOptional = z.preprocess((val) => {
  if (val === null || val === undefined) return null;
  if (typeof val !== "string") return null;
  const t = val.trim();
  return t.length === 0 ? null : t;
}, z.union([z.string().max(64, "SKU too long"), z.null()]));

/** https URL or same-origin path (e.g. uploaded assets under /uploads/...) */
export const assetUrl = z
  .string()
  .min(1)
  .refine(
    (v) =>
      /^https?:\/\//i.test(v) || (v.startsWith("/") && !v.includes("..")),
    "Invalid image URL"
  );

export const ProductBody = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  imageUrl: assetUrl,
  stock: z.number().int().nonnegative(),
  sku: skuOptional,
  material: z.string().nullable().optional(),
  gemstone: z.string().nullable().optional(),
  weightGrams: z.number().nullable().optional(),
  categoryId: z.string().min(1),
  variants: z
    .array(
      z.object({
        label: z.string().min(1),
        stock: z.number().int().nonnegative(),
        sku: skuOptional,
      })
    )
    .default([]),
  buyable: z.boolean().default(true),
  rentable: z.boolean().default(false),
  rentPricingType: z.enum(["daily", "tiered", "fixed"]).nullable().optional(),
  rentDailyCents: z.number().int().nonnegative().nullable().optional(),
  rentFixedCents: z.number().int().nonnegative().nullable().optional(),
  rentFixedDurationDays: z.number().int().positive().nullable().optional(),
  rentCopiesCount: z.number().int().nonnegative().default(0),
  waiverFeeCents: z.number().int().nonnegative().nullable().optional(),
  rentalTiers: z
    .array(
      z.object({
        label: z.string().min(1),
        days: z.number().int().positive(),
        priceCents: z.number().int().nonnegative(),
      })
    )
    .default([]),

  // Catalog / showcase
  featured: z.boolean().default(false),
  position: z.number().int().default(0),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  lowStockThreshold: z.number().int().nonnegative().nullable().optional(),
  images: z
    .array(
      z.object({
        url: assetUrl,
        alt: z.string().nullable().optional(),
      })
    )
    .default([]),
});

export type ProductBody = z.infer<typeof ProductBody>;
