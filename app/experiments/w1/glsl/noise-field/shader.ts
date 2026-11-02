// The vertex shader places the full-screen triangle. It never changes.
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// A noise field, built in four steps:
// 1. noise(): smooth random values on a grid.  2. fbm(): several layers of it, finer and fainter.
// 3. warp: the field is read at a position that is itself moved by the field.  4. palette(): number → colour.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse; // 0..1, (0,0) is bottom-left
uniform float u_time;

out vec4 outputColor;

const float SCALE = 3.0;  // how zoomed out the field is; more = smaller features
const int OCTAVES = 5;    // layers in fbm; more = more fine detail
const float SPEED = 0.08; // how fast the field flows
const float WARP = 1.5;   // how strongly the field bends itself
const float LENS = 2.0;   // extra warp around the mouse

// 1a. A random number 0..1 for each grid point. Same input → same output, so it does not flicker.
float random(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

// 1b. Value noise: random values at the 4 grid corners around p, blended smoothly in between.
float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 blend = f * f * (3.0 - 2.0 * f); // smoothstep: no hard edges at the grid lines
  float a = random(cell);
  float b = random(cell + vec2(1.0, 0.0));
  float c = random(cell + vec2(0.0, 1.0));
  float d = random(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
}

// 2. fbm (fractal Brownian motion): add OCTAVES layers of noise, each twice as fine and half as strong.
float fbm(vec2 p) {
  float value = 0.0;
  float strength = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    value += strength * noise(p);
    p *= 2.0;
    strength *= 0.5;
  }
  return value; // about 0..1
}

// 4. Cosine palette (Inigo Quilez): one number 0..1 → a smooth band of colours. Change the vectors to recolour.
vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.15, 0.3);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  // Position: centre at (0, 0), circles stay round on a wide screen.
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  vec2 mouse = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = uv * SCALE;
  float t = u_time * SPEED;

  // 3. Domain warp: two fbm values make an offset (q), and the field is read again at p + q.
  // Near the mouse, the offset is stronger, so the field swirls there.
  float near = exp(-length(uv - mouse) * 4.0); // 1 at the mouse, fading to 0
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  float field = fbm(p + (WARP + LENS * near) * q + t);

  vec3 colour = palette(field + 0.3 * length(q));
  colour *= 0.6 + 0.6 * field; // darker valleys, brighter ridges

  outputColor = vec4(colour, 1.0);
}
`;
