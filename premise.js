// --- THE REFUGE: PREMISE / HIDDEN TRUTH / SOCIAL EXPANSION ---
// Reframes existing mechanics without discarding them. The cluster is intentional:
// survivors begin inside a safety radius, then spread as confidence and knowledge grow.
const TRUTHS=[
 {id:'ark',name:'The Ark',clues:['A bulkhead beneath the machine bears a star map with no familiar constellations.','The western “horizon” flickers for half a second during the black rain.','Eren finds a maintenance number stamped beneath a river stone.']},
 {id:'experiment',name:'The Experiment',clues:['Three trees share the same scar in exactly the same place.','A buried cable runs beneath soil that should be centuries old.','The tower records weather before it happens.']},
 {id:'return',name:'The Return',clues:['Mara recognizes a path she has never walked.','A grave marker carries a family name one survivor remembers from childhood.','The machine calls this place HOME in a language nobody admits knowing.']},
 {id:'catastrophe',name:'The Catastrophe',clues:['Smoke on the far horizon does not move with the wind.','A traveler arrives carrying coins dated only twelve years ago.','The machine receives a broken transmission containing human voices.']},
 {id:'loop',name:'The Loop',clues:['Someone finds Mara’s handwriting beneath a floorboard built before she woke.','The tower knows the exact number of people at the fire.','A child dreams an event one season before it occurs.']},
 {id:'impossible',name:'The Impossible Place',clues:['The river is longer when walked downstream than upstream.','Two people remember different moons.','For one night the tower casts a shadow toward the moon.']}
];
const refuge={truth:null,clues:[],knownPlaces:new Set(['hearth','water','machine']),confidence:.08,exploration:.05,phase:'The Gathering'};
function spinTruth(){return choice(TRUTHS);}
function refugePhase(){
 const s=state;if(!s)return 'The Gathering';
 const stability=(s.food+s.cohesion+s.hope)/3;
 if(s.population<=3||stability<.34)return 'The Gathering';
 if(s.year<4||refuge.confidence<.28)return 'Survival';
 if(refuge.exploration<.45)return 'Exploration';
 if(s.settlement<.58)return 'Settlement';
 if(s.lore<.45)return 'Culture';
 return 'The Turning';
}
function safetyRadius(){
 const s=state;if(!s)return 2.1;
 const confidence=clamp((s.food*.22+s.cohesion*.22+s.hope*.18+(1-s.traits.fear)*.16+s.traits.curiosity*.12+refuge.exploration*.10));
 refuge.confidence=lerp(refuge.confidence,confidence,.18);
 return 2.0+refuge.confidence*5.8;
}
function maybeTruthClue(){
 if(!state?.alive||!refuge.truth)return;
 const gate=.10+pressures.mystery*.10+pressures.technology*.06+state.traits.curiosity*.08;
 if(Math.random()>gate||refuge.clues.length>=refuge.truth.clues.length)return;
 const clue=refuge.truth.clues[refuge.clues.length];refuge.clues.push(clue);state.lore=clamp(state.lore+.045);addHistory('Something does not fit',clue);flashOmen('Something does not fit');
}
function refugeTick(){
 refuge.phase=refugePhase();refuge.exploration=clamp(refuge.exploration+.008+state.traits.curiosity*.006+pressures.freedom*.004-pressures.danger*.003);
 if(['tower','machine','migration','quiet'].includes(state.lastEvent))maybeTruthClue();
 renderRefugeUI();
}
function renderRefugeUI(){
 const line=document.getElementById('fateLine');if(!line||!state)return;
 const clue=refuge.clues.at(-1);const arcKnown=state.arcOmens?.length>0||state.lore>.42;
 const fate=arcKnown&&state.fateArc?` Beneath it, another pattern seems to be forming: ${state.fateArc.name}.`:'';
 line.textContent=`${refuge.phase}. ${clue?'Latest anomaly: '+clue:'No one knows what lies beyond the safe ground.'}${fate}`;
}

const _refugeNewLife=newLife;newLife=function(reborn=false){_refugeNewLife(reborn);refuge.truth=spinTruth();refuge.clues=[];refuge.knownPlaces=new Set(['hearth','water','machine']);refuge.confidence=.08;refuge.exploration=.05;refuge.phase='The Gathering';const opening=reborn?'The fire is already burning when Mara wakes. Faces gather near it—some familiar in ways she cannot explain. Everyone remembers a name. Nobody agrees on how they arrived.':'Mara wakes beside a dead machine with six strangers close enough to hear breathing. Everyone remembers a name. Nobody remembers arriving. Beyond the trees, something makes a sound like distant surf, though no one has found an ocean.';state.population=Math.max(state.population,7);state.cohesion=.38;state.food=.43;state.chapter='The Gathering';logStory(opening);addHistory('The Gathering',opening);renderRefugeUI();updateUI();};
const _refugeTurn=turnWheel;turnWheel=function(){if(!state?.alive)return;_refugeTurn();if(state?.alive)refugeTick();};

// Start the currently-created first life under the new premise too.
refuge.truth=spinTruth();state.population=Math.max(state.population,7);state.cohesion=.38;state.food=.43;state.chapter='The Gathering';const refugeOpening='Mara wakes beside a dead machine with six strangers close enough to hear breathing. Everyone remembers a name. Nobody remembers arriving. Beyond the trees, something makes a sound like distant surf, though no one has found an ocean.';logStory(refugeOpening);addHistory('The Gathering',refugeOpening);updateUI();renderRefugeUI();