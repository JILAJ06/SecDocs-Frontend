'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/components/AuthProvider';
import { Alert, Brand, Spinner } from '@/components/ui';
import { downloadSharedFile, getInvitation, unlockInvitation, verifyIdentity } from '@/lib/api';
import { MAX_UNLOCK_ATTEMPTS, TICKET_TTL_SECONDS } from '@/lib/constants';
import { formatBytes, formatClock } from '@/lib/format';
import { useCountdown } from '@/lib/hooks';

export default function InvitationPage() {
  return (
    <main className="flex min-h-screen justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center"><Brand /></div>
        <Suspense fallback={<Spinner />}>
          <Invitation />
        </Suspense>
      </div>
    </main>
  );
}

function Terminal({ title, children }) {
  return (
    <div className="card space-y-3 text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="text-sm text-bosque-soft">{children}</div>
    </div>
  );
}

function Invitation() {
  const { token } = useParams();
  const { user, loading: authLoading, logout } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ok | notfound | gone | error
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;
    getInvitation(token)
      .then((r) => {
        if (!alive) return;
        setInvitation(r.invitation);
        setLoadState('ok');
      })
      .catch((e) => {
        if (!alive) return;
        setLoadError(e.message);
        setLoadState(e.status === 404 ? 'notfound' : e.status === 410 ? 'gone' : 'error');
      });
    return () => {
      alive = false;
    };
  }, [token]);

  if (loadState === 'loading' || authLoading) return <Spinner text="Cargando invitación…" />;
  if (loadState === 'notfound') return <Terminal title="Invitación no encontrada">El enlace es incorrecto o no existe. Solicita uno nuevo a quien te invitó.</Terminal>;
  if (loadState === 'gone') return <Terminal title="Enlace expirado o revocado">Esta invitación ya no está disponible: fue revocada, expiró o la bóveda dejó de estar disponible.</Terminal>;
  if (loadState === 'error') return <Alert>{loadError}</Alert>;

  return (
    <>
      <div className="card space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-bosque-soft">Te invitan a una bóveda</p>
        <h1 className="text-xl font-semibold">{invitation.vaultName}</h1>
        <p className="text-sm text-bosque-soft">Invita: <span className="font-mono">{invitation.ownerEmail}</span></p>
        <p className="text-sm text-bosque-soft">Invitación para: <span className="font-mono">{invitation.maskedEmail}</span></p>
      </div>
      {user ? (
        <Verified key={user.id} token={token} invitation={invitation} user={user} logout={logout} />
      ) : (
        <div className="space-y-3">
          <Alert kind="info">Inicia sesión o regístrate con el correo invitado ({invitation.maskedEmail}) para continuar. Volverás automáticamente a esta invitación.</Alert>
          <AuthForm mode="login" embedded />
        </div>
      )}
    </>
  );
}

