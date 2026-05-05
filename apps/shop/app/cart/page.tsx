import { CartView } from "@/components/CartView";
import { getT } from "@/lib/i18n.server";

export default async function CartPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">{t("cart.title")}</h1>
      <CartView />
    </div>
  );
}
