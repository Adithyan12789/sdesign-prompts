'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Caught Error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bronze/10 text-bronze">
        <AlertTriangle size={32} />
      </div>
      <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">System Notice</p>
      <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Something went wrong</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-warm">
        An unexpected error occurred while rendering this page. You can attempt to reload the component or return to the main library.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-charcoal px-6 py-3 text-xs font-bold uppercase tracking-wider text-ivory transition hover:bg-bronze"
        >
          <RotateCcw size={14} /> Try again
        </button>
        <Link
          href="/"
          className="border border-line bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition hover:bg-parchment"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
