"use client";

import { AdditiveBlending, BackSide, Color } from "three";

// A thin glowing shell around a planet: the blue edge you see on photos of the Earth from space.
// It is a sphere a little bigger than the planet, drawn from the inside (BackSide), brightest just outside the
// planet's edge and only on the side that faces the Sun. Three.js has no built-in material for this, so it is
// a small shader: vertex = where each point goes on screen, fragment = what colour each pixel gets.
const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 colour;
  uniform float strength;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 toCamera = normalize(vViewPosition);
    vec3 toSun = normalize((viewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz + vViewPosition); // the Sun is at (0, 0, 0)
    float edge = pow(smoothstep(0.0, 0.4, -dot(vNormal, toCamera)), 2.5); // 0 at the outer edge of the shell, strongest at the planet
    float lit = smoothstep(-0.3, 0.6, dot(vNormal, toSun));      // only the sunny side glows
    gl_FragColor = vec4(colour * edge * lit * strength, 1.0);
  }
`;

export function Atmosphere({ radius, colour, strength = 1 }: { radius: number; colour: string; strength?: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ colour: { value: new Color(colour) }, strength: { value: strength } }}
        side={BackSide}
        blending={AdditiveBlending} // adds light on top of what is behind it, like a real glow
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
