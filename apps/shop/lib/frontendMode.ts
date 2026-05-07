import { getSettings } from "@lumiere/db";
import { redirect } from "next/navigation";
import { rentStorefrontHomeUrl } from "@/lib/rentBase";

export async function enforceShopFrontendEnabled() {
  const settings = await getSettings();
  if (settings.shopEnabled) return;
  if (settings.rentalEnabled) {
    redirect(rentStorefrontHomeUrl());
  }
  redirect("/backoffice/settings");
}

