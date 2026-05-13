export type TierName =
  | 'Wraith'
  | 'Initiate'
  | 'Bound'
  | 'Marked'
  | 'Crowned'
  | 'Sovereign';

export interface TierVisualConfig {
  name: TierName;
  tier: 0 | 1 | 2 | 3 | 4 | 5;
  bodyScale: number;
  bodyRadius: number;
  bodyHeight: number;
  posture: {
    lean: number;
    headTilt: number;
  };
  auraLayers: 1 | 2 | 3 | 4 | 5;
  auraOpacityBase: number;
  hasGlyphRings: 'none' | 'inner' | 'inner+outer';
  hasHalo: boolean;
  hasWings: 'none' | 'rapture-only' | 'always-faint';
  hasLightPillar: boolean;
  particleSystems: string[];
  localLightIntensity: number;
  beatScalePulse: number;
  movementFluidity: number;
  accessoryAvailability: string[];
}

export const TIER_VISUAL_CONFIGS: TierVisualConfig[] = [
  {
    name: 'Wraith',
    tier: 0,
    bodyScale: 0.85,
    bodyRadius: 0.18,
    bodyHeight: 1.6,
    posture: { lean: 0, headTilt: 0 },
    auraLayers: 1,
    auraOpacityBase: 0.08,
    hasGlyphRings: 'none',
    hasHalo: false,
    hasWings: 'none',
    hasLightPillar: false,
    particleSystems: [],
    localLightIntensity: 0,
    beatScalePulse: 0,
    movementFluidity: 0.3,
    accessoryAvailability: [],
  },
  {
    name: 'Initiate',
    tier: 1,
    bodyScale: 0.92,
    bodyRadius: 0.19,
    bodyHeight: 1.65,
    posture: { lean: 0.02, headTilt: 0 },
    auraLayers: 1,
    auraOpacityBase: 0.15,
    hasGlyphRings: 'none',
    hasHalo: false,
    hasWings: 'none',
    hasLightPillar: false,
    particleSystems: ['embers'],
    localLightIntensity: 0,
    beatScalePulse: 0.02,
    movementFluidity: 0.45,
    accessoryAvailability: ['basic'],
  },
  {
    name: 'Bound',
    tier: 2,
    bodyScale: 1.0,
    bodyRadius: 0.2,
    bodyHeight: 1.7,
    posture: { lean: 0.03, headTilt: 0.02 },
    auraLayers: 2,
    auraOpacityBase: 0.25,
    hasGlyphRings: 'none',
    hasHalo: false,
    hasWings: 'none',
    hasLightPillar: false,
    particleSystems: ['embers'],
    localLightIntensity: 0.3,
    beatScalePulse: 0.04,
    movementFluidity: 0.6,
    accessoryAvailability: ['basic', 'mid'],
  },
  {
    name: 'Marked',
    tier: 3,
    bodyScale: 1.05,
    bodyRadius: 0.21,
    bodyHeight: 1.75,
    posture: { lean: 0.05, headTilt: 0.03 },
    auraLayers: 3,
    auraOpacityBase: 0.38,
    hasGlyphRings: 'inner',
    hasHalo: false,
    hasWings: 'none',
    hasLightPillar: false,
    particleSystems: ['embers', 'tendrils'],
    localLightIntensity: 0.6,
    beatScalePulse: 0.06,
    movementFluidity: 0.75,
    accessoryAvailability: ['basic', 'mid', 'rare'],
  },
  {
    name: 'Crowned',
    tier: 4,
    bodyScale: 1.1,
    bodyRadius: 0.22,
    bodyHeight: 1.8,
    posture: { lean: 0.06, headTilt: 0.04 },
    auraLayers: 4,
    auraOpacityBase: 0.55,
    hasGlyphRings: 'inner+outer',
    hasHalo: false,
    hasWings: 'always-faint',
    hasLightPillar: false,
    particleSystems: ['embers', 'tendrils', 'sigil-sparks'],
    localLightIntensity: 0.9,
    beatScalePulse: 0.08,
    movementFluidity: 0.88,
    accessoryAvailability: ['basic', 'mid', 'rare', 'crowned'],
  },
  {
    name: 'Sovereign',
    tier: 5,
    bodyScale: 1.15,
    bodyRadius: 0.23,
    bodyHeight: 1.85,
    posture: { lean: 0.07, headTilt: 0.05 },
    auraLayers: 5,
    auraOpacityBase: 0.75,
    hasGlyphRings: 'inner+outer',
    hasHalo: true,
    hasWings: 'rapture-only',
    hasLightPillar: true,
    particleSystems: ['embers', 'tendrils', 'sigil-sparks', 'crown-motes', 'pillar-drift'],
    localLightIntensity: 1.2,
    beatScalePulse: 0.1,
    movementFluidity: 1.0,
    accessoryAvailability: ['basic', 'mid', 'rare', 'crowned', 'sovereign'],
  },
];

export function getTierConfig(tier: 0 | 1 | 2 | 3 | 4 | 5): TierVisualConfig {
  const config = TIER_VISUAL_CONFIGS[tier];
  if (!config) throw new Error(`Invalid tier: ${tier}`);
  return config;
}
