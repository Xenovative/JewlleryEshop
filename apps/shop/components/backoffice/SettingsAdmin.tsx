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
  bankFpsInstructions: string | null;
  kpayAlipayBaseUrl: string | null;
  adminPhone: string | null;
  twilioAccountSidMasked: string | null;
  twilioAuthTokenMasked: string | null;
  twilioFromNumber: string | null;
  twilioAccountSidEnvFallback: boolean;
  twilioAuthTokenEnvFallback: boolean;
  twilioFromNumberEnvFallback: boolean;
  genericGatewayBaseUrl: string | null;
  genericGatewayWebhookSecretMasked: string | null;
  genericGatewayLabel: string | null;
  totpEnabled: boolean;
  whatsappCheckoutNumber: string | null;
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
  const [rentalPct8Anchor, setRentalPct8Anchor] = useState(
    String(props.rental7DayPercentOfPrice)
  );
  const [rentalDepositPct, setRentalDepositPct] = useState(
    String(props.rentalDepositPercentOfPrice)
  );
  const [bankFps, setBankFps] = useState(props.bankFpsInstructions ?? "");
  const [kpayUrl, setKpayUrl] = useState(props.kpayAlipayBaseUrl ?? "");
  const [savingAlt, setSavingAlt] = useState(false);
  const [altMsg, setAltMsg] = useState<string | null>(null);
  const [savingFrontend, setSavingFrontend] = useState(false);
  const [frontendMsg, setFrontendMsg] = useState<string | null>(null);
  const [adminPhone, setAdminPhone] = useState(props.adminPhone ?? "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<string | null>(null);
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioFromNumberInput, setTwilioFromNumberInput] = useState(props.twilioFromNumber ?? "");
  const [savingTwilio, setSavingTwilio] = useState(false);
  const [twilioMsg, setTwilioMsg] = useState<string | null>(null);
  const [genericGatewayBaseUrlInput, setGenericGatewayBaseUrlInput] = useState(props.genericGatewayBaseUrl ?? "");
  const [genericGatewayLabelInput, setGenericGatewayLabelInput] = useState(props.genericGatewayLabel ?? "");
  const [genericGatewayWebhookSecretInput, setGenericGatewayWebhookSecretInput] = useState("");
  const [savingGenericGateway, setSavingGenericGateway] = useState(false);
  const [genericGatewayMsg, setGenericGatewayMsg] = useState<string | null>(null);
  const [payTab, setPayTab] = useState<"stripe" | "bank_fps" | "kpay" | "whatsapp" | "gateway">("stripe");
  const [whatsappNumberInput, setWhatsappNumberInput] = useState(props.whatsappCheckoutNumber ?? "");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null);

  useEffect(() => {
    setRentalPct4(String(props.rental4DayPercentOfPrice));
    setRentalPct8Anchor(String(props.rental7DayPercentOfPrice));
    setRentalDepositPct(String(props.rentalDepositPercentOfPrice));
  }, [
    props.rental4DayPercentOfPrice,
    props.rental7DayPercentOfPrice,
    props.rentalDepositPercentOfPrice,
  ]);

  useEffect(() => {
    setBankFps(props.bankFpsInstructions ?? "");
    setKpayUrl(props.kpayAlipayBaseUrl ?? "");
  }, [props.bankFpsInstructions, props.kpayAlipayBaseUrl]);

  useEffect(() => {
    setShopEnabled(props.shopEnabled);
    setRentalEnabled(props.rentalEnabled);
  }, [props.shopEnabled, props.rentalEnabled]);

  useEffect(() => {
    setAdminPhone(props.adminPhone ?? "");
  }, [props.adminPhone]);

  useEffect(() => {
    setTwilioFromNumberInput(props.twilioFromNumber ?? "");
  }, [props.twilioFromNumber]);

  useEffect(() => {
    setGenericGatewayBaseUrlInput(props.genericGatewayBaseUrl ?? "");
    setGenericGatewayLabelInput(props.genericGatewayLabel ?? "");
  }, [props.genericGatewayBaseUrl, props.genericGatewayLabel]);

  useEffect(() => {
    setWhatsappNumberInput(props.whatsappCheckoutNumber ?? "");
  }, [props.whatsappCheckoutNumber]);

  const pct4n = Number(rentalPct4);
  const pct8AnchorN = Number(rentalPct8Anchor);
  const depositN = Number(rentalDepositPct);
  const rentalPct4Changed =
    Number.isInteger(pct4n) &&
    pct4n >= 1 &&
    pct4n <= 100 &&
    pct4n !== props.rental4DayPercentOfPrice;
  const rentalPct8AnchorChanged =
    Number.isInteger(pct8AnchorN) &&
    pct8AnchorN >= 1 &&
    pct8AnchorN <= 100 &&
    pct8AnchorN !== props.rental7DayPercentOfPrice;
  const rentalDepositPctChanged =
    Number.isInteger(depositN) &&
    depositN >= 0 &&
    depositN <= 100 &&
    depositN !== props.rentalDepositPercentOfPrice;

  const frontendChanged =
    shopEnabled !== props.shopEnabled || rentalEnabled !== props.rentalEnabled;

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
    if (!rentalPct4Changed && !rentalPct8AnchorChanged && !rentalDepositPctChanged) return;
    setSavingRentPct(true);
    setRentPctMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...(rentalPct4Changed ? { rental4DayPercentOfPrice: pct4n } : {}),
        ...(rentalPct8AnchorChanged ? { rental7DayPercentOfPrice: pct8AnchorN } : {}),
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

  const saveAltPayments = async () => {
    setSavingAlt(true);
    setAltMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        bankFpsInstructions: bankFps,
        kpayAlipayBaseUrl: kpayUrl,
      }),
    });
    setSavingAlt(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAltMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setAltMsg(t("admin.settings.savedDot"));
    router.refresh();
  };

  const saveWhatsappCheckout = async () => {
    setSavingWhatsapp(true);
    setWhatsappMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        whatsappCheckoutNumber: whatsappNumberInput.trim() || "",
      }),
    });
    setSavingWhatsapp(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setWhatsappMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setWhatsappMsg(t("admin.settings.savedDot"));
    router.refresh();
  };

  const saveFrontendModes = async () => {
    if (!frontendChanged) return;
    setSavingFrontend(true);
    setFrontendMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ shopEnabled, rentalEnabled }),
    });
    setSavingFrontend(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFrontendMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setFrontendMsg(t("admin.settings.savedDot"));
    router.refresh();
  };

  const saveAdminPhone = async () => {
    const trimmed = adminPhone.trim();
    if (trimmed === (props.adminPhone ?? "")) return;
    setSavingPhone(true);
    setPhoneMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ adminPhone: trimmed || null }),
    });
    setSavingPhone(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPhoneMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setPhoneMsg(t("admin.settings.savedDot"));
    router.refresh();
  };

  const saveTwilio = async () => {
    const payload: Record<string, string | null> = {};
    if (twilioAccountSid.trim() !== "") payload.twilioAccountSid = twilioAccountSid.trim();
    if (twilioAuthToken.trim() !== "") payload.twilioAuthToken = twilioAuthToken.trim();
    const fromTrimmed = twilioFromNumberInput.trim();
    if (fromTrimmed !== (props.twilioFromNumber ?? "")) {
      payload.twilioFromNumber = fromTrimmed || null;
    }
    if (Object.keys(payload).length === 0) return;
    setSavingTwilio(true);
    setTwilioMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSavingTwilio(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setTwilioMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setTwilioAccountSid("");
    setTwilioAuthToken("");
    setTwilioMsg(t("admin.settings.savedDot"));
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

  const saveGenericGateway = async () => {
    const payload: Record<string, string | null> = {};
    const urlTrimmed = genericGatewayBaseUrlInput.trim();
    const labelTrimmed = genericGatewayLabelInput.trim();
    const secretTrimmed = genericGatewayWebhookSecretInput.trim();
    if (urlTrimmed !== (props.genericGatewayBaseUrl ?? "")) {
      payload.genericGatewayBaseUrl = urlTrimmed || null;
    }
    if (labelTrimmed !== (props.genericGatewayLabel ?? "")) {
      payload.genericGatewayLabel = labelTrimmed || null;
    }
    if (secretTrimmed !== "") payload.genericGatewayWebhookSecret = secretTrimmed;
    if (Object.keys(payload).length === 0) return;
    setSavingGenericGateway(true);
    setGenericGatewayMsg(null);
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSavingGenericGateway(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setGenericGatewayMsg(data.error ?? t("admin.settings.saveFailed"));
      return;
    }
    setGenericGatewayWebhookSecretInput("");
    setGenericGatewayMsg(t("admin.settings.savedDot"));
    router.refresh();
  };

  const clearTwilioField = async (field: "twilioAccountSid" | "twilioAuthToken" | "twilioFromNumber") => {
    if (!confirm(t("admin.settings.confirmClear"))) return;
    const res = await fetch("/api/backoffice/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [field]: "" }),
    });
    if (res.ok) router.refresh();
  };

  const clearGenericGatewayField = async (field: "genericGatewayWebhookSecret") => {
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

      <section className="bg-white border border-brand-100 rounded-lg overflow-hidden">
        <div className="px-6 pt-6 pb-0">
          <h2 className="font-serif text-xl">{t("admin.settings.paymentSettings")}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("admin.settings.paymentSettingsBlurb")}</p>
        </div>

        <div className="mt-4 flex border-b border-brand-100 overflow-x-auto">
          {(
            [
              ["stripe",  t("admin.settings.tabStripe")],
              ["bank_fps", t("admin.settings.tabBank")],
              ["kpay",    t("admin.settings.tabKpay")],
              ["whatsapp", t("admin.settings.tabWhatsapp")],
              ["gateway", t("admin.settings.tabGateway")],
            ] as [typeof payTab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPayTab(id)}
              className={[
                "shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                payTab === id
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-brand-600 hover:border-brand-300",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {payTab === "stripe" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{t("admin.settings.stripeBlurb")}</p>
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
              <div className="pt-2 space-y-3">
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
                  <span className="text-gray-600">{t("admin.settings.newWebhookSecret")}</span>
                  <input
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="whsec_…"
                    className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
                  />
                </label>
                {stripeMsg && (
                  <p className={`text-sm ${savedFlag ? "text-green-700" : "text-red-600"}`}>
                    {stripeMsg}
                  </p>
                )}
                <button
                  onClick={saveStripe}
                  disabled={savingStripe || (!stripeKey && !webhookSecret)}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
                >
                  {savingStripe ? t("admin.settings.saving") : t("admin.settings.saveStripe")}
                </button>
              </div>
            </div>
          )}

          {payTab === "bank_fps" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{t("admin.settings.altPaymentsBlurb")}</p>
              <label className="block text-sm">
                <span className="text-gray-600">{t("admin.settings.bankFpsInstructions")}</span>
                <textarea
                  value={bankFps}
                  onChange={(e) => setBankFps(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-xs"
                />
              </label>
              {altMsg && (
                <p className={`text-sm ${
                  altMsg === t("admin.settings.savedDot") ? "text-green-700" : "text-red-600"
                }`}>
                  {altMsg}
                </p>
              )}
              <button
                type="button"
                onClick={saveAltPayments}
                disabled={savingAlt}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
              >
                {savingAlt ? t("admin.settings.saving") : t("admin.settings.saveAltPayments")}
              </button>
            </div>
          )}

          {payTab === "kpay" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{t("admin.settings.altPaymentsBlurb")}</p>
              <label className="block text-sm">
                <span className="text-gray-600">{t("admin.settings.kpayAlipayBaseUrl")}</span>
                <input
                  value={kpayUrl}
                  onChange={(e) => setKpayUrl(e.target.value)}
                  placeholder="https://…"
                  className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
                />
              </label>
              {altMsg && (
                <p className={`text-sm ${
                  altMsg === t("admin.settings.savedDot") ? "text-green-700" : "text-red-600"
                }`}>
                  {altMsg}
                </p>
              )}
              <button
                type="button"
                onClick={saveAltPayments}
                disabled={savingAlt}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
              >
                {savingAlt ? t("admin.settings.saving") : t("admin.settings.saveAltPayments")}
              </button>
            </div>
          )}

          {payTab === "whatsapp" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{t("admin.settings.whatsappCheckoutBlurb")}</p>
              <label className="block text-sm">
                <span className="text-gray-600">{t("admin.settings.whatsappCheckoutNumber")}</span>
                <input
                  value={whatsappNumberInput}
                  onChange={(e) => {
                    setWhatsappMsg(null);
                    setWhatsappNumberInput(e.target.value);
                  }}
                  placeholder="85291234567"
                  className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
                />
              </label>
              {whatsappMsg && (
                <p
                  className={`text-sm ${
                    whatsappMsg === t("admin.settings.savedDot")
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {whatsappMsg}
                </p>
              )}
              <button
                type="button"
                onClick={() => void saveWhatsappCheckout()}
                disabled={savingWhatsapp}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
              >
                {savingWhatsapp ? t("admin.settings.saving") : t("admin.settings.saveWhatsappCheckout")}
              </button>
            </div>
          )}

          {payTab === "gateway" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{t("admin.settings.genericGatewayBlurb")}</p>
              <div className="rounded bg-brand-50 border border-brand-100 px-3 py-2 text-xs font-mono break-all">
                {typeof window !== "undefined" ? window.location.origin : ""}/api/generic-gateway/webhook
              </div>
              <KeyRow
                label={t("admin.settings.genericGatewayWebhookSecret")}
                masked={props.genericGatewayWebhookSecretMasked}
                fallback={false}
                onClear={() => clearGenericGatewayField("genericGatewayWebhookSecret")}
              />
              <div className="pt-2 space-y-3">
                <label className="block text-sm">
                  <span className="text-gray-600">{t("admin.settings.genericGatewayBaseUrl")}</span>
                  <input
                    value={genericGatewayBaseUrlInput}
                    onChange={(e) => { setGenericGatewayMsg(null); setGenericGatewayBaseUrlInput(e.target.value); }}
                    placeholder="https://..."
                    className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-gray-600">{t("admin.settings.genericGatewayLabel")}</span>
                  <input
                    value={genericGatewayLabelInput}
                    onChange={(e) => { setGenericGatewayMsg(null); setGenericGatewayLabelInput(e.target.value); }}
                    placeholder="Pay via WooCommerce"
                    className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 text-sm"
                  />
                  <span className="mt-1 block text-xs text-gray-500">{t("admin.settings.genericGatewayLabelHint")}</span>
                </label>
                <label className="block text-sm">
                  <span className="text-gray-600">{t("admin.settings.newGenericGatewayWebhookSecret")}</span>
                  <input
                    value={genericGatewayWebhookSecretInput}
                    onChange={(e) => { setGenericGatewayMsg(null); setGenericGatewayWebhookSecretInput(e.target.value); }}
                    placeholder="..."
                    className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
                  />
                </label>
                {genericGatewayMsg && (
                  <p className={`text-sm ${
                    genericGatewayMsg === t("admin.settings.savedDot") ? "text-green-700" : "text-red-600"
                  }`}>
                    {genericGatewayMsg}
                  </p>
                )}
                <button
                  type="button"
                  onClick={saveGenericGateway}
                  disabled={
                    savingGenericGateway ||
                    (!genericGatewayWebhookSecretInput &&
                      genericGatewayBaseUrlInput.trim() === (props.genericGatewayBaseUrl ?? "") &&
                      genericGatewayLabelInput.trim() === (props.genericGatewayLabel ?? ""))
                  }
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
                >
                  {savingGenericGateway ? t("admin.settings.saving") : t("admin.settings.saveGenericGateway")}
                </button>
              </div>
            </div>
          )}
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
            <span className="text-gray-600">{t("admin.settings.rentalPct8Anchor")}</span>
            <input
              type="number"
              min={1}
              max={100}
              value={rentalPct8Anchor}
              onChange={(e) => setRentalPct8Anchor(e.target.value)}
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
            (!rentalPct4Changed && !rentalPct8AnchorChanged && !rentalDepositPctChanged)
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
              onChange={(e) => {
                setFrontendMsg(null);
                setShopEnabled(e.target.checked);
              }}
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
              onChange={(e) => {
                setFrontendMsg(null);
                setRentalEnabled(e.target.checked);
              }}
              className="h-4 w-4 accent-brand-600"
            />
          </label>
        </div>
        {frontendMsg && (
          <p
            className={`text-sm mt-4 ${
              frontendMsg === t("admin.settings.savedDot") ? "text-green-700" : "text-red-600"
            }`}
          >
            {frontendMsg}
          </p>
        )}
        <button
          type="button"
          onClick={saveFrontendModes}
          disabled={savingFrontend || !frontendChanged}
          className="mt-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
        >
          {savingFrontend ? t("admin.settings.saving") : t("admin.settings.saveFrontend")}
        </button>
      </section>

      <section className="bg-white border border-brand-100 rounded-lg p-6">
        <h2 className="font-serif text-xl">{t("admin.settings.smsAlerts")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("admin.settings.smsAlertsBlurb")}</p>

        <KeyRow
          label={t("admin.settings.twilioAccountSid")}
          masked={props.twilioAccountSidMasked}
          fallback={props.twilioAccountSidEnvFallback}
          onClear={() => clearTwilioField("twilioAccountSid")}
        />
        <KeyRow
          label={t("admin.settings.twilioAuthToken")}
          masked={props.twilioAuthTokenMasked}
          fallback={props.twilioAuthTokenEnvFallback}
          onClear={() => clearTwilioField("twilioAuthToken")}
        />
        <KeyRow
          label={t("admin.settings.twilioFromNumber")}
          masked={props.twilioFromNumber}
          fallback={props.twilioFromNumberEnvFallback}
          onClear={() => clearTwilioField("twilioFromNumber")}
        />

        <div className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="text-gray-600">{t("admin.settings.newTwilioAccountSid")}</span>
            <input
              value={twilioAccountSid}
              onChange={(e) => {
                setTwilioMsg(null);
                setTwilioAccountSid(e.target.value);
              }}
              placeholder="AC..."
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t("admin.settings.newTwilioAuthToken")}</span>
            <input
              value={twilioAuthToken}
              onChange={(e) => {
                setTwilioMsg(null);
                setTwilioAuthToken(e.target.value);
              }}
              placeholder="..."
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-gray-600">{t("admin.settings.newTwilioFromNumber")}</span>
            <input
              value={twilioFromNumberInput}
              onChange={(e) => {
                setTwilioMsg(null);
                setTwilioFromNumberInput(e.target.value);
              }}
              placeholder="+852..."
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
            />
          </label>
          {twilioMsg && (
            <p
              className={`text-sm ${
                twilioMsg === t("admin.settings.savedDot") ? "text-green-700" : "text-red-600"
              }`}
            >
              {twilioMsg}
            </p>
          )}
          <button
            type="button"
            onClick={saveTwilio}
            disabled={
              savingTwilio ||
              (!twilioAccountSid && !twilioAuthToken && twilioFromNumberInput.trim() === (props.twilioFromNumber ?? ""))
            }
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
          >
            {savingTwilio ? t("admin.settings.saving") : t("admin.settings.saveTwilio")}
          </button>
        </div>

        <div className="mt-8 border-t border-brand-100 pt-6">
          <label className="block text-sm">
            <span className="text-gray-600">{t("admin.settings.adminPhone")}</span>
            <input
              value={adminPhone}
              onChange={(e) => {
                setPhoneMsg(null);
                setAdminPhone(e.target.value);
              }}
              placeholder="+85212345678"
              className="mt-1 block w-full border border-brand-200 rounded px-3 py-2 font-mono text-sm"
            />
            <span className="mt-1 block text-xs text-gray-500">{t("admin.settings.adminPhoneHint")}</span>
          </label>
          {phoneMsg && (
            <p
              className={`text-sm mt-3 ${
                phoneMsg === t("admin.settings.savedDot") ? "text-green-700" : "text-red-600"
              }`}
            >
              {phoneMsg}
            </p>
          )}
          <button
            type="button"
            onClick={saveAdminPhone}
            disabled={savingPhone || adminPhone.trim() === (props.adminPhone ?? "")}
            className="mt-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
          >
            {savingPhone ? t("admin.settings.saving") : t("admin.settings.savePhone")}
          </button>
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
