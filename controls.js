// One place owns playback, navigation, and lifecycle transitions.
const $ = (id) => document.getElementById(id),
  $$ = (query) => document.querySelectorAll(query);
const esc = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const titleCase = (s) => s[0].toUpperCase() + s.slice(1);
const moralDefs = [
  ["selfOthers", "Self", "Others"],
  ["mercyJustice", "Justice", "Mercy"],
  ["freedomOrder", "Order", "Freedom"],
  ["truthBelonging", "Belonging", "Truth"],
  ["preserveChange", "Preservation", "Change"],
];
const pressureHints = {
  abundance: "How generously the land provides",
  danger: "Threats, loss, and the cost of staying",
  community: "The pull toward a shared life",
  mystery: "How often the unexplained finds them",
  change: "Disruption and new possibilities",
  freedom: "Room to leave, question, and begin",
  technology: "The usefulness of the old world",
  fate: "The pull of this life’s hidden pattern",
};
const defaultPressures = { ...pressures };
const presets = {
  haven: {
    abundance: 0.68,
    danger: 0.25,
    community: 0.7,
    mystery: 0.45,
    change: 0.38,
    freedom: 0.58,
    technology: 0.3,
    fate: 0.5,
  },
  mystery: {
    abundance: 0.55,
    danger: 0.36,
    community: 0.44,
    mystery: 0.86,
    change: 0.52,
    freedom: 0.72,
    technology: 0.7,
    fate: 0.72,
  },
  trial: {
    abundance: 0.28,
    danger: 0.84,
    community: 0.4,
    mystery: 0.6,
    change: 0.78,
    freedom: 0.46,
    technology: 0.35,
    fate: 0.65,
  },
};
let currentTab = "world",
  elapsedSeason = 0,
  lastFrame = performance.now(),
  endingSeen = false,
  confirmationKind = null,
  hasWatched = false;
