// --- MOTION & OCCLUSION FIX ---
// True idle poses, held social destinations, conversational attention, and a
// machine shell tall enough to visually contain Mara when she enters it.

// 1) Make the dead machine read as a real enclosure. The original shell was
// slightly shorter than a character, which caused Mara's head to clip through.
body.scale.y = 1.58;
body.position.y = 0.3;
// Add a subtle top cap/lip so the taller enclosure still reads intentionally.
const machineCap = new THREE.Mesh(
  new THREE.BoxGeometry(5.12, 0.18, 2.62),
  new THREE.MeshStandardMaterial({
    color: 0x292d2f,
    roughness: 0.82,
    metalness: 0.58,
  }),
);
machineCap.position.set(0, 1.78, 0);
machineCap.castShadow = true;
machine.add(machineCap);

// When the machine is the active story location, put Mara deeper inside its
// footprint rather than directly beneath an edge.
pathTargets.machine.set(4.0, 0, -2.95);
pathTargets.storm.set(4.15, 0, -2.85);

// 2) Stop residents chasing continuously moving orbit targets. Each person gets
// a held destination for a while, then chooses another point in the same zone.
const heldDestinations = new WeakMap();
function heldPoint(person, key, center, radius = 0.55, holdMs = 18000) {
  const now = visualNow;
  let h = heldDestinations.get(person);
  if (
    !h ||
    h.key !== key ||
    h.generation !== state.generation ||
    now > h.until
  ) {
    const a = Math.random() * Math.PI * 2,
      r = radius * (0.35 + Math.random() * 0.65);
    h = {
      key,
      generation: state.generation,
      until: now + holdMs + Math.random() * 9000,
      point: center
        .clone()
        .add(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)),
    };
    heldDestinations.set(person, h);
  }
  return h.point.clone();
}

villagerTarget = function (i, now) {
  const v =
    villagers[Math.max(0, Math.min(villagers.length - 1, i - 2))] ||
    villagers[i % villagers.length];
  const home = huts[i % huts.length];
  const phase = Math.floor((now + i * 2200) / 32000) % 5;
  if (phase === 0)
    return heldPoint(v, "home-" + i, home.position.clone(), 0.7, 22000);
  if (phase === 1)
    return heldPoint(v, "hearth", activityZones.hearth, 0.82, 20000);
  if (phase === 2)
    return i % 2
      ? heldPoint(v, "garden", activityZones.garden, 0.68, 21000)
      : heldPoint(v, "water", activityZones.water, 0.8, 21000);
  if (phase === 3)
    return (state?.techAwake ?? 0) > 0.25
      ? heldPoint(v, "workshop", activityZones.workshop, 0.72, 22000)
      : heldPoint(v, "homework-" + i, home.position.clone(), 0.62, 22000);
  return i % 3 === 0
    ? heldPoint(v, "machine", activityZones.machine, 0.7, 19000)
    : heldPoint(v, "homeevening-" + i, home.position.clone(), 0.58, 22000);
};

