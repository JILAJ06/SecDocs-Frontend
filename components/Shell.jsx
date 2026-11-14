'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Brand } from './ui';

/** Marco de las páginas privadas: verifica la sesión y muestra la navegación. */
export default function Shell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => router.replace('/login'));
  }, [router]);

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    router.replace('/login');
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-bosque-muted">Verificando sesión…</div>;
  }

  const nav = [
    ['/dashboard', 'Bóveda'],
    ['/audit', 'Auditoría'],
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-niebla bg-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Brand small />
            <nav className="flex gap-1">
              {nav.map(([href, label]) => (
                <Link
                  key={href} href={href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${pathname === href ? 'bg-niebla text-bosque' : 'text-bosque-soft hover:text-bosque'}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-bosque-soft sm:inline">{user.email}</span>
            <button onClick={logout} className="btn-ghost py-1.5">Salir</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
