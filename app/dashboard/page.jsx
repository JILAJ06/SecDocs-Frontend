'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { Alert, CopyField, StatusBadge } from '@/components/ui';
import { api, errorMessage, formatBytes, formatDate, generatePassword, timeLeft } from '@/lib/api';

const FILE_TTL = [[1, '1 hora'], [6, '6 horas'], [24, '24 horas'], [72, '3 días'], [168, '7 días']];
const LINK_TTL = [[15, '15 minutos'], [60, '1 hora'], [240, '4 horas'], [1440, '24 horas'], [10080, '7 días']];
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.docx,.xlsx,.pptx,.zip,.txt,.csv,.env,.pem,.key,.pub,.json';

export default function DashboardPage() {
  return (
    <Shell>
      <Vault />
    </Shell>
  );
}

function Vault() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [openFile, setOpenFile] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get('/files');
      setFiles(r.data.files);
    } catch (e) {
      setError(errorMessage(e, 'No se pudieron cargar los archivos'));
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // refleja expiraciones y purgas automáticas
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <UploadCard onUploaded={load} />
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Archivos en la bóveda</h2>
            <p className="text-sm text-bosque-soft">Cifrados con AES-256-GCM y una llave única por archivo.</p>
          </div>
          <button className="btn-ghost py-1.5" onClick={load}>Actualizar</button>
        </div>
        <Alert>{error}</Alert>
        {files.length === 0 && <div className="card text-sm text-bosque-soft">Aún no hay archivos. Sube el primero.</div>}
        {files.map((f) => (
          <FileCard
            key={f.id} file={f}
            open={openFile === f.id}
            onToggle={() => setOpenFile(openFile === f.id ? null : f.id)}
            onChanged={load}
          />
        ))}
      </section>
    </div>
  );
}

