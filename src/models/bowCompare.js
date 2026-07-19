import * as THREE from "three";
import { createToyBow } from "./createToyBow.js";
import { loadBowGlb, BOW_GLB_URL } from "./loadBowGlb.js";
import { PATH } from "../constants.js";

function makeLabel(text) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 28px system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), mat);
  mesh.name = `label-${text}`;
  return mesh;
}

function makePedestal(color) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.5, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  post.position.y = 0.25;
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.55 })
  );
  top.position.y = 0.53;
  g.add(post, top);
  return g;
}

/**
 * Offline / debug: side-by-side code vs Blender bows.
 * Not loaded by main.js after session close 2026-07-18 (A/B finished).
 * Re-import only if you need another art comparison.
 *
 * @param {THREE.Scene} scene
 * @returns {Promise<{ root: THREE.Group, dispose: () => void }>}
 */
export async function addBowCompare(scene) {
  const root = new THREE.Group();
  root.name = "bowCompare";
  // Slightly left of path, in front of start so ready camera can see them
  root.position.set(-2.4, 0, PATH.startZ - 0.5);

  const codeStand = makePedestal(0x64748b);
  codeStand.position.x = -0.7;
  const blendStand = makePedestal(0x0ea5e9);
  blendStand.position.x = 0.7;
  root.add(codeStand, blendStand);

  const codeBow = createToyBow({ scale: 0.9 });
  codeBow.position.set(-0.7, 0.85, 0);
  codeBow.rotation.y = 0.4;
  root.add(codeBow);

  const codeLabel = makeLabel("Code (img2)");
  codeLabel.position.set(-0.7, 1.55, 0.2);
  root.add(codeLabel);

  const blendLabel = makeLabel("Blender v3");
  blendLabel.position.set(0.7, 1.55, 0.2);
  root.add(blendLabel);

  scene.add(root);

  try {
    const blenderBow = await loadBowGlb(BOW_GLB_URL);
    const dim = blenderBow.userData.nativeMaxDim || 1;
    blenderBow.scale.setScalar(0.9 / dim);
    blenderBow.position.set(0.7, 0.85, 0);
    blenderBow.rotation.y = -0.35;
    // Pedestal shows modular rest pose including arrow
    const arrow = blenderBow.userData.parts?.arrow;
    if (arrow) arrow.visible = true;
    root.add(blenderBow);
  } catch (err) {
    console.warn("bowCompare: failed to load GLB", err);
    const fail = makeLabel("GLB missing");
    fail.position.set(0.7, 0.9, 0);
    root.add(fail);
  }

  return {
    root,
    dispose() {
      scene.remove(root);
      root.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of mats) {
            if (m.map) m.map.dispose();
            m.dispose();
          }
        }
      });
    },
  };
}
