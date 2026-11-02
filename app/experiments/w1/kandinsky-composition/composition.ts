// A Kandinsky-like composition: a list of shapes made at random, then drawn on a canvas.
// Positions are fractions of the canvas (0..1); sizes are fractions of its shorter side.
// So the same composition fits any window, and only clicking makes a new one.

const BACKGROUND = "#efe6d2"; // warm cream, like old canvas
const BLACK = "#1b1b1b";
const COLOURS = ["#d63a2f", "#2a4d9b", "#f2c230", "#e88aa0", "#6f3f8f", "#3e8a5e", "#e5762c"]; // red, blue, yellow, pink, purple, green, orange

type Point = [number, number];

export type Shape =
  | { kind: "halo"; x: number; y: number; r: number; glow: string } // the big dark circle with a coloured glow
  | { kind: "circle"; x: number; y: number; r: number; rings: string[] } // concentric rings, outer to inner
  | { kind: "triangle"; points: Point[]; colour: string; filled: boolean }
  | { kind: "checker"; x: number; y: number; size: number; cells: number; angle: number; colour: string }
  | { kind: "line"; from: Point; to: Point; width: number }
  | { kind: "arc"; x: number; y: number; r: number; start: number; end: number; width: number }
  | { kind: "bundle"; x: number; y: number; length: number; angle: number; count: number; gap: number }; // parallel lines

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

// How many of each shape, and their size ranges. The order here is the drawing order (back to front).
export function makeComposition(): Shape[] {
  const shapes: Shape[] = [];

  for (let i = 0; i < rand(1, 3); i++) {
    shapes.push({ kind: "checker", x: rand(0.1, 0.9), y: rand(0.1, 0.9), size: rand(0.06, 0.12), cells: pick([3, 4]), angle: rand(-0.5, 0.5), colour: pick(COLOURS) });
  }

  shapes.push({ kind: "halo", x: rand(0.15, 0.35), y: rand(0.2, 0.4), r: rand(0.1, 0.15), glow: pick(["#6f3f8f", "#e88aa0", "#2a4d9b"]) });

  for (let i = 0; i < rand(2, 5); i++) {
    const centre: Point = [rand(0.15, 0.85), rand(0.15, 0.85)];
    const size = rand(0.08, 0.25);
    const points = [0, 1, 2].map((k): Point => {
      const angle = (k * Math.PI * 2) / 3 + rand(-0.6, 0.6);
      return [centre[0] + Math.cos(angle) * size, centre[1] + Math.sin(angle) * size];
    });
    shapes.push({ kind: "triangle", points, colour: pick(COLOURS), filled: Math.random() < 0.6 });
  }

  for (let i = 0; i < rand(7, 13); i++) {
    const rings = Array.from({ length: pick([1, 1, 2, 3]) }, () => pick([...COLOURS, BLACK]));
    shapes.push({ kind: "circle", x: rand(0.05, 0.95), y: rand(0.05, 0.95), r: rand(0.01, 0.08), rings });
  }

  for (let i = 0; i < rand(8, 15); i++) {
    const from: Point = [rand(0, 1), rand(0, 1)];
    const angle = rand(0, Math.PI * 2);
    const length = rand(0.2, 0.8);
    const to: Point = [from[0] + Math.cos(angle) * length, from[1] + Math.sin(angle) * length];
    shapes.push({ kind: "line", from, to, width: rand(0.001, 0.008) });
  }

  for (let i = 0; i < rand(3, 6); i++) {
    const start = rand(0, Math.PI * 2);
    shapes.push({ kind: "arc", x: rand(0.1, 0.9), y: rand(0.1, 0.9), r: rand(0.04, 0.15), start, end: start + rand(1.5, 3.5), width: rand(0.002, 0.007) });
  }

  for (let i = 0; i < rand(2, 4); i++) {
    shapes.push({ kind: "bundle", x: rand(0.1, 0.9), y: rand(0.1, 0.9), length: rand(0.1, 0.3), angle: rand(0, Math.PI), count: pick([4, 5, 6, 7]), gap: rand(0.008, 0.015) });
  }

  return shapes;
}

