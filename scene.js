// --- THREE.JS LIVING DIORAMA ---
let visualNow = 0;
const host = document.getElementById("world");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0f1618, 0.028);
const camera = new THREE.PerspectiveCamera(
  48,
  host.clientWidth / host.clientHeight,
  0.1,
  250,
);
camera.position.set(18, 13, 22);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(host.clientWidth, host.clientHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
host.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 42;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 2, 0);
const hemi = new THREE.HemisphereLight(0xa9c8cc, 0x2d261f, 1.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2b6, 3.2);
sun.position.set(-10, 18, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);
const moon = new THREE.DirectionalLight(0x8fb7d8, 0.15);
moon.position.set(8, 12, -6);
scene.add(moon);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x26352d,
  roughness: 1,
});
const ground = new THREE.Mesh(
  new THREE.CylinderGeometry(12, 13, 1.1, 64),
  groundMat,
);
ground.position.y = -0.75;
ground.receiveShadow = true;
scene.add(ground);
const waterMat = new THREE.MeshPhysicalMaterial({
  color: 0x365d63,
  roughness: 0.25,
  metalness: 0.05,
  transparent: true,
  opacity: 0.72,
});
const water = new THREE.Mesh(new THREE.CircleGeometry(5.2, 48), waterMat);
water.rotation.x = -Math.PI / 2;
water.position.set(-5, 0.02, 2);
scene.add(water);
const machine = new THREE.Group();
const mm = new THREE.MeshStandardMaterial({
  color: 0x34383a,
  roughness: 0.78,
  metalness: 0.55,
});
const body = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 2.5), mm);
body.rotation.z = -0.09;
body.castShadow = true;
machine.add(body);
for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.09, 8, 24),
    new THREE.MeshStandardMaterial({
      color: 0x596260,
      metalness: 0.8,
      roughness: 0.3,
    }),
  );
  ring.rotation.y = Math.PI / 2;
  ring.position.set(-1.4 + i * 1.4, 0.15, 1.27);
  machine.add(ring);
}
machine.position.set(4, 0.8, -3);
scene.add(machine);
const machineGlow = new THREE.PointLight(0x6fa7d8, 0, 7, 2);
machineGlow.position.set(4, 1.5, -2.2);
scene.add(machineGlow);
const towerMat = new THREE.MeshStandardMaterial({
  color: 0x3b403f,
  roughness: 0.9,
});
const tower = new THREE.Mesh(
  new THREE.CylinderGeometry(0.65, 1.1, 7, 6),
  towerMat,
);
tower.position.set(-6, 3.1, -5);
tower.castShadow = true;
scene.add(tower);
const beacon = new THREE.PointLight(0x78b7ff, 0, 8, 2);
beacon.position.set(-6, 6.7, -5);
scene.add(beacon);
const beaconOrb = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 12, 12),
  new THREE.MeshBasicMaterial({
    color: 0x9cd0ff,
    transparent: true,
    opacity: 0.2,
  }),
);
beaconOrb.position.copy(beacon.position);
scene.add(beaconOrb);

const trees = [];
function makeTree(x, z, s = 0.9) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.8, 7),
    new THREE.MeshStandardMaterial({ color: 0x4b3529 }),
  );
  trunk.position.y = 0.9;
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.7 * s, 2.4 * s, 7),
    new THREE.MeshStandardMaterial({ color: 0x304d38, roughness: 1 }),
  );
  crown.position.y = 2.45 * s;
  g.add(trunk, crown);
  g.position.set(x, 0, z);
  g.rotation.y = Math.random() * Math.PI;
  g.scale.setScalar(0.8 + Math.random() * 0.5);
  scene.add(g);
  trees.push(g);
}
for (let i = 0; i < 34; i++) {
  const a = Math.random() * Math.PI * 2,
    r = 7 + Math.random() * 4;
  makeTree(Math.cos(a) * r, Math.sin(a) * r, 0.75 + Math.random() * 0.45);
}

