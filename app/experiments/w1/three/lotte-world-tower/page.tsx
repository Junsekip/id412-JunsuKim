"use client";

import { useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { City } from "./City";
import { Tower } from "./Tower";
import styles from "./page.module.css";

// Lotte World Tower in Seoul (555 m, 123 floors), built from one rounded-square floor repeated 123 times.
// One panel in the lower-right corner: night and auto-spin.
export default function LotteWorldTower() {
  const [open, setOpen] = useState(false);
  const [night, setNight] = useState(false);
  const [spin, setSpin] = useState(true);
  const sky = night ? "#05070d" : "#cfdce6";

  return (
    <main className={styles.container}>
      <Canvas dpr={[1, 2]} camera={{ position: [75, 22, 75], fov: 45 }}>
        <color attach="background" args={[sky]} />
        {/* Fog fades the far city into the sky colour */}
        <fog attach="fog" args={[sky, 60, 220]} />

        <ambientLight intensity={night ? 0.15 : 0.7} />
        <directionalLight position={[40, 80, 30]} intensity={night ? 0.2 : 2.2} />

        <Tower night={night} />
        <City night={night} />

        {/* Look at the middle of the tower, not the ground. Do not go below the ground. */}
        <OrbitControls target={[0, 27, 0]} autoRotate={spin} autoRotateSpeed={0.6} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
      <p className={styles.caption}>drag to orbit · scroll to zoom</p>

      <div className={styles.panel}>
        {open && (
          <div className={styles.controls}>
            <label>
              Night
              <input type="checkbox" checked={night} onChange={(e) => setNight(e.target.checked)} />
              <span>{night ? "on" : "off"}</span>
            </label>
            <label>
              Spin
              <input type="checkbox" checked={spin} onChange={(e) => setSpin(e.target.checked)} />
              <span>{spin ? "on" : "off"}</span>
            </label>
          </div>
        )}

        {/* Options: lit while its panel is open */}
        <button
          className={open ? `${styles.toggle} ${styles.active}` : styles.toggle}
          onClick={() => setOpen(!open)}
          aria-label="Options"
          title="Options"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h16M4 12h16M4 17h16" />
            <circle cx="9" cy="7" r="2" fill="currentColor" />
            <circle cx="15" cy="12" r="2" fill="currentColor" />
            <circle cx="7" cy="17" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>
    </main>
  );
}
