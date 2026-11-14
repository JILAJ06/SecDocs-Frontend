'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import { Alert, Brand } from './ui';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isLogin = mode === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post(isLogin ? '/auth/login' : '/auth/register', { email, password });
      router.replace('/dashboard');
    } catch (err) {
      setError(errorMessage(err, 'No se pudo completar la solicitud'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Brand />
          <p className="text-sm text-bosque-soft">Bóveda con cifrado en reposo y enlaces que se autodestruyen</p>
        </div>
        <form onSubmit={submit} className="card space-y-4">
          <h1 className="text-lg font-semibold">{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
          <div>
            <label className="label" htmlFor="email">Correo</label>
            <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input
              id="password" type="password" required className="input"
              minLength={isLogin ? undefined : 12} maxLength={72}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && <p className="mt-1 text-xs text-bosque-muted">Mínimo 12 caracteres. Se guarda con bcrypt (costo 12).</p>}
          </div>
          <Alert>{error}</Alert>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Procesando…' : isLogin ? 'Entrar' : 'Registrarme'}</button>
          <p className="text-center text-sm text-bosque-soft">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <Link className="font-medium text-bosque underline underline-offset-2 hover:text-bosque-hover" href={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
