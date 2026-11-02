# Mango Pixelate

The mango photo drawn on a canvas as wide as the browser window, then turned into an LED board: one glowing round dot of one colour per block, on black. Around the mouse, the dots turn to their reverse colour: only the nearest dots when the mouse is still, a larger circle the faster it moves.

- Route: /experiments/w1/mango-pixelate
- Week: W1 · Tech: Canvas
- Inputs: mouse position and speed, window size, options panel
- Parameters: Grid (interval between dots = block size, 5–60 px, default 20), Dot (dot size relative to its block, 10–100 %, default 80 %, in the options panel), GLOW (glow spread in px, default 10), SPEED_GAIN (radius px per px/frame of mouse speed, default 6), MAX_RADIUS (default 300 px), EASE (default 0.15)

## How it works
- `new Image()` loads `mango.jpg`; when it has loaded, `build()` draws all the dots once into `board`, a second canvas that is never on screen. Again on every `resize`.
- The canvas is the window's width, and its height keeps the photo's 3:2 shape. Both × `devicePixelRatio` for sharp edges.
- `drawImage` paints the photo on the board, `getImageData` reads back every pixel as four numbers (r, g, b, a).
- The board is then painted black. Two loops walk it in steps of Grid (`pixel`); each block takes the colour of its centre pixel and gets one dot there with `arc` + `fill`.
- The black gap between the dots is what makes it look like LEDs. Smaller Dot = bigger gaps.
- Each dot glows: `shadowColor` is set to the dot's own colour and `shadowBlur` to `GLOW`, so the canvas draws a soft blur of light around it.
- Every frame (`requestAnimationFrame`), `draw()` copies the board to the screen, then takes the dots within the current radius of the mouse, blacks out their blocks and draws them again in the reverse colour (255 − r, 255 − g, 255 − b). Only those dots are redrawn, so it stays smooth.
- Radius: speed = how far the mouse moved since the last frame. Target = 1.5 blocks (the dot under the mouse and its 8 neighbours) + speed × SPEED_GAIN, capped at MAX_RADIUS. The radius moves EASE of the way to the target each frame, so it grows and shrinks smoothly.
- The options button (sliders icon, lower-right, same look as `mango-grid`) opens the Grid and Dot sliders. `pixel` and `dot` are React state; the effect depends on both, so every change rebuilds the board. Smaller Grid = more, denser dots.
- The photo is a copy of the one in `mango-image` (Ivar Leidus, Wikimedia Commons, CC BY-SA 4.0); keep the credit line.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-pixelate

## Status / next
Works. Settings reset on reload. Very small Grid values draw tens of thousands of glowing dots, so the slider may lag there. Next: let reversed dots fade back slowly, so the mouse leaves a trail.
