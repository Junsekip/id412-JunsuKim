# Game of Life

Conway's Game of Life filling the window: green cells on black, born and dying generation by generation, with a short fading trail. Drag the mouse to draw new cells.

- Route: /experiments/w1/game-of-life
- Week: W1 · Tech: Canvas
- Inputs: mouse drag, keys (space: pause / play, r: random, c: clear), window size, time
- Parameters: CELL (8 px), STEP_MS (80 ms per generation), DENSITY (0.25), FADE (0.15), COLOUR

## How it works
- The grid is one `Uint8Array`, 1 = alive, 0 = dead; cell (x, y) is `grid[y * cols + x]`. `cols` and `rows` = window size / CELL.
- `step()` counts each cell's 8 neighbours in the old grid and writes the new generation into a fresh array: alive with 2 or 3 neighbours stays alive, dead with exactly 3 is born, the rest die. Edges wrap around.
- A `requestAnimationFrame` loop draws every frame, but only calls `step()` every STEP_MS, so the speed does not depend on the screen's refresh rate.
- Trail: a second array, `light`, holds what is drawn. Live cells are 1; a dead cell loses FADE of its light each frame, so it fades out over a few frames. Each cell is drawn with `globalAlpha = light`.
- Pointer down + move sets the cells under the mouse to 1, filling the line from the last position so a fast drag leaves no gaps. A resize starts a new random grid.

## Run
pnpm dev → http://localhost:3000/experiments/w1/game-of-life

## Status / next
Works. Next: colour each cell by its age, or put a speed slider in an options panel.
