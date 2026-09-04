# ◌ The Turning

**A life shaped by pressure, memory, morality, and chance.**

The Turning is an experimental Streamlit + Three.js narrative ecology. It is not a choose-your-own-adventure story. You never tell the protagonist what to do.

You alter the world around them.

Abundance, danger, community, mystery, change, freedom, technology, and fate become weighted pressures. Those pressures interact with the protagonist's evolving personality, moral tensions, memories, relationships, and accumulated history. The simulation then decides what happens next and writes the result into a living Chronicle.

The same pressures also reshape the 3D diorama: settlement growth, fog, water, ruins, lights, and other visual cues change as the life unfolds.

## The idea

```text
WORLD PRESSURES
      ↓
INNER STATE + MORAL TENSIONS
      ↓
WEIGHTED EVENT FIELD
      ↓
PROBABILISTIC CHOICE
      ↓
CONSEQUENCES + MEMORY
      ↓
CHRONICLE + VISUAL WORLD
      ↺
```

The protagonist can surprise you. Compassion does not guarantee mercy. Fear does not guarantee cowardice. A value only changes the odds.

## Rebirth

A rebirth starts the story again, but death can leave behind small **echoes**—behavioral or emotional residue that the next life cannot consciously remember.

A later run may therefore contain an inexplicable fear, attraction, confidence, grief, or familiarity caused by a previous life. The long-term goal is to let repeated lives create an emergent mythology around the world itself.

## Current prototype

- Streamlit host with embedded Three.js world
- Autonomous low-poly protagonist
- Living low-poly diorama
- 8 user-controlled environmental pressures
- 6 drifting internal personality traits
- 5 moral tension axes rather than a good/evil score
- Weighted event selection
- Probabilistic character decisions
- Seasonal/yearly time progression
- Settlement, health, memory, bonds, and scars
- Chronicle prose generated from actual simulation outcomes
- Rebirth / retained soul echoes
- World visuals respond to simulation state
- Pause, speed, and manual **Turn the Wheel** controls

## Run locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

Then open the local Streamlit URL in a modern browser. Three.js is loaded from jsDelivr at runtime.

## Design rule

> The player chooses the conditions. The character chooses the life.

## Next directions

The architecture is deliberately small enough to evolve quickly. Strong next additions include NPC lineages, places with persistent histories, richer memory salience, event chains, artifacts inherited across lives, procedural sound, weather, multiple biomes, character animation, external JSON event packs, deterministic seeds, save/shareable worlds, and an optional LLM narrator sitting **after** simulation resolution rather than deciding the simulation itself.

---

**Change the pressure. Watch a person become someone. Rebirth. See what survives.**
