'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
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
