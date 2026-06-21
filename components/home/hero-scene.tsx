"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { branding } from "@/lib/branding";

const GRID_SIZE = 8;
const SPACING = 1.15;
const BOX_SIZE = 0.62;

// Cycles each box through 4 brand colors (instead of "mostly primary, a few
// accent") so the grid reads as a richer multi-hue pattern. Deterministic on
// x/z so the pattern is stable across re-renders, not random per mount.
const GRID_COLORS = [
  branding.colors.primary,
  branding.colors.accent,
  branding.colors.palette.blue,
  branding.colors.palette.violet,
] as const;

function colorIndexFor(x: number, z: number) {
  return (x * 3 + z * 5) % GRID_COLORS.length;
}

function PlotGrid({ shouldAnimate }: { shouldAnimate: boolean }) {
  const groupRef = useRef<Group>(null);

  const boxes = useMemo(() => {
    const items: { position: [number, number, number]; colorIndex: number }[] = [];
    const offset = (GRID_SIZE - 1) / 2;
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        items.push({
          position: [(x - offset) * SPACING, 0, (z - offset) * SPACING],
          colorIndex: colorIndexFor(x, z),
        });
      }
    }
    return items;
  }, []);

  useFrame((_, delta) => {
    if (!shouldAnimate || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={groupRef} rotation={[0.5, 0.6, 0]}>
      {boxes.map((box, i) => {
        const color = GRID_COLORS[box.colorIndex];
        const isPrimary = color === branding.colors.primary;
        return (
          <mesh key={i} position={box.position}>
            <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isPrimary ? 0.18 : 0.4}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function HeroScene() {
  // Read once on mount; this is a decorative visual, not a state machine, so
  // a useState initializer avoids an extra render + effect just to flip a flag.
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  return (
    <Canvas
      camera={{ position: [0, 4, 9], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.3} color={branding.colors.accent} />
      <PlotGrid shouldAnimate={!prefersReducedMotion} />
    </Canvas>
  );
}
