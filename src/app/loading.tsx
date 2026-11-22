export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-warm/30 border-t-bronze" />
        <p className="font-display text-lg tracking-wide text-stone-warm">Loading S_de_sign prompts…</p>
      </div>
    </div>
  );
}
