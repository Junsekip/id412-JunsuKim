import * as THREE from "three";
import { humanPoint } from "./humanoid";

// To morph from one shape to another, both must have the same points (vertices) in the same order.
// Three's own geometries all have different points, so every shape here is rebuilt on ONE shared grid:
// U points around × V points from top to bottom, like the lines of longitude and latitude on a globe.
// Morphing is then just moving each point from where it is in one shape to where it is in the next.
// Two grid sizes: fine for a few shapes, coarse when hundreds are drawn at once (see Shapes.tsx).
export type Detail = { U: number; V: number };
export const FINE: Detail = { U: 200, V: 128 }; // 26 000 points
export const COARSE: Detail = { U: 80, V: 48 }; // 4 000 points

export const GEOMETRIES = [
  "box",
  "sphere",
  "torus",
  "torusKnot",
  "cone",
  "cylinder",
  "capsule",
  "icosahedron",
  "dodecahedron",
  "octahedron",
  "tetrahedron",
  "humanoid",
] as const;
export type GeometryName = (typeof GEOMETRIES)[number];

// Convex shapes (no holes) are made from three's own geometry, about 2 units across like the cube:
// each grid point starts as a direction from the centre and goes out until it hits that shape's surface.
function convexGeometry(name: GeometryName): THREE.BufferGeometry {
  switch (name) {
    case "box":
      return new THREE.BoxGeometry(2, 2, 2);
    case "cone":
      return new THREE.ConeGeometry(1.2, 2.2, 64);
    case "cylinder":
      return new THREE.CylinderGeometry(1, 1, 2, 64);
    case "capsule":
      return new THREE.CapsuleGeometry(0.8, 1.2, 16, 32);
    case "icosahedron":
      return new THREE.IcosahedronGeometry(1.3, 0);
    case "dodecahedron":
      return new THREE.DodecahedronGeometry(1.3, 0);
    case "octahedron":
      return new THREE.OctahedronGeometry(1.4, 0);
    default:
      return new THREE.TetrahedronGeometry(1.5, 0);
  }
}

// The direction of grid point (u, v), both 0..1: u goes around the vertical axis, v from top (0) to bottom (1).
function direction(u: number, v: number) {
  const around = u * Math.PI * 2;
  const down = v * Math.PI;
  return new THREE.Vector3(-Math.cos(around) * Math.sin(down), Math.cos(down), Math.sin(around) * Math.sin(down));
}

// How far from the centre, along `dir`, the surface of a convex shape is.
// Every triangle of the shape lies on a flat plane; the ray leaves the shape through the nearest one it faces.
function distanceToSurface(dir: THREE.Vector3, planes: { normal: THREE.Vector3; offset: number }[]) {
  let nearest = Infinity;
  for (const plane of planes) {
    const facing = plane.normal.dot(dir);
    if (facing > 1e-6) nearest = Math.min(nearest, plane.offset / facing);
  }
  return nearest;
}

// The planes of all triangles of a geometry: their outward normal and their distance from the centre.
function planesOf(geometry: THREE.BufferGeometry) {
  const flat = geometry.toNonIndexed();
  const position = flat.attributes.position;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const planes: { normal: THREE.Vector3; offset: number }[] = [];
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i);
    b.fromBufferAttribute(position, i + 1);
    c.fromBufferAttribute(position, i + 2);
    const normal = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a));
    if (normal.length() < 1e-9) continue; // a triangle with no area (e.g. the tip of a cone)
    normal.normalize();
    planes.push({ normal, offset: normal.dot(a) });
  }
  return planes;
}

// Torus and torus knot have a hole, so they are built as a tube instead: u runs along the tube's centre line,
// v goes once around the tube, starting and ending on the inside of the ring.
// Both lie flat, around the vertical axis, like the other shapes.
function tubePoint(centre: THREE.Vector3, side: THREE.Vector3, up: THREE.Vector3, radius: number, v: number) {
  const angle = v * Math.PI * 2;
  return centre
    .clone()
    .addScaledVector(side, -Math.cos(angle) * radius) // -: start on the inside
    .addScaledVector(up, Math.sin(angle) * radius);
}

function torusPoint(u: number, v: number) {
  const around = u * Math.PI * 2;
  const outward = new THREE.Vector3(Math.cos(around), 0, Math.sin(around));
  return tubePoint(outward.clone(), outward, new THREE.Vector3(0, 1, 0), 0.4, v); // ring radius 1, tube 0.4
}

// The centre line of a (2, 3) torus knot, the same formula as three's TorusKnotGeometry, turned to lie flat.
function knotCurve(t: number) {
  const radius = 0.9;
  const r = 0.5 * radius * (2 + Math.cos(1.5 * t));
  return new THREE.Vector3(r * Math.cos(t), 0.5 * radius * Math.sin(1.5 * t), r * Math.sin(t));
}

function torusKnotPoint(u: number, v: number) {
  const t = u * Math.PI * 4; // twice around: the knot winds 2 times
  const here = knotCurve(t);
  const next = knotCurve(t + 0.01);
  // A frame that travels along the curve: forward, side, up (as in three's TorusKnotGeometry).
  const forward = next.clone().sub(here);
  const sum = next.clone().add(here);
  const up = new THREE.Vector3().crossVectors(forward, sum).normalize();
  const side = new THREE.Vector3().crossVectors(up, forward).normalize();
  return tubePoint(here, side, up, 0.3, v); // tube 0.3
}

// All grid points of one shape, as x, y, z, x, y, z, ... Made once per shape and grid size, then kept.
const cache = new Map<string, Float32Array>();
export function shapePositions(name: GeometryName, { U, V }: Detail): Float32Array {
  const key = `${name} ${U}x${V}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const planes = ["sphere", "torus", "torusKnot", "humanoid"].includes(name) ? [] : planesOf(convexGeometry(name));
  const positions = new Float32Array((U + 1) * (V + 1) * 3);
  let k = 0;
  for (let j = 0; j <= V; j++) {
    for (let i = 0; i <= U; i++) {
      const u = i / U;
      const v = j / V;
      let point: THREE.Vector3;
      if (name === "sphere") point = direction(u, v).multiplyScalar(1.3);
      else if (name === "torus") point = torusPoint(u, v);
      else if (name === "torusKnot") point = torusKnotPoint(u, v);
      else if (name === "humanoid") point = humanPoint(u, v); // see humanoid.ts
      else point = direction(u, v).multiplyScalar(distanceToSurface(direction(u, v), planes));
      positions[k++] = point.x;
      positions[k++] = point.y;
      positions[k++] = point.z;
    }
  }
  cache.set(key, positions);
  return positions;
}

// The shared grid as a geometry: the points of `name`, joined into triangles, two per grid square.
export function createMorphGeometry(name: GeometryName, detail: Detail) {
  const { U, V } = detail;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(shapePositions(name, detail).slice(), 3));
  const index: number[] = [];
  for (let j = 0; j < V; j++) {
    for (let i = 0; i < U; i++) {
      const a = j * (U + 1) + i;
      const b = a + U + 1; // the point below a
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}
