import * as T from './vendor/three.module.js';
const $=s=>document.querySelector(s),TAU=Math.PI*2;
const animals=[['토끼','🐰',0xf6eee1,'rabbit'],['판다','🐼',0xf4f2e9,'panda'],['여우','🦊',0xe98b42,'fox'],['곰','🐻',0x9b6747,'bear'],['고양이','🐱',0xa8b9b5,'cat'],['호랑이','🐯',0xe9ae46,'tiger'],['펭귄','🐧',0x344559,'penguin'],['원숭이','🐵',0x9c7752,'monkey'],['토끼 2','🐰',0xe9cbd8,'rabbit'],['판다 2','🐼',0xc6dfd8,'panda'],['여우 2','🦊',0xf0c389,'fox'],['곰 2','🐻',0xb3987b,'bear'],['고양이 2','🐱',0xe9dbb4,'cat'],['호랑이 2','🐯',0xf1ce8b,'tiger'],['펭귄 2','🐧',0x617990,'penguin'],['원숭이 2','🐵',0xc39e7c,'monkey']];
const maps={cliff:{name:'노을 절벽',color:0xe1bd79,sky:0xdba68f,hint:'낙석 주의! 붉은 원 밖으로 피하세요.'},windmill:{name:'풍차 언덕',color:0xa6c66b,sky:0xc8e5e9,hint:'회전 막대가 방향을 바꿉니다!'},ice:{name:'얼음 섬',color:0xc2eaf3,sky:0xc5dbea,hint:'얼음이 녹아요! 균열을 피하세요.'},bridge:{name:'구름 다리',color:0xc6a77c,sky:0xd2def5,hint:'돌풍! 갈라진 발판은 곧 무너집니다.'},bus:{name:'달리는 버스',color:0xf5bf62,sky:0xc9e3dc,hint:'높이 제한 막대! 버스 사이로 피하세요.'},factory:{name:'공장',color:0x6b8589,sky:0xaab9bd,hint:'컨베이어와 프레스에 주의하세요.'}};
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:false});}catch(e){$('#fatal').hidden=false;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;$('#scene').append(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,150);camera.position.set(12,16,20);camera.lookAt(0,0,0);
scene.add(new T.HemisphereLight(0xf5ffff,0x6c7661,2.5));const sun=new T.DirectionalLight(0xfff1ce,3);sun.position.set(-8,18,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16});sun.shadow.bias=-.0005;scene.add(sun);
const world=new T.Group(),actors=new T.Group(),effects=new T.Group();scene.add(world,actors,effects);
const sphere=new T.SphereGeometry(1,16,12),box=new T.BoxGeometry(1,1,1),mats=new Map();
function mat(color){if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.85}));return mats.get(color)}
function mesh(geometry,color,parent,x=0,y=0,z=0,sx=1,sy=sx,sz=sx){const m=new T.Mesh(geometry,mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const ball=(p,c,x,y,z,sx,sy=sx,sz=sx)=>mesh(sphere,c,p,x,y,z,sx,sy,sz),cube=(p,c,x,y,z,sx,sy,sz)=>mesh(box,c,p,x,y,z,sx,sy,sz);
const cylinder=new T.CylinderGeometry(1,1,1,64),rockGeo=new T.DodecahedronGeometry(1,0);
let movers=[],walls=[];
let state='setup',map='cliff',players=[],ranking=[],hazards=[],tiles=[],time=0,countdown=3,radius=6.5,duration=60,paused=false,last=0,nextHazard=2,noticeUntil=0,round=0,ground,rotor,rotorAngle=0,rotorDirection=1,weather=0,sound=true,audio;
let volume=.6;const mapCards=[];
let saved={};try{saved=JSON.parse(localStorage.getItem('namharu-survival-v1')||'{}')}catch{};
const names=Array.from({length:16},(_,i)=>typeof saved.names?.[i]==='string'?saved.names[i]:animals[i][0]);
if(saved.count>=2&&saved.count<=16)$('#count').value=saved.count;if([30,60,90,120].includes(+saved.duration))$('#duration').value=saved.duration;if(maps[saved.map])$('#map').value=saved.map;
if(typeof saved.volume==='number')volume=Math.max(0,Math.min(1,saved.volume));if(typeof saved.sound==='boolean')sound=saved.sound;$('#volume').value=Math.round(volume*100);$('#volume-value').textContent=Math.round(volume*100)+'%';$('#sound').textContent=sound?'소리 켜짐':'소리 꺼짐';$('#sound').setAttribute('aria-pressed',String(sound));
function save(){try{localStorage.setItem('namharu-survival-v1',JSON.stringify({names,count:+$('#count').value,duration:+$('#duration').value,map:$('#map').value,volume,sound}))}catch{}}
function updateCards(){mapCards.forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===$('#map').value)))}
function nameFields(){const host=$('#names');host.replaceChildren();for(let i=0;i<+$('#count').value;i++){const label=document.createElement('label'),icon=document.createElement('span'),input=document.createElement('input');icon.textContent=animals[i][1];input.value=names[i];input.maxLength=16;input.setAttribute('aria-label',`참가자 ${i+1} 이름`);input.addEventListener('input',()=>{names[i]=input.value;save()});label.append(icon,input);host.append(label)}}
function beep(freq=300,len=.08){if(!sound)return;try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.5,audio.currentTime+len);g.gain.setValueAtTime(Math.max(.0001,.08*volume),audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+len);o.start();o.stop(audio.currentTime+len)}catch{}}
function clear(group){for(const child of [...group.children]){group.remove(child);child.traverse(o=>{if(o.isSprite){o.material.map?.dispose();o.material.dispose()}if(o.geometry&&![sphere,box,cylinder,rockGeo].includes(o.geometry))o.geometry.dispose()})}}
function label(text){const c=document.createElement('canvas');c.width=Math.max(136,Math.min(700,text.length*44+36));c.height=72;const x=c.getContext('2d');x.fillStyle='#443c38e8';x.beginPath();x.roundRect(0,0,c.width,72,24);x.fill();x.fillStyle='white';x.font='bold 44px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,c.width/2,37,c.width-24);const texture=new T.CanvasTexture(c),s=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));s.scale.set(c.width/72*.37,.37,1);s.position.y=2.05;return s}
function animal(i){
 const [name,emoji,color,type]=animals[i],g=new T.Group(),body=new T.Group();g.add(body);
 const dark=0x25282c,cream=0xffedcf,white=0xfff9ec;
 ball(body,color,0,.64,0,.43,.5,.34);
 if(type==='panda'){ball(body,dark,0,.83,0,.44,.23,.35);ball(body,white,0,.55,.19,.33,.35,.2)}
 else ball(body,type==='penguin'?white:cream,0,.58,.265,.29,.34,.10);
 const head=new T.Group();head.position.y=1.18;body.add(head);ball(head,color,0,0,0,.46,.43,.4);
 for(const side of [-1,1]){
  if(type==='rabbit'){const ear=ball(head,color,side*.21,.52,-.025,.12,.41,.115);ear.rotation.z=-side*.12;const inner=ball(head,0xf2c2bd,side*.21,.54,.06,.055,.3,.035);inner.rotation.z=-side*.12}
  else if(type==='fox'||type==='cat'||type==='tiger'){const ear=mesh(new T.ConeGeometry(.19,.4,3),color,head,side*.30,.37,-.01);ear.rotation.y=side*.1;ear.rotation.z=-side*.22;const inner=mesh(new T.ConeGeometry(.10,.24,3),type==='fox'?dark:0xd5a6a2,head,side*.30,.39,.06);inner.rotation.z=-side*.22}
  else if(type!=='penguin'){ball(head,type==='panda'?dark:color,side*.37,.29,-.02,.16,.18,.12);if(type!=='panda')ball(head,type==='monkey'?cream:0xb18470,side*.38,.29,.075,.095,.11,.035)}
  if(type==='panda'){const patch=ball(head,dark,side*.18,.01,.335,.15,.18,.09);patch.rotation.z=-side*.25}
  if(type==='monkey')ball(head,cream,side*.16,0,.32,.24,.27,.105);
  if(type==='penguin')ball(head,white,side*.15,-.04,.33,.19,.23,.095);
  // Raised eyeballs and offset pupils retain the toy-like face from every camera angle.
  ball(head,white,side*.17,.025,.37,.095,.115,.065);ball(head,dark,side*.165,.015,.423,.054,.071,.031);ball(head,0xffffff,side*.15,.045,.447,.019);
  if(type==='fox')ball(head,white,side*.23,-.18,.26,.24,.17,.18);
  else if(type!=='penguin')ball(head,type==='panda'?white:cream,side*.105,-.18,.34,.155,.115,.09);
 }
 if(type==='penguin'){const beak=mesh(new T.ConeGeometry(.095,.2,4),0xf2b72e,head,0,-.15,.45);beak.rotation.x=Math.PI/2}
 else{ball(head,type==='cat'||type==='rabbit'?0xce8b87:dark,0,-.125,.455,.065,.045,.045);ball(head,dark,0,-.22,.426,.023,.032,.012)}
 if(type==='tiger'){for(const side of [-1,1]){for(let j=0;j<3;j++){const stripe=ball(head,dark,side*.405,.15-j*.14,.06,.035,.027,.17);stripe.rotation.z=side*.3}for(let j=0;j<3;j++)ball(body,dark,side*.40,.43+j*.15,-.04,.025,.032,.22)}for(let j=-1;j<=1;j++)ball(head,dark,j*.13,.38,.12,.035,.04,.14)}
 if(type==='cat'){for(const side of [-1,1])for(let j=0;j<2;j++){const w=cube(head,0x727b77,side*.35,-.17-j*.06,.38,.22,.012,.012);w.rotation.z=side*(j-.5)*.18}}
 const limbs=[];
 for(const side of [-1,1]){
  const foot=new T.Group();foot.position.set(side*.23,.23,0);body.add(foot);ball(foot,type==='panda'?dark:type==='penguin'?0xf2b72e:color,0,-.09,.10,.18,.15,.25);limbs.push(foot);
  const arm=new T.Group();arm.position.set(side*.37,.9,0);body.add(arm);const hand=ball(arm,type==='panda'?dark:color,side*.05,-.16,.04,type==='penguin'?.115:.15,.25,.15);hand.rotation.z=side*.25;limbs.push(arm);
 }
 if(type==='fox'){const tail=new T.Group();tail.position.set(0,.4,-.26);tail.rotation.x=.65;ball(tail,color,0,.02,-.29,.22,.23,.43);ball(tail,white,0,.01,-.59,.17,.18,.18);body.add(tail)}
 else if(type==='cat'||type==='tiger'||type==='monkey'){const curve=new T.CatmullRomCurve3([new T.Vector3(0,.4,-.26),new T.Vector3(.12,.35,-.55),new T.Vector3(.28,.55,-.72),new T.Vector3(.24,.75,-.74)]);mesh(new T.TubeGeometry(curve,12,.055,8,false),color,body);if(type==='tiger')ball(body,dark,.24,.75,-.74,.065)}
 else if(type!=='penguin')ball(body,type==='panda'?dark:color,0,.36,-.35,.13);
 const tag=label(names[i].trim()||name);tag.position.y=type==='rabbit'?2.23:1.95;g.add(tag);actors.add(g);
 return {g,body,head,limbs,tag,i,name:names[i].trim()||name,x:0,z:0,vx:0,vz:0,alive:true,fall:0,think:0,tx:0,tz:0,stun:0,jump:0,cooldown:0,down:0,attack:0,attackCooldown:Math.random()*.5,swing:null,target:null,hitsTaken:0,punches:0,hits:0,hand:i%2};
}

function skyTexture(top,bottom){const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,top);gr.addColorStop(1,bottom);x.fillStyle=gr;x.fillRect(0,0,4,256);return new T.CanvasTexture(c)}
function ring(parent,r,color,y=.02,width=.018){const m=mesh(new T.TorusGeometry(r,width,5,96),color,parent,0,y,0);m.rotation.x=Math.PI/2;return m}
function spectator(parent,x,y,z,i,scale=.32){const g=new T.Group(),colors=[0xf2c740,0xeb7059,0xe7a6c5,0x5a9ace,0x75bc79,0xe9e5d4,0xa9adb0,0xd78f46];g.position.set(x,y,z);g.scale.setScalar(scale);const c=colors[i%colors.length];ball(g,c,0,.3,0,.35,.3,.35);ball(g,c,0,.68,.06,.25);ball(g,0xffc842,0,.63,.29,.13,.055,.10);for(const s of [-1,1])ball(g,0x252626,s*.1,.73,.28,.027);parent.add(g);return g}
function floatingIsland(x,y,z,r,color){const g=new T.Group();g.position.set(x,y,z);mesh(cylinder,color,g,0,0,0,r,.15,r);const stone=mesh(new T.ConeGeometry(r,2*r,7),0x766354,g,0,-r,0);stone.rotation.z=Math.PI;world.add(g);return g}
function scenery(){
 const pastel=map==='cliff'?0xf8e4ce:map==='ice'?0xe1ebff:map==='bridge'?0xeee2ff:0xf0f5ef;
 for(let i=0;i<9;i++){const a=i/9*TAU+.25,g=new T.Group();g.position.set(Math.cos(a)*14,-1+(i%3)*2,Math.sin(a)*14);g.rotation.y=-world.rotation.y;for(let j=0;j<5;j++)ball(g,pastel,(j-2)*.9,Math.sin(j)*.18,0,1.2,.65,.8);world.add(g)}
 if(map==='cliff'){const deck=mesh(cylinder,0x76553e,world,0,-.45,0,7.5,.22,7.5);for(let i=0;i<76;i++){const a=i/76*TAU;spectator(world,Math.sin(a)*7.12,-.33,Math.cos(a)*7.12,i,.50)}}
 else if(map!=='factory'&&map!=='bus'){for(let i=0;i<8;i++){const a=i/8*TAU,g=floatingIsland(Math.sin(a)*10.3,-.8,Math.cos(a)*10.3,1,map==='ice'?0xdfeaff:map==='bridge'?0xd2bfe5:0x9bc863);for(let j=0;j<4;j++)spectator(g,(j%2-.5)*.65,.1,(Math.floor(j/2)-.5)*.65,i+j,.4)}}
}
function build(){
 clear(world);clear(effects);hazards=[];tiles=[];movers=[];walls=[];map=$('#map').value;radius=6.5;rotor=null;
 world.rotation.y=actors.rotation.y=effects.rotation.y=['bridge','bus','factory'].includes(map)?Math.PI/2:0;
 scene.background?.dispose?.();scene.background=skyTexture(...({cliff:['#b77e85','#f8ceb1'],windmill:['#79b7dd','#dceff6'],ice:['#557daf','#b6d7ef'],bridge:['#a58bc9','#e5d8f6'],bus:['#abcdd6','#dfebda'],factory:['#27252c','#674438']}[map]));scene.fog=new T.Fog(maps[map].sky,35,75);
 if(['cliff','windmill','ice'].includes(map)){
  const color=map==='cliff'?0xe1bd79:map==='ice'?0xb5d7ed:0xa9cf6c;ground=new T.Group();world.add(ground);mesh(cylinder,color,ground,0,-.23,0,6.5,.46,6.5);ring(ground,6.48,map==='ice'?0xe6f6ff:0x806247,0,.065);
  for(const r of [2.4,4.7,6.05])ring(ground,r,map==='cliff'?0xd0ab69:map==='ice'?0xcfe9fa:0x98bf5d,.012,.018);
  const rock=mesh(new T.ConeGeometry(6.48,5.5,12),map==='ice'?0x6386b3:0x80604b,ground,0,-3.15,0);rock.rotation.z=Math.PI;
  if(map==='cliff'){for(let i=0;i<44;i++){const a=i/44*TAU,m=cube(ground,0xf1d5a2,Math.sin(a)*6.2,.20,Math.cos(a)*6.2,.70,.4,.38);m.rotation.y=a;walls.push({m,a,alive:true,fall:0})}}
  if(map==='windmill'){rotor=new T.Group();world.add(rotor);for(let i=0;i<28;i++)cube(rotor,i%2?0xf1eee4:0xe96f51,(i-13.5)*.44,.65,0,.44,.22,.24);mesh(cylinder,0xf1e9d5,world,0,.85,0,.28,1.7,.28);mesh(new T.ConeGeometry(.45,.55,20),0xe37353,world,0,1.95,0)}
 }
 if(map==='bridge'){
  ground=null;for(let i=0;i<22;i++){const z=(i-10.5)*.55,t=cube(world,i%3===0?0xc58d54:i%3===1?0xdba66b:0xe5b77c,0,-.14,z,5.1,.28,.52);for(let j=0;j<4;j++)cube(t,0xb4804e,(j-1.5)*.22,.505,0,.008,.01,.92);tiles.push({mesh:t,z,active:true,warning:0})}
  for(const z of [-5.4,5.4]){const p=mesh(new T.CylinderGeometry(2.1,2.6,7,9),0x8875a3,world,0,-3.8,z);p.rotation.y=.2}
  for(const x of [-2.57,2.57])cube(world,0xf1ce94,x,-.02,0,.1,.16,12.3);
 }
 if(map==='bus'){
  ground=null;cube(world,0x4e565d,0,-2,0,17,.15,100);
  for(let i=0;i<32;i++){const line=cube(world,0xeed16b,0,-1.91,(i-16)*3,.12,.02,1.5);movers.push({m:line,speed:13,min:-48,max:48})}
  for(const x of [-6.3,6.3])cube(world,0xe7e7de,x,-1.9,0,.15,.02,100);
  for(const x of [-2.25,2.25]){
   cube(world,0x2d96bf,x,-.65,0,3.35,1.3,11.5);cube(world,0xeeeae1,x,.025,0,3.35,.1,11.5);cube(world,0xe8e5d9,x,-.83,0,3.4,.18,11.45);
   for(const z of [-4.45,-3.15,-1.85,-.55,.75,2.05,3.35,4.65])for(const s of [-1,1]){cube(world,0xbdd3d6,x+s*1.68,-.40,z,.035,.6,1.12);cube(world,0xf4efe2,x+s*1.7,-.4,z+.59,.04,.72,.06)}
   for(const z of [-3.9,3.9])for(const side of [-1,1]){const wheel=mesh(new T.CylinderGeometry(.48,.48,.27,20),0x242729,world,x+side*1.65,-1.25,z);wheel.rotation.z=Math.PI/2;const hub=mesh(new T.CylinderGeometry(.22,.22,.29,16),0xa4a9a6,world,x+side*1.66,-1.25,z);hub.rotation.z=Math.PI/2}
   for(const z of [-2,2])cube(world,0xd6d9d6,x,.12,z,1.1,.16,1.25);for(const s of [-1,1])cube(world,0xffdf8a,x+s*1.2,-.8,-5.78,.4,.22,.04);
  }
  cube(world,0xc6a172,0,.04,-3,1.35,.10,1.4);for(const x of [-.5,.5])cube(world,0xa9b0ad,x,.06,3,.08,.08,1.6);for(let i=0;i<6;i++)cube(world,0xd3d9d5,0,.06,2.3+i*.28,1.1,.07,.07);
  cube(world,0x84ad70,10,-2.1,0,7,.15,100);cube(world,0xdc6249,7.6,-.65,0,2.8,2.3,11);cube(world,0xeee9df,7.6,-.7,-6.4,2.8,2.2,1.8);for(let i=0;i<18;i++)spectator(world,7.6+(i%2-.5)*1.4,.53,(i/2|0)*1.1-4.5,i,.45);for(let i=0;i<10;i++){const side=i%2?1:-1,z=(i/2|0)*12-25,h=4+i%4;const building=cube(world,[0xc6be9a,0x9ebdb1,0xc09cab,0x9bafbf][i%4],side*12,h/2-1.8,z,5,h,7);movers.push({m:building,speed:13,min:-35,max:35});}
 }
 if(map==='factory'){
  ground=cube(world,0x6e6663,0,-.28,0,10,.55,12);cube(world,0x32282b,0,-1.2,0,12,.9,14);const lava=mesh(cylinder,0xf88832,world,0,.02,0,1.45,.08,1.45);lava.material=mat(0xffad36);lava.material.emissive.setHex(0xff4500);lava.material.emissiveIntensity=.8;for(let i=0;i<20;i++){const a=i*2.4,r=Math.sqrt(i/20)*1.25,m=ball(world,i%2?0xffd844:0xff7020,Math.cos(a)*r,.07,Math.sin(a)*r,.12+i%3*.06,.035,.10+i%3*.06);movers.push({m,bubble:true,base:.07,phase:i})}ring(world,1.5,0x302d2e,.10,.16);
  for(let x=-4.5;x<5;x+=1.5)for(let z=-5.5;z<6;z+=1.5)if(Math.hypot(x,z)>1.8)cube(world,0x8d8179,x,.012,z,1.44,.035,1.44);
  for(const x of [-3.5,3.5]){cube(world,0x302b2f,x,.04,0,2.4,.10,11.8);for(let j=0;j<18;j++){const belt=cube(world,j%2?0x413a3c:0x4e4644,x,.1,j*.65-5.6,2.35,.04,.62);const arrow=mesh(new T.ConeGeometry(.11,.28,3),0xf1c44d,belt,0,.6,0);arrow.rotation.x=x<0?-Math.PI/2:Math.PI/2;movers.push({m:belt,speed:x<0?-1.6:1.6,min:-5.8,max:5.8})}}
  for(const x of [-5.05,5.05])for(let i=0;i<32;i++)cube(world,i%2?0xf1c44d:0x29282a,x,.06,i*.375-5.8,.25,.05,.36);
  for(const x of [-3.5,3.5]){const z=x<0?-6:6;for(let j=0;j<6;j++){const gear=mesh(new T.CylinderGeometry(.27,.27,2.4,8),j%2?0x796e68:0x493f3c,world,x,-.2,z+(j-2.5)*.18);gear.rotation.z=Math.PI/2;movers.push({m:gear,spin:3})}}
  cube(world,0x28262a,5.6,1.65,0,.5,3.3,15);cube(world,0x473d37,5.2,1.3,0,.8,.15,14);
  for(let i=0;i<24;i++)spectator(world,5.0,1.4,(i-11.5)*.55,i,.35);
  
 }
 if(map!=='factory')scenery();
}

