'use client';

import { useCallback, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { Alert } from '@/components/ui';
import { api, errorMessage, formatDate } from '@/lib/api';

const EVENTS = {
  USER_REGISTERED: ['Cuenta creada', 'text-bosque-soft'],
  LOGIN_OK: ['Inicio de sesión', 'text-bosque-soft'],
  LOGIN_FAIL: ['Inicio de sesión fallido', 'text-danger-text'],
  FILE_UPLOADED: ['Archivo cifrado y guardado', 'text-success-text'],
  LINK_CREATED: ['Enlace creado', 'text-success-text'],
  VERIFY_OK: ['Clave correcta', 'text-success-text'],
  VERIFY_FAIL: ['Clave incorrecta', 'text-danger-text'],
  LINK_LOCKED: ['Enlace bloqueado (fuerza bruta)', 'text-danger-text font-semibold'],
  DOWNLOAD_STARTED: ['Descarga iniciada', 'text-info-text'],
  DOWNLOAD_COMPLETED: ['Descarga completada', 'text-info-text'],
  DOWNLOAD_ABORTED: ['Descarga interrumpida', 'text-warning-text'],
  INTEGRITY_FAIL: ['¡Archivo alterado! Descarga bloqueada', 'text-danger-text font-semibold'],
  LINK_EXPIRED: ['Enlace expirado', 'text-bosque-soft'],
  LINK_REVOKED: ['Enlace revocado', 'text-warning-text'],
  FILE_PURGED: ['Archivo destruido (crypto-shredding)', 'text-bosque-soft font-semibold'],
};

const REASONS = {
  ALL_LINKS_FINISHED: 'todos los enlaces terminaron',
  FILE_EXPIRED: 'venció el archivo',
  OWNER_DELETED: 'eliminado por el dueño',
  MAX_FAILED_ATTEMPTS: '5 intentos fallidos',
};

function describe(detail) {
  if (!detail) return '';
  const parts = [];
  if (detail.reason) parts.push(REASONS[detail.reason] || detail.reason);
  if (detail.attempt) parts.push(`intento ${detail.attempt}/5`);
  if (detail.download) parts.push(`descarga ${detail.download}/${detail.of}`);
  if (detail.recipient) parts.push(`para ${detail.recipient}`);
  if (detail.size) parts.push(`${detail.size} bytes`);
  return parts.join(' · ');
}

export default function AuditPage() {
  return (
    <Shell>
      <AuditLog />
    </Shell>
  );
}

function AuditLog() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    try {
      const r = await api.get('/audit', { params: { limit: 300 } });
      setEvents(r.data.events);
    } catch (e) {
      setError(errorMessage(e, 'No se pudo cargar la bitácora'));
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const alerts = new Set(['VERIFY_FAIL', 'LINK_LOCKED', 'INTEGRITY_FAIL', 'LOGIN_FAIL']);
  const shown = filter === 'ALERTS' ? events.filter((e) => alerts.has(e.event)) : events;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Auditoría de accesos</h1>
          <p className="text-sm text-bosque-soft">Cada intento, descarga y destrucción queda registrado. La bitácora nunca guarda tokens ni claves.</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">Todos los eventos</option>
            <option value="ALERTS">Sólo alertas de seguridad</option>
          </select>
          <button className="btn-ghost" onClick={load}>Actualizar</button>
        </div>
      </div>
      <Alert>{error}</Alert>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-niebla text-xs uppercase text-bosque-muted">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Archivo</th>
              <th className="px-4 py-3">Receptor</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-niebla">
            {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-bosque-muted">Sin eventos.</td></tr>}
            {shown.map((e) => {
              const [label, cls] = EVENTS[e.event] || [e.event, 'text-bosque-soft'];
              return (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-bosque-soft">{formatDate(e.created_at)}</td>
                  <td className={`px-4 py-2 ${cls}`}>{label}</td>
                  <td className="max-w-[220px] truncate px-4 py-2">{e.original_filename || '—'}</td>
                  <td className="px-4 py-2">{e.recipient_label || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-bosque-soft">{e.ip || '—'}</td>
                  <td className="px-4 py-2 text-bosque-soft">{describe(e.detail)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
