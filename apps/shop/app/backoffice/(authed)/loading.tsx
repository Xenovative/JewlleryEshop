export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-brand-100 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-white border border-brand-100 rounded" />
        ))}
      </div>
      <div className="h-64 bg-white border border-brand-100 rounded" />
    </div>
  );
}
