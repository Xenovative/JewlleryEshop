import type { Metadata } from "next";
import { getSettings } from "@lumiere/db";
import { redirect } from "next/navigation";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";
import { rentStorefrontHomeUrl } from "@/lib/rentBase";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Rental" };
}

/** Shop no longer hosts rental content; send visitors to the rental storefront. */
export default async function ShopRentalRedirectPage() {
  await enforceShopFrontendEnabled();
  const settings = await getSettings();
  if (!settings.rentalEnabled) {
    redirect("/");
  }
  redirect(rentStorefrontHomeUrl());
}