const huts = [];
function hut(x, z, r = 0) {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x786553,
    roughness: 1,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x493d32,
    roughness: 1,
  });
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.9, 1.25, 6),
    wallMat,
  );
  wall.position.y = 0.62;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.08, 0.9, 6), roofMat);
  roof.position.y = 1.7;
  const windowMat = new THREE.MeshBasicMaterial({
    color: 0xffcf83,
    transparent: true,
    opacity: 0,
  });
  const window = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.18), windowMat);
  window.position.set(0, 0.72, 0.91);
  g.add(wall, roof, window);
  g.position.set(x, 0, z);
  g.rotation.y = r;
  g.scale.setScalar(0.001);
  g.userData = { wallMat, roofMat, windowMat, damage: 0 };
  scene.add(g);
  huts.push(g);
}
[
  [1, 4],
  [3, 4.8],
  [4.6, 3.5],
  [2.2, 6.2],
  [5.4, 5.7],
  [-0.4, 5.4],
  [0.2, 3.1],
  [4, 6.6],
  [-1.2, 6.4],
  [6, 3],
].forEach((p, i) => hut(p[0], p[1], i * 0.45));

const roadMat = new THREE.MeshBasicMaterial({
  color: 0x6a604f,
  transparent: true,
  opacity: 0.12,
  side: THREE.DoubleSide,
});
const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 0.8), roadMat);
road.rotation.x = -Math.PI / 2;
road.rotation.z = 0.22;
road.position.set(1, 0.015, 0.6);
scene.add(road);
const garden = new THREE.Group();
for (let r = 0; r < 5; r++)
  for (let c = 0; c < 6; c++) {
    const sprout = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.22, 5),
      new THREE.MeshStandardMaterial({ color: 0x567747 }),
    );
    sprout.position.set(-4.7 + c * 0.28, 0.12, 1.7 + r * 0.28);
    garden.add(sprout);
  }
garden.visible = false;
scene.add(garden);
const windWheel = new THREE.Group();
const mast = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.12, 2.8, 8),
  new THREE.MeshStandardMaterial({ color: 0x554839 }),
);
mast.position.y = 1.4;
windWheel.add(mast);
const rotor = new THREE.Group();
rotor.position.set(0, 2.5, 0.12);
for (let i = 0; i < 4; i++) {
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.2, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x777363,
      metalness: 0.2,
      roughness: 0.8,
    }),
  );
  blade.position.y = 0.62;
  blade.rotation.z = (i * Math.PI) / 2;
  rotor.add(blade);
}
windWheel.add(rotor);
windWheel.position.set(-2.2, 0, 3.7);
windWheel.scale.setScalar(0.001);
scene.add(windWheel);

function limb(radius, length, material) {
  const pivot = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 4, 8),
    material,
  );
  mesh.position.y = -length * 0.38;
  pivot.add(mesh);
  mesh.castShadow = true;
  return { pivot, mesh };
}
function makePerson(color = 0x76664f, scale = 1) {
  const g = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({
    color: 0x9f765d,
    roughness: 0.85,
  });
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.74, 4, 8),
    cloth,
  );
  torso.position.y = 1.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), skin);
  head.position.y = 2.12;
  g.add(torso, head);
  const ll = limb(0.09, 0.62, cloth),
    rl = limb(0.09, 0.62, cloth),
    la = limb(0.075, 0.55, cloth),
    ra = limb(0.075, 0.55, cloth);
  ll.pivot.position.set(-0.16, 0.86, 0);
  rl.pivot.position.set(0.16, 0.86, 0);
  la.pivot.position.set(-0.38, 1.58, 0);
  ra.pivot.position.set(0.38, 1.58, 0);
  g.add(ll.pivot, rl.pivot, la.pivot, ra.pivot);
  g.scale.setScalar(scale);
  g.userData = {
    torso,
    head,
    ll,
    rl,
    la,
    ra,
    phase: Math.random() * 6.28,
    target: new THREE.Vector3(),
    speed: 0.34 + Math.random() * 0.18,
    role: "villager",
  };
  return g;
}
const mara = makePerson(0x76664f, 1.08);
mara.position.set(0.3, 0, 0.2);
scene.add(mara);
const eren = makePerson(0x4d6570, 1.04);
eren.position.set(2.4, 0, 4.3);
eren.visible = false;
eren.userData.role = "eren";
scene.add(eren);
const villagers = [];
for (let i = 0; i < 12; i++) {
  const p = makePerson(
    [0x6f5c4b, 0x536657, 0x67546a, 0x725f46][i % 4],
    0.88 + Math.random() * 0.12,
  );
  p.visible = false;
  p.position.set(1 + Math.random() * 4, 0, 3 + Math.random() * 3);
  scene.add(p);
  villagers.push(p);
}
const raiders = [];
for (let i = 0; i < 5; i++) {
  const p = makePerson(0x4a3330, 0.98);
  p.visible = false;
  p.position.set(10 + i * 0.35, 0, -1 + i * 0.4);
  p.userData.role = "raider";
  scene.add(p);
  raiders.push(p);
}

