# Creation

Pulsing rings of coloured light from the centre of the screen: a port of "Creation" by Danilo Guanabara (Shadertoy XsXXDn), our starting point for editing a shader.

- Route: /experiments/w1/glsl/creation
- Week: W1 · Tech: GLSL (WebGL2, no Three.js)
- Inputs: time
- Parameters: `z += 0.07` (red/green/blue time offset), `9.0` (ring count), `0.01` (dot brightness), `mod(uv, 1.0)` (tile size)

## How it works
- `shader.ts` (GLSL), `renderer.ts` (WebGL2 setup, copied from `hello-fragment-shader`), `page.tsx` (canvas and loop).
- Shadertoy names were renamed to ours: `iTime` → `u_time`, `iResolution` → `u_resolution`, `fragCoord` → `gl_FragCoord`, `fragColor` → `outputColor`.
- The loop runs three times, once per colour channel, each 0.07 later in time, so red, green and blue drift apart.
- Each pass pushes uv away from the centre in pulsing rings, tiles it with `mod`, and lights a dot in each tile's centre. Dividing by the distance `l` makes the centre brightest.
- Alpha is 1 instead of the original `t`; Shadertoy ignores alpha, the browser does not.
- Credit: the author asks for it when the shader is reused, so the credit line stays on the page.

## Run
pnpm dev → http://localhost:3000/experiments/w1/glsl/creation

## Status / next
Works, same as the original. Next: edit it — feed `u_mouse` into the centre, change the ring count, or shift the colours.
