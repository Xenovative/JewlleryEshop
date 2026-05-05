type Step = { title: string; body: string };

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  steps: Step[];
};

export function HowItWorksSection({ id, title, subtitle, steps }: Props) {
  const visible = steps.filter((s) => s.title.trim() || s.body.trim());
  if (visible.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
      </div>
      <ol className="grid md:grid-cols-3 gap-5">
        {visible.map((s, i) => (
          <li
            key={i}
            className="relative bg-white border border-brand-100 rounded-lg p-6"
          >
            <div className="flex items-baseline gap-3">
              <span
                aria-hidden="true"
                className="font-serif text-3xl text-brand-300 select-none"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-lg flex-1">{s.title}</h3>
            </div>
            {s.body && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{s.body}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