// Draws the list on a canvas of `width` × `height` (in the context's units).
export function drawComposition(context: CanvasRenderingContext2D, shapes: Shape[], width: number, height: number) {
  const unit = Math.min(width, height); // sizes are fractions of this
  const X = (x: number) => x * width;
  const Y = (y: number) => y * height;

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);

  for (const s of shapes) {
    // Colour planes are drawn with "multiply", so where two overlap they mix darker, like transparent paint.
    context.globalCompositeOperation = "multiply";
    context.globalAlpha = 0.9;

    if (s.kind === "halo") {
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      context.shadowColor = s.glow;
      context.shadowBlur = s.r * unit * 0.8; // the coloured glow around the dark circle
      context.fillStyle = BLACK;
      context.beginPath();
      context.arc(X(s.x), Y(s.y), s.r * unit, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      // A thin coloured ring just outside it
      context.strokeStyle = s.glow;
      context.lineWidth = s.r * unit * 0.12;
      context.beginPath();
      context.arc(X(s.x), Y(s.y), s.r * unit * 1.12, 0, Math.PI * 2);
      context.stroke();
    }

    if (s.kind === "circle") {
      // Each ring a bit smaller than the one before it. Solid paint, so the inner rings stay bright.
      context.globalCompositeOperation = "source-over";
      s.rings.forEach((colour, k) => {
        context.fillStyle = colour;
        context.beginPath();
        context.arc(X(s.x), Y(s.y), s.r * unit * (1 - k * 0.3), 0, Math.PI * 2);
        context.fill();
      });
    }

    if (s.kind === "triangle") {
      context.beginPath();
      context.moveTo(X(s.points[0][0]), Y(s.points[0][1]));
      context.lineTo(X(s.points[1][0]), Y(s.points[1][1]));
      context.lineTo(X(s.points[2][0]), Y(s.points[2][1]));
      context.closePath();
      if (s.filled) {
        context.fillStyle = s.colour;
        context.fill();
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = BLACK;
        context.lineWidth = unit * 0.003;
        context.stroke();
      }
    }

    if (s.kind === "checker") {
      // A small rotated grid, squares alternating between a colour and black.
      const cell = (s.size * unit) / s.cells;
      context.save();
      context.translate(X(s.x), Y(s.y));
      context.rotate(s.angle);
      for (let row = 0; row < s.cells; row++) {
        for (let col = 0; col < s.cells; col++) {
          context.fillStyle = (row + col) % 2 === 0 ? s.colour : BLACK;
          context.fillRect(col * cell, row * cell, cell, cell);
        }
      }
      context.restore();
    }

    // Lines, arcs and bundles: plain black ink on top.
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.strokeStyle = BLACK;
    context.lineCap = "round";

    if (s.kind === "line") {
      context.lineWidth = s.width * unit;
      context.beginPath();
      context.moveTo(X(s.from[0]), Y(s.from[1]));
      context.lineTo(X(s.to[0]), Y(s.to[1]));
      context.stroke();
    }

    if (s.kind === "arc") {
      context.lineWidth = s.width * unit;
      context.beginPath();
      context.arc(X(s.x), Y(s.y), s.r * unit, s.start, s.end);
      context.stroke();
    }

    if (s.kind === "bundle") {
      // `count` thin lines side by side, rotated together.
      context.save();
      context.translate(X(s.x), Y(s.y));
      context.rotate(s.angle);
      context.lineWidth = unit * 0.0015;
      for (let k = 0; k < s.count; k++) {
        const offset = k * s.gap * unit;
        context.beginPath();
        context.moveTo(0, offset);
        context.lineTo(s.length * unit, offset);
        context.stroke();
      }
      context.restore();
    }
  }
}
