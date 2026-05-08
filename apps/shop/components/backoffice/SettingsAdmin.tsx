"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

type Props = {
  stripeSecretKeyMasked: string | null;
  stripeWebhookSecretMasked: string | null;
  stripeSecretKeyEnvFallback: boolean;
  stripeWebhookSecretEnvFallback: boolean;
  shopEnabled: boolean;
  rentalEnabled: boolean;
  rental4DayPercentOfPrice: number;
  rental7DayPercentOfPrice: number;
  rentalDepositPercentOfPrice: number;
  totpEnabled: boolean;
};

export function SettingsAdmin(props: Props) {
  const router = useRouter();
  const t = useT();
  const [stripeKey, setStripeKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [savingStripe, setSavingStripe] = useState(false);
  const [stripeMsg, setStripeMsg] = useState<string | null>(null);
  const [savedFlag, setSavedFlag] = useState(false);
  const [savingRentPct, setSavingRentPct] = useState(false);
  const [rentPctMsg, setRentPctMsg] = useState<string | null>(null);
  const [shopEnabled, setShopEnabled] = useState(props.shopEnabled);
  const [rentalEnabled, setRentalEnabled] = useState(props.rentalEnabled);
  const [rentalPct4, setRentalPct4] = useState(String(props.rental4DayPercentOfPrice));
  const [rentalPct7, setRentalPct7] = useState(String(props.rental7DayPercentOfPrice));
  const [rentalDepositPct, setRentalDepositPct] = useState(
    String(props.rentalDepositPercentOfPrice)
  );

  useEffect(() => {
    setRentalPct4(String(props.rental4DayPercentOfPrice));
    setRentalPct7(String(props.rental7DayPercentOfPrice));
    setRentalDepositPct(String(props.rentalDepositPercentOfPrice));
  }, [
    props.rental4DayPercentOfPrice,
    props.rental7DayPercentOfPrice,
    props.rentalDepositPercentOfPrice,
  ]);

  const pct4n = Number(rentalPct4);
  const pct7n = Number(rentalPct7);
  const depositN = Number(rentalDepositPct);
  const rentalPct4Changed =
    Number.isInteger(pct4n) &&
    pct4n >= 1 &&
    pct4n <= 100 &&
    pct4n !== props.rental4DayPercentOfPrice;
  const rentalPct7Changed =
    Number.isInteger(pct7n) &&
    pct7n >= 1 &&
    pct7n <= 100 &&
    pct7n !== props.rental7DayPercentOfPrice;
  const rentalDepositPctChanged =
    Number.isInteger(depositN) &&
    depositN >= 0 &&
    depositN <= 100 &&
    depositN !== props.rentalDepositPercentOfPrice;

  const saveStripe = async () => {
    setSavingStripe(true);
    setStripeMsg(null);
    setSavedFlag(false);

    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...(stripeKey !== "" ? { stripeSecretKey: stripeKey } : {}),
        ...(webhookSecret !== "" ? { stripeWebhookSecret: webhookSecret } : {}),
        ...(shopEnabled !== props.shopEnabled ? { shopEnabled } : {}),
        ...(rentalEnabled !== props.rentalEnabled ? { rentalEnabled } : {}),
      }),
    });
    setSavingStripe(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStripeMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setStripeKey("");
    setWebhookSecret("");
    setSavedFlag(true);
    setStripeMsg(t("admin.settings.savedDot"));
    router.refresh();
  };

  const saveRentPct = async () => {
    if (!rentalPct4Changed && !rentalPct7Changed && !rentalDepositPctChanged) return;
    setSavingRentPct(true);
    setRentPctMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...(rentalPct4Changed ? { rental4DayPercentOfPrice: pct4n } : {}),
        ...(rentalPct7Changed ? { rental7DayPercentOfPrice: pct7n } : {}),
        ...(rentalDepositPctChanged ? { rentalDepositPercentOfPrice: depositN } : {}),
      }),
    });
    setSavingRentPct(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setRentPctMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setRentPctMsg(t("admin.settings.savedDot"));
    router.refresh();
  };

  const clearStripe = async (field: "stripeSecretKey" | "stripeWebhookSecret") => {
    if (!confirm(t("admin.settings.confirmClear"))) return;
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [field]: "" }),
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-2xl">{t("admin.settings.title")}</h1>

      <section className="bg-white border border-brand-100 rounded-lg p-6">
        <h2 className="font-serif text-xl">{t("admin.settings.stripe")}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("admin.settings.stripeBlurb")}
        </p>

        <KeyRow
          label={t("admin.settings.secretKey")}
          masked={props.stripeSecretKeyMasked}
          fallback={props.stripeSecretKeyEnvFallback}
          onClear={() => clearStripe("stripeSecretKey")}
        />
        <KeyRow
          label={t("admin.settings.webhookSecret")}
          masked={props.stripeWebhookSecretMasked}
          fallback={props.stripeWebhookSecretEnvFallback}
          onClear={() => clearStripe("stripeWebhookSecret")}
        />

        <div className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="text-gray-600">{t("admin.settings.newSecretKey")}</span>
            <input
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_live_… or sk_test_…"
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">
              {t("admin.settings.newWebhookSecret")}
            </span>
            <input
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="whsec_…"
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
            />
          </label>
          {stripeMsg && (
            <p
              className={`text-sm ${
                savedFlag ? "text-green-700" : "text-red-600"
              }`}
            >
              {stripeMsg}
            </p>
          )}
          <button
            onClick={saveStripe}
            disabled={
              savingStripe ||
              (!stripeKey &&
                !webhookSecret &&
                shopEnabled === props.shopEnabled &&
                rentalEnabled === props.rentalEnabled)
            }
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
          >
            {savingStripe
              ? t("admin.settings.saving")
              : t("admin.settings.saveStripe")}
          </button>
        </div>
      </section>

      <section className="bg-white border border-brand-100 rounded-lg p-6">
        <h2 className="font-serif text-xl">{t("admin.settings.rentalPricing")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("admin.settings.rentalPricingBlurb")}</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-gray-600">{t("admin.settings.rentalPct4")}</span>
            <input
              type="number"
              min={1}
              max={100}
              value={rentalPct4}
              onChange={(e) => setRentalPct4(e.target.value)}
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t("admin.settings.rentalPct7")}</span>
            <input
              type="number"
              min={1}
              max={100}
              value={rentalPct7}
              onChange={(e) => setRentalPct7(e.target.value)}
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-gray-600">{t("admin.settings.rentalDepositPct")}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={rentalDepositPct}
              onChange={(e) => setRentalDepositPct(e.target.value)}
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2"
            />
            <span className="mt-1 block text-xs text-gray-500">
              {t("admin.settings.rentalDepositPctHint")}
            </span>
          </label>
        </div>
        {rentPctMsg && (
          <p
            className={`text-sm mt-3 ${
              rentPctMsg === t("admin.settings.savedDot") ? "text-green-700" : "text-red-600"
            }`}
          >
            {rentPctMsg}
          </p>
        )}
        <button
          type="button"
          onClick={saveRentPct}
          disabled={
            savingRentPct ||
            (!rentalPct4Changed && !rentalPct7Changed && !rentalDepositPctChanged)
          }
          className="mt-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
        >
          {savingRentPct ? t("admin.settings.saving") : t("admin.settings.saveRentPct")}
        </button>
      </section>

      <section className="bg-white border border-brand-100 rounded-lg p-6">
        <h2 className="font-serif text-xl">{t("admin.settings.frontendModes")}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("admin.settings.frontendModesBlurb")}
        </p>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center justify-between gap-3 border border-brand-100 rounded p-3">
            <span>
              <strong>{t("admin.settings.shopFrontend")}</strong>
            </span>
            <input
              type="checkbox"
              checked={shopEnabled}
              onChange={(e) => setShopEnabled(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-brand-100 rounded p-3">
            <span>
              <strong>{t("admin.settings.rentalFrontend")}</strong>
            </span>
            <input
              type="checkbox"
              checked={rentalEnabled}
              onChange={(e) => setRentalEnabled(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
          </label>
        </div>
      </section>

      <TwoFactorSection enabled={props.totpEnabled} />

      <section>
        <button
          onClick={async () => {
            await fetch("/api/backoffice/auth/logout", { method: "POST" });
            window.location.href = "/backoffice/login";
          }}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          {t("admin.settings.signOut")}
        </button>
      </section>
    </div>
  );
}

function KeyRow({
  label,
  masked,
  fallback,
  onClear,
}: {
  label: string;
  masked: string | null;
  fallback: boolean;
  onClear: () => void;
}) {
  const t = useT();
  return (
    <div className="mt-4 flex items-center justify-between text-sm border-t border-brand-100 pt-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-gray-500">
          {masked ? (
            <>
              <span className="font-mono">{masked}</span>{" "}
              <span className="text-xs">{t("admin.settings.fromDb")}</span>
            </>
          ) : fallback ? (
            <span className="text-xs">{t("admin.settings.envFallback")}</span>
          ) : (
            <span className="text-xs text-red-600">{t("admin.settings.notSet")}</span>
          )}
        </div>
      </div>
      {masked && (
        <button onClick={onClear} className="text-red-600 hover:underline">
          {t("admin.settings.clear")}
        </button>
      )}
    </div>
  );
}

function TwoFactorSection({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const t = useT();
  const [setup, setSetup] = useState<{
    qrDataUrl: string;
    secret: string;
    uri: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSetup = async () => {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/backoffice/2fa/setup", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t("admin.settings.setupFailed"));
      return;
    }
    setSetup(data);
  };

  const enable = async () => {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/backoffice/2fa/enable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? t("admin.settings.enableFailed"));
      return;
    }
    setSetup(null);
    setCode("");
    router.refresh();
  };

  const disable = async () => {
    const c = prompt(t("admin.settings.disablePrompt"));
    if (!c) return;
    const res = await fetch("/api/backoffice/2fa/disable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: c }),
    });
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? t("admin.settings.disableFailed"));
    }
  };

  return (
    <section className="bg-white border border-brand-100 rounded-lg p-6">
      <h2 className="font-serif text-xl">{t("admin.settings.twofa")}</h2>
      <p className="text-sm text-gray-500 mt-1">{t("admin.settings.twofaBlurb")}</p>

      <div className="mt-4">
        <span className="text-sm">
          {t("admin.settings.status")}{" "}
          <strong className={enabled ? "text-green-700" : "text-gray-700"}>
            {enabled ? t("admin.settings.enabled") : t("admin.settings.disabled")}
          </strong>
        </span>
      </div>

      {!enabled && !setup && (
        <button
          onClick={startSetup}
          disabled={busy}
          className="mt-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
        >
          {busy ? t("admin.settings.starting") : t("admin.settings.setup2fa")}
        </button>
      )}

      {setup && (
        <div className="mt-6 space-y-3">
          <p className="text-sm">{t("admin.settings.scanInstructions")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setup.qrDataUrl}
            alt={t("admin.settings.qrAlt")}
            className="border border-brand-200 rounded"
          />
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer">
              {t("admin.settings.cantScan")}
            </summary>
            <code className="block mt-1 font-mono">{setup.secret}</code>
          </details>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-32 border border-brand-200 rounded px-3 py-2 tracking-widest text-center"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              onClick={enable}
              disabled={busy || code.length !== 6}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm mr-2"
            >
              {busy
                ? t("admin.settings.verifying")
                : t("admin.settings.confirmEnable")}
            </button>
            <button
              onClick={() => {
                setSetup(null);
                setCode("");
                setError(null);
              }}
              className="text-sm text-gray-500"
            >
              {t("admin.settings.cancel")}
            </button>
          </div>
        </div>
      )}

      {enabled && (
        <button
          onClick={disable}
          className="mt-4 text-red-600 hover:underline text-sm"
        >
          {t("admin.settings.disable2fa")}
        </button>
      )}
    </section>
  );
}
