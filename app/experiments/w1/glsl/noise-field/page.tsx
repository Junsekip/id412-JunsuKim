"use client";

import { useEffect, useRef } from "react";
import { createRenderer, type Renderer } from "./renderer";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import styles from "./page.module.css";

// Noise Field: a flowing, self-warping fbm noise in colour. The field swirls around the mouse.
export default function NoiseField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    let renderer: Renderer;
    try {
      renderer = createRenderer(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    } catch (error) {
      console.error(error);
      return;
    }

    // Mouse in 0..1, with y flipped: the shader's (0,0) is bottom-left, the page's is top-left.
    const mouse = { x: 0.5, y: 0.5 };
    const onPointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX / innerWidth;
      mouse.y = 1 - event.clientY / innerHeight;
    };

    const resize = () => {
      renderer.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2));
    };
    let frame = 0;
    const render = (now: number) => {
      renderer.render(now / 1000, mouse);
      frame = requestAnimationFrame(render);
    };

    addEventListener("resize", resize);
    addEventListener("pointermove", onPointerMove);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
      renderer.destroy();
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
