// Follow-through gives the existing events a past and a future.
events.push(
  {
    id: "harvest",
    title: "What the ash gives back",
    base: 0.8,
    when: (s) =>
      hasMemory("ash garden") &&
      !hasMemory("first harvest") &&
      s.turn - (s.eventTurns.garden || 0) >= 3,
    score: (s) => 0.6 + pressures.abundance + s.traits.attachment,
    resolve: (s) => {
      remember("gathered the first harvest");
      s.food = clamp(s.food + 0.18);
      s.hope = clamp(s.hope + 0.08);
      s.traits.attachment = clamp(s.traits.attachment + 0.04);
      return "The garden Mara fenced with broken antennae finally gives something back. Not much: two baskets of roots, a handful of beans. At supper, someone sets aside the best seeds. For the first time, the strangers are planning beyond the next season.";
    },
  },
  {
    id: "eren_confession",
    title: "The name he almost remembers",
    base: 0.7,
    when: (s) =>
      s.eren &&
      !hasMemory("Eren shared his dream") &&
      s.turn - (s.eventTurns.stranger || 0) >= 3,
    score: (s) => 0.5 + s.traits.compassion + pressures.mystery,
    resolve: (s) => {
      remember("Eren shared his dream");
      s.bonds++;
      s.lore = clamp(s.lore + 0.07);
      const trust =
        random() <
        sig(s.traits.compassion + s.morals.truthBelonging - s.traits.fear);
      s.traits.compassion = clamp(s.traits.compassion + (trust ? 0.03 : -0.02));
      s.cohesion = clamp(s.cohesion + (trust ? 0.07 : -0.03));
      return trust
        ? "Eren waits until the others have gone to sleep. He dreams of a corridor, he says, and a voice calling him by a different name. Mara does not ask him to prove it. She tells him about the tower. For a little while, neither has to be the only person who is afraid."
        : "Eren tells Mara about a corridor he sees in dreams, and a name that is almost his. She asks the same question three different ways. Eventually he stops answering. In the morning they work beside each other, carefully, without speaking of it again.";
    },
  },
  {
    id: "revelation",
    title: "The shape behind the veil",
    base: 1.2,
    when: (s) =>
      refuge.clues.length >= 3 && !hasMemory("assembled the fragments"),
    score: (s) => 1 + pressures.mystery + s.traits.curiosity,
    resolve: (s) => {
      remember("assembled the fragments");
      s.lore = clamp(s.lore + 0.15);
      s.techAwake = clamp(s.techAwake + 0.1);
      s.morals.truthBelonging = clamp(s.morals.truthBelonging + 0.05);
      refuge.revealed = true;
      const answers = {
        ark: "The star map, the flickering horizon, the number beneath the river stone: together they suggest a vessel so large its passengers mistook it for a world.",
        experiment:
          "The identical scars, the buried cable, the weather recorded in advance: someone made this place to watch what happens inside it.",
        return:
          "The familiar path, the family name on the grave, the machine calling this place home: perhaps they were never strangers to the Hollow. Perhaps forgetting was how they came back.",
        catastrophe:
          "The motionless smoke, the recent coins, the human transmission: the old world may not be old at all. Something happened nearby, within living memory.",
        loop: "Her handwriting, the tower counting the living, the dream arriving before its event: time here may be doing something a straight line cannot explain.",
        impossible:
          "The river changes its length. The moons do not agree. A shadow points the wrong way. The Hollow may obey rules that none of them brought with them.",
      };
      return (
        answers[refuge.truth.id] +
        " Mara lays the evidence beside the hearth. It is an explanation, not yet certainty. The others look at the same world a little differently."
      );
    },
  },
);
