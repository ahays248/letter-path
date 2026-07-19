import * as THREE from "three";
import { PATH, LANE, laneX, forkMarkerZ, GOAL_BILLBOARD } from "./constants.js";
import { drawAnimal } from "./animalArt.js";

/**
 * Semi-transparent walk-through letter (no solid block).
 * Soft glowing glyph on clear background.
 */
function makeGateLetterMaterial(letter, tintHex) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  // Soft tint disc (walk-through feel)
  const grd = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grd.addColorStop(0, hexToRgba(tintHex, 0.45));
  grd.addColorStop(0.7, hexToRgba(tintHex, 0.2));
  grd.addColorStop(1, hexToRgba(tintHex, 0));
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(128, 128, 118, 0, Math.PI * 2);
  ctx.fill();

  // Letter
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = hexToRgba(tintHex, 0.9);
  ctx.lineWidth = 10;
  ctx.font = "bold 170px system-ui, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(String(letter).toUpperCase(), 128, 138);
  ctx.fillText(String(letter).toUpperCase(), 128, 138);

  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  // BasicMaterial = no lighting cost (many translucent gates on path)
  return new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function makeGateFrameMaterial(hex, opacity = 0.55) {
  return new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Arch the player runs through: two posts + top bar + floating letter disc.
 * @param {number} laneXpos
 * @param {number} colorHex
 */
function createWalkThroughGate(laneXpos, colorHex) {
  const gate = new THREE.Group();
  gate.position.x = laneXpos;

  // Fill exactly one half of the road; left + right gates meet at x=0
  const halfW = PATH.gateHalfW;
  const inset = 0.06; // keep posts just inside the road edge
  const postH = 2.4;
  const postY = postH / 2;
  const inner = halfW - inset;
  const letterSize = Math.min(1.2, halfW * 1.35);

  const frameMat = makeGateFrameMaterial(colorHex, 0.58);
  const postGeo = new THREE.BoxGeometry(0.1, postH, 0.1);
  const leftPost = new THREE.Mesh(postGeo, frameMat);
  leftPost.position.set(-inner, postY, 0);
  const rightPost = new THREE.Mesh(postGeo, frameMat);
  rightPost.position.set(inner, postY, 0);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(inner * 2 + 0.1, 0.1, 0.1),
    frameMat
  );
  top.position.set(0, postH, 0);

  // Portal sheet spans the full half-lane (player runs through)
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(inner * 2, postH * 0.95),
    new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  sheet.position.set(0, postH * 0.48, 0);

  const letterMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(letterSize, letterSize),
    makeGateLetterMaterial("?", colorHex === 0x3b82f6 ? "#3b82f6" : "#ef4444")
  );
  letterMesh.position.set(0, 1.15, 0.02);

  gate.add(leftPost, rightPost, top, sheet, letterMesh);
  return { gate, letterMesh, frameMat, sheet };
}

/**
 * Fallback goal card when Imagine PNG/JPG is missing (canvas-drawn animal).
 * @param {{ word: string, color?: string }} entry
 */
function makeCanvasGoalMaterial(entry) {
  const word = String(entry.word || "?").toUpperCase();
  const color = entry.color || "#fef3c7";
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#e0f2fe";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  roundRect(ctx, 20, 20, size - 40, size - 40, 36);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(256, 210, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Full-card animal art, no word label (do not spoil the spelling)
  drawAnimal(ctx, word, 256, 270, 160);

  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return new THREE.MeshBasicMaterial({
    map: tex,
  });
}

/**
 * Composite Imagine animal image into a Three material.
 * @param {CanvasImageSource} image
 * @param {string} word
 */
function materialFromAnimalImage(image, word) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#e0f2fe";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  roundRect(ctx, 16, 16, size - 32, size - 32, 32);
  ctx.fill();

  // Full-bleed animal portrait (no text spoilers)
  const pad = 28;
  const boxW = size - pad * 2;
  const boxH = size - pad * 2;
  const iw = image.width || size;
  const ih = image.height || size;
  const scale = Math.max(boxW / iw, boxH / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = pad + (boxW - dw) / 2;
  const dy = pad + (boxH - dh) / 2;
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, pad, pad, boxW, boxH, 28);
  ctx.clip();
  ctx.drawImage(image, dx, dy, dw, dh);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.anisotropy = 4;
  return new THREE.MeshBasicMaterial({
    map: tex,
  });
}

