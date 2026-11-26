// Servicios de sesión conectados al backend real (/api/v1/auth/*),
// con respaldo automático a los datos de ejemplo en memoria si el backend no está levantado.
import * as api from '@/lib/api';
import { DEMO_PASSWORD, registeredPasswords, users } from '@/lib/mock/users';

const INVALID = 'Correo o contraseña incorrectos';

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function findUser(email) {
  const wanted = String(email || '').trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === wanted);
}

function isBackendUnavailable(err) {
  return !err || err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
}

/** Registra el callback para limpiar la sesión en memoria cuando una ruta protegida responde 401. */
export function onSessionUnauthorized(fn) {
  api.setUnauthorizedHandler(fn);
}

/** Verifica si existe una sesión activa en la cookie HttpOnly del backend. */
export async function checkSession() {
  try {
    const res = await api.getMe();
    if (res?.user) {
      return { id: res.user.id, email: res.user.email };
    }
    return null;
  } catch {
    return null;
  }
}

/** Devuelve `{ id, email }` o lanza el mismo error si el correo no existe o la contraseña no coincide. */
export async function login(email, password) {
  try {
    const res = await api.login(email, password);
    if (res?.user) {
      return { id: res.user.id, email: res.user.email };
    }
    throw new Error(INVALID);
  } catch (err) {
    if (isBackendUnavailable(err)) {
      await wait();
      const user = findUser(email);
      const ok = user && (password === DEMO_PASSWORD || password === registeredPasswords.get(user.id));
      if (!ok) throw new Error(INVALID);
      return { id: user.id, email: user.email };
    }
    if (err.status === 401) throw new Error(INVALID);
    throw new Error(err.message || INVALID);
  }
}

/** Crea la cuenta en el backend (o en memoria si el backend no está levantado) y devuelve `{ id, email }`. */
export async function register(email, password) {
  const pass = String(password || '');
  if (pass.length < 12 || pass.length > 72) {
    throw new Error('La contraseña debe tener entre 12 y 72 caracteres');
  }
  try {
    const res = await api.register(email, pass);
    if (res?.user) {
      return { id: res.user.id, email: res.user.email };
    }
  } catch (err) {
    if (isBackendUnavailable(err)) {
      await wait();
      if (findUser(email)) throw new Error('Ya existe una cuenta con ese correo');
      const user = { id: `u-${users.length + 1}`, email: String(email).trim() };
      users.push(user);
      registeredPasswords.set(user.id, pass);
      return { id: user.id, email: user.email };
    }
    if (err.status === 409) throw new Error('Ya existe una cuenta con ese correo');
    throw new Error(err.message || 'No se pudo crear la cuenta');
  }
  throw new Error('No se pudo crear la cuenta');
}

export async function logout() {
  try {
    await api.logout();
  } catch {
    await wait();
  }
}
