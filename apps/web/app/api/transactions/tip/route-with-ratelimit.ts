import { createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Rate limit: 10 tips per minute per user
    const key = `tip:${session.user.id}`;
    if (!rateLimit(key, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { payeeId, amountCents, message, songTitle, songArtist } = await request.json();

    // Validate amount
    if (amountCents < 100 || amountCents > 100000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

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
