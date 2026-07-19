import * as THREE from "three";
import { PATH, LANE, laneX, forkMarkerZ, forkCommitZ } from "./constants.js";
import { createToyBow } from "./models/createToyBow.js";
import { loadBowGlb } from "./models/loadBowGlb.js";

/**
 * Build a simple cute kid character (not a cube): body, head, feet, scarf.
 * @returns {THREE.Group}
 */
function createCharacterMesh() {
  const root = new THREE.Group();
  root.name = "playerCharacter";

  const skin = new THREE.MeshStandardMaterial({
    color: 0xf5c6a0,
    roughness: 0.65,
  });
  const shirt = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.55,
  });
  const pants = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.6,
  });
  const shoe = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.5,
  });
  const hair = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.8,
  });

  // Low-poly segments: enough to look like a person, cheap to draw
  // Torso
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.45, 3, 8), shirt);
  body.position.y = 0.85;
  root.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), skin);
  head.position.y = 1.45;
  root.add(head);

  // Hair cap
  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hair
  );
  hairMesh.position.y = 1.55;
  root.add(hairMesh);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyeMat);
  eyeL.position.set(-0.1, 1.48, 0.22);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.1;
  root.add(eyeL, eyeR);

  // Smile (tiny torus segment)
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 4, 8, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xb45309 })
  );
  smile.position.set(0, 1.35, 0.24);
  smile.rotation.x = Math.PI;
  root.add(smile);

  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.08, 0.28, 3, 6);
  const armL = new THREE.Mesh(armGeo, skin);
  armL.position.set(-0.38, 0.95, 0);
  armL.rotation.z = 0.25;
  const armR = new THREE.Mesh(armGeo, skin);
  armR.position.set(0.38, 0.95, 0);
  armR.rotation.z = -0.25;
  root.add(armL, armR);

  // Bow (hidden until unlock) — slung on back so player can see it (hand use = R-12 later)
  const bow = createBowMesh();
  placeBowOnBack(bow);
  bow.visible = false;
  root.add(bow);
  root.userData.bow = bow;

  // Legs
  const legGeo = new THREE.CapsuleGeometry(0.1, 0.28, 3, 6);
  const legL = new THREE.Mesh(legGeo, pants);
  legL.position.set(-0.14, 0.35, 0);
  const legR = new THREE.Mesh(legGeo, pants);
  legR.position.set(0.14, 0.35, 0);
  root.add(legL, legR);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.18, 0.1, 0.28);
  const shoeL = new THREE.Mesh(shoeGeo, shoe);
  shoeL.position.set(-0.14, 0.08, 0.04);
  const shoeR = new THREE.Mesh(shoeGeo, shoe);
  shoeR.position.set(0.14, 0.08, 0.04);
  root.add(shoeL, shoeR);

  // Face forward toward -Z (down the path)
  root.rotation.y = Math.PI;

  root.userData.limbs = { armL, armR, legL, legR };
  return root;
}

/**
 * Back-carry knobs — LOCKED 2026-07-18 after Imagine refs + A–E follow-cam trials.
 * Winner: trial B (docs/verify/bow-trial-B.png) — C-curve + string readable from rear cam.
 * Refs: assets/generated/bow/archer-back-carry-*.jpg
 * Live: `__letterPathDebug.setBowCarry({ ... })` then screenshot.
 * Character local: face +Z, back −Z, up +Y.
 */
const BOW_CARRY = {
  size: 1.55,
  pos: { x: 0.12, y: 1.0, z: -0.5 },
  /** y=π faces C-curve toward follow camera (not edge-on stick). */
  rot: { x: 0.1, y: Math.PI, z: 0.4 },
  /** Blender Z-up → long axis upright in Three. */
  glbContentRx: -Math.PI / 2,
};

/**
 * Apply BOW_CARRY.pos/rot to shell.
 * @param {THREE.Object3D} shell
 */
