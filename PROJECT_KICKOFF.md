# The Turning — Project Kickoff

## North star
Create a compact interactive narrative ecology where the user manipulates environmental pressures instead of selecting story branches. The character's behavior should emerge from weighted interactions among world conditions, personality, morality, memory, relationships, time, and chance.

## Core principles
1. **No branch menu.** The user influences causes, not choices.
2. **Probability over determinism.** Strong traits alter odds; they do not dictate actions.
3. **Morality is plural.** Use tensions such as mercy/justice rather than good/evil.
4. **The world is state.** Visual changes must correspond to simulation variables.
5. **History becomes prose.** Narration reports resolved simulation events rather than inventing unrelated plot.
6. **Memory matters.** Events change future weights.
7. **Rebirth is imperfect.** A small amount of high-salience state can leak into later lives.
8. **Mystery is structural.** The simulation should occasionally produce patterns that are real but not immediately explained to the player.

## V0 architecture
- `app.py` — Streamlit host and self-contained Three.js simulation
- `requirements.txt` — minimal deployment dependency
- `README.md` — player/developer overview
- `PROJECT_KICKOFF.md` — design constraints and roadmap

## V1 refactor target
When the prototype proves fun, split the engine into Python modules:

```text
the_turning/
  app.py
  engine/
    world.py
    character.py
    morality.py
    memory.py
    events.py
    resolver.py
    narrator.py
    rebirth.py
  data/
    events.json
    names.json
  web/
    world.html
    world.js
```

The simulation should remain capable of deterministic runs from a seed even if narration later becomes generative.

## Event contract
Every event should eventually expose:
- prerequisites
- base likelihood
- weighted influences
- possible resolutions
- per-resolution state mutations
- memory salience
- visual effects
- narration template(s)
- downstream tags

## Moral model
Initial axes:
- self ↔ others
- justice ↔ mercy
- order ↔ freedom
- belonging ↔ truth
- preservation ↔ change

They are intentionally not orthogonal or normative. An action can be compassionate and authoritarian, truthful and destructive, loyal and unjust.

## Rebirth model
At death:
1. Rank memories and trait changes by salience.
2. Select a tiny subset as latent echoes.
3. Reset explicit biography/world knowledge.
4. Seed next character with subtle trait deltas, aversions, attractions, dreams, or symbolic familiarity.
5. Allow repeated echoes to become environmental myths, monuments, rituals, or recurring objects.

## Definition of fun
A run is working when the player says some version of:

> "I didn't tell her to do that, but I understand why she did."

That reaction matters more than raw event count.
