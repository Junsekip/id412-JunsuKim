"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { Object3D, type InstancedMesh } from "three";
import { COARSE, FINE, createMorphGeometry, shapePositions, type GeometryName } from "./morph";

export { GEOMETRIES, type GeometryName } from "./morph";

const BLOCK = 8; // units, the size of the whole block of shapes
const SPEED = 0.3; // radians per second each shape turns, around the vertical axis like a turntable
const WAVE = 0.35; // radians: each shape is turned a little more than its neighbour, so the turning ripples
// The morph's spring: more tension = faster, less friction = more wobble past the new shape before it settles.
const SPRING = { tension: 50, friction: 11 };

// What the shapes' surface looks like. Set from the options panel in page.tsx.
export type MaterialSettings = {
  colour: string; // base colour
  roughness: number; // 0 = mirror-smooth, 1 = matte
  metalness: number; // 0 = plastic / paint, 1 = metal (shows its colour in its reflections)
  clearcoat: number; // 0..1, a thin glossy varnish on top, like car paint
  transmission: number; // 0..1, light passes through: 1 = glass
  opacity: number; // 0..1, see-through by fading out (unlike transmission, nothing bends)
  emissive: number; // 0..2, glows with its own colour, even without light
  wireframe: boolean; // the edges of the triangles (of the shared grid, see morph.ts)
};

type Props = { geometry: GeometryName; material: MaterialSettings; perAxis: number };

// perAxis × perAxis × perAxis copies of the same shape in a block, all turning, all morphing together.
// Performance: an InstancedMesh draws every copy in ONE draw call from ONE geometry. Each copy only has its own
// position / turn / size (a matrix). Morphing changes the one geometry, so all copies change at once.
// With 4 or more per axis, the shared grid is coarser (COARSE in morph.ts), so the GPU has fewer points to draw.
export function Shapes({ geometry, material, perAxis }: Props) {
  const meshRef = useRef<InstancedMesh>(null);
  const count = perAxis ** 3;
  const detail = perAxis >= 4 ? COARSE : FINE;

  // One geometry for the whole time (page.tsx makes a new Shapes when perAxis changes).
  const [shape] = useState(() => createMorphGeometry(geometry, detail));
  const from = useRef<Float32Array>(shapePositions(geometry, detail)); // the points when the morph started
  const to = useRef<Float32Array>(shapePositions(geometry, detail)); // the points of the new shape
  const lastProgress = useRef(1);
  const angle = useRef(0);

  // Where each copy sits: a perAxis³ grid, centred on (0, 0, 0). Worked out once, not every frame.
  const spacing = BLOCK / perAxis;
  const size = spacing * 0.3; // shapes are ~2–3 units; this leaves a gap between neighbours, and 1 per axis fills the block
  const cells = useMemo(() => {
    const list: { x: number; y: number; z: number; phase: number }[] = [];
    const offset = ((perAxis - 1) * spacing) / 2;
    for (let i = 0; i < perAxis; i++) {
      for (let j = 0; j < perAxis; j++) {
        for (let k = 0; k < perAxis; k++) {
          list.push({ x: i * spacing - offset, y: j * spacing - offset, z: k * spacing - offset, phase: (i + j + k) * WAVE });
        }
      }
    }
    return list;
  }, [perAxis, spacing]);

  // progress goes 0 → 1 with a spring (react-spring): fast at first, slowing down, a little past 1 and back.
  const [spring, api] = useSpring(() => ({ progress: 1, config: SPRING }));

  // A new shape was chosen: start from wherever the points are now (even mid-morph), spring towards the new ones.
  useEffect(() => {
    from.current = (shape.attributes.position.array as Float32Array).slice();
    to.current = shapePositions(geometry, detail);
    api.start({ from: { progress: 0 }, to: { progress: 1 } });
  }, [geometry, shape, detail, api]);

  useEffect(() => () => shape.dispose(), [shape]);

  // One helper object, reused for every copy, to turn position + turn + size into a matrix.
  const helper = useMemo(() => new Object3D(), []);

  // useFrame runs every frame. delta = seconds since the last frame, so the speed is the same on any screen.
  useFrame((_, delta) => {
    const mesh = meshRef.current!;

    // 1. Turn every copy: one matrix each, uploaded to the GPU together.
    angle.current += SPEED * delta;
    cells.forEach((cell, i) => {
      helper.position.set(cell.x, cell.y, cell.z);
      helper.rotation.y = angle.current + cell.phase;
      helper.scale.setScalar(size);
      helper.updateMatrix();
      mesh.setMatrixAt(i, helper.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

    // 2. Morph the one shared geometry: every point = from + (to − from) × progress. Only while the spring moves.
    const progress = spring.progress.get();
    if (progress === lastProgress.current) return;
    lastProgress.current = progress;
    const points = shape.attributes.position.array as Float32Array;
    for (let i = 0; i < points.length; i++) {
      points[i] = from.current[i] + (to.current[i] - from.current[i]) * progress;
    }
    shape.attributes.position.needsUpdate = true;
    shape.computeVertexNormals(); // the surface turned, so the light must fall on it differently
  });

  // frustumCulled off: three would otherwise judge "on screen or not" by one shape at the centre, not the whole block.
  return (
    <instancedMesh ref={meshRef} args={[shape, undefined, count]} frustumCulled={false}>
      {/* meshPhysicalMaterial = meshStandardMaterial (colour, roughness, metalness) + clearcoat, transmission and more */}
      <meshPhysicalMaterial
        color={material.colour}
        roughness={material.roughness}
        metalness={material.metalness}
        clearcoat={material.clearcoat}
        transmission={material.transmission}
        thickness={2 * size} // how deep the glass is, for the bending of light
        transparent={material.opacity < 1}
        opacity={material.opacity}
        emissive={material.colour}
        emissiveIntensity={material.emissive}
        wireframe={material.wireframe}
      />
    </instancedMesh>
  );
}
