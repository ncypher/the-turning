import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const choice=a=>a[Math.floor(Math.random()*a.length)];
const lerp=(a,b,t)=>a+(b-a)*t;
const sig=x=>1/(1+Math.exp(-x));

const pressures={abundance:.55,danger:.36,community:.44,mystery:.68,change:.48,freedom:.62,technology:.24,fate:.50};
const pressureLabels={abundance:'Abundance',danger:'Danger',community:'Community',mystery:'Mystery',change:'Change',freedom:'Freedom',technology:'Technology',fate:'Fate'};
let soulEchoes=[];
let state;

function newLife(reborn=false){
  const inherited={compassion:.52,fear:.38,curiosity:.72,ambition:.40,attachment:.34,resolve:.48};
  if(reborn && soulEchoes.length){
    for(const e of soulEchoes) inherited[e.trait]=clamp(inherited[e.trait]+e.delta);
  }
  state={year:1,season:0,age:24,generation:(state?.generation||0)+1,alive:true,paused:false,speed:1,
    traits:inherited,
    morals:{selfOthers:.52,mercyJustice:.54,freedomOrder:.58,truthBelonging:.61,preserveChange:.49},
    memory:[], bonds:0, scars:0, hope:.56, health:1, settlement:.08, ruins:.70, water:.72,
    chapter:'Awakening beside the dead machine', lastEvent:'awakening'};
  logStory(reborn ? rebirthText() : 'A traveler wakes in wet grass beneath a pale sky. Behind them, a machine large enough to have once carried a village sits silent and half-buried. They remember their name—Mara—but almost nothing else.');
  updateUI();
}
function rebirthText(){
  if(!soulEchoes.length) return 'The world folds inward and begins again. Mara wakes beside the dead machine with no memory of another life, though the morning feels strangely familiar.';
  const echo=choice(soulEchoes);
  return `The world begins again. Mara wakes beside the dead machine. Nothing of the former life can be recalled, yet ${echo.phrase}.`;
}

