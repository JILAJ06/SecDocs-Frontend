'use client';

import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { Alert, MemberBadge, Spinner, VaultBadge } from '@/components/ui';
import { listShared } from '@/lib/api';
import { formatDate } from '@/lib/format';

export default function SharedPage() {
  return (
    <Shell>
      <Shared />
    </Shell>
  );
}

function Shared() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listShared()
      .then((r) => setItems(r.shared))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Compartidas conmigo</h1>
        <p className="text-sm text-bosque-soft">
          Para descargar necesitas un ticket de un solo uso: abre el enlace de invitación original (<span className="font-mono">/invitacion/…</span>) e ingresa tu clave.
        </p>
      </div>
      <Alert>{error}</Alert>
      {!items && !error && <Spinner />}
      {items && items.length === 0 && <div className="card text-sm text-bosque-soft">Aún no tienes bóvedas compartidas contigo.</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        {items?.map((s) => (
          <article key={s.vault_id} className="card space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="truncate font-semibold">{s.name}</h2>
              <VaultBadge status={s.vault_status} />
            </div>
            <p className="text-sm text-bosque-soft">De: <span className="font-mono">{s.owner_email}</span></p>
            <p className="text-sm text-bosque-soft">{s.files_count} archivo(s) · expira {formatDate(s.vault_expires_at)}</p>
            <div className="flex items-center justify-between text-sm">
              <MemberBadge status={s.member_status} />
              <span className="font-medium">Descargas restantes: {s.downloads_remaining} de {s.max_downloads}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
