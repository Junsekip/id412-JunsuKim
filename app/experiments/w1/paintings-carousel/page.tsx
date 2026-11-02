"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const paintings = [
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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % paintings.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className={styles.container}>
      <img
        src={paintings[currentIndex].src}
        alt={paintings[currentIndex].name}
        className={styles.image}
      />
    </main>
  );
}
