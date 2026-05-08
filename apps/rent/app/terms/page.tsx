import type { Metadata } from "next";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: `${t("nav.terms")} · ${t("brand.name")}`,
    description: "Basic terms and conditions for rental services and website use.",
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
          By using this website and placing a booking, you agree to these terms.
          We may update these terms from time to time.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">2. Rental Eligibility and Care</h2>
        <p className="text-gray-700">
          Rented items remain the property of the company. Customers must use
          and handle all items with due care and follow all care instructions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">3. Booking, Deposits, and Payments</h2>
        <p className="text-gray-700">
          Bookings are subject to availability and confirmation. Rental fees and
          any refundable security deposit are collected at checkout as stated.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-lg">4. Returns and Inspection</h2>
        <p className="text-gray-700">
          Unless otherwise stated, rental returns are handled in person at the
          designated office, where items are inspected upon return.
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
