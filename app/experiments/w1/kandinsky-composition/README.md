# Kandinsky Composition

A random abstract painting in the style of Kandinsky's *Composition VIII* (1923): cream ground, a dark circle with a coloured glow, ringed circles, triangles, a checkerboard, crossing black lines, arcs and bundles of parallel lines. Click for a new one.

- Route: /experiments/w1/kandinsky-composition
- Week: W1 · Tech: Canvas
- Inputs: click, window size
- Parameters: the counts and size ranges in `makeComposition()`, the palette `COLOURS`, `BACKGROUND`

## How it works
- `composition.ts` has two functions. `makeComposition()` returns a list of shapes made with `Math.random()`. `drawComposition()` paints that list on a canvas.
- Positions are fractions of the canvas (0..1) and sizes fractions of its shorter side, so a resize redraws the same painting at the new size.
- Drawing order is back to front: checkerboards, the glowing circle, triangles, circles, then lines, arcs and bundles in black ink on top.
- Triangles and checkerboards use `globalCompositeOperation = "multiply"`, so where they overlap they mix darker, like transparent paint. Circles are solid, so their rings stay bright. The glow is `shadowBlur`.
- `page.tsx` only sizes the canvas (× `devicePixelRatio`), redraws on `resize`, and makes a new list on click.

## Run
pnpm dev → http://localhost:3000/experiments/w1/kandinsky-composition

## Status / next
Works. Shapes are placed freely, so some compositions are busier than others. Next: let shapes drift slowly over time, or make each shape play a note when clicked (Kandinsky heard colours as sound).
