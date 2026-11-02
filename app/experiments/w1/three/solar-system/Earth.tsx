"use client";

import { useRef } from "react";
import { SRGBColorSpace, type Group, type Mesh } from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Atmosphere } from "./Atmosphere";

const DIR = "/experiments/w1/three/solar-system";

// City lights should only show on the night side. meshPhongMaterial lights its emissive map everywhere, so we
// add two lines to its shader: dim the glow where the surface faces the Sun (at 0, 0, 0).
function onlyAtNight(shader: { fragmentShader: string }) {
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <emissivemap_fragment>",
    `#include <emissivemap_fragment>
    vec3 toSun = normalize((viewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz + vViewPosition);
    totalEmissiveRadiance *= smoothstep(0.1, -0.25, dot(normalize(vNormal), toSun));`,
  );
}

// The Earth's surface, in four layers of images:
// map = the colours by day, normalMap = fake mountain relief, specularMap = where it is shiny (white = ocean),
// emissiveMap = city lights at night. Plus a cloud shell and the blue atmosphere.
export function EarthSurface({ radius, speed }: { radius: number; speed: number }) {
  const cloudsRef = useRef<Mesh>(null);
  const [day, night, normal, specular, clouds] = useTexture([
    `${DIR}/earth_daymap.jpg`,
    `${DIR}/earth_nightmap.jpg`,
    `${DIR}/earth_normal.jpg`,
    `${DIR}/earth_specular.jpg`,
    `${DIR}/earth_clouds.jpg`,
  ]);
  day.colorSpace = SRGBColorSpace; // only colour images are sRGB; normal, specular and cloud maps are data
  night.colorSpace = SRGBColorSpace;
  day.anisotropy = 8; // sharper when seen at a slant, near the edge of the ball

  useFrame((_, delta) => {
    cloudsRef.current!.rotation.y += 0.02 * speed * delta; // clouds drift a little faster than the ground
  });

  return (
    <>
      {/* meshPhongMaterial, not Standard: its specularMap makes only the oceans catch the Sun (the glint you see
          on photos), while land stays matte. */}
      <mesh>
        <sphereGeometry args={[radius, 128, 64]} />
        <meshPhongMaterial
          map={day}
          normalMap={normal}
          normalScale={[0.6, 0.6]}
          specularMap={specular}
          specular="#7a8a99"
          shininess={18}
          emissiveMap={night}
          emissive="#ffd8a0"
          emissiveIntensity={1.4}
          onBeforeCompile={onlyAtNight}
        />
      </mesh>

      {/* Clouds: a slightly bigger white ball, see-through where the cloud image is black (alphaMap). */}
      <mesh ref={cloudsRef} scale={1.012}>
        <sphereGeometry args={[radius, 96, 48]} />
        <meshStandardMaterial color="white" alphaMap={clouds} transparent roughness={1} depthWrite={false} />
      </mesh>

      <Atmosphere radius={radius * 1.04} colour="#3f8cff" strength={1.2} />
    </>
  );
}

// The Moon goes round the Earth, about 13 times a year, its orbit tilted 5°. Because it sits inside the turning
// group, the same side always faces the Earth, as in reality.
export function Moon({ planetRadius, speed }: { planetRadius: number; speed: number }) {
  const orbitRef = useRef<Group>(null);
  const map = useTexture(`${DIR}/moon.jpg`);
  map.colorSpace = SRGBColorSpace;

  useFrame((_, delta) => {
    orbitRef.current!.rotation.y += ((Math.PI * 2) / 3) * speed * delta;
  });

  return (
    <group rotation-x={0.09}>
      <group ref={orbitRef}>
        <mesh position={[planetRadius * 3.2, 0, 0]}>
          <sphereGeometry args={[planetRadius * 0.27, 64, 32]} />
          {/* Grey dust and craters: fully matte, and the same image as a bumpMap for crater relief */}
          <meshStandardMaterial map={map} bumpMap={map} bumpScale={2} roughness={1} metalness={0} />
        </mesh>
      </group>
    </group>
  );
}
