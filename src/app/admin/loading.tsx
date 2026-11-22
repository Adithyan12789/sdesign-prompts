export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse bg-charcoal/10" />
      <div className="h-4 w-72 animate-pulse bg-stone-warm/15" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse border border-line bg-parchment/30" />
        ))}
      </div>
    </div>
  );
}
