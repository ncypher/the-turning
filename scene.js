// --- THREE.JS LIVING DIORAMA ---
const host=document.getElementById('world');
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x0f1618,.028);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,250);camera.position.set(18,13,22);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=12;controls.maxDistance=42;controls.maxPolarAngle=Math.PI*.48;controls.target.set(0,2,0);

const hemi=new THREE.HemisphereLight(0xa9c8cc,0x2d261f,1.9);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe2b6,3.2);sun.position.set(-10,18,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const groundMat=new THREE.MeshStandardMaterial({color:0x26352d,roughness:1});const ground=new THREE.Mesh(new THREE.CylinderGeometry(12,13,1.1,64),groundMat);ground.position.y=-.75;ground.receiveShadow=true;scene.add(ground);
const waterMat=new THREE.MeshPhysicalMaterial({color:0x365d63,roughness:.25,metalness:.05,transparent:true,opacity:.72});const water=new THREE.Mesh(new THREE.CircleGeometry(5.2,48),waterMat);water.rotation.x=-Math.PI/2;water.position.set(-5,.02,2);scene.add(water);

const machine=new THREE.Group();const mm=new THREE.MeshStandardMaterial({color:0x34383a,roughness:.78,metalness:.55});
const body=new THREE.Mesh(new THREE.BoxGeometry(5,2.2,2.5),mm);body.rotation.z=-.09;body.castShadow=true;machine.add(body);
for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.62,.09,8,24),new THREE.MeshStandardMaterial({color:0x596260,metalness:.8,roughness:.3}));ring.rotation.y=Math.PI/2;ring.position.set(-1.4+i*1.4,.15,1.27);machine.add(ring);}
machine.position.set(4,.8,-3);scene.add(machine);

const towerMat=new THREE.MeshStandardMaterial({color:0x3b403f,roughness:.9});const tower=new THREE.Mesh(new THREE.CylinderGeometry(.65,1.1,7,6),towerMat);tower.position.set(-6,3.1,-5);tower.castShadow=true;scene.add(tower);
const beacon=new THREE.PointLight(0x78b7ff,0,8,2);beacon.position.set(-6,6.7,-5);scene.add(beacon);
const beaconOrb=new THREE.Mesh(new THREE.SphereGeometry(.18,12,12),new THREE.MeshBasicMaterial({color:0x9cd0ff,transparent:true,opacity:.1}));beaconOrb.position.copy(beacon.position);scene.add(beaconOrb);

const trees=[];
function makeTree(x,z,s=.9){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,1.8,7),new THREE.MeshStandardMaterial({color:0x4b3529}));trunk.position.y=.9;const crown=new THREE.Mesh(new THREE.ConeGeometry(.7*s,2.4*s,7),new THREE.MeshStandardMaterial({color:0x304d38,roughness:1}));crown.position.y=2.45*s;g.add(trunk,crown);g.position.set(x,0,z);g.rotation.y=Math.random()*Math.PI;g.scale.setScalar(.8+Math.random()*.5);scene.add(g);trees.push(g);}
for(let i=0;i<30;i++){const a=Math.random()*Math.PI*2,r=7+Math.random()*4;makeTree(Math.cos(a)*r,Math.sin(a)*r,.75+Math.random()*.45)}

const huts=[];
function hut(x,z,r=.0){const g=new THREE.Group();const wallMat=new THREE.MeshStandardMaterial({color:0x786553,roughness:1});const roofMat=new THREE.MeshStandardMaterial({color:0x493d32,roughness:1});const wall=new THREE.Mesh(new THREE.CylinderGeometry(.8,.9,1.25,6),wallMat);wall.position.y=.62;const roof=new THREE.Mesh(new THREE.ConeGeometry(1.08,.9,6),roofMat);roof.position.y=1.7;g.add(wall,roof);g.userData={wall,roof,damage:0,repair:1};g.position.set(x,0,z);g.rotation.y=r;g.scale.setScalar(.001);scene.add(g);huts.push(g);}
[[1,4],[3,4.8],[4.6,3.5],[2.2,6.2],[5.4,5.7],[-.4,5.4],[.6,7.2],[6.6,2.3]].forEach((p,i)=>hut(p[0],p[1],i*.45));

