'use client';

import { RotateCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="border border-red-200 bg-red-50/50 p-8 text-center">
      <h2 className="font-display text-2xl font-semibold text-red-900">Admin Section Error</h2>
      <p className="mt-2 text-sm text-red-700">
        {error.message || 'An error occurred while loading this administrative view.'}
      </p>
      <button
        onClick={() => reset()}
        className="mt-5 inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ivory hover:bg-bronze"
      >
        <RotateCcw size={14} /> Retry
      </button>
    </div>
  );
}
