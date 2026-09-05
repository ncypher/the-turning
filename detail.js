// --- CHARACTER DETAIL / TERRAIN DRESSING / INTERACTION LANGUAGE ---
// Runs as a visual layer on top of the simulation. No story outcomes are decided here.

function addCharacterDetail(p,kind='villager',index=0){
  if(!p||p.userData.detailed)return;p.userData.detailed=true;
  const u=p.userData;
  const dark=new THREE.MeshStandardMaterial({color:[0x2b2622,0x3a3028,0x4a382c,0x252a2a][index%4],roughness:1});
  const leather=new THREE.MeshStandardMaterial({color:0x4b3728,roughness:.95});
  const cloth2=new THREE.MeshStandardMaterial({color:[0x7b6c53,0x596b64,0x6b586d,0x77564c][index%4],roughness:1});
  // hair / cap
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.275,10,7,0,Math.PI*2,0,Math.PI*.58),dark);hair.position.set(0,2.19,-.01);hair.scale.z=.92;p.add(hair);
  // belt
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.30,.035,6,18),leather);belt.rotation.x=Math.PI/2;belt.position.y=1.22;p.add(belt);
  // shoulder wrap or small pack to break up silhouettes
  if(kind==='mara'||kind==='eren'||index%3===0){const pack=new THREE.Mesh(new THREE.BoxGeometry(.34,.45,.18),leather);pack.position.set(0,1.45,-.30);pack.rotation.x=.08;p.add(pack);}
  if(kind==='mara'){const scarf=new THREE.Mesh(new THREE.TorusGeometry(.24,.045,6,18),cloth2);scarf.rotation.x=Math.PI/2;scarf.position.y=1.78;p.add(scarf);}
  if(kind==='eren'){const satchel=new THREE.Mesh(new THREE.BoxGeometry(.24,.32,.12),cloth2);satchel.position.set(.30,1.12,.05);satchel.rotation.z=-.18;p.add(satchel);}
  if(index%4===1){const staff=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,1.45,6),leather);staff.position.set(.40,.78,.03);staff.rotation.z=-.08;p.add(staff);}
  if(index%5===2){const hood=new THREE.Mesh(new THREE.ConeGeometry(.31,.28,8),cloth2);hood.position.set(0,2.36,0);p.add(hood);}
}
addCharacterDetail(mara,'mara',0);addCharacterDetail(eren,'eren',1);villagers.forEach((v,i)=>addCharacterDetail(v,'villager',i+2));raiders.forEach((v,i)=>addCharacterDetail(v,'raider',i+7));

// Ground texture made from simple low-poly objects rather than an image map.
const terrainDetail=new THREE.Group();scene.add(terrainDetail);
const stoneMat=new THREE.MeshStandardMaterial({color:0x5e6259,roughness:1});
const woodMat=new THREE.MeshStandardMaterial({color:0x4a3527,roughness:1});
const grassMats=[0x40553b,0x536247,0x374b38].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
for(let i=0;i<48;i++){
  const a=Math.random()*Math.PI*2,r=2.3+Math.random()*9.2,x=Math.cos(a)*r,z=Math.sin(a)*r;
  // keep central paths readable
  if((x>0&&x<6&&z>2&&z<7)||Math.hypot(x+4,z-2)<2.7)continue;
  const tuft=new THREE.Group();const blades=2+(i%3);for(let b=0;b<blades;b++){const g=new THREE.Mesh(new THREE.ConeGeometry(.035,.22+Math.random()*.24,4),grassMats[(i+b)%grassMats.length]);g.position.set((b-1)*.07,.12,Math.sin(b)*.05);g.rotation.z=(Math.random()-.5)*.25;tuft.add(g)}tuft.position.set(x,0,z);tuft.rotation.y=Math.random()*6.2;terrainDetail.add(tuft);
}
for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,r=3+Math.random()*8;const s=new THREE.Mesh(new THREE.DodecahedronGeometry(.09+Math.random()*.16,0),stoneMat);s.scale.y=.55;s.position.set(Math.cos(a)*r,.05,Math.sin(a)*r);s.rotation.set(Math.random(),Math.random(),Math.random());terrainDetail.add(s)}
for(const [x,z,rot] of [[-7,1,.2],[6.8,6.2,-.6],[-2,-6,.7]]){const log=new THREE.Mesh(new THREE.CylinderGeometry(.15,.20,1.7,7),woodMat);log.rotation.z=Math.PI/2;log.rotation.y=rot;log.position.set(x,.16,z);terrainDetail.add(log)}
// reeds along water's near edge
for(let i=0;i<22;i++){const ang=-.8+i/21*1.65;const rr=4.5+Math.sin(i)*.12;const reed=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.65+Math.random()*.65,5),new THREE.MeshStandardMaterial({color:0x66724e,roughness:1}));reed.position.set(-5+Math.cos(ang)*rr,.35,2+Math.sin(ang)*rr);reed.rotation.z=(Math.random()-.5)*.12;terrainDetail.add(reed)}
// tiny flowers / mushrooms around abundance-rich zones
const flowerMat=new THREE.MeshBasicMaterial({color:0xd7c79c});const mushroomMat=new THREE.MeshStandardMaterial({color:0xb98f6b,roughness:1});
for(let i=0;i<18;i++){const f=new THREE.Mesh(i%3?new THREE.SphereGeometry(.035,6,4):new THREE.ConeGeometry(.055,.09,6),i%3?flowerMat:mushroomMat);f.position.set(-5+Math.random()*3.3,.06,3.7+Math.random()*2.5);terrainDetail.add(f)}
// garden edging and hearth stones make those places visually permanent
const edgeMat=new THREE.MeshStandardMaterial({color:0x594839,roughness:1});for(let i=0;i<12;i++){const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.45,6),edgeMat);const side=i<6?0:1;post.position.set(-4.85+(i%6)*.34,.22,side?3.4:1.55);garden.add(post)}
for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const s=new THREE.Mesh(new THREE.DodecahedronGeometry(.12,0),stoneMat);s.scale.y=.6;s.position.set(1.7+Math.cos(a)*.58,.07,2.6+Math.sin(a)*.58);scene.add(s)}

