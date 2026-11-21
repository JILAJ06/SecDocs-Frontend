'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Brand } from './ui';

const NAV = [
  ['/vaults', 'Bóvedas'],
  ['/shared', 'Compartidas conmigo'],
  ['/audit', 'Auditoría'],
  ['/security', 'Seguridad'],
];

/** Marco de las páginas privadas: protege la ruta y muestra la navegación de 4 pestañas. */
export default function Shell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, sessionEnded, logout } = useAuth();

  useEffect(() => {
    if (loading || user) return;
    const target = sessionEnded ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;
    router.replace(target);
  }, [loading, user, sessionEnded, pathname, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-bosque-muted">Verificando sesión…</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-niebla bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <Brand small />
            <nav className="flex flex-wrap gap-1" aria-label="Principal">
              {NAV.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${pathname === href || pathname.startsWith(`${href}/`) ? 'bg-niebla text-bosque' : 'text-bosque-soft hover:text-bosque'}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-bosque-soft sm:inline">{user.email}</span>
            <button onClick={logout} className="btn-ghost py-1.5">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
