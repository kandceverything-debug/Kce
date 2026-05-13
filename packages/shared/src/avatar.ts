export interface AvatarTraits {
  base: string;
  palette: string[];
  aura: {
    color: string;
    intensity: number;
    pulse: number;
  };
  accessories: string[];
  glyphs: string[];
  particles: string;
  tier: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface EvolutionInputs {
  daysInGoodStanding: number;
  successfulVouches: number;
  totalTipsCents: number;
  boothParticipations: number;
  venueCheckins: number;
}

export function computeEvolutionScore(inputs: EvolutionInputs): number {
  return (
    inputs.daysInGoodStanding * 1 +
    inputs.successfulVouches * 50 +
    (inputs.totalTipsCents / 1000) * 2 +
    inputs.boothParticipations * 0.5 +
    inputs.venueCheckins * 10
  );
}

export const TIER_THRESHOLDS: [number, number, number, number, number, number] = [
  0, 50, 200, 500, 1000, 2000,
];

export function scoreToTier(score: number): 0 | 1 | 2 | 3 | 4 | 5 {
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= (TIER_THRESHOLDS[i] ?? 0)) {
      return i as 0 | 1 | 2 | 3 | 4 | 5;
    }
  }
  return 0;
}

const TIER_PALETTES: Record<number, string[]> = {
  0: ['#2a1a3e', '#1a0f2e'],
  1: ['#3d1f5c', '#241240'],
  2: ['#5c2d8a', '#3a1a60'],
  3: ['#7a00ff', '#5500cc'],
  4: ['#9933ff', '#6600ff'],
  5: ['#cc66ff', '#9900ff'],
};

const TIER_AURA_INTENSITY: Record<number, number> = {
  0: 0.1,
  1: 0.25,
  2: 0.45,
  3: 0.65,
  4: 0.85,
  5: 1.0,
};

export function evolveTraits(
  current: AvatarTraits,
  score: number,
  _inputs: EvolutionInputs,
): AvatarTraits {
  const tier = scoreToTier(score);
  return {
    ...current,
    tier,
    palette: TIER_PALETTES[tier] ?? current.palette,
    aura: {
      ...current.aura,
      intensity: TIER_AURA_INTENSITY[tier] ?? current.aura.intensity,
    },
  };
}
