// --- PACING, PERMANENCE & SPATIAL COMPOSITION LAYER ---
// This file intentionally sits after engine.js + scene.js so it can tune the
// living world without destabilizing the core simulation.

// 1) Slow the narrative clock. At visible 1x, a season now lasts ~24 seconds
// instead of ~8. Faster modes still exist, but even 4x leaves enough time to
// watch people inhabit the consequences of the last event.
// Give people time to belong somewhere. Movement is slower, destinations are
// held longer, and roles distribute residents across distinct activity zones.
mara.userData.speed = 0.22;
eren.userData.speed = 0.2;
villagers.forEach((v, i) => (v.userData.speed = 0.16 + (i % 4) * 0.025));
raiders.forEach((r, i) => (r.userData.speed = 0.32 + i * 0.02));

// 2) Settlement plan: homes are padded into a loose crescent of neighborhoods
// instead of stacking around one hearth. These coordinates are intentionally
// asymmetric so the village reads as grown rather than stamped out.
const settlementPlan = [
  new THREE.Vector3(3.0, 0, 4.8),
  new THREE.Vector3(5.7, 0, 4.5),
  new THREE.Vector3(7.4, 0, 2.6),
  new THREE.Vector3(3.0, 0, 7.1),
  new THREE.Vector3(6.2, 0, 7.2),
  new THREE.Vector3(-0.2, 0, 5.8),
  new THREE.Vector3(0.1, 0, 2.8),
  new THREE.Vector3(4.2, 0, 8.7),
  new THREE.Vector3(-2.0, 0, 6.8),
  new THREE.Vector3(8.4, 0, 4.8),
];
huts.forEach((h, i) => {
  const p = settlementPlan[i % settlementPlan.length];
  h.position.copy(p);
  h.rotation.y = 0.25 + i * 0.71;
  h.userData.everBuilt = false;
});

ground.scale.set(1.12, 1, 1.12);
controls.target.set(0.35, 1.8, 0.8);
camera.position.set(19.5, 14.2, 24.5);
controls.update();

// Distinct social geography: hearth, river/garden, homes, machine, workshop,
// ridge. Roles linger in a zone for roughly half a minute before changing.
const activityZones = {
  hearth: new THREE.Vector3(1.7, 0, 2.6),
  water: new THREE.Vector3(-3.4, 0, 2.0),
  garden: new THREE.Vector3(-4.1, 0, 2.1),
  machine: new THREE.Vector3(4.1, 0, -1.5),
  workshop: new THREE.Vector3(-2.2, 0, 3.7),
  ridge: new THREE.Vector3(6.8, 0, 0.6),
};
villagerTarget = function (i, now) {
  const home = huts[i % huts.length];
  const phase = Math.floor((now + i * 2200) / 30000) % 5;
  const orbit = (center, r = 0.55) =>
    center
      .clone()
      .add(
        new THREE.Vector3(
          Math.sin(i * 1.7 + now * 0.00008) * r,
          0,
          Math.cos(i * 1.3 + now * 0.00007) * r,
        ),
      );
  if (phase === 0)
    return home.position
      .clone()
      .add(new THREE.Vector3(Math.sin(i) * 0.72, 0, Math.cos(i) * 0.72));
  if (phase === 1) return orbit(activityZones.hearth, 0.85);
  if (phase === 2)
    return i % 2
      ? orbit(activityZones.garden, 0.7)
      : orbit(activityZones.water, 0.8);
  if (phase === 3)
    return (state?.techAwake ?? 0) > 0.25
      ? orbit(activityZones.workshop, 0.75)
      : home.position.clone().add(new THREE.Vector3(-0.55, 0, 0.45));
  return i % 3 === 0
    ? orbit(activityZones.machine, 0.75)
    : home.position.clone().add(new THREE.Vector3(0.5, 0, -0.5));
};

