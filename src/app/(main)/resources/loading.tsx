import { ResourceCardSkeleton } from '@/components/ResourceCard';

export default function ResourcesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8">
      <div className="h-4 w-28 animate-pulse bg-bronze/20" />
      <div className="mt-3 h-12 w-96 animate-pulse bg-charcoal/10" />
      <div className="mt-8 h-12 max-w-xl animate-pulse bg-stone-warm/10" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <div className="space-y-6">
          <div className="h-6 w-24 animate-pulse bg-stone-warm/15" />
          <div className="h-10 w-full animate-pulse bg-stone-warm/10" />
          <div className="h-10 w-full animate-pulse bg-stone-warm/10" />
          <div className="h-10 w-full animate-pulse bg-stone-warm/10" />
        </div>
        <div>
          <div className="h-4 w-32 animate-pulse bg-stone-warm/15" />
          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
