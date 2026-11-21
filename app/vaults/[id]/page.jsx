'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import { Button, StatusBadge } from '@/components/ui';
import { destroyVault, getVault, lockVault } from '@/lib/services/vaults';

const VAULT_STATUS_BADGE = {
  ACTIVE: 'ACTIVE_F',
  LOCKED: 'LOCKED_F',
  EXPIRED: 'EXPIRED_F',
};

export default function VaultDetailPage() {
  const { id } = useParams();
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();

  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [locking, setLocking] = useState(false);
  const [destroyModalOpen, setDestroyModalOpen] = useState(false);
  const [destroying, setDestroying] = useState(false);

  const loadVault = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const v = await getVault(id);
      setVault(v);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (session) loadVault();
  }, [session, loadVault]);

  if (!session) return null;

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  async function handleLockVault() {
    if (!vault || vault.status === 'LOCKED') return;
    setLocking(true);
    try {
      const updated = await lockVault(vault.id);
      setVault(updated);
    } finally {
      setLocking(false);
    }
  }

  async function handleDestroyVault() {
    if (!vault) return;
    setDestroying(true);
    try {
      await destroyVault(vault.id);
      setDestroyModalOpen(false);
      router.replace('/vaults');
    } finally {
      setDestroying(false);
    }
  }

  const isLocked = vault?.status === 'LOCKED';
  const badgeKey = vault ? VAULT_STATUS_BADGE[vault.status] || vault.status : 'ACTIVE_F';
  const filesText = vault ? `${vault.filesCount} ${vault.filesCount === 1 ? 'archivo' : 'archivos'}` : '';
  const membersText = vault ? `${vault.membersCount} ${vault.membersCount === 1 ? 'miembro' : 'miembros'}` : '';

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="vaults" email={session.email} onLogout={handleLogout} />
      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-5 px-6 pb-12 pt-8">
        {loading ? (
          <p className="text-sm text-bosque-soft">Cargando…</p>
        ) : notFound || !vault ? (
          <Card title="Bóveda no encontrada">
            <p className="text-sm text-bosque-soft">
              La bóveda solicitada no existe o fue destruida.
            </p>
            <div>
              <Link href="/vaults" className="text-sm font-medium text-bosque underline underline-offset-2">
                Volver a mis bóvedas
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm leading-5">
              <Link href="/vaults" className="font-medium text-bosque-soft hover:text-bosque">
                Mis bóvedas
              </Link>
              <span className="text-bosque-muted">/</span>
              <span className="font-medium text-bosque">{vault.name}</span>
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-semibold leading-8 text-bosque">{vault.name}</h1>
                  <StatusBadge status={badgeKey} />
                </div>
                <p className="text-sm leading-5 text-bosque-soft">
                  Expira {vault.expiresAt} · KEK {vault.kekVersion} · {filesText} · {vault.sizeLabel} · {membersText}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={isLocked || locking}
                  onClick={handleLockVault}
                >
                  {isLocked ? 'Bloqueada' : 'Bloquear bóveda'}
                </Button>
                <Button variant="danger" onClick={() => setDestroyModalOpen(true)}>
                  Destruir bóveda
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 lg:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-6 w-full">
                <Card
                  title="Archivos"
                  subtitle="Se cifran en memoria y se guardan en Cloudflare R2 con nombre UUID."
                />
                <Card
                  title="Miembros e invitaciones"
                  subtitle="Sólo el correo invitado puede aceptar. 5 contraseñas incorrectas bloquean al miembro."
                />
              </div>
              <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[400px]">
                <Card title="Invitar por correo" />
                <Card title="Llaves de esta bóveda" />
              </aside>
            </div>

            <Modal
              open={destroyModalOpen}
              onClose={() => !destroying && setDestroyModalOpen(false)}
              title={`¿Destruir «${vault.name}»?`}
            >
              <p className="text-sm leading-5 text-bosque-soft">
                Se borran la KEK y todas las llaves de sus archivos. No se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={destroying}
                  onClick={() => setDestroyModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  disabled={destroying}
                  onClick={handleDestroyVault}
                >
                  Destruir bóveda
                </Button>
              </div>
            </Modal>
          </>
        )}
      </main>
    </div>
  );
}
