'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/compound');
      } else {
        router.push('/claim');
      }
    };

    checkSession();
  }, [router]);

  return <div className="flex h-screen items-center justify-center">Loading...</div>;
}
