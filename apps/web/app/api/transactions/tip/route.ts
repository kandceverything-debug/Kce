import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { payeeId, amountCents, message, songTitle, songArtist } = await request.json();
    const supabase = await createServerClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const platformFeeCents = Math.ceil(amountCents * 0.03 + 30);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        kind: 'tip',
        payer_id: session.user.id,
        payee_id: payeeId,
        amount_cents: amountCents,
        platform_fee_cents: platformFeeCents,
        status: 'succeeded',
        message,
        song_title: songTitle,
        song_artist: songArtist,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Tip error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
