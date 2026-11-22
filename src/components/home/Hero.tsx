'use client';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import type { SiteContentData } from '@/lib/types';

/** Cinematic hero: the architecture reveals first (slow scale from a
 *  masked frame), then the eyebrow, headline lines and actions rise in. */
export default function Hero({ content }: { content: SiteContentData }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);

  const line = {
    hidden: { y: '110%' },
    show: (i: number) => ({ y: '0%', transition: { delay: 0.9 + i * 0.14, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }),
  };
  const words = content.heroTitle.split(' ');
  const lines = [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')].filter(Boolean);

  return (
    <section ref={ref} className="relative flex min-h-[92vh] items-end overflow-hidden bg-charcoal">
      <motion.div style={{ y }} className="absolute inset-0">
        <motion.img
          src={content.heroImage} alt="Architectural hero" className="h-full w-full object-cover"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12, clipPath: 'inset(6% 6% 6% 6%)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-40 lg:px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.7 }}
          className="text-[12px] font-bold uppercase tracking-[0.3em] text-bronze">
          {content.heroEyebrow}
        </motion.p>
        <h1 className="mt-5 max-w-4xl font-display text-6xl font-medium leading-[1.02] text-white md:text-7xl lg:text-8xl">
          {lines.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-1">
              <motion.span className="block" custom={i} variants={line} initial="hidden" animate="show">{l}</motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35, duration: 0.7 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
          {content.heroSubtitle}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.7 }} className="mt-9 flex flex-wrap gap-4">
          <Link href="/resources" className="group flex items-center gap-2 bg-bronze px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-bronze-dark">
            Browse the library <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
          <Link href="/resources?type=guide" className="border border-white/50 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:border-white hover:bg-white/10">
            Read the guides
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="mt-14 flex items-center gap-2 text-white/60">
          <ArrowDown size={15} className="animate-bounce" /> <span className="text-xs uppercase tracking-[0.2em]">Featured resources below</span>
        </motion.div>
      </div>
    </section>
  );
}
