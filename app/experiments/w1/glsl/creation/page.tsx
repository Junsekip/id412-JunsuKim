"use client";

import { useEffect, useRef } from "react";
import { createRenderer, type Renderer } from "./renderer";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import styles from "./page.module.css";

// "Creation" by Danilo Guanabara: pulsing coloured rings from one fragment shader, driven by time.
export default function Creation() {
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

    const resize = () => {
      renderer.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2));
    };
    let frame = 0;
    const render = (now: number) => {
      renderer.render(now / 1000, { x: 0.5, y: 0.5 });
      frame = requestAnimationFrame(render);
    };

    addEventListener("resize", resize);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      renderer.destroy();
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.credit}>
        &ldquo;Creation&rdquo; by{" "}
        <a href="http://www.pouet.net/prod.php?which=57245">Danilo Guanabara</a> ·{" "}
        <a href="https://www.shadertoy.com/view/XsXXDn">Shadertoy</a>
      </p>
    </main>
  );
}