const events=[
 {id:'stranger', title:'A stranger beneath the mill', base:.8, score:s=> pressures.community*.8 + s.traits.compassion*.7 + pressures.danger*.25 + (1-pressures.abundance)*.45,
  resolve:s=>{
    const help=sig(2.2*s.traits.compassion+1.4*s.morals.selfOthers+pressures.community-.9*s.traits.fear-1.15);
    if(Math.random()<help){s.bonds++; s.traits.compassion=clamp(s.traits.compassion+.035); s.morals.selfOthers=clamp(s.morals.selfOthers+.03); s.memory.push('sheltered a stranger');
      return 'At the abandoned mill, Mara finds a stranger sleeping beneath a sheet of rusted metal. Food is not plentiful. She divides what she has anyway. By morning the stranger has a name—Eren—and the road no longer feels entirely empty.';}
    s.traits.fear=clamp(s.traits.fear+.04); s.morals.selfOthers=clamp(s.morals.selfOthers-.025); s.memory.push('turned away a stranger');
    return 'At the abandoned mill, Mara finds a stranger asleep beneath rusted metal. She watches from the trees until he wakes, then leaves without speaking. That night she eats well and sleeps badly.';
  }},
 {id:'storm',title:'The black rain',base:.75,score:s=>pressures.change*.8+pressures.mystery*.65+pressures.danger*.4,
  resolve:s=>{s.health=clamp(s.health-.05*pressures.danger);s.scars+=Math.random()<.25?1:0;s.traits.resolve=clamp(s.traits.resolve+.03);s.memory.push('survived the black rain');return 'Clouds gather before noon, too quickly and from every direction. The rain that follows is warm, dark, and faintly metallic. Mara shelters inside the dead machine and hears something moving in its sealed lower chambers.';}},
 {id:'garden',title:'Seeds in the ash',base:.65,score:s=>pressures.abundance*.55+pressures.community*.45+s.traits.attachment*.45+(1-pressures.danger)*.3,
  resolve:s=>{s.settlement=clamp(s.settlement+.08);s.hope=clamp(s.hope+.06);s.traits.attachment=clamp(s.traits.attachment+.04);s.memory.push('planted the ash garden');return 'Near the river, Mara discovers a patch of ash where tiny green shoots have survived. She fences the ground with broken antennae and plants the seeds she has carried since waking. It is the first thing she has built for a future self.';}},
 {id:'tower',title:'The light in the tower',base:.62,score:s=>pressures.technology*.75+pressures.mystery*.8+s.traits.curiosity*.65,
  resolve:s=>{const enter=Math.random()<sig(s.traits.curiosity*2- s.traits.fear + pressures.fate-.8); if(enter){s.traits.curiosity=clamp(s.traits.curiosity+.035);s.ruins=clamp(s.ruins-.04);s.memory.push('entered the lit tower');return 'A tower on the western ridge, dead for years by every account, shows a single blue light. Mara climbs to it after sunset. Inside, a machine speaks one sentence in her own voice: “You have been here before.”';} s.traits.fear=clamp(s.traits.fear+.02);return 'A tower on the western ridge shows a single blue light. Mara watches it until dawn but does not climb. When the sun rises the light is gone, and she is relieved enough to distrust the feeling.';}},
 {id:'dispute',title:'Bread and judgment',base:.72,score:s=>pressures.community*.7+(1-pressures.abundance)*.65+s.bonds*.06,
  resolve:s=>{const mercy=s.morals.mercyJustice+s.traits.compassion*.5-s.traits.fear*.2; if(mercy>.7){s.morals.mercyJustice=clamp(s.morals.mercyJustice+.04);s.settlement=clamp(s.settlement+.04);return 'Two families accuse one another of stealing winter flour. The settlement asks Mara to judge. She refuses punishment and divides the remaining stores publicly. Nobody is satisfied, but nobody leaves.';} s.morals.mercyJustice=clamp(s.morals.mercyJustice-.04);s.traits.resolve=clamp(s.traits.resolve+.025);return 'Two families accuse one another of stealing winter flour. Mara orders the suspected thief expelled before sundown. The stores last. So does the memory of the sentence.';}},
 {id:'raiders',title:'Smoke beyond the ridge',base:.55,score:s=>pressures.danger*1.25+s.settlement*.5+(1-pressures.community)*.25,
  resolve:s=>{const stand=sig(s.traits.resolve*1.5+s.traits.attachment+pressures.community-s.traits.fear-.8); if(stand){s.scars++;s.health=clamp(s.health-.12);s.traits.resolve=clamp(s.traits.resolve+.06);s.morals.selfOthers=clamp(s.morals.selfOthers+.03);s.memory.push('stood at the ridge');return 'Smoke rises beyond the ridge and figures appear on the old road. Mara could leave before dark. Instead she stays. The fight is brief, ugly, and enough. By dawn she has a scar beneath her jaw and three more people who call this place home.';} s.settlement=clamp(s.settlement-.08);s.traits.fear=clamp(s.traits.fear+.07);s.memory.push('fled the ridge');return 'Smoke rises beyond the ridge. Mara leaves before the figures reach the old road. From the hills she watches roofs burn in the place she had started to call home.';}},
 {id:'child',title:'A question from a child',base:.58,score:s=>pressures.community*.65+s.settlement*.6+s.traits.attachment*.35,
  resolve:s=>{s.bonds++;s.traits.attachment=clamp(s.traits.attachment+.05);s.morals.truthBelonging=clamp(s.morals.truthBelonging + (pressures.mystery>.6?-.02:.02));return 'A child born after Mara arrived asks what the dead machine was for. Mara realizes she does not know. She tells the truth, then tells a story. Years later, people remember only the story.';}},
 {id:'machine',title:'The machine remembers',base:.48,score:s=>pressures.technology*.85+pressures.fate*.9+pressures.mystery*.75+s.memory.length*.03,
  resolve:s=>{s.morals.truthBelonging=clamp(s.morals.truthBelonging-.035);s.traits.curiosity=clamp(s.traits.curiosity+.04);s.memory.push('heard the machine remember');return `During a windless night the dead machine wakes for eleven seconds. A cracked panel displays fragments: ${choice(['MARA // RETURN VECTOR','LIFE INDEX: '+state.generation,'MEMORY IS NOT IDENTITY','DO NOT TRUST THE FIRST HISTORY'])}. Then it goes dark again.`;}},
 {id:'quiet',title:'A quiet season',base:.9,score:s=>(1-pressures.danger)*.55+pressures.abundance*.45+(1-pressures.change)*.35,
  resolve:s=>{s.health=clamp(s.health+.035);s.hope=clamp(s.hope+.025);return choice(['For once, nothing demands heroism. Mara repairs a roof, mends a coat, and learns where the evening light reaches the river.','A season passes without omen or blood. The ordinariness of it feels almost supernatural.','The roads stay quiet. Bread rises. Someone begins playing a three-stringed instrument badly and often. Mara finds herself hoping it never stops.']);}}
];

