'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { useSession } from '@/components/SessionProvider';
import { Alert, Brand, Button, Field } from '@/components/ui';
import {
  acceptInvitation,
  getInvitation,
  sendVaultPassword,
} from '@/lib/services/invitations';

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

  const [cooldown, setCooldown] = useState(0);
  const processedSessionKey = useRef('');

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

  const emailMatches =
    Boolean(session && invitation) &&
    session.email.trim().toLowerCase() === invitation.inviteEmail.trim().toLowerCase();

  useEffect(() => {
    if (!session || !invitation) return;
    const key = `${token}:${session.email.toLowerCase()}`;
    if (processedSessionKey.current === key) return;
    processedSessionKey.current = key;
    acceptInvitation(token, session.email).catch(() => {});
  }, [session, invitation, token]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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

  async function handleResend() {
    if (cooldown > 0) return;
    setCooldown(60);
    try {
      await sendVaultPassword(token);
    } catch {
      /* el contador sigue su curso */
    }
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

  // Vista 06 · Identidad verificada (el correo de la sesión coincide con la invitación)
  if (emailMatches) {
    return (
      <div className="min-h-screen bg-niebla">
        <AppHeader active="shared" email={session.email} onLogout={handleLogout} />
        <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-8">
          <div className="flex w-[480px] max-w-full flex-col items-center gap-4 rounded-2xl border border-niebla bg-white p-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success-bg text-bosque">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m5 13 4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-lg font-semibold leading-7 text-bosque">
              Identidad verificada
            </h1>

            <p className="text-sm leading-5 text-bosque-soft">
              Enviamos la contraseña de «{invitation.vaultName}» a {session.email}. Llega por un canal distinto al enlace que recibiste.
            </p>

            <div className="flex w-full flex-col gap-2.5 rounded-xl bg-niebla p-4 text-left text-sm leading-5 text-bosque">
              <div className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bosque text-xs font-semibold text-white">
                  ✓
                </span>
                <span>Enlace de invitación recibido (canal 1)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bosque text-xs font-semibold text-white">
                  ✓
                </span>
                <span>Sesión iniciada como {session.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bosque text-xs font-semibold text-white">
                  ✓
                </span>
                <span>El correo coincide con la invitación</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-salvia text-xs font-semibold text-bosque">
                  →
                </span>
                <span className="font-semibold">Contraseña enviada por correo (canal 2)</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push(`/shared/${invitation.vaultId}`)}
            >
              Ingresar contraseña de la bóveda
            </Button>

            <p className="text-xs leading-4 text-bosque-muted">
              ¿No llegó? Revisa spam o{' '}
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleResend}
                className="font-medium underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia disabled:cursor-not-allowed disabled:no-underline"
              >
                {cooldown > 0 ? `reenvía en ${cooldown} s` : 'reenvía en 60 s'}
              </button>
              .
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-niebla">
      <AppHeader active="shared" email={session.email} onLogout={handleLogout} />
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-8">
        <div className="w-[480px] max-w-full rounded-2xl border border-niebla bg-white p-6 text-center">
          <p className="text-sm text-bosque-soft">Acceso no permitido.</p>
        </div>
      </main>
    </div>
  );
}
