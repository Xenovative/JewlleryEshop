import { z } from "zod";

/**
 * Lite, forward-compatible homepage configuration.
 *
 * Stored as JSON in `Settings.shopHomeJson` / `Settings.rentalHomeJson`.
 * Validated with Zod and merged with defaults so missing fields never crash
 * the storefront. Adding a new section type requires:
 *   1. Add the literal to {Shop,Rental}SectionId.
 *   2. Render it in HomeSectionRenderer.
 *   3. (Optional) Surface it in the backoffice editor.
 */

export const SHOP_SECTION_IDS = [
  "trustStrip",
  "categoryGrid",
  "featuredProducts",
  "rentalPromo",
  "ctaBanner",
] as const;
export type ShopSectionId = (typeof SHOP_SECTION_IDS)[number];

export const RENTAL_SECTION_IDS = [
  "trustStrip",
  "howItWorks",
  "featuredRentals",
  "policyHighlights",
  "ctaBanner",
] as const;
export type RentalSectionId = (typeof RENTAL_SECTION_IDS)[number];

const heroSchema = z.object({
  eyebrow: z.string().max(80).default(""),
  title: z.string().max(160).default(""),
  subtitle: z.string().max(320).default(""),
  primaryCtaLabel: z.string().max(40).default(""),
  primaryCtaHref: z.string().max(200).default(""),
  secondaryCtaLabel: z.string().max(40).default(""),
  secondaryCtaHref: z.string().max(200).default(""),
  imageUrl: z.string().max(500).default(""),
});

export type HeroConfig = z.infer<typeof heroSchema>;

const trustItemSchema = z.object({
  label: z.string().max(80).default(""),
});

const sectionEntrySchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean().default(true),
});

const stepSchema = z.object({
  title: z.string().max(80).default(""),
  body: z.string().max(240).default(""),
});

const featuredSourceSchema = z
  .enum(["featured", "latest"])
  .default("featured");

const ctaBannerSchema = z.object({
  title: z.string().max(120).default(""),
  body: z.string().max(240).default(""),
  ctaLabel: z.string().max(40).default(""),
  ctaHref: z.string().max(200).default(""),
});

export const shopHomeConfigSchema = z.object({
  hero: heroSchema,
  trustStrip: z.array(trustItemSchema).max(8).default([]),
  sections: z.array(sectionEntrySchema).default([]),
  featuredSource: featuredSourceSchema,
  rentalPromo: ctaBannerSchema,
  ctaBanner: ctaBannerSchema,
});

export type ShopHomeConfig = z.infer<typeof shopHomeConfigSchema>;

export const rentalHomeConfigSchema = z.object({
  hero: heroSchema,
  trustStrip: z.array(trustItemSchema).max(8).default([]),
  sections: z.array(sectionEntrySchema).default([]),
  featuredSource: featuredSourceSchema,
  steps: z.array(stepSchema).max(6).default([]),
  policies: z.array(stepSchema).max(6).default([]),
  ctaBanner: ctaBannerSchema,
});

export type RentalHomeConfig = z.infer<typeof rentalHomeConfigSchema>;

export const SHOP_HOME_DEFAULT: ShopHomeConfig = {
  hero: {
    eyebrow: "",
    title: "",
    subtitle: "",
    primaryCtaLabel: "",
    primaryCtaHref: "/category/rings",
    secondaryCtaLabel: "",
    secondaryCtaHref: "",
    imageUrl: "",
  },
  trustStrip: [{ label: "" }, { label: "" }, { label: "" }],
  sections: SHOP_SECTION_IDS.map((id) => ({ id, enabled: true })),
  featuredSource: "featured",
  rentalPromo: {
    title: "",
    body: "",
    ctaLabel: "",
    ctaHref: "",
  },
  ctaBanner: {
    title: "",
    body: "",
    ctaLabel: "",
    ctaHref: "/category/rings",
  },
};

export const RENTAL_HOME_DEFAULT: RentalHomeConfig = {
  hero: {
    eyebrow: "",
    title: "",
    subtitle: "",
    primaryCtaLabel: "",
    primaryCtaHref: "#featuredRentals",
    secondaryCtaLabel: "",
    secondaryCtaHref: "/",
    imageUrl: "",
  },
  trustStrip: [{ label: "" }, { label: "" }, { label: "" }],
  sections: RENTAL_SECTION_IDS.map((id) => ({ id, enabled: true })),
  featuredSource: "featured",
  steps: [
    { title: "", body: "" },
    { title: "", body: "" },
    { title: "", body: "" },
  ],
  policies: [
    { title: "", body: "" },
    { title: "", body: "" },
    { title: "", body: "" },
  ],
  ctaBanner: {
    title: "",
    body: "",
    ctaLabel: "",
    ctaHref: "#featuredRentals",
  },
};

/**
 * Reconcile section ordering with the canonical list of allowed ids.
 * - Drops unknown ids
 * - Appends any new built-in ids that aren't in the saved order, so newly
 *   shipped sections become visible automatically.
 */
function reconcileSections<S extends string>(
  saved: { id: string; enabled: boolean }[],
  allowed: readonly S[]
): { id: S; enabled: boolean }[] {
  const seen = new Set<S>();
  const out: { id: S; enabled: boolean }[] = [];
  for (const s of saved) {
    if ((allowed as readonly string[]).includes(s.id) && !seen.has(s.id as S)) {
      out.push({ id: s.id as S, enabled: s.enabled });
      seen.add(s.id as S);
    }
  }
  for (const id of allowed) {
    if (!seen.has(id)) out.push({ id, enabled: true });
  }
  return out;
}

export function parseShopHomeConfig(json: string | null): ShopHomeConfig {
  let parsed: unknown = null;
  if (json) {
    try {
      parsed = JSON.parse(json);
    } catch {
      parsed = null;
    }
  }
  const result = shopHomeConfigSchema.safeParse(parsed);
  const base = result.success ? result.data : SHOP_HOME_DEFAULT;
  return {
    ...base,
    sections: reconcileSections(base.sections, SHOP_SECTION_IDS),
  };
}

export function parseRentalHomeConfig(json: string | null): RentalHomeConfig {
  let parsed: unknown = null;
  if (json) {
    try {
      parsed = JSON.parse(json);
    } catch {
      parsed = null;
    }
  }
  const result = rentalHomeConfigSchema.safeParse(parsed);
  const base = result.success ? result.data : RENTAL_HOME_DEFAULT;
  return {
    ...base,
    sections: reconcileSections(base.sections, RENTAL_SECTION_IDS),
  };
}

/** Same-origin path or absolute URL; safe-ish guard for hero/CTA links. */
export function safeHref(href: string, fallback: string): string {
  const trimmed = href.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return fallback;
}
