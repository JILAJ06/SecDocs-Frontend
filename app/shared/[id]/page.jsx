'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import { Alert, Button, Field } from '@/components/ui';
import { getSharedVault, unlockVault } from '@/lib/services/shared';

export default function SharedVaultPage() {
  const { id } = useParams();
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();

  const [vault, setVault] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');

  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setAccessError('');
    try {
      const data = await getSharedVault(id, session.email);
      setVault(data.vault);
      setUnlocked(data.unlocked);
      setLocked(data.locked);
      setWaitSeconds(data.waitSeconds || 0);
      if (data.locked) {
        setFeedbackMessage('Acceso bloqueado. Se avisó al dueño de la bóveda.');
      }
    } catch (err) {
      setAccessError(err.message || 'No tienes acceso a esta bóveda');
    } finally {
      setLoading(false);
    }
  }, [id, session]);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  useEffect(() => {
    if (waitSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setWaitSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [waitSeconds]);

  if (!session) return null;

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  async function handleUnlock(e) {
    e.preventDefault();
    if (locked || waitSeconds > 0 || busy) return;
    setBusy(true);
    try {
      const res = await unlockVault(id, session.email, password);
      if (res.unlocked) {
        setUnlocked(true);
        setFeedbackMessage('');
        setPassword('');
      } else {
        setLocked(res.locked);
        setWaitSeconds(res.waitSeconds || 0);
        setFeedbackMessage(res.message || '');
      }
    } catch (err) {
      setAccessError(err.message || 'No tienes acceso a esta bóveda');
    } finally {
      setBusy(false);
    }
  }

  const filesText = vault
    ? `${vault.filesCount} ${vault.filesCount === 1 ? 'archivo' : 'archivos'}`
    : '';

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="shared" email={session.email} onLogout={handleLogout} />

      {loading ? (
        <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-8">
          <p className="text-sm text-bosque-soft">Cargando…</p>
        </main>
      ) : accessError || !vault ? (
        <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-8">
          <div className="flex w-[448px] max-w-full flex-col gap-4 rounded-2xl border border-niebla bg-white p-6 text-center">
            <div role="alert">
              <Alert kind="error">{accessError || 'No tienes acceso a esta bóveda'}</Alert>
            </div>
            <Link href="/shared" className="text-sm font-medium text-bosque underline underline-offset-2">
              Volver a compartidas conmigo
            </Link>
          </div>
        </main>
      ) : !unlocked ? (
        /* Vista 09 · Bóveda compartida: ingresar contraseña (nodo 30:1036) */
        <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-8">
          <form
            onSubmit={handleUnlock}
            className="flex w-[448px] max-w-full flex-col gap-4 rounded-2xl border border-niebla bg-white p-6"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-success-bg text-bosque">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h1 className="truncate text-lg font-semibold leading-7 text-bosque">
                  {vault.name}
                </h1>
                <p className="text-xs leading-4 text-bosque-soft">
                  Compartida por {vault.ownerName} · {filesText}
                </p>
              </div>
            </div>

            <p className="text-sm leading-5 text-bosque-soft">
              Escribe la contraseña que te llegó por correo.
            </p>

            <Field
              label="Contraseña de la bóveda"
              type="password"
              mono
              required
              disabled={locked}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {feedbackMessage && (
              <div role="alert" aria-live="polite">
                <Alert kind={locked ? 'error' : 'warn'}>{feedbackMessage}</Alert>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={locked || waitSeconds > 0 || busy}
              className="w-full"
              aria-live="polite"
            >
              {waitSeconds > 0
                ? `Espera ${waitSeconds} s…`
                : busy
                  ? 'Verificando…'
                  : 'Ingresar'}
            </Button>

            <p className="text-center text-xs leading-4 text-bosque-muted">
              El tiempo de espera se duplica con cada error. Al quinto, tu acceso se bloquea y se avisa al dueño.
            </p>
          </form>
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-[960px] flex-col gap-5 px-6 pb-12 pt-8">
          <p className="text-sm text-bosque-soft">Bóveda desbloqueada.</p>
        </main>
      )}
    </div>
  );
}
