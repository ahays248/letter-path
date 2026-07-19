/**
 * Simple drawn animal pictures for goal cards (no emoji — reliable in WebGL).
 * Each drawer paints into a canvas 2d context in a local coordinate box.
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} word
 * @param {number} cx center x
 * @param {number} cy center y
 * @param {number} r approximate radius of art
 */
export function drawAnimal(ctx, word, cx, cy, r) {
  const w = String(word || "").toUpperCase();
  const fn = ANIMALS[w] || drawDefault;
  fn(ctx, cx, cy, r);
}

const ANIMALS = {
  CAT: drawCat,
  DOG: drawDog,
  PIG: drawPig,
  HEN: drawHen,
  COW: drawCow,
  BUG: drawBug,
  FOX: drawFox,
  BAT: drawBat,
};

function drawCat(ctx, cx, cy, r) {
  // body
  ctx.fillStyle = "#f59e0b";
  ellipse(ctx, cx, cy + r * 0.15, r * 0.85, r * 0.75);
  // ears
  tri(ctx, cx - r * 0.55, cy - r * 0.15, cx - r * 0.35, cy - r * 0.95, cx - r * 0.05, cy - r * 0.25);
  tri(ctx, cx + r * 0.55, cy - r * 0.15, cx + r * 0.35, cy - r * 0.95, cx + r * 0.05, cy - r * 0.25);
  ctx.fillStyle = "#fbbf24";
  tri(ctx, cx - r * 0.45, cy - r * 0.2, cx - r * 0.35, cy - r * 0.75, cx - r * 0.15, cy - r * 0.25);
  tri(ctx, cx + r * 0.45, cy - r * 0.2, cx + r * 0.35, cy - r * 0.75, cx + r * 0.15, cy - r * 0.25);
  // eyes
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx - r * 0.28, cy, r * 0.12, r * 0.16);
  ellipse(ctx, cx + r * 0.28, cy, r * 0.12, r * 0.16);
  ctx.fillStyle = "#4ade80";
  ellipse(ctx, cx - r * 0.28, cy, r * 0.05, r * 0.08);
  ellipse(ctx, cx + r * 0.28, cy, r * 0.05, r * 0.08);
  // nose + mouth
  ctx.fillStyle = "#ef4444";
  tri(ctx, cx, cy + r * 0.12, cx - r * 0.1, cy + r * 0.28, cx + r * 0.1, cy + r * 0.28);
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = Math.max(2, r * 0.04);
  whisker(ctx, cx - r * 0.15, cy + r * 0.25, cx - r * 0.75, cy + r * 0.1);
  whisker(ctx, cx - r * 0.15, cy + r * 0.32, cx - r * 0.75, cy + r * 0.35);
  whisker(ctx, cx + r * 0.15, cy + r * 0.25, cx + r * 0.75, cy + r * 0.1);
  whisker(ctx, cx + r * 0.15, cy + r * 0.32, cx + r * 0.75, cy + r * 0.35);
}

function drawDog(ctx, cx, cy, r) {
  ctx.fillStyle = "#a16207";
  ellipse(ctx, cx, cy + r * 0.1, r * 0.8, r * 0.7);
  // floppy ears
  ctx.fillStyle = "#78350f";
  ellipse(ctx, cx - r * 0.7, cy + r * 0.05, r * 0.28, r * 0.55);
  ellipse(ctx, cx + r * 0.7, cy + r * 0.05, r * 0.28, r * 0.55);
  // snout
  ctx.fillStyle = "#d6d3d1";
  ellipse(ctx, cx, cy + r * 0.35, r * 0.4, r * 0.32);
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx, cy + r * 0.28, r * 0.12, r * 0.1);
  ellipse(ctx, cx - r * 0.25, cy - r * 0.05, r * 0.1, r * 0.12);
  ellipse(ctx, cx + r * 0.25, cy - r * 0.05, r * 0.1, r * 0.12);
  // tongue
  ctx.fillStyle = "#f472b6";
  ellipse(ctx, cx, cy + r * 0.5, r * 0.12, r * 0.14);
}

