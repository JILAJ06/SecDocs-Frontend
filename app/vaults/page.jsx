'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { Alert, Spinner, Stat, VaultBadge } from '@/components/ui';
import { createVault, listVaults } from '@/lib/api';
import { VAULT_MAX_DAYS, effectiveVaultStatus } from '@/lib/constants';
import { addDays, endOfDayISO, formatBytes, formatDate, toDateInputValue } from '@/lib/format';

export default function VaultsPage() {
  return (
    <Shell>
      <Vaults />
    </Shell>
  );
}

function Vaults() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await listVaults());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const m = data?.metrics;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Mis bóvedas</h1>
        <p className="text-sm text-bosque-soft">Cada archivo se cifra con AES-256-GCM antes de guardarse.</p>
      </div>
      <Alert>{error}</Alert>
      {!data && !error && <Spinner />}
      {m && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Almacenamiento usado" value={formatBytes(m.total_storage_bytes)} />
          <Stat label="Archivos" value={m.total_files_active} />
          <Stat label="Bóvedas activas" value={m.total_vaults_active} />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <NewVault onCreated={load} />
        <section className="space-y-3">
          {data && data.vaults.length === 0 && <div className="card text-sm text-bosque-soft">Aún no tienes bóvedas. Crea la primera.</div>}
          {data?.vaults.map((v) => (
            <Link key={v.id} href={`/vaults/${v.id}`} className="card block transition hover:border-salvia">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{v.name}</h2>
                  <p className="text-xs text-bosque-muted">Expira: {formatDate(v.expires_at)}</p>
                </div>
                <VaultBadge status={effectiveVaultStatus(v)} />
              </div>
              <p className="mt-3 text-sm text-bosque-soft">
                {v.files_count} archivo(s) · {v.members_count} miembro(s)
              </p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

function NewVault({ onCreated }) {
  const min = toDateInputValue(addDays(1));
  const max = toDateInputValue(addDays(VAULT_MAX_DAYS - 1));
  const [name, setName] = useState('');
  const [date, setDate] = useState(toDateInputValue(addDays(30)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 150) return setError('El nombre debe tener entre 1 y 150 caracteres');
    if (date < min) return setError('La fecha de expiración debe ser futura');
    if (date > max) return setError(`La expiración no puede exceder ${VAULT_MAX_DAYS} días desde hoy`);
    setBusy(true);
    try {
      await createVault(trimmed, endOfDayISO(date));
      setName('');
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card h-fit space-y-4">
      <h2 className="text-lg font-semibold">Nueva bóveda</h2>
      <div>
        <label className="label" htmlFor="vault-name">Nombre</label>
        <input id="vault-name" className="input" required maxLength={150} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="vault-exp">Fecha de expiración</label>
        <input id="vault-exp" type="date" className="input" required min={min} max={max} value={date} onChange={(e) => setDate(e.target.value)} />
        <p className="mt-1 text-xs text-bosque-muted">Al expirar, las llaves se destruyen y el contenido es irrecuperable (máx. {VAULT_MAX_DAYS} días).</p>
      </div>
      <Alert>{error}</Alert>
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creando…' : 'Crear bóveda'}</button>
    </form>
  );
}
