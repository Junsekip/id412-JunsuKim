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
    name: "Painting 2",
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
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDotPainting = searchParams.get("style") === "dots";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % paintings.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [paintings.length]);

  useEffect(() => {
    if (!isDotPainting) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const imgWidth = img.width;
    const imgHeight = img.height;
    const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
    const x = (canvas.width - imgWidth * scale) / 2;
    const y = (canvas.height - imgHeight * scale) / 2;

    ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dotSize = 8;
    for (let i = 0; i < canvas.width; i += dotSize) {
      for (let j = 0; j < canvas.height; j += dotSize) {
        const index = (j * canvas.width + i) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        ctx.beginPath();
        ctx.arc(i, j, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [isDotPainting, currentIndex]);

  return (
    <main className={styles.container}>
      <img
        ref={imgRef}
        src={paintings[currentIndex].src}
        alt={paintings[currentIndex].name}
        className={styles.image}
        style={{ display: isDotPainting ? "none" : "block" }}
      />
      {isDotPainting && <canvas ref={canvasRef} className={styles.dotCanvas} />}
    </main>
  );
}
