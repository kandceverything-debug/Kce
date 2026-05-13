import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const supabase = await createServerClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: vouchCode, error: vouchErr } = await supabase
      .from('vouch_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (vouchErr || !vouchCode) return NextResponse.json({ error: 'Invalid vouch code' }, { status: 400 });
    if (vouchCode.redeemed_at) return NextResponse.json({ error: 'Code already redeemed' }, { status: 400 });
    if (new Date(vouchCode.expires_at) < new Date()) return NextResponse.json({ error: 'Code expired' }, { status: 400 });

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (existingProfile) return NextResponse.json({ error: 'Profile already exists' }, { status: 400 });

    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        handle: session.user.email?.split('@')[0] || 'member',
        display_name: session.user.email || 'New Member',
        status: 'active',
      })
      .select('*')
      .single();

    await supabase
      .from('vouch_codes')
      .update({ redeemed_by: session.user.id, redeemed_at: new Date().toISOString() })
      .eq('code', code);

    return NextResponse.json({ userId: session.user.id, profile: newProfile });
  } catch (error) {
    console.error('Redeem vouch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
