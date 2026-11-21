'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';

export default function Home() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    router.replace(session ? '/vaults' : '/login');
  }, [session, router]);

  return null;
}
