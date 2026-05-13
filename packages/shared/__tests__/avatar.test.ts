import { describe, it, expect } from 'vitest';
import { computeEvolutionScore, scoreToTier, TIER_THRESHOLDS } from '../src/avatar';

describe('Avatar Evolution', () => {
  it('computes evolution score correctly', () => {
    const inputs = {
      daysInGoodStanding: 30,
      successfulVouches: 2,
      totalTipsCents: 5000,
      boothParticipations: 10,
      venueCheckins: 5,
    };

    const score = computeEvolutionScore(inputs);
    expect(score).toBeGreaterThan(0);
    expect(score).toBe(30 * 1 + 2 * 50 + (5000 / 1000) * 2 + 10 * 0.5 + 5 * 10);
  });

  it('converts scores to tiers correctly', () => {
    expect(scoreToTier(0)).toBe(0); // Wraith
    expect(scoreToTier(50)).toBe(1); // Initiate
    expect(scoreToTier(200)).toBe(2); // Bound
    expect(scoreToTier(500)).toBe(3); // Marked
    expect(scoreToTier(1000)).toBe(4); // Crowned
    expect(scoreToTier(2000)).toBe(5); // Sovereign
  });

  it('handles threshold boundaries', () => {
    TIER_THRESHOLDS.forEach((threshold, tier) => {
      expect(scoreToTier(threshold)).toBe(tier);
      if (tier < 5) {
        expect(scoreToTier(threshold - 1)).toBe(tier > 0 ? tier - 1 : 0);
      }
    });
  });
});
