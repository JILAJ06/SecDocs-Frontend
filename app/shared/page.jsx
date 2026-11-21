'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import { Alert, Button } from '@/components/ui';
import { listSharedVaults } from '@/lib/services/shared';

export default function SharedListPage() {
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      const list = await listSharedVaults(session.email);
      setItems(list);
    } catch {
      setError('Algo salió mal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  if (!session) return null;

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="shared" email={session.email} onLogout={handleLogout} />
      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-6 pb-12 pt-8">
        <h1 className="text-2xl font-semibold leading-8 text-bosque">Compartidas conmigo</h1>

        {error && (
          <div role="alert">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-bosque-soft">Cargando…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-niebla bg-white p-6">
            <p className="text-sm leading-5 text-bosque-soft">
              Próximamente: aquí verás todas las bóvedas que compartieron contigo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:flex lg:flex-wrap lg:gap-6">
            {items.map((vault) => (
              <article
                key={vault.id}
                className="flex w-full flex-col gap-4 rounded-2xl border border-salvia bg-white p-5 lg:w-[368px]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-niebla text-bosque">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h2 className="truncate text-base font-semibold leading-6 text-bosque">
                      {vault.name}
                    </h2>
                    <p className="text-xs leading-4 text-bosque-soft">
                      Compartida por {vault.ownerName}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push(`/shared/${vault.id}`)}
                >
                  Abrir
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
