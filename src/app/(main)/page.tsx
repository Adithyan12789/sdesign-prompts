import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';
import ResourceCard from '@/components/ResourceCard';
import { NewsletterForm } from '@/components/Interactive';
import { getSiteContent, listCategories, listResources } from '@/lib/data';

export default async function HomePage() {
  const [content, categories, featured, latest, popular] = await Promise.all([
    getSiteContent(),
    listCategories(),
    listResources({ featured: true, limit: 3 }),
    listResources({ limit: 6, sort: 'newest' }),
    listResources({ limit: 4, sort: 'popular' }),
  ]);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <Hero content={content} />

      {/* Featured resources */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">Selected by the studio</p>
              <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Featured resources</h2>
            </div>
            <Link href="/resources" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-bronze">View all <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.items.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} categoryName={catName(r.category)} />)}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-parchment/60 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">Browse by subject</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Categories</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.08}>
                <Link href={`/resources?category=${c.slug}`} className="group relative block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} loading="lazy" className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block font-display text-2xl font-semibold text-white">{c.name}</span>
                    <span className="mt-1 line-clamp-1 block text-sm text-white/75">{c.description}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">Fresh in the library</p>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Latest prompts & guides</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latest.items.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} categoryName={catName(r.category)} />)}
        </div>
      </section>

      {/* Popular downloads */}
      <section className="bg-charcoal py-20 text-ivory">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-3">
              <Download className="text-bronze" />
              <h2 className="font-display text-4xl font-semibold md:text-5xl">Popular downloads</h2>
            </div>
          </Reveal>
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {popular.items.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.05}>
                <Link href={`/resources/${r.slug}`} className="group flex flex-wrap items-center gap-4 py-5 transition hover:bg-white/5 md:gap-8">
                  <span className="font-display text-3xl text-bronze">{String(i + 1).padStart(2, '0')}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.thumbnail} alt="" loading="lazy" className="hidden h-16 w-24 object-cover sm:block" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-2xl font-semibold group-hover:text-bronze">{r.title.replace(/ — Placeholder.*$/, '')}</span>
                    <span className="text-sm text-ivory/60">{catName(r.category)} · {r.type} · {r.difficulty}</span>
                  </span>
                  <span className="flex items-center gap-2 text-sm text-ivory/70"><Download size={15} className="text-bronze" /> {r.downloads}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Studio introduction */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 lg:px-8">
        <Reveal>
          <div className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.studioImage} alt="The studio" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">The studio</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">{content.studioTitle}</h2>
          <p className="mt-5 leading-relaxed text-stone-warm">{content.studioText}</p>
          <Link href="/resources" className="mt-7 inline-flex items-center gap-2 border border-charcoal px-6 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-charcoal hover:text-ivory">
            Explore resources <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>

      {/* Newsletter */}
      <section className="bg-parchment/60 py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-bronze">The dispatch</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">New prompts, straight to your inbox</h2>
            <p className="mx-auto mt-4 max-w-lg text-stone-warm">One considered email when new prompts, guides and bundles land in the library. No noise.</p>
            <div className="mt-8 flex justify-center"><NewsletterForm /></div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
