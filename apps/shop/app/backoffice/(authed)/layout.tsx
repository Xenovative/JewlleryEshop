import Link from "next/link";
import { getT } from "@/lib/i18n.server";
import { requireRole, roleAtLeast } from "@/lib/rbac";
import type { DictKey } from "@/lib/i18n";
import type { Role } from "@/lib/session";

type NavItem = { href: string; key: DictKey; min?: Role };
type NavGroup = { titleKey: DictKey; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    titleKey: "bo.nav.operations",
    items: [
      { href: "/backoffice", key: "bo.nav.dashboard" },
      { href: "/backoffice/inventory", key: "bo.nav.inventory" },
      { href: "/backoffice/orders", key: "bo.nav.orders" },
      { href: "/backoffice/bookings", key: "bo.nav.bookings" },
      { href: "/backoffice/calendar", key: "bo.nav.calendar" },
    ],
  },
  {
    titleKey: "bo.nav.catalog",
    items: [
      { href: "/backoffice/products", key: "bo.nav.products" },
      { href: "/backoffice/categories", key: "bo.nav.categories" },
    ],
  },
  {
    titleKey: "bo.nav.people",
    items: [
      { href: "/backoffice/customers", key: "bo.nav.customers" },
      { href: "/backoffice/users", key: "bo.nav.users", min: "owner" },
    ],
  },
  {
    titleKey: "bo.nav.insights",
    items: [
      { href: "/backoffice/reports", key: "bo.nav.reports" },
      { href: "/backoffice/audit", key: "bo.nav.audit", min: "staff" },
    ],
  },
  {
    titleKey: "bo.nav.system",
    items: [
      { href: "/backoffice/settings", key: "bo.nav.settings", min: "owner" },
    ],
  },
  {
    titleKey: "bo.nav.storefront",
    items: [
      { href: "/backoffice/storefront", key: "bo.nav.storefrontEditor", min: "staff" },
      { href: "/backoffice/storefront-preview", key: "bo.nav.storefrontPreview" },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getT();
  const me = await requireRole("viewer");

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-4">
        <div>
          <h2 className="font-serif text-lg leading-tight">{t("bo.brand")}</h2>
          <p className="text-xs text-gray-500">Shop · Rent</p>
        </div>

        <div className="text-xs text-gray-600 border border-brand-100 rounded p-2 bg-white">
          <div className="text-gray-500">{t("bo.signedInAs")}</div>
          <div className="font-medium">{me.username}</div>
          <div className="text-[10px] uppercase tracking-wide text-brand-600">
            {t(`bo.users.role.${me.role}` as DictKey)}
          </div>
          <form action="/api/backoffice/auth/logout" method="POST" className="mt-2">
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-red-600"
            >
              {t("bo.signOut")}
            </button>
          </form>
        </div>

        <nav className="space-y-3">
          {NAV.map((g) => {
            const visible = g.items.filter(
              (it) => !it.min || roleAtLeast(me.role, it.min)
            );
            if (visible.length === 0) return null;
            return (
              <div key={String(g.titleKey)}>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  {t(g.titleKey)}
                </div>
                <ul className="flex flex-col text-sm">
                  {visible.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className="block py-1 hover:text-brand-600"
                      >
                        {t(it.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