// Speech bubbles are canvas-textured sprites so they stay readable from the camera.
const bubbleLayer=[];
function makeBubble(){
 const canvas=document.createElement('canvas');canvas.width=420;canvas.height=120;const ctx=canvas.getContext('2d');
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false});
 const sprite=new THREE.Sprite(mat);sprite.scale.set(3.1,.88,1);sprite.renderOrder=20;sprite.visible=false;scene.add(sprite);return {canvas,ctx,tex,sprite,until:0,person:null};
}
for(let i=0;i<5;i++)bubbleLayer.push(makeBubble());
function bubbleText(b,text){const {canvas,ctx}=b;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(14,17,17,.88)';ctx.strokeStyle='rgba(225,224,211,.38)';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(8,8,404,88,22);ctx.fill();ctx.stroke();ctx.fillStyle='#eee9dd';ctx.font='500 25px Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';let shown=text.length>42?text.slice(0,40)+'…':text;ctx.fillText(shown,210,52);ctx.fillStyle='rgba(14,17,17,.88)';ctx.beginPath();ctx.moveTo(190,95);ctx.lineTo(220,95);ctx.lineTo(204,116);ctx.closePath();ctx.fill();b.tex.needsUpdate=true;}
function say(person,text,duration=4300){if(!person||!person.visible)return;let b=bubbleLayer.find(x=>!x.sprite.visible)||bubbleLayer.sort((a,c)=>a.until-c.until)[0];bubbleText(b,text);b.person=person;b.until=performance.now()+duration;b.sprite.visible=true;}

const ambientTalk={
 quiet:['The roof held through the rain.','I saw deer by the western trees.','Save some wood for morning.','The river is low today.'],
 festival:['Play that one again.','Leave a lantern for Eren.','Nobody remembers why we do this.','The bread is actually good.'],
 dispute:['That is not what happened.','Ask Mara.','We counted the sacks twice.','Someone has to decide.'],
 famine:['How much is left?','Give the children mine.','We can stretch it another week.','The north field failed too.'],
 invention:['It moved!','Again—hold the axle steady.','The blue coil is warm.','Do you hear that hum?'],
 raiders:['Get behind the hearth!','They are on the ridge.','Stay together!','Where is Mara?'],
 child:['Tell me the machine story.','Was the old world bigger?','Did Mara really come from there?','Why does the tower glow?'],
 migration:['You came from the north?','There is room by the second fire.','What happened beyond the ridge?','You can sleep here tonight.'],
 funeral:['Say one true thing.','Leave the stone there.','They loved the river.','We should remember this.'],
 machine:['Did you see the light?','It said her name.','Do not touch it.','It was waiting.']
};
let nextTalkAt=performance.now()+4500,lastTalkEvent='';
function visiblePeople(){return [mara,eren,...villagers].filter(p=>p&&p.visible);}
function interactionLoop(now){
  // follow speakers
  bubbleLayer.forEach(b=>{if(b.sprite.visible){if(!b.person||!b.person.visible||now>b.until){b.sprite.visible=false;b.person=null;}else{b.sprite.position.copy(b.person.position).add(new THREE.Vector3(0,3.05,0));}}});
  if(!state||state.paused||!state.alive||now<nextTalkAt)return;
  const people=visiblePeople();if(people.length<2){nextTalkAt=now+8000;return;}
  let pairs=[];for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){const d=people[i].position.distanceTo(people[j].position);if(d<2.35)pairs.push([people[i],people[j],d]);}
  const event=state.lastEvent;const scripted=ambientTalk[event];
  if(pairs.length&&(scripted||Math.random()<.45)){
    pairs.sort((a,b)=>a[2]-b[2]);const [a,b]=choice(pairs.slice(0,Math.min(4,pairs.length)));const lines=scripted||ambientTalk.quiet;const l1=choice(lines);say(a,l1,3900);if(Math.random()<.58)setTimeout(()=>{if(state?.alive)say(b,choice(lines.filter(x=>x!==l1)),3500)},1200);
  }
  nextTalkAt=now+(scripted?6500:9000)+Math.random()*5000;lastTalkEvent=event;
}
function detailAnimate(now){requestAnimationFrame(detailAnimate);interactionLoop(now);
 // abundance controls how lush the dressing feels without removing permanent objects
 terrainDetail.children.forEach((o,i)=>{if(o.type==='Group'){const lush=.72+pressures.abundance*.5;o.scale.y=lerp(o.scale.y,lush,.01);}});
}
requestAnimationFrame(detailAnimate);

// Important narrative beats get a visible exchange immediately.
const _detailFlash=flashOmen;flashOmen=function(t){_detailFlash(t);setTimeout(()=>{if(!state?.alive)return;const lines=ambientTalk[state.lastEvent];if(lines){const ps=visiblePeople();if(ps.length)say(mara,choice(lines),4400);}},500);};
