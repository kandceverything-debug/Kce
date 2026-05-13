import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Instances, Instance } from '@react-three/drei';
import { getTierConfig, type AvatarTraits } from '@compound/shared';
import * as THREE from 'three';

export function Avatar({
  traits,
  position = [0, 0, 0],
  scale = 1,
}: {
  traits: AvatarTraits;
  position?: [number, number, number];
  scale?: number;
}) {
  const tierConfig = getTierConfig(traits.tier);
  const meshRef = React.useRef<THREE.Group>(null);
  const time = React.useRef(0);

  useFrame(({ clock }: any) => {
    time.current += clock.getDelta();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(time.current * 2) * 0.1;
      meshRef.current.scale.set(
        scale * tierConfig.bodyScale,
        scale * tierConfig.bodyScale,
        scale * tierConfig.bodyScale,
      );
    }
  });

  const bodyRadius = tierConfig.bodyRadius;
  const bodyHeight = tierConfig.bodyHeight;

  return (
    <group ref={meshRef} position={position}>
      {/* Body: capsule geometry */}
      <mesh position={[0, bodyHeight / 2, 0]}>
        <capsuleGeometry args={[bodyRadius, bodyHeight, 8, 8]} />
        <meshStandardMaterial
          color={traits.palette[0] || '#2a1a3e'}
          emissive={traits.aura.color || '#7a00ff'}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Aura rings */}
      {Array.from({ length: tierConfig.auraLayers }).map((_, i) => (
        <group key={`aura-${i}`} position={[0, bodyHeight / 2, 0]}>
          <mesh>
            <torusGeometry args={[bodyRadius * (1 + (i + 1) * 0.3), 0.05, 16, 100]} />
            <meshStandardMaterial
              color={traits.aura.color}
              transparent
              opacity={tierConfig.auraOpacityBase / (i + 1)}
              emissive={traits.aura.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Particles for higher tiers */}
      {tierConfig.particleSystems.length > 0 && (
        <Sparkles
          count={20 * tierConfig.particleSystems.length}
          scale={[bodyRadius * 2, bodyHeight, bodyRadius * 2]}
          size={0.5}
          speed={0.5}
          color={traits.aura.color}
        />
      )}

      {/* Halo for Tier 5 */}
      {tierConfig.hasHalo && (
        <mesh position={[0, bodyHeight + 0.3, 0]}>
          <torusGeometry args={[bodyRadius * 0.8, 0.05, 16, 100]} />
          <meshStandardMaterial
            color={traits.aura.color}
            emissive={traits.aura.color}
            emissiveIntensity={1}
          />
        </mesh>
      )}
    </group>
  );
}
