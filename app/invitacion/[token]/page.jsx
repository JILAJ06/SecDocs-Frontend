'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { useSession } from '@/components/SessionProvider';
import { Alert, Brand, Button, Field } from '@/components/ui';
import { getInvitation } from '@/lib/services/invitations';

export default function InvitationPage() {
  const { token } = useParams();
  const router = useRouter();
  const { session, signIn, signOut } = useSession();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invalidError, setInvalidError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setInvalidError('');
    getInvitation(token)
      .then((inv) => {
        if (active) setInvitation(inv);
      })
      .catch((err) => {
        if (active) setInvalidError(err.message || 'Invitación no válida o expirada');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setLoginError(err.message || 'Correo o contraseña incorrectos');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-niebla px-4 py-8">
        <p className="text-sm text-bosque-soft">Cargando…</p>
      </main>
    );
  }

  if (invalidError || !invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-niebla px-4 py-8">
        <div className="flex w-[420px] max-w-full flex-col items-center gap-5">
          <Brand />
          <div className="flex w-full flex-col gap-4 rounded-2xl border border-niebla bg-white p-6 text-center">
            <div role="alert">
              <Alert kind="error">{invalidError || 'Invitación no válida o expirada'}</Alert>
            </div>
            <Link href="/login" className="text-sm font-medium text-bosque underline underline-offset-2">
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Vista 05 · Sin sesión: iniciar sesión para aceptar la invitación
  if (!session) {
    const registerHref = `/register?next=${encodeURIComponent(`/invitacion/${token}`)}`;
    return (
      <main className="flex min-h-screen items-center justify-center bg-niebla px-4 py-8">
        <div className="flex w-[420px] max-w-full flex-col gap-5">
          <div className="flex justify-center">
            <Brand />
          </div>

          <div className="flex items-start gap-3.5 rounded-xl border border-salvia bg-success-bg p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success-bg text-bosque">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold leading-5 text-bosque">
                {invitation.ownerName} te invitó a la bóveda «{invitation.vaultName}»
              </p>
              <p className="text-xs leading-4 text-bosque-soft">
                Esta invitación es para {invitation.maskedEmail}. Inicia sesión con ese correo para continuar.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4 rounded-2xl border border-niebla bg-white p-6"
          >
            <h1 className="text-lg font-semibold leading-7 text-bosque">
              Iniciar sesión para aceptar
            </h1>
            <Field
              label="Correo"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Contraseña"
              type="password"
              required
              maxLength={72}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <div role="alert">
                <Alert kind="error">{loginError}</Alert>
              </div>
            )}
            <Button type="submit" variant="primary" disabled={busy} className="w-full">
              {busy ? 'Entrando…' : 'Entrar y verificar identidad'}
            </Button>
            <p className="flex justify-center gap-1 text-sm leading-5">
              <span className="text-bosque-soft">¿No tienes cuenta?</span>
              <Link href={registerHref} className="font-medium text-bosque underline underline-offset-2">
                Regístrate con ese correo
              </Link>
            </p>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="shared" email={session.email} onLogout={handleLogout} />
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-8">
        <div className="w-[480px] max-w-full rounded-2xl border border-niebla bg-white p-6 text-center">
          <p className="text-sm text-bosque-soft">Verificando identidad…</p>
        </div>
      </main>
    </div>
  );
}