function drawPig(ctx, cx, cy, r) {
  ctx.fillStyle = "#f9a8d4";
  ellipse(ctx, cx, cy + r * 0.05, r * 0.85, r * 0.75);
  // ears
  tri(ctx, cx - r * 0.5, cy - r * 0.2, cx - r * 0.55, cy - r * 0.75, cx - r * 0.15, cy - r * 0.35);
  tri(ctx, cx + r * 0.5, cy - r * 0.2, cx + r * 0.55, cy - r * 0.75, cx + r * 0.15, cy - r * 0.35);
  // snout
  ctx.fillStyle = "#f472b6";
  ellipse(ctx, cx, cy + r * 0.25, r * 0.38, r * 0.28);
  ctx.fillStyle = "#9d174d";
  ellipse(ctx, cx - r * 0.12, cy + r * 0.25, r * 0.08, r * 0.12);
  ellipse(ctx, cx + r * 0.12, cy + r * 0.25, r * 0.08, r * 0.12);
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx - r * 0.28, cy - r * 0.05, r * 0.09, r * 0.11);
  ellipse(ctx, cx + r * 0.28, cy - r * 0.05, r * 0.09, r * 0.11);
}

function drawHen(ctx, cx, cy, r) {
  // body
  ctx.fillStyle = "#fde047";
  ellipse(ctx, cx, cy + r * 0.15, r * 0.7, r * 0.65);
  // head
  ellipse(ctx, cx + r * 0.15, cy - r * 0.35, r * 0.4, r * 0.4);
  // comb
  ctx.fillStyle = "#ef4444";
  ellipse(ctx, cx + r * 0.05, cy - r * 0.7, r * 0.12, r * 0.18);
  ellipse(ctx, cx + r * 0.2, cy - r * 0.75, r * 0.12, r * 0.2);
  ellipse(ctx, cx + r * 0.35, cy - r * 0.65, r * 0.1, r * 0.16);
  // beak
  ctx.fillStyle = "#f97316";
  tri(ctx, cx + r * 0.45, cy - r * 0.3, cx + r * 0.85, cy - r * 0.25, cx + r * 0.45, cy - r * 0.15);
  // eye
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx + r * 0.22, cy - r * 0.4, r * 0.07, r * 0.07);
  // wing
  ctx.fillStyle = "#facc15";
  ellipse(ctx, cx - r * 0.15, cy + r * 0.2, r * 0.35, r * 0.25);
}

function drawCow(ctx, cx, cy, r) {
  ctx.fillStyle = "#f5f5f4";
  ellipse(ctx, cx, cy + r * 0.1, r * 0.85, r * 0.7);
  // spots
  ctx.fillStyle = "#1c1917";
  ellipse(ctx, cx - r * 0.35, cy, r * 0.22, r * 0.18);
  ellipse(ctx, cx + r * 0.3, cy + r * 0.25, r * 0.2, r * 0.16);
  ellipse(ctx, cx + r * 0.1, cy - r * 0.2, r * 0.15, r * 0.12);
  // horns
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = Math.max(3, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.35, cy - r * 0.45);
  ctx.quadraticCurveTo(cx - r * 0.55, cy - r * 0.9, cx - r * 0.25, cy - r * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.35, cy - r * 0.45);
  ctx.quadraticCurveTo(cx + r * 0.55, cy - r * 0.9, cx + r * 0.25, cy - r * 0.85);
  ctx.stroke();
  // snout
  ctx.fillStyle = "#fda4af";
  ellipse(ctx, cx, cy + r * 0.35, r * 0.35, r * 0.25);
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx - r * 0.1, cy + r * 0.35, r * 0.06, r * 0.08);
  ellipse(ctx, cx + r * 0.1, cy + r * 0.35, r * 0.06, r * 0.08);
  ellipse(ctx, cx - r * 0.3, cy - r * 0.05, r * 0.08, r * 0.1);
  ellipse(ctx, cx + r * 0.3, cy - r * 0.05, r * 0.08, r * 0.1);
}

