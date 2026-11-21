'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Card from '@/components/Card';
import FileRow from '@/components/FileRow';
import MemberRow from '@/components/MemberRow';
import Modal from '@/components/Modal';
import { useRequireSession, useSession } from '@/components/SessionProvider';
import { Alert, Button, CopyField, Field, Select, StatusBadge } from '@/components/ui';
import {
  addFile,
  cancelInvitation,
  createInvitation,
  destroyFile,
  destroyVault,
  getVault,
  listFiles,
  listMembers,
  lockVault,
  revokeMember,
} from '@/lib/services/vaults';

const VAULT_STATUS_BADGE = {
  ACTIVE: 'ACTIVE_F',
  LOCKED: 'LOCKED_F',
  EXPIRED: 'EXPIRED_F',
};

const INVITE_EXPIRATION_OPTIONS = [
  [24, '24 horas'],
  [48, '48 horas'],
  [72, '72 horas'],
  [168, '168 horas'],
];

export default function VaultDetailPage() {
  const { id } = useParams();
  const session = useRequireSession();
  const { signOut } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [vault, setVault] = useState(null);
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [locking, setLocking] = useState(false);
  const [destroyModalOpen, setDestroyModalOpen] = useState(false);
  const [destroying, setDestroying] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileToDestroy, setFileToDestroy] = useState(null);
  const [destroyingFile, setDestroyingFile] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteHours, setInviteHours] = useState(48);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [createdInvitation, setCreatedInvitation] = useState(null);

  const loadVaultData = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [v, f, m] = await Promise.all([getVault(id), listFiles(id), listMembers(id)]);
      setVault(v);
      setFiles(f);
      setMembers(m);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (session) loadVaultData();
  }, [session, loadVaultData]);

  if (!session) return null;

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  async function handleLockVault() {
    if (!vault || vault.status === 'LOCKED') return;
    setLocking(true);
    try {
      const updated = await lockVault(vault.id);
      setVault(updated);
    } finally {
      setLocking(false);
    }
  }

  async function handleDestroyVault() {
    if (!vault) return;
    setDestroying(true);
    try {
      await destroyVault(vault.id);
      setDestroyModalOpen(false);
      router.replace('/vaults');
    } finally {
      setDestroying(false);
    }
  }

  async function processFileUpload(file) {
    if (!file || !vault) return;
    setFileError('');
    const tempId = `temp-${Date.now()}`;
    const placeholder = {
      id: tempId,
      name: file.name,
      uploading: true,
    };
    setFiles((prev) => [placeholder, ...prev]);
    try {
      const created = await addFile(vault.id, file);
      setFiles((prev) => prev.map((f) => (f.id === tempId ? created : f)));
      setVault((prev) => (prev ? { ...prev, filesCount: prev.filesCount + 1 } : prev));
    } catch (err) {
      setFiles((prev) => prev.filter((f) => f.id !== tempId));
      setFileError(err.message || 'El archivo supera 25 MB');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) processFileUpload(dropped);
  }

  async function handleConfirmDestroyFile() {
    if (!fileToDestroy || !vault) return;
    setDestroyingFile(true);
    try {
      await destroyFile(vault.id, fileToDestroy.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDestroy.id));
      setVault((prev) =>
        prev ? { ...prev, filesCount: Math.max(0, prev.filesCount - 1) } : prev
      );
      setFileToDestroy(null);
    } finally {
      setDestroyingFile(false);
    }
  }

  async function handleRemoveMember(member) {
    if (!vault) return;
    if (member.status === 'PENDING') {
      await cancelInvitation(vault.id, member.id);
    } else {
      await revokeMember(vault.id, member.id);
    }
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    setVault((prev) =>
      prev ? { ...prev, membersCount: Math.max(0, prev.membersCount - 1) } : prev
    );
  }

  async function handleCreateInvitation(e) {
    e.preventDefault();
    if (!vault) return;
    setInviteError('');
    setInviting(true);
    try {
      const result = await createInvitation(vault.id, {
        email: inviteEmail,
        expiresInHours: inviteHours,
      });
      setMembers((prev) => [...prev, result.member]);
      setVault((prev) => (prev ? { ...prev, membersCount: prev.membersCount + 1 } : prev));
      setCreatedInvitation({
        email: result.member.email,
        url: result.url,
      });
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.message || 'Correo inválido');
    } finally {
      setInviting(false);
    }
  }

  const isLocked = vault?.status === 'LOCKED';
  const badgeKey = vault ? VAULT_STATUS_BADGE[vault.status] || vault.status : 'ACTIVE_F';
  const activeFilesCount = files.filter((f) => !f.uploading).length;
  const filesText = vault ? `${activeFilesCount} ${activeFilesCount === 1 ? 'archivo' : 'archivos'}` : '';
  const membersText = vault ? `${members.length} ${members.length === 1 ? 'miembro' : 'miembros'}` : '';

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="vaults" email={session.email} onLogout={handleLogout} />
      <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-5 px-6 pb-12 pt-8">
        {loading ? (
          <p className="text-sm text-bosque-soft">Cargando…</p>
        ) : notFound || !vault ? (
          <Card title="Bóveda no encontrada">
            <p className="text-sm text-bosque-soft">
              La bóveda solicitada no existe o fue destruida.
            </p>
            <div>
              <Link href="/vaults" className="text-sm font-medium text-bosque underline underline-offset-2">
                Volver a mis bóvedas
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm leading-5">
              <Link href="/vaults" className="font-medium text-bosque-soft hover:text-bosque">
                Mis bóvedas
              </Link>
              <span className="text-bosque-muted">/</span>
              <span className="font-medium text-bosque">{vault.name}</span>
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-semibold leading-8 text-bosque">{vault.name}</h1>
                  <StatusBadge status={badgeKey} />
                </div>
                <p className="text-sm leading-5 text-bosque-soft">
                  Expira {vault.expiresAt} · KEK {vault.kekVersion} · {filesText} · {vault.sizeLabel} · {membersText}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={isLocked || locking}
                  onClick={handleLockVault}
                >
                  {isLocked ? 'Bloqueada' : 'Bloquear bóveda'}
                </Button>
                <Button variant="danger" onClick={() => setDestroyModalOpen(true)}>
                  Destruir bóveda
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 lg:flex-row">
              <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
                <Card
                  title="Archivos"
                  subtitle="Se cifran en memoria y se guardan en Cloudflare R2 con nombre UUID."
                  action={
                    <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
                      Subir y cifrar
                    </Button>
                  }
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) processFileUpload(f);
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`flex w-full items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 text-center text-sm leading-5 text-bosque-soft transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia ${
                      dragging ? 'border-bosque bg-success-bg' : 'border-salvia hover:border-bosque'
                    }`}
                  >
                    Arrastra un archivo aquí o selecciónalo · PDF, Office, imágenes, .env · máx. 25 MB
                  </button>

                  {fileError && (
                    <div role="alert">
                      <Alert kind="error">{fileError}</Alert>
                    </div>
                  )}

                  {files.length === 0 ? (
                    <p className="py-2 text-sm text-bosque-soft">Esta bóveda aún no tiene archivos</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {files.map((file) => (
                        <FileRow
                          key={file.id}
                          file={file}
                          variant="owner"
                          onAction={(target) => setFileToDestroy(target)}
                        />
                      ))}
                    </div>
                  )}
                </Card>

                <section className="flex flex-col gap-1 rounded-2xl border border-niebla bg-white p-5">
                  <div className="flex flex-col gap-0.5 pb-3">
                    <h2 className="text-lg font-semibold leading-7 text-bosque">Miembros e invitaciones</h2>
                    <p className="text-xs leading-4 text-bosque-soft">
                      Sólo el correo invitado puede aceptar. 5 contraseñas incorrectas bloquean al miembro.
                    </p>
                  </div>

                  {members.length === 0 ? (
                    <p className="py-2 text-sm text-bosque-soft">Aún no has invitado a nadie</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-[660px]">
                        <div className="flex pb-2 pt-1 text-xs font-medium uppercase leading-4 tracking-[0.6px] text-bosque-muted">
                          <span className="w-[210px] shrink-0">Correo</span>
                          <span className="w-[140px] shrink-0">Estado</span>
                          <span className="w-[70px] shrink-0">Intentos</span>
                          <span className="w-[140px] shrink-0">Actividad</span>
                          <span className="flex-1" />
                        </div>
                        {members.map((member) => (
                          <MemberRow
                            key={member.id}
                            member={member}
                            onRemove={handleRemoveMember}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[400px]">
                <section className="flex flex-col gap-3.5 rounded-2xl border border-niebla bg-white p-5">
                  <h2 className="text-lg font-semibold leading-7 text-bosque">Invitar por correo</h2>
                  <p className="text-sm leading-5 text-bosque-soft">
                    La invitación queda amarrada a un correo. Aunque el enlace se reenvíe, nadie más podrá entrar.
                  </p>
                  <form onSubmit={handleCreateInvitation} noValidate className="flex flex-col gap-3.5">
                    <Field
                      label="Correo del destinatario"
                      type="email"
                      placeholder="correo@empresa.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Select
                      label="La invitación expira en"
                      value={inviteHours}
                      onChange={(e) => setInviteHours(Number(e.target.value))}
                    >
                      {INVITE_EXPIRATION_OPTIONS.map(([h, label]) => (
                        <option key={h} value={h}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    {inviteError && (
                      <div role="alert">
                        <Alert kind="error">{inviteError}</Alert>
                      </div>
                    )}
                    <Button type="submit" variant="primary" disabled={inviting} className="w-full">
                      {inviting ? 'Creando…' : 'Crear invitación'}
                    </Button>
                  </form>

                  {createdInvitation && (
                    <div className="flex flex-col gap-3 rounded-xl border border-salvia bg-success-bg p-4">
                      <h3 className="text-sm font-semibold leading-5 text-success-text">
                        Invitación para {createdInvitation.email}
                      </h3>
                      <p className="text-xs leading-4 text-bosque-soft">
                        Canal 1: comparte este enlace por WhatsApp, Teams o correo. Canal 2: SecDocs enviará la contraseña de la bóveda al correo del invitado sólo después de verificar su identidad.
                      </p>
                      <CopyField label="Enlace de invitación" value={createdInvitation.url} mono />
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-2.5 rounded-2xl border border-niebla bg-white p-5">
                  <h2 className="text-base font-semibold leading-6 text-bosque">Llaves de esta bóveda</h2>
                  <div className="flex items-center justify-between text-sm leading-5">
                    <span className="text-bosque-soft">KEK</span>
                    <span className="font-mono text-xs leading-4 text-bosque">
                      {vault.kekVersion} · creada {vault.kekCreatedAt || vault.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm leading-5">
                    <span className="text-bosque-soft">DEKs activas</span>
                    <span className="font-mono text-xs leading-4 text-bosque">
                      {activeFilesCount} (una por archivo)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm leading-5">
                    <span className="text-bosque-soft">Almacenamiento</span>
                    <span className="font-mono text-xs leading-4 text-bosque">
                      Cloudflare R2 · nombres UUID
                    </span>
                  </div>
                </section>
              </aside>
            </div>

            <Modal
              open={destroyModalOpen}
              onClose={() => !destroying && setDestroyModalOpen(false)}
              title={`¿Destruir «${vault.name}»?`}
            >
              <p className="text-sm leading-5 text-bosque-soft">
                Se borran la KEK y todas las llaves de sus archivos. No se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={destroying}
                  onClick={() => setDestroyModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  disabled={destroying}
                  onClick={handleDestroyVault}
                >
                  Destruir bóveda
                </Button>
              </div>
            </Modal>

            <Modal
              open={Boolean(fileToDestroy)}
              onClose={() => !destroyingFile && setFileToDestroy(null)}
              title={fileToDestroy ? `¿Destruir «${fileToDestroy.name}»?` : ''}
            >
              <p className="text-sm leading-5 text-bosque-soft">
                Se elimina su llave (DEK) y no se podrá recuperar.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={destroyingFile}
                  onClick={() => setFileToDestroy(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  disabled={destroyingFile}
                  onClick={handleConfirmDestroyFile}
                >
                  Destruir
                </Button>
              </div>
            </Modal>
          </>
        )}
      </main>
    </div>
  );
}
