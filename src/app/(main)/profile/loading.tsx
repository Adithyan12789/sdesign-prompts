export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8">
      <div className="h-4 w-24 animate-pulse bg-bronze/20" />
      <div className="mt-3 h-10 w-64 animate-pulse bg-charcoal/10" />
      <div className="mt-2 h-4 w-48 animate-pulse bg-stone-warm/15" />
      <div className="mt-14 h-8 w-40 animate-pulse bg-charcoal/10" />
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse bg-stone-warm/10" />
        ))}
      </div>
    </div>
  );
}
