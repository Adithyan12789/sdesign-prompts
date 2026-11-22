export default function ResourceDetailLoading() {
  return (
    <div className="pb-24">
      <div className="h-[52vh] w-full animate-pulse bg-charcoal/20" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-12 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-6">
          <div className="h-6 w-3/4 animate-pulse bg-stone-warm/20" />
          <div className="h-4 w-full animate-pulse bg-stone-warm/10" />
          <div className="h-4 w-5/6 animate-pulse bg-stone-warm/10" />
          <div className="mt-12 h-40 animate-pulse bg-charcoal/5" />
        </div>
        <div className="h-96 animate-pulse border border-line bg-parchment/40" />
      </div>
    </div>
  );
}
