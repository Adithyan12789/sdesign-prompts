'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Download, Eye } from 'lucide-react';
import type { ResourceItem } from '@/lib/types';

const TYPE_LABEL: Record<string, string> = { prompt: 'Prompt', guide: 'Guide', workflow: 'Workflow', bundle: 'Bundle' };

export default function ResourceCard({ resource, index = 0, categoryName }: { resource: ResourceItem; index?: number; categoryName?: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 6) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col bg-white shadow-[0_1px_0_0_var(--color-line)] ring-1 ring-line/60"
    >
      <Link href={`/resources/${resource.slug}`} className="relative block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resource.thumbnail} alt={resource.title} loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 bg-ivory/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-charcoal">{TYPE_LABEL[resource.type]}</span>
        {resource.access === 'premium' && (
          <span className="absolute right-3 top-3 flex items-center gap-1 bg-bronze px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"><Crown size={12} /> Premium</span>
        )}
        {resource.placeholder && <span className="absolute bottom-3 left-3 bg-charcoal/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory">Placeholder example</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-bronze">{categoryName ?? resource.category.replace(/-/g, ' ')} · {resource.difficulty}</p>
        <Link href={`/resources/${resource.slug}`}>
          <h3 className="mt-2 font-display text-[22px] font-semibold leading-snug transition group-hover:text-bronze-dark">{resource.title.replace(/ — Placeholder.*$/, '')}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-warm">{resource.shortDescription}</p>
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-stone-warm">
          <span className="flex items-center gap-1"><Download size={13} /> {resource.downloads}</span>
          <span className="flex items-center gap-1"><Eye size={13} /> {resource.views}</span>
          <span className="ml-auto font-semibold uppercase tracking-wider">{resource.access}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="animate-pulse bg-white ring-1 ring-line/60">
      <div className="aspect-[16/10] bg-parchment" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 bg-parchment" />
        <div className="h-6 w-4/5 bg-parchment" />
        <div className="h-3 w-full bg-parchment" />
        <div className="h-3 w-2/3 bg-parchment" />
      </div>
    </div>
  );
}
