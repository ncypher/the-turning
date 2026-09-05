// --- REFUGE VISUAL BEHAVIOR ---
// Early survivors cluster because the hearth/water/machine are the only known-safe places.
// As confidence grows, activity zones and individual destinations expand outward.
const originalSettlementPlan=settlementPlan.map(v=>v.clone());
const refugeCenter=new THREE.Vector3(1.5,0,2.2);
function scaledFromRefuge(v,scale){return refugeCenter.clone().add(v.clone().sub(refugeCenter).multiplyScalar(scale));}

// Initial shelters stay close; later structures claim the wider terrain.
huts.forEach((h,i)=>{const p=scaledFromRefuge(originalSettlementPlan[i],i<3?.48:.68);h.position.copy(p);});

const _refugeVillagerTarget=villagerTarget;
villagerTarget=function(i,now){
 let t=_refugeVillagerTarget(i,now);const radius=safetyRadius();
 // Early phases favor a few discrete safe stations, not one exact point.
 if(refuge.phase==='The Gathering'){
   const stations=[new THREE.Vector3(.55,0,2.55),new THREE.Vector3(2.8,0,2.35),new THREE.Vector3(1.35,0,3.75),new THREE.Vector3(-.15,0,1.7),new THREE.Vector3(3.15,0,1.15),new THREE.Vector3(-1.8,0,2.2)];
   t=stations[i%stations.length].clone();
 }else{
   const d=t.clone().sub(refugeCenter);if(d.length()>radius)d.setLength(radius);t=refugeCenter.clone().add(d);
   // Exploration sends selected people to frontier posts instead of everyone wandering.
   if((refuge.phase==='Exploration'||refuge.phase==='Settlement'||refuge.phase==='Culture')&&i%4===0){const a=(i*.91+Math.floor(now/42000)*1.3);const rr=Math.min(radius,3.4+refuge.exploration*4.2);t.set(refugeCenter.x+Math.cos(a)*rr,0,refugeCenter.z+Math.sin(a)*rr);}
 }
 return t;
};

// Visible perimeter stones mark the psychological boundary of the early refuge.
const boundary=[];for(let i=0;i<18;i++){const s=new THREE.Mesh(new THREE.DodecahedronGeometry(.07+(i%3)*.018,0),new THREE.MeshStandardMaterial({color:0x59615a,roughness:1,transparent:true,opacity:.28}));scene.add(s);boundary.push(s);}
function animateRefugeVisual(now){requestAnimationFrame(animateRefugeVisual);if(!state)return;const r=safetyRadius();boundary.forEach((s,i)=>{const a=i/boundary.length*Math.PI*2;s.position.set(refugeCenter.x+Math.cos(a)*r,.06,refugeCenter.z+Math.sin(a)*r);s.material.opacity=refuge.phase==='The Gathering'?.26:refuge.phase==='Survival'?.16:.05;});
 // Let later homes migrate visually outward only when the society is ready.
 const spread=refuge.phase==='The Gathering'?.48:refuge.phase==='Survival'?.60:refuge.phase==='Exploration'?.76:refuge.phase==='Settlement'?.90:1;
 huts.forEach((h,i)=>{const desired=scaledFromRefuge(originalSettlementPlan[i],Math.min(1,spread+(i<3?.08:0)));h.position.x=lerp(h.position.x,desired.x,.002);h.position.z=lerp(h.position.z,desired.z,.002);});
}
requestAnimationFrame(animateRefugeVisual);

// Dialogue vocabulary for the retooled opening.
Object.assign(ambientTalk,{awakening:['Do you remember the fall?','I woke by the water.','Was anyone inside it?','Do not go past the trees.'],quiet:['Did you hear that beyond the trees?','I keep dreaming of a corridor.','Stay where the fire is visible.','I know your face. I think.'],machine:['Was anyone inside it?','Why does it know our names?','That panel was dark yesterday.','Do you remember this place?']});