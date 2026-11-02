"use client";

import { useEffect, useRef } from "react";
import { drawComposition, makeComposition } from "./composition";
import styles from "./page.module.css";

// A new Kandinsky-like composition on every click: circles, triangles, lines, arcs and a checkerboard.
// The shapes are made in composition.ts; this page only sizes the canvas and redraws.
export default function KandinskyComposition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    let shapes = makeComposition();

    function draw() {
      // Full window, × dpr for sharp edges; then draw in CSS pixels.
      const dpr = window.devicePixelRatio;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawComposition(context, shapes, window.innerWidth, window.innerHeight);
    }

    // Click: throw the old shapes away and make new ones.
    function onClick() {
      shapes = makeComposition();
      draw();
    }

    draw();
    window.addEventListener("resize", draw);
    canvas.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("resize", draw);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.caption}>Click for a new composition · after Wassily Kandinsky</p>
    </main>
  );
}
