import Link from 'next/link';
import { Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { SiteContentData } from '@/lib/types';

export default function Footer({ content }: { content: SiteContentData }) {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-3xl font-semibold">S_de_sign<span className="text-bronze">·</span>prompts</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/70">{content.footerText}</p>
          <div className="mt-6 flex gap-4">
            {content.instagram && <a href={content.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-ivory/70 transition hover:text-bronze"><Instagram size={19} /></a>}
            {content.youtube && <a href={content.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="text-ivory/70 transition hover:text-bronze"><Youtube size={19} /></a>}
            {content.x && <a href={content.x} target="_blank" rel="noreferrer" aria-label="X" className="text-ivory/70 transition hover:text-bronze"><Twitter size={19} /></a>}
            {content.linkedin && <a href={content.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-ivory/70 transition hover:text-bronze"><Linkedin size={19} /></a>}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze">Library</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
            <li><Link className="hover:text-bronze" href="/resources">All resources</Link></li>
            <li><Link className="hover:text-bronze" href="/resources?type=prompt">Prompts</Link></li>
            <li><Link className="hover:text-bronze" href="/resources?type=guide">Guides</Link></li>
            <li><Link className="hover:text-bronze" href="/resources?type=bundle">Bundles</Link></li>
            <li><Link className="hover:text-bronze" href="/resources?access=premium">Premium</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze">Account</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
            <li><Link className="hover:text-bronze" href="/register">Create account</Link></li>
            <li><Link className="hover:text-bronze" href="/login">Sign in</Link></li>
            <li><Link className="hover:text-bronze" href="/profile">My library</Link></li>
            <li><Link className="hover:text-bronze" href="/profile">Download history</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ivory/50">© {new Date().getFullYear()} S_de_sign prompts. Crafted for architects & visualization artists.</div>
    </footer>
  );
}