const pathTargets = {
  awakening: new THREE.Vector3(0.3, 0, 0.2),
  stranger: new THREE.Vector3(2.3, 0, 4.4),
  storm: new THREE.Vector3(3.6, 0, -2.2),
  garden: new THREE.Vector3(-3.7, 0, 2.7),
  tower: new THREE.Vector3(-5.2, 0, -4.3),
  dispute: new THREE.Vector3(2.6, 0, 4.7),
  raiders: new THREE.Vector3(7.0, 0, 0.5),
  child: new THREE.Vector3(2.8, 0, 5.1),
  machine: new THREE.Vector3(3.6, 0, -2.1),
  migration: new THREE.Vector3(6.4, 0, 0.3),
  festival: new THREE.Vector3(1.8, 0, 2.8),
  invention: new THREE.Vector3(-2.2, 0, 3.7),
  schism: new THREE.Vector3(6.6, 0, 1.4),
  funeral: new THREE.Vector3(-0.8, 0, 4.7),
  famine: new THREE.Vector3(1.7, 0, 2.6),
  quiet: new THREE.Vector3(1.5, 0, 2.8),
};

const fireLight = new THREE.PointLight(0xff8a42, 2, 7, 2);
fireLight.position.set(1.7, 0.8, 2.6);
scene.add(fireLight);
const fire = new THREE.Mesh(
  new THREE.ConeGeometry(0.25, 0.8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffa24e }),
);
fire.position.set(1.7, 0.45, 2.6);
scene.add(fire);
const smokePuffs = [];
for (let i = 0; i < 9; i++) {
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(0.12 + i * 0.015, 8, 6),
    new THREE.MeshBasicMaterial({
      color: 0x89908d,
      transparent: true,
      opacity: 0.12,
    }),
  );
  puff.position.set(1.7, 0.9 + i * 0.32, 2.6);
  scene.add(puff);
  smokePuffs.push(puff);
}
const motes = [];
for (let i = 0; i < 130; i++)
  motes.push(
    (Math.random() - 0.5) * 22,
    Math.random() * 6 + 0.4,
    (Math.random() - 0.5) * 22,
  );
