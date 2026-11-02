"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderer, type Renderer } from "./renderer";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import styles from "./page.module.css";

// "Creation" by Danilo Guanabara, with the webcam inside every tile of the pulsing grid.
export default function CreationWebcam() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState(false);

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

    // The webcam plays into a <video> that is never put on the page; the renderer copies its frames.
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    let stream: MediaStream | null = null;
    let stopped = false;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 } })
      .then((cameraStream) => {
        if (stopped) {
          cameraStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = cameraStream;
        video.srcObject = cameraStream;
        return video.play();
      })
      .catch(() => setCameraError(true)); // no camera, or permission denied

    const resize = () => {
      renderer.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2));
    };
    let frame = 0;
    const render = (now: number) => {
      renderer.render(now / 1000, { x: 0.5, y: 0.5 }, video);
      frame = requestAnimationFrame(render);
    };

    addEventListener("resize", resize);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      stopped = true;
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop()); // turn the camera light off
      renderer.destroy();
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {cameraError && <p className={styles.message}>No camera: allow camera access for this page and reload.</p>}
      <p className={styles.credit}>
        Based on &ldquo;Creation&rdquo; by{" "}
        <a href="http://www.pouet.net/prod.php?which=57245">Danilo Guanabara</a> ·{" "}
        <a href="https://www.shadertoy.com/view/XsXXDn">Shadertoy</a>
      </p>
    </main>
  );
}
