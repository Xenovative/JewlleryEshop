import { getSettings } from "@lumiere/db";
import {
  parseShopHomeConfig,
  parseRentalHomeConfig,
} from "@/lib/homepageConfig";
import { StorefrontEditor } from "@/components/backoffice/StorefrontEditor";
import { requireRole } from "@/lib/rbac";
import { rentStorefrontHomeUrl } from "@/lib/rentBase";

export const dynamic = "force-dynamic";

export default async function StorefrontEditorPage() {
  await requireRole("staff");
  const s = await getSettings();
  const shop = parseShopHomeConfig(s.shopHomeJson);
  const rental = parseRentalHomeConfig(s.rentalHomeJson);
  return (
    <StorefrontEditor
      initialShop={shop}
      initialRental={rental}
      rentStorefrontHomeUrl={rentStorefrontHomeUrl()}
    />
  );
}