const moteGeo = new THREE.BufferGeometry();
moteGeo.setAttribute("position", new THREE.Float32BufferAttribute(motes, 3));
const moteMat = new THREE.PointsMaterial({
  color: 0xe7dfad,
  size: 0.055,
  transparent: true,
  opacity: 0.5,
});
const motePoints = new THREE.Points(moteGeo, moteMat);
scene.add(motePoints);
const clouds = [];
for (let i = 0; i < 6; i++) {
  const c = new THREE.Group();
  for (let j = 0; j < 4; j++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.75 + Math.random() * 0.45, 10, 7),
      new THREE.MeshBasicMaterial({
        color: 0xaeb9ba,
        transparent: true,
        opacity: 0.08,
      }),
    );
    m.position.set(j * 0.7, Math.random() * 0.25, Math.random() * 0.5);
    c.add(m);
  }
  c.position.set(-13 + i * 5, 7 + Math.random() * 2, -7 + Math.random() * 7);
  scene.add(c);
  clouds.push(c);
}
const rainCount = 360,
  rainPos = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
  rainPos[i * 3] = (Math.random() - 0.5) * 20;
  rainPos[i * 3 + 1] = Math.random() * 12;
  rainPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
}
const rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({
  color: 0x69777b,
  size: 0.045,
  transparent: true,
  opacity: 0,
});
const rain = new THREE.Points(rainGeo, rainMat);
scene.add(rain);
const birds = [];
for (let i = 0; i < 5; i++) {
  const b = new THREE.Group();
  const bm = new THREE.MeshBasicMaterial({ color: 0x151a1b });
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.025, 0.1), bm);
    wing.position.x = side * 0.22;
    wing.rotation.z = side * 0.28;
    b.add(wing);
  }
  b.position.set(-8 + i * 3, 5.5 + i * 0.3, -6);
  scene.add(b);
  birds.push(b);
}
const echoStones = [];
function ensureEchoStones(n) {
  while (echoStones.length < n) {
    const i = echoStones.length;
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 0.45 + Math.random() * 0.25, 6),
      new THREE.MeshStandardMaterial({
        color: 0x7f877d,
        roughness: 0.8,
        emissive: 0x31403c,
        emissiveIntensity: 0.15,
      }),
    );
    stone.position.set(-6.8 + i * 0.42, 0.2, 5.4 + Math.sin(i) * 0.3);
    stone.rotation.z = (Math.random() - 0.5) * 0.22;
    scene.add(stone);
    echoStones.push(stone);
  }
}
const graveStones = [];
function addGraveStone() {
  if (graveStones.length > 8) return;
  const i = graveStones.length;
  const s = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.55, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x696a63, roughness: 1 }),
  );
  s.position.set(-1.2 + i * 0.36, 0.28, 4.8 + (i % 2) * 0.3);
  s.rotation.y = (Math.random() - 0.5) * 0.3;
  scene.add(s);
  graveStones.push(s);
}

function animatePerson(p, now, dt, target, walkSpeed = 1) {
  const u = p.userData;
  const delta = target.clone().sub(p.position);
  delta.y = 0;
  const moving = delta.length() > 0.08;
  if (moving) {
    const step = Math.min(delta.length(), dt * u.speed * walkSpeed);
    delta.normalize();
    p.position.addScaledVector(delta, step);
    p.rotation.y = Math.atan2(delta.x, delta.z);
    u.phase += dt * 7;
  }
  const stride = moving
    ? Math.sin(u.phase) * 0.55
    : Math.sin(now * 0.002 + u.phase) * 0.04;
  u.ll.pivot.rotation.x = stride;
  u.rl.pivot.rotation.x = -stride;
  u.la.pivot.rotation.x = -stride * 0.62;
  u.ra.pivot.rotation.x = stride * 0.62;
  u.torso.rotation.z = Math.sin(u.phase * 2) * 0.012;
  p.position.y = Math.abs(Math.sin(u.phase)) * 0.012;
}
function villagerTarget(i, now) {
  const mode = (i + Math.floor(now / 9000)) % 4;
  if (mode === 0)
    return new THREE.Vector3(
      1.7 + Math.sin(i) * 0.4,
      0,
      2.6 + Math.cos(i) * 0.5,
    );
  if (mode === 1)
    return new THREE.Vector3(-3.8 + (i % 3) * 0.3, 0, 2.1 + (i % 4) * 0.28);
  if (mode === 2) {
    const h = huts[i % huts.length];
    return h.position.clone().add(new THREE.Vector3(0.6, 0, 0.3));
  }
  return new THREE.Vector3(1 + (i % 4) * 1.1, 0, 4 + Math.floor(i / 4) * 0.7);
}

