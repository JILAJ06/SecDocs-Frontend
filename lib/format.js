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

/** mm:ss para cuentas regresivas. */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** YYYY-MM-DD en hora local (valor de <input type="date">). */
export function toDateInputValue(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** Fin del día local elegido, en ISO 8601. */
export function endOfDayISO(dateValue) {
  const [y, m, d] = dateValue.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59).toISOString();
}

/** Solo permite redirecciones internas (evita open-redirect). */
export function safeRedirect(target, fallback = '/vaults') {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return fallback;
  return target;
}
