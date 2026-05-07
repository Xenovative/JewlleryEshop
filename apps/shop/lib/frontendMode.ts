import { getSettings } from "@lumiere/db";
import { redirect } from "next/navigation";

export async function enforceShopFrontendEnabled() {
  const settings = await getSettings();
  if (settings.shopEnabled) return;
  if (settings.rentalEnabled) {
    redirect(process.env.RENT_BASE_URL ?? "/rental");
  }
  redirect("/backoffice/settings");
}

