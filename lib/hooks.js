'use client';

import { useCallback, useEffect, useState } from 'react';

/** Cuenta regresiva en vivo. start(segundos) la inicia; devuelve los segundos restantes. */
export function useCountdown() {
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return undefined;
    setNow(Date.now());
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= deadline) clearInterval(t);
    }, 250);
    return () => clearInterval(t);
  }, [deadline]);

  const start = useCallback((seconds) => setDeadline(Date.now() + Math.max(0, seconds) * 1000), []);
  const startAt = useCallback((timestamp) => setDeadline(timestamp), []);
  const stop = useCallback(() => setDeadline(0), []);
  const remaining = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
  return { remaining, start, startAt, stop, active: remaining > 0 };
}
