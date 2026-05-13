'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card } from '@compound/ui';
import { createClient } from '@/lib/supabase/client';

interface Event {
  id: string;
  title: string;
  subtitle: string | null;
  kind: string;
  is_live: boolean;
  starts_at: string;
  stream_url: string | null;
  mux_playback_id: string | null;
  dj_id: string | null;
}

interface Transaction {
  id: string;
  kind: string;
  amount_cents: number;
  message: string | null;
  song_title: string | null;
  song_artist: string | null;
  play_next: boolean;
  created_at: string;
  payer_id: string;
}

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [energy, setEnergy] = useState(0);
  const [queue, setQueue] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [energyAmount, setEnergyAmount] = useState(5);
  const [isSendingEnergy, setIsSendingEnergy] = useState(false);
  const supabase = createClient();

  const fetchEvent = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setEvent(data as Event);
    setIsLoading(false);
  }, [id]);

  const fetchEnergy = useCallback(async () => {
    const { data } = await supabase.rpc('get_booth_energy', { p_event_id: id });
    if (typeof data === 'number') setEnergy(data);
  }, [id]);

  const fetchQueue = useCallback(async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('event_id', id)
      .eq('kind', 'song_request')
      .eq('status', 'succeeded')
      .is('played_at', null)
      .order('play_next', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);
    if (data) setQueue(data as Transaction[]);
  }, [id]);

  useEffect(() => {
    fetchEvent();
    fetchEnergy();
    fetchQueue();

    const channel = supabase
      .channel(`event-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booth_energy_log', filter: `event_id=eq.${id}` }, fetchEnergy)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `event_id=eq.${id}` }, fetchQueue)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const sendEnergy = async () => {
    setIsSendingEnergy(true);
    try {
      await fetch('/api/booth-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, amount: energyAmount }),
      });
      await fetchEnergy();
    } finally {
      setIsSendingEnergy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        Event not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <a href="/compound" className="text-white/40 hover:text-white text-sm">← Back</a>
        {event.is_live && (
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            LIVE
          </span>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold text-brand-glow">{event.title}</h1>
        {event.subtitle && <p className="mt-1 text-white/60">{event.subtitle}</p>}
      </div>

      {/* Booth Energy */}
      <Card>
        <h2 className="mb-4 font-bold text-white/80">Booth Energy</h2>
        <div className="mb-4 text-center">
          <span className="text-6xl font-bold text-brand-glow">{energy}</span>
          <p className="mt-1 text-sm text-white/40">total energy sent</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={energyAmount}
            onChange={(e) => setEnergyAmount(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-8 text-center font-bold text-brand-glow">{energyAmount}</span>
          <Button onClick={sendEnergy} disabled={isSendingEnergy} className="shrink-0">
            {isSendingEnergy ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </Card>

      {/* Song Queue */}
      {queue.length > 0 && (
        <Card>
          <h2 className="mb-4 font-bold text-white/80">Song Queue</h2>
          <div className="space-y-3">
            {queue.map((req, i) => (
              <div key={req.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm text-white/30">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {req.song_title ?? 'Unknown'} — {req.song_artist ?? 'Unknown'}
                  </p>
                  {req.message && (
                    <p className="text-xs text-white/40">{req.message}</p>
                  )}
                </div>
                {req.play_next && (
                  <span className="rounded bg-brand-primary/30 px-2 py-0.5 text-xs text-brand-glow">
                    UP NEXT
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
