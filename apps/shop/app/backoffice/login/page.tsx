import { LoginForm } from "@/components/backoffice/LoginForm";
import { getT } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const t = await getT();
  return (
    <div className="max-w-sm mx-auto py-12">
      <h1 className="font-serif text-3xl mb-1 text-center">{t("bo.brand")}</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        {t("admin.login.title")}
      </p>
      <LoginForm next={next ?? "/backoffice"} />
    </div>
  );
}
