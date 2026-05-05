type Policy = { title: string; body: string };

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  policies: Policy[];
};

export function PolicyHighlightsSection({
  id,
  title,
  subtitle,
  policies,
}: Props) {
  const visible = policies.filter((p) => p.title.trim() || p.body.trim());
  if (visible.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-8">
        <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">{subtitle}</p>
        )}
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {visible.map((p, i) => (
          <article
            key={i}
            className="bg-brand-50/40 border border-brand-100 rounded-lg p-6"
          >
            <h3 className="font-serif text-lg text-brand-800">{p.title}</h3>
            {p.body && (
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{p.body}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