function placeBowOnBack(shell) {
  const { pos, rot } = BOW_CARRY;
  shell.position.set(pos.x, pos.y, pos.z);
  shell.rotation.set(rot.x, rot.y, rot.z);
}

/**
 * @param {THREE.Object3D} content
 * @param {"code"|"blender-glb"|"greybox"} source
 */
function orientBowContentUpright(content, source) {
  if (source === "blender-glb") {
    content.rotation.set(BOW_CARRY.glbContentRx, 0, 0);
  } else {
    content.rotation.set(0, 0, 0);
  }
}

/**
 * Carry shell. Procedural first; Blender GLB swapped in when loaded.
 */
function createBowMesh() {
  const shell = new THREE.Group();
  shell.name = "bow";
  try {
    const code = createToyBow({ scale: BOW_CARRY.size / 1.35 });
    code.name = "bowCode";
    orientBowContentUpright(code, "code");
    shell.add(code);
    shell.userData.bowSource = "code";
  } catch (err) {
    console.warn("createToyBow failed", err);
    const wood = new THREE.MeshBasicMaterial({ color: 0xa16207 });
    shell.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), wood));
    shell.userData.bowSource = "greybox";
  }
  return shell;
}

/**
 * Prefer Blender GLB when available (still carried on back until R-12 hand use).
 * @param {THREE.Group} characterRoot
 */
async function upgradeBowFromGlb(characterRoot) {
  const shell = characterRoot.userData.bow;
  if (!shell) return;
  try {
    const glb = await loadBowGlb();
    const dim = glb.userData.nativeMaxDim || 1;
    glb.scale.setScalar(BOW_CARRY.size / dim);
    orientBowContentUpright(glb, "blender-glb");
    glb.name = "bowBlender";
    const arrow = glb.userData.parts?.arrow;
    if (arrow) arrow.visible = false;
    while (shell.children.length) shell.remove(shell.children[0]);
    shell.add(glb);
    placeBowOnBack(shell);
    shell.userData.bowSource = "blender-glb";
    shell.userData.bowVersion = glb.userData.version || 4;
    shell.userData.sockets = glb.userData.sockets;
    shell.userData.parts = glb.userData.parts;
    shell.userData.content = glb;
  } catch (err) {
    console.warn("Blender bow GLB not used; keeping code bow", err);
  }
}

/**
 * Auto-walks along -Z; L/R keys steer the lane.
 * Letter is scored only when the player runs through the fork (crosses commit Z).
 */
