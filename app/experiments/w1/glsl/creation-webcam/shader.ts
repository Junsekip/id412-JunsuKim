// The vertex shader places the full-screen triangle. It never changes.
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Based on "Creation" by Danilo Guanabara (Silexars), http://www.pouet.net/prod.php?which=57245
// (Shadertoy XsXXDn; the clean port is in ../creation). The author asks for credit when it is reused.
// Change: every tile of the warped grid shows the webcam image, not only a bright dot.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_camera;   // the webcam, updated every frame
uniform float u_cameraAspect; // webcam width / height, to cut a square out of it

out vec4 outputColor;

const float FACE = 0.8;  // how strong the webcam image is in each tile
const float GLOW = 0.01; // the original bright dot in each tile's centre (0 = none)

// The webcam inside one tile: tile is 0..1, we take the middle square of the image and mirror it.
vec3 camera(vec2 tile) {
  vec2 st = vec2(0.5 + (0.5 - tile.x) / u_cameraAspect, tile.y);
  return texture(u_camera, st).rgb;
}

void main() {
  vec3 c;     // the colour, built one channel at a time
  float l;    // distance from the centre of the screen
  float z = u_time;

  // Three passes, one for red, green and blue, each a little later in time (z += 0.07).
  // Each channel's tiles are warped a bit differently, so the face splits into red, green and blue.
  for (int i = 0; i < 3; i++) {
    vec2 p = gl_FragCoord.xy / u_resolution; // 0..1
    vec2 uv = p;
    p -= 0.5;                                // centre at (0, 0)
    p.x *= u_resolution.x / u_resolution.y;  // keep circles round on a wide screen
    z += 0.07;
    l = length(p);

    // Push uv away from the centre: by how much pulses in time (sin(z)) and in rings (sin(l * 9 ...)).
    uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));

    // Repeat uv in tiles. Each tile: this channel of the webcam, plus the original dot on top.
    vec2 tile = mod(uv, 1.0);
    c[i] = camera(tile)[i] * FACE + GLOW / length(tile - 0.5);
  }

  // The original divides by l (brighter towards the centre). Here l is softened by 0.5,
  // so the face stays visible instead of turning white.
  outputColor = vec4(c / (l + 0.5), 1.0);
}
`;
