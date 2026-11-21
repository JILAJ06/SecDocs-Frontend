'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import { Alert, Button, Select } from '@/components/ui';
import { listAuditEvents, listAuditVaultOptions } from '@/lib/services/audit';

const EVENT_TONE_CLASSES = {
  success: 'text-success-text',
  danger: 'text-danger-text',
  warning: 'text-warning-text',
  info: 'text-info-text',
  neutral: 'text-bosque-neutral',
};

const TYPE_OPTIONS = [
  ['ALL', 'Todos los eventos'],
  ['Accesos', 'Accesos'],
  ['Seguridad', 'Seguridad'],
  ['Archivos', 'Archivos'],
  ['Invitaciones', 'Invitaciones'],
  ['Ciclo de vida', 'Ciclo de vida'],
];

export default function AuditPage() {
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();

  const [vaultOptions, setVaultOptions] = useState([]);
  const [vaultFilter, setVaultFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    listAuditVaultOptions()
      .then((opts) => setVaultOptions(opts))
      .catch(() => {});
  }, [session]);

  const loadEvents = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      const list = await listAuditEvents({
        vaultId: vaultFilter,
        type: typeFilter,
      });
      setEvents(list);
    } catch {
      setError('Algo salió mal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [session, vaultFilter, typeFilter]);

  useEffect(() => {
    if (session) loadEvents();
  }, [session, loadEvents]);

  if (!session) return null;

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="audit" email={session.email} onLogout={handleLogout} />
      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-5 px-6 pb-12 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold leading-8 text-bosque">Auditoría de accesos</h1>
            <p className="text-sm leading-5 text-bosque-soft">
              Quién hizo qué, cuándo y desde dónde. Nunca se guardan tokens ni contraseñas.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="w-[220px]">
              <Select
                label="Bóveda"
                value={vaultFilter}
                onChange={(e) => setVaultFilter(e.target.value)}
              >
                <option value="ALL">Todas las bóvedas</option>
                {vaultOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-[200px]">
              <Select
                label="Tipo"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <Button variant="secondary" onClick={loadEvents} disabled={loading}>
              Actualizar
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-info-border bg-info-bg px-3.5 py-2.5 text-sm leading-5 text-info-text">
          Retención LFPDPPP: los registros con IP se eliminan automáticamente a los 6 meses (principio de cancelación). Las métricas anónimas se conservan.
        </div>

        {error && (
          <div role="alert">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        <section
          aria-label="Bitácora de eventos"
          className="overflow-hidden rounded-2xl border border-niebla bg-white"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              <div className="flex gap-3 px-4 py-3 text-xs font-medium uppercase leading-4 tracking-[0.6px] text-bosque-muted">
                <span className="w-[138px] shrink-0">Fecha</span>
                <span className="w-[288px] shrink-0">Evento</span>
                <span className="w-[208px] shrink-0">Bóveda / archivo</span>
                <span className="w-[158px] shrink-0">Usuario</span>
                <span className="w-[128px] shrink-0">IP</span>
                <span className="flex-1">Detalle</span>
              </div>

              {loading ? (
                <div className="border-t border-niebla px-4 py-3 text-sm text-bosque-soft">
                  Cargando…
                </div>
              ) : events.length === 0 ? (
                <div className="border-t border-niebla px-4 py-3 text-sm text-bosque-soft">
                  No hay eventos con esos filtros
                </div>
              ) : (
                events.map((item) => {
                  const toneClass = EVENT_TONE_CLASSES[item.tone] || 'text-bosque-soft';
                  return (
                    <div
                      key={item.id}
                      className="flex h-10 items-center gap-3 border-t border-niebla px-4 py-2.5 text-sm leading-5"
                    >
                      <span className="w-[138px] shrink-0 truncate text-bosque-soft">
                        {item.date}
                      </span>
                      <span
                        className={`w-[288px] shrink-0 truncate ${toneClass} ${
                          item.bold ? 'font-semibold' : ''
                        }`}
                      >
                        {item.event}
                      </span>
                      <span className="w-[208px] shrink-0 truncate text-bosque">
                        {item.target}
                      </span>
                      <span className="w-[158px] shrink-0 truncate text-bosque">
                        {item.user}
                      </span>
                      <span className="w-[128px] shrink-0 truncate font-mono text-xs leading-4 text-bosque-soft">
                        {item.ip}
                      </span>
                      <span className="flex-1 truncate text-bosque-soft">{item.detail}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
