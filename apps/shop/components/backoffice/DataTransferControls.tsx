"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function DataTransferControls({
  exportHref,
  importHref,
}: {
  exportHref: string;
  importHref: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onPickFile = () => fileRef.current?.click();

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(importHref, { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Import failed");
      } else {
        setMessage(
          `Imported ${data.imported ?? 0} row(s), failed ${data.failed ?? 0} row(s).`
        );
        router.refresh();
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <a
        href={exportHref}
        className="text-sm border border-brand-200 rounded px-3 py-1.5 hover:bg-brand-50"
      >
        Export CSV
      </a>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onFileSelected}
      />
      <button
        type="button"
        onClick={onPickFile}
        disabled={busy}
        className="text-sm border border-brand-200 rounded px-3 py-1.5 hover:bg-brand-50 disabled:opacity-50"
      >
        {busy ? "Importing..." : "Import CSV"}
      </button>
      {message && <span className="text-xs text-gray-600">{message}</span>}
    </div>
  );
}
