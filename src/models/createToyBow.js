import * as THREE from "three";

/**
 * Procedural toy bow (img2threejs-style factory).
 * Reference: tools/img2threejs/refs/toy-bow-ref.jpg
 * Smoke path: Imagine ref → agent procedural rebuild → vanilla THREE.Group.
 *
 * @param {{ scale?: number }} [options]
 * @returns {THREE.Group}
 */
export function createToyBow(options = {}) {
  const scale = options.scale ?? 1;
  const root = new THREE.Group();
  root.name = "toyBow";

  const wood = new THREE.MeshStandardMaterial({
    color: 0xc48a4a,
    roughness: 0.72,
    metalness: 0.05,
  });
  const woodDark = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.78,
    metalness: 0.04,
  });
  const cloth = new THREE.MeshStandardMaterial({
    color: 0x4db8b0,
    roughness: 0.85,
    metalness: 0,
  });
  const clothStripe = new THREE.MeshStandardMaterial({
    color: 0x7ecfc8,
    roughness: 0.88,
    metalness: 0,
  });
  const rope = new THREE.MeshStandardMaterial({
    color: 0xe8d9b8,
    roughness: 0.9,
    metalness: 0,
  });

  const nodes = {};
  const sockets = {};

  // ---- curved limb via segments along a shallow C arc in the XY plane ----
  // Tips near +Y/-Y with string on the -X side (grip toward +X relative to string)
  const limb = new THREE.Group();
  limb.name = "limb";
  const segCount = 10;
  const R = 0.55;
  const halfAngle = 0.95; // radians along arc
  for (let i = 0; i < segCount; i++) {
    const t0 = i / segCount;
    const t1 = (i + 1) / segCount;
    const a0 = -halfAngle + t0 * 2 * halfAngle;
    const a1 = -halfAngle + t1 * 2 * halfAngle;
    const aMid = (a0 + a1) / 2;
    // Arc centered so tips sit near x=0.12 and belly near x=0.42
    const cx = 0.28;
    const x = cx - Math.cos(aMid) * R * 0.55;
    const y = Math.sin(aMid) * R;
    const len = R * 2 * halfAngle * (1 / segCount) * 1.05;
    const r = 0.038 - Math.abs(t0 - 0.5) * 0.012;
    const geo = new THREE.CapsuleGeometry(r, Math.max(0.02, len - r * 2), 3, 6);
    const mat = i % 3 === 0 ? woodDark : wood;
    const seg = new THREE.Mesh(geo, mat);
    seg.position.set(x, y, 0);
    seg.rotation.z = aMid + Math.PI / 2;
    seg.castShadow = true;
    limb.add(seg);
  }
  // tip bulbs
  for (const sy of [1, -1]) {
    const tipA = sy * halfAngle;
    const x = 0.28 - Math.cos(tipA) * R * 0.55;
    const y = Math.sin(tipA) * R;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), wood);
    bulb.position.set(x, y, 0);
    bulb.scale.set(1.1, 1.35, 0.9);
    limb.add(bulb);
  }
  root.add(limb);
  nodes.limb = limb;

  // ---- teal cloth wrap at grip (center of arc) ----
  const grip = new THREE.Group();
  grip.name = "gripWrap";
  const wrapR = 0.055;
  for (let i = 0; i < 7; i++) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(wrapR, 0.014, 6, 12),
      i % 2 === 0 ? cloth : clothStripe
    );
    band.rotation.y = Math.PI / 2;
    band.position.set(0.28 - Math.cos(0) * R * 0.55 + 0.02, (i - 3) * 0.028, 0);
    grip.add(band);
  }
  // little knot / tag
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), cloth);
  knot.position.set(0.18, -0.02, 0.04);
  knot.scale.set(1.2, 0.7, 0.9);
  grip.add(knot);
  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.012), clothStripe);
  tag.position.set(0.14, -0.06, 0.05);
  tag.rotation.z = 0.4;
  grip.add(tag);
  root.add(grip);
  nodes.grip = grip;
  sockets.hold = grip;

  // ---- rope string + tip wraps (TAUT at rest — straight tip-to-tip, not drawn V) ----
  const string = new THREE.Group();
  string.name = "string";
  const tipUpper = new THREE.Vector3(
    0.28 - Math.cos(halfAngle) * R * 0.55,
    Math.sin(halfAngle) * R,
    0
  );
  const tipLower = new THREE.Vector3(
    0.28 - Math.cos(-halfAngle) * R * 0.55,
    Math.sin(-halfAngle) * R,
    0
  );
  // Nock sits on the taut string midpoint (for future draw offset)
  const nockPos = new THREE.Vector3().addVectors(tipUpper, tipLower).multiplyScalar(0.5);

  function addRopeSegment(a, b, radius = 0.012) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, len, 6),
      rope
    );
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    string.add(mesh);
  }

  // Single taut segment between tips
  addRopeSegment(tipUpper, tipLower, 0.011);

  // tip rope wraps (rings)
  for (const tip of [tipUpper, tipLower]) {
    const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 5, 10), rope);
    wrap.position.copy(tip);
    wrap.rotation.z = Math.PI / 2;
    string.add(wrap);
  }
  root.add(string);
  nodes.string = string;
  sockets.nock = (() => {
    const n = new THREE.Object3D();
    n.position.copy(nockPos);
    root.add(n);
    return n;
  })();

  root.scale.setScalar(scale);
  root.userData.sculptRuntime = {
    nodes,
    sockets,
    materials: { wood, woodDark, cloth, clothStripe, rope },
    source: "img2threejs-smoke",
    reference: "tools/img2threejs/refs/toy-bow-ref.jpg",
  };

  return root;
}
