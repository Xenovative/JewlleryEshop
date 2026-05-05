import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { ProductBody } from "@/lib/productSchema";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const json = await req.json().catch(() => null);
  const parsed = ProductBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 }
    );
  }
  const { variants, rentalTiers, images, ...data } = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        variants: { create: variants },
        rentalTiers: { create: rentalTiers },
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? null,
            position: i,
          })),
        },
      },
    });
    await audit(user, "create", "Product", product.id, undefined, parsed.data);
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create" }, { status: 500 });
  }
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      category: true,
      rentalTiers: true,
      images: { orderBy: { position: "asc" } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(products);
}
