'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '@/lib/services/auth';

const SessionContext = createContext(null);

/**
 * Sesión simulada de la v2. Vive solo en memoria (useState): recargar la página la pierde.
 * No usa localStorage, sessionStorage ni cookies. Los errores de los servicios se propagan.
 */
export default function SessionProvider({ children }) {
  const [session, setSession] = useState(null);

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

  const value = useMemo(() => ({ session, signIn, signUp, signOut }), [session, signIn, signUp, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}

/**
 * Guardia de sesión para páginas protegidas.
 * Devuelve la sesión activa o redirige a `/login` si no hay sesión en memoria.
 */
export function useRequireSession() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.replace('/login');
  }, [session, router]);

  return session;
}
