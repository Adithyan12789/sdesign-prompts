import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Crown, Download, Eye } from 'lucide-react';
import { getResourceBySlug, listCategories, listPlatforms, listResources, publicResource } from '@/lib/data';
import { getSessionUser } from '@/lib/auth';
import { DownloadButton, FavoriteButton, PromptViewer, RecordView, ShareButton } from '@/components/Interactive';
import ResourceCard from '@/components/ResourceCard';
import Reveal from '@/components/Reveal';

const clean = (t: string) => t.replace(/ — Placeholder.*$/, '');

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResourceBySlug(slug);
  if (!r) return { title: 'Resource not found' };
  return {
    title: clean(r.title),
    description: r.shortDescription,
    openGraph: { title: clean(r.title), description: r.shortDescription, images: [r.thumbnail] },
  };
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();
  const [categories, platforms, related, user] = await Promise.all([
    listCategories(), listPlatforms(),
    listResources({ category: resource.category, limit: 4 }),
    getSessionUser(),
  ]);
  const category = categories.find((c) => c.slug === resource.category);
  const platformNames = resource.platforms.map((p) => platforms.find((x) => x.slug === p)?.name ?? p);
  const relatedItems = related.items.filter((r) => r.slug !== slug).slice(0, 3);
  const locked = resource.access === 'premium' && !user;
  const displayTitle = clean(resource.title);

  return (
    <div className="pb-24">
      <RecordView slug={slug} />
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resource.thumbnail} alt={displayTitle} className="h-[52vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
            <Link href="/resources" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-bronze"><ArrowLeft size={14} /> Back to library</Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="bg-ivory px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">{resource.type}</span>
              {resource.access === 'premium' && <span className="flex items-center gap-1 bg-bronze px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"><Crown size={12} /> Premium</span>}
              {resource.placeholder && <span className="bg-charcoal/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ivory">Placeholder example</span>}
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-white md:text-6xl">{displayTitle}</h1>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80">
              <span>{category?.name ?? resource.category}</span><span>·</span><span>{resource.difficulty}</span><span>·</span>
              <span className="flex items-center gap-1"><Download size={14} /> {resource.downloads} downloads</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {resource.views} views</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-12 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <Reveal>
            <p className="text-lg leading-relaxed text-ink">{resource.shortDescription}</p>
            <div className="mt-5 space-y-4 leading-relaxed text-stone-warm">
              {resource.description.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="mt-12 font-display text-3xl font-semibold">Compatible AI platforms</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {platformNames.map((name) => <span key={name} className="border border-bronze/50 bg-bronze/10 px-3.5 py-1.5 text-sm font-semibold text-bronze-dark">{name}</span>)}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-12"><PromptViewer prompt={resource.promptContent} /></div>
          </Reveal>

          {resource.previewVideo && (
            <Reveal delay={0.05}>
              <h2 className="mt-12 font-display text-3xl font-semibold">Preview</h2>
              <video controls preload="metadata" poster={resource.thumbnail} className="mt-4 aspect-video w-full bg-charcoal object-cover">
                <source src={resource.previewVideo} /> Your browser does not support video playback.
              </video>
            </Reveal>
          )}

          <Reveal delay={0.05}>
            <h2 className="mt-12 font-display text-3xl font-semibold">Step-by-step guide</h2>
            <ol className="mt-6">
              {resource.instructions.map((step, i) => (
                <li key={i} className="flex gap-5 border-t border-line py-5 last:border-b">
                  <span className="font-display text-3xl font-semibold text-bronze">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block font-display text-xl font-semibold">{step.title}</span>
                    <span className="mt-1 block leading-relaxed text-stone-warm">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          {resource.previewImages.length > 0 && (
            <Reveal delay={0.05}>
              <h2 className="mt-12 font-display text-3xl font-semibold">Reference gallery</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {resource.previewImages.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`${displayTitle} reference ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                ))}
              </div>
            </Reveal>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-parchment/50 p-6">
            <h2 className="font-display text-2xl font-semibold">Downloads</h2>
            {locked && <p className="mt-2 text-sm leading-relaxed text-stone-warm">This is a premium resource. <Link href="/login" className="font-semibold text-bronze-dark underline">Sign in</Link> or <Link href="/register" className="font-semibold text-bronze-dark underline">create a free account</Link> to download its files.</p>}
            <div className="mt-5 space-y-3">
              {publicResource(resource).files.map((f) => <DownloadButton key={f.id} file={f} locked={locked} />)}
              {resource.files.length === 0 && <p className="text-sm text-stone-warm">No files attached yet.</p>}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
              <FavoriteButton slug={slug} />
              <ShareButton title={displayTitle} />
            </div>
            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-stone-warm">Difficulty</dt><dd className="font-semibold">{resource.difficulty}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-warm">Access</dt><dd className="font-semibold capitalize">{resource.access}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-warm">Published</dt><dd className="font-semibold">{new Date(resource.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-warm">Updated</dt><dd className="font-semibold">{new Date(resource.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      {relatedItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-20 lg:px-8">
          <h2 className="font-display text-4xl font-semibold">Related resources</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} categoryName={category?.name} />)}
          </div>
        </section>
      )}
    </div>
  );
}
