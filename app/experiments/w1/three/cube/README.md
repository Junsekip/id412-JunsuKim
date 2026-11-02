# Cube

The first Three.js scene: a block of 8 × 8 × 8 = 512 shapes in a soft grey studio above a grid floor, each turning on the spot a little after its neighbour, so the turning ripples through the block. Two panels in the lower-right corner: Shape sets how many per axis (1–8) and picks the geometry (box, sphere, torus, torus knot, a humanoid figure and 7 more) and all of them morph from the old shape into the new one with a spring; Options changes the material (colour, roughness, metal, clearcoat, glass, opacity, glow, wireframe). Drag to orbit, scroll to zoom.

- Route: /experiments/w1/three/cube
- Week: W1 · Tech: Three.js (`@react-three/fiber`, `@react-three/drei`), `@react-spring/three`
- Inputs: mouse drag and scroll (orbit), Shape and Options panels, time
- Parameters: Grid (1–8 per axis, default 8), geometry (12 shapes); Colour, Rough, Metal, Coat, Glass, Opacity (0–1), Glow (0–2), Wire; BLOCK (8 units), SPEED (0.3 rad/s), WAVE (0.35 rad per neighbour) and SPRING (tension 50, friction 11) in `Shapes.tsx`; FINE (200 × 128) and COARSE (80 × 48) grids in `morph.ts`

## How it works
- `page.tsx` is the scene: `<Canvas>` with two lights, the studio (`Environment`), the shape, a `gridHelper` floor and `OrbitControls`; plus the chosen geometry and material (React state) and the two panels (one open at a time).
- Morphing needs every shape to have the same points in the same order. `morph.ts` rebuilds all of them on one shared U × V grid, like longitude and latitude on a globe:
  - convex shapes (box, cone, cylinder, capsule, the polyhedra): a ray from the centre goes out in each grid direction until it leaves three's own geometry of that shape;
  - torus and torus knot: the grid is wrapped as a tube along a ring or along the knot's curve;
  - humanoid (`humanoid.ts`): a smooth statue made of ~30 ellipsoids and tapered tubes, blended together. It is cut into horizontal slices; in each, a ray steps in from outside until it touches the body. Arms rest against the body and the legs are together, because one wrapped surface would bridge any gap with a web.
- `Shapes.tsx`: one `InstancedMesh` draws every copy in one draw call from one geometry; each copy only has its own matrix (position, turn, size), set every frame. One geometry for the whole time (a new Grid value makes a new `Shapes`). On a new shape, `useSpring` (react-spring) runs `progress` 0 → 1, overshooting a little; every frame each point = from + (to − from) × progress, then the normals are recomputed. Because all copies share the geometry, one morph moves all 512. A new click mid-morph starts from where the points are.
- `meshPhysicalMaterial`: colour, roughness, metalness + clearcoat (varnish), transmission (glass), opacity, emissive (glow), wireframe (shows the shared grid's triangles, not the shape's own).
- Performance: from 4 per axis the shared grid is COARSE (4 000 points instead of 26 000), so 512 copies are ~2 million points. Glass renders the scene a second time to look through; `transmissionResolutionScale = 0.5` (in `page.tsx`) does that at half size. `frustumCulled` is off because three would judge the whole block by the one shape at its centre.
- Studio: `Environment` with a few `Lightformer` panels, built in the browser, shown blurred as the background. Metal reflects it, glass bends what is behind it.

## Run
pnpm dev → http://localhost:3000/experiments/w1/three/cube

## Status / next
Works. Measured on the laptop with 512 shapes: 60 fps still, 55–59 fps while morphing, ~51 fps with glass. The first time a shape is chosen its points are computed (humanoid ≈ 0.3 s), then cached. Box and polyhedra edges are slightly jagged where the grid does not meet the edge exactly. Next: let the morph ripple through the block (each copy starting a little later), or morph on a timer through all shapes.
