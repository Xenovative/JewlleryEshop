"use client";

import { useMemo, useState } from "react";
import { useT } from "@/components/I18nProvider";
import type { DictKey } from "@/lib/i18n";
import {
  SHOP_SECTION_IDS,
  RENTAL_SECTION_IDS,
  type ShopHomeConfig,
  type RentalHomeConfig,
  type ShopSectionId,
  type RentalSectionId,
} from "@/lib/homepageConfig";

type Tab = "shop" | "rental";

const SECTION_LABEL_KEYS: Record<string, DictKey> = {
  trustStrip: "bo.storefrontEditor.sectionLabel.trustStrip",
  categoryGrid: "bo.storefrontEditor.sectionLabel.categoryGrid",
  featuredProducts: "bo.storefrontEditor.sectionLabel.featuredProducts",
  rentalPromo: "bo.storefrontEditor.sectionLabel.rentalPromo",
  ctaBanner: "bo.storefrontEditor.sectionLabel.ctaBanner",
  howItWorks: "bo.storefrontEditor.sectionLabel.howItWorks",
  featuredRentals: "bo.storefrontEditor.sectionLabel.featuredRentals",
  policyHighlights: "bo.storefrontEditor.sectionLabel.policyHighlights",
};

export function StorefrontEditor({
  initialShop,
  initialRental,
  rentStorefrontHomeUrl: rentHomeUrl,
}: {
  initialShop: ShopHomeConfig;
  initialRental: RentalHomeConfig;
  /** Public rental app origin (e.g. NEXT_PUBLIC or server-passed RENT_BASE_URL). */
  rentStorefrontHomeUrl: string;
}) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("shop");
  const [shop, setShop] = useState<ShopHomeConfig>(initialShop);
  const [rental, setRental] = useState<RentalHomeConfig>(initialRental);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saved" }
    | { kind: "error"; msg: string }
  >({ kind: "idle" });

  const save = async () => {
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/backoffice/storefront", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          page: tab,
          config: tab === "shop" ? shop : rental,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("bo.storefrontEditor.saveFailed"));
      setStatus({ kind: "saved" });
    } catch (e) {
      setStatus({ kind: "error", msg: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm(t("bo.storefrontEditor.resetConfirm"))) return;
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/backoffice/storefront", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ page: tab }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("bo.storefrontEditor.saveFailed"));
      if (tab === "shop") setShop(data.config as ShopHomeConfig);
      else setRental(data.config as RentalHomeConfig);
      setStatus({ kind: "saved" });
    } catch (e) {
      setStatus({ kind: "error", msg: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl">{t("bo.storefrontEditor.title")}</h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {t("bo.storefrontEditor.intro")}
        </p>
      </div>

      <div className="flex gap-2 border-b border-brand-100">
        <TabButton
          active={tab === "shop"}
          label={t("bo.storefrontEditor.tab.shop")}
          onClick={() => setTab("shop")}
        />
        <TabButton
          active={tab === "rental"}
          label={t("bo.storefrontEditor.tab.rental")}
          onClick={() => setTab("rental")}
        />
        <div className="ml-auto flex items-center gap-3 pb-2 text-sm">
          <a
            className="text-brand-600 hover:underline"
            href={tab === "shop" ? "/" : rentHomeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tab === "shop"
              ? t("bo.storefrontEditor.preview.shop")
              : t("bo.storefrontEditor.preview.rental")}{" "}
            ↗
          </a>
        </div>
      </div>

      {tab === "shop" ? (
        <ShopForm value={shop} onChange={setShop} />
      ) : (
        <RentalForm value={rental} onChange={setRental} />
      )}

      <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-white border-t border-brand-100 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-brand-700 text-white px-5 py-2 rounded font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          {saving ? t("bo.storefrontEditor.saving") : t("bo.storefrontEditor.save")}
        </button>
        <button
          onClick={reset}
          disabled={saving}
          className="text-sm text-gray-600 hover:text-red-600 disabled:opacity-50"
        >
          {t("bo.storefrontEditor.reset")}
        </button>
        {status.kind === "saved" && (
          <span className="text-sm text-green-700">
            {t("bo.storefrontEditor.saved")}
          </span>
        )}
        {status.kind === "error" && (
          <span className="text-sm text-red-600">{status.msg}</span>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition " +
        (active
          ? "border-brand-600 text-brand-700"
          : "border-transparent text-gray-500 hover:text-brand-600")
      }
    >
      {label}
    </button>
  );
}

function ShopForm({
  value,
  onChange,
}: {
  value: ShopHomeConfig;
  onChange: (v: ShopHomeConfig) => void;
}) {
  const t = useT();
  const setHero = (patch: Partial<ShopHomeConfig["hero"]>) =>
    onChange({ ...value, hero: { ...value.hero, ...patch } });
  const setTrust = (idx: number, label: string) => {
    const next = [...value.trustStrip];
    next[idx] = { label };
    onChange({ ...value, trustStrip: next });
  };
  const ensureTrust = useMemo(() => {
    if (value.trustStrip.length >= 3) return value.trustStrip;
    const padded = [...value.trustStrip];
    while (padded.length < 3) padded.push({ label: "" });
    return padded;
  }, [value.trustStrip]);

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...value.sections];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange({ ...value, sections: next });
  };
  const toggleSection = (idx: number) => {
    const next = [...value.sections];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    onChange({ ...value, sections: next });
  };

  return (
    <div className="space-y-8">
      <FieldGroup title={t("bo.storefrontEditor.section.hero")}>
        <Field
          label={t("bo.storefrontEditor.field.eyebrow")}
          value={value.hero.eyebrow}
          onChange={(v) => setHero({ eyebrow: v })}
        />
        <Field
          label={t("bo.storefrontEditor.field.title")}
          value={value.hero.title}
          onChange={(v) => setHero({ title: v })}
        />
        <Field
          label={t("bo.storefrontEditor.field.subtitle")}
          value={value.hero.subtitle}
          onChange={(v) => setHero({ subtitle: v })}
          textarea
        />
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label={t("bo.storefrontEditor.field.primaryCtaLabel")}
            value={value.hero.primaryCtaLabel}
            onChange={(v) => setHero({ primaryCtaLabel: v })}
          />
          <Field
            label={t("bo.storefrontEditor.field.primaryCtaHref")}
            value={value.hero.primaryCtaHref}
            onChange={(v) => setHero({ primaryCtaHref: v })}
            mono
          />
          <Field
            label={t("bo.storefrontEditor.field.secondaryCtaLabel")}
            value={value.hero.secondaryCtaLabel}
            onChange={(v) => setHero({ secondaryCtaLabel: v })}
          />
          <Field
            label={t("bo.storefrontEditor.field.secondaryCtaHref")}
            value={value.hero.secondaryCtaHref}
            onChange={(v) => setHero({ secondaryCtaHref: v })}
            mono
          />
        </div>
        <Field
          label={t("bo.storefrontEditor.field.heroImageUrl")}
          value={value.hero.imageUrl}
          onChange={(v) => setHero({ imageUrl: v })}
          mono
        />
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.trustStrip")}>
        <div className="grid md:grid-cols-3 gap-3">
          {ensureTrust.slice(0, 5).map((it, i) => (
            <Field
              key={i}
              label={t("bo.storefrontEditor.field.trustItem", { n: i + 1 })}
              value={it.label}
              onChange={(v) => setTrust(i, v)}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.featuredSource")}>
        <FeaturedSourcePicker
          value={value.featuredSource}
          onChange={(v) => onChange({ ...value, featuredSource: v })}
        />
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.rentalPromo")}>
        <Field
          label={t("bo.storefrontEditor.field.title")}
          value={value.rentalPromo.title}
          onChange={(v) =>
            onChange({ ...value, rentalPromo: { ...value.rentalPromo, title: v } })
          }
        />
        <Field
          label={t("bo.storefrontEditor.field.body")}
          value={value.rentalPromo.body}
          onChange={(v) =>
            onChange({ ...value, rentalPromo: { ...value.rentalPromo, body: v } })
          }
          textarea
        />
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label={t("bo.storefrontEditor.field.ctaLabel")}
            value={value.rentalPromo.ctaLabel}
            onChange={(v) =>
              onChange({
                ...value,
                rentalPromo: { ...value.rentalPromo, ctaLabel: v },
              })
            }
          />
          <Field
            label={t("bo.storefrontEditor.field.ctaHref")}
            value={value.rentalPromo.ctaHref}
            onChange={(v) =>
              onChange({
                ...value,
                rentalPromo: { ...value.rentalPromo, ctaHref: v },
              })
            }
            mono
          />
        </div>
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.ctaBanner")}>
        <Field
          label={t("bo.storefrontEditor.field.title")}
          value={value.ctaBanner.title}
          onChange={(v) =>
            onChange({ ...value, ctaBanner: { ...value.ctaBanner, title: v } })
          }
        />
        <Field
          label={t("bo.storefrontEditor.field.body")}
          value={value.ctaBanner.body}
          onChange={(v) =>
            onChange({ ...value, ctaBanner: { ...value.ctaBanner, body: v } })
          }
          textarea
        />
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label={t("bo.storefrontEditor.field.ctaLabel")}
            value={value.ctaBanner.ctaLabel}
            onChange={(v) =>
              onChange({
                ...value,
                ctaBanner: { ...value.ctaBanner, ctaLabel: v },
              })
            }
          />
          <Field
            label={t("bo.storefrontEditor.field.ctaHref")}
            value={value.ctaBanner.ctaHref}
            onChange={(v) =>
              onChange({
                ...value,
                ctaBanner: { ...value.ctaBanner, ctaHref: v },
              })
            }
            mono
          />
        </div>
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.layout")}>
        <p className="text-xs text-gray-500 mb-3">
          {t("bo.storefrontEditor.layout.help")}
        </p>
        <SectionList
          sections={value.sections}
          allowedIds={SHOP_SECTION_IDS as unknown as string[]}
          onMove={moveSection}
          onToggle={toggleSection}
        />
      </FieldGroup>
    </div>
  );
}

function RentalForm({
  value,
  onChange,
}: {
  value: RentalHomeConfig;
  onChange: (v: RentalHomeConfig) => void;
}) {
  const t = useT();
  const setHero = (patch: Partial<RentalHomeConfig["hero"]>) =>
    onChange({ ...value, hero: { ...value.hero, ...patch } });
  const setTrust = (idx: number, label: string) => {
    const next = [...value.trustStrip];
    next[idx] = { label };
    onChange({ ...value, trustStrip: next });
  };
  const ensureTrust = useMemo(() => {
    if (value.trustStrip.length >= 3) return value.trustStrip;
    const padded = [...value.trustStrip];
    while (padded.length < 3) padded.push({ label: "" });
    return padded;
  }, [value.trustStrip]);

  const setStep = (
    key: "steps" | "policies",
    idx: number,
    patch: Partial<{ title: string; body: string }>
  ) => {
    const arr = [...value[key]];
    arr[idx] = { ...arr[idx], ...patch };
    onChange({ ...value, [key]: arr });
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...value.sections];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange({ ...value, sections: next });
  };
  const toggleSection = (idx: number) => {
    const next = [...value.sections];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    onChange({ ...value, sections: next });
  };

  const ensureSteps = useMemo(() => {
    const padded = [...value.steps];
    while (padded.length < 3) padded.push({ title: "", body: "" });
    return padded;
  }, [value.steps]);
  const ensurePolicies = useMemo(() => {
    const padded = [...value.policies];
    while (padded.length < 3) padded.push({ title: "", body: "" });
    return padded;
  }, [value.policies]);

  return (
    <div className="space-y-8">
      <FieldGroup title={t("bo.storefrontEditor.section.hero")}>
        <Field
          label={t("bo.storefrontEditor.field.eyebrow")}
          value={value.hero.eyebrow}
          onChange={(v) => setHero({ eyebrow: v })}
        />
        <Field
          label={t("bo.storefrontEditor.field.title")}
          value={value.hero.title}
          onChange={(v) => setHero({ title: v })}
        />
        <Field
          label={t("bo.storefrontEditor.field.subtitle")}
          value={value.hero.subtitle}
          onChange={(v) => setHero({ subtitle: v })}
          textarea
        />
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label={t("bo.storefrontEditor.field.primaryCtaLabel")}
            value={value.hero.primaryCtaLabel}
            onChange={(v) => setHero({ primaryCtaLabel: v })}
          />
          <Field
            label={t("bo.storefrontEditor.field.primaryCtaHref")}
            value={value.hero.primaryCtaHref}
            onChange={(v) => setHero({ primaryCtaHref: v })}
            mono
          />
          <Field
            label={t("bo.storefrontEditor.field.secondaryCtaLabel")}
            value={value.hero.secondaryCtaLabel}
            onChange={(v) => setHero({ secondaryCtaLabel: v })}
          />
          <Field
            label={t("bo.storefrontEditor.field.secondaryCtaHref")}
            value={value.hero.secondaryCtaHref}
            onChange={(v) => setHero({ secondaryCtaHref: v })}
            mono
          />
        </div>
        <Field
          label={t("bo.storefrontEditor.field.heroImageUrl")}
          value={value.hero.imageUrl}
          onChange={(v) => setHero({ imageUrl: v })}
          mono
        />
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.trustStrip")}>
        <div className="grid md:grid-cols-3 gap-3">
          {ensureTrust.slice(0, 5).map((it, i) => (
            <Field
              key={i}
              label={t("bo.storefrontEditor.field.trustItem", { n: i + 1 })}
              value={it.label}
              onChange={(v) => setTrust(i, v)}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.featuredSource")}>
        <FeaturedSourcePicker
          value={value.featuredSource}
          onChange={(v) => onChange({ ...value, featuredSource: v })}
        />
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.steps")}>
        {ensureSteps.slice(0, 3).map((s, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-3 mb-3">
            <Field
              label={t("bo.storefrontEditor.field.stepTitle", { n: i + 1 })}
              value={s.title}
              onChange={(v) => setStep("steps", i, { title: v })}
            />
            <div className="md:col-span-2">
              <Field
                label={t("bo.storefrontEditor.field.stepBody", { n: i + 1 })}
                value={s.body}
                onChange={(v) => setStep("steps", i, { body: v })}
                textarea
              />
            </div>
          </div>
        ))}
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.policies")}>
        {ensurePolicies.slice(0, 3).map((p, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-3 mb-3">
            <Field
              label={t("bo.storefrontEditor.field.policyTitle", { n: i + 1 })}
              value={p.title}
              onChange={(v) => setStep("policies", i, { title: v })}
            />
            <div className="md:col-span-2">
              <Field
                label={t("bo.storefrontEditor.field.policyBody", { n: i + 1 })}
                value={p.body}
                onChange={(v) => setStep("policies", i, { body: v })}
                textarea
              />
            </div>
          </div>
        ))}
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.ctaBanner")}>
        <Field
          label={t("bo.storefrontEditor.field.title")}
          value={value.ctaBanner.title}
          onChange={(v) =>
            onChange({ ...value, ctaBanner: { ...value.ctaBanner, title: v } })
          }
        />
        <Field
          label={t("bo.storefrontEditor.field.body")}
          value={value.ctaBanner.body}
          onChange={(v) =>
            onChange({ ...value, ctaBanner: { ...value.ctaBanner, body: v } })
          }
          textarea
        />
        <div className="grid md:grid-cols-2 gap-3">
          <Field
            label={t("bo.storefrontEditor.field.ctaLabel")}
            value={value.ctaBanner.ctaLabel}
            onChange={(v) =>
              onChange({
                ...value,
                ctaBanner: { ...value.ctaBanner, ctaLabel: v },
              })
            }
          />
          <Field
            label={t("bo.storefrontEditor.field.ctaHref")}
            value={value.ctaBanner.ctaHref}
            onChange={(v) =>
              onChange({
                ...value,
                ctaBanner: { ...value.ctaBanner, ctaHref: v },
              })
            }
            mono
          />
        </div>
      </FieldGroup>

      <FieldGroup title={t("bo.storefrontEditor.section.layout")}>
        <p className="text-xs text-gray-500 mb-3">
          {t("bo.storefrontEditor.layout.help")}
        </p>
        <SectionList
          sections={value.sections}
          allowedIds={RENTAL_SECTION_IDS as unknown as string[]}
          onMove={moveSection}
          onToggle={toggleSection}
        />
      </FieldGroup>
    </div>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-brand-100 rounded-lg p-5 space-y-3">
      <h3 className="font-medium text-sm text-gray-700">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  mono?: boolean;
}) {
  const className =
    "w-full border border-brand-200 rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none " +
    (mono ? "font-mono text-xs" : "");
  return (
    <label className="block">
      <span className="text-xs text-gray-600 mb-1 block">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function FeaturedSourcePicker({
  value,
  onChange,
}: {
  value: "featured" | "latest";
  onChange: (v: "featured" | "latest") => void;
}) {
  const t = useT();
  return (
    <div className="space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={value === "featured"}
          onChange={() => onChange("featured")}
        />
        <span>{t("bo.storefrontEditor.featuredSource.featured")}</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={value === "latest"}
          onChange={() => onChange("latest")}
        />
        <span>{t("bo.storefrontEditor.featuredSource.latest")}</span>
      </label>
    </div>
  );
}

function SectionList({
  sections,
  allowedIds,
  onMove,
  onToggle,
}: {
  sections: { id: string; enabled: boolean }[];
  allowedIds: string[];
  onMove: (idx: number, dir: -1 | 1) => void;
  onToggle: (idx: number) => void;
}) {
  const t = useT();
  const visible = sections.filter((s) => allowedIds.includes(s.id));
  return (
    <ul className="divide-y divide-brand-100 border border-brand-100 rounded">
      {visible.map((s, i) => {
        const labelKey = SECTION_LABEL_KEYS[s.id];
        const label = labelKey ? t(labelKey) : s.id;
        return (
          <li
            key={s.id}
            className="flex items-center gap-3 px-3 py-2 text-sm"
          >
            <span className="font-mono text-xs text-gray-400 w-6 text-right">
              {i + 1}
            </span>
            <span className="flex-1">{label}</span>
            <button
              type="button"
              onClick={() => onMove(i, -1)}
              disabled={i === 0}
              aria-label={t("bo.storefrontEditor.layout.up")}
              className="px-2 py-1 text-xs border border-brand-200 rounded hover:bg-brand-50 disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(i, 1)}
              disabled={i === visible.length - 1}
              aria-label={t("bo.storefrontEditor.layout.down")}
              className="px-2 py-1 text-xs border border-brand-200 rounded hover:bg-brand-50 disabled:opacity-30"
            >
              ↓
            </button>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={() => onToggle(i)}
              />
              <span>{t("bo.storefrontEditor.layout.show")}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export type { ShopSectionId, RentalSectionId };