// 3) Permanent places. Low-profile clearings and paths give each landmark a
// visual territory and preserve negative space between activities.
const placeMaterial = (color, opacity) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
function clearing(x, z, r, color, opacity = 0.07) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r, 36),
    placeMaterial(color, opacity),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.018, z);
  scene.add(m);
  return m;
}
function trail(ax, az, bx, bz, width = 0.32, opacity = 0.1) {
  const dx = bx - ax,
    dz = bz - az,
    len = Math.hypot(dx, dz);
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.018, len),
    new THREE.MeshBasicMaterial({
      color: 0x81745f,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  );
  m.position.set((ax + bx) / 2, 0.02, (az + bz) / 2);
  m.rotation.y = Math.atan2(dx, dz);
  scene.add(m);
  return m;
}

const hearthClearing = clearing(1.7, 2.6, 1.55, 0x8a6744, 0.075);
const gardenClearing = clearing(-4.1, 2.0, 1.45, 0x405f3c, 0.065);
const machineClearing = clearing(4.0, -3.0, 2.15, 0x596064, 0.045);
const workshopClearing = clearing(-2.2, 3.7, 1.25, 0x676253, 0.045);
const burialClearing = clearing(-0.1, 6.0, 1.18, 0x5c5e59, 0.05);
trail(1.7, 2.6, -3.5, 2.1, 0.3, 0.085);
trail(1.7, 2.6, 4.0, -2.0, 0.34, 0.075);
trail(1.7, 2.6, 6.8, 0.7, 0.32, 0.065);
trail(1.7, 2.6, 3.2, 6.8, 0.28, 0.08);

// A permanent ring of hearth stones makes the common center visually legible.
const hearthStones = [];
for (let i = 0; i < 11; i++) {
  const a = (i / 11) * Math.PI * 2;
  const s = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.1 + (i % 3) * 0.015, 0),
    new THREE.MeshStandardMaterial({ color: 0x6f665a, roughness: 1 }),
  );
  s.position.set(1.7 + Math.cos(a) * 0.62, 0.1, 2.6 + Math.sin(a) * 0.62);
  s.rotation.set(i * 0.4, i * 0.7, 0);
  scene.add(s);
  hearthStones.push(s);
}

// 4) Permanence rule. Once a dwelling has existed, social decline can damage
// or abandon it, but it no longer blinks out of history. Former homes become
// quieter ruins rather than disappearing scenery.
function preserveBuiltWorld() {
  huts.forEach((h, i) => {
    if (h.scale.x > 0.3) h.userData.everBuilt = true;
    if (!h.userData.everBuilt) return;
    const abandoned = target.settle < 0.15 + i * 0.075;
    const floor = abandoned ? 0.56 : 0.84;
    if (h.scale.x < floor) h.scale.setScalar(floor);
    if (abandoned) {
      h.userData.windowMat.opacity = 0;
      h.userData.wallMat.color.lerp(new THREE.Color(0x5f584d), 0.015);
      h.userData.roofMat.color.lerp(new THREE.Color(0x39342f), 0.012);
    }
  });

  // Wind-wheel and garden are historical structures once created.
  if (hasMemory("wind wheel")) windWheel.userData.permanent = true;
  if (windWheel.userData.permanent && windWheel.scale.x < 0.72)
    windWheel.scale.setScalar(0.72);
  if (hasMemory("ash garden")) garden.visible = true;

  // Reduce visual bunching by gently separating visible people when they get
  // too close. This is intentionally weak: it is spacing, not collision physics.
  const people = [mara, eren, ...villagers].filter((p) => p.visible !== false);
  for (let i = 0; i < people.length; i++)
    for (let j = i + 1; j < people.length; j++) {
      const a = people[i],
        b = people[j];
      const dx = b.position.x - a.position.x,
        dz = b.position.z - a.position.z;
      const d2 = dx * dx + dz * dz;
      if (d2 > 0.0001 && d2 < 0.3) {
        const d = Math.sqrt(d2),
          push = (0.55 - d) * 0.0035;
        a.position.x -= (dx / d) * push;
        a.position.z -= (dz / d) * push;
        b.position.x += (dx / d) * push;
        b.position.z += (dz / d) * push;
      }
    }
}
