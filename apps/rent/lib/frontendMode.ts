import { getSettings } from "@lumiere/db";
import { redirect } from "next/navigation";

export async function enforceRentalFrontendEnabled() {
  const settings = await getSettings();
  if (settings.rentalEnabled) return;
  if (settings.shopEnabled) {
    redirect(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
  }
  redirect(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
}

