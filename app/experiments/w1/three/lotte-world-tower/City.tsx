"use client";

import { useMemo } from "react";

// A tiny random number maker with a fixed seed, so the city looks the same on every reload.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

// Low blocks around the tower, the shopping mall at its feet, and Seokchon Lake to the north.
export function City({ night }: { night: boolean }) {
  const blocks = useMemo(() => {
    const random = seeded(412);
    const list: { x: number; z: number; w: number; d: number; h: number }[] = [];
    for (let x = -60; x <= 60; x += 7) {
      for (let z = -60; z <= 60; z += 7) {
        if (Math.abs(x) < 16 && Math.abs(z) < 16) continue; // the tower and the mall
        if (z < -14 && z > -44 && Math.abs(x) < 26) continue; // the lake
        if (random() < 0.25) continue; // some empty lots
        list.push({ x, z, w: 3 + random() * 3, d: 3 + random() * 3, h: 1 + random() * random() * 10 });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {/* The ground */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={night ? "#101318" : "#8f9a8c"} />
      </mesh>

      {/* Seokchon Lake: two flat ovals (a circle squashed by scale) */}
      {[-13, 13].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.02, -29]} scale={[11, 7, 1]}>
          <circleGeometry args={[1, 48]} />
          <meshStandardMaterial color={night ? "#0d1a26" : "#4f7f95"} roughness={0.2} />
        </mesh>
      ))}

      {/* Lotte World Mall: low boxes at the tower's feet */}
      <mesh position={[0, 1.5, 10]}>
        <boxGeometry args={[26, 3, 8]} />
        <meshStandardMaterial color="#c9ccc8" />
      </mesh>
      <mesh position={[10, 1.2, 0]}>
        <boxGeometry args={[7, 2.4, 14]} />
        <meshStandardMaterial color="#c9ccc8" />
      </mesh>

      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={night ? "#232830" : "#d4d2cc"} emissive="#ffcf87" emissiveIntensity={night ? (i % 3) * 0.06 : 0} />
        </mesh>
      ))}
    </group>
  );
}
