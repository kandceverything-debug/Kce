'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from '@compound/ui';
import { computeEvolutionScore, getTierConfig, type AvatarTraits } from '@compound/shared';
import { createClient } from '@/lib/supabase/client';

export default function AvatarEditor() {
  const [traits, setTraits] = useState<AvatarTraits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('traits, evolution_score')
        .eq('id', session.user.id)
        .single();

      if (profile?.traits) {
        setTraits(profile.traits);
      } else {
        setTraits({
          base: 'humanoid',
          palette: ['#2a1a3e', '#1a0f2e'],
          aura: { color: '#7a00ff', intensity: 0.1, pulse: 0.5 },
          accessories: [],
          glyphs: [],
          particles: 'none',
          tier: 0,
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const saveTraits = async () => {
    if (!traits) return;
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('profiles')
        .update({ traits })
        .eq('id', session.user.id);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-96 w-full bg-white/10 rounded animate-pulse" />;

  const tier = getTierConfig(traits?.tier ?? 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Avatar Editor</h1>

      <Card>
        <h2 className="mb-4 text-xl font-bold">Tier: {tier.name}</h2>
        <Badge>{tier.tier}</Badge>
        <p className="mt-2 text-sm text-white/60">Body Scale: {(tier.bodyScale * 100).toFixed(0)}%</p>
        <p className="text-sm text-white/60">Aura Layers: {tier.auraLayers}</p>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">Aura Color</h2>
        <input
          type="color"
          value={traits?.aura.color || '#7a00ff'}
          onChange={(e) =>
            setTraits(t => t ? { ...t, aura: { ...t.aura, color: e.target.value } } : null)
          }
          className="h-12 w-full cursor-pointer rounded"
        />
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">Aura Intensity</h2>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={traits?.aura.intensity || 0.1}
          onChange={(e) =>
            setTraits(t => t ? { ...t, aura: { ...t.aura, intensity: parseFloat(e.target.value) } } : null)
          }
          className="w-full"
        />
        <p className="mt-2 text-sm text-white/60">{((traits?.aura.intensity ?? 0.1) * 100).toFixed(0)}%</p>
      </Card>

      <Button onClick={saveTraits} disabled={isSaving} className="w-full">
        {isSaving ? 'Saving...' : 'Save Avatar'}
      </Button>
    </div>
  );
}
