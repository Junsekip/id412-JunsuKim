"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const paintings = [
  { name: "The Scream", artist: "Edvard Munch", year: "1893" },
  { name: "Mona Lisa", artist: "Leonardo da Vinci", year: "1503-1519" },
  { name: "Girl with a Pearl Earring", artist: "Johannes Vermeer", year: "1665" },
  { name: "The Kiss", artist: "Gustav Klimt", year: "1908" },
  { name: "The Pied Piper of Hamelin", artist: "Traditional (Illustrated)", year: "Various" },
];

export default function PaintingsCarousel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % paintings.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw based on current painting
    switch (currentIndex) {
      case 0:
        drawScream(ctx, canvas.width, canvas.height);
        break;
      case 1:
        drawMonaLisa(ctx, canvas.width, canvas.height);
        break;
      case 2:
        drawGirlWithPearl(ctx, canvas.width, canvas.height);
        break;
      case 3:
        drawTheKiss(ctx, canvas.width, canvas.height);
        break;
      case 4:
        drawPiedPiper(ctx, canvas.width, canvas.height);
        break;
    }
  }, [currentIndex]);

  return (
    <main className={styles.container}>
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} width={800} height={900} className={styles.canvas} />
      </div>
      <div className={styles.info}>
        <h2>{paintings[currentIndex].name}</h2>
        <p>{paintings[currentIndex].artist}</p>
        <p className={styles.year}>{paintings[currentIndex].year}</p>
      </div>
      <div className={styles.dots}>
        {paintings.map((_, idx) => (
          <div
            key={idx}
            className={`${styles.dot} ${idx === currentIndex ? styles.active : ""}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </main>
  );
}

function drawScream(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Background - swirling sky
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#e74c3c");
  gradient.addColorStop(0.5, "#f39c12");
  gradient.addColorStop(1, "#8b0000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Swirling lines
  ctx.strokeStyle = "rgba(139, 0, 0, 0.3)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 50 + i * 30, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Figure
  ctx.fillStyle = "#c9a876";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 3, 50, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = "#8b0000";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 15, h / 3 - 20, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w / 2 + 15, h / 3 - 20, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Open mouth - the scream
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 3 + 30, 40, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hands
  ctx.fillStyle = "#c9a876";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 60, h / 3, 25, 40, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w / 2 + 60, h / 3, 25, 40, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(w / 2 - 40, h / 3 + 100, 80, 150);
}

function drawMonaLisa(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Background - landscape
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(1, "#2d5016");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Distance landscape
  ctx.fillStyle = "rgba(45, 80, 22, 0.6)";
  ctx.fillRect(0, h / 2, w, h / 2);

  // Figure body
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2.5, 60, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#e8b8a0";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 3, 55, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = "#3d2817";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 3 - 10, 60, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#2d1810";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 20, h / 3 - 10, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w / 2 + 20, h / 3 - 10, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle smile
  ctx.strokeStyle = "#8b6f47";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, h / 3 + 15, 25, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Hands
  ctx.fillStyle = "#e8b8a0";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 50, h / 2 + 40, 20, 35, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w / 2 + 50, h / 2 + 40, 20, 35, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawGirlWithPearl(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark background
  ctx.fillStyle = "#2c2417";
  ctx.fillRect(0, 0, w, h);

  // Face
  ctx.fillStyle = "#d9a697";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2.5, 65, 85, 0, 0, Math.PI * 2);
  ctx.fill();

  // Turban - yellow cloth
  ctx.fillStyle = "#f4d03f";
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2.5 - 80, 75, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Turban shadows
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(w / 2 + 20, h / 2.5 - 85, 40, 35, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Blue cloth on shoulder
  ctx.fillStyle = "#4a7c9e";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 70, h / 2.5 + 40);
  ctx.quadraticCurveTo(w / 2 - 100, h / 2.5 + 100, w / 2 - 80, h / 2.5 + 150);
  ctx.quadraticCurveTo(w / 2, h / 2.5 + 140, w / 2 + 20, h / 2.5 + 100);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 20, h / 2.5 - 10, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w / 2 + 20, h / 2.5 - 10, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye whites
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 20, h / 2.5 - 8, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w / 2 + 20, h / 2.5 - 8, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lips
  ctx.fillStyle = "#c97a7a";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2.5 + 20, 15, 0.2, Math.PI - 0.2);
  ctx.fill();

  // Pearl earring
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(w / 2 + 65, h / 2.5 + 20, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e8e8e8";
  ctx.beginPath();
  ctx.arc(w / 2 + 65, h / 2.5 + 20, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(w / 2 + 60, h / 2.5 + 15, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawTheKiss(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Gold background
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#d4af37");
  gradient.addColorStop(1, "#aa8c2c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Geometric patterns
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 30, 30);
  }

  // Male figure (left)
  ctx.fillStyle = "#8b7355";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 60, h / 2, 50, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  // Female figure (right)
  ctx.fillStyle = "#c9a876";
  ctx.beginPath();
  ctx.ellipse(w / 2 + 60, h / 2, 50, 70, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heads
  ctx.fillStyle = "#b8956a";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 60, h / 2 - 100, 40, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d4a876";
  ctx.beginPath();
  ctx.ellipse(w / 2 + 60, h / 2 - 100, 40, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  // The kiss
  ctx.strokeStyle = "#c9a876";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 110, 30, 0, Math.PI * 2);
  ctx.stroke();

  // Arms embracing
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 100, 0, Math.PI * 2);
  ctx.stroke();

  // Decorative elements
  ctx.fillStyle = "#ffd700";
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = w / 2 + Math.cos(angle) * 150;
    const y = h / 2 + Math.sin(angle) * 150;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPiedPiper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Medieval town background
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(0.7, "#e8d5c4");
  gradient.addColorStop(1, "#8b7355");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // Buildings
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(w / 2 - 200, h / 2, 150, 200);
  ctx.fillRect(w / 2 + 100, h / 2 - 50, 150, 250);

  // Windows
  ctx.fillStyle = "#ffeb3b";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(w / 2 - 180 + i * 30, h / 2 + 30 + i * 40, 20, 20);
  }

  // The Pied Piper
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 100, h / 2 - 80, 35, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#e8b8a0";
  ctx.beginPath();
  ctx.ellipse(w / 2 - 100, h / 2 - 150, 32, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hat
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 140, h / 2 - 170);
  ctx.lineTo(w / 2 - 60, h / 2 - 170);
  ctx.lineTo(w / 2 - 100, h / 2 - 210);
  ctx.closePath();
  ctx.fill();

  // Pipe
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(w / 2 - 100, h / 2 - 140, 20, 0, Math.PI);
  ctx.stroke();

  // Children following (simple shapes)
  const childPositions = [
    { x: w / 2 - 40, y: h / 2 - 20 },
    { x: w / 2, y: h / 2 + 20 },
    { x: w / 2 + 50, y: h / 2 - 30 },
    { x: w / 2 + 80, y: h / 2 + 40 },
    { x: w / 2 - 80, y: h / 2 + 50 },
  ];

  childPositions.forEach((pos) => {
    ctx.fillStyle = "#a0522d";
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y - 30, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d4a574";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 60, 15, 0, Math.PI * 2);
    ctx.fill();
  });

  // Musical notes floating
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.font = "30px Arial";
  ctx.fillText("♪", w / 2 + 120, h / 2 - 120);
  ctx.fillText("♫", w / 2 + 160, h / 2 - 70);
  ctx.fillText("♪", w / 2 - 180, h / 2 - 60);
}
