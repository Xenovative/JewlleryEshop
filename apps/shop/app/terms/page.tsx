import type { Metadata } from "next";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: `${t("nav.terms")} · ${t("brand.name")}`,
    description: "Basic terms and conditions for purchases and website use.",
  };
}

export default async function TermsPage() {
  const t = await getT();
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-serif text-3xl">{t("nav.terms")}</h1>
      <p className="text-sm text-gray-600">Last updated: 2026-05-08</p>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">1. General</h2>
        <p className="text-gray-700">
          By using this website and placing an order, you agree to these terms.
          We may update these terms from time to time.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">2. Product Information</h2>
        <p className="text-gray-700">
          We aim to keep product details and pricing accurate. Minor differences
          in color, finish, or dimensions may occur due to photography and
          handcrafted production.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">3. Orders and Payments</h2>
        <p className="text-gray-700">
          Orders are subject to acceptance and stock availability. Payments are
          processed securely via our payment provider.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">4. Shipping, Returns, and Rental</h2>
        <p className="text-gray-700">
          Shipping timelines are estimates. Return and rental conditions follow
          the policy shown at checkout, including any deposit or in-person return
          requirements for rental items.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">5. Contact</h2>
        <p className="text-gray-700">
          For questions, please contact our team using the phone, WhatsApp, or
          address details shown in the footer.
        </p>
      </section>
    </div>
  );
}