function spawn(){clear(actors);players=[];ranking=[];for(let i=0;i<+$('#count').value;i++){const p=animal(i),a=i/(+$('#count').value)*TAU;p.x=Math.cos(a)*3.8;p.z=Math.sin(a)*3.8;if(map==='bridge'){p.x=(i%2?1:-1)*1.05;p.z=+$('#count').value<=2?0:(i/2|0)*9/(Math.ceil(+$('#count').value/2)-1)-4.5}if(map==='bus'){p.x=i%2?2.25:-2.25;p.z=+$('#count').value<=2?0:(i/2|0)*9/(Math.ceil(+$('#count').value/2)-1)-4.5}players.push(p);p.g.position.set(p.x,0,p.z);p.g.rotation.y=Math.atan2(-p.x,-p.z)}$('#roster').replaceChildren();players.forEach(p=>{const s=document.createElement('span');s.textContent=animals[p.i][1];s.title=p.name;$('#roster').append(s)})}
function notice(text){$('#notice').textContent=text;$('#notice').classList.add('visible');noticeUntil=performance.now()+2800}
function start(){save();round++;build();spawn();duration=+$('#duration').value;state='countdown';countdown=3;time=0;nextHazard=2;paused=false;rotorAngle=0;rotorDirection=1;weather=0;$('#setup').hidden=true;$('#result').hidden=true;$('.hud').hidden=false;$('footer').hidden=false;$('#pause').textContent='일시정지';$('#countdown').textContent='3';$('#notice').classList.remove('visible');$('#notice').textContent='';document.body.classList.add('playing');beep(500);updateHUD()}
function settings(){state='setup';paused=false;$('#setup').hidden=false;$('#result').hidden=true;$('.hud').hidden=true;$('footer').hidden=true;$('#countdown').textContent='';$('#notice').classList.remove('visible');document.body.classList.remove('playing');build();spawn();resize()}
function updateHUD(){$('#alive').textContent=`생존 ${players.filter(p=>p.alive).length} / ${players.length}`;$('#clock').textContent=`${Math.floor(time/60).toString().padStart(2,'0')}:${Math.floor(time%60).toString().padStart(2,'0')}`;$('#phase').textContent=paused?'일시정지':time>duration*.65?'최후의 승부':maps[map].name}
function knock(p,dx,dz,power){const d=Math.hypot(dx,dz)||1;p.vx+=dx/d*power;p.vz+=dz/d*power;p.stun=power>5?.9:.3;p.down=power>5?.9:0;p.jump=power>7?.35:.08;if(power>4){const spark=mesh(new T.TorusGeometry(.22,.045,5,12),0xffd75e,effects,p.x,.8,p.z);spark.rotation.x=Math.PI/2;hazards.push({type:'impact',m:spark,age:0})}beep(120,.06)}
function combatDistance(a,b){let d=Math.hypot(a.x-b.x,a.z-b.z);if(map==='bus'&&Math.sign(a.x)!==Math.sign(b.x))d+=5;return d}
function updateCombat(p,dt){
 p.attackCooldown=Math.max(0,p.attackCooldown-dt);
 if(p.stun>0||p.down>0){p.swing=null;return}
 if(!p.swing){const q=p.target;if(q?.alive&&q.down<=0&&p.attackCooldown===0&&Math.hypot(p.x-q.x,p.z-q.z)<1.3){p.hand=1-p.hand;p.swing={elapsed:0,target:q,angle:Math.atan2(q.x-p.x,q.z-p.z),hit:false};p.punches++;p.attackCooldown=.85+Math.random()*.4}return}
 const swing=p.swing;swing.elapsed+=dt;
 if(!swing.hit&&swing.elapsed>=.22){swing.hit=true;const q=swing.target,dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(q.alive&&d<1.65&&q.down<=0&&(Math.sin(swing.angle)*dx+Math.cos(swing.angle)*dz)>0){q.hitsTaken++;p.hits++;const heavy=q.hitsTaken%3===0;knock(q,dx,dz,heavy?6.2:3.3+Math.min(1.4,time/duration));q.swing=null;const flash=label(heavy?'쿵!':'퍽!');flash.position.set(q.x,1.55,q.z);flash.scale.set(.8,.42,1);effects.add(flash);hazards.push({type:'punch',m:flash,age:0});beep(heavy?90:220,.09)}}
 if(swing.elapsed>=.6)p.swing=null;
}
function eliminate(p){if(!p.alive)return;p.alive=false;p.fall=.01;p.tag.visible=false;ranking.push(p);$('#roster').children[p.i].classList.add('out');notice(`${animals[p.i][1]} ${p.name} 탈락!`);beep(160,.25)}
function finish(){const survivors=players.filter(p=>p.alive);if(survivors.length!==1)return;state='finished';const winner=survivors[0];winner.body.rotation.set(0,0,0);winner.body.position.y=0;$('#winner').textContent=winner.name;$('#winner-icon').textContent=animals[winner.i][1];$('#ranking').replaceChildren();[winner,...ranking.toReversed()].forEach((p,i)=>{const li=document.createElement('li');li.textContent=`${i+1}위  ${animals[p.i][1]} ${p.name}`;$('#ranking').append(li)});$('#result').hidden=false;$('footer').hidden=true;$('#countdown').textContent='';beep(780,.5);for(let i=0;i<60;i++){const m=cube(effects,[0xf6c653,0xf18d77,0x8bc7ad,0xf7f4df][i%4],winner.x,2,winner.z,.1,.15,.04);hazards.push({type:'confetti',m,vx:(Math.random()-.5)*8,vz:(Math.random()-.5)*8,vy:Math.random()*7+3,age:0})}}
function hazard(){const alive=players.filter(p=>p.alive),target=alive[Math.floor(Math.random()*alive.length)];if(!target)return;notice(maps[map].hint);
if(map==='cliff'){const wa=Math.random()*TAU;const impact=time<duration*.55?{x:Math.sin(wa)*6,z:Math.cos(wa)*6}:target;const ring=mesh(new T.RingGeometry(.03,1.2,32),0xe77c58,effects,impact.x,.08,impact.z);ring.rotation.x=-Math.PI/2;const m=mesh(rockGeo,0x74604f,effects,impact.x,13,impact.z,.85);hazards.push({type:'rock',m,ring,x:impact.x,z:impact.z,age:0,hit:false})}
if(map==='ice'){const ring=mesh(new T.CircleGeometry(.8,32),0x4b8299,effects,target.x,.035,target.z);ring.rotation.x=-Math.PI/2;hazards.push({type:'hole',m:ring,x:target.x,z:target.z,age:0})}
if(map==='bridge'){const options=tiles.filter(t=>t.active&&!t.warning);if(options.length>2){const t=options[Math.floor(Math.random()*options.length)];t.warning=1.8;t.mesh.material=mat(0xee9567)}weather=(Math.random()>.5?1:-1)*2.5}
if(map==='bus'){const m=cube(effects,0xc96848,0,1.1,-8,8.8,.45,.25);hazards.push({type:'bar',m,age:0,hit:new Set()})}
if(map==='factory'){const x=[-3.3,0,3.3][Math.floor(Math.random()*3)],z=(Math.random()-.5)*7;const m=cube(effects,0xe1b24c,x,5,z,2.7,.6,2),ring=cube(effects,0xe78058,x,.08,z,2.7,.03,2);hazards.push({type:'press',m,ring,x,z,age:0,hit:new Set()})}
}
function supported(p){if(['cliff','windmill','ice'].includes(map)){if(Math.hypot(p.x,p.z)>radius+.15)return false;if(map==='ice'&&hazards.some(h=>h.type==='hole'&&h.age>1.8&&Math.hypot(p.x-h.x,p.z-h.z)<.67))return false;return true}if(map==='bridge')return Math.abs(p.x)<2.6&&tiles.some(t=>t.active&&Math.abs(p.z-t.z)<.30);if(map==='bus')return (Math.abs(p.x)> .5&&Math.abs(p.x)<4&&Math.abs(p.z)<5.8)||(Math.abs(p.x)<=.6&&Math.abs(Math.abs(p.z)-3)<.73);return Math.abs(p.x)<5&&Math.abs(p.z)<5.85&&Math.hypot(p.x,p.z)>1.32}
function updateHazards(dt){for(const h of [...hazards]){h.age+=dt;if(h.type==='punch'){h.m.position.y+=dt*.8;if(h.age>.38)removeHazard(h)}if(h.type==='impact'){h.m.scale.setScalar(1+h.age*5);h.m.position.y+=dt;if(h.age>.35)removeHazard(h)}if(h.type==='rock'){h.m.position.y=13-Math.max(0,h.age-1.3)**2*18;h.ring.visible=Math.sin(h.age*18)>0;if(h.m.position.y<.7&&!h.hit){h.hit=true;for(const w of walls){const x=Math.sin(w.a)*6.2*radius/6.5,z=Math.cos(w.a)*6.2*radius/6.5;if(Math.hypot(x-h.x,z-h.z)<2.2)w.alive=false}players.filter(p=>p.alive&&Math.hypot(p.x-h.x,p.z-h.z)<2.5).forEach(p=>knock(p,p.x-h.x,p.z-h.z,8));h.m.position.y=.5}if(h.age>2.5)removeHazard(h)}if(h.type==='hole'){h.m.scale.setScalar(h.age<1.8?.7+.3*Math.sin(h.age*15):1)}if(h.type==='bar'){h.m.position.z=-8+h.age*5;for(const p of players)if(p.alive&&!h.hit.has(p.i)&&Math.abs(p.z-h.m.position.z)<.5&&p.jump<.2){h.hit.add(p.i);knock(p,0,1,8)}if(h.age>3.5)removeHazard(h)}if(h.type==='press'){h.m.position.y=h.age<1.5?5:Math.max(.25,5-(h.age-1.5)*14);h.ring.visible=h.age<1.5?Math.sin(h.age*18)>0:false;if(h.age>1.7)for(const p of players)if(p.alive&&!h.hit.has(p.i)&&Math.abs(p.x-h.x)<1.6&&Math.abs(p.z-h.z)<1.2){h.hit.add(p.i);knock(p,p.x-h.x||.5,p.z-h.z||.5,11)}if(h.age>2.8)removeHazard(h)}if(h.type==='confetti'){h.vy-=dt*8;h.m.position.x+=h.vx*dt;h.m.position.y+=h.vy*dt;h.m.position.z+=h.vz*dt;h.m.rotation.z+=dt*4;if(h.age>5)removeHazard(h)}}}
function removeHazard(h){effects.remove(h.m);if(h.m.isSprite){h.m.material.map.dispose();h.m.material.dispose()}if(h.ring){effects.remove(h.ring);if(h.ring.geometry!==box)h.ring.geometry.dispose()}if(h.m.geometry&&![box,sphere,rockGeo].includes(h.m.geometry))h.m.geometry.dispose();hazards.splice(hazards.indexOf(h),1)}
function simulate(dt){time+=dt;for(const v of movers){if(v.spin){v.m.rotation.x+=v.spin*dt;continue}if(v.bubble){v.m.position.y=v.base+Math.sin(time*3+v.phase)*.025;continue}v.m.position.z+=v.speed*dt;if(v.m.position.z>v.max)v.m.position.z=v.min;if(v.m.position.z<v.min)v.m.position.z=v.max}const late=Math.max(0,(time/duration-.55)/.45);if(['cliff','ice','windmill'].includes(map)){radius=Math.max(.8,6.5-late*4.8);ground.scale.set(radius/6.5,1,radius/6.5)}if(time>=nextHazard){hazard();nextHazard=time+(map==='ice'?5:4)/(1+late*.5)}
if(rotor){if(Math.floor(time/7)!==Math.floor((time-dt)/7))rotorDirection*=-1;rotorAngle+=dt*(.65+late*.4)*rotorDirection;rotor.rotation.y=rotorAngle;for(const p of players){const c=Math.cos(rotorAngle),s=Math.sin(rotorAngle),x=p.x*c-p.z*s,z=p.x*s+p.z*c;if(p.alive&&p.cooldown<=0&&Math.hypot(p.x,p.z)<radius&&Math.abs(z)<.38){knock(p,p.z*rotorDirection,-p.x*rotorDirection,5+late);p.cooldown=.6}}}
for(const t of tiles)if(t.warning>0){t.warning-=dt;if(t.warning<=0)t.active=false}else if(!t.active)t.mesh.position.y-=dt*4;
for(const w of walls){if(!w.alive){w.fall+=dt;w.m.position.y-=dt*(2+w.fall*5);w.m.rotation.z+=dt;w.m.visible=w.fall<3}else if(time>duration*.6&&Math.random()<dt*.12)w.alive=false}updateHazards(dt);weather*=Math.exp(-dt*.3);const alive=players.filter(p=>p.alive);
for(const p of players){p.cooldown-=dt;if(!p.alive){p.fall+=dt;p.g.position.y=-p.fall*p.fall*6;p.g.rotation.z+=dt*3;p.g.scale.setScalar(Math.max(.05,1-p.fall*.3));continue}p.think-=dt;p.stun=Math.max(0,p.stun-dt);p.jump=Math.max(0,p.jump-dt);p.down=Math.max(0,p.down-dt);p.attack=Math.max(0,p.attack-dt);
// Keep pursuing a real opponent; wandering and body collisions are not attacks.
if(!p.target?.alive||p.think<=0){p.think=.35+Math.random()*.25;const opponents=alive.filter(q=>q!==p&&q.alive);opponents.sort((a,b)=>combatDistance(p,a)-combatDistance(p,b));p.target=opponents[0]||null}
if(p.target){p.tx=p.target.x;p.tz=p.target.z}else{p.tx=0;p.tz=0}
if(map==='bridge'){p.tx=Math.max(-1.6,Math.min(1.6,p.tx));const safe=tiles.filter(t=>t.active&&!t.warning);if(safe.length)p.tz=safe.reduce((a,b)=>Math.abs(a.z-p.tz)<Math.abs(b.z-p.tz)?a:b).z}
if(map==='ice'){const near=hazards.find(h=>h.type==='hole'&&Math.hypot(p.x-h.x,p.z-h.z)<1.4);if(near){p.tx=p.x+(p.x-near.x)*3+.3;p.tz=p.z+(p.z-near.z)*3+.3}}
updateCombat(p,dt);

let goalX=p.tx,goalZ=p.tz;if(map==='bus'&&Math.sign(goalX)!==Math.sign(p.x)&&Math.abs(Math.abs(p.z)-3)>.35){goalX=Math.sign(p.x)*2.25;goalZ=p.z>=0?3:-3}if(map==='bus'&&Math.abs(p.x)<.65){goalZ=p.z>=0?3:-3}if(map==='factory'&&Math.hypot(p.x,p.z)<2.3){goalX=p.x*3;goalZ=p.z*3}if(map==='ice'&&Math.hypot(p.x,p.z)>radius-1.3){goalX=0;goalZ=0}const dx=goalX-p.x,dz=goalZ-p.z,d=Math.hypot(dx,dz)||1,acc=p.stun||p.swing?0:(map==='ice'?2.8:7)*Math.min(1,Math.max(0,d-.9)); p.vx+=dx/d*acc*dt;p.vz+=dz/d*acc*dt;if(map==='bridge')p.vx+=weather*dt;if(map==='factory'&&Math.abs(p.x)>2.2)p.vz+=(p.x<0?-1:1)*3.2*dt;if(late>1){const dist=Math.hypot(p.x,p.z)||1;p.vx+=p.x/dist*late*dt*2;p.vz+=p.z/dist*late*dt*2}
const damping=map==='ice'?.65:1.8;p.vx*=Math.exp(-dt*damping);p.vz*=Math.exp(-dt*damping);p.x+=p.vx*dt;p.z+=p.vz*dt;
if(map==='cliff'){const d=Math.hypot(p.x,p.z),a=(Math.atan2(p.x,p.z)+TAU)%TAU,w=walls[Math.round(a/TAU*44)%44];if(d>radius-.4&&w?.alive){p.x*= (radius-.45)/d;p.z*=(radius-.45)/d;const dot=(p.vx*p.x+p.vz*p.z)/(radius-.45);if(dot>0){p.vx-=p.x/(radius-.45)*dot*1.6;p.vz-=p.z/(radius-.45)*dot*1.6}}}if(!supported(p)){if(map==='bridge'&&Math.abs(p.x)<2.3&&p.jump===0&&p.cooldown<=0){const safe=tiles.filter(t=>t.active&&Math.abs(t.z-p.z)<1.25);if(safe.length){const landing=safe.reduce((a,b)=>Math.abs(a.z-p.z)<Math.abs(b.z-p.z)?a:b);p.vz=Math.sign(landing.z-p.z)*4.5;p.jump=.42;p.cooldown=.8}}if(!supported(p)&&!(map==='bridge'&&p.jump>.05)){// Resolve falls sequentially: the last supported survivor always wins, even in a simultaneous collision.
if(players.filter(q=>q.alive).length>1)eliminate(p);else{p.x=0;p.z=0;}}}
if(p.alive){p.g.position.set(p.x,Math.sin(time*9+p.i)*.025+p.jump,p.z);const angle=p.swing?p.swing.angle:p.target?Math.atan2(p.target.x-p.x,p.target.z-p.z):Math.atan2(p.vx,p.vz);p.g.rotation.y+=Math.atan2(Math.sin(angle-p.g.rotation.y),Math.cos(angle-p.g.rotation.y))*.12;p.body.rotation.z+=( (p.down>0?1.3:0)-p.body.rotation.z)*Math.min(1,dt*14);p.body.position.y=p.down>0?.3:Math.sin(time*12+p.i)*Math.min(.055,Math.hypot(p.vx,p.vz)*.015);const gait=Math.min(.55,Math.hypot(p.vx,p.vz)*.18);p.limbs.forEach((l,i)=>{l.rotation.x=Math.sin(time*12+p.i+(i<2?0:Math.PI))*gait;l.rotation.z=0;l.position.z=0});
// Both hands guard the face, then one shoulder drives a visible forward punch.
for(const index of [1,3]){p.limbs[index].rotation.x=p.down?-.2:-.7;p.limbs[index].rotation.z=index===1?-.2:.2}
if(p.swing){const t=p.swing.elapsed,extension=t<.18?-t/.18*.22:t<.34?Math.sin((t-.18)/.16*Math.PI):Math.max(0,1-(t-.34)/.26)*.25;const arm=p.limbs[p.hand?3:1];arm.rotation.x=-.7-extension*1.4;arm.position.z=extension*.48;p.body.rotation.y=(p.hand?1:-1)*extension*.25;p.body.rotation.x=extension*.12}else{p.body.rotation.x*=.8;p.body.rotation.y*=.8}
}}
for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){const a=players[i],b=players[j];if(!a.alive||!b.alive)continue;let dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz);if(d<.78){if(d<.001){dx=.01;dz=0;d=.01}const nx=dx/d,nz=dz/d,over=(.78-d)/2;a.x+=nx*over;a.z+=nz*over;b.x-=nx*over;b.z-=nz*over;// Separate touching bodies without awarding hits to either animal.
const closing=(a.vx-b.vx)*nx+(a.vz-b.vz)*nz;if(closing<0){a.vx-=nx*closing*.5;a.vz-=nz*closing*.5;b.vx+=nx*closing*.5;b.vz+=nz*closing*.5}}}

