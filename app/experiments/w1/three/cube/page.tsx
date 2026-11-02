"use client";

import { useState } from "react";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { GEOMETRIES, Shapes, type GeometryName, type MaterialSettings } from "./Shapes";
import styles from "./page.module.css";

const DEFAULT_MATERIAL: MaterialSettings = {
  colour: "#ff7a45",
  roughness: 0.4,
  metalness: 0,
  clearcoat: 0,
  transmission: 0,
  opacity: 1,
  emissive: 0,
  wireframe: false,
};

// Sliders in the options panel: [key, label, min, max]
const SLIDERS: [keyof MaterialSettings, string, number, number][] = [
  ["roughness", "Rough", 0, 1],
  ["metalness", "Metal", 0, 1],
  ["clearcoat", "Coat", 0, 1],
  ["transmission", "Glass", 0, 1],
  ["opacity", "Opacity", 0, 1],
  ["emissive", "Glow", 0, 2],
];

// The first Three.js scene: a camera, lights and one shape in the middle.
// Two panels in the lower-right corner: Shape (which geometry, how many) and Options (their material).
export default function CubeScene() {
  const [openPanel, setOpenPanel] = useState<"shape" | "options" | null>(null); // one panel open at a time
  const [geometry, setGeometry] = useState<GeometryName>("box");
  const [perAxis, setPerAxis] = useState(8); // shapes along each axis: 8 → 8 × 8 × 8 = 512
  const [material, setMaterial] = useState(DEFAULT_MATERIAL);

  // Click a panel's button: open it, or close it if it is already open.
  function toggle(panel: "shape" | "options") {
    setOpenPanel(openPanel === panel ? null : panel);
  }

  // Change one setting, keep the others.
  function update(key: keyof MaterialSettings, value: string | number | boolean) {
    setMaterial({ ...material, [key]: value });
  }

  return (
    <main className={styles.container}>
      {/* Canvas sets up the renderer, the scene and a camera at [4, 3, 6], looking at the centre. */}
      {/* onCreated: glass (transmission) renders the scene once more into a texture to look through;
          at half resolution that costs a quarter, and the glass only looks a little softer. */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [9, 6.5, 13.5], fov: 45 }}
        onCreated={({ gl }) => {
          gl.transmissionResolutionScale = 0.5;
        }}
      >
        {/* ambientLight lights every side a little; directionalLight is the sun, from one side. */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={2} />
        {/* Surroundings: a few soft light panels around the shapes, made here (nothing is downloaded), also shown
            blurred as the background. Metal, clearcoat and glass mostly show what they reflect or what is behind
            them, so on a plain dark background they look black. */}
        <Environment resolution={256} background backgroundBlurriness={0.4}>
          <Lightformer form="ring" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={6} />
          <Lightformer form="rect" intensity={3} position={[0, 2, -6]} scale={[12, 4, 1]} />
          <Lightformer form="rect" intensity={2} position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[12, 3, 1]} />
          <Lightformer form="rect" intensity={2} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[12, 3, 1]} />
          <Lightformer form="rect" intensity={1} position={[0, 1, 6]} rotation-y={Math.PI} scale={[12, 3, 1]} color="#ffd6b0" />
        </Environment>
        {/* key: a new count makes a new set of shapes (the instanced mesh is made for a fixed count) */}
        <Shapes key={perAxis} geometry={geometry} material={material} perAxis={perAxis} />
        {/* A grid floor under the shapes: something for glass to bend and metal to mirror. */}
        <gridHelper args={[30, 30, "#777", "#333"]} position={[0, -4.6, 0]} />
        {/* Drag to orbit around the shapes, scroll to zoom. */}
        <OrbitControls />
      </Canvas>
      <p className={styles.caption}>drag to orbit · scroll to zoom</p>

      <div className={styles.panel}>
        {openPanel === "shape" && (
          <div className={styles.shapes}>
            <label className={styles.count}>
              Grid
              <input type="range" min={1} max={8} step={1} value={perAxis} onChange={(e) => setPerAxis(Number(e.target.value))} />
              <span>
                {perAxis}³ = {perAxis ** 3}
              </span>
            </label>
            {GEOMETRIES.map((name) => (
              <button key={name} aria-pressed={geometry === name} onClick={() => setGeometry(name)}>
                {name}
              </button>
            ))}
          </div>
        )}

        {openPanel === "options" && (
          <div className={styles.controls}>
            <label>
              Colour
              <input type="color" value={material.colour} onChange={(e) => update("colour", e.target.value)} />
              <span>{material.colour}</span>
            </label>
            {SLIDERS.map(([key, label, min, max]) => (
              <label key={key}>
                {label}
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={0.01}
                  value={material[key] as number}
                  onChange={(e) => update(key, Number(e.target.value))}
                />
                <span>{(material[key] as number).toFixed(2)}</span>
              </label>
            ))}
            <label>
              Wire
              <input type="checkbox" checked={material.wireframe} onChange={(e) => update("wireframe", e.target.checked)} />
              <span>{material.wireframe ? "on" : "off"}</span>
            </label>
            <button className={styles.reset} onClick={() => setMaterial(DEFAULT_MATERIAL)}>
              reset
            </button>
          </div>
        )}

        <div className={styles.buttons}>
          {/* Shape: which geometry. Lit while its panel is open. */}
          <button
            className={openPanel === "shape" ? `${styles.toggle} ${styles.active}` : styles.toggle}
            onClick={() => toggle("shape")}
            aria-label="Shape"
            title="Shape"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
              <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
            </svg>
          </button>

          {/* Options: the material settings. Lit while its panel is open. */}
          <button
            className={openPanel === "options" ? `${styles.toggle} ${styles.active}` : styles.toggle}
            onClick={() => toggle("options")}
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
      </div>
    </main>
  );
}
