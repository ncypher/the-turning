# The Turning: notebook and continuity pass

Verified locally on September 5, 2026, starting from GitHub `main` at `212e7e3`.
The original `C:\dev\the-turning` checkout was clean but 25 commits behind that
baseline. Implementation used an isolated checkout of the latest upstream state.

## Automated checks

Eleven Node tests pass, including 80 complete lives under varied pressures:

- A paused, coherent seven-person opening and an initialized hidden arc.
- Deterministic histories across lives with the same seed and pressure changes.
- Read-only safety-radius calculations: drawing cannot change refuge progression.
- One season per turn and matching chronicle dates.
- Bounded state, reachable terminal states, and no progression after an ending.
- Experience-based echoes for both mortality and story-arc endings.
- Invention without an absent Eren; one-time invention and harvest milestones.
- Actual population changes at funerals and story prerequisites for children.
- A planted garden and elapsed seasons before the first harvest.
- Inlined local module assets, one animation scheduler, and separate visual RNG.

Python compilation and `git diff --check` pass.

## Browser checks

- Desktop 1440px: actual WebGL rendering, notebook tabs, portrait camera, wide
  camera, always-visible playback, and a readable chapter with state changes.
- Phone-width 390px: controls and chronicle reachable; no horizontal overflow;
  canvas display width matches its host after resizing from desktop.
- 4x playback advanced one season after about six seconds. Pause held the turn
  count constant; manual stepping advanced exactly once.
- Chronicle dialog showed all recorded entries. Download contained readable
  events and a structured thread record.
- A complete browser run ended in Year 18, turn 69, through the keeper arc.
  The ending dialog disabled playback. Rebirth began Life II paused, with one
  opening entry and the two actual inherited echoes visible in the notebook.
- Two browser instances with different amounts of visual animation and ambient
  interaction produced identical simulation snapshots after 12 matching turns.
- Actual Streamlit iframe rendered and advanced a season; desktop and phone-size
  canvas dimensions matched their containers. Health endpoint returned 200 `ok`.
- No JavaScript errors observed in the improved checked flows. The original
  `settleMara` error referring to an undefined limb's `pivot` was reproduced before
  the fix. Streamlit still emits its iframe/framework warnings.

## Limits

- These checks do not witness the hosted Streamlit deployment.
- No refresh persistence or loading exported records. Lives persist only within
  the current browser session unless downloaded.
- The prose is authored, event-driven writing. Variations and follow-ups improve
  continuity, but the finite catalog can still repeat over a long life.
- All tested lives terminate; the samples are not a complete balance study.
- WebGL performance depends on the device. The cast is representative rather
  than a simulation of every individual resident.
