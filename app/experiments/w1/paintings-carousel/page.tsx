"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

const defaultPaintings = [
  {
    src: "https://img8.yna.co.kr/etc/inner/KR/2023/03/24/AKR20230324120300805_02_i_P4.jpg",
    name: "Painting 1",
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHSYdKY8bY_NCibikriG_Vixwo4esxd6IXM2_LhdvR8A&s=10",
    name: "Painting 2",
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvELMd1J5YuJ7XylAhm1C2FtudgmTvrFm3UnvkQT3_t0kXZ_7On4ybkbVgTER_2rXsLl8NyXY87jJysxyZEV1qCLG2DvbrC8sPAF0C6CI&s=10",
    name: "Painting 3",
  },
  {
    src: "https://i.namu.wiki/i/OHoLPUH2s0MulHkO-jwynW0zhnUCW3Yyzt3fBkejFdwx4GFZNoaBKdV7Lo1O_5m3p16phgeAeKhSsYtVufAiyw.webp",
    name: "Painting 4",
  },
];

export default function PaintingsCarousel() {
  const searchParams = useSearchParams();
  const [paintings, setPaintings] = useState(defaultPaintings);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const paintingsParam = searchParams.get("paintings");
    if (paintingsParam) {
      const urls = paintingsParam.split(".");
      const parsedPaintings = urls.map((url, idx) => ({
        src: decodeURIComponent(url),
        name: `Painting ${idx + 1}`,
      }));
      setPaintings(parsedPaintings);
    }
  }, [searchParams]);

  const parseEyePositions = () => {
    const eyesParam = searchParams.get("eyes");
    if (!eyesParam) return null;

    // Format: painting1_x1,y1,x2,y2|painting2_x1,y1,x2,y2
    const paintingEyes: { [key: number]: { left: { x: number; y: number }; right: { x: number; y: number } } } = {};
    const positions = eyesParam.split("|");

    positions.forEach((pos, idx) => {
      const [x1Str, y1Str, x2Str, y2Str] = pos.split(",");
      if (x1Str && y1Str && x2Str && y2Str) {
        paintingEyes[idx] = {
          left: { x: parseFloat(x1Str), y: parseFloat(y1Str) },
          right: { x: parseFloat(x2Str), y: parseFloat(y2Str) },
        };
      }
    });

    return Object.keys(paintingEyes).length > 0 ? paintingEyes : null;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % paintings.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [paintings.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use custom eye positions if provided, otherwise use defaults
    const customEyes = parseEyePositions();
    const eyePositions: { [key: number]: { left: { x: number; y: number }; right: { x: number; y: number } } } = customEyes || {
      0: { left: { x: canvas.width * 0.35, y: canvas.height * 0.45 }, right: { x: canvas.width * 0.65, y: canvas.height * 0.45 } },
      1: { left: { x: canvas.width * 0.4, y: canvas.height * 0.35 }, right: { x: canvas.width * 0.6, y: canvas.height * 0.35 } },
      2: { left: { x: canvas.width * 0.35, y: canvas.height * 0.45 }, right: { x: canvas.width * 0.65, y: canvas.height * 0.45 } },
      3: { left: { x: canvas.width * 0.3, y: canvas.height * 0.4 }, right: { x: canvas.width * 0.7, y: canvas.height * 0.4 } },
    };

    const eyes = eyePositions[currentIndex];
    if (!eyes) return;

    const drawEye = (eyeX: number, eyeY: number) => {
      const angle = Math.atan2(mousePos.y - eyeY, mousePos.x - eyeX);
      const pupilDistance = 12;
      const pupilX = eyeX + Math.cos(angle) * pupilDistance;
      const pupilY = eyeY + Math.sin(angle) * pupilDistance;

      // White of eye
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 25, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(pupilX - 5, pupilY - 5, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawEye(eyes.left.x, eyes.left.y);
    drawEye(eyes.right.x, eyes.right.y);
  }, [currentIndex, mousePos]);

  return (
    <main className={styles.container}>
      <img
        src={paintings[currentIndex].src}
        alt={paintings[currentIndex].name}
        className={styles.image}
      />
      <canvas ref={canvasRef} className={styles.overlay} />
    </main>
  );
}
