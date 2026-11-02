"use client";

import { useMemo, useRef } from "react";
import { AdditiveBlending, CanvasTexture, SRGBColorSpace, type Mesh } from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export const SUN_RADIUS = 4;

// A soft round glow, drawn once on a 2D canvas: bright white-yellow in the middle, fading to nothing.
function makeGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255, 245, 220, 1)");
  gradient.addColorStop(0.25, "rgba(255, 210, 130, 0.55)");
  gradient.addColorStop(0.5, "rgba(255, 150, 60, 0.12)");
  gradient.addColorStop(1, "rgba(255, 120, 30, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new CanvasTexture(canvas);
}

// The Sun: a textured ball that makes its own light, a glow around it, and the light that lights the planets.
export function Sun({ speed }: { speed: number }) {
  const surfaceRef = useRef<Mesh>(null);
  const surface = useTexture("/experiments/w1/three/solar-system/sun.jpg");
  surface.colorSpace = SRGBColorSpace; // colour images are sRGB; without this they look washed out
  const glow = useMemo(makeGlow, []);

  useFrame((_, delta) => {
    surfaceRef.current!.rotation.y += 0.03 * speed * delta; // the Sun turns too, once in about 27 days
  });

  return (
    <>
      {/* meshBasicMaterial ignores light: the Sun is not lit, it IS the light. toneMapped={false} keeps it at full
          brightness instead of being toned down like everything else. */}
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[SUN_RADIUS, 96, 48]} />
        <meshBasicMaterial map={surface} toneMapped={false} />
      </mesh>

      {/* Two glows: a sprite is a flat picture that always faces the camera. Additive = adds light, never darkens. */}
      <sprite scale={SUN_RADIUS * 3.2}>
        <spriteMaterial map={glow} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      <sprite scale={SUN_RADIUS * 9}>
        <spriteMaterial map={glow} blending={AdditiveBlending} depthWrite={false} opacity={0.35} toneMapped={false} />
      </sprite>

      {/* The sunlight: a pointLight shines in every direction from the centre, like a bare bulb.
          decay={0}: it does not fade with distance (in reality Neptune gets 900× less light than the Earth).
          castShadow: Saturn throws its shadow on its rings and the rings on Saturn. Only those two cast shadows:
          this light is a single point, so a shadow grows the further it goes and the Earth's would cover Jupiter.
          The real Sun is a wide disc, and a planet's shadow shrinks to nothing long before it reaches another. */}
      <pointLight
        intensity={2.5}
        decay={0}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={SUN_RADIUS}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
        shadow-radius={4}
      />
    </>
  );
}
