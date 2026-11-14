'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Brand } from '@/components/ui';
import { api, errorData, timeLeft } from '@/lib/api';

/**
 * Vista pública del receptor. No requiere cuenta.
 * 1) Comprueba que el enlace exista (sin revelar nombre ni tamaño del archivo).
 * 2) Pide la clave recibida por el canal fuera de banda.
 * 3) Con la clave correcta, la API entrega un ticket de un solo uso (60 s) y el
 *    navegador descarga el archivo descifrado al vuelo.
 */
export default function ReceivePage() {
  const { token } = useParams();
  const [state, setState] = useState('loading'); // loading | ready | unavailable | done
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ kind: 'error', text: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/public/links/${encodeURIComponent(token)}`)
      .then((r) => { setInfo(r.data); setState('ready'); })
      .catch(() => setState('unavailable'));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ kind: 'error', text: '' });
    try {
      const r = await api.post(`/public/links/${encodeURIComponent(token)}/verify`, { password });
      setPassword('');
      setState('done');
      // Navegación directa: el navegador gestiona la descarga en streaming.
      window.location.assign(`/api/public/download/${encodeURIComponent(r.data.ticket)}`);
    } catch (err) {
      const d = errorData(err);
      if (d.status === 404) setState('unavailable');
      else if (d.status === 401) setMsg({ kind: 'error', text: `Clave incorrecta. Te quedan ${d.remainingAttempts} intento(s) antes de que el enlace se bloquee.` });
      else if (d.status === 429) setMsg({ kind: 'warn', text: d.message || 'Demasiados intentos. Espera un momento.' });
      else setMsg({ kind: 'error', text: d.message || 'No se pudo verificar la clave' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center"><Brand /></div>

        {state === 'loading' && <div className="card text-center text-bosque-soft">Verificando enlace…</div>}

        {state === 'unavailable' && (
          <div className="card space-y-2 text-center">
            <h1 className="text-lg font-semibold">Enlace no disponible</h1>
            <p className="text-sm text-bosque-soft">
              Este enlace no existe, ya se usó, expiró, fue revocado o se bloqueó por intentos fallidos.
              Pide al remitente uno nuevo.
            </p>
          </div>
        )}

        {state === 'ready' && (
          <form onSubmit={submit} className="card space-y-4">
            <div>
              <h1 className="text-lg font-semibold">Te compartieron un documento protegido</h1>
              <p className="mt-1 text-sm text-bosque-soft">
                Ingresa la clave de acceso que el remitente te envió <b>por otro medio</b> (llamada, Signal…).
                El enlace vence en {timeLeft(info.expiresAt)}.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="pw">Clave de acceso</label>
              <input
                id="pw" type="password" required autoFocus autoComplete="off" maxLength={72}
                className="input font-mono" value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Alert kind={msg.kind}>{msg.text}</Alert>
            <button className="btn-primary w-full" disabled={busy || !password}>{busy ? 'Verificando…' : 'Descifrar y descargar'}</button>
            <p className="text-center text-xs text-bosque-muted">El archivo se descifra en memoria y no queda copia en caché. El enlace puede ser de un solo uso.</p>
          </form>
        )}

        {state === 'done' && (
          <div className="card space-y-2 text-center">
            <h1 className="text-lg font-semibold text-success-text">Descarga iniciada</h1>
            <p className="text-sm text-bosque-soft">
              Revisa la carpeta de descargas de tu navegador. Si el enlace era de un solo uso, ya no podrá volver a abrirse.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
