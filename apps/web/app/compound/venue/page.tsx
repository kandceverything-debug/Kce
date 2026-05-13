'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { AvatarTraits } from '@compound/shared';

const Canvas = dynamicImport(
  () => import('@react-three/fiber').then((m) => m.Canvas),
  { ssr: false }
);
const VenueScene = dynamicImport(
  () => import('@compound/three-kit').then((m) => m.VenueScene),
  { ssr: false }
);
const Avatar = dynamicImport(
  () => import('@compound/three-kit').then((m) => m.Avatar),
  { ssr: false }
);

interface Member {
  id: string;
  handle: string;
  display_name: string;
  traits: AvatarTraits;
  is_present_irl: boolean;
}

const defaultTraits: AvatarTraits = {
  base: 'humanoid',
  palette: ['#2a1a3e', '#1a0f2e'],
  aura: { color: '#7a00ff', intensity: 0.1, pulse: 0.5 },
  accessories: [],
  glyphs: [],
  particles: 'none',
  tier: 0,
};

export default function VenuePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, handle, display_name, traits, is_present_irl')
        .eq('status', 'active')
        .limit(50);
      if (data) setMembers(data as Member[]);
      setIsLoading(false);
    };

    fetchMembers();

    const channel = supabase
      .channel('venue-presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => { fetchMembers(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const avatarPositions: [number, number, number][] = members.map((_, i) => [
    (i % 7) * 1.8 - 6,
    0,
    Math.floor(i / 7) * 2 - 4,
  ]);

  return (
    <div className="fixed inset-0 bg-[#04020a]">
      {/* Member count HUD */}
      <div className="absolute top-4 left-4 z-10 rounded-lg bg-black/60 px-4 py-2 text-sm text-white/80 backdrop-blur">
        <span className="text-brand-glow font-bold">{members.length}</span> members in the venue
      </div>

      {/* Member list sidebar */}
      <div className="absolute top-4 right-4 z-10 max-h-64 w-48 overflow-y-auto rounded-lg bg-black/60 p-3 backdrop-blur">
        <p className="mb-2 text-xs font-bold uppercase text-white/40">Present</p>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse rounded bg-white/10" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-white/40">No one here yet</p>
        ) : (
          members.map((m) => (
            <p key={m.id} className="truncate text-xs text-white/70">{m.handle}</p>
          ))
        )}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <a
          href="/compound"
          className="rounded-full bg-black/60 px-6 py-2 text-sm text-white/60 backdrop-blur hover:text-white"
        >
          ← Exit Venue
        </a>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 1.6, 8], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <VenueScene />
          {members.map((member, i) => (
            <Avatar
              key={member.id}
              traits={member.traits && typeof member.traits === 'object' && 'tier' in member.traits
                ? (member.traits as AvatarTraits)
                : defaultTraits}
              position={avatarPositions[i] ?? [0, 0, 0]}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
