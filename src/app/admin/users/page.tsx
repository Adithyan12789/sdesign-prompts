'use client';
import { useEffect, useState } from 'react';
import { Shield, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const load = () => fetch('/api/admin/users').then((r) => r.json()).then((d) => setUsers(d.users ?? []));
  useEffect(() => { load(); }, []);

  const setRole = async (u: any) => {
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: u.role === 'admin' ? 'user' : 'admin' }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Update failed'); return; }
    load();
  };
  const remove = async (u: any) => {
    if (!window.confirm(`Delete the account for ${u.email}?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error ?? 'Delete failed'); return; }
    load();
  };

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Users</h1>
      {error && <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="mt-8 divide-y divide-line border-y border-line">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-stone-warm">{u.email} · joined {new Date(u.createdAt).toLocaleDateString('en-GB')}{u.newsletter ? ' · newsletter' : ''}</p>
            </div>
            <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-bronze text-white' : 'bg-parchment text-stone-warm'}`}>{u.role}</span>
            <button onClick={() => setRole(u)} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-bronze"><Shield size={13} /> {u.role === 'admin' ? 'Make user' : 'Make admin'}</button>
            <button onClick={() => remove(u)} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-700 hover:border-red-300"><Trash2 size={13} /> Delete</button>
          </div>
        ))}
        {users.length === 0 && <p className="py-6 text-sm text-stone-warm">No registered users yet — accounts appear here once Firebase is connected and visitors register.</p>}
      </div>
    </div>
  );
}