let target = {
  fog: 0.028,
  water: 0.72,
  settle: 0.08,
  beacon: 0,
  tech: 0,
  damage: 0,
  population: 1,
  cohesion: 0.44,
  food: 0.55,
};
function updateWorldTarget() {
  if (!state) return;
  target.fog = lerp(
    0.006,
    0.022,
    pressures.mystery * 0.55 + pressures.danger * 0.35,
  );
  target.water = clamp(state.water);
  target.settle = state.settlement;
  target.beacon =
    pressures.technology * pressures.mystery * 3.7 + state.techAwake * 0.7;
  target.tech = state.techAwake;
  target.damage = state.damage;
  target.population = state.population;
  target.cohesion = state.cohesion;
  target.food = state.food;
  const dry = 1 - pressures.abundance;
  groundMat.color.setHSL(
    0.27 - dry * 0.14,
    0.32 + pressures.abundance * 0.12,
    0.23 + pressures.abundance * 0.04,
  );
  hemi.intensity = 2.1 + pressures.abundance * 0.7;
  sun.intensity = 2.2 + (1 - pressures.danger) * 1.3;
  garden.visible = hasMemory("ash garden");
  eren.visible = state.eren;
  windWheel.userData.active = hasMemory("wind wheel");
  ensureEchoStones(legacy.echoStones);
  echoStones.forEach((stone, i) => (stone.visible = i < legacy.echoStones));
  while (graveStones.length < Math.min(state.deaths, 9)) addGraveStone();
}

let last = performance.now(),
  acc = 0,
  raidTimer = 0,
  lastEventSeen = "";
