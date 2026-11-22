'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Heart, LogOut, Menu, Search, User as UserIcon, X } from 'lucide-react';
import type { SessionUser } from '@/lib/types';

export default function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user)).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); window.location.href = '/'; };

  const links = [
    { href: '/resources', label: 'Library' },
    { href: '/resources?type=guide', label: 'Guides' },
    { href: '/resources?access=premium', label: 'Premium' },
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? 'bg-ivory/95 shadow-[0_1px_0_0_var(--color-line)] backdrop-blur' : 'bg-gradient-to-b from-black/35 to-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className={`font-display text-2xl font-semibold tracking-wide ${scrolled || open ? 'text-charcoal' : 'text-white'}`}>
          S_de_sign<span className="text-bronze">·</span>prompts
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`text-[13px] font-semibold uppercase tracking-[0.14em] transition hover:text-bronze ${scrolled ? 'text-charcoal' : 'text-white/90'}`}>{l.label}</Link>
          ))}
          <Link href="/resources" aria-label="Search the library" className={scrolled ? 'text-charcoal hover:text-bronze' : 'text-white/90 hover:text-bronze'}><Search size={18} /></Link>
          {user ? (
            <span className="flex items-center gap-5">
              <Link href="/profile" className={`flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] hover:text-bronze ${scrolled ? 'text-charcoal' : 'text-white/90'}`}><Heart size={15} /> {user.name.split(' ')[0]}</Link>
              <button onClick={logout} className={`flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] hover:text-bronze ${scrolled ? 'text-charcoal' : 'text-white/90'}`}><LogOut size={15} /> Sign out</button>
            </span>
          ) : (
            <span className="flex items-center gap-5">
              <Link href="/login" className={`flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] hover:text-bronze ${scrolled ? 'text-charcoal' : 'text-white/90'}`}><UserIcon size={15} /> Sign in</Link>
              <Link href="/register" className="bg-bronze px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-bronze-dark">Join free</Link>
            </span>
          )}
        </nav>
        <button className={`md:hidden ${scrolled || open ? 'text-charcoal' : 'text-white'}`} onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={24} /> : <Menu size={24} />}</button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden md:hidden">
            <div className="space-y-1 px-5 pb-5">
              {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 font-display text-xl">{l.label}</Link>)}
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className="block py-2 font-display text-xl">My library</Link>
                  <button onClick={logout} className="block py-2 font-display text-xl">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="block py-2 font-display text-xl">Sign in</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="block py-2 font-display text-xl text-bronze">Join free</Link>
                </>
              )}
              <span className="mt-2 flex items-center gap-2 text-xs text-stone-warm"><BookOpen size={14} /> Prompts, guides & bundles for architectural AI video.</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
