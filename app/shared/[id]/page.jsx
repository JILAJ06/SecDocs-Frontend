'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import FileRow from '@/components/FileRow';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import { Alert, Button, StatusBadge } from '@/components/ui';
import {
  downloadSharedFile,
  getSharedVault,
  leaveVault,
  unlockVault,
} from '@/lib/services/shared';

export default function SharedVaultPage() {
  const { id } = useParams();
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();

  const [vault, setVault] = useState(null);
  const [files, setFiles] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');

  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [downloadNotice, setDownloadNotice] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [leaving, setLeaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setAccessError('');
    try {
      const data = await getSharedVault(id, session.email);
      setVault(data.vault);
      setFiles(data.files || []);
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

  async function handleDownload(file) {
    if (downloadingId) return;
    setDownloadingId(file.id);
    try {
      await downloadSharedFile(id, session.email, file);
      setDownloadNotice(true);
      setTimeout(() => setDownloadNotice(false), 2000);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleLeaveVault() {
    if (!vault || leaving) return;
    setLeaving(true);
    try {
      await leaveVault(vault.id, session.email);
      router.replace('/shared');
    } finally {
      setLeaving(false);
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
        /* Vista 10 · Bóveda compartida: archivos (nodo 30:1081) */
        <main className="mx-auto flex w-full max-w-[960px] flex-col gap-5 px-6 pb-12 pt-8">
          <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm leading-5">
            <Link href="/shared" className="font-medium text-bosque-soft hover:text-bosque">
              Compartidas conmigo
            </Link>
            <span className="text-bosque-muted">/</span>
            <span className="font-medium text-bosque">{vault.name}</span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold leading-8 text-bosque">{vault.name}</h1>
                <StatusBadge status="ACTIVE_F" />
              </div>
              <p className="text-sm leading-5 text-bosque-soft">
                Compartida por {vault.ownerName} · tu acceso vence el {vault.expiresAt}
              </p>
            </div>
            <Button variant="secondary" disabled={leaving} onClick={handleLeaveVault}>
              Salir de la bóveda
            </Button>
          </div>

          <Alert kind="ok">
            Acceso concedido. Cada archivo se descifra al vuelo al descargarlo y no queda copia en caché. Cada descarga queda registrada.
          </Alert>

          {downloadNotice && (
            <div role="status" aria-live="polite">
              <Alert kind="ok">Descarga registrada</Alert>
            </div>
          )}

          {files.length === 0 ? (
            <p className="text-sm text-bosque-soft">Esta bóveda aún no tiene archivos</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  variant="shared"
                  disabled={downloadingId === file.id}
                  onAction={handleDownload}
                />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
