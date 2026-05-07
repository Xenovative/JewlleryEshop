import { headers } from "next/headers";
import { BackofficeShell } from "./backoffice-shell";

const BO_PATH = "x-lumiere-bo-path";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const path = h.get(BO_PATH) ?? "";
  if (path === "/backoffice/login" || path.startsWith("/backoffice/login/")) {
    return <>{children}</>;
  }
  return <BackofficeShell>{children}</BackofficeShell>;
}
