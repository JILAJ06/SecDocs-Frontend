'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '@/lib/services/auth';

const SessionContext = createContext(null);

/**
 * Proveedor de sesión v2.
 * Verifica al montar si existe una sesión activa en la cookie HttpOnly del backend (`/api/v1/auth/me`)
 * y mantiene el usuario solo en memoria de React (`useState`). Si el backend no está levantado,
 * permite iniciar sesión con los usuarios de ejemplo en memoria.
 */
export default function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    auth
      .checkSession()
      .then((user) => {
        if (active && user) setSession(user);
      })
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    auth.onSessionUnauthorized(() => setSession(null));
    return () => auth.onSessionUnauthorized(null);
  }, []);

  const signIn = useCallback(async (email, password) => {
    const user = await auth.login(email, password);
    setSession(user);
    return user;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const user = await auth.register(email, password);
    setSession(user);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await auth.logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, initializing, signIn, signUp, signOut }),
    [session, initializing, signIn, signUp, signOut]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}

/**
 * Guardia de sesión para páginas protegidas.
 * Devuelve la sesión activa o redirige a `/login` una vez verificada la sesión inicial.
 */
export function useRequireSession() {
  const { session, initializing } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !session) router.replace('/login');
  }, [initializing, session, router]);

  return session;
}