updateHUD();if(players.filter(p=>p.alive).length===1)finish();}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(0,11.8,16).multiplyScalar(Math.max(1,1.35/camera.aspect));camera.lookAt(0,-.05,0);camera.updateProjectionMatrix()}addEventListener('resize',resize);
function frame(now){const dt=Math.min(.04,(now-last)/1000||.016);last=now;if(!paused&&!document.hidden){if(state==='countdown'){const prev=Math.ceil(countdown);countdown-=dt;$('#countdown').textContent=countdown>0?Math.ceil(countdown):'';if(Math.ceil(countdown)!==prev)beep(500);if(countdown<=0){state='running';notice(maps[map].hint)}}else if(state==='running'){for(let k=0;k<2;k++){if(state==='running')simulate(dt/2)}}else if(state==='finished'){updateHazards(dt);for(const p of players){if(!p.alive&&p.fall<3){p.fall+=dt;p.g.position.y=-p.fall*p.fall*6;p.g.rotation.z+=dt*3}else if(p.alive){p.g.position.y=Math.abs(Math.sin(now*.005))*.18;p.limbs[1].rotation.z=-1.3;p.limbs[3].rotation.z=1.3}}}else players.forEach((p,i)=>p.body.position.y=Math.sin(now*.002+i)*.035)}if(now>noticeUntil)$('#notice').classList.remove('visible');renderer.render(scene,camera);requestAnimationFrame(frame)}
$('#start').onclick=()=>{start();resize()};$('#again').onclick=start;$('#restart').onclick=start;$('#settings').onclick=settings;$('#edit').onclick=settings;$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'계속하기':'일시정지';updateHUD()};$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'소리 켜짐':'소리 꺼짐';$('#sound').setAttribute('aria-pressed',String(sound));save()};$('#count').onchange=()=>{nameFields();save();spawn()};$('#duration').onchange=save;$('#map').onchange=()=>{save();build();spawn();updateCards()};$('#defaults').onclick=()=>{animals.forEach((a,i)=>names[i]=a[0]);nameFields();save()};for(const [key,icon,detail] of [['cliff','🌄','낙석 · 부서지는 울타리'],['windmill','🌿','회전 막대 · 방향 전환'],['ice','🧊','미끄러짐 · 녹는 얼음'],['bridge','🌉','돌풍 · 무너지는 널빤지'],['bus','🚌','버스 사이 이동 · 장애물'],['factory','🏭','용광로 · 프레스 · 분쇄기']]){const b=document.createElement('button'),symbol=document.createElement('span'),title=document.createElement('b'),small=document.createElement('small');symbol.textContent=icon;title.textContent=maps[key].name;small.textContent=detail;b.append(symbol,title,small);b.setAttribute('type','button');b.onclick=()=>{$('#map').value=key;$('#map').onchange()};mapCards.push([key,b]);$('#map-cards').append(b)}$('#volume').oninput=()=>{volume=+$('#volume').value/100;$('#volume-value').textContent=$('#volume').value+'%';save()};updateCards();nameFields();build();spawn();resize();requestAnimationFrame(frame);