const archivedLives = [];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function changesHTML(changes) {
  return changes
    .map(
      (c) =>
        `<span class="consequence ${c.delta < 0 ? "loss" : ""}">${esc(c.label)} ${c.delta > 0 ? "+" : ""}${c.delta}</span>`,
    )
    .join("");
}
function reflection() {
  const t = state.traits;
  const phrases = [];
  if (t.compassion > 0.65) phrases.push("tender toward strangers");
  else if (t.compassion < 0.4)
    phrases.push("careful about whom she lets close");
  if (t.fear > 0.62) phrases.push("alert to what the quiet might conceal");
  if (t.curiosity > 0.68) phrases.push("drawn toward unanswered things");
  if (t.attachment > 0.6)
    phrases.push("rooted in people she once did not know");
  if (t.resolve > 0.65) phrases.push("steadier than she was at the beginning");
  return `Mara is ${phrases.length ? phrases.join(", ") : "still becoming someone the world can name"}.`;
}
function echoCards(items, empty) {
  return items.length
    ? items
        .map(
          (e) =>
            `<div class="echo-card"><strong>${esc(titleCase(e.trait))} +${Math.round(e.delta * 100)}</strong>${esc(e.phrase)}.</div>`,
        )
        .join("")
    : `<div class="empty-note">${empty}</div>`;
}
function updateUI() {
  $("dateLine").textContent = `Year ${state.year} · ${seasons[state.season]}`;
  $("phaseLabel").textContent = refuge.phase.toUpperCase();
  $("seasonIcon").textContent = ["✳", "☀", "❋", "❄"][state.season];
  $("age").textContent = `Age ${state.age}`;
  $("generation").textContent = `LIFE ${state.generation}`;
  $("sceneStatus").textContent = !state.alive
    ? "A LIFE BECOMES AN ECHO"
    : state.paused
      ? hasWatched
        ? "A MOMENT HELD STILL"
        : "A LIFE NOT YET LIVED"
      : "THE WORLD IS UNFOLDING";
  $("sceneCaption").textContent =
    state.turn === 0
      ? "Seven strangers. One impossible place."
      : `${state.population} souls. ${state.year} years. Still becoming.`;
  $("worldDescription").textContent =
    state.settlement > 0.6
      ? "A place strangers learned to call home."
      : state.ending
        ? "The world keeps the shape of a life."
        : "Where the unknown becomes a home.";
  $("pauseBtn").textContent = state.paused ? "▶" : "Ⅱ";
  $("pauseBtn").disabled = !state.alive;
  $("pauseBtn").setAttribute(
    "aria-label",
    !hasWatched
      ? "Begin watching"
      : state.paused
        ? "Resume watching"
        : "Pause watching",
  );
  $("playTitle").textContent = !state.alive
    ? "This life has found its ending."
    : !hasWatched
      ? "Let a life unfold."
      : state.paused
        ? "There is time to read."
        : "A life is finding its way.";
  $("playSub").textContent = !state.alive
    ? "See what crosses into the next."
    : state.paused
      ? "You shape the world. Mara chooses the life."
      : `${24 / state.speed} seconds per season · Watching at ${state.speed}×`;
  $("nudgeBtn").disabled = !state.alive;
  $$("[data-speed]").forEach((b) => {
    const active = Number(b.dataset.speed) === state.speed;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  $("healthValue").textContent = Math.round(state.health * 100);
  $("hopeValue").textContent = Math.round(state.hope * 100);
  $("bondsValue").textContent = state.bonds;
  $("scarsValue").textContent = state.scars;
  $("maraHealth").textContent = Math.round(state.health * 100);
  $("healthBar").style.width = `${state.health * 100}%`;
  $("soulLine").textContent = reflection();
  $("traits").innerHTML = Object.entries(state.traits)
    .map(
      ([key, value]) =>
        `<div class="trait"><span>${titleCase(key)}</span><div class="trait-track"><i style="width:${value * 100}%"></i><b style="left:${state.initialTraits[key] * 100}%" title="At arrival"></b></div><small>${Math.round(state.initialTraits[key] * 100)} → ${Math.round(value * 100)}</small></div>`,
    )
    .join("");
  $("morals").innerHTML = moralDefs
    .map(
      ([key, left, right]) =>
        `<div class="moral-labels"><span>${left}</span><span>${right}</span></div><div class="moral-track" role="meter" aria-label="${left} to ${right}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(state.morals[key] * 100)}"><i style="left:calc(${state.morals[key] * 100}% - 1px)"></i></div>`,
    )
    .join("");
  $("echoCount").textContent = legacy.echoStones;
  $("echoes").innerHTML = echoCards(
    state.inheritedEchoes,
    "Nothing has crossed the threshold yet. A first life must be lived before it can become an echo.",
  );
  const myths = [...new Set([...legacy.myths, ...state.myths])];
  $("myths").innerHTML = myths.length
    ? myths
        .map((m) => `<div class="myth-card">◌ &nbsp; ${esc(m)}</div>`)
        .join("")
    : '<div class="empty-note">An event is not yet a tradition. Give the world time to remember.</div>';
  $("clues").innerHTML = refuge.clues.length
    ? refuge.clues
        .map(
          (c, i) =>
            `<div class="clue-card"><small>FRAGMENT ${i + 1} / 3</small>${esc(c)}</div>`,
        )
        .join("")
    : '<div class="empty-note">The machine keeps its silence. Some questions need to find you.</div>';
  const entry =
    state.history.find((h) => h.id === state.currentId) || state.history[0];
  $("chapterDate").textContent =
    `LIFE ${state.generation} / YEAR ${entry.year} · ${entry.season.toUpperCase()}`;
  $("chapter").textContent = entry.title;
  $("story").textContent = entry.text;
  $("consequences").innerHTML = entry.changes.length
    ? changesHTML(entry.changes)
    : '<span class="consequence neutral">A life is more than what can be counted.</span>';
  $("entryCount").textContent = String(state.history.length).padStart(2, "0");
  $("popChip").textContent = state.population;
  $("foodChip").textContent = Math.round(state.food * 100);
  $("cohesionChip").textContent = Math.round(state.cohesion * 100);
  $("loreChip").textContent = Math.round(state.lore * 100);
  $("fateLine").textContent = refuge.revealed
    ? `The fragments suggest ${refuge.truth.name}. What to do with that knowledge is another question.`
    : refuge.clues.length
      ? `${refuge.clues.length} fragments of an explanation. The last: ${refuge.clues.at(-1)}`
      : state.arcOmens.length
        ? state.arcOmens.at(-1)
        : "No one knows what lies beyond the safe ground.";
  if ($("journal").open) renderJournal();
  if (!state.alive && !endingSeen) {
    endingSeen = true;
    $("endingTitle").textContent = state.ending.title;
    $("endingStory").textContent = state.ending.text;
    $("endingEchoes").innerHTML = echoCards(
      soulEchoes,
      "Even silence can leave a trace.",
    );
    $("ending").showModal();
  }
}
function syncSliders() {
  for (const key of Object.keys(pressures)) {
    const value = Math.round(pressures[key] * 100);
    $("s-" + key).value = value;
    $("v-" + key).value = value;
    $("s-" + key).style.background =
      `linear-gradient(to right,#ceb389 ${value}%,#41424e ${value}%)`;
  }
}
function selectTab(name) {
  currentTab = name;
  $$("[data-tab]").forEach((b) => {
    const selected = b.dataset.tab === name;
    b.setAttribute("aria-selected", String(selected));
    b.tabIndex = selected ? 0 : -1;
  });
  for (const id of ["world", "mara", "echoes"])
    $("panel-" + id).hidden = id !== name;
}
function flashOmen(text) {
  const omen = $("omen");
  omen.textContent = text;
  omen.style.opacity = 1;
  clearTimeout(flashOmen.timer);
  flashOmen.timer = setTimeout(() => (omen.style.opacity = 0), 2800);
}
function advance() {
  if (!state.alive) return;
  hasWatched = true;
  elapsedSeason = 0;
  turnWheel();
  updateWorldTarget();
  updateUI();
  if (state.alive) flashOmen(state.chapter);
}
function holdForReading() {
  state.paused = true;
  updateUI();
}
function renderJournal() {
  $("journalEntries").innerHTML = state.history
    .map(
      (entry) =>
        `<article class="journal-entry"><span>YEAR ${entry.year} · ${entry.season.toUpperCase()}${entry.kind === "clue" ? " · FRAGMENT" : entry.kind === "omen" ? " · OMEN" : ""}</span><h3>${esc(entry.title)}</h3><p>${esc(entry.text)}</p><div class="consequences">${changesHTML(entry.changes)}</div></article>`,
    )
    .join("");
}
function lifeRecord() {
  return {
    seed: timelineSeed,
    generation: state.generation,
    year: state.year,
    age: state.age,
    ending: state.ending,
    traits: { ...state.traits },
    initialTraits: { ...state.initialTraits },
    history: structuredClone(state.history),
    echoes: structuredClone(soulEchoes),
  };
}
function saveChronicle() {
  const record = lifeRecord();
  const lines = [
    "THE TURNING / A SMALL WORLD, A LONG MEMORY",
    `Thread: ${timelineSeed} | Life ${state.generation}`,
    `Pressures now: ${JSON.stringify(pressures)}`,
    "",
    ...record.history
      .slice()
      .reverse()
      .map(
        (h) =>
          `YEAR ${h.year} / ${h.season} / ${h.title}\n${h.text}\n${h.changes.map((c) => `${c.label} ${c.delta > 0 ? "+" : ""}${c.delta}`).join(" · ")}\n`,
      ),
    "",
    "--- RECORD OF THIS THREAD ---",
    JSON.stringify(
      {
        version: 1,
        seed: timelineSeed,
        lives: [...archivedLives, record],
        myths: legacy.myths,
      },
      null,
      2,
    ),
  ];
  const url = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = `the-turning-${timelineSeed.replace(/[^a-z0-9_-]/gi, "-")}-life-${state.generation}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function beginAgain(kind) {
  if (kind === "rebirth") {
    if (state.alive)
      endLife({
        title: "A life released",
        text: "The Watcher lets this telling go. It is not a death written by the world, but even an unfinished life can leave an echo.",
        arc: "released",
      });
    archivedLives.push(lifeRecord());
    newLife(true);
  } else {
    setSeed($("seedInput").value);
    soulEchoes = [];
    archivedLives.length = 0;
    Object.assign(legacy, {
      lives: 0,
      echoStones: 0,
      myths: [],
      relics: [],
      names: [],
    });
    state = null;
    newLife(false);
  }
  elapsedSeason = 0;
  endingSeen = false;
  hasWatched = false;
  resetLifeArt();
  for (const dialog of document.querySelectorAll("dialog")) dialog.close();
  selectTab(kind === "rebirth" ? "echoes" : "world");
  updateUI();
  $("pauseBtn").focus();
}
function confirmBeginning(kind) {
  holdForReading();
  confirmationKind = kind;
  $("confirmTitle").textContent =
    kind === "rebirth"
      ? "What will survive this life?"
      : "A new thread of possibility?";
  $("confirmText").textContent =
    kind === "rebirth"
      ? "This releases the current life. Its strongest experiences can become echoes in the next. Save the chronicle if you want to keep its words."
      : "This starts a fresh timeline with the seed shown in the notebook and the current pressures. Previous lives and their echoes will be cleared. Save them first if you want to keep them.";
  $("confirm").showModal();
}
function mountControls() {
  $("sliders").innerHTML = Object.keys(pressures)
    .map(
      (key) =>
        `<div class="pressure"><label for="s-${key}">${pressureLabels[key]}<output id="v-${key}">${Math.round(pressures[key] * 100)}</output></label><input id="s-${key}" type="range" min="0" max="100" value="${pressures[key] * 100}" aria-describedby="hint-${key}"><small id="hint-${key}">${pressureHints[key]}</small></div>`,
    )
    .join("");
  for (const key of Object.keys(pressures))
    $("s-" + key).addEventListener("input", (event) => {
      pressures[key] = Number(event.target.value) / 100;
      syncSliders();
      $$("[data-preset]").forEach((b) => b.classList.remove("selected"));
      updateWorldTarget();
    });
  $$("[data-preset]").forEach(
    (b) =>
      (b.onclick = () => {
        Object.assign(pressures, presets[b.dataset.preset]);
        syncSliders();
        $$("[data-preset]").forEach((el) =>
          el.classList.toggle("selected", el === b),
        );
        updateWorldTarget();
      }),
  );
  $$("[data-tab]").forEach((b, i) => {
    b.onclick = () => selectTab(b.dataset.tab);
    b.onkeydown = (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const tabs = [...$$("[data-tab]")];
      let next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? 2
            : (i + (event.key === "ArrowRight" ? 1 : 2)) % 3;
      selectTab(tabs[next].dataset.tab);
      tabs[next].focus();
    };
  });
  $("pauseBtn").onclick = () => {
    if (!state.alive) return;
    hasWatched = true;
    state.paused = !state.paused;
    lastFrame = performance.now();
    updateUI();
  };
  $("nudgeBtn").onclick = advance;
  $$("[data-speed]").forEach(
    (b) =>
      (b.onclick = () => {
        state.speed = Number(b.dataset.speed);
        updateUI();
      }),
  );
  $("journalBtn").onclick = () => {
    holdForReading();
    renderJournal();
    $("journal").showModal();
  };
  $("guideBtn").onclick = () => {
    holdForReading();
    $("guide").showModal();
  };
  $$("[data-close]").forEach(
    (b) => (b.onclick = () => $(b.dataset.close).close()),
  );
  $("homeCamera").onclick = () => {
    wideCamera();
    $("followCamera").setAttribute("aria-pressed", "false");
  };
  $("followCamera").onclick = () => {
    if (cameraMode === "follow") {
      wideCamera();
    } else closeCamera();
    $("followCamera").setAttribute(
      "aria-pressed",
      String(cameraMode === "follow"),
    );
  };
  $("orbitCamera").onclick = () => {
    autoCamera = !autoCamera;
    $("orbitCamera").setAttribute("aria-pressed", String(autoCamera));
  };
  for (const id of ["saveBtn", "endingSave", "confirmSave"])
    $(id).onclick = saveChronicle;
  $("rebirthBtn").onclick = () => {
    if (state.alive) confirmBeginning("rebirth");
    else beginAgain("rebirth");
  };
  $("endingRebirth").onclick = () => beginAgain("rebirth");
  $("newThread").onclick = () => confirmBeginning("thread");
  $("confirmGo").onclick = () => beginAgain(confirmationKind);
  document.addEventListener("visibilitychange", () => {
    lastFrame = performance.now();
  });
}
function frame(now) {
  const dt = Math.min(0.25, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!document.hidden) {
    if (state.alive && !state.paused) {
      elapsedSeason += dt * state.speed;
      if (elapsedSeason >= 24) advance();
    }
    $("timeProgress").style.width =
      `${Math.min(100, (elapsedSeason / 24) * 100)}%`;
    if (!reducedMotion) visualNow += dt * 1000;
    renderScene(visualNow, Math.min(dt, 0.06));
  }
  requestAnimationFrame(frame);
}
mountControls();
Object.assign(pressures, presets.haven);
newLife(false);
resetLifeArt();
syncSliders();
updateUI();
resizeWorld();
requestAnimationFrame(frame);
window.turningSnapshot = () =>
  JSON.parse(
    JSON.stringify({
      seed: timelineSeed,
      randomState,
      state,
      pressures,
      legacy,
      refuge: {
        phase: refuge.phase,
        clues: refuge.clues,
        confidence: refuge.confidence,
        exploration: refuge.exploration,
        revealed: !!refuge.revealed,
      },
      soulEchoes,
      cameraMode,
      view: {
        camera: camera.position.toArray(),
        target: controls.target.toArray(),
        width: host.clientWidth,
        height: host.clientHeight,
        drawCalls: renderer.info.render.calls,
      },
    }),
  );
