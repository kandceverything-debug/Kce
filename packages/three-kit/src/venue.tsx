import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture, PerspectiveCamera } from '@react-three/drei';

const CMU_COLOR = new THREE.Color(0xc4b5a0); // Tan/cream cinder block
const CONCRETE_COLOR = new THREE.Color(0x3a3a3a); // Glossy dark concrete
const DJ_BOOTH_COLOR = new THREE.Color(0x1a1a2e); // Dark booth
const SCAFFOLD_COLOR = new THREE.Color(0x1a1a1a); // Black pipe

interface VenueProps {
  goboIntensity?: number;
  lightingIntensity?: number;
}

export function Venue({ goboIntensity = 0.8, lightingIntensity = 1 }: VenueProps) {
  const groupRef = useRef<THREE.Group>(null);
  const goboLightRef = useRef<THREE.Light>(null);

  // Venue dimensions based on photo reference (~14m wide, 20m deep)
  const VENUE_WIDTH = 14;
  const VENUE_DEPTH = 20;
  const WALL_HEIGHT = 5;
  const BOOTH_HEIGHT = 0.8;

  useFrame(({ clock }) => {
    // Animate gobo intensity
    if (goboLightRef.current && goboLightRef.current instanceof THREE.SpotLight) {
      goboLightRef.current.intensity = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floor: glossy concrete */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[VENUE_WIDTH, VENUE_DEPTH]} />
        <meshStandardMaterial
          color={CONCRETE_COLOR}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Walls: cinder block (4 walls) */}
      {/* Back wall */}
      <mesh position={[0, WALL_HEIGHT / 2, -VENUE_DEPTH / 2]} receiveShadow castShadow>
        <boxGeometry args={[VENUE_WIDTH, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color={CMU_COLOR} roughness={0.7} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, WALL_HEIGHT / 2, VENUE_DEPTH / 2]} receiveShadow castShadow>
        <boxGeometry args={[VENUE_WIDTH, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color={CMU_COLOR} roughness={0.7} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-VENUE_WIDTH / 2, WALL_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, WALL_HEIGHT, VENUE_DEPTH]} />
        <meshStandardMaterial color={CMU_COLOR} roughness={0.7} />
      </mesh>

      {/* Right wall */}
      <mesh position={[VENUE_WIDTH / 2, WALL_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, WALL_HEIGHT, VENUE_DEPTH]} />
        <meshStandardMaterial color={CMU_COLOR} roughness={0.7} />
      </mesh>

      {/* Ceiling: exposed scaffold */}
      <mesh position={[0, WALL_HEIGHT, 0]} receiveShadow>
        <planeGeometry args={[VENUE_WIDTH, VENUE_DEPTH]} />
        <meshStandardMaterial color={SCAFFOLD_COLOR} roughness={0.9} />
      </mesh>

      {/* DJ Booth: raised platform with Art Deco tapestry backdrop */}
      <group position={[0, 0, -VENUE_DEPTH / 2 + 2]}>
        {/* Booth platform */}
        <mesh position={[0, BOOTH_HEIGHT / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3, BOOTH_HEIGHT, 2]} />
          <meshStandardMaterial color={DJ_BOOTH_COLOR} metalness={0.2} roughness={0.5} />
        </mesh>

        {/* Backdrop: Art Deco tapestry simulation */}
        <mesh position={[0, 2, -1]}>
          <planeGeometry args={[3.5, 2]} />
          <meshStandardMaterial
            color={0x1a1a1a}
            emissive={0x7a00ff}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Booth front lights (Christmas lights) */}
        {Array.from({ length: 5 }).map((_, i) => (
          <pointLight
            key={`booth-light-${i}`}
            position={[-1.5 + i * 0.75, BOOTH_HEIGHT + 0.1, 0]}
            color={0xff1493}
            intensity={0.5}
            distance={2}
          />
        ))}
      </group>

      {/* Gobo projection: honeycomb pattern on walls and ceiling */}
      <spotLight
        ref={goboLightRef}
        position={[0, WALL_HEIGHT - 0.5, 0]}
        angle={Math.PI / 2}
        penumbra={0.5}
        intensity={1.5}
        color={0xffff00}
        castShadow
      />

      {/* Additional gobo in blue */}
      <spotLight
        position={[2, WALL_HEIGHT - 0.5, 0]}
        angle={Math.PI / 2}
        penumbra={0.5}
        intensity={1.2}
        color={0x00ffff}
        castShadow
      />

      {/* Dance floor wash: purple/magenta */}
      <pointLight position={[0, WALL_HEIGHT - 1, 0]} color={0xaa00ff} intensity={2} />

      {/* Green accent on DJ booth */}
      <pointLight position={[0, 3, -VENUE_DEPTH / 2 + 1]} color={0x00ff88} intensity={1.5} />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.3} color={0x7a00ff} />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={[0x04020a, 5, 30]} />
    </group>
  );
}

export function VenueScene() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ mouse }) => {
    if (cameraRef.current) {
      // Mouselook-like camera control
      cameraRef.current.rotation.order = 'YXZ';
      cameraRef.current.rotation.y = -mouse.x * (Math.PI * 0.25);
      cameraRef.current.rotation.x = -mouse.y * (Math.PI * 0.25);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 1.6, 5]} fov={75} />
      <Venue />
    </>
  );
}