// 3) Replace perpetual micro-walking with a true rest pose once a destination
// has been reached. Limb rotations ease toward zero instead of oscillating.
const _motionAnimatePerson = animatePerson;
animatePerson = function (p, now, dt, target, walkSpeed = 1) {
  const before = p.position.distanceTo(target);
  _motionAnimatePerson(p, now, dt, target, walkSpeed);
  const u = p.userData;
  const arrived = before < 0.12 || p.position.distanceTo(target) < 0.1;
  if (arrived) {
    const settle = Math.min(1, dt * 8.5);
    u.ll.pivot.rotation.x = lerp(u.ll.pivot.rotation.x, 0, settle);
    u.rl.pivot.rotation.x = lerp(u.rl.pivot.rotation.x, 0, settle);
    u.la.pivot.rotation.x = lerp(u.la.pivot.rotation.x, 0, settle);
    u.ra.pivot.rotation.x = lerp(u.ra.pivot.rotation.x, 0, settle);
    u.torso.rotation.z = lerp(u.torso.rotation.z, 0, settle);
    p.position.y = lerp(p.position.y, 0, settle);
    u.isIdle = true;
  } else u.isIdle = false;

  // A speaker holds eye/body attention on the person they are addressing.
  if (u.lookAtPerson && now < u.lookUntil && u.lookAtPerson.visible !== false) {
    const dx = u.lookAtPerson.position.x - p.position.x,
      dz = u.lookAtPerson.position.z - p.position.z;
    if (Math.hypot(dx, dz) < 3.3) {
      const desired = Math.atan2(dx, dz);
      let delta = desired - p.rotation.y;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      p.rotation.y += delta * Math.min(1, dt * 5.5);
      // Tiny conversational arm life, not a walking twitch.
      const talk = Math.sin(now * 0.006 + u.phase) * 0.055;
      u.la.pivot.rotation.x = lerp(u.la.pivot.rotation.x, talk, dt * 3);
      u.ra.pivot.rotation.x = lerp(u.ra.pivot.rotation.x, -talk * 0.45, dt * 3);
    }
  } else if (u.lookAtPerson) {
    u.lookAtPerson = null;
    u.lookUntil = 0;
  }
};

// Mara is animated by its own block in scene.js, so suppress its residual idle
// gait separately whenever it has reached the event location.
function settleMara() {
  if (state && mara) {
    const base = pathTargets[state.lastEvent] || pathTargets.awakening;
    const dx = mara.position.x - base.x,
      dz = mara.position.z - base.z;
    if (Math.hypot(dx, dz) < 0.55) {
      const u = mara.userData,
        s = 0.18;
      u.ll.pivot.rotation.x = lerp(u.ll.pivot.rotation.x, 0, s);
      u.rl.pivot.rotation.x = lerp(u.rl.pivot.rotation.x, 0, s);
      u.la.pivot.rotation.x = lerp(u.la.pivot.rotation.x, 0, s);
      u.ra.pivot.rotation.x = lerp(u.ra.pivot.rotation.x, 0, s);
      u.torso.rotation.z = lerp(u.torso.rotation.z, 0, s);
      mara.position.y = lerp(mara.position.y, 0, s);
    }
  }
}

// 4) Conversation attention. Existing dialogue calls do not specify a listener,
// so infer the closest plausible partner at the instant somebody speaks.
function nearestConversationPartner(person) {
  const candidates = [mara, eren, ...villagers].filter(
    (p) => p && p !== person && p.visible !== false,
  );
  let best = null,
    bestD = Infinity;
  for (const p of candidates) {
    const d = person.position.distanceTo(p.position);
    if (d < bestD && d < 2.7) {
      best = p;
      bestD = d;
    }
  }
  return best;
}
const _motionSay = say;
say = function (person, text, duration = 4300) {
  const listener = nearestConversationPartner(person);
  if (listener) {
    person.userData.lookAtPerson = listener;
    person.userData.lookUntil = visualNow + duration + 500;
    listener.userData.lookAtPerson = person;
    listener.userData.lookUntil = visualNow + Math.min(duration, 3200);
  }
  return _motionSay(person, text, duration);
};

// If two characters are actively speaking, keep them from drifting away from
// each other until the exchange is complete.
function holdConversations() {
  const now = visualNow;
  for (const p of [mara, eren, ...villagers]) {
    if (!p?.userData?.lookAtPerson || now >= p.userData.lookUntil) continue;
    const q = p.userData.lookAtPerson,
      d = p.position.distanceTo(q.position);
    if (d > 1.15 && d < 2.8) {
      const dir = q.position.clone().sub(p.position);
      dir.y = 0;
      dir.normalize();
      // only a minute correction; conversation should not yank characters around
      p.position.addScaledVector(dir, 0.0025);
    }
  }
}
