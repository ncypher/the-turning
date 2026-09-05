// --- THE REFUGE: PREMISE / HIDDEN TRUTH / SOCIAL EXPANSION ---
// Reframes existing mechanics without discarding them. The cluster is intentional:
// survivors begin inside a safety radius, then spread as confidence and knowledge grow.
const TRUTHS = [
  {
    id: "ark",
    name: "The Ark",
    clues: [
      "A bulkhead beneath the machine bears a star map with no familiar constellations.",
      "The western “horizon” flickers for half a second during the black rain.",
      "Eren finds a maintenance number stamped beneath a river stone.",
    ],
  },
  {
    id: "experiment",
    name: "The Experiment",
    clues: [
      "Three trees share the same scar in exactly the same place.",
      "A buried cable runs beneath soil that should be centuries old.",
      "The tower records weather before it happens.",
    ],
  },
  {
    id: "return",
    name: "The Return",
    clues: [
      "Mara recognizes a path she has never walked.",
      "A grave marker carries a family name one survivor remembers from childhood.",
      "The machine calls this place HOME in a language nobody admits knowing.",
    ],
  },
  {
    id: "catastrophe",
    name: "The Catastrophe",
    clues: [
      "Smoke on the far horizon does not move with the wind.",
      "A traveler arrives carrying coins dated only twelve years ago.",
      "The machine receives a broken transmission containing human voices.",
    ],
  },
  {
    id: "loop",
    name: "The Loop",
    clues: [
      "Someone finds Mara’s handwriting beneath a floorboard built before she woke.",
      "The tower knows the exact number of people at the fire.",
      "A child dreams an event one season before it occurs.",
    ],
  },
  {
    id: "impossible",
    name: "The Impossible Place",
    clues: [
      "The river is longer when walked downstream than upstream.",
      "Two people remember different moons.",
      "For one night the tower casts a shadow toward the moon.",
    ],
  },
];
const refuge = {
  truth: null,
  clues: [],
  knownPlaces: new Set(["hearth", "water", "machine"]),
  confidence: 0.08,
  exploration: 0.05,
  phase: "The Gathering",
};
function spinTruth() {
  return choice(TRUTHS);
}
function refugePhase() {
  const s = state;
  if (!s) return "The Gathering";
  const stability = (s.food + s.cohesion + s.hope) / 3;
  if (s.population <= 3 || stability < 0.34) return "The Gathering";
  if (s.year < 4 || refuge.confidence < 0.28) return "Survival";
  if (refuge.exploration < 0.45) return "Exploration";
  if (s.settlement < 0.58) return "Settlement";
  if (s.lore < 0.45) return "Culture";
  return "The Turning";
}
function safetyRadius() {
  const s = state;
  if (!s) return 2.1;
  const confidence = clamp(
    s.food * 0.22 +
      s.cohesion * 0.22 +
      s.hope * 0.18 +
      (1 - s.traits.fear) * 0.16 +
      s.traits.curiosity * 0.12 +
      refuge.exploration * 0.1,
  );
  return 2.0 + confidence * 5.8;
}
function maybeTruthClue() {
  if (!state?.alive || !refuge.truth) return;
  const gate =
    0.1 +
    pressures.mystery * 0.1 +
    pressures.technology * 0.06 +
    state.traits.curiosity * 0.08;
  if (random() > gate || refuge.clues.length >= refuge.truth.clues.length)
    return;
  let clue = refuge.truth.clues[refuge.clues.length];
  if (!state.eren)
    clue = clue.replace("Eren finds", "One of the strangers finds");
  if (!state.children)
    clue = clue.replace("A child dreams", "A sleeper dreams");
  refuge.clues.push(clue);
  state.lore = clamp(state.lore + 0.045);
  addHistory("Something does not fit", clue, "clue");
}
function refugeTick() {
  refuge.confidence = clamp(
    (state.food + state.cohesion + state.hope + 1 - state.traits.fear) / 4,
  );
  refuge.phase = refugePhase();
  refuge.exploration = clamp(
    refuge.exploration +
      0.008 +
      state.traits.curiosity * 0.006 +
      pressures.freedom * 0.004 -
      pressures.danger * 0.003,
  );
  if (["tower", "machine", "migration", "quiet"].includes(state.lastEvent))
    maybeTruthClue();
}

function resetRefuge() {
  refuge.truth = spinTruth();
  refuge.clues = [];
  refuge.revealed = false;
  refuge.knownPlaces = new Set(["hearth", "water", "machine"]);
  refuge.confidence = 0.08;
  refuge.exploration = 0.05;
  refuge.phase = "The Gathering";
}
