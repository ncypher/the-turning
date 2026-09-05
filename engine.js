import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Story randomness is independent of animation and camera movement.
let timelineSeed = "HOLLOW-01",
  randomState = 1;
function setSeed(value) {
  timelineSeed = String(value).trim().slice(0, 60) || "HOLLOW-01";
  let hash = 2166136261;
  for (const c of timelineSeed)
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  randomState = hash >>> 0;
}
function random() {
  let t = (randomState = (randomState + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
setSeed(timelineSeed);

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const choice = (a) => a[Math.floor(random() * a.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const sig = (x) => 1 / (1 + Math.exp(-x));
const pressures = {
  abundance: 0.55,
  danger: 0.36,
  community: 0.44,
  mystery: 0.68,
  change: 0.48,
  freedom: 0.62,
  technology: 0.24,
  fate: 0.5,
};
const pressureLabels = {
  abundance: "Abundance",
  danger: "Danger",
  community: "Community",
  mystery: "Mystery",
  change: "Change",
  freedom: "Freedom",
  technology: "Technology",
  fate: "Fate",
};
const seasons = ["Early Spring", "High Summer", "Late Autumn", "Deep Winter"];
let soulEchoes = [],
  state;
const legacy = { lives: 0, echoStones: 0, myths: [], relics: [], names: [] };

function hasMemory(fragment) {
  return state.memory.some((x) => x.includes(fragment));
}
function remember(key) {
  if (!state.memory.includes(key)) state.memory.push(key);
}
function addHistory(title, text, kind = "event") {
  const entry = {
    id: state.history.length + 1,
    turn: state.turn,
    year: state.year,
    season: seasons[state.season],
    title,
    text,
    kind,
    event: state.lastEvent,
    changes: [],
  };
  state.history.unshift(entry);
  return entry;
}

function mythify(seed) {
  const variants = {
    stranger: [
      "The Guest Beneath Iron",
      "The First Shared Bread",
      "Eren at the Mill",
    ],
    storm: [
      "The Black Rain",
      "The Night the Machine Breathed",
      "Rain of Old Metal",
    ],
    garden: [
      "The Ash Garden",
      "The First Green Promise",
      "Mara and the Seed-Stones",
    ],
    tower: [
      "The Blue Eye on the Ridge",
      "The Voice in the Tower",
      "The Returning Light",
    ],
    raiders: [
      "The Standing at the Ridge",
      "The Burned Roofs",
      "The Scar of Dawn",
    ],
    child: [
      "The First Question",
      "The Child Who Asked the Machine",
      "The Story Before History",
    ],
    machine: [
      "The Eleven Seconds",
      "The Machine That Knew Her Name",
      "The Return Vector",
    ],
    festival: [
      "The Lantern Season",
      "The Night of Three Strings",
      "The Feast of Ordinary Days",
    ],
    funeral: [
      "The Stone Without a Body",
      "The First Grave Song",
      "The Empty Chair",
    ],
    schism: ["The Splitting Hearth", "The Road of Two Fires", "The Leaving"],
    invention: [
      "The Wind-Wheel",
      "The Bright Coil",
      "The First Useful Lightning",
    ],
  };
  const list = variants[seed];
  if (!list) return;
  const name = choice(list);
  if (!state.myths.includes(name)) {
    state.myths.push(name);
    legacy.myths.push(name);
    legacy.myths = [...new Set(legacy.myths)].slice(-12);
    state.lore = clamp(state.lore + 0.08);
  }
}
function maybeMyth(seed, chance = 0.18) {
  const weight =
    chance +
    pressures.mystery * 0.18 +
    state.lore * 0.2 +
    Math.min(0.2, state.population * 0.008);
  if (random() < weight) mythify(seed);
}

function newLife(reborn = false) {
  const generation = (state?.generation || 0) + 1,
    speed = state?.speed || 1;
  const inherited = {
    compassion: 0.52,
    fear: 0.38,
    curiosity: 0.72,
    ambition: 0.4,
    attachment: 0.34,
    resolve: 0.48,
  };
  if (reborn)
    for (const echo of soulEchoes)
      inherited[echo.trait] = clamp(inherited[echo.trait] + echo.delta);
  if (reborn) {
    legacy.lives++;
    legacy.echoStones++;
  }
  state = {
    year: 1,
    season: 0,
    age: 24,
    generation,
    turn: 0,
    alive: true,
    paused: true,
    speed,
    traits: inherited,
    initialTraits: { ...inherited },
    morals: {
      selfOthers: 0.52,
      mercyJustice: 0.54,
      freedomOrder: 0.58,
      truthBelonging: 0.61,
      preserveChange: 0.49,
    },
    memory: [],
    history: [],
    myths: [],
    recent: [],
    eventTurns: {},
    bonds: 0,
    scars: 0,
    hope: 0.56,
    health: 1,
    settlement: 0.08,
    ruins: 0.7,
    water: 0.72,
    population: 7,
    food: 0.43,
    cohesion: 0.38,
    lore: reborn ? Math.min(0.22, legacy.myths.length * 0.018) : 0,
    damage: 0,
    techAwake: 0,
    eren: false,
    children: 0,
    departed: 0,
    deaths: 0,
    chapter: "The Gathering",
    lastEvent: "awakening",
    ending: null,
    inheritedEchoes: reborn ? soulEchoes.map((e) => ({ ...e })) : [],
  };
  resetRefuge();
  seedLifeArc();
  const opening = reborn
    ? rebirthText()
    : "Mara wakes beside a dead machine. Six strangers lie in the wet grass, each close enough to hear the others breathing. Everyone remembers a name. Nobody remembers arriving. Beyond the trees comes a sound like distant surf. No one has found an ocean.";
  logStory(opening);
  const entry = addHistory("The Gathering", opening, "opening");
  state.currentId = entry.id;
}

function rebirthText() {
  if (!soulEchoes.length)
    return "Mara wakes beside the machine and six strangers. The hearth is cold. Somewhere in the valley, an old stone has kept a name that she no longer knows.";
  const echo = choice(soulEchoes);
  const myth = legacy.myths.length
    ? ` Somewhere nearby, people still tell a story called “${choice(legacy.myths)},” though she does not know why the title hurts.`
    : "";
  return `The world begins again. Mara wakes beside the dead machine and six strangers. Nothing of the former life can be recalled, yet ${echo.phrase}.${myth}`;
}

const events = [
  {
    id: "stranger",
    title: "A stranger beneath the mill",
    base: 0.8,
    when: (s) => !s.eren,
    score: (s) =>
      pressures.community * 0.8 +
      s.traits.compassion * 0.7 +
      pressures.danger * 0.18 +
      (1 - pressures.abundance) * 0.35,
    resolve: (s) => {
      const help = sig(
        2.2 * s.traits.compassion +
          1.2 * s.morals.selfOthers +
          pressures.community -
          0.9 * s.traits.fear -
          1.1,
      );
      if (random() < help) {
        s.eren = true;
        s.bonds++;
        s.population += 1;
        s.cohesion = clamp(s.cohesion + 0.08);
        s.traits.compassion = clamp(s.traits.compassion + 0.035);
        s.morals.selfOthers = clamp(s.morals.selfOthers + 0.03);
        remember("sheltered Eren beneath the mill");
        maybeMyth("stranger", 0.28);
        return "At the abandoned mill, Mara finds a stranger sleeping beneath rusted metal. Food is not plentiful. She divides what she has anyway. By morning the stranger has a name—Eren—and the road no longer feels entirely empty.";
      }
      s.traits.fear = clamp(s.traits.fear + 0.04);
      s.cohesion = clamp(s.cohesion - 0.02);
      remember("turned away the stranger at the mill");
      return "Mara finds a stranger asleep beneath rusted metal. She watches from the trees until he wakes, then leaves without speaking. That night she eats well and sleeps badly.";
    },
  },
  {
    id: "storm",
    title: "The black rain",
    base: 0.72,
    score: (s) =>
      pressures.change * 0.8 +
      pressures.mystery * 0.7 +
      pressures.danger * 0.45,
    resolve: (s) => {
      s.health = clamp(s.health - 0.03 - 0.06 * pressures.danger);
      s.damage = clamp(s.damage + 0.05 + 0.08 * pressures.change);
      s.traits.resolve = clamp(s.traits.resolve + 0.03);
      remember("survived the black rain");
      maybeMyth("storm", 0.32);
      return "Clouds gather before noon, too quickly and from every direction. The rain is warm, dark, and faintly metallic. Mara shelters inside the dead machine while the settlement roofs hiss beneath it.";
    },
  },
  {
    id: "garden",
    title: "Seeds in the ash",
    base: 0.68,
    when: (s) => !hasMemory("ash garden"),
    score: (s) =>
      pressures.abundance * 0.7 +
      pressures.community * 0.45 +
      s.traits.attachment * 0.55 +
      (1 - pressures.danger) * 0.25,
    resolve: (s) => {
      s.settlement = clamp(s.settlement + 0.09);
      s.food = clamp(s.food + 0.12);
      s.hope = clamp(s.hope + 0.07);
      s.traits.attachment = clamp(s.traits.attachment + 0.04);
      remember("planted the ash garden");
      maybeMyth("garden", 0.34);
      return "Near the river, Mara discovers green shoots in a patch of ash. She fences the ground with broken antennae and plants every viable seed she owns. The Hollow acquires its first deliberate future.";
    },
  },
  {
    id: "tower",
    title: "The light in the tower",
    base: 0.62,
    score: (s) =>
      pressures.technology * 0.8 +
      pressures.mystery * 0.85 +
      s.traits.curiosity * 0.65,
    resolve: (s) => {
      const enter =
        random() <
        sig(s.traits.curiosity * 2 - s.traits.fear + pressures.fate - 0.8);
      if (enter) {
        s.techAwake = clamp(s.techAwake + 0.15);
        s.lore = clamp(s.lore + 0.08);
        s.traits.curiosity = clamp(s.traits.curiosity + 0.04);
        remember("entered the lit tower");
        maybeMyth("tower", 0.42);
        return "A dead tower on the western ridge shows a single blue light. Mara climbs after sunset. Inside, a machine speaks one sentence in her own voice: “You have been here before.”";
      }
      s.traits.fear = clamp(s.traits.fear + 0.025);
      return "A single blue light appears in the dead western tower. Mara watches until dawn but does not climb. Relief arrives with sunrise, and she distrusts it.";
    },
  },
  {
    id: "dispute",
    title: "Bread and judgment",
    base: 0.6,
    when: (s) => s.population >= 5,
    score: (s) =>
      pressures.community * 0.7 + (1 - s.food) * 0.9 + s.population * 0.018,
    resolve: (s) => {
      const mercy =
        s.morals.mercyJustice +
        s.traits.compassion * 0.45 -
        s.traits.fear * 0.22;
      if (mercy > 0.7) {
        s.morals.mercyJustice = clamp(s.morals.mercyJustice + 0.04);
        s.cohesion = clamp(s.cohesion + 0.06);
        s.food = clamp(s.food - 0.05);
        return "Two families accuse one another of stealing winter flour. Mara refuses punishment and divides the remaining stores publicly. Nobody is satisfied, but nobody leaves.";
      }
      s.morals.mercyJustice = clamp(s.morals.mercyJustice - 0.04);
      s.cohesion = clamp(s.cohesion - 0.06);
      s.departed++;
      s.population = Math.max(1, s.population - 1);
      return "Two families accuse one another of stealing winter flour. Mara orders the suspected thief expelled. The stores last. So does the memory of the sentence.";
    },
  },
  {
    id: "raiders",
    title: "Smoke beyond the ridge",
    base: 0.54,
    when: (s) => s.population >= 3,
    score: (s) =>
      pressures.danger * 1.35 + s.settlement * 0.5 + (1 - s.cohesion) * 0.45,
    resolve: (s) => {
      const stand = sig(
        s.traits.resolve * 1.45 +
          s.traits.attachment +
          s.cohesion -
          s.traits.fear -
          0.75,
      );
      if (random() < stand) {
        s.scars++;
        s.health = clamp(s.health - 0.1);
        s.damage = clamp(s.damage + 0.12);
        s.cohesion = clamp(s.cohesion + 0.06);
        s.population += random() < 0.45 ? 2 : 0;
        s.traits.resolve = clamp(s.traits.resolve + 0.05);
        remember("stood at the ridge");
        maybeMyth("raiders", 0.48);
        return "Smoke rises beyond the ridge and figures appear on the old road. Mara stays. The fight is brief, ugly, and enough. By dawn she has another scar—and strangers who fought beside her now call this place home.";
      }
      s.damage = clamp(s.damage + 0.28);
      s.settlement = clamp(s.settlement - 0.1);
      s.cohesion = clamp(s.cohesion - 0.09);
      s.population = Math.max(
        1,
        s.population - Math.max(1, Math.floor(random() * 3)),
      );
      remember("fled the ridge");
      return "Smoke rises beyond the ridge. Mara leaves before the figures reach the road. From the hills she watches roofs burn in the place she had started to call home.";
    },
  },
  {
    id: "child",
    title: "A question from a child",
    base: 0.55,
    when: (s) => s.population >= 4 && s.year >= 6,
    score: (s) =>
      pressures.community * 0.7 +
      s.settlement * 0.7 +
      s.traits.attachment * 0.4,
    resolve: (s) => {
      s.children = Math.max(s.children, 1);
      s.bonds++;
      s.population += random() < 0.35 ? 1 : 0;
      s.traits.attachment = clamp(s.traits.attachment + 0.05);
      s.lore = clamp(s.lore + 0.045);
      remember("answered the child about the dead machine");
      maybeMyth("child", 0.38);
      return "A child born after Mara arrived asks what the dead machine was for. Mara tells the truth: she does not know. Then she tells a story. Years later, people remember only the story.";
    },
  },
  {
    id: "machine",
    title: "The machine remembers",
    base: 0.45,
    score: (s) =>
      pressures.technology * 0.9 +
      pressures.fate * 0.95 +
      pressures.mystery * 0.72 +
      s.memory.length * 0.035,
    resolve: (s) => {
      s.techAwake = clamp(s.techAwake + 0.12);
      s.lore = clamp(s.lore + 0.09);
      s.morals.truthBelonging = clamp(s.morals.truthBelonging - 0.035);
      s.traits.curiosity = clamp(s.traits.curiosity + 0.04);
      remember("heard the machine remember");
      maybeMyth("machine", 0.52);
      const msg = choice([
        "MARA // RETURN VECTOR",
        "LIFE INDEX: " + s.generation,
        "MEMORY IS NOT IDENTITY",
        "DO NOT TRUST THE FIRST HISTORY",
        "YOU LEFT THIS MESSAGE",
      ]);
      return `During a windless night the dead machine wakes for eleven seconds. A cracked panel displays: ${msg}. Then every light dies at once.`;
    },
  },
  {
    id: "migration",
    title: "Footsteps on the old road",
    base: 0.56,
    score: (s) =>
      pressures.community * 0.8 +
      pressures.abundance * 0.65 +
      s.cohesion * 0.55 +
      (1 - pressures.danger) * 0.3,
    resolve: (s) => {
      const newcomers = 1 + Math.floor(random() * 4);
      s.population += newcomers;
      s.bonds += Math.min(2, newcomers);
      s.settlement = clamp(s.settlement + 0.05);
      s.food = clamp(s.food - 0.03 * newcomers);
      s.cohesion = clamp(s.cohesion + (pressures.community - 0.5) * 0.08);
      return `${newcomers === 1 ? "A traveler arrives" : newcomers + " travelers arrive"} on the old road carrying blankets, tools, and contradictory stories of the north. Mara does not invite them to stay. She does not ask them to leave. By winter, there are new doors around the hearth.`;
    },
  },
  {
    id: "festival",
    title: "Lanterns at the hearth",
    base: 0.46,
    when: (s) => s.population >= 6 && s.cohesion > 0.5,
    score: (s) =>
      pressures.community * 0.85 + pressures.abundance * 0.55 + s.hope * 0.5,
    resolve: (s) => {
      s.cohesion = clamp(s.cohesion + 0.08);
      s.hope = clamp(s.hope + 0.06);
      s.food = clamp(s.food - 0.04);
      s.lore = clamp(s.lore + 0.035);
      maybeMyth("festival", 0.5);
      return "Someone hangs small oil lamps from the new roofs. Someone else brings out the three-stringed instrument. Nobody agrees what they are celebrating. By midnight that uncertainty has become part of the tradition.";
    },
  },
  {
    id: "invention",
    title: "A wheel that catches the wind",
    base: 0.42,
    when: (s) => s.population >= 5 && !hasMemory("wind wheel"),
    score: (s) =>
      pressures.technology * 0.9 +
      pressures.change * 0.55 +
      s.traits.ambition * 0.55 +
      s.techAwake * 0.6,
    resolve: (s) => {
      s.techAwake = clamp(s.techAwake + 0.18);
      s.food = clamp(s.food + 0.08);
      s.settlement = clamp(s.settlement + 0.06);
      s.hope = clamp(s.hope + 0.04);
      remember("built the wind wheel");
      maybeMyth("invention", 0.28);
      return (
        (s.eren ? "Eren and two others" : "Three of the strangers") +
        " lash scavenged fins to an old axle above the river. After three failures, the wheel turns. A coil salvaged from the dead machine gives off a faint blue glow. For the first time, old technology does something useful."
      );
    },
  },
  {
    id: "schism",
    title: "The splitting hearth",
    base: 0.36,
    when: (s) => s.population >= 9,
    score: (s) =>
      (1 - s.cohesion) * 1.2 +
      pressures.freedom * 0.5 +
      pressures.danger * 0.25,
    resolve: (s) => {
      const leaving = Math.max(
        2,
        Math.floor(s.population * (0.15 + random() * 0.18)),
      );
      remember("daughter hearth");
      s.population -= leaving;
      s.departed += leaving;
      s.cohesion = clamp(s.cohesion + 0.03);
      s.morals.freedomOrder = clamp(s.morals.freedomOrder + 0.035);
      maybeMyth("schism", 0.44);
      return `${leaving} people leave before first light, carrying coals from the common fire in a clay bowl. They do not call it exile. Mara does not call it betrayal. A second column of smoke appears beyond the eastern ridge.`;
    },
  },
  {
    id: "funeral",
    title: "A stone for the absent",
    base: 0.34,
    when: (s) => s.population >= 5,
    score: (s) =>
      pressures.danger * 0.55 + (1 - s.health) * 0.3 + s.population * 0.018,
    resolve: (s) => {
      s.population = Math.max(1, s.population - 1);
      s.deaths++;
      s.cohesion = clamp(s.cohesion + 0.04);
      s.hope = clamp(s.hope - 0.025);
      s.lore = clamp(s.lore + 0.06);
      maybeMyth("funeral", 0.58);
      return "The settlement buries one of its own beneath a flat river stone. Nobody can agree on the right words, so each person says one true thing. By evening the grave is surrounded by small objects no one remembers placing there.";
    },
  },
  {
    id: "famine",
    title: "The thin winter",
    base: 0.34,
    when: (s) => s.food < 0.38 && s.season === 3,
    score: (s) =>
      (1 - s.food) * 1.3 +
      (1 - pressures.abundance) * 0.9 +
      pressures.danger * 0.25,
    resolve: (s) => {
      const loss = Math.min(s.population - 1, Math.floor(random() * 3));
      s.population -= loss;
      s.health = clamp(s.health - 0.08);
      s.cohesion = clamp(s.cohesion - 0.05);
      s.traits.fear = clamp(s.traits.fear + 0.035);
      return `Winter arrives before the stores are ready. Meals become arithmetic. ${loss > 0 ? loss + " people are gone by thaw." : "No one dies, though everyone learns exactly how hunger changes a room."}`;
    },
  },
  {
    id: "quiet",
    title: "A quiet season",
    base: 0.92,
    score: (s) =>
      (1 - pressures.danger) * 0.6 +
      pressures.abundance * 0.45 +
      (1 - pressures.change) * 0.35,
    resolve: (s) => {
      s.health = clamp(s.health + 0.035);
      s.hope = clamp(s.hope + 0.03);
      s.damage = clamp(s.damage - 0.08 * (pressures.community + 0.4));
      return choice([
        "For once, nothing demands heroism. Mara repairs a roof, mends a coat, and learns where the evening light reaches the river.",
        "A season passes without omen or blood. The ordinariness of it feels almost supernatural.",
        "The roads stay quiet. Bread rises. Someone plays the three-stringed instrument badly and often. Mara finds herself hoping it never stops.",
      ]);
    },
  },
];

function weightedEvent() {
  const available = events.filter((e) => !e.when || e.when(state));
  const scored = available.map((e) => ({
    e,
    w: Math.max(
      0.001,
      e.base *
        Math.max(0.05, e.score(state)) *
        (0.72 + pressures.fate * random() * 0.92) *
        arcWeightForEvent(e) *
        (state.recent.slice(-2).includes(e.id)
          ? 0.12
          : state.recent.includes(e.id)
            ? 0.5
            : 1),
    ),
  }));
  let roll = random() * scored.reduce((sum, x) => sum + x.w, 0);
  for (const item of scored) {
    roll -= item.w;
    if (roll <= 0) return item.e;
  }
  return scored.at(-1).e;
}

function turnWheel() {
  if (!state?.alive) return false;
  const before = { ...state, traits: { ...state.traits } };
  state.turn++;
  advanceSeason();
  drift();
  arcTick();
  const ending = possibleEnding();
  if (ending) {
    endLife(ending);
    return true;
  }
  const event = weightedEvent();
  state.lastEvent = event.id;
  state.chapter = event.title;
  const text = event.resolve(state);
  naturalGrowth();
  logStory(text);
  const entry = addHistory(event.title, text);
  state.currentId = entry.id;
  entry.changes = measureChanges(before, state);
  state.eventTurns[event.id] = state.turn;
  state.recent.push(event.id);
  state.recent = state.recent.slice(-5);
  refugeTick();
  if (state.health <= 0.06 || state.age > 80) endLife();
  else if (pressures.danger > 0.92 && random() < 0.025)
    endLife({
      title: "When the dark comes close",
      text: "The danger beyond the trees reaches the refuge before anyone can raise the alarm. Mara does not survive the night. At dawn, those who remain begin the work of remembering.",
      arc: "mortal",
    });
  return true;
}
function measureChanges(before, after) {
  const result = [];
  for (const [key, label, scale] of [
    ["population", "People", 1],
    ["food", "Food", 100],
    ["health", "Health", 100],
    ["hope", "Hope", 100],
    ["cohesion", "Trust", 100],
    ["lore", "Understanding", 100],
  ]) {
    const delta = Math.round((after[key] - before[key]) * scale);
    if (Math.abs(delta) >= 1) result.push({ label, delta });
  }
  for (const key of Object.keys(after.traits)) {
    const delta = Math.round((after.traits[key] - before.traits[key]) * 100);
    if (Math.abs(delta) >= 2)
      result.push({ label: key[0].toUpperCase() + key.slice(1), delta });
  }
  return result;
}

function drift() {
  const t = state.traits,
    m = state.morals;
  t.fear = clamp(
    t.fear +
      (pressures.danger - 0.5) * 0.018 -
      (pressures.community - 0.5) * 0.008,
  );
  t.compassion = clamp(
    t.compassion +
      (pressures.community - 0.5) * 0.012 -
      (pressures.danger - 0.65) * 0.006,
  );
  t.curiosity = clamp(t.curiosity + (pressures.mystery - 0.5) * 0.012);
  t.ambition = clamp(
    t.ambition +
      (pressures.change - 0.5) * 0.009 +
      (pressures.technology - 0.5) * 0.006,
  );
  t.resolve = clamp(t.resolve + (pressures.danger - 0.5) * 0.006);
  t.attachment = clamp(t.attachment + (pressures.community - 0.5) * 0.008);
  m.freedomOrder = clamp(
    m.freedomOrder +
      (pressures.freedom - 0.5) * 0.015 -
      (pressures.danger - 0.5) * 0.008,
  );
  m.preserveChange = clamp(m.preserveChange + (pressures.change - 0.5) * 0.015);
  state.cohesion = clamp(
    state.cohesion +
      (pressures.community - 0.5) * 0.018 -
      (pressures.danger - 0.6) * 0.008,
  );
  state.food = clamp(
    state.food +
      (pressures.abundance - 0.5) * 0.025 -
      state.population * 0.0015,
  );
  state.settlement = clamp(
    state.settlement +
      (pressures.community - 0.45) * 0.01 +
      (pressures.abundance - 0.5) * 0.006,
  );
  state.water = clamp(
    state.water +
      (pressures.abundance - 0.5) * 0.008 -
      (pressures.change - 0.5) * 0.004,
  );
  state.damage = clamp(
    state.damage - (pressures.community * 0.035 + pressures.abundance * 0.02),
  );
}
function naturalGrowth() {
  if (
    state.population > 1 &&
    state.food > 0.52 &&
    state.cohesion > 0.48 &&
    random() < 0.15 + pressures.community * 0.12
  )
    state.population++;
  if (state.food < 0.22 && state.population > 2 && random() < 0.32)
    state.population--;
}
function advanceSeason() {
  state.season++;
  if (state.season > 3) {
    state.season = 0;
    state.year++;
    state.age++;
  }
}
function logStory(text) {
  state.story = text;
}
function carryEchoes() {
  const candidates = [
    {
      trait: "compassion",
      delta: 0.05,
      phrase: "sharing bread feels like keeping an old promise",
      weight: state.traits.compassion + (state.eren ? 0.5 : 0),
    },
    {
      trait: "fear",
      delta: 0.05,
      phrase: "the first drops of rain send her searching for a roof",
      weight: state.traits.fear + (hasMemory("black rain") ? 0.4 : 0),
    },
    {
      trait: "curiosity",
      delta: 0.06,
      phrase: "locked doors feel less like warnings than invitations",
      weight: state.traits.curiosity + (hasMemory("tower") ? 0.4 : 0),
    },
    {
      trait: "attachment",
      delta: 0.06,
      phrase: "the smell of woodsmoke feels like returning home",
      weight: state.traits.attachment + (state.settlement > 0.3 ? 0.4 : 0),
    },
    {
      trait: "resolve",
      delta: 0.05,
      phrase: "her hands are steady before she has earned their steadiness",
      weight: state.traits.resolve + state.scars * 0.12,
    },
  ].sort((a, b) => b.weight - a.weight);
  soulEchoes = candidates
    .slice(0, state.memory.length > 5 ? 2 : 1)
    .map(({ weight, ...echo }) => echo);
  legacy.myths = [...new Set([...legacy.myths, ...state.myths])].slice(-12);
}
function endLife(ending = null) {
  if (!state.alive) return;
  carryEchoes();
  state.alive = false;
  state.paused = true;
  state.lastEvent = "ending";
  state.ending = ending || {
    title: "The last turning",
    text:
      state.health <= 0.06
        ? `Mara's body reaches its limit in Year ${state.year}. Around the hearth, someone takes up the work she can no longer finish. A life ends. Its small consequences do not.`
        : `Mara has grown old in the place she once woke as a stranger. At the end, the Hollow is full of things she helped begin. Not all of them will remember her name.`,
    arc: "mortal",
  };
  if (state.ending.arc === "machine" && state.ending.text.includes("destroys"))
    state.techAwake = 0;
  if (state.ending.arc === "ash" && state.ending.text.includes("abandoned")) {
    state.departed += state.population - 1;
    state.population = 1;
    state.eren = false;
    state.damage = Math.max(0.75, state.damage);
  }
  state.chapter = state.ending.title;
  logStory(state.ending.text);
  const entry = addHistory(state.chapter, state.story, "ending");
  state.currentId = entry.id;
}
