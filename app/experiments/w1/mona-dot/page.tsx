"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";

const MONA_LISA_URL =
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Mona_Lisa.jpg/330px-Mona_Lisa.jpg?utm_source=ko.wikipedia.org&utm_campaign=index&utm_content=thumbnail";

export default function MonaDot() {
  const [dotSize, setDotSize] = useState(8);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = MONA_LISA_URL;
    img.onload = () => {
      if (imgRef.current) {
        imgRef.current.src = MONA_LISA_URL;
      }
      drawDotPainting();
    };
  }, []);

  const drawDotPainting = () => {
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

    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  };

  useEffect(() => {
    drawDotPainting();
  }, [dotSize]);

  return (
    <main className={styles.container}>
      <img
        ref={imgRef}
        src={MONA_LISA_URL}
        alt="Mona Lisa"
        className={styles.hiddenImage}
      />
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.slider}>
        <label htmlFor="dotSize">Dot Size: {dotSize}</label>
        <input
          id="dotSize"
          type="range"
          min="2"
          max="30"
          value={dotSize}
          onChange={(e) => setDotSize(parseInt(e.target.value))}
          className={styles.sliderInput}
        />
      </div>
    </main>
  );
}