/** Con sesión: Canal 1 (verify-identity) → Canal 2 (unlock) → descarga con ticket. */
function Verified({ token, invitation, user, logout }) {
  const { clearSession } = useAuth();
  const [phase, setPhase] = useState('verifying'); // verifying | denied | gone | ready | error
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const resend = useCountdown();
  const started = useRef(false);

  const sendKey = useCallback(async () => {
    setError('');
    setNotice('');
    try {
      const r = await verifyIdentity(token);
      resend.start(r.cooldownSeconds);
      setNotice(`Clave enviada a ${r.maskedEmail}. Revisa tu correo.`);
      setPhase('ready');
    } catch (e) {
      if (e.status === 403) setPhase('denied');
      else if (e.status === 404 || e.status === 410) setPhase('gone');
      else if (e.status === 401) clearSession();
      else if (e.status === 429) {
        resend.start(e.data?.retryAfterSeconds ?? 60);
        setNotice('La clave ya fue enviada recientemente. Revisa tu correo.');
        setPhase('ready');
      } else {
        setError(e.message);
        setPhase((p) => (p === 'verifying' ? 'error' : p));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, clearSession]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    sendKey();
  }, [sendKey]);

  if (phase === 'verifying') return <Spinner text="Verificando identidad y enviando clave a tu correo…" />;
  if (phase === 'gone') return <Terminal title="Enlace expirado o revocado">Esta invitación ya no está disponible.</Terminal>;
  if (phase === 'error') {
    return (
      <div className="card space-y-3">
        <Alert>{error}</Alert>
        <button className="btn-primary" onClick={() => { setPhase('verifying'); sendKey(); }}>Reintentar</button>
      </div>
    );
  }
  if (phase === 'denied') {
    return (
      <div className="card space-y-3 text-center">
        <h1 className="text-lg font-semibold text-danger-text">Acceso denegado</h1>
        <p className="text-sm text-bosque-soft">
          Estás autenticado como <strong>{user.email}</strong>, pero esta invitación pertenece a <strong className="font-mono">{invitation.maskedEmail}</strong>.
        </p>
        <button className="btn-primary" onClick={logout}>Cerrar sesión y cambiar de cuenta</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h2 className="font-semibold text-success-text">Identidad verificada</h2>
        <ol className="space-y-1 text-sm">
          <li>✅ Canal 1: enlace de invitación y sesión de <span className="font-mono">{user.email}</span></li>
          <li>🔑 Canal 2: ingresa la clave que enviamos a tu correo</li>
        </ol>
      </div>
      <Alert kind="ok">{notice}</Alert>
      <Alert>{error}</Alert>
      <Unlock token={token} onResend={sendKey} resend={resend} setPhase={setPhase} />
    </div>
  );
}

function Unlock({ token, onResend, resend, setPhase }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(null); // { used, max }
  const lock = useCountdown();
  // Estado de descarga: el ticket vive SOLO en memoria de React.
  const [session, setSession] = useState(null); // { ticket, ticketExpiresAt, vault, files, downloadsRemaining }
  const [info, setInfo] = useState('');
  const [downloading, setDownloading] = useState(false);
  const ticketTimer = useCountdown();

  // Al vencer los 60 s el ticket se elimina de memoria.
  useEffect(() => {
    if (session?.ticket && !ticketTimer.active) {
      setSession((s) => (s ? { ...s, ticket: null } : s));
      setInfo('El ticket de descarga venció (60 s). Vuelve a ingresar la clave para una nueva descarga.');
    }
  }, [ticketTimer.active, session?.ticket]);

  async function unlock(e) {
    e.preventDefault();
    if (lock.active || busy) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const r = await unlockInvitation(token, password.trim());
      setPassword('');
      setAttempts(null);
      lock.stop();
      setSession({ ticket: r.ticket, ticketExpiresAt: r.ticketExpiresAt, vault: r.vault, files: r.files, downloadsRemaining: r.downloadsRemaining });
      const expires = Date.parse(r.ticketExpiresAt);
      ticketTimer.startAt(Number.isFinite(expires) ? expires : Date.now() + TICKET_TTL_SECONDS * 1000);
    } catch (err) {
      const d = err.data || {};
      if (err.status === 401 || err.status === 429) {
        setError(err.message);
        if (d.attemptsUsed != null) setAttempts({ used: d.attemptsUsed, max: d.maxAttempts ?? MAX_UNLOCK_ATTEMPTS });
        if (d.retryAfterSeconds) lock.start(d.retryAfterSeconds);
      } else if (err.status === 403) {
        if (err.message === 'Acceso denegado') setPhase('denied');
        else setError(err.message);
      } else if (err.status === 404 || err.status === 410) {
        setPhase('gone');
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function download(file) {
    const ticket = session?.ticket;
    if (!ticket || downloading) return;
    // Ticket de un solo uso: se elimina de memoria antes de enviarlo.
    setSession((s) => ({ ...s, ticket: null }));
    ticketTimer.stop();
    setDownloading(true);
    setError('');
    setInfo('');
    try {
      const name = await downloadSharedFile(session.vault.id, file.id, file.original_filename, ticket);
      const left = Math.max(0, session.downloadsRemaining - 1);
      setSession((s) => ({ ...s, downloadsRemaining: left }));
      setInfo(
        left > 0
          ? `«${name}» descargado. El ticket ya fue consumido: para descargar otro archivo vuelve a ingresar la clave. Descargas restantes: ${left}.`
          : `«${name}» descargado. Ya no te quedan descargas en esta invitación.`,
      );
    } catch (err) {
      if (err.status === 401) setInfo('El ticket es inválido, expiró o ya fue utilizado. Vuelve a ingresar la clave para obtener uno nuevo.');
      else if (err.status === 403 || err.status === 410) setError(err.message);
      else setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  const noDownloads = session && session.downloadsRemaining <= 0;
  const needsKey = !session || (!session.ticket && !noDownloads);
  const attemptsText = attempts ? `${attempts.used} de ${attempts.max} intentos` : null;

  return (
    <div className="space-y-4">
      {session && (
        <section className="card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold">{session.vault.name}</h2>
            {session.ticket && <span className="badge bg-info-bg text-info-text ring-1 ring-info-border">Ticket vence en {formatClock(ticketTimer.remaining)}</span>}
          </div>
          {session.ticket && <p className="text-xs text-bosque-muted">El ticket sirve para una sola descarga y vence en {TICKET_TTL_SECONDS} segundos. Descargas restantes: {session.downloadsRemaining}.</p>}
          {session.files.length === 0 && <p className="text-sm text-bosque-soft">La bóveda no tiene archivos.</p>}
          <ul className="divide-y divide-niebla">
            {session.files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.original_filename}</p>
                  <p className="text-xs text-bosque-muted">{formatBytes(f.size_bytes)}</p>
                </div>
                <button className="btn-primary py-1.5" disabled={!session.ticket || downloading} onClick={() => download(f)}>
                  {downloading ? 'Descargando…' : 'Descargar'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Alert kind="info">{info}</Alert>
      {noDownloads && <Alert kind="warn">Se alcanzó el límite de descargas de esta invitación.</Alert>}

      {needsKey && (
        <form onSubmit={unlock} className="card space-y-3">
          <label className="label" htmlFor="key">Clave de acceso recibida por correo</label>
          <input
            id="key" className="input font-mono" required maxLength={128} autoComplete="off" spellCheck={false}
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={lock.active}
          />
          <Alert>{error}</Alert>
          {attemptsText && <p className="text-sm font-medium text-danger-text">{attemptsText}</p>}
          {lock.active && <Alert kind="warn">Espera {formatClock(lock.remaining)} antes de volver a intentar.</Alert>}
          <button className="btn-primary w-full" disabled={busy || lock.active || !password.trim()}>
            {busy ? 'Verificando…' : lock.active ? `Espera ${formatClock(lock.remaining)}` : session ? 'Obtener nuevo ticket' : 'Desbloquear bóveda'}
          </button>
          <button type="button" className="btn-ghost w-full" disabled={resend.active || busy} onClick={onResend}>
            {resend.active ? `Reenviar clave (${resend.remaining} s)` : 'Reenviar clave'}
          </button>
        </form>
      )}
      <p className="text-center text-sm"><Link href="/shared" className="text-bosque-soft underline underline-offset-2">Ir a Compartidas conmigo</Link></p>
    </div>
  );
}
