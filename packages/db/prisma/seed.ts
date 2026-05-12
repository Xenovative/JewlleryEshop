import "../src/sqliteDatabaseUrl";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { slug: "rings", name: "Rings" },
    { slug: "necklaces", name: "Necklaces" },
    { slug: "earrings", name: "Earrings" },
    { slug: "bracelets", name: "Bracelets" },
    { slug: "other", name: "Other" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const rings = await prisma.category.findUniqueOrThrow({ where: { slug: "rings" } });
  const necklaces = await prisma.category.findUniqueOrThrow({ where: { slug: "necklaces" } });
  const earrings = await prisma.category.findUniqueOrThrow({ where: { slug: "earrings" } });
  const bracelets = await prisma.category.findUniqueOrThrow({ where: { slug: "bracelets" } });

  const products = [
    {
      slug: "solitaire-diamond-ring",
      name: "Solitaire Diamond Ring",
      description: "A classic solitaire diamond ring set in 18k yellow gold.",
      currency: "hkd",
      priceCents: 129900,
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
      stock: 0,
      material: "18k gold",
      gemstone: "diamond",
      weightGrams: 3.4,
      categoryId: rings.id,
      variants: [
        { label: "Size 5", stock: 2 },
        { label: "Size 6", stock: 3 },
        { label: "Size 7", stock: 4 },
        { label: "Size 8", stock: 1 },
      ],
    },
    {
      slug: "pearl-pendant-necklace",
      name: "Pearl Pendant Necklace",
      description: "Freshwater pearl on a delicate sterling silver chain.",
      currency: "hkd",
      priceCents: 8900,
      imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
      stock: 12,
      material: "sterling silver",
      gemstone: "pearl",
      weightGrams: 4.1,
      categoryId: necklaces.id,
    },
    {
      slug: "ruby-stud-earrings",
      name: "Ruby Stud Earrings",
      description: "Brilliant-cut rubies in a classic 4-prong setting.",
      currency: "hkd",
      priceCents: 24500,
      imageUrl: "https://images.unsplash.com/photo-1635767582909-345c6c0fa4f1?w=800",
      stock: 6,
      material: "14k gold",
      gemstone: "ruby",
      weightGrams: 1.8,
      categoryId: earrings.id,
    },
    {
      slug: "tennis-bracelet",
      name: "Tennis Bracelet",
      description: "A timeless line of cubic zirconia in rhodium-plated silver.",
      currency: "hkd",
      priceCents: 15900,
      imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800",
      stock: 8,
      material: "sterling silver",
      gemstone: "cubic zirconia",
      weightGrams: 12.0,
      categoryId: bracelets.id,
      buyable: true,
      rentable: true,
      rentPricingType: "tiered",
      rentCopiesCount: 3,
      waiverFeeCents: null,
    },
    {
      slug: "emerald-statement-necklace",
      name: "Emerald Statement Necklace",
      description: "A red-carpet emerald necklace, set in 18k gold. Available for rent only.",
      currency: "hkd",
      priceCents: 2500000,
      imageUrl: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800",
      stock: 0,
      material: "18k gold",
      gemstone: "emerald",
      weightGrams: 25.0,
      categoryId: necklaces.id,
      buyable: false,
      rentable: true,
      rentPricingType: "tiered",
      rentCopiesCount: 1,
      waiverFeeCents: null,
    },
    {
      slug: "diamond-tiara",
      name: "Diamond Tiara",
      description: "An heirloom-quality diamond tiara for the most important occasions.",
      currency: "hkd",
      priceCents: 8800000,
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
      stock: 0,
      material: "platinum",
      gemstone: "diamond",
      weightGrams: 65.0,
      categoryId: necklaces.id,
      buyable: false,
      rentable: true,
      rentPricingType: "tiered",
      rentCopiesCount: 1,
      waiverFeeCents: null,
    },
  ];

  for (const p of products) {
    const { variants, tiers, ...rest } = p as typeof p & {
      variants?: { label: string; stock: number }[];
      tiers?: { label: string; days: number; priceCents: number }[];
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: rest,
      create: rest,
    });
    if (variants?.length) {
      await prisma.variant.deleteMany({ where: { productId: product.id } });
      for (const v of variants) {
        await prisma.variant.create({ data: { ...v, productId: product.id } });
      }
    }
    if (tiers?.length) {
      await prisma.rentalTier.deleteMany({ where: { productId: product.id } });
      for (const t of tiers) {
        await prisma.rentalTier.create({ data: { ...t, productId: product.id } });
      }
    } else {
      await prisma.rentalTier.deleteMany({ where: { productId: product.id } });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
