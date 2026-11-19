'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from './SessionProvider';
import { Alert, Brand, Button, Field } from './ui';

/** Pantalla 01 Iniciar sesión (Figma 6:23), v2 con sesión simulada. */
export default function AuthForm({ mode }) {
  const router = useRouter();
  const { session, signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Con sesión abierta no tiene sentido volver a entrar.
  useEffect(() => {
    if (session) router.replace('/vaults');
  }, [session, router]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      router.replace('/vaults');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-niebla px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Brand />
          <p className="text-center text-sm leading-5 text-bosque-soft">
            Bóveda con cifrado en reposo y enlaces que se autodestruyen
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-niebla bg-white p-5">
          <h1 className="text-lg font-semibold leading-7 text-bosque">Iniciar sesión</h1>
          <Field
            label="Correo" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Contraseña" type="password" required maxLength={72} autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div role="alert">
              <Alert kind="error">{error}</Alert>
            </div>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Procesando…' : 'Entrar'}
          </Button>
          <p className="flex justify-center gap-1 text-sm leading-5">
            <span className="text-bosque-soft">¿No tienes cuenta?</span>
            <Link href="/register" className="font-medium text-bosque underline underline-offset-2">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
