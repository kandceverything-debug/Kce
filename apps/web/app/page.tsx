import { redirect } from 'next/navigation';
import { createServerClient as createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/compound');
  }

  redirect('/claim');
}
