// Datos de ejemplo para la maqueta v2. Nada de esto es real ni sale del navegador.
// Viven en memoria: recargar la página los regresa a su estado inicial.

// Contraseña FALSA, solo para la maqueta: la comparten todos los usuarios de ejemplo.
// No es un secreto ni se compara con nada real.
export const DEMO_PASSWORD = 'demo-maqueta-2026';

export const users = [
  { id: 'u-1', email: 'alex@upchiapas.edu.mx' }, // dueño de las bóvedas de ejemplo
  { id: 'u-2', email: 'auditor@empresa.com' }, // invitado (aparece en el Figma)
];

// Contraseñas de las cuentas creadas desde "Crear cuenta" durante la sesión de la página,
// por id de usuario. Así la cuenta nueva puede volver a entrar sin recargar.
// Los usuarios de arriba no tienen entrada aquí y usan DEMO_PASSWORD.
export const registeredPasswords = new Map();
