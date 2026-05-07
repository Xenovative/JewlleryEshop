import Link from "next/link";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";
import { getT } from "@/lib/i18n.server";
import { enforceShopFrontendEnabled } from "@/lib/frontendMode";

export default async function SuccessPage() {
  await enforceShopFrontendEnabled();
  const t = await getT();
  return (
    <div className="text-center py-16">
      <ClearCartOnMount />
      <h1 className="font-serif text-3xl text-brand-700">{t("success.title")}</h1>
      <p className="mt-4 text-gray-600">{t("success.body")}</p>
      <Link
        href="/"
        className="inline-block mt-8 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded"
      >
        {t("success.cta")}
      </Link>
    </div>
  );
}
