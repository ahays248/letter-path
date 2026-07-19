import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/** Bump when replacing bow-blender.glb so browsers skip stale cache */
export const BOW_GLB_URL = "assets/models/bow-blender.glb?v=4";

/** @type {Promise<THREE.Object3D> | null} */
let cache = null;

/**
 * Find named object in hierarchy (case-sensitive first, then ignore case).
 * @param {THREE.Object3D} root
 * @param {string} name
 */
function findByName(root, name) {
  let found = null;
  root.traverse((o) => {
    if (found) return;
    if (o.name === name || o.name.toLowerCase() === name.toLowerCase()) found = o;
  });
  return found;
}

/**
 * Rest pose: string is TAUT (straight tip-to-tip), not a drawn/slack V.
 * Replaces exported String mesh using TipWrap / LimbTip anchors.
 * @param {THREE.Object3D} root
 * @returns {THREE.Mesh | null}
 */
function replaceStringWithTaut(root) {
  const tipA =
    findByName(root, "TipWrap_0") ||
    findByName(root, "LimbTip_0") ||
    findByName(root, "BowTip_0");
  const tipB =
    findByName(root, "TipWrap_1") ||
    findByName(root, "LimbTip_1") ||
    findByName(root, "BowTip_1");
  if (!tipA || !tipB) return null;

  root.updateMatrixWorld(true);
  const wa = new THREE.Vector3();
  const wb = new THREE.Vector3();
  tipA.getWorldPosition(wa);
  tipB.getWorldPosition(wb);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const la = wa.clone().applyMatrix4(inv);
  const lb = wb.clone().applyMatrix4(inv);

  // Hide old string mesh(es)
  root.traverse((o) => {
    if (o.name === "String" || o.name === "string") {
      o.visible = false;
    }
  });

  const dir = new THREE.Vector3().subVectors(lb, la);
  const len = dir.length();
  if (len < 1e-4) return null;
  const mid = new THREE.Vector3().addVectors(la, lb).multiplyScalar(0.5);

  // Match rope look (export materials may be shared; simple tan is fine)
  let ropeMat = null;
  const oldStr = findByName(root, "String");
  if (oldStr && oldStr.isMesh && oldStr.material) {
    ropeMat = Array.isArray(oldStr.material) ? oldStr.material[0] : oldStr.material;
  }
  if (!ropeMat) {
    ropeMat = new THREE.MeshStandardMaterial({
      color: 0xe8d9b8,
      roughness: 0.9,
      metalness: 0,
    });
  }

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, len, 8),
    ropeMat
  );
  mesh.name = "String";
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  mesh.castShadow = true;
  root.add(mesh);

  // Nock socket at taut midpoint (draw will pull this later)
  let nock = findByName(root, "socket_nock");
  if (!nock) {
    nock = new THREE.Object3D();
    nock.name = "socket_nock";
    root.add(nock);
  }
  nock.position.copy(mid);

  return mesh;
}

/**
 * Load Blender-exported modular toy bow (glTF/GLB).
 * Prefers hierarchy: LetterPathBow / Limb / Grip / String / Arrow / socket_hand / socket_nock.
 * @param {string} [url]
 * @returns {Promise<THREE.Group>}
 */
export function loadBowGlb(url = BOW_GLB_URL) {
  if (!cache) {
    cache = new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const scene = gltf.scene || gltf.scenes?.[0];
          if (!scene) {
            reject(new Error("GLB has no scene"));
            return;
          }

          let root = findByName(scene, "LetterPathBow") || scene;
          root = scene;
          root.name = "bowBlender";

          root.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });

          // Normalize scale from bounding box (keep hierarchy)
          const box = new THREE.Box3().setFromObject(root);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);
          root.position.sub(center);

          // Rest string: taut tip-to-tip (export had a drawn/slack curve)
          const tautString = replaceStringWithTaut(root);

          const socketHand = findByName(root, "socket_hand");
          const socketNock = findByName(root, "socket_nock");
          const stringMesh = tautString || findByName(root, "String");
          const arrow = findByName(root, "Arrow");
          const limb = findByName(root, "Limb");
          const grip = findByName(root, "Grip");

          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          root.userData.nativeMaxDim = maxDim;
          root.userData.source = "blender-glb";
          root.userData.version = 4;
          root.userData.sockets = {
            hand: socketHand || null,
            nock: socketNock || null,
          };
          root.userData.parts = {
            limb: limb || null,
            grip: grip || null,
            string: stringMesh || null,
            arrow: arrow || null,
          };
          if (arrow) {
            arrow.userData.defaultVisible = false;
          }

          resolve(root);
        },
        undefined,
        (err) => reject(err)
      );
    });
  }
  return cache.then((root) => {
    const clone = root.clone(true);
    const find = (name) => {
      let f = null;
      clone.traverse((o) => {
        if (!f && (o.name === name || o.name.toLowerCase() === name.toLowerCase())) f = o;
      });
      return f;
    };
    // Prefer visible taut String (hidden export may still exist)
    let stringNode = null;
    clone.traverse((o) => {
      if (o.name === "String" && o.visible) stringNode = o;
    });
    if (!stringNode) stringNode = find("String");
    clone.userData.sockets = {
      hand: find("socket_hand"),
      nock: find("socket_nock"),
    };
    clone.userData.parts = {
      limb: find("Limb"),
      grip: find("Grip"),
      string: stringNode,
      arrow: find("Arrow"),
    };
    clone.userData.nativeMaxDim = root.userData.nativeMaxDim;
    clone.userData.source = root.userData.source;
    clone.userData.version = root.userData.version;
    return clone;
  });
}

/** Clear module cache (tests / hot reload after new export). */
export function clearBowGlbCache() {
  cache = null;
}
