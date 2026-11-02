"use client";

import { useMemo, useRef } from "react";
import { DoubleSide, RingGeometry, SRGBColorSpace, type Group } from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Atmosphere } from "./Atmosphere";
import { EarthSurface, Moon } from "./Earth";

const DIR = "/experiments/w1/three/solar-system";
const YEAR_SECONDS = 40; // at speed 1, the Earth goes round the Sun once every 40 seconds
const DEG = Math.PI / 180;

// Sizes and distances are squeezed (real ones would make every planet an invisible dot); the orbit periods
// and the axial tilts are real.
export type PlanetData = {
  name: string;
  texture: string; // image wrapped round the ball, in public/experiments/w1/three/solar-system/
  radius: number;
  distance: number; // radius of its orbit around the Sun
  period: number; // years for one orbit (Earth = 1)
  tilt: number; // axial tilt in radians: Uranus lies on its side, Venus is upside down (it spins backwards)
  spin: number; // how fast it turns on its axis (radians per second at speed 1)
  start: number; // where on its orbit it starts, so they are not all in a line
  rocky?: boolean; // solid ground with craters: bump map from the same image
  atmosphere?: [string, number]; // glow colour and strength
  ring?: boolean;
  moon?: boolean;
};

export const PLANETS: PlanetData[] = [
  { name: "Mercury", texture: "mercury.jpg", radius: 0.25, distance: 7, period: 0.24, tilt: 0.03 * DEG, spin: 0.05, start: 0.5, rocky: true },
  { name: "Venus", texture: "venus_atmosphere.jpg", radius: 0.6, distance: 9.5, period: 0.62, tilt: 177.4 * DEG, spin: 0.02, start: 2.1, atmosphere: ["#ffd9a0", 0.8] },
  { name: "Earth", texture: "earth_daymap.jpg", radius: 0.63, distance: 12.5, period: 1, tilt: 23.4 * DEG, spin: 0.5, start: 4.0, moon: true },
  { name: "Mars", texture: "mars.jpg", radius: 0.34, distance: 16, period: 1.88, tilt: 25.2 * DEG, spin: 0.48, start: 1.2, rocky: true, atmosphere: ["#e0a080", 0.3] },
  { name: "Jupiter", texture: "jupiter.jpg", radius: 2.2, distance: 25, period: 11.86, tilt: 3.1 * DEG, spin: 1.2, start: 5.3, atmosphere: ["#f0d8b0", 0.35] },
  { name: "Saturn", texture: "saturn.jpg", radius: 1.85, distance: 35, period: 29.46, tilt: 26.7 * DEG, spin: 1.1, start: 3.0, ring: true, atmosphere: ["#f0e0b0", 0.3] },
  { name: "Uranus", texture: "uranus.jpg", radius: 0.9, distance: 45, period: 84, tilt: 97.8 * DEG, spin: 0.7, start: 0.2, atmosphere: ["#a8f0f0", 0.5] },
  { name: "Neptune", texture: "neptune.jpg", radius: 0.87, distance: 53, period: 164.8, tilt: 28.3 * DEG, spin: 0.75, start: 2.7, atmosphere: ["#6f9cff", 0.6] },
];

// Any planet but the Earth: one image on a ball.
// meshStandardMaterial with roughness 1 and metalness 0: dust, rock and cloud tops scatter light softly in all
// directions, with no shiny highlight. Rocky planets also use their image as a bumpMap: darker = lower, which
// makes the craters catch the light at the day/night line.
function Surface({ planet }: { planet: PlanetData }) {
  const map = useTexture(`${DIR}/${planet.texture}`);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 8;
  return (
    // Only Saturn casts and receives shadows (on and from its rings). See the note on the light in Sun.tsx.
    <mesh castShadow={planet.ring} receiveShadow={planet.ring}>
      <sphereGeometry args={[planet.radius, 96, 48]} />
      <meshStandardMaterial
        map={map}
        roughness={1}
        metalness={0}
        bumpMap={planet.rocky ? map : null}
        bumpScale={planet.rocky ? 2 : 0}
      />
    </mesh>
  );
}

// Saturn's rings. The image is a thin strip: left = inner edge, right = outer edge, transparent in the gaps.
// A ringGeometry's own image coordinates are flat (like a sheet of paper), so we redo them: x = distance from
// the centre, from 0 at the inner edge to 1 at the outer edge.
function Rings({ planetRadius }: { planetRadius: number }) {
  const map = useTexture(`${DIR}/saturn_ring_alpha.png`);
  map.colorSpace = SRGBColorSpace;
  const inner = planetRadius * 1.24;
  const outer = planetRadius * 2.27;

  const geometry = useMemo(() => {
    const ring = new RingGeometry(inner, outer, 256, 1);
    const position = ring.attributes.position;
    const uv = ring.attributes.uv;
    for (let i = 0; i < position.count; i++) {
      const r = Math.hypot(position.getX(i), position.getY(i));
      uv.setXY(i, (r - inner) / (outer - inner), 0.5);
    }
    return ring;
  }, [inner, outer]);

  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} castShadow receiveShadow>
      {/* Ice and dust: matte, lit from both sides. alphaTest so the gaps also let light through in the shadow. */}
      <meshStandardMaterial map={map} side={DoubleSide} transparent alphaTest={0.05} roughness={1} metalness={0} />
    </mesh>
  );
}

// A planet on its orbit. Groups inside groups, each doing one thing:
// orbit (turns around the Sun) → position (moves out to its distance) → hold (keeps the axis pointing the same
// way in space as it goes round, which is what makes seasons) → tilt → spin (day and night).
export function Planet({ planet, speed, orbits }: { planet: PlanetData; speed: number; orbits: boolean }) {
  const orbitRef = useRef<Group>(null);
  const holdRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);

  useFrame((_, delta) => {
    orbitRef.current!.rotation.y += ((Math.PI * 2) / (planet.period * YEAR_SECONDS)) * speed * delta;
    holdRef.current!.rotation.y = -orbitRef.current!.rotation.y; // undo the orbit's turn
    spinRef.current!.rotation.y += planet.spin * speed * delta;
  });

  return (
    <>
      {orbits && (
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[planet.distance - 0.02, planet.distance + 0.02, 256]} />
          <meshBasicMaterial color="white" transparent opacity={0.08} side={DoubleSide} />
        </mesh>
      )}

      <group ref={orbitRef} rotation-y={planet.start}>
        <group position={[planet.distance, 0, 0]}>
          <group ref={holdRef}>
            <group rotation-z={planet.tilt}>
              <group ref={spinRef}>
                {planet.name === "Earth" ? <EarthSurface radius={planet.radius} speed={speed} /> : <Surface planet={planet} />}
              </group>
              {planet.ring && <Rings planetRadius={planet.radius} />}
              {planet.atmosphere && (
                <Atmosphere radius={planet.radius * 1.04} colour={planet.atmosphere[0]} strength={planet.atmosphere[1]} />
              )}
            </group>
            {planet.moon && <Moon planetRadius={planet.radius} speed={speed} />}
          </group>
        </group>
      </group>
    </>
  );
}
