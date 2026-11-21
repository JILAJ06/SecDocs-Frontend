'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Modal from '@/components/Modal';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import SessionRow from '@/components/SessionRow';
import { Alert, Button, Field } from '@/components/ui';
import {
  changePassword,
  listSessions,
  revokeAllSessions,
  revokeSession,
} from '@/lib/services/sessions';

export default function SecurityPage() {
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokedDeviceNotice, setRevokedDeviceNotice] = useState('Chrome · Android');
  const [confirmAll, setConfirmAll] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [nextPwd, setNextPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await listSessions();
      setItems(list);
    } catch {
      setError('Algo salió mal. Intenta de nuevo.');
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

  async function handleRevokeOne(target) {
    setRevokingId(target.id);
    try {
      const updated = await revokeSession(target.id, session.email);
      setItems((prev) => prev.map((s) => (s.id === target.id ? updated : s)));
      setRevokedDeviceNotice(target.device);
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRevokeAll() {
    setRevokingAll(true);
    try {
      const res = await revokeAllSessions(session.email);
      setItems(res.sessions);
      if (res.revokedDevices.length > 0) {
        setRevokedDeviceNotice(res.revokedDevices.join(', '));
      }
      setConfirmAll(false);
    } finally {
      setRevokingAll(false);
    }
  }

  function openPwdModal() {
    setCurrentPwd('');
    setNextPwd('');
    setConfirmPwd('');
    setPwdError('');
    setPwdSuccess('');
    setPwdModalOpen(true);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (nextPwd.length < 12 || nextPwd.length > 72) {
      setPwdError('La contraseña debe tener entre 12 y 72 caracteres');
      return;
    }
    if (nextPwd !== confirmPwd) {
      setPwdError('Las contraseñas no coinciden');
      return;
    }
    setPwdBusy(true);
    try {
      await changePassword(currentPwd, nextPwd, session.email);
      setPwdSuccess('Contraseña actualizada');
      setCurrentPwd('');
      setNextPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdError(err.message || 'La contraseña actual es incorrecta');
    } finally {
      setPwdBusy(false);
    }
  }

  const hasOtherActive = items.some((s) => s.status === 'ACTIVE' && !s.current);

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="security" email={session.email} onLogout={handleLogout} />
      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-5 px-6 pb-12 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-8 text-bosque">
            Seguridad de la cuenta
          </h1>
          <p className="text-sm leading-5 text-bosque-soft">
            Controla dónde está abierta tu sesión. Revocar una sesión la invalida al instante.
          </p>
        </div>

        {revokedDeviceNotice && (
          <div role="status" aria-live="polite">
            <Alert kind="ok">
              Sesión revocada: {revokedDeviceNotice}. Su token quedó en la lista negra y ya no puede usarse.
            </Alert>
          </div>
        )}

        {error && (
          <div role="alert">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <section className="flex w-full min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-niebla bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-semibold leading-7 text-bosque">
                  Sesiones activas
                </h2>
                <p className="text-xs leading-4 text-bosque-soft">
                  Cada sesión es un JWT con identificador único (jti).
                </p>
              </div>

              {confirmAll ? (
                <div className="flex items-center gap-2 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-xs font-semibold leading-4">
                  <span className="text-danger-text">¿Seguro?</span>
                  <button
                    type="button"
                    disabled={revokingAll}
                    onClick={handleRevokeAll}
                    className="text-danger-text underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia disabled:opacity-50"
                  >
                    Sí
                  </button>
                  <span className="text-bosque-muted">·</span>
                  <button
                    type="button"
                    disabled={revokingAll}
                    onClick={() => setConfirmAll(false)}
                    className="text-bosque underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia disabled:opacity-50"
                  >
                    No
                  </button>
                </div>
              ) : (
                <Button
                  variant="danger"
                  disabled={!hasOtherActive || loading}
                  onClick={() => setConfirmAll(true)}
                >
                  Cerrar todas las sesiones
                </Button>
              )}
            </div>

            {loading ? (
              <p className="py-2 text-sm text-bosque-soft">Cargando…</p>
            ) : items.length === 0 ? (
              <p className="py-2 text-sm text-bosque-soft">No hay sesiones registradas.</p>
            ) : (
              <div>
                {items.map((item) => (
                  <SessionRow
                    key={item.id}
                    item={item}
                    disabled={revokingId === item.id}
                    onRevoke={handleRevokeOne}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[380px]">
            <section className="flex flex-col gap-2.5 rounded-2xl border border-niebla bg-white p-6">
              <h2 className="text-base font-semibold leading-6 text-bosque">
                ¿Cómo funciona el kill-switch?
              </h2>
              <p className="text-sm leading-5 text-bosque-soft">
                Los JWT no se pueden “apagar” por sí solos. Al revocar una sesión, su jti se guarda en revoked_tokens y el servidor rechaza cualquier petición que lo use, aunque el token no haya expirado.
              </p>
              <p className="text-sm leading-5 text-bosque-soft">
                Úsalo si perdiste un dispositivo o ves una IP que no reconoces en la bitácora.
              </p>
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-niebla bg-white p-6">
              <h2 className="text-base font-semibold leading-6 text-bosque">Tu cuenta</h2>
              <div className="flex items-center justify-between text-sm leading-5">
                <span className="text-bosque-soft">Correo</span>
                <span className="font-medium text-bosque">{session.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <span className="text-bosque-soft">Contraseña</span>
                <span className="font-medium text-bosque">cambiada hace 12 días</span>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <span className="text-bosque-soft">Bitácora</span>
                <span className="font-medium text-bosque">se conserva 6 meses (LFPDPPP)</span>
              </div>
              <Button variant="secondary" className="w-full" onClick={openPwdModal}>
                Cambiar contraseña
              </Button>
            </section>
          </aside>
        </div>

        <Modal
          open={pwdModalOpen}
          onClose={() => !pwdBusy && setPwdModalOpen(false)}
          title="Cambiar contraseña"
        >
          <form onSubmit={handleChangePassword} noValidate className="flex flex-col gap-4">
            <Field
              label="Contraseña actual"
              type="password"
              required
              autoComplete="current-password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
            />
            <Field
              label="Nueva contraseña"
              type="password"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              value={nextPwd}
              onChange={(e) => setNextPwd(e.target.value)}
            />
            <Field
              label="Confirmar nueva contraseña"
              type="password"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />

            {pwdError && (
              <div role="alert">
                <Alert kind="error">{pwdError}</Alert>
              </div>
            )}

            {pwdSuccess && (
              <div role="status">
                <Alert kind="ok">{pwdSuccess}</Alert>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={pwdBusy}
                onClick={() => setPwdModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={pwdBusy}>
                Guardar contraseña
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
