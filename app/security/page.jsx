'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Shell from '@/components/Shell';
import { Alert, Modal, Spinner } from '@/components/ui';
import { killSwitch, listSessions, revokeSession } from '@/lib/api';
import { formatDate } from '@/lib/format';

export default function SecurityPage() {
  return (
    <Shell>
      <Security />
    </Shell>
  );
}

function Security() {
  const { clearSession } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setSessions((await listSessions()).sessions);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function revoke(s) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const r = await revokeSession(s.jti);
      if (r.current) return clearSession(); // el servidor ya limpió la cookie → Shell redirige al login
      setNotice('Sesión cerrada.');
      await load();
    } catch (e) {
      setError(e.message);
      if (e.status === 404) await load();
    } finally {
      setBusy(false);
    }
  }

  async function killAll() {
    setBusy(true);
    setError('');
    try {
      await killSwitch();
      clearSession();
    } catch (e) {
      setConfirmAll(false);
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Seguridad</h1>
          <p className="text-sm text-bosque-soft">Sesiones activas de tu cuenta. Ciérralas si no reconoces alguna.</p>
        </div>
        <button className="btn-danger" disabled={busy} onClick={() => setConfirmAll(true)}>Cerrar todas las sesiones (Kill-Switch)</button>
      </div>
      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>
      {!sessions && !error && <Spinner />}
      {sessions && sessions.length === 0 && <div className="card text-sm text-bosque-soft">No hay sesiones activas.</div>}
      <div className="space-y-3">
        {sessions?.map((s) => (
          <article key={s.jti} className={`card flex flex-wrap items-center justify-between gap-3 ${s.current ? 'border-bosque ring-1 ring-bosque' : ''}`}>
            <div className="min-w-0 space-y-0.5 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate">{s.user_agent || 'Dispositivo desconocido'}</span>
                {s.current && <span className="badge bg-success-bg text-success-text ring-1 ring-success-border">Sesión actual</span>}
              </p>
              <p className="text-bosque-soft">IP: <span className="font-mono">{s.ip || '—'}</span></p>
              <p className="text-xs text-bosque-muted">Iniciada: {formatDate(s.created_at)} · Expira: {formatDate(s.expires_at)}</p>
            </div>
            <button className="btn-danger py-1.5" disabled={busy} onClick={() => revoke(s)}>{s.current ? 'Cerrar esta sesión' : 'Cerrar sesión'}</button>
          </article>
        ))}
      </div>

      {confirmAll && (
        <Modal title="Cerrar todas las sesiones" onClose={busy ? undefined : () => setConfirmAll(false)}>
          <Alert kind="warn">Se revocarán <strong>todas</strong> tus sesiones, incluida esta, y tendrás que iniciar sesión de nuevo.</Alert>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" disabled={busy} onClick={() => setConfirmAll(false)}>Cancelar</button>
            <button className="btn-danger" disabled={busy} onClick={killAll}>{busy ? 'Cerrando…' : 'Cerrar todas'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
