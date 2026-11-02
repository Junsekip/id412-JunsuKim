"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function FallingSnow() {
  const [snowSize, setSnowSize] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const snowflakes: Snowflake[] = [];
    const snowflakeCount = 200;

    // Initialize snowflakes
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 2,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }

    const drawSnowflakes = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

      snowflakes.forEach((flake) => {
        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size * snowSize, 0, Math.PI * 2);
        ctx.fill();

        flake.y += flake.speed;

        if (flake.y > canvas.height) {
          flake.y = -flake.size * snowSize;
          flake.x = Math.random() * canvas.width;
        }
      });

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawSnowflakes();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.slider}>
        <label htmlFor="snowSize">Size: {snowSize.toFixed(1)}x</label>
        <input
          id="snowSize"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={snowSize}
          onChange={(e) => setSnowSize(parseFloat(e.target.value))}
          className={styles.sliderInput}
        />
      </div>
    </main>
  );
}
