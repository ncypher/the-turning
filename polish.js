// --- POLISH PASS: FACES, HEARTH RESPECT, LIVED-IN DETAIL ---
// Runs after tuning.js so it can enforce spatial rules on the final activity layout.

const hearthCenter=new THREE.Vector3(1.7,0,2.6);
const hearthInnerRadius=.92;
const hearthSocialRadius=1.18;

// Route social targets around the hearth rather than through it.
const _polishVillagerTarget=villagerTarget;
villagerTarget=function(i,now){
  const t=_polishVillagerTarget(i,now);
  const dx=t.x-hearthCenter.x,dz=t.z-hearthCenter.z,d=Math.hypot(dx,dz);
  if(d<hearthSocialRadius){const a=d>.001?Math.atan2(dz,dx):(i*.91);t.x=hearthCenter.x+Math.cos(a)*hearthSocialRadius;t.z=hearthCenter.z+Math.sin(a)*hearthSocialRadius;}
  return t;
};

// Mara's event locations should also respect the fire as an object.
Object.assign(pathTargets,{
  festival:new THREE.Vector3(.72,0,3.35),
  famine:new THREE.Vector3(.65,0,2.15),
  quiet:new THREE.Vector3(2.65,0,3.35),
  child:new THREE.Vector3(2.55,0,3.65),
  dispute:new THREE.Vector3(2.75,0,2.05)
});

function enforceWorldCollisions(){
  const people=[mara,eren,...villagers,...raiders].filter(p=>p&&p.visible!==false);
  // Fire is a hard obstacle with a small comfort buffer outside the stone ring.
  for(const p of people){
    const dx=p.position.x-hearthCenter.x,dz=p.position.z-hearthCenter.z,d=Math.hypot(dx,dz);
    if(d<hearthInnerRadius){const a=d>.001?Math.atan2(dz,dx):Math.random()*Math.PI*2;const r=hearthInnerRadius+.045;p.position.x=hearthCenter.x+Math.cos(a)*r;p.position.z=hearthCenter.z+Math.sin(a)*r;}
  }
  // Stronger personal-space repulsion than the original gentle anti-bunching pass.
  for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){
    const a=people[i],b=people[j],dx=b.position.x-a.position.x,dz=b.position.z-a.position.z,d2=dx*dx+dz*dz;
    if(d2>.0001&&d2<.34){const d=Math.sqrt(d2),wanted=.64,push=(wanted-d)*.032;if(push>0){a.position.x-=dx/d*push;a.position.z-=dz/d*push;b.position.x+=dx/d*push;b.position.z+=dz/d*push;}}
  }
  requestAnimationFrame(enforceWorldCollisions);
}
requestAnimationFrame(enforceWorldCollisions);

// --- LOW-POLY FACES ---
const eyeWhite=new THREE.MeshStandardMaterial({color:0xe2d8c6,roughness:.8});
const pupilMat=new THREE.MeshBasicMaterial({color:0x171615});
const browMat=new THREE.MeshStandardMaterial({color:0x2d241f,roughness:1});
const mouthMat=new THREE.MeshBasicMaterial({color:0x5f342f});
function addFace(p,index=0){
  if(!p||p.userData.hasFace)return;p.userData.hasFace=true;
  const face=new THREE.Group();face.name='face';
  const headY=2.12;
  for(const x of[-.085,.085]){
    const white=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),eyeWhite);white.scale.set(1,.72,.38);white.position.set(x,headY+.035,.254);face.add(white);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(.020,7,5),pupilMat);pupil.scale.z=.48;pupil.position.set(x,headY+.035,.278);face.add(pupil);
    const brow=new THREE.Mesh(new THREE.BoxGeometry(.095,.018,.018),browMat);brow.position.set(x,headY+.115,.263);brow.rotation.z=x<0?.08:-.08;face.add(brow);
  }
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.034,7,5),new THREE.MeshStandardMaterial({color:0x9a7159,roughness:1}));nose.scale.set(.72,1.25,.9);nose.position.set(0,headY-.015,.286);face.add(nose);
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.105,.018,.016),mouthMat);mouth.position.set(0,headY-.105,.274);mouth.rotation.z=(index%5===0?.05:0);face.add(mouth);
  for(const x of[-.285,.285]){const ear=new THREE.Mesh(new THREE.SphereGeometry(.045,7,5),new THREE.MeshStandardMaterial({color:0x9f765d,roughness:1}));ear.scale.set(.5,1,.55);ear.position.set(x,headY+.01,0);face.add(ear);}
  p.add(face);p.userData.face=face;p.userData.mouth=mouth;p.userData.brows=face.children.filter(o=>o.geometry?.type==='BoxGeometry').slice(0,2);
}
addFace(mara,0);addFace(eren,1);villagers.forEach((v,i)=>addFace(v,i+2));raiders.forEach((r,i)=>addFace(r,i+20));