/**
 * Load Imagine asset from assets/animals/{word}.jpg (or .png), else canvas art.
 * @param {{ word: string, color?: string, image?: string }} entry
 * @param {(mat: THREE.MeshStandardMaterial) => void} onReady
 */
function loadGoalPictureMaterial(entry, onReady) {
  const word = String(entry.word || "?").toUpperCase();
  const base =
    entry.image ||
    `assets/animals/${word.toLowerCase()}.jpg`;
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  const tryUrls = [
    base,
    base.replace(/\.jpg$/i, ".png"),
    base.replace(/\.png$/i, ".jpg"),
  ];

  let i = 0;
  function tryNext() {
    if (i >= tryUrls.length) {
      onReady(makeCanvasGoalMaterial(entry));
      return;
    }
    const url = tryUrls[i++];
    loader.load(
      url,
      (tex) => {
        const img = tex.image;
        tex.dispose();
        onReady(materialFromAnimalImage(img, word));
      },
      undefined,
      () => tryNext()
    );
  }
  tryNext();
}

function disposeMaterial(mat) {
  if (!mat) return;
  if (mat.map) mat.map.dispose();
  mat.dispose();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Continuous path: ALL letter forks sit on the road at once.
 */
export function createPath(scene) {
  const group = new THREE.Group();
  group.name = "path";

  const length = PATH.startZ - PATH.endZ;
  const centerZ = (PATH.startZ + PATH.endZ) / 2;

  const road = new THREE.Mesh(
    new THREE.BoxGeometry(PATH.width, 0.12, length),
    new THREE.MeshStandardMaterial({ color: 0x6b7280 })
  );
  road.position.set(0, 0.06, centerZ);
  group.add(road);

  const railMat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.25, length),
      railMat
    );
    rail.position.set(side * (PATH.width / 2 + 0.1), 0.12, centerZ);
    group.add(rail);
  }

  /**
   * Walk-through letter gates (runner style), not solid blocks.
   * @type {{ root: THREE.Group, letterL: THREE.Mesh, letterR: THREE.Mesh, matL: THREE.Material, matR: THREE.Material }[]}
   */
  const stations = [];
  const maxForks = 8;

  for (let i = 0; i < maxForks; i++) {
    const root = new THREE.Group();
    root.name = `fork-${i}`;
    root.visible = false;

    const leftGate = createWalkThroughGate(laneX(LANE.LEFT), 0x3b82f6);
    const rightGate = createWalkThroughGate(laneX(LANE.RIGHT), 0xef4444);
    root.add(leftGate.gate, rightGate.gate);
    root.position.z = forkMarkerZ(i);
    group.add(root);

    stations.push({
      root,
      letterL: leftGate.letterMesh,
      letterR: rightGate.letterMesh,
      matL: leftGate.letterMesh.material,
      matR: rightGate.letterMesh.material,
      leftGate,
      rightGate,
    });
  }

  function setStationLetters(i, leftChar, rightChar) {
    const s = stations[i];
    if (!s) return;
    const nextL = makeGateLetterMaterial(leftChar, "#3b82f6");
    const nextR = makeGateLetterMaterial(rightChar, "#ef4444");
    s.letterL.material = nextL;
    s.letterR.material = nextR;
    disposeMaterial(s.matL);
    disposeMaterial(s.matR);
    s.matL = nextL;
    s.matR = nextR;
  }

  /**
   * @param {{ left: string, right: string }[]} forkSpecs
   */
  function layoutForks(forkSpecs) {
    for (let i = 0; i < maxForks; i++) {
      const s = stations[i];
      if (i < forkSpecs.length) {
        s.root.visible = true;
        s.root.position.z = forkMarkerZ(i);
        s.root.scale.set(1, 1, 1);
        setStationLetters(i, forkSpecs[i].left, forkSpecs[i].right);
      } else {
        s.root.visible = false;
      }
    }
    setActiveFork(0);
  }

  function setGateOpacity(s, letterOpacity, frameOpacity) {
    if (s.matL) s.matL.opacity = letterOpacity;
    if (s.matR) s.matR.opacity = letterOpacity;
    s.root.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      if (obj === s.letterL || obj === s.letterR) return;
      if (obj.material.transparent) {
        // sheet vs frame: sheets start lower
        const isSheet = obj.geometry && obj.geometry.type === "PlaneGeometry";
        obj.material.opacity = isSheet
          ? frameOpacity * 0.5
          : frameOpacity;
      }
    });
  }

  function setActiveFork(activeIndex) {
    for (let i = 0; i < stations.length; i++) {
      const s = stations[i];
      if (!s.root.visible) continue;
      if (i < activeIndex) {
        s.root.scale.set(0.9, 0.9, 0.9);
        setGateOpacity(s, 0.5, 0.28);
      } else if (i === activeIndex) {
        s.root.scale.set(1.08, 1.08, 1.08);
        setGateOpacity(s, 0.95, 0.58);
      } else {
        s.root.scale.set(1, 1, 1);
        setGateOpacity(s, 0.72, 0.4);
      }
    }
  }

  let goalMat = makeCanvasGoalMaterial({ word: "CAT", color: "#f59e0b" });
  // Fixed sign past the last letters: faces the approach, does not cover forks
  const goalSize = GOAL_BILLBOARD.size;
  const goal = new THREE.Mesh(
    new THREE.PlaneGeometry(goalSize, goalSize),
    goalMat
  );
  const goalZ = PATH.endZ - GOAL_BILLBOARD.zPastEnd;
  goal.position.set(0, GOAL_BILLBOARD.y, goalZ);
  // Face toward path start (players walk -Z toward the sign)
  goal.lookAt(0, GOAL_BILLBOARD.y, PATH.startZ);
  group.add(goal);

  // Post behind the sign from the player's view (more negative Z = farther away)
  const postH = GOAL_BILLBOARD.y - goalSize * 0.15;
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, Math.max(0.5, postH), 0.25),
    new THREE.MeshStandardMaterial({ color: 0x78716c })
  );
  post.position.set(0, Math.max(0.5, postH) / 2, goalZ - 0.35);
  group.add(post);

  /** @type {HTMLVideoElement | null} */
  let activeVideo = null;

  function stopActiveVideo() {
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.removeAttribute("src");
      activeVideo.load();
      activeVideo = null;
    }
  }

  function applyGoalMaterial(next) {
    goal.material = next;
    disposeMaterial(goalMat);
    goalMat = next;
    goal.lookAt(0, GOAL_BILLBOARD.y, PATH.startZ);
  }

  /**
   * Still portrait only (while spelling). No video until celebration.
   */
  function setGoalPicture(entry) {
    const e = entry || { word: "?" };
    stopActiveVideo();
    loadGoalPictureMaterial(e, applyGoalMaterial);
  }

  /**
   * Play looping idle video as a reward after the word is spelled correctly.
   * Falls back to pulsing the still if video is missing.
   */
  function playGoalCelebration(entry) {
    const e = entry || { word: "?" };
    const word = String(e.word || "?").toLowerCase();
    const videoUrl = e.video || `assets/animals/video/${word}.mp4`;

    stopActiveVideo();

    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    let started = false;
    const startVideo = () => {
      if (started) return;
      if (video.readyState < 2) return;
      started = true;
      activeVideo = video;
      const vtex = new THREE.VideoTexture(video);
      if (THREE.SRGBColorSpace) vtex.colorSpace = THREE.SRGBColorSpace;
      vtex.minFilter = THREE.LinearFilter;
      vtex.magFilter = THREE.LinearFilter;
      vtex.generateMipmaps = false;
      applyGoalMaterial(new THREE.MeshBasicMaterial({ map: vtex }));
      video.play().catch(() => {});
    };

    video.addEventListener("canplay", startVideo, { once: true });
    video.addEventListener(
      "error",
      () => {
        // keep current still + pulse
        pulseGoal(true);
      },
      { once: true }
    );
    video.load();
    // In case canplay already fired
    setTimeout(startVideo, 50);
  }

  // Initial still for CAT
  setGoalPicture({ word: "CAT", color: "#f59e0b" });

  function pulseGoal(on) {
    const s = on ? GOAL_BILLBOARD.pulseScale : 1;
    goal.scale.set(s, s, s);
  }

  scene.add(group);

  return {
    group,
    goal,
    layoutForks,
    setActiveFork,
    setGoalPicture,
    playGoalCelebration,
    pulseGoal,
    getLaneX: laneX,
    dispose() {
      for (const s of stations) {
        disposeMaterial(s.matL);
        disposeMaterial(s.matR);
      }
      disposeMaterial(goalMat);
      group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
      });
      scene.remove(group);
    },
  };
}
