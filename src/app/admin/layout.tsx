'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  ExternalLink,
  FolderTree,
  Home,
  KeyRound,
  Library,
  LogOut,
  MonitorPlay,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { SessionUser } from '@/lib/types';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/resources', label: 'Resources', icon: Library },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/platforms', label: 'AI Platforms', icon: MonitorPlay },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Homepage Content', icon: Home },
];

function AdminPasscodeLogin({ onAuthenticated }: { onAuthenticated: (user: SessionUser) => void }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Incorrect passcode. Please try again.');
        setBusy(false);
        return;
      }
      onAuthenticated(data.user);
    } catch {
      setError('Connection error. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-ivory text-ink">
      <header className="border-b border-line bg-white/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-wide text-charcoal transition hover:text-bronze"
          >
            S_de_sign<span className="text-bronze">·</span>Admin
          </Link>
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-stone-warm transition hover:text-bronze"
          >
            ← Live Site
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md border border-line bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bronze/10 text-bronze">
              <KeyRound size={26} />
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-bronze">
              Studio Verification
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Admin Access</h1>
            <p className="mt-2 text-sm text-stone-warm">
              Enter your numeric passcode to unlock the administration workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="admin-passcode"
                className="block text-center text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Numeric Passcode
              </label>
              <div className="mt-2">
                <input
                  id="admin-passcode"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full border border-line bg-ivory/50 px-4 py-3.5 text-center font-mono text-2xl tracking-[0.4em] outline-none transition focus:border-bronze focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !passcode}
              className="flex w-full items-center justify-center gap-2 bg-charcoal py-3.5 text-xs font-bold uppercase tracking-wider text-ivory transition hover:bg-bronze disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {busy ? 'Verifying Code…' : 'Unlock Admin Workspace'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-warm/80">
            Passcode configured via{' '}
            <code className="bg-parchment px-1.5 py-0.5 font-mono text-[11px] text-charcoal">
              ADMIN_PASSCODE
            </code>{' '}
            in environment.
          </p>
        </div>
      </main>

      <footer className="border-t border-line py-5 text-center text-xs text-stone-warm">
        © {new Date().getFullYear()} S_de_sign prompts · Restricted Studio Area
      </footer>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  if (user === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-warm/30 border-t-bronze" />
          <p className="text-sm font-semibold uppercase tracking-wider text-stone-warm">
            Verifying administrative credentials…
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <AdminPasscodeLogin onAuthenticated={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-line bg-charcoal text-ivory">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-display text-2xl font-semibold tracking-wide text-ivory">
              S_de_sign<span className="text-bronze">·</span>Admin
            </Link>
            <span className="rounded bg-bronze/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bronze">
              Studio Workspace
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/80 transition hover:text-bronze"
            >
              Live Site <ExternalLink size={13} />
            </Link>
            <div className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="hidden text-white/60 sm:inline-block">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-stone-warm transition hover:text-white"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Body */}
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-bronze">
              Management
            </p>
            <nav className="mt-4 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold transition ${
                      active ? 'bg-charcoal text-ivory' : 'hover:bg-parchment'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-bronze' : ''} /> {label}
                  </Link>
                );
              })}
            </nav>
            <p className="mt-8 border-t border-line pt-4 text-xs leading-relaxed text-stone-warm">
              Signed in as <span className="font-medium text-charcoal">{user.name}</span>. Changes publish directly to the live catalog.
            </p>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
