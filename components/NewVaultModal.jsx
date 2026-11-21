'use client';

import { useState } from 'react';
import { createVault } from '@/lib/services/vaults';
import Modal from './Modal';
import { Alert, Button, Field, Select } from './ui';

const EXPIRATION_OPTIONS = [
  [7, '7 días'],
  [15, '15 días'],
  [30, '30 días'],
  [60, '60 días'],
  [90, '90 días'],
];

/**
 * Modal 03b "Nueva bóveda" (Figma 29:644).
 */
export default function NewVaultModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function handleClose() {
    if (busy) return;
    setError('');
    onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setBusy(true);
    try {
      const vault = await createVault({ name, expiresInDays });
      setName('');
      setExpiresInDays(30);
      onCreated?.(vault);
      onClose?.();
    } catch (err) {
      setError(err.message || 'El nombre es obligatorio');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nueva bóveda">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-sm leading-5 text-bosque-soft">
          Un espacio cerrado para compartir documentos con personas específicas.
        </p>

        <Field
          label="Nombre de la bóveda"
          placeholder="Ej. Auditoría Financiera"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select
          label="La bóveda expira en"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(Number(e.target.value))}
        >
          {EXPIRATION_OPTIONS.map(([days, label]) => (
            <option key={days} value={days}>
              {label}
            </option>
          ))}
        </Select>

        <Alert kind="ok">
          Se generará una llave maestra (KEK) exclusiva para esta bóveda. Al expirar, se destruye junto con todas las llaves de sus archivos.
        </Alert>

        {error && (
          <div role="alert">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Creando…' : 'Crear bóveda'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
