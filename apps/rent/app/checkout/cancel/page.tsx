import Link from "next/link";
import { getT } from "@/lib/i18n.server";

export default async function CancelPage() {
  const t = await getT();
  return (
    <div className="text-center py-16">
      <h1 className="font-serif text-3xl">{t("cancel.title")}</h1>
      <p className="mt-4 text-gray-600">{t("cancel.body")}</p>
      <Link
        href="/"
        className="inline-block mt-8 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded"
      >
        {t("cancel.cta")}
      </Link>
    </div>
  );
}
