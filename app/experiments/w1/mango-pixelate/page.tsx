"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// The mango drawn on a canvas as wide as the window, then turned into an LED board:
// the picture is cut into square blocks, and each block becomes one round dot of one colour on black.
// Around the mouse, the dots show their reverse colour (255 − r, 255 − g, 255 − b).
// The faster the mouse moves, the larger that circle; when it stops, only the dot under it and its neighbours.
const GLOW = 10; // px, how far the light of each dot spreads (shadowBlur); 0 = no glow
const SPEED_GAIN = 6; // px of radius added per px the mouse moved in one frame
const MAX_RADIUS = 300; // px, the largest the circle gets
const EASE = 0.15; // 0..1, how fast the circle grows and shrinks to its new size
const IMAGE = "/experiments/w1/mango-pixelate/mango.jpg"; // 1920 × 1280

type Dot = { x: number; y: number; r: number; g: number; b: number };

// One glowing dot: a filled circle whose "shadow" is a blur in its own colour.
function drawDot(context: CanvasRenderingContext2D, x: number, y: number, radius: number, colour: string) {
  context.fillStyle = colour;
  context.shadowColor = colour;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

export default function MangoPixelate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Visual settings, changed in the options panel (lower-right corner).
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [pixel, setPixel] = useState(20); // 5 to 60 px, the grid interval: the size of one block; less = denser
  const [dot, setDot] = useState(0.8); // 0.1 to 1, dot size relative to its block; less = more black between the dots

  // Runs again every time `pixel` or `dot` changes, so the board is rebuilt with the new settings.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    // The board: all the dots, drawn once into a second canvas that is never on screen.
    // Every frame copies it to the real canvas, then redraws only the dots near the mouse.
    const board = document.createElement("canvas");
    const boardContext = board.getContext("2d", { willReadFrequently: true })!;
    const image = new Image();
    image.src = IMAGE;

    let dpr = 1;
    let block = 0; // size of one block, in canvas pixels
    let radius = 0; // radius of one dot, in canvas pixels
    let dots: Dot[] = []; // every dot's centre and colour, to find the ones near the mouse
    const mouse = { x: -9999, y: -9999 }; // in canvas pixels; far away until the mouse moves in
    const last = { x: -9999, y: -9999 }; // where the mouse was in the previous frame
    let reach = 0; // radius of the reversed circle right now, in canvas pixels
    let frame = 0;

    function build() {
      // 1. Size: the window's width, and the height that keeps the photo's shape. × dpr for sharp edges.
      dpr = window.devicePixelRatio;
      const width = window.innerWidth;
      const height = width * (image.height / image.width);
      canvas.width = board.width = width * dpr;
      canvas.height = board.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // 2. Draw the photo on the board, then read back the colour of every pixel.
      boardContext.drawImage(image, 0, 0, board.width, board.height);
      const pixels = boardContext.getImageData(0, 0, board.width, board.height).data; // r, g, b, a, r, g, b, a, ...

      // 3. Paint the board black, then one glowing dot per block, in the colour at the centre of that block.
      boardContext.fillStyle = "black";
      boardContext.fillRect(0, 0, board.width, board.height);
      block = pixel * dpr;
      radius = (block / 2) * dot;
      dots = [];
      boardContext.shadowBlur = GLOW * dpr;
      for (let y = 0; y < board.height; y += block) {
        for (let x = 0; x < board.width; x += block) {
          const cx = Math.min(Math.floor(x + block / 2), board.width - 1);
          const cy = Math.min(Math.floor(y + block / 2), board.height - 1);
          const i = (cy * board.width + cx) * 4; // 4 numbers per pixel
          const d = { x: cx, y: cy, r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
          dots.push(d);
          drawDot(boardContext, d.x, d.y, radius, `rgb(${d.r}, ${d.g}, ${d.b})`);
        }
      }
    }

    function draw() {
      // The whole board, as it is.
      context.drawImage(board, 0, 0);

      // Speed: how far the mouse moved since the last frame. Then the radius it asks for:
      // still → 1.5 blocks (the dot under the mouse and its 8 neighbours), faster → larger, up to MAX_RADIUS.
      const speed = Math.hypot(mouse.x - last.x, mouse.y - last.y) / dpr; // px per frame
      last.x = mouse.x;
      last.y = mouse.y;
      const target = Math.min(block * 1.5 + speed * SPEED_GAIN * dpr, MAX_RADIUS * dpr);
      reach += (target - reach) * EASE; // a little of the way each frame, so the circle does not jump

      // The dots inside that circle, reversed.
      const near = dots.filter((d) => Math.hypot(d.x - mouse.x, d.y - mouse.y) < reach);
      // First black out their blocks (hides the original dot and its glow)...
      context.fillStyle = "black";
      for (const d of near) context.fillRect(d.x - block / 2, d.y - block / 2, block, block);
      // ...then draw each one again in its reverse colour.
      context.shadowBlur = GLOW * dpr;
      for (const d of near) drawDot(context, d.x, d.y, radius, `rgb(${255 - d.r}, ${255 - d.g}, ${255 - d.b})`);
      context.shadowBlur = 0;

      frame = requestAnimationFrame(draw);
    }

    // Mouse position on the page → position on the canvas (the canvas may be scrolled, and is × dpr).
    function onPointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) * dpr;
      mouse.y = (event.clientY - rect.top) * dpr;
      // Just came in from outside: start from here, so the jump in does not count as speed.
      if (last.x === -9999) {
        last.x = mouse.x;
        last.y = mouse.y;
      }
    }
    // Mouse left the window: nothing is reversed.
    function onPointerLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    image.onload = () => {
      build();
      draw();
    };
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [pixel, dot]);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.credit}>
        Photo:{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Mango_fruit_Nam_Dok_Mai.jpg">Ivar Leidus</a>,{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      </p>

      <div className={styles.panel}>
        {optionsOpen && (
          <div className={styles.controls}>
            <label>
              Grid
              <input type="range" min={5} max={60} step={1} value={pixel} onChange={(e) => setPixel(Number(e.target.value))} />
              <span>{pixel}px</span>
            </label>
            <label>
              Dot
              <input type="range" min={0.1} max={1} step={0.05} value={dot} onChange={(e) => setDot(Number(e.target.value))} />
              <span>{Math.round(dot * 100)}%</span>
            </label>
          </div>
        )}

        {/* Options: the sliders. Lit while the panel is open. */}
        <button
          className={optionsOpen ? `${styles.toggle} ${styles.active}` : styles.toggle}
          onClick={() => setOptionsOpen(!optionsOpen)}
          aria-label="Options"
          title="Options"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h16M4 12h16M4 17h16" />
            <circle cx="9" cy="7" r="2" fill="currentColor" />
            <circle cx="15" cy="12" r="2" fill="currentColor" />
            <circle cx="7" cy="17" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>
    </main>
  );
}
