"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Object3D, Shape, type InstancedMesh } from "three";

// 1 unit = 10 m. The real tower is 555 m tall with 123 floors.
const HEIGHT = 55.5; // tip of the crown
const BODY_TOP = 49; // where the glass floors stop and the open lattice crown begins
const FLOORS = 123;
const FLOOR_HEIGHT = BODY_TOP / FLOORS;
const BASE_WIDTH = 7; // about 70 m across at the bottom
const TIP_WIDTH = 1.2; // the crown almost closes at the top

// The silhouette: the width at a height h. Almost straight at the bottom, narrowing faster near the top,
// like the tip of a brush. Change the 1.6 to make it straighter (1) or rounder (3).
export function widthAt(h: number) {
  const t = h / HEIGHT;
  return BASE_WIDTH - (BASE_WIDTH - TIP_WIDTH) * Math.pow(t, 1.6);
}

// One floor plan: a 1 × 1 square with rounded corners, extruded 1 unit up.
// Every floor uses this same shape, only scaled: instancing draws all 123 in one go.
function makeFloorGeometry() {
  const s = 0.5;
  const r = 0.16; // corner radius
  const shape = new Shape();
  shape.moveTo(-s + r, -s);
  shape.lineTo(s - r, -s);
  shape.quadraticCurveTo(s, -s, s, -s + r);
  shape.lineTo(s, s - r);
  shape.quadraticCurveTo(s, s, s - r, s);
  shape.lineTo(-s + r, s);
  shape.quadraticCurveTo(-s, s, -s, s - r);
  shape.lineTo(-s, -s + r);
  shape.quadraticCurveTo(-s, -s, -s + r, -s);
  const geometry = new ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, curveSegments: 6 });
  geometry.rotateX(-Math.PI / 2); // extrude goes along z; turn it so the floor stands from y = 0 to y = 1
  return geometry;
}

// The crown: four faces of crossing diagonal lines (a diagrid), getting narrower to the top.
function makeCrownGeometry() {
  const LEVELS = 12; // horizontal rings
  const DIVISIONS = 4; // diamonds across each face
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const points: number[] = [];

  // The point at column i (0..DIVISIONS) on face f, at ring k
  const at = (f: number, i: number, k: number) => {
    const h = BODY_TOP + ((HEIGHT - BODY_TOP) * k) / LEVELS;
    const half = widthAt(h) / 2;
    const [ax, az] = corners[f];
    const [bx, bz] = corners[(f + 1) % 4];
    const u = i / DIVISIONS;
    return [(ax + (bx - ax) * u) * half, h, (az + (bz - az) * u) * half];
  };
  const line = (a: number[], b: number[]) => points.push(...a, ...b);

  for (let f = 0; f < 4; f++) {
    for (let k = 0; k <= LEVELS; k++) {
      for (let i = 0; i < DIVISIONS; i++) {
        line(at(f, i, k), at(f, i + 1, k)); // ring
        if (k < LEVELS) {
          line(at(f, i, k), at(f, i + 1, k + 1)); // diagonal /
          line(at(f, i + 1, k), at(f, i, k + 1)); // diagonal \
        }
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return geometry;
}

// The tower: glass floors, a thin bright slab between them, a dark seam up the middle of each face, and the crown.
export function Tower({ night }: { night: boolean }) {
  const glassRef = useRef<InstancedMesh>(null);
  const slabRef = useRef<InstancedMesh>(null);
  const seamRef = useRef<InstancedMesh>(null);
  const floor = useMemo(makeFloorGeometry, []);
  const crown = useMemo(makeCrownGeometry, []);

  // Place every instance once: position and scale of floor i, from widthAt.
  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (let i = 0; i < FLOORS; i++) {
      const y = i * FLOOR_HEIGHT;
      const w = widthAt(y);

      dummy.position.set(0, y, 0);
      dummy.scale.set(w, FLOOR_HEIGHT * 0.88, w); // glass: most of the floor height
      dummy.updateMatrix();
      glassRef.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(0, y + FLOOR_HEIGHT * 0.88, 0);
      dummy.scale.set(w * 1.01, FLOOR_HEIGHT * 0.12, w * 1.01); // slab: a thin line, sticking out a little
      dummy.updateMatrix();
      slabRef.current!.setMatrixAt(i, dummy.matrix);

      // The seam: a narrow dark strip at the middle of each of the four faces
      for (let side = 0; side < 4; side++) {
        const angle = (side * Math.PI) / 2;
        dummy.position.set(Math.sin(angle) * (w / 2 + 0.02), y, Math.cos(angle) * (w / 2 + 0.02));
        dummy.rotation.set(0, angle, 0);
        dummy.scale.set(0.12, FLOOR_HEIGHT, 0.08);
        dummy.updateMatrix();
        seamRef.current!.setMatrixAt(i * 4 + side, dummy.matrix);
        dummy.rotation.set(0, 0, 0);
      }
    }
    glassRef.current!.instanceMatrix.needsUpdate = true;
    slabRef.current!.instanceMatrix.needsUpdate = true;
    seamRef.current!.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh ref={glassRef} args={[floor, undefined, FLOORS]}>
        <meshStandardMaterial
          color={night ? "#1b2a3a" : "#b9cfdc"}
          metalness={0.6}
          roughness={0.15}
          emissive="#ffd9a0"
          emissiveIntensity={night ? 0.12 : 0}
        />
      </instancedMesh>

      <instancedMesh ref={slabRef} args={[floor, undefined, FLOORS]}>
        <meshStandardMaterial color="#e8ecef" emissive="#fff3dd" emissiveIntensity={night ? 1.2 : 0} />
      </instancedMesh>

      <instancedMesh ref={seamRef} args={[undefined, undefined, FLOORS * 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3a4652" metalness={0.5} roughness={0.4} />
      </instancedMesh>

      <lineSegments geometry={crown}>
        <lineBasicMaterial color={night ? "#ffe6b0" : "#5f6f7c"} />
      </lineSegments>
    </group>
  );
}
