# Lotte World Tower

Seoul's 555 m tower standing in a small toy city with Seokchon Lake to the north: 123 glass floors that narrow like a brush tip, a dark seam up each face, and an open lattice crown on top. It turns slowly; a Night switch lights the floor lines and the crown. Drag to orbit, scroll to zoom.

- Route: /experiments/w1/three/lotte-world-tower
- Week: W1 · Tech: Three.js (`@react-three/fiber`, `@react-three/drei`)
- Inputs: mouse drag and scroll (orbit), Options panel
- Parameters: Night (on/off), Spin (on/off); HEIGHT (55.5), FLOORS (123), BASE_WIDTH (7), TIP_WIDTH (1.2) and the 1.6 in `widthAt` in `Tower.tsx`

## How it works
- 1 unit = 10 m. `widthAt(h)` gives the tower's width at any height: that one function is the whole silhouette.
- `Tower.tsx` makes one floor shape (a rounded square, `ExtrudeGeometry`, 1 × 1 × 1) and draws it 123 times with an `instancedMesh`: each copy only gets its own height and width. One draw call instead of 123.
- A second instanced mesh of the same shape makes the thin bright slab between floors; a third, of thin boxes, makes the seam at the middle of each face.
- The crown is `lineSegments`: crossing diagonals on four faces, computed from the same `widthAt`.
- `City.tsx`: ground, lake (two squashed circles), the mall as two boxes, and random low blocks from a fixed seed so the city is the same on every reload.
- Night only changes colours, light strength and `emissiveIntensity` (how much a material glows by itself).

## Run
pnpm dev → http://localhost:3000/experiments/w1/three/lotte-world-tower

## Status / next
Works. The shape is a simplification (the real plan has slightly curved sides). Next: random lit windows per floor at night, or a camera that flies up the tower.