function limb(radius,length,material){const pivot=new THREE.Group();const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,4,8),material);mesh.position.y=-length*.38;pivot.add(mesh);mesh.castShadow=true;return {pivot,mesh}}
function humanoid(colors={cloth:0x76664f,skin:0x9f765d},scale=1){
  const g=new THREE.Group();const cloth=new THREE.MeshStandardMaterial({color:colors.cloth,roughness:.9});const skin=new THREE.MeshStandardMaterial({color:colors.skin,roughness:.85});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.85,4,8),cloth);torso.position.y=1.45;torso.castShadow=true;const head=new THREE.Mesh(new THREE.SphereGeometry(.31,16,12),skin);head.position.y=2.35;head.castShadow=true;g.add(torso,head);
  const leftLeg=limb(.105,.72,cloth),rightLeg=limb(.105,.72,cloth),leftArm=limb(.09,.65,cloth),rightArm=limb(.09,.65,cloth);leftLeg.pivot.position.set(-.17,.93,0);rightLeg.pivot.position.set(.17,.93,0);leftArm.pivot.position.set(-.43,1.72,0);rightArm.pivot.position.set(.43,1.72,0);leftArm.pivot.rotation.z=-.12;rightArm.pivot.rotation.z=.12;g.add(leftLeg.pivot,rightLeg.pivot,leftArm.pivot,rightArm.pivot);g.scale.setScalar(scale);
  g.userData={torso,head,leftLeg,rightLeg,leftArm,rightArm,phase:Math.random()*8,target:new THREE.Vector3(),role:'wanderer',active:false,speed:.45+Math.random()*.3};
  return g;
}
const person=humanoid();person.position.set(.3,0,.2);person.scale.setScalar(1.03);scene.add(person);

const pathTargets={awakening:new THREE.Vector3(.3,0,.2),stranger:new THREE.Vector3(2.3,0,4.4),storm:new THREE.Vector3(3.6,0,-2.2),garden:new THREE.Vector3(-3.7,0,2.7),tower:new THREE.Vector3(-5.2,0,-4.3),dispute:new THREE.Vector3(2.6,0,4.7),raiders:new THREE.Vector3(7.0,0,.5),child:new THREE.Vector3(2.8,0,5.1),machine:new THREE.Vector3(3.6,0,-2.1),quiet:new THREE.Vector3(1.5,0,2.8)};
let wanderAngle=0,walkPhase=0;

const villagers=[];
const villagerPalette=[0x586a59,0x6e5b48,0x5c6475,0x775c58,0x4d6d70,0x776d50,0x5e5269,0x6a6656];
for(let i=0;i<12;i++){const v=humanoid({cloth:villagerPalette[i%villagerPalette.length],skin:[0x8d674f,0xa9795a,0x704f3e,0xb48364][i%4]},.72+(i%3)*.06);v.position.set(10+i*.1,0,10);v.visible=false;v.userData.role=['hearth','home','water','garden'][i%4];scene.add(v);villagers.push(v);}
const eren=humanoid({cloth:0x4a5969,skin:0x92705d},.92);eren.visible=false;eren.userData.role='eren';scene.add(eren);

const fireLight=new THREE.PointLight(0xff8a42,2,7,2);fireLight.position.set(1.7,.8,2.6);scene.add(fireLight);
const fire=new THREE.Mesh(new THREE.ConeGeometry(.25,.8,8),new THREE.MeshBasicMaterial({color:0xffa24e}));fire.position.set(1.7,.45,2.6);scene.add(fire);
const smokePuffs=[];for(let i=0;i<9;i++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.12+i*.015,8,6),new THREE.MeshBasicMaterial({color:0x89908d,transparent:true,opacity:.12}));puff.position.set(1.7,.9+i*.32,2.6);scene.add(puff);smokePuffs.push(puff)}