function UploadCard({ onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [hours, setHours] = useState(24);
  const [autoPurge, setAutoPurge] = useState(true);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: 'error', text: '' });

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMsg({ kind: 'error', text: '' });
    const form = new FormData();
    form.append('expiresInHours', String(hours));
    form.append('autoPurge', String(autoPurge));
    form.append('file', file); // los campos de texto van antes del archivo
    try {
      await api.post('/files', form, { onUploadProgress: (p) => setProgress(Math.round((p.loaded / (p.total || 1)) * 100)) });
      setMsg({ kind: 'ok', text: `«${file.name}» se cifró y guardó correctamente.` });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      onUploaded();
    } catch (err) {
      setMsg({ kind: 'error', text: errorMessage(err, 'No se pudo subir el archivo') });
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  return (
    <form onSubmit={submit} className="card h-fit space-y-4">
      <h2 className="text-lg font-semibold">Subir documento</h2>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-salvia px-4 py-8 text-center hover:border-bosque">
        <span className="text-sm font-medium">{file ? file.name : 'Selecciona un archivo'}</span>
        <span className="text-xs text-bosque-muted">{file ? formatBytes(file.size) : 'PDF, imágenes, Office, ZIP, .env, llaves… · máx. 25 MB'}</span>
        <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <div>
        <label className="label" htmlFor="ttl">El archivo se destruye en</label>
        <select id="ttl" className="input" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
          {FILE_TTL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <label className="flex items-start gap-2 text-sm text-bosque-soft">
        <input type="checkbox" className="mt-1 accent-bosque" checked={autoPurge} onChange={(e) => setAutoPurge(e.target.checked)} />
        <span>Destruir el archivo cuando todos sus enlaces se hayan usado, vencido o revocado.</span>
      </label>
      {busy && (
        <div className="h-1.5 overflow-hidden rounded bg-niebla">
          <div className="h-full bg-bosque transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <Alert kind={msg.kind}>{msg.text}</Alert>
      <button className="btn-primary w-full" disabled={!file || busy}>{busy ? 'Cifrando…' : 'Cifrar y guardar'}</button>
    </form>
  );
}

function FileCard({ file, open, onToggle, onChanged }) {
  const active = file.status === 'ACTIVE';
  const [busy, setBusy] = useState(false);

  async function destroy() {
    // Sin window.confirm (bloquea la página); se usa un doble clic explícito.
    setBusy(true);
    try {
      await api.delete(`/files/${file.id}`);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`card ${active ? '' : 'opacity-60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{file.original_filename}</h3>
            <StatusBadge status={file.status} />
          </div>
          <p className="mt-1 text-xs text-bosque-soft">
            {formatBytes(file.size_bytes)} · subido {formatDate(file.created_at)} ·{' '}
            {active ? `se destruye en ${timeLeft(file.expires_at)}` : `destruido ${formatDate(file.purged_at)}`} ·{' '}
            {file.links_active}/{file.links_total} enlaces activos
            {file.auto_purge && active ? ' · autodestrucción al agotar enlaces' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost py-1.5" onClick={onToggle}>{open ? 'Ocultar' : 'Enlaces'}</button>
          {active && <ConfirmButton onConfirm={destroy} disabled={busy}>Destruir</ConfirmButton>}
        </div>
      </div>
      {open && <LinksPanel file={file} onChanged={onChanged} />}
    </div>
  );
}

function ConfirmButton({ onConfirm, children, disabled }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      className="btn-danger py-1.5" disabled={disabled}
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
    >
      {armed ? '¿Seguro? Clic otra vez' : children}
    </button>
  );
}

function LinksPanel({ file, onChanged }) {
  const [links, setLinks] = useState([]);
  const [created, setCreated] = useState(null);

  const load = useCallback(async () => {
    const r = await api.get(`/files/${file.id}/links`);
    setLinks(r.data.links);
  }, [file.id]);

  useEffect(() => {
    load();
  }, [load, file.status, file.links_active]);

  async function revoke(id) {
    await api.post(`/links/${id}/revoke`);
    await load();
    onChanged();
  }

  return (
    <div className="mt-4 space-y-4 border-t border-niebla pt-4">
      {file.status === 'ACTIVE' && !created && (
        <NewLinkForm fileId={file.id} onCreated={(c) => { setCreated(c); load(); onChanged(); }} />
      )}
      {created && <CreatedLink data={created} onClose={() => setCreated(null)} />}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-bosque-muted">
            <tr>
              <th className="py-2 pr-3">Receptor</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2 pr-3">Descargas</th>
              <th className="py-2 pr-3">Fallos</th>
              <th className="py-2 pr-3">Vence</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-niebla">
            {links.length === 0 && (
              <tr><td colSpan={6} className="py-3 text-bosque-muted">Sin enlaces todavía.</td></tr>
            )}
            {links.map((l) => (
              <tr key={l.id}>
                <td className="py-2 pr-3 font-medium">{l.recipient_label}</td>
                <td className="py-2 pr-3"><StatusBadge status={l.effective_status} /></td>
                <td className="py-2 pr-3">{l.download_count}/{l.max_downloads}</td>
                <td className={`py-2 pr-3 ${l.failed_attempts ? 'text-danger-text' : ''}`}>{l.failed_attempts}/5</td>
                <td className="py-2 pr-3 text-bosque-soft">{l.effective_status === 'ACTIVE' ? timeLeft(l.expires_at) : formatDate(l.expires_at)}</td>
                <td className="py-2 text-right">
                  {l.effective_status === 'ACTIVE' && (
                    <button className="text-xs text-warning-text hover:underline" onClick={() => revoke(l.id)}>Revocar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewLinkForm({ fileId, onCreated }) {
  const [recipientLabel, setRecipient] = useState('');
  const [password, setPassword] = useState(() => generatePassword());
  const [expiresInMinutes, setTtl] = useState(60);
  const [maxDownloads, setMax] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.post(`/files/${fileId}/links`, { recipientLabel, password, expiresInMinutes, maxDownloads });
      onCreated({ ...r.data.link, password });
    } catch (err) {
      setError(errorMessage(err, 'No se pudo crear el enlace'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-niebla p-4">
      <h4 className="text-sm font-semibold">Nuevo enlace para un receptor</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`r-${fileId}`}>Receptor</label>
          <input id={`r-${fileId}`} className="input" required maxLength={120} placeholder="p. ej. Lic. Pérez (Notaría 12)" value={recipientLabel} onChange={(e) => setRecipient(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor={`p-${fileId}`}>Clave fuera de banda</label>
          <div className="flex gap-2">
            <input id={`p-${fileId}`} className="input font-mono" required minLength={10} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="btn-ghost shrink-0 px-3" onClick={() => setPassword(generatePassword())} title="Generar otra">↻</button>
          </div>
        </div>
        <div>
          <label className="label" htmlFor={`t-${fileId}`}>Vigencia del enlace</label>
          <select id={`t-${fileId}`} className="input" value={expiresInMinutes} onChange={(e) => setTtl(Number(e.target.value))}>
            {LINK_TTL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor={`m-${fileId}`}>Descargas permitidas</label>
          <select id={`m-${fileId}`} className="input" value={maxDownloads} onChange={(e) => setMax(Number(e.target.value))}>
            <option value={1}>1 (recomendado)</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
      </div>
      <p className="text-xs text-bosque-muted">Si el archivo vence antes, el enlace vence con él. 5 claves incorrectas bloquean el enlace para siempre.</p>
      <Alert>{error}</Alert>
      <button className="btn-primary" disabled={busy}>{busy ? 'Generando…' : 'Generar enlace'}</button>
    </form>
  );
}

function CreatedLink({ data, onClose }) {
  return (
    <div className="space-y-3 rounded-xl border border-success-border bg-success-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-success-text">Enlace para {data.recipient_label}</h4>
          <p className="text-xs text-bosque-soft">Vence {formatDate(data.expires_at)} · {data.max_downloads} descarga(s)</p>
        </div>
        <button className="btn-ghost py-1" onClick={onClose}>Listo</button>
      </div>
      <Alert kind="warn">
        <b>Canal 1:</b> envía el enlace (correo, Teams, Slack). <b>Canal 2:</b> envía la clave por otro medio (llamada, Signal).
        Nunca juntos. Esta es la única vez que se muestran: el servidor sólo guarda sus hashes.
      </Alert>
      <CopyField label="Canal 1 · Enlace" value={data.url} />
      <CopyField label="Canal 2 · Clave de acceso" value={data.password} />
    </div>
  );
}
