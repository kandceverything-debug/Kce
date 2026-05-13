import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { eventId, amount } = await request.json();
    const supabase = await createServerClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    if (amount < 1 || amount > 10) return NextResponse.json({ error: 'Amount must be 1-10' }, { status: 400 });

    const { data: log, error } = await supabase
      .from('booth_energy_log')
      .insert({
        event_id: eventId,
        user_id: session.user.id,
        amount,
      })
      .select('*')
      .single();

    if (error) throw error;

    const { data: totalEnergy } = await supabase
      .rpc('get_booth_energy', { p_event_id: eventId });

    return NextResponse.json({ log, totalEnergy });
  } catch (error) {
    console.error('Booth energy error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
