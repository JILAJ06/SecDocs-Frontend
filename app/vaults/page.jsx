'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Metrica from '@/components/Metrica';
import NewVaultModal from '@/components/NewVaultModal';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import { Alert, Button } from '@/components/ui';
import VaultCard from '@/components/VaultCard';
import { getVaultSummary, listVaults } from '@/lib/services/vaults';

export default function VaultsPage() {
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sum, list] = await Promise.all([getVaultSummary(), listVaults()]);
      setSummary(sum);
      setItems(list);
    } catch {
      setError('No se pudieron cargar las bóvedas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  if (!session) return null;

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  function handleCreated(newVault) {
    setItems((prev) => [newVault, ...prev]);
  }

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="vaults" email={session.email} onLogout={handleLogout} />
      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-6 pb-12 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold leading-8 text-bosque">Mis bóvedas</h1>
            <p className="text-sm leading-5 text-bosque-soft">
              Cada bóveda tiene su propia llave maestra (KEK). Si una bóveda expira, sus archivos se destruyen criptográficamente.
            </p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            + Nueva bóveda
          </Button>
        </div>

        {error && (
          <div role="alert">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-bosque-soft">Cargando…</p>
        ) : (
          <>
            {summary && (
              <section aria-label="Métricas" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:gap-4">
                <Metrica
                  label="Almacenamiento"
                  value={summary.storageUsed}
                  detail={summary.storageDetail}
                  progress={summary.storageProgress}
                />
                <Metrica
                  label="Bóvedas activas"
                  value={summary.activeVaults}
                  detail={summary.activeVaultsDetail}
                />
                <Metrica
                  label="Archivos cifrados"
                  value={summary.encryptedFiles}
                  detail={summary.encryptedFilesDetail}
                />
                <Metrica
                  label="Invitaciones pendientes"
                  value={summary.pendingInvitations}
                  detail={summary.pendingInvitationsDetail}
                />
              </section>
            )}

            <section aria-label="Lista de bóvedas" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:flex lg:flex-wrap lg:gap-6">
              {items.length === 0 && (
                <p className="w-full text-sm text-bosque-soft">Aún no tienes bóvedas activas. Crea la primera.</p>
              )}
              {items.map((vault) => (
                <VaultCard key={vault.id} vault={vault} />
              ))}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex h-[214px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-salvia bg-transparent transition hover:bg-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia lg:w-[368px]"
              >
                <span className="text-[32px] font-bold leading-8 tracking-[-0.5px] text-bosque">+</span>
                <span className="text-sm font-semibold leading-5 text-bosque">Nueva bóveda</span>
                <span className="text-xs leading-4 text-bosque-muted">Se genera una KEK exclusiva</span>
              </button>
            </section>
          </>
        )}
      </main>

      <NewVaultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