export function createPlayer(scene) {
  const mesh = createCharacterMesh();
  mesh.position.set(0, 0, PATH.startZ);
  scene.add(mesh);
  // Non-blocking: swap hand bow to Blender export when GLB ready
  const bowReady = upgradeBowFromGlb(mesh);

  let lane = LANE.CENTER;
  let resolvedThisFork = false;
  let activeIndex = 0;
  let commitZ = forkCommitZ(0);
  let markerZ = forkMarkerZ(0);
  let snapK = 12;
  let walkPhase = 0;

  function resetRun() {
    mesh.position.set(0, 0, PATH.startZ);
    lane = LANE.CENTER;
    resolvedThisFork = false;
    activeIndex = 0;
    commitZ = forkCommitZ(0);
    markerZ = forkMarkerZ(0);
    snapK = 12;
    walkPhase = 0;
  }

  function armFork(letterIndex) {
    activeIndex = letterIndex;
    commitZ = forkCommitZ(letterIndex);
    markerZ = forkMarkerZ(letterIndex);
    resolvedThisFork = false;
    snapK = 12;
  }

  function chooseLane(side) {
    if (resolvedThisFork) return false;
    if (side !== LANE.LEFT && side !== LANE.RIGHT) return false;
    if (mesh.position.z < commitZ) return false;
    lane = side;
    snapK = 24;
    return true;
  }

  function markForkResolved() {
    resolvedThisFork = true;
  }

  function updateWalkAnim(dt) {
    walkPhase += dt * 10;
    const swing = Math.sin(walkPhase) * 0.35;
    const { armL, armR, legL, legR } = mesh.userData.limbs || {};
    if (armL) armL.rotation.x = swing;
    if (armR) armR.rotation.x = -swing;
    if (legL) legL.rotation.x = -swing * 0.8;
    if (legR) legR.rotation.x = swing * 0.8;
  }

  /**
   * @param {number} dt
   * @returns {{ finished: boolean, justCommitted: boolean }}
   */
  function update(dt) {
    let justCommitted = false;
    mesh.position.z -= PATH.speed * dt;

    if (!resolvedThisFork && mesh.position.z <= commitZ) {
      justCommitted = true;
      resolvedThisFork = true;
    }

    const targetX = laneX(lane);
    const currentX = mesh.position.x;
    mesh.position.x += (targetX - currentX) * Math.min(1, snapK * dt);
    snapK += (12 - snapK) * Math.min(1, 2.5 * dt);

    updateWalkAnim(dt);

    const finished = mesh.position.z <= PATH.endZ;
    return { finished, justCommitted };
  }

  function getPosition() {
    return mesh.position;
  }

  function setBowEquipped(on) {
    if (mesh.userData.bow) {
      mesh.userData.bow.visible = Boolean(on);
    }
  }

  function getBowSource() {
    return mesh.userData.bow?.userData?.bowSource || "none";
  }

  function getBowSockets() {
    return mesh.userData.bow?.userData?.sockets || null;
  }

  function getBowVersion() {
    return mesh.userData.bow?.userData?.bowVersion || 0;
  }

  /** Snapshot of live carry knobs (for debug / screenshot loop). */
  function getBowCarry() {
    return {
      size: BOW_CARRY.size,
      pos: { ...BOW_CARRY.pos },
      rot: { ...BOW_CARRY.rot },
      glbContentRx: BOW_CARRY.glbContentRx,
    };
  }

  /**
   * Live-tune back carry without reload. Partial patch OK.
   * Example: setBowCarry({ pos: { z: -0.55 }, size: 1.3 })
   * @param {{ size?: number, pos?: Partial<{x:number,y:number,z:number}>, rot?: Partial<{x:number,y:number,z:number}>, glbContentRx?: number }} patch
   */
  function setBowCarry(patch = {}) {
    if (typeof patch.size === "number") BOW_CARRY.size = patch.size;
    if (patch.pos) Object.assign(BOW_CARRY.pos, patch.pos);
    if (patch.rot) Object.assign(BOW_CARRY.rot, patch.rot);
    if (typeof patch.glbContentRx === "number") BOW_CARRY.glbContentRx = patch.glbContentRx;

    const shell = mesh.userData.bow;
    if (!shell) return getBowCarry();
    placeBowOnBack(shell);
    const content = shell.userData.content || shell.children[0];
    const src = shell.userData.bowSource || "code";
    if (content) {
      orientBowContentUpright(content, src === "blender-glb" ? "blender-glb" : "code");
      const dim = content.userData?.nativeMaxDim;
      if (src === "blender-glb" && dim) {
        content.scale.setScalar(BOW_CARRY.size / dim);
      } else if (src === "code") {
        // procedural was built at size/1.35; re-scale root
        content.scale.setScalar(BOW_CARRY.size / 1.35);
      }
    }
    return getBowCarry();
  }

  return {
    mesh,
    bowReady,
    resetRun,
    chooseLane,
    armFork,
    markForkResolved,
    setBowEquipped,
    getBowSource,
    getBowSockets,
    getBowVersion,
    getBowCarry,
    setBowCarry,
    update,
    getPosition,
    getLane: () => lane,
    isResolvedThisFork: () => resolvedThisFork,
    getActiveIndex: () => activeIndex,
    getCommitZ: () => commitZ,
    getMarkerZ: () => markerZ,
    getX: () => mesh.position.x,
    dispose() {
      mesh.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      scene.remove(mesh);
    },
  };
}
