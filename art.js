// A twilight refuge: warmer materials, a readable silhouette, and a quiet sky.
scene.fog.color.set(0x303746);
sun.color.set(0xffd7a7);
moon.color.set(0xb3b9ff);
hemi.color.set(0xe5ddf3);
hemi.groundColor.set(0x4f5260);
Object.assign(sun.shadow.camera, {
  left: -17,
  right: 17,
  top: 17,
  bottom: -17,
  near: 1,
  far: 60,
});
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0007;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const artMaterials = new Map();
function artMat(color) {
  if (!artMaterials.has(color))
    artMaterials.set(
      color,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.88,
        flatShading: true,
      }),
    );
  return artMaterials.get(color);
}
function artMesh(geometry, color, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(geometry, artMat(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Geological edges make the valley feel like an object held in space.
const rockBase = artMesh(
  new THREE.CylinderGeometry(14.35, 12.8, 1.3, 72),
  0x595966,
  0,
  -1.55,
  0,
);
const sediment = artMesh(
  new THREE.CylinderGeometry(14.4, 14.1, 0.23, 72),
  0x9a917e,
  0,
  -0.56,
  0,
);
rockBase.receiveShadow = true;
const halo = new THREE.Mesh(
  new THREE.RingGeometry(15.1, 15.125, 160),
  new THREE.MeshBasicMaterial({
    color: 0xc2adc9,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
  }),
);
halo.rotation.x = -Math.PI / 2;
halo.position.y = -1.8;
scene.add(halo);
const starsData = new Float32Array(150 * 3);
for (let i = 0; i < starsData.length; i += 3) {
  starsData[i] = (Math.random() - 0.5) * 90;
  starsData[i + 1] = 5 + Math.random() * 30;
  starsData[i + 2] = -12 - Math.random() * 35;
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starsData, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    color: 0xd1cce5,
    size: 0.065,
    transparent: true,
    opacity: 0.6,
    fog: false,
  }),
);
scene.add(stars);

// Keep the front clearing open. Distinct leafy silhouettes replace the cone wall.
trees.forEach((tree, i) => {
  const a = Math.atan2(tree.position.z, tree.position.x);
  if (tree.position.z > 4 && tree.position.x > -7 && tree.position.x < 7) {
    tree.position.x = Math.cos(a) * 12.1;
    tree.position.z = Math.sin(a) * 12.1;
  }
  const crown = tree.children[1];
  crown.material = artMat([0x718170, 0x75867d, 0x8b867a, 0x666e77][i % 4]);
  if (i % 3 !== 0) {
    crown.geometry = new THREE.IcosahedronGeometry(0.95, 0);
    crown.scale.set(1, 1.25, 0.9);
    crown.position.y = 2.3;
    const upper = artMesh(
      new THREE.IcosahedronGeometry(0.65, 0),
      i % 2 ? 0x899780 : 0x7c8e85,
      0.27,
      2.9,
      0.05,
      tree,
    );
    upper.scale.set(0.9, 1.2, 0.9);
  }
  tree.children[0].material = artMat(0x736252);
});
waterMat.color.set(0x789b9b);
waterMat.roughness = 0.23;
waterMat.opacity = 0.85;
tower.material = artMat(0x8a8794);
tower.scale.set(1.08, 1, 1.08);
for (let i = 0; i < 4; i++) {
  const ledge = artMesh(
    new THREE.CylinderGeometry(0.78 + i * 0.025, 0.84 + i * 0.025, 0.1, 8),
    0xa5a096,
    -6,
    1 + i * 1.55,
    -5,
  );
  ledge.rotation.y = 0.2;
}
const towerCrown = artMesh(
  new THREE.TorusGeometry(0.75, 0.09, 6, 24),
  0xb8a580,
  -6,
  6.7,
  -5,
);
towerCrown.rotation.x = Math.PI / 2;

// A weathered carriage, with ribs, an entry, and a signal panel.
body.material = artMat(0x737f85);
machineCap.material = artMat(0x8c9696);
for (let i = 0; i < 6; i++) {
  artMesh(
    new THREE.BoxGeometry(0.055, 2.7, 0.05),
    0xa8a897,
    -2.3 + i * 0.92,
    0.2,
    1.28,
    machine,
  );
}
const machineDoor = artMesh(
  new THREE.BoxGeometry(0.9, 1.65, 0.05),
  0x303944,
  -0.3,
  -0.1,
  1.3,
  machine,
);
for (const x of [-0.82, 0.22])
  artMesh(
    new THREE.BoxGeometry(0.09, 1.85, 0.12),
    0xb4a486,
    x,
    -0.03,
    1.36,
    machine,
  );
artMesh(
  new THREE.BoxGeometry(1.14, 0.1, 0.12),
  0xb4a486,
  -0.3,
  0.87,
  1.36,
  machine,
);
const panelGlow = artMesh(
  new THREE.BoxGeometry(0.46, 0.18, 0.06),
  0xa5d6d7,
  1.55,
  0.55,
  1.34,
  machine,
);
panelGlow.material = new THREE.MeshStandardMaterial({
  color: 0x94bbc2,
  emissive: 0x78b6c3,
  emissiveIntensity: 0.12,
});
pathTargets.machine.set(3.5, 0, -1.1);
pathTargets.storm.set(3.5, 0, -1.1);
pathTargets.harvest = new THREE.Vector3(-3.7, 0, 2.7);
pathTargets.eren_confession = new THREE.Vector3(0.6, 0, 3.5);
pathTargets.revelation = new THREE.Vector3(2.6, 0, 3.5);

// Mara's ochre coat is a visual anchor among muted neighbors.
mara.userData.torso.material = artMat(0xd3a875);
for (const part of ["la", "ra"])
  mara.userData[part].mesh.material = artMat(0xc79b70);
for (const part of ["ll", "rl"])
  mara.userData[part].mesh.material = artMat(0x5e6574);
const wrap = artMesh(
  new THREE.CylinderGeometry(0.23, 0.28, 0.13, 10),
  0x9890b0,
  0,
  1.83,
  0,
  mara,
);
const scarfTail = artMesh(
  new THREE.BoxGeometry(0.16, 0.4, 0.04),
  0x9890b0,
  0.13,
  1.59,
  0.32,
  mara,
);
const maraRing = new THREE.Mesh(
  new THREE.RingGeometry(0.45, 0.48, 48),
  new THREE.MeshBasicMaterial({
    color: 0xf6d29a,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
);
maraRing.rotation.x = -Math.PI / 2;
scene.add(maraRing);
for (const person of [mara, eren, ...villagers, ...raiders]) {
  for (const leg of ["ll", "rl"]) {
    person.userData[leg].mesh.position.y = -0.3;
    person.userData[leg].mesh.scale.y = 1.3;
    artMesh(
      new THREE.BoxGeometry(0.19, 0.13, 0.32),
      0x4b4950,
      0,
      -0.8,
      0.06,
      person.userData[leg].pivot,
    );
  }
  person.userData.head.material = artMat(0xc4a18b);
}

// Refuge homes grow from makeshift structures into warm, inhabited places.
huts.forEach((hut, i) => {
  hut.userData.wallMat.color.set([0xb4a183, 0xa6948e, 0xb4ac93][i % 3]);
  hut.userData.roofMat.color.set(0x7a6b80);
});
const campTents = [];
for (const [x, z, r] of [
  [-0.3, 4.7, 0.4],
  [3.8, 3.7, -0.7],
]) {
  const tent = new THREE.Group();
  tent.position.set(x, 0, z);
  tent.rotation.y = r;
  scene.add(tent);
  for (const sign of [-1, 1]) {
    const sheet = artMesh(
      new THREE.BoxGeometry(1.05, 0.04, 1.4),
      0xb3a896,
      sign * 0.35,
      0.49,
      0,
      tent,
    );
    sheet.rotation.z = sign * 0.84;
  }
  const pole = artMesh(
    new THREE.CylinderGeometry(0.03, 0.035, 1.55, 5),
    0x756449,
    0,
    0.93,
    0,
    tent,
  );
  pole.rotation.x = Math.PI / 2;
  campTents.push(tent);
}
// Small pools of warm light: enough to guide the eye without washing out night.
const lanterns = [];
for (const [x, z] of [
  [0.8, 2.4],
  [-3.1, 2],
  [3.1, -1],
  [4.6, 4.6],
]) {
  artMesh(new THREE.CylinderGeometry(0.022, 0.03, 0.8, 5), 0x88785c, x, 0.4, z);
  const glass = artMesh(
    new THREE.BoxGeometry(0.14, 0.2, 0.14),
    0xffd59c,
    x,
    0.88,
    z,
  );
  glass.material = new THREE.MeshBasicMaterial({ color: 0xffd09a });
  const lamp = new THREE.PointLight(0xffc583, 1.1, 3, 2);
  lamp.position.set(x, 0.9, z);
  scene.add(lamp);
  lanterns.push(lamp);
}

let cameraMode = "wide",
  autoCamera = false;
function wideCamera() {
  cameraMode = "wide";
  const narrow = host.clientWidth < 600;
  controls.target.set(0, 1, 0);
  camera.position.set(narrow ? 32 : 22, narrow ? 28 : 19, narrow ? 39 : 28);
  controls.minDistance = 4;
  controls.maxDistance = 70;
  controls.update();
}
function closeCamera() {
  cameraMode = "follow";
  const target = mara.position.clone().add(new THREE.Vector3(0, 1.3, 0));
  controls.target.copy(target);
  camera.position.copy(target).add(new THREE.Vector3(3, 2.2, 5.7));
  controls.update();
}
function resetLifeArt() {
  clearTimeout(flashOmen.timer);
  $("omen").style.opacity = 0;
  $("omen").textContent = "";
  graveStones.forEach((stone) => {
    scene.remove(stone);
    stone.geometry.dispose();
    stone.material.dispose();
  });
  graveStones.length = 0;
  mara.visible = true;
  mara.position.set(0.3, 0, 0.2);
  mara.rotation.set(0, 0, 0);
  huts.forEach((h) => {
    h.userData.everBuilt = false;
    h.scale.setScalar(0.001);
  });
  windWheel.userData.permanent = false;
  windWheel.scale.setScalar(0.001);
  garden.visible = false;
  bubbleLayer.forEach((b) => {
    b.sprite.visible = false;
    b.person = null;
  });
  lastEventSeen = "";
  raidTimer = 0;
  nextTalkAt = visualNow + 5000;
  wideCamera();
  $("followCamera").setAttribute("aria-pressed", "false");
  updateWorldTarget();
}
function updateArt(now, dt) {
  document
    .querySelector(".scene-intro")
    .classList.toggle("close-view", cameraMode === "follow");
  panelGlow.material.emissiveIntensity = 0.15 + state.techAwake * 1.5;
  campTents.forEach(
    (tent, i) => (tent.visible = state.settlement < 0.28 + i * 0.09),
  );
  mara.visible = state.alive;
  maraRing.visible = state.alive;
  maraRing.position.set(mara.position.x, 0.025, mara.position.z);
  mara.userData.torso.rotation.x =
    (1 - state.health) * 0.12 + (state.traits.fear - 0.4) * 0.09;
  if (cameraMode === "follow" && state.alive) {
    const next = mara.position.clone().add(new THREE.Vector3(0, 1.3, 0));
    const offset = next.clone().sub(controls.target);
    camera.position.add(offset);
    controls.target.copy(next);
  }
  controls.autoRotate = autoCamera;
  controls.autoRotateSpeed = 0.35;
  const p = mara.position
      .clone()
      .add(new THREE.Vector3(0, 3.35, 0))
      .project(camera),
    label = document.getElementById("maraLabel");
  label.hidden =
    !state.alive || p.z > 1 || Math.abs(p.x) > 1.1 || Math.abs(p.y) > 1.1;
  label.style.left = `${Math.max(60, Math.min(host.clientWidth - 60, (p.x * 0.5 + 0.5) * host.clientWidth))}px`;
  label.style.top = `${Math.max(40, Math.min(host.clientHeight - 50, (-p.y * 0.5 + 0.5) * host.clientHeight))}px`;
}
function resizeWorld() {
  const width = host.clientWidth,
    height = host.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (cameraMode === "wide") wideCamera();
}
new ResizeObserver(resizeWorld).observe(host);
renderer.domElement.setAttribute(
  "aria-label",
  "Three-dimensional refuge. Drag to orbit, scroll or pinch to zoom.",
);
renderer.domElement.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  document.getElementById("worldError").hidden = false;
});
