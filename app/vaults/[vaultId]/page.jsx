'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { Alert, CopyField, FileBadge, KekBadge, MemberBadge, Modal, Spinner, VaultBadge } from '@/components/ui';
import { deleteVault, deleteVaultFile, getVault, inviteMember, revokeMember, setVaultStatus, uploadVaultFile } from '@/lib/api';
import { MAX_FILE_BYTES, MAX_FILE_MB, UPLOAD_ACCEPT, effectiveVaultStatus } from '@/lib/constants';
import { formatBytes, formatDate, toDateInputValue } from '@/lib/format';

export default function VaultDetailPage() {
  return (
    <Shell>
      <VaultDetail />
    </Shell>
  );
}

function VaultDetail() {
  const { vaultId } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState(null); // { kind: 'vault' | 'file', file? }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await getVault(vaultId));
    } catch (e) {
      if (e.status === 404) setNotFound(true);
      else setError(e.message);
    }
  }, [vaultId]);

  useEffect(() => {
    load();
  }, [load]);

  /** Ejecuta una acción; en 409 muestra el conflicto y refresca el estado de la bóveda. */
  async function run(fn, okMsg) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
      if (okMsg) setNotice(okMsg);
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      if (e.status === 409 || e.status === 404) await load();
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <div className="card space-y-3">
        <p className="font-semibold">Bóveda no encontrada</p>
        <Link href="/vaults" className="btn-ghost">Volver a mis bóvedas</Link>
      </div>
    );
  }
  if (!data) return error ? <Alert>{error}</Alert> : <Spinner />;

  const { vault, files, members } = data;
  const status = effectiveVaultStatus(vault);
  const operable = status === 'ACTIVE';
  const canToggle = vault.status === 'ACTIVE' || (vault.status === 'LOCKED' && !vault.expired);
  const gone = status === 'PURGED';

  async function doConfirm() {
    const c = confirm;
    setConfirm(null);
    if (c.kind === 'file') {
      await run(() => deleteVaultFile(vaultId, c.file.id), `«${c.file.original_filename}» fue destruido.`);
    } else {
      setBusy(true);
      try {
        await deleteVault(vaultId);
        router.replace('/vaults');
      } catch (e) {
        setError(e.message);
        setBusy(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/vaults" className="text-sm text-bosque-soft hover:text-bosque">← Mis bóvedas</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-3 text-xl font-semibold">
            <span className="truncate">{vault.name}</span>
            <VaultBadge status={status} />
          </h1>
          <p className="text-sm text-bosque-soft">Creada: {formatDate(vault.created_at)} · Expira: {formatDate(vault.expires_at)}</p>
        </div>
        {!gone && (
          <div className="flex gap-2">
            {canToggle && (
              <button
                className="btn-ghost"
                disabled={busy}
                onClick={() => run(() => setVaultStatus(vaultId, vault.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'), vault.status === 'ACTIVE' ? 'Bóveda bloqueada.' : 'Bóveda reactivada.')}
              >
                {vault.status === 'ACTIVE' ? 'Bloquear' : 'Reactivar'}
              </button>
            )}
            <button className="btn-danger" disabled={busy} onClick={() => setConfirm({ kind: 'vault' })}>Eliminar</button>
          </div>
        )}
      </div>

      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>
      {!operable && <Alert kind="warn">La bóveda está {status === 'LOCKED' ? 'bloqueada' : status === 'EXPIRED' ? 'expirada' : 'destruida'}: no se pueden subir archivos ni invitar miembros.</Alert>}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <FilesCard vaultId={vaultId} files={files} operable={operable} busy={busy} run={run} onDelete={(file) => setConfirm({ kind: 'file', file })} />
          <MembersCard vaultId={vaultId} vault={vault} members={members} operable={operable} busy={busy} run={run} setError={setError} reload={load} />
        </div>
        <KeysCard keys={vault.keys} />
      </div>

      {confirm && (
        <Modal title={confirm.kind === 'vault' ? 'Eliminar bóveda' : 'Eliminar archivo'} onClose={() => setConfirm(null)}>
          {confirm.kind === 'vault' ? (
            <Alert kind="warn">
              Se ejecutará <strong>crypto-shredding</strong>: se destruyen la llave de la bóveda y las llaves de todos sus archivos, se revocan
              todos los miembros y se borran los binarios cifrados. Esta acción es <strong>irreversible</strong> y el contenido no podrá recuperarse.
            </Alert>
          ) : (
            <Alert kind="warn">
              Se destruirá la llave de «{confirm.file.original_filename}» y su contenido será irrecuperable.
            </Alert>
          )}
          <div className="flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setConfirm(null)}>Cancelar</button>
            <button className="btn-danger" onClick={doConfirm}>{confirm.kind === 'vault' ? 'Destruir bóveda' : 'Destruir archivo'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function KeysCard({ keys }) {
  return (
    <aside className="card h-fit space-y-3">
      <h2 className="text-lg font-semibold">Llaves</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-bosque-soft">Algoritmo</dt><dd className="font-mono">{keys.algorithm}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-bosque-soft">Estado de la KEK</dt><dd><KekBadge status={keys.kekStatus} /></dd></div>
      </dl>
      <p className="text-xs text-bosque-muted">Solo se muestran metadatos. El material de las llaves nunca sale del servidor.</p>
    </aside>
  );
}

function uploadErrorMessage(e) {
  if (e.status === 413) return `El archivo excede el tamaño máximo permitido (${MAX_FILE_MB} MB).`;
  if (e.status === 415) return 'Tipo de archivo no permitido: por seguridad, el formato real del archivo (ejecutables, scripts, HTML, SVG, etc.) no se acepta.';
  return e.message;
}

function FilesCard({ vaultId, files, operable, busy, run, onDelete }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  function pick(e) {
    const f = e.target.files?.[0] || null;
    setError('');
    if (f && f.size === 0) {
      setError('El archivo está vacío');
      return setFile(null);
    }
    if (f && f.size > MAX_FILE_BYTES) {
      setError(`El archivo supera el límite de ${MAX_FILE_MB} MB`);
      return setFile(null);
    }
    setFile(f);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    const ok = await run(async () => {
      try {
        await uploadVaultFile(vaultId, file);
      } catch (err) {
        setError(uploadErrorMessage(err));
        throw err;
      }
    }, `«${file.name}» se cifró y guardó correctamente.`);
    if (ok) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
    setUploading(false);
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">Archivos</h2>
      {operable && (
        <form onSubmit={submit} className="space-y-2">
          <input ref={inputRef} type="file" accept={UPLOAD_ACCEPT} onChange={pick} className="block w-full text-sm" aria-label="Archivo a subir" />
          <p className="text-xs text-bosque-muted">PDF, Office, texto/CSV, PNG/JPEG/WEBP y ZIP · máx. {MAX_FILE_MB} MB.</p>
          <Alert>{error}</Alert>
          <button className="btn-primary" disabled={!file || uploading || busy}>{uploading ? 'Cifrando y subiendo…' : 'Subir archivo'}</button>
        </form>
      )}
      {files.length === 0 ? (
        <p className="text-sm text-bosque-soft">Esta bóveda aún no tiene archivos.</p>
      ) : (
        <ul className="divide-y divide-niebla">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{f.original_filename}</p>
                <p className="text-xs text-bosque-muted">{f.mime_type} · {formatBytes(f.size_bytes)} · {formatDate(f.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <FileBadge status={f.status} />
                <button className="btn-danger py-1" disabled={busy} onClick={() => onDelete(f)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MembersCard({ vaultId, vault, members, operable, busy, run, setError, reload }) {
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [maxDownloads, setMaxDownloads] = useState(3);
  const [formError, setFormError] = useState('');
  const [invite, setInvite] = useState(null); // { link, email } solo en memoria
  const maxDate = toDateInputValue(new Date(vault.expires_at));

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    const n = Number(maxDownloads);
    if (!Number.isInteger(n) || n < 1 || n > 10) return setFormError('max_downloads debe ser un entero entre 1 y 10');
    const payload = { recipient_email: email.trim(), max_downloads: n };
    if (label.trim()) payload.recipient_label = label.trim();
    let created = null;
    const ok = await run(async () => {
      try {
        created = await inviteMember(vaultId, payload);
      } catch (err) {
        setFormError(err.message);
        throw err;
      }
    });
    if (ok && created) {
      setInvite({ link: `${window.location.origin}${created.invitationPath}`, email: created.member.recipient_email });
      setEmail('');
      setLabel('');
    }
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">Miembros invitados</h2>
      {operable && (
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="m-email">Correo</label>
            <input id="m-email" type="email" required className="input" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="m-label">Etiqueta (opcional)</label>
            <input id="m-label" className="input" maxLength={120} value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="m-max">Descargas máximas (1–10)</label>
            <input id="m-max" type="number" min={1} max={10} className="input" value={maxDownloads} onChange={(e) => setMaxDownloads(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" disabled={busy}>Invitar por correo</button>
          </div>
          <p className="text-xs text-bosque-muted sm:col-span-2">La invitación vence con la bóveda ({maxDate}).</p>
          <div className="sm:col-span-2"><Alert>{formError}</Alert></div>
        </form>
      )}
      {members.length === 0 ? (
        <p className="text-sm text-bosque-soft">Aún no has invitado a nadie.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-niebla text-xs uppercase text-bosque-muted">
              <tr>
                <th className="py-2 pr-3">Invitado</th><th className="pr-3">Estado</th><th className="pr-3">Intentos fallidos</th>
                <th className="pr-3">Bloqueado hasta</th><th className="pr-3">Descargas</th><th className="pr-3">Último acceso</th><th />
              </tr>
            </thead>
            <tbody className="divide-y divide-niebla">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 pr-3">
                    <p className="font-medium">{m.recipient_email}</p>
                    {m.recipient_label && <p className="text-xs text-bosque-muted">{m.recipient_label}</p>}
                  </td>
                  <td className="pr-3"><MemberBadge status={m.status} /></td>
                  <td className="pr-3">{m.failed_attempts}</td>
                  <td className="whitespace-nowrap pr-3">{m.locked_until ? formatDate(m.locked_until) : '—'}</td>
                  <td className="pr-3">{m.download_count}/{m.max_downloads}</td>
                  <td className="whitespace-nowrap pr-3">{formatDate(m.last_access_at)}</td>
                  <td className="text-right">
                    {m.status !== 'REVOKED' && (
                      <button className="btn-danger py-1" disabled={busy} onClick={() => run(() => revokeMember(vaultId, m.id), `Acceso de ${m.recipient_email} revocado.`)}>
                        Revocar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invite && (
        <Modal title="Invitación creada" onClose={() => { setInvite(null); reload(); }}>
          <Alert kind="warn">Este enlace se muestra <strong>una sola vez</strong> y no podrá recuperarse. Cópialo ahora y envíalo a {invite.email} (Canal 1). La clave de acceso le llegará por correo (Canal 2).</Alert>
          <CopyField label="Enlace de invitación" value={invite.link} />
          <div className="flex justify-end"><button className="btn-primary" onClick={() => { setInvite(null); reload(); }}>Ya lo copié</button></div>
        </Modal>
      )}
    </section>
  );
}