const points=[];for(let i=0;i<110;i++)points.push((Math.random()-.5)*22,Math.random()*6+.4,(Math.random()-.5)*22);const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const psMat=new THREE.PointsMaterial({color:0xe7dfad,size:.055,transparent:true,opacity:.5});const ps=new THREE.Points(pg,psMat);scene.add(ps);
const clouds=[];for(let i=0;i<5;i++){const c=new THREE.Group();for(let j=0;j<4;j++){const m=new THREE.Mesh(new THREE.SphereGeometry(.75+Math.random()*.45,10,7),new THREE.MeshBasicMaterial({color:0xaeb9ba,transparent:true,opacity:.08}));m.position.set(j*.7,Math.random()*.25,Math.random()*.5);c.add(m)}c.position.set(-13+i*6,7+Math.random()*2,-7+Math.random()*7);scene.add(c);clouds.push(c)}
const rainCount=320,rainPos=new Float32Array(rainCount*3);for(let i=0;i<rainCount;i++){rainPos[i*3]=(Math.random()-.5)*20;rainPos[i*3+1]=Math.random()*12;rainPos[i*3+2]=(Math.random()-.5)*20}const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));const rainMat=new THREE.PointsMaterial({color:0x69777b,size:.045,transparent:true,opacity:0});const rain=new THREE.Points(rainGeo,rainMat);scene.add(rain);
const birds=[];for(let i=0;i<4;i++){const b=new THREE.Group();const bm=new THREE.MeshBasicMaterial({color:0x151a1b});for(const side of[-1,1]){const wing=new THREE.Mesh(new THREE.BoxGeometry(.38,.025,.1),bm);wing.position.x=side*.22;wing.rotation.z=side*.28;b.add(wing)}b.position.set(-8+i*3,5.5+i*.3,-6);scene.add(b);birds.push(b)}

const garden=new THREE.Group();for(let i=0;i<18;i++){const sprout=new THREE.Mesh(new THREE.ConeGeometry(.08,.34,5),new THREE.MeshStandardMaterial({color:0x4d7649}));sprout.position.set(-4.8+(i%6)*.36,.16,1.2+Math.floor(i/6)*.38);garden.add(sprout)}garden.visible=false;scene.add(garden);
const scorchMarks=[];for(let i=0;i<4;i++){const s=new THREE.Mesh(new THREE.CircleGeometry(.55+Math.random()*.45,18),new THREE.MeshBasicMaterial({color:0x17120f,transparent:true,opacity:0}));s.rotation.x=-Math.PI/2;s.position.set(1.5+i*1.35,.01,4.2+(i%2)*1.1);scene.add(s);scorchMarks.push(s)}

let target={fog:.028,water:.72,settle:.08,beacon:0};
let lastProcessedEvent='',raidDamage=0,communityPulse=0;

