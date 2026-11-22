import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-36 text-center">
      <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">404</p>
      <h1 className="mt-3 font-display text-5xl font-semibold">This page is not in the library</h1>
      <p className="mt-4 text-stone-warm">The resource or page you are looking for may have moved or been unpublished.</p>
      <Link href="/resources" className="mt-8 inline-block bg-charcoal px-7 py-3 text-sm font-bold uppercase tracking-wider text-ivory hover:bg-bronze">Browse the library</Link>
    </div>
  );
}
