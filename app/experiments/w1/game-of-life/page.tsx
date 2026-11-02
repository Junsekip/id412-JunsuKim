"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// Conway's Game of Life on a full-window grid. Each step, every cell looks at its 8 neighbours:
// a live cell with 2 or 3 live neighbours stays alive, a dead cell with exactly 3 comes alive, all others die.
const CELL = 8; // px, the size of one cell
const STEP_MS = 80; // ms between two generations
const DENSITY = 0.25; // 0..1, share of live cells in a random start
const FADE = 0.15; // 0..1, how much of its light a dead cell loses each frame; 1 = no trail
const COLOUR = "#7cf2b0"; // live cells

export default function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;

    let cols = 0;
    let rows = 0;
    let grid = new Uint8Array(0); // 1 = alive, 0 = dead; cell (x, y) is grid[y * cols + x]
    let light = new Float32Array(0); // 0..1 per cell, what is drawn: 1 while alive, fades after it dies
    let generation = 0;
    let running = true;
    let drawing = false; // mouse button held down
    let last = { x: 0, y: 0 }; // the cell the mouse was over last time
    let lastStep = 0;
    let frame = 0;

    function randomise() {
      for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < DENSITY ? 1 : 0;
      generation = 0;
    }

    function clear() {
      grid.fill(0);
      generation = 0;
    }

    // Window size → canvas size and grid size. A resize starts a new random grid.
    function resize() {
      const dpr = window.devicePixelRatio;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(window.innerWidth / CELL);
      rows = Math.ceil(window.innerHeight / CELL);
      grid = new Uint8Array(cols * rows);
      light = new Float32Array(cols * rows);
      randomise();
    }

    // One generation: count the neighbours of every cell in the old grid, write the result into a new one.
    function step() {
      const next = new Uint8Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let neighbours = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              // Wrap around the edges: the left edge touches the right, the top touches the bottom.
              const nx = (x + dx + cols) % cols;
              const ny = (y + dy + rows) % rows;
              neighbours += grid[ny * cols + nx];
            }
          }
          const alive = grid[y * cols + x] === 1;
          next[y * cols + x] = (alive && (neighbours === 2 || neighbours === 3)) || (!alive && neighbours === 3) ? 1 : 0;
        }
      }
      grid = next;
      generation++;
    }

    function draw(time: number) {
      if (running && time - lastStep >= STEP_MS) {
        step();
        lastStep = time;
      }

      // Light: 1 for live cells; a dead cell keeps fading towards 0, so it leaves a short trail.
      for (let i = 0; i < grid.length; i++) {
        light[i] = grid[i] ? 1 : light[i] * (1 - FADE);
      }

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = COLOUR;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          if (light[i] < 0.02) continue; // too faint to see
          context.globalAlpha = light[i];
          context.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1); // -1: a thin gap between cells
        }
      }
      context.globalAlpha = 1;

      statusRef.current!.textContent = `generation ${generation}${running ? "" : " · paused"}`;
      frame = requestAnimationFrame(draw);
    }

    // Mouse: hold the button down and drag to bring cells to life.
    // A fast mouse jumps several cells between two events, so every cell on the line from the last one is filled.
    function paint(event: PointerEvent) {
      const x = Math.floor(event.clientX / CELL);
      const y = Math.floor(event.clientY / CELL);
      const steps = Math.max(Math.abs(x - last.x), Math.abs(y - last.y), 1);
      for (let k = 0; k <= steps; k++) {
        const cx = Math.round(last.x + ((x - last.x) * k) / steps);
        const cy = Math.round(last.y + ((y - last.y) * k) / steps);
        if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) grid[cy * cols + cx] = 1;
      }
      last = { x, y };
    }
    function onPointerDown(event: PointerEvent) {
      drawing = true;
      last = { x: Math.floor(event.clientX / CELL), y: Math.floor(event.clientY / CELL) };
      paint(event);
    }
    function onPointerMove(event: PointerEvent) {
      if (drawing) paint(event);
    }
    function onPointerUp() {
      drawing = false;
    }

    // Keys: space = pause / play, r = random, c = clear.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === " ") {
        event.preventDefault();
        running = !running;
      }
      if (event.key === "r") randomise();
      if (event.key === "c") clear();
    }

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.caption}>
        <span ref={statusRef} />
        <br />
        drag: draw · space: pause · r: random · c: clear
      </p>
    </main>
  );
}
