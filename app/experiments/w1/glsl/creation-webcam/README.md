# Creation Webcam

"Creation" by Danilo Guanabara with your face in it: the webcam fills every tile of the pulsing, warping grid, split into red, green and blue, with the original bright dots on top.

- Route: /experiments/w1/glsl/creation-webcam
- Week: W1 · Tech: GLSL (WebGL2, no Three.js), webcam (`getUserMedia`) as a texture
- Inputs: webcam, time
- Parameters: FACE (0.8, webcam strength), GLOW (0.01, original dot), `l + 0.5` (how much brighter the centre is), `9.0` (ring count), `z += 0.07` (channel offset)

## How it works
- Same three files as `creation`; the shader is the same loop with one line changed. The clean port stays in `../creation`.
- `page.tsx` asks for the webcam with `getUserMedia` and plays it into a `<video>` that is never on the page. The camera stops when you leave.
- `renderer.ts` (from `hello-fragment-shader`) has one texture added, as in `face-voronoi`; every frame `texImage2D` copies the current video frame into it. `UNPACK_FLIP_Y_WEBGL` keeps the face upright.
- In the shader, `mod(uv, 1.0)` is the tile coordinate (0..1). `camera(tile)` reads the middle square of the webcam there, mirrored. Each of the 3 passes takes one colour channel, and the channels are warped a little differently, so the face splits into colours.
- Credit: the author asks for it when the shader is reused, so the credit line stays on the page.

## Run
pnpm dev → http://localhost:3000/experiments/w1/glsl/creation-webcam, allow the camera.

## Status / next
Works. Next: let the mouse move the centre, or use the face's brightness to push the rings.
