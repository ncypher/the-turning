# ◌ The Turning

**A small world. A long memory.**

Mara wakes beside a dead machine with six strangers. Everyone remembers a name.
Nobody remembers arriving. The player is the Watcher: able to change the world's
pressures, never to choose Mara's next sentence or action.

An autonomous life unfolds through seasons. Refuge becomes settlement; experiences
shape convictions; events become myths. When a life ends, small, experience-shaped
echoes can cross into the next. Somewhere beneath it all, the Hollow has an
explanation that no one yet knows.

> The player chooses the conditions. The character chooses the life.

## Run

```sh
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

For Streamlit deployment, use `app.py` as the entry point. Three.js 0.169.0,
OrbitControls, and their MIT license are bundled in `vendor/`. There is no CDN,
frontend build step, API key, or paid narration service required at runtime.

## Keep watch

- **The world:** choose a preset or tune eight pressures. They can change during
  a life. The seed defines a repeatable thread of story randomness.
- **Begin watching:** one season takes 24 seconds at 1x, 12 at 2x, or 6 at 4x.
  **Next season** advances exactly once, including while paused.
- **Camera:** drag to orbit, scroll or pinch to zoom. The magnifier follows Mara;
  home restores the refuge. The circle enables a slow orbit.
- **Mara:** inspect health, hope, bonds, scars, six evolving traits, and five
  moral tensions. Trait markers compare arrival with the present.
- **Echoes:** see inherited emotional traces, accumulated myths, and discovered
  clues. Rebirth keeps echoes and myths, but starts a fresh biography.
- **Chronicle:** read every event, omen, and clue in the current life, with the
  measurable consequences of each main event. Opening it pauses progression.
- **Save this life:** download readable prose plus a structured record, including
  earlier lives in the current thread. Downloads are records, not loadable saves.

A new life begins paused. An active rebirth or a fresh thread requires confirmation
because it clears the current biography. Refreshing the page resets the browser
session; save a chronicle first if you want to keep it. Background tabs do not
advance seasons or catch up later.

The same seed, initial pressures, and pressure changes at the same turns produce
the same story. Camera movement, decorative dialogue, rendering speed, and the
time spent reading do not consume story randomness.

## Story and world

The existing event catalog remains: strangers, black rain, gardens, the tower,
raids, judgments, children, migrations, festivals, inventions, schisms, funerals,
famine, and quiet seasons. Follow-up events connect the first garden to a harvest,
Eren's arrival to a confession, and three clues to a tentative explanation of the
refuge. Recent events receive lower weights to give other threads room to develop.

Six hidden life arcs and six hidden explanations make different lives possible.
Revelations require evidence. Arc endings check relevant experience and state;
mortality and story endings both produce echoes. Echo selection reflects traits,
memories, relationships, settlement attachment, and scars from the actual life.

The diorama responds to simulation state: garden planting, inventions, settlement
growth, weather, damaged houses, villagers, graves, and generational echo stones.
Residents are a small representative cast rather than a one-to-one rendering of
an arbitrarily large population. Art remains procedural and deliberately stylized.

## Architecture

`render.py` assembles the HTML, CSS, local ES-module import map, and ordered scripts
into one document for Streamlit's scrollable component.

| Files | Responsibility |
| --- | --- |
| `engine.js` | Seeded event selection, state changes, history, seasons, lifecycle |
| `story_arcs.js` | Hidden arcs, omens, supported endings |
| `premise.js` / `continuity.js` | Refuge progression, clues, connected events |
| `scene.js` | Main Three.js scene and visual update |
| `detail.js`, `tuning.js`, `polish.js`, `motion_fix.js`, `refuge_visual.js` | Existing character, settlement, and interaction layers |
| `art.js` | Art direction, camera framing, selection marker, visual reset |
| `controls.js` | One animation scheduler, playback, notebook, dialogs, exports |
| `world.html` / `style.css` | Responsive stage, notebook, and chronicle |

There is one simulation lifecycle and one animation scheduler. Visual layers are
called from that scheduler; they do not advance the story or change its random
stream. Narration reports resolved events rather than inventing simulation facts.
The original design principles are retained in `PROJECT_KICKOFF.md`.

## Development checks

Node.js is optional for local development and unnecessary for Streamlit hosting.

```sh
node --test tests/engine.test.cjs
python -m py_compile app.py render.py
node scripts/preview.cjs
```

The preview serves the assembled app at `http://127.0.0.1:8766`. Opening
`world.html` directly will not work because it is an assembly template.

See `VALIDATION.md` for the tested flows and current limits.