function hasMemory(text){return !!state?.memory?.some(m=>m.includes(text))}
function villagerDestination(v,i,now){
  const role=v.userData.role;
  const home=huts[i%Math.max(1,huts.length)];
  if(role==='water') return new THREE.Vector3(-2.7+Math.sin(now*.00025+i)*1.1,0,2.1+Math.cos(now*.00022+i)*.7);
  if(role==='garden') return new THREE.Vector3(-4.0+(i%3)*.45,0,1.8+(i%2)*.55);
  if(role==='home' && home) return new THREE.Vector3(home.position.x+Math.sin(i)*.7,0,home.position.z+Math.cos(i)*.7);
  return new THREE.Vector3(1.7+Math.sin(now*.00022+i)*1.3,0,2.6+Math.cos(now*.00019+i)*1.2);
}
function animateHumanoid(g,destination,dt,now,amp=.42){
  const d=destination.clone().sub(g.position);d.y=0;const moving=d.length()>.08;
  if(moving){const step=Math.min(d.length(),dt*g.userData.speed);d.normalize();g.position.addScaledVector(d,step);g.rotation.y=Math.atan2(d.x,d.z);g.userData.phase+=dt*7;}
  const swing=moving?Math.sin(g.userData.phase)*amp:Math.sin(now*.002+g.userData.phase)*.025;
  const u=g.userData;u.leftLeg.pivot.rotation.x=swing;u.rightLeg.pivot.rotation.x=-swing;u.leftArm.pivot.rotation.x=-swing*.65;u.rightArm.pivot.rotation.x=swing*.65;g.position.y=Math.abs(Math.sin(g.userData.phase))*0.012;
}
function processStoryConsequences(){
  if(!state || state.lastEvent===lastProcessedEvent)return;
  lastProcessedEvent=state.lastEvent;
  if(state.lastEvent==='raiders'){
    raidDamage=hasMemory('fled the ridge')?1:.58;
    scorchMarks.forEach((s,i)=>s.material.opacity=.28+raidDamage*.38*(1-i*.12));
    huts.forEach((h,i)=>{if(i<Math.ceil(raidDamage*4)){h.userData.damage=raidDamage*(.6+Math.random()*.4);h.userData.repair=0;}});
  }
  if(state.lastEvent==='garden')garden.visible=true;
  if(state.lastEvent==='stranger' && hasMemory('sheltered a stranger'))communityPulse=1;
}
function updateWorldTarget(){
  target.fog=lerp(.012,.055,pressures.mystery*.55+pressures.danger*.35);target.water=clamp(state?.water??.7);target.settle=state?.settlement??.08;target.beacon=pressures.technology*pressures.mystery*3.5;
  const dry=1-pressures.abundance;const mercy=state?.morals?.mercyJustice??.5;const belonging=1-(state?.morals?.truthBelonging??.5);
  groundMat.color.setHSL(.27-dry*.14+belonging*.025,.16+pressures.abundance*.16,.18+pressures.abundance*.05+mercy*.018);
  hemi.color.setHSL(.52-mercy*.05,.22,.72);sun.color.setHSL(.10+mercy*.035,.62,.83);
  hemi.intensity=1.3+pressures.abundance*.9;sun.intensity=2.3+(1-pressures.danger)*1.3;
}

