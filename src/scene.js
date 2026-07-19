import * as THREE from "three";
import { PATH } from "./constants.js";

/**
 * Soft grass-like canvas texture (cheap, no images required).
 */
function makeGrassTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#4a8f3a";
  ctx.fillRect(0, 0, size, size);
  // mottled patches
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 4 + Math.random() * 18;
    ctx.fillStyle = Math.random() > 0.5 ? "#3f7a32" : "#5aa045";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // short blade strokes
  ctx.strokeStyle = "rgba(30, 90, 30, 0.35)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 3 - Math.random() * 5);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 28);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCloudMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
}

/**
 * Soft cloud from a few overlapping spheres.
 */
function makeCloud(x, y, z, scale = 1) {
  const g = new THREE.Group();
  const mat = makeCloudMaterial();
  const parts = [
    [0, 0, 0, 1],
    [0.9, 0.15, 0.1, 0.75],
    [-0.85, 0.1, -0.05, 0.7],
    [0.2, 0.45, 0, 0.65],
    [-0.3, 0.35, 0.15, 0.55],
  ];
  for (const [px, py, pz, s] of parts) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(s * scale, 8, 6),
      mat
    );
    m.position.set(px * scale, py * scale, pz * scale);
    g.add(m);
  }
  g.position.set(x, y, z);
  return g;
}

/**
 * Scene: sky, sun, clouds, long grass ground, lights, camera, renderer.
 */
export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x7ec8e8, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x9ad0ea, 45, 120);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 7, 12);
  camera.lookAt(0, 1, -12);

  const ambient = new THREE.AmbientLight(0xffffff, 0.62);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xfff2cc, 0.95);
  sunLight.position.set(12, 28, 8);
  scene.add(sunLight);

  // Sky dome wash (slightly deeper blue at top)
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(140, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0x6bb7e0,
      side: THREE.BackSide,
      fog: false,
    })
  );
  scene.add(sky);

  // Sun disc in the sky
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe566, fog: false })
  );
  sunMesh.position.set(18, 32, -25);
  scene.add(sunMesh);
  // Soft glow shell
  const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(4.8, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xfff0a8,
      transparent: true,
      opacity: 0.35,
      fog: false,
      depthWrite: false,
    })
  );
  sunGlow.position.copy(sunMesh.position);
  scene.add(sunGlow);

  // Clouds along the path (cheap sphere clusters)
  const clouds = new THREE.Group();
  clouds.add(makeCloud(-14, 16, -8, 2.2));
  clouds.add(makeCloud(12, 18, -22, 2.6));
  clouds.add(makeCloud(-8, 15, -40, 2.0));
  clouds.add(makeCloud(16, 17, -55, 2.4));
  clouds.add(makeCloud(-18, 19, -70, 2.8));
  clouds.add(makeCloud(6, 14, 6, 1.8));
  scene.add(clouds);

  // Ground: covers full path length + margins (road ends at endZ, start beyond startZ)
  const pathLen = PATH.startZ - PATH.endZ;
  const groundLen = pathLen + 40;
  const groundCenterZ = (PATH.startZ + PATH.endZ) / 2;
  const grassTex = makeGrassTexture();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(48, groundLen),
    new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0xffffff,
      roughness: 0.95,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = groundCenterZ;
  ground.position.y = -0.02;
  scene.add(ground);

  // A few darker grass patches for depth (no new textures)
  const patchMat = new THREE.MeshBasicMaterial({
    color: 0x3a6e30,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  for (let i = 0; i < 18; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(1.2 + Math.random() * 1.8, 8),
      patchMat
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      side * (4 + Math.random() * 10),
      0.01,
      PATH.startZ - Math.random() * pathLen
    );
    scene.add(patch);
  }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Portrait phones: FOV is vertical in Three.js, so tall aspect squeezes
    // horizontal view — widen FOV so L/R gates stay readable.
    if (height > width * 1.05) {
      camera.fov = width < 420 ? 68 : 62;
    } else if (width < 900) {
      camera.fov = 55;
    } else {
      camera.fov = 50;
    }
    camera.updateProjectionMatrix();
  }

  function render() {
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  // Mobile browser chrome show/hide
  window.visualViewport?.addEventListener("resize", resize);

  return {
    scene,
    camera,
    renderer,
    resize,
    render,
    dispose() {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      ground.geometry.dispose();
      ground.material.map?.dispose();
      ground.material.dispose();
      renderer.dispose();
    },
  };
}
