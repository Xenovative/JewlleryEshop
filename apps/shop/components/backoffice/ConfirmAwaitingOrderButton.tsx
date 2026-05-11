"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

export function ConfirmAwaitingOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const t = useT();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    const res = await fetch(`/api/backoffice/orders/${orderId}/confirm-payment`, {
      method: "POST",
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      window.alert((data as { error?: string }).error ?? "Failed");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-xs bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-2 py-1 rounded"
    >
      {busy ? t("admin.orders.confirming") : t("admin.orders.confirmPayment")}
    </button>
  );
}