// A tiny bit of expression: fear raises brows, compassion softens them, danger flattens mouths.
function animateFaces(now){
  const all=[mara,eren,...villagers,...raiders];
  for(const [i,p] of all.entries()){
    if(!p?.userData?.face)continue;const u=p.userData;
    const fear=(p===mara?(state?.traits?.fear??.4):pressures.danger*.65);
    if(u.brows?.length){u.brows[0].rotation.z=.08+fear*.18;u.brows[1].rotation.z=-.08-fear*.18;}
    if(u.mouth){u.mouth.scale.x=.9+Math.sin(now*.002+i)*.04;u.mouth.rotation.z=(pressures.danger>.7?0:(i%4-1.5)*.015);}
  }
  requestAnimationFrame(animateFaces);
}
requestAnimationFrame(animateFaces);

// --- HEARTH & HOUSE DETAIL ---
const emberMat=new THREE.MeshBasicMaterial({color:0xff7b32});
const charMat=new THREE.MeshStandardMaterial({color:0x241a14,roughness:1});
for(let i=0;i<3;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.72,7),charMat);log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/3;log.position.set(hearthCenter.x,.12,hearthCenter.z);scene.add(log);}
for(let i=0;i<7;i++){const e=new THREE.Mesh(new THREE.DodecahedronGeometry(.045+Math.random()*.035,0),emberMat);const a=Math.random()*Math.PI*2,r=Math.random()*.28;e.position.set(hearthCenter.x+Math.cos(a)*r,.09,hearthCenter.z+Math.sin(a)*r);scene.add(e);}

const livedInMat=new THREE.MeshStandardMaterial({color:0x5c4633,roughness:1});
const ropeMat=new THREE.MeshStandardMaterial({color:0x8a7352,roughness:1});
huts.forEach((h,i)=>{
  // doorway and step make each hut read as enterable architecture.
  const door=new THREE.Mesh(new THREE.BoxGeometry(.30,.54,.035),new THREE.MeshStandardMaterial({color:0x3b2d24,roughness:1}));door.position.set(0,.37,.905);h.add(door);
  const step=new THREE.Mesh(new THREE.BoxGeometry(.42,.09,.28),new THREE.MeshStandardMaterial({color:0x696055,roughness:1}));step.position.set(0,.045,1.02);h.add(step);
  if(i%2===0){const crate=new THREE.Mesh(new THREE.BoxGeometry(.32,.27,.32),livedInMat);crate.position.set(.82,.14,.45);crate.rotation.y=.3+i;h.add(crate);}
  if(i%3===1){const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.18,.20,.42,8),livedInMat);barrel.position.set(-.82,.21,.36);h.add(barrel);}
  if(i%4===2){const line=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.05,5),ropeMat);line.rotation.z=Math.PI/2;line.position.set(.1,1.35,.95);h.add(line);}
});

// Woodpile beside the hearth.
const woodpile=new THREE.Group();for(let i=0;i<7;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.055,.065,.62,6),new THREE.MeshStandardMaterial({color:0x4a3325,roughness:1}));l.rotation.z=Math.PI/2;l.position.set((i%3)*.10,Math.floor(i/3)*.10,(i%2)*.09);woodpile.add(l);}woodpile.position.set(2.75,.05,2.95);woodpile.rotation.y=.35;scene.add(woodpile);
