'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

function PathnameBadge() {
  const pathname = usePathname();
  const label = pathname?.includes('register')
    ? 'REGISTRATION GATEWAY'
    : pathname?.includes('forgot')
    ? 'RECOVERY GATEWAY'
    : 'AUTHENTICATION GATEWAY';

  return (
    <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-bronze">
      {label}
    </span>
  );
}

export default function AuthSplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-ivory text-ink selection:bg-bronze selection:text-white">
      {/* =========================================================================
          LEFT PANEL (Desktop only: 50% fixed width, full height cinematic imagery)
         ========================================================================= */}
      <aside className="relative hidden h-screen overflow-hidden bg-charcoal text-ivory lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Cinematic Architectural Photography with Mask Reveal & Zoom */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 1.08 }
          }
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=85&w=1920&auto=format&fit=crop"
            alt="Contemporary Architectural Luxury Villa at Twilight"
            className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
          />
        </motion.div>

        {/* Sophisticated Architectural Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Top Branding & Editorial Edition Marker */}
        <div className="relative z-10 flex items-start justify-between">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="font-display text-3xl font-medium tracking-[0.18em] text-ivory transition-colors group-hover:text-bronze">
              RENDER<span className="font-semibold text-bronze">VAULT</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-bronze" />
          </Link>
          <div className="text-right">
            <span className="block font-mono text-[10px] tracking-[0.25em] text-stone-warm">
              ARCHIVE REF. 2026-V
            </span>
            <Suspense
              fallback={
                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-bronze">
                  STUDIO GATEWAY
                </span>
              }
            >
              <PathnameBadge />
            </Suspense>
          </div>
        </div>

        {/* Center Framing Metadata / Crosshairs */}
        <div className="relative z-10 my-auto hidden space-y-3 xl:block">
          <div className="flex items-center gap-3 text-white/40">
            <span className="font-mono text-xs text-bronze">+</span>
            <span className="h-px w-16 bg-white/20" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
              LAT: 45° 27&apos; N · ELEV: 120M · APERTURE: ƒ/2.8
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-white/50">
            CINEMATIC ARCHITECTURE · PRODUCTION WORKFLOW DIRECTORY
          </p>
        </div>

        {/* Bottom Editorial Quote & Metadata */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-bronze">
              Editorial Dispatch · Issue 01
            </p>
            <h2 className="font-display text-4xl font-light italic leading-tight text-white xl:text-5xl">
              &ldquo;Spaces conceived in thought, rendered in light.&rdquo;
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/75">
              A curated collection of AI prompts, workflows and architectural
              inspiration for visualization artists and contemporary studios.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/15 pt-5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
            <span>[01] Curated Directives</span>
            <span>[02] Lighting Studies</span>
            <span>[03] Production Assets</span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT PANEL (Desktop: 50% width; Mobile: full width with top banner)
         ========================================================================= */}
      <div className="flex min-h-screen flex-col justify-between lg:ml-[50%] lg:w-1/2">
        {/* Mobile Header Banner (< lg only) */}
        <div className="relative block h-64 w-full overflow-hidden bg-charcoal p-6 sm:h-72 sm:p-8 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=85&w=1200&auto=format&fit=crop"
            alt="RenderVault Modern Architecture"
            className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-black/40" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-display text-2xl font-medium tracking-[0.18em] text-ivory">
                RENDER<span className="text-bronze">VAULT</span>
              </Link>
              <Link
                href="/resources"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-bronze"
              >
                <ArrowLeft size={13} /> Library
              </Link>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-bronze">
                Architectural Archive
              </p>
              <h2 className="font-display text-2xl font-light italic text-white sm:text-3xl">
                &ldquo;Spaces conceived in thought, rendered in light.&rdquo;
              </h2>
            </div>
          </div>
        </div>

        {/* Desktop Top Navigation Bar */}
        <header className="hidden items-center justify-between border-b border-line/60 bg-transparent px-8 py-6 lg:flex xl:px-14">
          <Link
            href="/resources"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-warm transition-colors hover:text-bronze"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            <span>Back to library</span>
          </Link>

          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-warm/70">
            RenderVault Portal // Ref. 2026
          </span>
        </header>

        {/* Center Content Form Slot */}
        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {/* Editorial Footer */}
        <footer className="border-t border-line/60 py-6 text-center text-[11px] uppercase tracking-[0.2em] text-stone-warm">
          © {new Date().getFullYear()} RenderVault Studio · All rights reserved
        </footer>
      </div>
    </div>
  );
}
