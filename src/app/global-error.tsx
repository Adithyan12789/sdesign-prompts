'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] p-6 font-sans text-[#1c1917]">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold">Application Error</h1>
          <p className="mt-3 text-sm text-[#78716c]">
            A critical error occurred in the application shell.
          </p>
          <button
            onClick={() => reset()}
            className="mt-6 bg-[#1c1917] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#a5814f]"
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
