# Solar System

The Sun and its eight planets with real photographic textures, under the Milky Way. Earth has oceans that catch the sunlight, drifting clouds, city lights on its night side, a thin blue atmosphere and the Moon; Saturn has its rings and their shadow. Drag to orbit, scroll to zoom in on any planet.

- Route: /experiments/w1/three/solar-system
- Week: W1 · Tech: Three.js (`@react-three/fiber`, `@react-three/drei`)
- Inputs: mouse drag and scroll (orbit), Options panel, time
- Parameters: Speed (0–10×), Orbits (on/off); `PLANETS` (radius, distance, period, tilt, spin) and YEAR_SECONDS (40) in `Planet.tsx`

## How it works
- `page.tsx`: the Milky Way photo inside a huge ball (`Sky`), almost no ambient light (night sides are near black), the Sun, the planets, `OrbitControls`, the panel.
- `Sun.tsx`: `meshBasicMaterial` (ignores light, it IS the light), two additive glow sprites, and the `pointLight`. Only Saturn and its rings cast shadows: a point light makes shadows grow with distance, the real Sun (a disc) makes them shrink.
- `Planet.tsx`: groups inside groups: orbit → distance → hold (axis keeps pointing the same way: seasons) → tilt → spin. Materials chosen per surface: rock, dust and cloud tops are `meshStandardMaterial` roughness 1, metalness 0; rocky planets reuse their image as a `bumpMap` for craters. Saturn's ring image is a strip, so its UVs are redone: x = distance from the centre.
- `Earth.tsx`: `meshPhongMaterial` because its `specularMap` makes only oceans shiny; `normalMap` for relief; city lights as `emissiveMap`, dimmed on the day side by two lines added to the shader (`onBeforeCompile`). Clouds are a slightly bigger ball with an `alphaMap`. The Moon: matte, `bumpMap` craters, tidally locked.
- `Atmosphere.tsx`: a small shader on a slightly bigger ball, drawn from inside, glowing at the edge on the sunny side (Earth, Venus, gas giants).
- Colour images get `colorSpace = SRGBColorSpace`; data images (normal, specular, clouds) do not.
- Not to scale (real sizes would make the planets invisible dots); orbit periods and axial tilts are real.

## Assets
`public/experiments/w1/three/solar-system/`: 2k textures from Solar System Scope (solarsystemscope.com/textures, CC BY 4.0); Earth normal and specular maps from the three.js examples (MIT).

## Run
pnpm dev → http://localhost:3000/experiments/w1/three/solar-system

## Status / next
Works. Saturn's ring shadow is slightly stepped up close (point-light shadow resolution). Next: click a planet to fly the camera to it.