function weightedEvent(){
  const scored=events.map(e=>({e,w:Math.max(.02,e.base*e.score(state)*(0.75+pressures.fate*Math.random()*.9))}));
  const total=scored.reduce((a,x)=>a+x.w,0); let r=Math.random()*total;
  for(const x of scored){r-=x.w;if(r<=0)return x.e;} return scored.at(-1).e;
}
function turnWheel(){
  if(!state.alive)return;
  drift();
  const ev=weightedEvent(); state.lastEvent=ev.id; state.chapter=ev.title; logStory(ev.resolve(state));
  advanceSeason(); updateUI(); flashOmen(ev.title); updateWorldTarget();
  if(state.health<=.08 || state.age>78 || (pressures.danger>.88 && Math.random()<.08)) endLife();
}
function drift(){
  const t=state.traits,m=state.morals;
  t.fear=clamp(t.fear+(pressures.danger-.5)*.018-(pressures.community-.5)*.008);
  t.compassion=clamp(t.compassion+(pressures.community-.5)*.012-(pressures.danger-.65)*.006);
  t.curiosity=clamp(t.curiosity+(pressures.mystery-.5)*.012);
  t.ambition=clamp(t.ambition+(pressures.change-.5)*.009+(pressures.technology-.5)*.006);
  t.resolve=clamp(t.resolve+(pressures.danger-.5)*.006);
  m.freedomOrder=clamp(m.freedomOrder+(pressures.freedom-.5)*.015-(pressures.danger-.5)*.008);
  m.preserveChange=clamp(m.preserveChange+(pressures.change-.5)*.015);
  state.settlement=clamp(state.settlement+(pressures.community-.45)*.012+(pressures.abundance-.5)*.008);
  state.water=clamp(state.water+(pressures.abundance-.5)*.008-(pressures.change-.5)*.004);
}
const seasons=['Early Spring','High Summer','Late Autumn','Deep Winter'];
function advanceSeason(){state.season++; if(state.season>3){state.season=0;state.year++;state.age++;}}
function logStory(text){document.getElementById('story').textContent=text;}
function endLife(){
  state.alive=false; state.paused=true;
  const candidates=[
    {trait:'compassion',delta:.06,phrase:'the sight of an empty chair produces grief without explanation'},
    {trait:'fear',delta:-.05,phrase:'thunder feels less frightening than it should'},
    {trait:'curiosity',delta:.07,phrase:'locked doors feel like invitations'},
    {trait:'attachment',delta:.07,phrase:'the smell of woodsmoke feels like returning home'},
    {trait:'resolve',delta:.07,phrase:'the western ridge seems important before she knows why'}
  ];
  soulEchoes=[choice(candidates)]; if(state.memory.length>5 && Math.random()<.55)soulEchoes.push(choice(candidates));
  state.chapter='The last turning';
  logStory(`Mara's life ends in Year ${state.year}. The world continues without asking permission. Some things vanish. Some become stories. Something smaller than memory refuses to disappear.`);
  document.getElementById('pauseBtn').textContent='Ended'; updateUI(); flashOmen('A life becomes an echo');
}

