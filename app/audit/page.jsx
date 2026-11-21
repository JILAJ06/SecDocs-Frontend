'use client';

import { useCallback, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { Alert, Spinner, Stat } from '@/components/ui';
import { getAuditLogs, getAuditStats } from '@/lib/api';
import { AUDIT_EVENTS, AUDIT_PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';

export default function AuditPage() {
  return (
    <Shell>
      <Audit />
    </Shell>
  );
}

function Audit() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Auditoría de accesos</h1>
        <p className="text-sm text-bosque-soft">Cada intento, descarga y destrucción queda registrado. La bitácora nunca guarda tokens ni claves.</p>
      </div>
      <Stats />
      <Logs />
    </div>
  );
}

function BarChart({ title, series, field, color }) {
  const max = Math.max(1, ...series.map((p) => p[field]));
  return (
    <div className="card space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex h-28 items-end gap-0.5" role="img" aria-label={title}>
        {series.map((p) => (
          <div key={p.date} className="flex h-full flex-1 items-end" title={`${p.date}: ${p[field]}`}>
            <div className={`w-full rounded-t ${color}`} style={{ height: `${(p[field] / max) * 100}%`, minHeight: p[field] ? 3 : 1 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-bosque-muted">
        <span>{series[0]?.date}</span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function Stats() {
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setStats(null);
    getAuditStats(days)
      .then((r) => { if (alive) { setStats(r); setError(''); } })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [days]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Actividad</h2>
        <select className="input w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Periodo">
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
        </select>
      </div>
      <Alert>{error}</Alert>
      {!stats && !error && <Spinner />}
      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Descargas" value={stats.totals.downloads} />
            <Stat label="Intentos fallidos" value={stats.totals.failedAttempts} />
            <Stat label="Visitantes únicos" value={stats.totals.uniqueVisitors} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <BarChart title="Descargas por día" series={stats.series} field="downloads" color="bg-bosque" />
            <BarChart title="Intentos fallidos por día" series={stats.series} field="failedAttempts" color="bg-danger-border" />
            <BarChart title="Visitantes únicos por día" series={stats.series} field="uniqueVisitors" color="bg-salvia" />
          </div>
        </>
      )}
    </section>
  );
}

function describe(detail) {
  if (!detail || typeof detail !== 'object') return '—';
  const entries = Object.entries(detail);
  if (entries.length === 0) return '—';
  return entries.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' · ');
}

function Logs() {
  const [filters, setFilters] = useState({ event: '', from: '', to: '' });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getAuditLogs({ page, limit: AUDIT_PAGE_SIZE, ...applied }));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => {
    load();
  }, [load]);

  function apply(e) {
    e.preventDefault();
    if (filters.from && filters.to && filters.from > filters.to) return setError('from debe ser anterior a to');
    setError('');
    setPage(1);
    setApplied(filters);
  }

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const p = data?.pagination;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Bitácora</h2>
      <Alert kind="info">
        Política de retención: los registros se conservan <strong>6 meses</strong> conforme a la LFPDPPP
        {data?.retentionPolicy ? ` (${data.retentionPolicy})` : ''}.
      </Alert>
      <form onSubmit={apply} className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label" htmlFor="f-event">Evento</label>
          <select id="f-event" className="input" value={filters.event} onChange={set('event')}>
            <option value="">Todos</option>
            {Object.entries(AUDIT_EVENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-from">Desde</label>
          <input id="f-from" type="date" className="input" value={filters.from} onChange={set('from')} />
        </div>
        <div>
          <label className="label" htmlFor="f-to">Hasta</label>
          <input id="f-to" type="date" className="input" value={filters.to} onChange={set('to')} />
        </div>
        <button className="btn-primary">Filtrar</button>
      </form>
      <Alert>{error}</Alert>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-niebla text-xs uppercase text-bosque-muted">
            <tr>
              <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Evento</th><th className="px-4 py-3">Bóveda</th>
              <th className="px-4 py-3">IP</th><th className="px-4 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-niebla">
            {loading && !data && <tr><td colSpan={5} className="px-4 py-6 text-bosque-muted">Cargando…</td></tr>}
            {data && data.logs.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-bosque-muted">Sin eventos.</td></tr>}
            {data?.logs.map((l) => {
              const ev = AUDIT_EVENTS[l.event] || { label: l.event, cls: 'bg-niebla text-bosque-soft' };
              return (
                <tr key={l.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-bosque-soft">{formatDate(l.created_at)}</td>
                  <td className="px-4 py-2"><span className={`badge ${ev.cls}`}>{ev.label}</span></td>
                  <td className="px-4 py-2 font-mono text-xs text-bosque-soft">{l.vault_id ? l.vault_id.slice(0, 8) : '—'}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-bosque-soft">{l.ip || '—'}</td>
                  <td className="px-4 py-2 text-xs text-bosque-soft">{describe(l.detail)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {p && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-bosque-soft">{p.total} evento(s) · página {p.page} de {Math.max(1, p.totalPages)}</span>
          <div className="flex gap-2">
            <button className="btn-ghost py-1.5" disabled={loading || p.page <= 1} onClick={() => setPage(p.page - 1)}>Anterior</button>
            <button className="btn-ghost py-1.5" disabled={loading || p.page >= p.totalPages} onClick={() => setPage(p.page + 1)}>Siguiente</button>
          </div>
        </div>
      )}
    </section>
  );
}
