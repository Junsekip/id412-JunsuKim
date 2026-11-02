import * as THREE from "three";

// A standing human figure, like a smooth statue, about 3.2 units tall (feet at -1.6, top of the head at 1.6).
// It is described as a distance field: for any point, how far it is from the body's surface
// (negative = inside). The body is ~30 simple parts (ellipsoids and tapered tubes) blended smoothly together.
// Arms rest against the body and the legs are together: morph.ts wraps ONE surface around the figure,
// so open gaps (between the legs, under the arms) would be bridged by a thin web.

type Part =
  | { kind: "ellipsoid"; centre: [number, number, number]; radii: [number, number, number] }
  | { kind: "tube"; from: [number, number, number]; to: [number, number, number]; r1: number; r2: number };

const BLEND = 0.06; // how softly the parts melt into each other

// One side of the body (x > 0); mirrored for the other side below.
const SIDE: Part[] = [
  { kind: "ellipsoid", centre: [0.29, 0.97, -0.01], radii: [0.1, 0.08, 0.09] }, // shoulder
  { kind: "tube", from: [0.31, 0.95, -0.01], to: [0.33, 0.48, -0.03], r1: 0.075, r2: 0.058 }, // upper arm
  { kind: "ellipsoid", centre: [0.32, 0.75, -0.02], radii: [0.07, 0.14, 0.07] }, // biceps
  { kind: "tube", from: [0.33, 0.48, -0.03], to: [0.32, 0.05, 0.03], r1: 0.058, r2: 0.04 }, // forearm
  { kind: "ellipsoid", centre: [0.325, -0.1, 0.04], radii: [0.035, 0.1, 0.055] }, // hand
  { kind: "ellipsoid", centre: [0.12, 0.18, 0.0], radii: [0.15, 0.16, 0.15] }, // hip
  { kind: "tube", from: [0.11, 0.12, 0.0], to: [0.085, -0.66, 0.02], r1: 0.135, r2: 0.08 }, // thigh
  { kind: "ellipsoid", centre: [0.085, -0.68, 0.04], radii: [0.065, 0.07, 0.065] }, // knee
  { kind: "tube", from: [0.085, -0.68, 0.01], to: [0.07, -1.46, -0.01], r1: 0.072, r2: 0.045 }, // shin
  { kind: "ellipsoid", centre: [0.085, -0.88, -0.035], radii: [0.06, 0.16, 0.065] }, // calf
  { kind: "ellipsoid", centre: [0.07, -1.54, 0.07], radii: [0.05, 0.04, 0.13] }, // foot
];

const PARTS: Part[] = [
  { kind: "ellipsoid", centre: [0, 1.38, 0.02], radii: [0.15, 0.2, 0.17] }, // skull
  { kind: "ellipsoid", centre: [0, 1.26, 0.06], radii: [0.105, 0.1, 0.11] }, // jaw
  { kind: "ellipsoid", centre: [0, 1.33, 0.18], radii: [0.025, 0.045, 0.03] }, // nose
  { kind: "tube", from: [0, 1.08, 0], to: [0, 1.25, 0.02], r1: 0.075, r2: 0.065 }, // neck
  { kind: "ellipsoid", centre: [0, 0.8, 0.02], radii: [0.27, 0.27, 0.16] }, // chest
  { kind: "ellipsoid", centre: [0, 0.93, -0.02], radii: [0.3, 0.09, 0.13] }, // collarbones / trapezius
  { kind: "ellipsoid", centre: [0, 0.48, 0.01], radii: [0.2, 0.24, 0.14] }, // waist
  { kind: "ellipsoid", centre: [0, 0.2, 0.0], radii: [0.25, 0.17, 0.16] }, // pelvis
  ...SIDE,
  ...SIDE.map(mirror),
];

function mirror(part: Part): Part {
  if (part.kind === "ellipsoid") return { ...part, centre: [-part.centre[0], part.centre[1], part.centre[2]] };
  return { ...part, from: [-part.from[0], part.from[1], part.from[2]], to: [-part.to[0], part.to[1], part.to[2]] };
}

// Distance to an ellipsoid (an approximation, good enough near the surface).
function ellipsoid(p: THREE.Vector3, centre: number[], radii: number[]) {
  const x = p.x - centre[0];
  const y = p.y - centre[1];
  const z = p.z - centre[2];
  const k0 = Math.hypot(x / radii[0], y / radii[1], z / radii[2]);
  const k1 = Math.hypot(x / radii[0] ** 2, y / radii[1] ** 2, z / radii[2] ** 2);
  return (k0 * (k0 - 1)) / k1;
}

// Distance to a tube from `a` to `b` whose radius goes from r1 to r2.
function tube(p: THREE.Vector3, a: number[], b: number[], r1: number, r2: number) {
  const pa = [p.x - a[0], p.y - a[1], p.z - a[2]];
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const along = (pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2);
  const h = Math.min(1, Math.max(0, along)); // 0 at a, 1 at b
  return Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - (r1 + (r2 - r1) * h);
}

// Smooth minimum: like Math.min, but the two shapes melt together within BLEND of each other.
function smoothMin(a: number, b: number) {
  const h = Math.max(0, BLEND - Math.abs(a - b)) / BLEND;
  return Math.min(a, b) - (h * h * BLEND) / 4;
}

// Distance from p to the body's surface.
export function humanDistance(p: THREE.Vector3) {
  let d = Infinity;
  for (const part of PARTS) {
    const partDistance =
      part.kind === "ellipsoid" ? ellipsoid(p, part.centre, part.radii) : tube(p, part.from, part.to, part.r1, part.r2);
    d = d === Infinity ? partDistance : smoothMin(d, partDistance);
  }
  return d;
}

// The surface point for grid point (u, v), both 0..1. The figure is cut into horizontal slices, one per v,
// from the top of the head (v = 0) to the soles (v = 1). In each slice, a ray comes in horizontally from
// outside at angle u and steps inwards by the distance to the body each time, until it touches it.
// If it reaches the middle without touching (a gap, or above the head), the point stays on the middle line.
const TOP = 1.58;
const BOTTOM = -1.58;
export function humanPoint(u: number, v: number) {
  const y = TOP + (BOTTOM - TOP) * v;
  const around = u * Math.PI * 2;
  const outward = new THREE.Vector3(-Math.cos(around), 0, Math.sin(around)); // same angle as the other shapes
  const point = new THREE.Vector3(0, y, 0).addScaledVector(outward, 1); // outside the figure
  let travelled = 0;
  while (travelled < 1) {
    const d = humanDistance(point);
    if (d < 0.0005) return point;
    const step = d * 0.9; // 0.9: a little careful, the distances are approximate
    point.addScaledVector(outward, -step);
    travelled += step;
  }
  return new THREE.Vector3(0, y, 0);
}