const sliderHost=document.getElementById('sliders');
Object.keys(pressures).forEach(k=>{
  const wrap=document.createElement('div');wrap.innerHTML=`<div class="labelrow"><span>${pressureLabels[k]}</span><span class="val" id="v-${k}">${Math.round(pressures[k]*100)}</span></div><input id="s-${k}" type="range" min="0" max="100" value="${pressures[k]*100}">`;
  sliderHost.appendChild(wrap);wrap.querySelector('input').addEventListener('input',e=>{pressures[k]=+e.target.value/100;document.getElementById('v-'+k).textContent=e.target.value;updateWorldTarget();});
});

const moralDefs=[['selfOthers','Self','Others'],['mercyJustice','Justice','Mercy'],['freedomOrder','Order','Freedom'],['truthBelonging','Belonging','Truth'],['preserveChange','Preserve','Change']];
function updateUI(){
  document.getElementById('dateLine').textContent=`Year ${state.year} · ${seasons[state.season]}`;
  document.getElementById('chapter').textContent=state.chapter;
  document.getElementById('age').textContent=`Age ${state.age}`;
  document.getElementById('generation').textContent=`Life ${roman(state.generation)}`;
  document.getElementById('place').textContent=state.settlement>.58?'The Settlement':state.settlement>.28?'The New Hearth':'The Hollow';
  const traits=document.getElementById('traits');traits.innerHTML='';
  Object.entries(state.traits).forEach(([k,v])=>traits.insertAdjacentHTML('beforeend',`<div class="pill"><b>${k}</b><span>${Math.round(v*100)}</span></div>`));
  const m=document.getElementById('morals');m.innerHTML='';moralDefs.forEach(([k,l,r])=>m.insertAdjacentHTML('beforeend',`<div class="labelrow"><span>${l}</span><span>${r}</span></div><div class="moralbar"><i style="width:${Math.round(state.morals[k]*100)}%"></i></div>`));
  const t=state.traits; let desc=[]; if(t.compassion>.66)desc.push('tender toward strangers'); else if(t.compassion<.38)desc.push('guarded with mercy'); if(t.fear>.62)desc.push('watchful'); if(t.curiosity>.68)desc.push('drawn toward unanswered things'); if(t.resolve>.65)desc.push('difficult to move once decided'); if(t.attachment>.62)desc.push('deeply rooted in people and place');
  document.getElementById('soulLine').textContent=`Mara is ${desc.length?desc.join(', '):'still becoming someone the world can name'}.`;
}
function roman(n){return ['I','II','III','IV','V','VI','VII','VIII','IX','X'][n-1]||String(n)}
function flashOmen(t){const o=document.getElementById('omen');o.textContent=t;o.style.opacity=1;setTimeout(()=>o.style.opacity=0,1600)}

document.getElementById('pauseBtn').onclick=()=>{if(!state.alive)return;state.paused=!state.paused;document.getElementById('pauseBtn').textContent=state.paused?'Resume':'Pause';};
let speedIndex=0;const speeds=[1,2,4];document.getElementById('speedBtn').onclick=()=>{speedIndex=(speedIndex+1)%speeds.length;state.speed=speeds[speedIndex];document.getElementById('speedBtn').textContent=state.speed+'× Time';};
document.getElementById('nudgeBtn').onclick=turnWheel;
document.getElementById('rebirthBtn').onclick=()=>{if(state?.alive){soulEchoes=[];}newLife(true);document.getElementById('pauseBtn').textContent='Pause';updateWorldTarget();};
