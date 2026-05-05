"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export function CustomerNotes({
  id,
  initialNotes,
}: {
  id: string;
  initialNotes: string;
}) {
  const t = useT();
  const [notes, setNotes] = useState(initialNotes);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const save = async () => {
    setBusy(true);
    const res = await fetch(`/api/backoffice/customers/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setBusy(false);
    if (res.ok) setSavedAt(Date.now());
  };

  return (
    <div className="bg-white border border-brand-100 rounded p-4">
      <label className="block text-sm font-medium mb-1">
        {t("bo.customers.notes")}
      </label>
      <textarea
        value={notes}
        rows={4}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border border-brand-200 rounded px-3 py-2 text-sm"
        placeholder={t("bo.customers.notesPlaceholder")}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="text-sm bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-3 py-1 rounded"
        >
          {busy ? t("bo.customers.saving") : t("bo.customers.saveNotes")}
        </button>
        {savedAt && (
          <span className="text-xs text-green-700">
            {t("bo.customers.saved")}
          </span>
        )}
      </div>
    </div>
  );
}
