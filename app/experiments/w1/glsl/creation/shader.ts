// The vertex shader places the full-screen triangle. It never changes.
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// "Creation" by Danilo Guanabara (Silexars), http://www.pouet.net/prod.php?which=57245
// Ported from https://www.shadertoy.com/view/XsXXDn. The author asks for credit when it is reused.
// Shadertoy names → ours: iTime → u_time, iResolution → u_resolution, fragCoord → gl_FragCoord.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 outputColor;

void main() {
  vec3 c;     // the colour, built one channel at a time
  float l;    // distance from the centre of the screen
  float z = u_time;

  // Three passes, one for red, green and blue. Each pass is a little later in time (z += 0.07),
  // so the three channels drift apart and the rings get coloured edges.
  for (int i = 0; i < 3; i++) {
    vec2 p = gl_FragCoord.xy / u_resolution; // 0..1
    vec2 uv = p;
    p -= 0.5;                                // centre at (0, 0)
    p.x *= u_resolution.x / u_resolution.y;  // keep circles round on a wide screen
    z += 0.07;
    l = length(p);

    // Push uv away from the centre: by how much pulses in time (sin(z)) and in rings (sin(l * 9 ...)).
    uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));

    // Repeat uv in tiles (mod 1) and light up each tile's centre: a bright dot that fades with distance.
    c[i] = 0.01 / length(mod(uv, 1.0) - 0.5);
  }

  // Divide by l: brighter towards the centre. (Shadertoy ignores alpha; here it is 1.)
  outputColor = vec4(c / l, 1.0);
}
`;