function drawBug(ctx, cx, cy, r) {
  // body segments
  ctx.fillStyle = "#4ade80";
  ellipse(ctx, cx - r * 0.35, cy, r * 0.35, r * 0.4);
  ctx.fillStyle = "#22c55e";
  ellipse(ctx, cx + r * 0.15, cy, r * 0.55, r * 0.45);
  // spots
  ctx.fillStyle = "#14532d";
  ellipse(ctx, cx + r * 0.05, cy - r * 0.1, r * 0.1, r * 0.1);
  ellipse(ctx, cx + r * 0.35, cy + r * 0.1, r * 0.08, r * 0.08);
  // head eyes
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx - r * 0.45, cy - r * 0.1, r * 0.08, r * 0.1);
  ellipse(ctx, cx - r * 0.45, cy + r * 0.12, r * 0.08, r * 0.1);
  // antennae
  ctx.strokeStyle = "#166534";
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy - r * 0.2);
  ctx.quadraticCurveTo(cx - r * 0.8, cy - r * 0.7, cx - r * 0.5, cy - r * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy + r * 0.15);
  ctx.quadraticCurveTo(cx - r * 0.85, cy + r * 0.5, cx - r * 0.55, cy + r * 0.75);
  ctx.stroke();
  // legs
  for (let i = 0; i < 3; i++) {
    const y = cy - r * 0.25 + i * r * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.5, y);
    ctx.lineTo(cx + r * 0.9, y - r * 0.15);
    ctx.stroke();
  }
}

function drawFox(ctx, cx, cy, r) {
  ctx.fillStyle = "#fb923c";
  // pointed face diamond-ish
  tri(ctx, cx, cy - r * 0.85, cx - r * 0.85, cy + r * 0.35, cx + r * 0.85, cy + r * 0.35);
  // ears
  tri(ctx, cx - r * 0.45, cy - r * 0.35, cx - r * 0.55, cy - r * 0.95, cx - r * 0.1, cy - r * 0.45);
  tri(ctx, cx + r * 0.45, cy - r * 0.35, cx + r * 0.55, cy - r * 0.95, cx + r * 0.1, cy - r * 0.45);
  // white muzzle
  ctx.fillStyle = "#fff7ed";
  ellipse(ctx, cx, cy + r * 0.25, r * 0.4, r * 0.35);
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx - r * 0.25, cy - r * 0.1, r * 0.09, r * 0.12);
  ellipse(ctx, cx + r * 0.25, cy - r * 0.1, r * 0.09, r * 0.12);
  ctx.fillStyle = "#0f172a";
  ellipse(ctx, cx, cy + r * 0.2, r * 0.1, r * 0.08);
}

function drawBat(ctx, cx, cy, r) {
  // wings
  ctx.fillStyle = "#4b5563";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cx - r * 0.6, cy - r * 0.8, cx - r * 1.1, cy + r * 0.1);
  ctx.quadraticCurveTo(cx - r * 0.7, cy + r * 0.15, cx - r * 0.9, cy + r * 0.45);
  ctx.quadraticCurveTo(cx - r * 0.4, cy + r * 0.1, cx, cy + r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cx + r * 0.6, cy - r * 0.8, cx + r * 1.1, cy + r * 0.1);
  ctx.quadraticCurveTo(cx + r * 0.7, cy + r * 0.15, cx + r * 0.9, cy + r * 0.45);
  ctx.quadraticCurveTo(cx + r * 0.4, cy + r * 0.1, cx, cy + r * 0.15);
  ctx.closePath();
  ctx.fill();
  // body
  ctx.fillStyle = "#1f2937";
  ellipse(ctx, cx, cy + r * 0.05, r * 0.35, r * 0.45);
  // ears
  tri(ctx, cx - r * 0.2, cy - r * 0.25, cx - r * 0.35, cy - r * 0.75, cx - r * 0.05, cy - r * 0.35);
  tri(ctx, cx + r * 0.2, cy - r * 0.25, cx + r * 0.35, cy - r * 0.75, cx + r * 0.05, cy - r * 0.35);
  // eyes
  ctx.fillStyle = "#fde047";
  ellipse(ctx, cx - r * 0.12, cy, r * 0.08, r * 0.1);
  ellipse(ctx, cx + r * 0.12, cy, r * 0.08, r * 0.1);
  ctx.fillStyle = "#111827";
  ellipse(ctx, cx - r * 0.12, cy, r * 0.04, r * 0.05);
  ellipse(ctx, cx + r * 0.12, cy, r * 0.04, r * 0.05);
}

function drawDefault(ctx, cx, cy, r) {
  ctx.fillStyle = "#94a3b8";
  ellipse(ctx, cx, cy, r * 0.7, r * 0.7);
  ctx.fillStyle = "#111827";
  ctx.font = `bold ${Math.floor(r * 0.8)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", cx, cy);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
  ctx.fill();
}

function tri(ctx, x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function whisker(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
