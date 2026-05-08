import { CheckoutView } from "@/components/CheckoutView";
import { getT } from "@/lib/i18n.server";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";

export default async function CheckoutPage() {
  await enforceShopFrontendEnabled();
  const t = await getT();
  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">{t("checkout.title")}</h1>
      <p className="text-sm text-gray-600 mb-6">{t("checkout.intro")}</p>
      <CheckoutView />
    </div>
  );
}
