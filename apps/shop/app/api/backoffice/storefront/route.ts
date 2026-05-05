import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import {
  parseShopHomeConfig,
  parseRentalHomeConfig,
  shopHomeConfigSchema,
  rentalHomeConfigSchema,
  SHOP_HOME_DEFAULT,
  RENTAL_HOME_DEFAULT,
  type ShopHomeConfig,
  type RentalHomeConfig,
} from "@/lib/homepageConfig";
import { z } from "zod";

export async function GET() {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const s = await getSettings();
  const shop = parseShopHomeConfig(s.shopHomeJson);
  const rental = parseRentalHomeConfig(s.rentalHomeJson);
  return NextResponse.json({ shop, rental });
}

const Body = z.object({
  page: z.enum(["shop", "rental"]),
  config: z.unknown(),
});

export async function PUT(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (parsed.data.page === "shop") {
    const cfg = shopHomeConfigSchema.safeParse(parsed.data.config);
    if (!cfg.success) {
      return NextResponse.json(
        { error: "Invalid shop config", details: cfg.error.format() },
        { status: 400 }
      );
    }
    const value: ShopHomeConfig = cfg.data;
    await updateSettings({ shopHomeJson: JSON.stringify(value) });
    await audit(user, "update", "Settings", "singleton", undefined, {
      page: "shopHome",
    });
    return NextResponse.json({ ok: true, config: value });
  }

  const cfg = rentalHomeConfigSchema.safeParse(parsed.data.config);
  if (!cfg.success) {
    return NextResponse.json(
      { error: "Invalid rental config", details: cfg.error.format() },
      { status: 400 }
    );
  }
  const value: RentalHomeConfig = cfg.data;
  await updateSettings({ rentalHomeJson: JSON.stringify(value) });
  await audit(user, "update", "Settings", "singleton", undefined, {
    page: "rentalHome",
  });
  return NextResponse.json({ ok: true, config: value });
}

const ResetBody = z.object({ page: z.enum(["shop", "rental"]) });

export async function DELETE(req: Request) {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;
  const user = guard;
  const json = await req.json().catch(() => null);
  const parsed = ResetBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (parsed.data.page === "shop") {
    await updateSettings({ shopHomeJson: null });
    await audit(user, "reset", "Settings", "singleton", undefined, {
      page: "shopHome",
    });
    return NextResponse.json({ ok: true, config: SHOP_HOME_DEFAULT });
  }
  await updateSettings({ rentalHomeJson: null });
  await audit(user, "reset", "Settings", "singleton", undefined, {
    page: "rentalHome",
  });
  return NextResponse.json({ ok: true, config: RENTAL_HOME_DEFAULT });
}