let last=performance.now(),acc=0;
function animate(now){
  requestAnimationFrame(animate);const dt=Math.min(.05,(now-last)/1000);last=now;controls.update();acc+=dt;
  processStoryConsequences();
  scene.fog.density=lerp(scene.fog.density,target.fog,.015);water.scale.setScalar(lerp(water.scale.x,.62+target.water*.5,.02));water.material.opacity=.62+Math.sin(now*.0009)*.08;water.rotation.z=Math.sin(now*.00018)*.015;
  beacon.intensity=lerp(beacon.intensity,target.beacon,.03);beaconOrb.material.opacity=beacon.intensity>.2?1:.1;
  huts.forEach((h,i)=>{const threshold=.16+i*.085;const desired=target.settle>threshold?1:.001;const hs=lerp(h.scale.x,desired,.03);h.scale.setScalar(hs);if(h.userData.damage>0){h.userData.repair=Math.min(1,h.userData.repair+dt*(.008+.028*pressures.community+.02*pressures.abundance));h.userData.damage=Math.max(0,h.userData.damage-dt*(.006+.022*pressures.community));h.userData.roof.rotation.z=Math.sin(i)*h.userData.damage*.32;h.userData.wall.material.color.setHSL(.08,.15,.35-h.userData.damage*.12);}});
  scorchMarks.forEach(s=>s.material.opacity=Math.max(0,s.material.opacity-dt*(.001+.006*pressures.community)));

  if(state){
    const base=pathTargets[state.lastEvent]||pathTargets.awakening;wanderAngle+=dt*(.18+pressures.freedom*.45);const radius=.22+pressures.freedom*.55;const destination=new THREE.Vector3(base.x+Math.cos(wanderAngle)*radius,0,base.z+Math.sin(wanderAngle*.83)*radius);
    const delta=destination.clone().sub(person.position);delta.y=0;const moving=delta.length()>.06;if(moving){const step=Math.min(delta.length(),dt*(.7+state.speed*.22));delta.normalize();person.position.addScaledVector(delta,step);person.rotation.y=Math.atan2(delta.x,delta.z);walkPhase+=dt*7.5;}
    const stride=moving?Math.sin(walkPhase)*.55:Math.sin(now*.002)*.04;const u=person.userData;u.leftLeg.pivot.rotation.x=stride;u.rightLeg.pivot.rotation.x=-stride;u.leftArm.pivot.rotation.x=-stride*.65;u.rightArm.pivot.rotation.x=stride*.65;u.torso.rotation.z=Math.sin(walkPhase*2)*.015;u.head.position.y=2.35+Math.abs(Math.sin(walkPhase))*0.025;person.position.y=Math.abs(Math.sin(walkPhase))*0.018;person.rotation.z=state.health<.35?.08:0;

    eren.visible=hasMemory('sheltered a stranger');if(eren.visible){const ed=new THREE.Vector3(2.1+Math.sin(now*.00018)*1.2,0,3.7+Math.cos(now*.00021)*.9);animateHumanoid(eren,ed,dt,now,.46);}
    const desiredVillagers=Math.min(villagers.length,Math.max(0,Math.floor(state.settlement*11)+Math.min(3,state.bonds)));
    villagers.forEach((v,i)=>{v.visible=i<desiredVillagers;if(v.visible)animateHumanoid(v,villagerDestination(v,i,now),dt,now,.38);});
    garden.visible=garden.visible||hasMemory('planted the ash garden');if(garden.visible){garden.children.forEach((p,i)=>{const s=.55+pressures.abundance*.7+Math.sin(now*.001+i)*.025;p.scale.setScalar(s)});}
  }

  trees.forEach((tr,i)=>{tr.rotation.z=Math.sin(now*.0008+i)*(.005+.025*pressures.change);tr.rotation.x=Math.cos(now*.00065+i*.7)*(.004+.014*pressures.change)});
  communityPulse=Math.max(0,communityPulse-dt*.08);fire.scale.y=.82+Math.sin(now*.015)*.25+communityPulse*.2;fire.rotation.y+=dt*.9;fireLight.intensity=1.5+Math.random()*1.2+communityPulse*2.5;
  smokePuffs.forEach((p,i)=>{p.position.y=.9+((now*.00035+i*.42)%3.1);p.position.x=1.7+Math.sin(now*.0006+i)*.13;p.material.opacity=.03+.08*(1-((p.position.y-.9)/3.1));p.scale.setScalar(.7+(p.position.y-.9)*.16)});
  ps.rotation.y+=dt*(.012+.05*pressures.mystery);psMat.opacity=.18+.52*pressures.mystery;const pos=pg.attributes.position;for(let i=0;i<pos.count;i++)pos.array[i*3+1]+=Math.sin(now*.001+i)*.0008;pos.needsUpdate=true;
  clouds.forEach(c=>{c.position.x+=dt*(.16+.35*pressures.change);if(c.position.x>14)c.position.x=-14;c.children.forEach(m=>m.material.opacity=.035+.14*(pressures.danger*.55+pressures.mystery*.45))});
  const raining=state?.lastEvent==='storm';rainMat.opacity=lerp(rainMat.opacity,raining?.52:Math.max(0,(pressures.danger-.72)*.35),.04);const rp=rainGeo.attributes.position.array;for(let i=0;i<rainCount;i++){rp[i*3+1]-=dt*(8+pressures.danger*7);rp[i*3]+=dt*.8*pressures.change;if(rp[i*3+1]<0){rp[i*3+1]=10+Math.random()*4;rp[i*3]=(Math.random()-.5)*20}}rainGeo.attributes.position.needsUpdate=true;
  birds.forEach((b,i)=>{const phase=now*.0003+i*1.7;b.position.x=Math.sin(phase)*8;b.position.z=-5+Math.cos(phase*.8)*4;b.position.y=5.6+i*.25+Math.sin(phase*3)*.25;b.rotation.y=phase+Math.PI/2;b.children[0].rotation.z=.2+Math.sin(now*.008+i)*.45;b.children[1].rotation.z=-.2-Math.sin(now*.008+i)*.45;b.visible=pressures.abundance>.28});
  if(state&&!state.paused&&state.alive&&acc>(8/state.speed)){acc=0;turnWheel();}
  renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
newLife(false);updateWorldTarget();animate(performance.now());
