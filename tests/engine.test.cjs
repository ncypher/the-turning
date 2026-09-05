const test = require("node:test"),
  assert = require("node:assert/strict"),
  vm = require("node:vm"),
  fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = ["engine.js", "story_arcs.js", "premise.js", "continuity.js"]
  .map((f) =>
    fs
      .readFileSync(path.join(root, f), "utf8")
      .replace(/^import .*;\s*$/gm, ""),
  )
  .join("\n");
function game(seed = "test", settings = {}) {
  const context = vm.createContext({});
  vm.runInContext(
    source +
      "\n globalThis.api={newLife,turnWheel,endLife,safetyRadius,setSeed,events,get state(){return state},get pressures(){return pressures},get legacy(){return legacy},get echoes(){return soulEchoes},get refuge(){return refuge},record(){return JSON.parse(JSON.stringify({state,pressures,legacy,soulEchoes,refuge:{...refuge,knownPlaces:[...refuge.knownPlaces]},randomState}))}};",
    context,
  );
  const api = context.api;
  api.setSeed(seed);
  Object.assign(api.pressures, settings);
  api.newLife(false);
  return api;
}
function finish(g) {
  for (let i = 0; i < 260 && g.state.alive; i++) g.turnWheel();
  return g;
}
test("a life begins paused, with one coherent opening and a seeded arc", () => {
  const g = game();
  assert.equal(g.state.population, 7);
  assert.equal(g.state.history.length, 1);
  assert.equal(g.state.paused, true);
  assert.ok(g.state.fateArc);
  assert.equal(g.state.year, 1);
  assert.equal(g.state.season, 0);
});
test("identical seeds and pressure changes yield identical histories across lives", () => {
  const a = game("repeat"),
    b = game("repeat");
  for (let i = 0; i < 60; i++) {
    if (i === 10) {
      a.pressures.mystery = 0.95;
      b.pressures.mystery = 0.95;
    }
    a.turnWheel();
    b.turnWheel();
  }
  assert.equal(JSON.stringify(a.record()), JSON.stringify(b.record()));
  a.endLife();
  b.endLife();
  a.newLife(true);
  b.newLife(true);
  for (let i = 0; i < 30; i++) {
    a.turnWheel();
    b.turnWheel();
  }
  assert.equal(JSON.stringify(a.record()), JSON.stringify(b.record()));
});
test("the safety boundary is read-only and cannot let render frames alter the story", () => {
  const g = game();
  const before = JSON.stringify(g.record());
  for (let i = 0; i < 1000; i++) g.safetyRadius();
  assert.equal(JSON.stringify(g.record()), before);
});
test("each turn advances one season and records the matching date", () => {
  const g = game();
  g.turnWheel();
  const record = g.state.history.find((h) => h.id === g.state.currentId);
  assert.equal(g.state.turn, 1);
  assert.equal(g.state.season, 1);
  assert.equal(record.season, "High Summer");
  assert.equal(record.year, g.state.year);
});
test("continuous lives terminate and bounded state holds in diverse conditions", () => {
  for (let i = 0; i < 80; i++) {
    const g = finish(
      game("sample-" + i, {
        abundance: i % 2 ? 0.25 : 0.8,
        danger: i % 2 ? 0.85 : 0.15,
        community: (i % 10) / 10,
        mystery: 0.8,
      }),
    );
    assert.equal(g.state.alive, false);
    for (const key of [
      "health",
      "food",
      "cohesion",
      "lore",
      "hope",
      "settlement",
      "damage",
    ])
      assert.ok(g.state[key] >= 0 && g.state[key] <= 1, key);
    for (const trait of Object.values(g.state.traits))
      assert.ok(trait >= 0 && trait <= 1);
    assert.ok(g.state.population >= 1);
    const before = JSON.stringify(g.record());
    assert.equal(g.turnWheel(), false);
    assert.equal(JSON.stringify(g.record()), before);
    assert.equal(g.state.history.at(-1).kind, "opening");
  }
});
test("both story endings and mortality carry actual experience into rebirth", () => {
  for (const ending of [
    null,
    { title: "Test ending", text: "A life closes.", arc: "machine" },
  ]) {
    const g = game();
    g.state.traits.attachment = 0.99;
    g.state.settlement = 0.9;
    g.state.memory.push("planted the ash garden");
    g.endLife(ending);
    assert.ok(g.echoes.length > 0);
    const echo = g.echoes[0];
    g.newLife(true);
    assert.equal(g.state.generation, 2);
    assert.equal(g.state.paused, true);
    assert.equal(g.legacy.echoStones, 1);
    assert.ok(g.state.inheritedEchoes.some((e) => e.trait === echo.trait));
    assert.equal(g.state.history.length, 1);
    assert.equal(g.refuge.clues.length, 0);
  }
});
test("invention does not conjure Eren and is a one-time milestone", () => {
  const g = game();
  const event = g.events.find((e) => e.id === "invention");
  const text = event.resolve(g.state);
  assert.ok(!text.includes("Eren"));
  assert.equal(event.when(g.state), false);
});
test("funerals reduce population and clues and children respect prerequisites", () => {
  const g = game();
  g.events.find((e) => e.id === "funeral").resolve(g.state);
  assert.equal(g.state.population, 6);
  assert.equal(g.state.deaths, 1);
  assert.equal(g.events.find((e) => e.id === "child").when(g.state), false);
  assert.equal(
    g.events.find((e) => e.id === "revelation").when(g.state),
    false,
  );
});
test("follow-up harvest requires a planted garden and waiting seasons", () => {
  const g = game();
  const harvest = g.events.find((e) => e.id === "harvest");
  assert.equal(harvest.when(g.state), false);
  g.events.find((e) => e.id === "garden").resolve(g.state);
  g.state.eventTurns.garden = 1;
  g.state.turn = 2;
  assert.equal(harvest.when(g.state), false);
  g.state.turn = 4;
  assert.equal(harvest.when(g.state), true);
  harvest.resolve(g.state);
  assert.equal(harvest.when(g.state), false);
});
test("portable page has no runtime CDN and one animation scheduler", () => {
  const html = require("../scripts/preview.cjs")();
  assert.ok(!html.includes("__MODULE__"));
  assert.ok(!html.includes("__IMPORTS__"));
  assert.ok(!html.includes("https://cdn.jsdelivr.net"));
  const visual = [
    "scene.js",
    "detail.js",
    "tuning.js",
    "polish.js",
    "motion_fix.js",
    "refuge_visual.js",
  ]
    .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
    .join("\n");
  assert.ok(!visual.includes("requestAnimationFrame"));
});
test("decorative conversation never consumes seeded story randomness", () => {
  const visual = [
    "scene.js",
    "detail.js",
    "tuning.js",
    "polish.js",
    "motion_fix.js",
    "refuge_visual.js",
    "art.js",
  ]
    .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
    .join("\n");
  assert.ok(!/\bchoice\(/.test(visual));
  assert.ok(!/(?<!\.)\brandom\(/.test(visual));
});
