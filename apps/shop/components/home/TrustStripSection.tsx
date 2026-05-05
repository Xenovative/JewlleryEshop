type Props = {
  items: string[];
};

export function TrustStripSection({ items }: Props) {
  const visible = items.map((s) => s.trim()).filter(Boolean);
  if (visible.length === 0) return null;
  return (
    <section
      aria-label="Trust signals"
      className="bg-white border border-brand-100 rounded-lg px-6 py-4"
    >
      <ul className="flex flex-wrap items-center justify-around gap-x-6 gap-y-2 text-sm text-gray-700">
        {visible.map((label, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500"
            />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
