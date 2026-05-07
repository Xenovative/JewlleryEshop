import { CartView } from "@/components/CartView";
import { getT } from "@/lib/i18n.server";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";

export default async function CartPage() {
  await enforceShopFrontendEnabled();
  const t = await getT();
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">{t("cart.title")}</h1>
      <CartView />
    </div>
  );
}
