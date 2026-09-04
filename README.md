# ◌ The Turning

**A life shaped by pressure, memory, morality, and chance.**

The Turning is an experimental Streamlit + Three.js narrative ecology. It is not a choose-your-own-adventure story. You never tell the protagonist what to do.

You alter the world around them.

Abundance, danger, community, mystery, change, freedom, technology, and fate become weighted pressures. Those pressures interact with the protagonist's evolving personality, moral tensions, memories, relationships, settlement health, and accumulated history. The simulation decides what becomes likely, what actually happens, and what people later remember.

The same state drives the 3D diorama. A garden appears because Mara actually planted one. Eren exists because she actually sheltered him. A raid can bring attackers onto the ridge and damage real roofs. New people create a visible settlement. Graves, echo stones, wind-driven technology, lights, weather, and ruins accumulate as the story develops.

## The idea

```text
WORLD PRESSURES
      ↓
INNER STATE + MORAL TENSIONS
      ↓
POPULATION + FOOD + COHESION + LORE
      ↓
WEIGHTED EVENT FIELD
      ↓
PROBABILISTIC CHARACTER CHOICE
      ↓
CONSEQUENCES + MEMORY
      ↓
HISTORY DRIFTS INTO MYTH
      ↓
CHRONICLE + LIVING 3D WORLD
      ↺
```

The protagonist can surprise you. Compassion does not guarantee mercy. Fear does not guarantee cowardice. A value only changes the odds.

## Rebirth

A rebirth begins another life, but the system does not fully erase the past.

Emotional **echoes** can alter the next Mara's personality. Small stone markers remain in the landscape. Myths created by previous settlements can survive after their factual origins are forgotten. A later Mara can therefore inherit familiarity with a river, fear of thunder, attraction to a ruined tower, or even hear a folk story whose title matters to her for reasons she cannot know.

The world remembers lives that the character does not.

## Current build — living settlement

- Streamlit host with embedded Three.js world
- Animated low-poly Mara with event-driven travel
- Persistent Eren character when sheltered
- Population-driven villagers with simple routines around hearth, homes, garden, and water
- Visible raid parties and settlement damage
- Community/abundance-driven repair
- Animated black rain, clouds, smoke, fire, water, birds, motes, trees, and day/night lighting
- Growing homes with night-lit windows
- Physical ash garden and scavenged wind-wheel technology
- Graves and generational echo stones
- 8 user-controlled environmental pressures
- 6 drifting internal personality traits
- 5 moral tension axes rather than a good/evil score
- Population, food, cohesion, lore, health, damage, settlement growth, and technology state
- Weighted event selection with contextual prerequisites
- Migration, famine, disputes, festivals, funerals, raids, inventions, schisms, mysteries, and quiet seasons
- History ledger derived from actual outcomes
- Mythogenesis: factual events can become named traditions and distorted cultural memory
- Rebirth with retained soul echoes and cross-life mythology
- Pause, 1×/2×/4× time, and manual **Turn the Wheel** controls

## Run locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

Then open the local Streamlit URL in a modern browser. Three.js is loaded from jsDelivr at runtime.

## Design rule

> The player chooses the conditions. The character chooses the life.

## Architecture

`app.py` is intentionally tiny. It loads `world.html`, then injects `engine.js` and `scene.js` into the embedded world. The simulation and renderer share one live state, which keeps the visual consequences synchronized with the narrative outcome without introducing a Node build or backend service.

The narrator remains downstream from simulation resolution: prose describes what the weighted system decided instead of deciding the simulation itself.

---

**Change the pressure. Watch a person become someone. Rebirth. See what survives.**
