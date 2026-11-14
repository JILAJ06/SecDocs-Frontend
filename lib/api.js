import axios from 'axios';

// Cliente HTTP. Mismo origen (/api) → la cookie HttpOnly viaja sola.
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'X-SecDocs-CSRF': '1' }, // cabecera anti-CSRF exigida por la API
  timeout: 120_000,
});

export function errorMessage(err, fallback = 'Ocurrió un error') {
  return err?.response?.data?.error?.message || fallback;
}

export function errorData(err) {
  return { status: err?.response?.status, ...(err?.response?.data?.error || {}) };
}

export function formatBytes(n) {
  if (n == null) return '';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = Number(n);
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i ? 1 : 0)} ${u[i]}`;
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

export function timeLeft(d) {
  const ms = new Date(d) - Date.now();
  if (ms <= 0) return 'vencido';
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h ${m % 60} min`;
  return `${Math.floor(h / 24)} días`;
}

/** Clave fuerte para el canal fuera de banda (sin caracteres ambiguos). */
export function generatePassword(length = 16) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const out = [];
  // Muestreo por rechazo para evitar sesgo de módulo.
  const limit = 256 - (256 % alphabet.length);
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const b of bytes) {
      if (b < limit && out.length < length) out.push(alphabet[b % alphabet.length]);
    }
  }
  return out.join('').replace(/(.{4})(?=.)/g, '$1-');
}