function renderScene(now, dt) {
  controls.update();
  scene.fog.density = lerp(scene.fog.density, target.fog, 0.018);
  water.scale.setScalar(lerp(water.scale.x, 0.62 + target.water * 0.5, 0.02));
  water.material.opacity = 0.6 + Math.sin(now * 0.0009) * 0.08;
  water.rotation.z = Math.sin(now * 0.00018) * 0.015;
  beacon.intensity = lerp(beacon.intensity, target.beacon, 0.03);
  beaconOrb.material.opacity = 0.15 + Math.min(0.85, beacon.intensity * 0.25);
  machineGlow.intensity = lerp(machineGlow.intensity, target.tech * 2.2, 0.025);
  const day = [0.85, 1, 0.65, 0.35][state?.season || 0];
  renderer.toneMappingExposure = 1.18 + day * 0.18;
  sun.intensity = (1.4 + day * 2.5) * (1 - pressures.danger * 0.12);
  moon.intensity = 0.12 + (1 - day) * 0.55;
  fireLight.intensity = (1.4 + Math.random() * 0.8) * (1.15 - day * 0.45);
  huts.forEach((h, i) => {
    const threshold = 0.15 + i * 0.075;
    const desired = target.settle > threshold ? 1 : 0.001;
    const hs = lerp(h.scale.x, desired, 0.035);
    h.scale.setScalar(hs);
    const d = clamp(target.damage * (1 + (i % 3) * 0.15));
    h.rotation.z = lerp(h.rotation.z, (i % 2 ? 1 : -1) * d * 0.16, 0.03);
    h.userData.roofMat.color.setHSL(0.08, 0.18, 0.2 + d * 0.06);
    h.userData.windowMat.opacity =
      hs > 0.5
        ? Math.max(0, (1 - day) * (0.25 + target.cohesion * 0.6) - d * 0.55)
        : 0;
  });
  const wscale = windWheel.userData.active ? 1 : 0.001;
  windWheel.scale.setScalar(lerp(windWheel.scale.x, wscale, 0.03));
  rotor.rotation.z -= dt * (0.5 + pressures.change * 2.2);
  if (state) {
    const base = pathTargets[state.lastEvent] || pathTargets.awakening;
    const wob = 0;
    const maraTarget = base
      .clone()
      .add(
        new THREE.Vector3(
          Math.cos(now * 0.00018) * wob,
          0,
          Math.sin(now * 0.00015) * wob,
        ),
      );
    animatePerson(mara, now, dt, maraTarget, 1.55);
    mara.rotation.z = state.health < 0.35 ? 0.08 : 0;
    eren.visible = state.eren;
    if (eren.visible) {
      const eTarget =
        state.lastEvent === "invention"
          ? new THREE.Vector3(-2.4, 0, 3.7)
          : state.lastEvent === "raiders"
            ? new THREE.Vector3(6.1, 0, 0.2)
            : villagerTarget(1, now + 2200);
      animatePerson(eren, now, dt, eTarget, 1.15);
    }
    const desiredVillagers = Math.min(
      villagers.length,
      Math.max(0, state.population - 1 - (state.eren ? 1 : 0)),
    );
    villagers.forEach((v, i) => {
      v.visible = i < desiredVillagers;
      if (v.visible) animatePerson(v, now, dt, villagerTarget(i + 2, now), 1);
    });
    if (state.lastEvent !== lastEventSeen) {
      if (state.lastEvent === "raiders") raidTimer = 6;

      lastEventSeen = state.lastEvent;
    }
    if (raidTimer > 0) {
      raidTimer -= dt;
      raiders.forEach((r, i) => {
        r.visible = true;
        animatePerson(
          r,
          now,
          dt,
          new THREE.Vector3(6.5 - i * 0.35, 0, 0.3 + i * 0.2),
          1.8,
        );
      });
    } else raiders.forEach((r) => (r.visible = false));
  }
  trees.forEach((tr, i) => {
    tr.rotation.z =
      Math.sin(now * 0.0008 + i) * (0.005 + 0.025 * pressures.change);
    tr.rotation.x =
      Math.cos(now * 0.00065 + i * 0.7) * (0.004 + 0.014 * pressures.change);
  });
  fire.scale.y = 0.82 + Math.sin(now * 0.015) * 0.25;
  fire.rotation.y += dt * 0.9;
  smokePuffs.forEach((p, i) => {
    p.position.y = 0.9 + ((now * 0.00035 + i * 0.42) % 3.1);
    p.position.x = 1.7 + Math.sin(now * 0.0006 + i) * 0.13;
    p.material.opacity = 0.03 + 0.08 * (1 - (p.position.y - 0.9) / 3.1);
    p.scale.setScalar(0.7 + (p.position.y - 0.9) * 0.16);
  });
  motePoints.rotation.y += dt * (0.012 + 0.05 * pressures.mystery);
  moteMat.opacity = 0.15 + 0.55 * pressures.mystery * (0.6 + (1 - day) * 0.4);
  const pos = moteGeo.attributes.position;
  for (let i = 0; i < pos.count; i++)
    pos.array[i * 3 + 1] += Math.sin(now * 0.001 + i) * 0.0008;
  pos.needsUpdate = true;
  clouds.forEach((c) => {
    c.position.x += dt * (0.16 + 0.35 * pressures.change);
    if (c.position.x > 14) c.position.x = -14;
    c.children.forEach(
      (m) =>
        (m.material.opacity =
          0.035 + 0.14 * (pressures.danger * 0.55 + pressures.mystery * 0.45)),
    );
  });
  const raining = state?.lastEvent === "storm";
  rainMat.opacity = lerp(
    rainMat.opacity,
    raining ? 0.55 : Math.max(0, (pressures.danger - 0.78) * 0.28),
    0.04,
  );
  const rp = rainGeo.attributes.position.array;
  for (let i = 0; i < rainCount; i++) {
    rp[i * 3 + 1] -= dt * (8 + pressures.danger * 7);
    rp[i * 3] += dt * 0.8 * pressures.change;
    if (rp[i * 3 + 1] < 0) {
      rp[i * 3 + 1] = 10 + Math.random() * 4;
      rp[i * 3] = (Math.random() - 0.5) * 20;
    }
  }
  rainGeo.attributes.position.needsUpdate = true;
  birds.forEach((b, i) => {
    const phase = now * 0.0003 + i * 1.7;
    b.position.x = Math.sin(phase) * 8;
    b.position.z = -5 + Math.cos(phase * 0.8) * 4;
    b.position.y = 5.6 + i * 0.25 + Math.sin(phase * 3) * 0.25;
    b.rotation.y = phase + Math.PI / 2;
    b.children[0].rotation.z = 0.2 + Math.sin(now * 0.008 + i) * 0.45;
    b.children[1].rotation.z = -0.2 - Math.sin(now * 0.008 + i) * 0.45;
    b.visible = pressures.abundance > 0.28 && day > 0.22;
  });
  detailAnimate(now);
  preserveBuiltWorld();
  enforceWorldCollisions();
  animateFaces(now);
  settleMara();
  holdConversations();
  animateRefugeVisual(now);
  updateArt(now, dt);
  renderer.render(scene, camera);
}
