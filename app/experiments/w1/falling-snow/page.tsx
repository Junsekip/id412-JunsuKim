"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

interface Snowflake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  speed: number;
  opacity: number;
  mass: number;
}

export default function FallingSnow() {
  const [snowSize, setSnowSize] = useState(1);
  const [snowCount, setSnowCount] = useState(200);
  const snowSizeRef = useRef(1);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const prevMousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const mouseVel = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    snowSizeRef.current = snowSize;
  }, [snowSize]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      prevMousePos.current = mousePos.current;
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Calculate cursor velocity
      mouseVel.current = {
        x: mousePos.current.x - prevMousePos.current.x,
        y: mousePos.current.y - prevMousePos.current.y,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const snowflakes: Snowflake[] = [];

    // Initialize snowflakes
    for (let i = 0; i < snowCount; i++) {
      const baseSize = Math.random() * 3 + 2;
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: Math.random() * 2 + 1,
        size: baseSize,
        baseSize: baseSize,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.5,
        mass: 1,
      });
    }

    const drawSnowflakes = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

      snowflakes.forEach((flake) => {
        // Count nearby particles to grow size
        let nearbyCount = 0;
        const clumpingDistance = flake.size * 8;

        snowflakes.forEach((other) => {
          if (flake !== other) {
            const dx = other.x - flake.x;
            const dy = other.y - flake.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < clumpingDistance) {
              nearbyCount++;
            }
          }
        });

        // Grow size based on nearby particles
        const maxMass = 1 + nearbyCount * 0.15;
        flake.mass += (maxMass - flake.mass) * 0.05;
        flake.size = flake.baseSize * Math.sqrt(flake.mass);

        // Calculate distance to mouse
        const dx = mousePos.current.x - flake.x;
        const dy = mousePos.current.y - flake.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate cursor speed
        const cursorSpeed = Math.sqrt(mouseVel.current.x ** 2 + mouseVel.current.y ** 2);
        const throwThreshold = 15;

        // Apply throwing force only to gathered snowballs (mass > 1)
        if (cursorSpeed > throwThreshold && distance < 350 && flake.mass > 1) {
          const throwForce = (cursorSpeed - throwThreshold) * 0.8;
          flake.vx += mouseVel.current.x * throwForce * 0.1;
          flake.vy += mouseVel.current.y * throwForce * 0.1;
        }

        // Apply attraction force toward cursor
        const attractionRange = 300;
        const attractionStrength = 0.3;

        if (distance < attractionRange) {
          const force = (1 - distance / attractionRange) * attractionStrength;
          flake.vx += (dx / distance) * force;
          flake.vy += (dy / distance) * force;
        }

        // Gravity
        flake.vy += flake.speed * 0.02;

        // Damping
        flake.vx *= 0.98;
        flake.vy *= 0.98;

        // Update position
        flake.x += flake.vx;
        flake.y += flake.vy;

        // Wrap around and reset
        if (flake.y > canvas.height + 50 || flake.x < -50 || flake.x > canvas.width + 50) {
          flake.y = -flake.size * snowSizeRef.current;
          flake.x = Math.random() * canvas.width;
          flake.vx = 0;
          flake.vy = Math.random() * 2 + 1;
          flake.mass = 1;
        }

        // Wrap horizontally
        if (flake.x < 0) flake.x = canvas.width;
        if (flake.x > canvas.width) flake.x = 0;

        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size * snowSizeRef.current, 0, Math.PI * 2);
        ctx.fill();
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
  }, [snowCount]);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.sliderContainer}>
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
        <div className={styles.slider}>
          <label htmlFor="snowCount">Count: {snowCount}</label>
          <input
            id="snowCount"
            type="range"
            min="10"
            max="500"
            step="10"
            value={snowCount}
            onChange={(e) => setSnowCount(parseInt(e.target.value))}
            className={styles.sliderInput}
          />
        </div>
      </div>
    </main>
  );
}
