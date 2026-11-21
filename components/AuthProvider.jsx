'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister, setUnauthorizedHandler } from '@/lib/api';

const AuthContext = createContext(null);

/**
 * Estado de sesión. La sesión real vive en la cookie HttpOnly `secdocs_session`;
 * aquí solo se guarda el usuario devuelto por GET /auth/me (en memoria de React).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // true tras un logout/kill-switch explícito: el login posterior no debe volver a la página previa.
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    let alive = true;
    getMe()
      .then((r) => alive && setUser(r.user))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // 401 en una ruta protegida: se limpia el usuario; <Shell> redirige al login conservando la ruta.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await apiLogin(email, password);
    setSessionEnded(false);
    setUser(r.user);
    return r.user;
  }, []);

  const register = useCallback(async (email, password) => {
    const r = await apiRegister(email, password);
    setSessionEnded(false);
    setUser(r.user);
    return r.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* si la sesión ya no existe, igualmente se limpia el estado local */
    }
    setSessionEnded(true);
    setUser(null);
  }, []);

  /** Para kill-switch o revocar la sesión actual: el servidor ya limpió la cookie. */
  const clearSession = useCallback(() => {
    setSessionEnded(true);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, sessionEnded, login, register, logout, clearSession }),
    [user, loading, sessionEnded, login, register, logout, clearSession],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
