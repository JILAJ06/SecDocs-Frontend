'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from './SessionProvider';
import { Alert, Brand, Button, Field } from './ui';

const TEXTS = {
  login: {
    title: 'Iniciar sesión',
    submit: 'Entrar',
    question: '¿No tienes cuenta?',
    link: ['/register', 'Regístrate'],
  },
  register: {
    title: 'Crear cuenta',
    submit: 'Registrarme',
    question: '¿Ya tienes cuenta?',
    link: ['/login', 'Inicia sesión'],
  },
};

function getSafeNextPath(rawNext) {
  if (!rawNext || typeof rawNext !== 'string') return '/vaults';
  if (rawNext.startsWith('/') && !rawNext.startsWith('//')) return rawNext;
  return '/vaults';
}

function AuthFormInner({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams?.get('next'));
  const rawNext = searchParams?.get('next');
  const { session, signIn, signUp } = useSession();
  const isLogin = mode !== 'register';
  const t = TEXTS[isLogin ? 'login' : 'register'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Con sesión abierta redirige al destino interno (?next= o /vaults).
  useEffect(() => {
    if (session) router.replace(nextPath);
  }, [session, router, nextPath]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (isLogin ? signIn : signUp)(email, password);
      router.replace(nextPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const switchHref =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? `${t.link[0]}?next=${encodeURIComponent(rawNext)}`
      : t.link[0];

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
          <h1 className="text-lg font-semibold leading-7 text-bosque">{t.title}</h1>
          <Field
            label="Correo" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Contraseña" type="password" required maxLength={72}
            minLength={isLogin ? undefined : 12}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && (
            <p className="text-xs leading-4 text-bosque-muted">Mínimo 12 caracteres. Se guarda con bcrypt (costo 12).</p>
          )}
          {error && (
            <div role="alert">
              <Alert kind="error">{error}</Alert>
            </div>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Procesando…' : t.submit}
          </Button>
          <p className="flex justify-center gap-1 text-sm leading-5">
            <span className="text-bosque-soft">{t.question}</span>
            <Link href={switchHref} className="font-medium text-bosque underline underline-offset-2">
              {t.link[1]}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

/** Pantallas 01 Iniciar sesión (Figma 6:23) y 02 Crear cuenta (6:52), v2 con sesión simulada. */
export default function AuthForm({ mode }) {
  return (
    <Suspense fallback={null}>
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}
