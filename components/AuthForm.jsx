'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { safeRedirect } from '@/lib/format';
import { useAuth } from './AuthProvider';
import { Alert, Brand } from './ui';

const MIN_PASSWORD = 8;
const MAX_PASSWORD_BYTES = 72;

function authErrorMessage(err, isLogin) {
  switch (err.status) {
    case 401:
      return 'Credenciales inválidas';
    case 409:
      return 'El correo ya está registrado';
    case 429: {
      const s = err.data?.retryAfterSeconds;
      return `Demasiados intentos de autenticación, intenta más tarde${s ? ` (espera ${s} s)` : ''}.`;
    }
    case 400:
      return err.message;
    default:
      return err.message || (isLogin ? 'No se pudo iniciar sesión' : 'No se pudo crear la cuenta');
  }
}

/**
 * Formulario de login/registro.
 * - Página completa (/login, /register): redirige a ?redirect= (o /vaults) al autenticarse.
 * - embedded: se usa dentro de /invitacion/[token]; al autenticarse no navega, la página reacciona al contexto.
 */
export default function AuthForm({ mode: initialMode = 'login', embedded = false }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const isLogin = mode === 'login';
  const redirect = safeRedirect(params.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!embedded && !loading && user) router.replace(redirect);
  }, [embedded, loading, user, redirect, router]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!isLogin) {
      if (password.length < MIN_PASSWORD) return setError('La contraseña debe tener al menos 8 caracteres');
      if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) return setError('La contraseña no puede exceder 72 bytes');
    }
    setBusy(true);
    try {
      await (isLogin ? login(email.trim(), password) : register(email.trim(), password));
      if (!embedded) router.replace(redirect);
    } catch (err) {
      setError(authErrorMessage(err, isLogin));
      setBusy(false);
    }
  }

  const switchLabel = isLogin ? 'Regístrate' : 'Inicia sesión';
  const switchClass = 'font-medium text-bosque underline underline-offset-2 hover:text-bosque-hover';
  const qsRedirect = params.get('redirect') ? `?redirect=${encodeURIComponent(redirect)}` : '';

  const form = (
    <form onSubmit={submit} className="card space-y-4">
      <h1 className="text-lg font-semibold">{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
      <div>
        <label className="label" htmlFor="email">Correo</label>
        <input id="email" type="email" required maxLength={255} autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="password">Contraseña</label>
        <input
          id="password" type="password" required className="input"
          minLength={isLogin ? undefined : MIN_PASSWORD}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {!isLogin && <p className="mt-1 text-xs text-bosque-muted">Mínimo 8 caracteres (máximo 72 bytes).</p>}
      </div>
      <Alert>{error}</Alert>
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Procesando…' : isLogin ? 'Entrar' : 'Registrarme'}</button>
      <p className="text-center text-sm text-bosque-soft">
        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
        {embedded ? (
          <button type="button" className={switchClass} onClick={() => { setError(''); setMode(isLogin ? 'register' : 'login'); }}>
            {switchLabel}
          </button>
        ) : (
          <Link className={switchClass} href={`${isLogin ? '/register' : '/login'}${qsRedirect}`}>{switchLabel}</Link>
        )}
      </p>
    </form>
  );

  if (embedded) return form;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Brand />
          <p className="text-sm text-bosque-soft">Bóveda con cifrado en reposo y enlaces que se autodestruyen</p>
        </div>
        {form}
      </div>
    </main>
  );
}
