// --- STORY ARCS / FATE WHEEL ---
// The simulation still resolves outcomes. This layer gives each life a few hidden
// narrative attractors so identical pressure settings can grow into different histories.
const FATE_ARCS=[
 {id:'pilgrim',name:'The Returning Road',bias:{mystery:.35,freedom:.22},omens:['A road appears in dreams before Mara walks it.','Migrating birds keep turning west above the Hollow.'],ending:'One day Mara follows the oldest road beyond every mapped ridge. Whether she leaves, returns, or becomes the story travelers tell depends on what the world has made of her.'},
 {id:'keeper',name:'The Last Hearth',bias:{community:.38,abundance:.18},omens:['The common fire survives a night when every other flame goes out.','Someone begins leaving an empty chair beside the hearth.'],ending:'The settlement comes to depend on Mara so completely that survival and captivity begin to resemble one another.'},
 {id:'machine',name:'The Remembering Engine',bias:{technology:.38,mystery:.32},omens:['The dead machine clicks once at exactly midnight.','A child draws the machine with a door no adult has ever seen.'],ending:'The machine eventually offers Mara something impossible: evidence that rebirth is not metaphor. What she does with that knowledge can remake the settlement.'},
 {id:'founder',name:'The Daughter Fires',bias:{community:.28,freedom:.28},omens:['Two columns of smoke appear on opposite horizons.','A family begins calling the eastern path by a name Mara never taught them.'],ending:'The Hollow becomes too large to remain one people. Mara may be remembered as founder, tyrant, ancestor, or merely the person who happened to be there when history split.'},
 {id:'witness',name:'The Quiet Witness',bias:{abundance:.18,change:-.18},omens:['Nothing happens for long enough that people become uneasy.','The oldest tree near the river acquires offerings overnight.'],ending:'Mara survives long enough to watch other people become the heroes of the age. Her ending is not conquest or revelation, but deciding what deserves to be remembered.'},
 {id:'ash',name:'The Ash Years',bias:{danger:.38,abundance:-.28},omens:['Ash falls from a clear sky.','Animals abandon the northern woods before anyone knows why.'],ending:'Repeated losses force the settlement to decide what it is willing to become in order to continue.'}
];
function spinFateWheel(){
 const weighted=FATE_ARCS.map(a=>{let w=.55+Math.random()*.9;for(const [k,v] of Object.entries(a.bias))w*=Math.max(.2,1+(pressures[k]-.5)*v*2);return {a,w};});
 let r=Math.random()*weighted.reduce((n,x)=>n+x.w,0);for(const x of weighted){r-=x.w;if(r<=0)return x.a;}return weighted.at(-1).a;
}
function seedLifeArc(){
 if(!state)return;state.fateArc=spinFateWheel();state.arcStage=0;state.arcHeat=.08+Math.random()*.16;state.arcOmens=[];state.endingSeed=Math.random();
}
function arcTick(){
 if(!state?.fateArc||!state.alive)return;
 const a=state.fateArc;let resonance=.02+pressures.fate*.035+pressures.mystery*.012;
 for(const [k,v] of Object.entries(a.bias))resonance+=Math.max(-.015,(pressures[k]-.5)*v*.025);
 state.arcHeat=clamp(state.arcHeat+resonance,0,1);
 if(state.arcStage<a.omens.length&&state.arcHeat>(.38+state.arcStage*.22)){
   const omen=a.omens[state.arcStage++];state.arcOmens.push(omen);state.lore=clamp(state.lore+.025);addHistory('An omen',omen);flashOmen('Something turns beneath the story');
 }
}
function arcWeightForEvent(ev){
 if(!state?.fateArc)return 1;const id=state.fateArc.id;
 const affinity={pilgrim:['migration','schism','tower'],keeper:['festival','child','dispute','funeral'],machine:['machine','tower','invention'],founder:['migration','schism','dispute'],witness:['quiet','funeral','festival','child'],ash:['storm','raiders','famine']}[id]||[];
 return affinity.includes(ev.id)?1+state.arcHeat*.75:1;
}
function possibleEnding(){
 if(!state?.fateArc)return null;const oldEnough=state.age>=58||state.year>=34;const crisis=state.health<.22||state.damage>.72;const mythic=state.arcHeat>.88&&state.lore>.35;
 if(!(oldEnough||crisis||mythic))return null;
 const chance=.015+state.arcHeat*.035+(crisis?.08:0)+(state.age>70?.05:0);if(Math.random()>chance)return null;
 const a=state.fateArc;const variants={
  pilgrim:['Mara walks beyond the western ridge carrying almost nothing. Years later, travelers disagree over whether she ever came back.','Mara returns from the old road with a map she refuses to explain. The map becomes more important than the truth.'],
  keeper:['Mara gives the hearth to a younger keeper and discovers that leaving power is harder than acquiring it.','When the common fire fails, Mara relights it from a coal kept since the first winter. The act becomes a ritual long after its practical reason is forgotten.'],
  machine:['The dead machine opens. Inside is a message in Mara’s handwriting dated before her birth. She enters alone.','Mara destroys the machine’s memory core rather than let the settlement build its future around an answer no one can verify.'],
  founder:['The eastern settlement returns under a different banner and asks Mara to arbitrate between two peoples who both claim her as founder.','Mara refuses a crown nobody intended to call a crown. The refusal becomes the first law of two settlements.'],
  witness:['Mara dies old enough to have become background scenery to three generations. Only afterward do people realize how many stories began in conversations with her.','Mara spends her final years correcting the settlement’s myths, then finally stops correcting them.'],
  ash:['The Hollow is abandoned. Mara is among the last to leave, carrying a jar of garden soil into an unknown country.','The settlement survives the Ash Years, but the people who emerge no longer resemble those who entered them. Mara understands that survival is also a kind of ending.']
 };
 return {title:a.name,text:choice(variants[a.id]),arc:a.id};
}
function renderFateUI(){
 const el=document.getElementById('fateLine');if(!el||!state?.fateArc)return;const known=state.arcOmens?.length>0||state.lore>.42;
 el.textContent=known?`A pattern is forming: ${state.fateArc.name}. ${state.arcOmens.at(-1)||''}`:'The shape of this life is still hidden.';
}

// Hook into existing lifecycle without replacing the simulation engine.
const _arcNewLife=newLife;newLife=function(reborn=false){_arcNewLife(reborn);seedLifeArc();renderFateUI();};
const _arcWeighted=weightedEvent;weightedEvent=function(){const available=events.filter(e=>!e.when||e.when(state));const scored=available.map(e=>({e,w:Math.max(.015,e.base*Math.max(.05,e.score(state))*(.72+pressures.fate*Math.random()*.92)*arcWeightForEvent(e))}));const total=scored.reduce((a,x)=>a+x.w,0);let r=Math.random()*total;for(const x of scored){r-=x.w;if(r<=0)return x.e;}return scored.at(-1).e;};
const _arcTurn=turnWheel;turnWheel=function(){if(!state?.alive)return;arcTick();const ending=possibleEnding();if(ending){state.lastEvent='ending';state.chapter=ending.title;state.alive=false;state.paused=true;remember('life ended through '+ending.arc);logStory(ending.text);addHistory(ending.title,ending.text);mythify(state.lastEvent);updateUI();renderFateUI();flashOmen('The life finds its ending');return;} _arcTurn();renderFateUI();};