import Stripe from "stripe";
import { getStripeSecretKey } from "./settings";

export async function getStripe(): Promise<Stripe> {
  const key = await getStripeSecretKey();
  if (!key) {
    throw new Error(
      "Stripe secret key is not configured. Set it in /admin/settings or via STRIPE_SECRET_KEY."
    );
  }
  return new Stripe(key);
}
