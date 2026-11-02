# Noise Field

A slowly flowing field of colour, like marbled ink: noise layered on noise and bent by itself. Around the mouse the field swirls harder.

- Route: /experiments/w1/glsl/noise-field
- Week: W1 · Tech: GLSL (WebGL2, no Three.js)
- Inputs: mouse position, time
- Parameters: SCALE (3), OCTAVES (5), SPEED (0.08), WARP (1.5), LENS (2, extra warp at the mouse), the `palette()` vectors

## How it works
- `shader.ts` (GLSL), `renderer.ts` (WebGL2 setup, copied from `hello-fragment-shader`), `page.tsx` (canvas, loop, mouse).
- Four steps in the shader, each one function:
  1. `noise()`: a random value per grid point (`random()`), blended smoothly between the 4 corners.
  2. `fbm()`: OCTAVES layers of noise, each twice as fine and half as strong. Gives clouds instead of blobs.
  3. Domain warp: two fbm values make an offset `q`, and the field is read again at `p + WARP * q`. That is what makes it look like flowing ink.
  4. `palette()`: a cosine palette turns the 0..1 field into colour.
- Time slides the noise inputs, so the field flows. The mouse adds LENS to the warp near it, fading with distance.
- `page.tsx` sends the mouse as 0..1 with y flipped, because the shader's (0,0) is bottom-left.

## Run
pnpm dev → http://localhost:3000/experiments/w1/glsl/noise-field

## Status / next
Works. Next: warp twice (q, then r from q), draw contour lines with `fract(field * 10.0)`, or put the webcam in as in `creation-webcam`.
