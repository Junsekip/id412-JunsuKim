"use client";

import { Suspense, useState } from "react";
import { BackSide, SRGBColorSpace } from "three";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { PLANETS, Planet } from "./Planet";
import { Sun } from "./Sun";
import styles from "./page.module.css";

// The night sky: a photo of the Milky Way on the inside of a huge ball around everything.
// color="#777" darkens it, so the stars stay in the background and do not compete with the planets.
function Sky() {
  const map = useTexture("/experiments/w1/three/solar-system/stars_milky_way.jpg");
  map.colorSpace = SRGBColorSpace;
  return (
    <mesh>
      <sphereGeometry args={[800, 64, 32]} />
      <meshBasicMaterial map={map} side={BackSide} color="#777" depthWrite={false} />
    </mesh>
  );
}

// The Sun and its eight planets, with real images of each (Solar System Scope), real orbit periods and tilts.
// One panel in the lower-right corner: speed and orbit lines.
export default function SolarSystem() {
  const [open, setOpen] = useState(false);
  const [speed, setSpeed] = useState(1); // 0 = paused, 1 = one Earth year every 40 seconds
  const [orbits, setOrbits] = useState(false);

  return (
    <main className={styles.container}>
      {/* shadows="percentage": lets lights cast shadows, with blurred edges (shadow-radius in Sun.tsx). far: the camera sees up to 2000 units away (the sky is at 800). */}
      <Canvas shadows="percentage" dpr={[1, 2]} camera={{ position: [0, 20, 62], fov: 45, near: 0.1, far: 2000 }}>
        {/* Images load in the background; Suspense shows nothing until they are all ready. */}
        <Suspense fallback={null}>
          <Sky />
          {/* Almost no light from elsewhere: in space the night side is nearly black. */}
          <ambientLight intensity={0.03} />
          <Sun speed={speed} />
          {PLANETS.map((planet) => (
            <Planet key={planet.name} planet={planet} speed={speed} orbits={orbits} />
          ))}
        </Suspense>
        <OrbitControls minDistance={6} maxDistance={300} />
      </Canvas>
      <p className={styles.caption}>drag to orbit · scroll to zoom</p>

      <div className={styles.panel}>
        {open && (
          <div className={styles.controls}>
            <label>
              Speed
              <input type="range" min={0} max={10} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
              <span>{speed.toFixed(1)}×</span>
            </label>
            <label>
              Orbits
              <input type="checkbox" checked={orbits} onChange={(e) => setOrbits(e.target.checked)} />
              <span>{orbits ? "on" : "off"}</span>
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
