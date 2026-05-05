import { getT } from "@/lib/i18n.server";

export default async function HowItWorksPage() {
  const t = await getT();
  const steps: Array<["how.s1" | "how.s2" | "how.s3" | "how.s4", "how.s1.body" | "how.s2.body" | "how.s3.body" | "how.s4.body"]> = [
    ["how.s1", "how.s1.body"],
    ["how.s2", "how.s2.body"],
    ["how.s3", "how.s3.body"],
    ["how.s4", "how.s4.body"],
  ];
  return (
    <div className="prose max-w-none">
      <h1 className="font-serif text-3xl">{t("how.title")}</h1>
      <ol className="mt-6 space-y-4 list-decimal list-inside">
        {steps.map(([title, body]) => (
          <li key={title}>
            <strong>{t(title)}</strong> — {t(body)}
          </li>
        ))}
      </ol>
    </div>
  );
}
