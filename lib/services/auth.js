// Servicios de sesión. Hoy usan los datos de ejemplo de lib/mock; cuando exista la API real
// solo cambia el interior de estas funciones, no su firma.
import { DEMO_PASSWORD, registeredPasswords, users } from '@/lib/mock/users';

const INVALID = 'Correo o contraseña incorrectos';

// Simula la espera de la red (300–500 ms).
function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function findUser(email) {
  const wanted = String(email || '').trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === wanted);
}

/** Devuelve `{ id, email }` o lanza el mismo error si el correo no existe o la contraseña no coincide. */
export async function login(email, password) {
  await wait();
  const user = findUser(email);
  // Una cuenta creada en la maqueta acepta su propia contraseña; todas aceptan DEMO_PASSWORD.
  const ok = user && (password === DEMO_PASSWORD || password === registeredPasswords.get(user.id));
  if (!ok) throw new Error(INVALID);
  return { id: user.id, email: user.email };
}

/** Crea la cuenta en memoria y devuelve `{ id, email }`. */
export async function register(email, password) {
  await wait();
  const pass = String(password || '');
  if (pass.length < 12 || pass.length > 72) {
    throw new Error('La contraseña debe tener entre 12 y 72 caracteres');
  }
  if (findUser(email)) throw new Error('Ya existe una cuenta con ese correo');
  const user = { id: `u-${users.length + 1}`, email: String(email).trim() };
  users.push(user);
  registeredPasswords.set(user.id, pass);
  return { id: user.id, email: user.email };
}

export async function logout() {
  await wait();
}
