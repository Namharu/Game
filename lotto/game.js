import * as T from './vendor/three.module.js';
import {parseSettings,drawOrder} from './draw-rules.js';
const $=s=>document.querySelector(s);
try{
const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setSize(600,600);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x090c13);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;$('#view').append(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,100);camera.position.set(0,0,9.9);camera.lookAt(0,-.15,0);
const env=new T.Scene();env.background=new T.Color(0x343a48);for(const [x,y,z,w,h] of [[-4,3,2,3,6],[4,2,1,2,5],[0,6,-2,6,3],[0,1,6,2,4]]){const card=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0xffffff}));card.position.set(x,y,z);card.lookAt(0,0,0);env.add(card)}const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.08).texture;
scene.add(new T.HemisphereLight(0xd6e2ff,0x172037,2));for(const [x,y,z,c,p] of [[-4,5,5,0xe8efff,65],[4,2,4,0x9fbaff,42],[0,-1,-3,0x655cff,20]]){const l=new T.PointLight(c,p,30);l.position.set(x,y,z);scene.add(l)}
const metal=new T.MeshStandardMaterial({color:0x7c8598,metalness:.9,roughness:.2}),dark=new T.MeshStandardMaterial({color:0x171c28,metalness:.8,roughness:.28}),glass=new T.MeshPhysicalMaterial({color:0xe4edff,metalness:0,roughness:.07,transmission:.97,thickness:.06,ior:1.45,transparent:true,opacity:.23,depthWrite:false,side:T.DoubleSide});
function mesh(g,m,x=0,y=0,z=0,parent=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o}function ring(r,t,z,m){return mesh(new T.TorusGeometry(r,t,12,128),m,0,0,z)}
const R=2.22,br=.145,depth=.4;mesh(new T.BoxGeometry(4.6,.24,1.65),dark,0,-2.7,-.1);mesh(new T.BoxGeometry(3.8,.08,1.3),metal,0,-2.54,-.1);
for(const x of [-2.05,2.05]){mesh(new T.BoxGeometry(.3,4.85,.32),dark,x,-.15,-.72);mesh(new T.BoxGeometry(.07,4.65,.025),metal,x-.08,-.15,-.53)}
ring(R+.04,.025,.42,metal);ring(R-.11,.022,-.43,new T.MeshBasicMaterial({color:0xafbaff}));ring(R-.08,.06,-.44,new T.MeshBasicMaterial({color:0x5361ad,transparent:true,opacity:.27}));
const cover=mesh(new T.SphereGeometry(R,80,40),glass);cover.renderOrder=5;
// Air outlet sits below the transparent bowl.
mesh(new T.CylinderGeometry(.65,.82,.18,48),dark,0,-2.29,0);
for(let i=-2;i<=2;i++)mesh(new T.BoxGeometry(.055,.012,.7),metal,i*.19,-2.19,0);
// Soft reflection streaks on the acrylic face; no opaque cover over the balls.
for(const [a,len] of [[.18,.55],[2.15,.35],[4.05,.4]]){const arc=new T.Mesh(new T.TorusGeometry(R-.02,.016,8,50,len),new T.MeshBasicMaterial({color:0xe7f0ff,transparent:true,opacity:.55}));arc.rotation.z=a;arc.position.z=.54;scene.add(arc)}
const palette=['#f6d13b','#3e98e9','#ec4384','#47b66b','#f0f2ed'];
function texture(n,color){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,256,128);for(const px of [64,192]){x.fillStyle='#fff8ea';x.beginPath();x.arc(px,64,32,0,Math.PI*2);x.fill();x.fillStyle='#202c45';x.font='bold 39px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(n,px,66)}const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex}
const sphere=new T.SphereGeometry(br,24,16),balls=[];let airTime=0,airPower=1,mixing=true,mult=1,last=performance.now(),acc=0;
for(let i=0;i<45;i++){const m=mesh(sphere,new T.MeshPhysicalMaterial({map:texture(i+1,palette[i%5]),roughness:.19,metalness:.04,clearcoat:1,clearcoatRoughness:.1}));balls.push({m,x:0,y:0,z:0,vx:0,vy:0,vz:0});}
let timing={mix:2200,flight:700,gap:500};
let manual=false,requested=false,paused=false,drawClock=0;
let running=false,order=[],drawn=[],winning=new Set(),flight=null,nextDraw=0;
function lockSettings(locked){$('#drawMode').disabled=locked;$('#drawSpeed').disabled=locked;$('#drawCount').disabled=locked;$('#winningNumbers').disabled=locked;}
function reset(keepBalls=false){paused=false;requested=false;running=false;flight=null;drawn=[];order=[];lockSettings(false);$('#mix').disabled=false;$('#resultBalls').replaceChildren();$('#drawNumbers').replaceChildren();$('#matchPanel').dataset.status='waiting';$('#resultTitle').textContent='추첨 번호';$('#matchSummary').textContent='설정을 입력하고 추첨을 시작하세요.';$('#validation').textContent='';mixing=true;airPower=1;airTime=0;balls.forEach((b,i)=>{if(keepBalls===true)return;b.drawn=false;b.flying=false;b.m.visible=true;b.m.scale.setScalar(1);const row=Math.floor(i/9),col=i%9;b.x=(col-4)*.32;b.y=-1.58+row*.31;b.z=(i%3-1)*.19;b.vx=0;b.vy=0;b.vz=0;b.m.rotation.set(Math.random()*6,Math.random()*6,0)});$('#mix').textContent=$('#drawMode').value==='manual'?'공 하나 뽑기 ▶':'추첨 시작 ▶';$('#state').textContent='대기 중 · 공을 섞고 있습니다';syncButtons();}
function step(dt){
 const live=balls.filter(b=>!b.drawn&&!b.flying);
 airTime+=dt;airPower+=((mixing?mult:0)-airPower)*Math.min(1,dt*5);
 for(const b of live){
  b.vy-=9.8*dt;
  if(airPower>.001){
   // A broad bottom jet breaks into moving plumes and weakens near the top.
   const h=Math.max(0,Math.min(1,(b.y+2.1)/4.2));
   const jetX=.55*Math.sin(airTime*2.7),jetZ=.45*Math.cos(airTime*3.1);
   const plume=Math.exp(-((b.x-jetX)**2+(b.z-jetZ)**2)/1.5);
   const pulse=.85+.25*Math.sin(airTime*8+b.x*3-b.z*4);
   const lift=(18*(1-h)**2+36*plume*(1-h))*pulse;
   const flutterX=Math.sin(airTime*11+b.y*5+b.z*7);
   const flutterZ=Math.cos(airTime*9+b.x*6-b.y*4);
   b.vx+=airPower*((h>.55?4:-5)*b.x+8*flutterX)*dt;
   b.vz+=airPower*((h>.55?4:-5)*b.z+8*flutterZ)*dt;
   b.vy+=airPower*lift*dt;
  }
  const drag=Math.exp(-.3*dt);b.vx*=drag;b.vy*=drag;b.vz*=drag;
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
  const d=Math.hypot(b.x,b.y,b.z),max=R-br-.025;if(d>max){const nx=b.x/d,ny=b.y/d,nz=b.z/d;b.x=nx*max;b.y=ny*max;b.z=nz*max;const vn=b.vx*nx+b.vy*ny+b.vz*nz;if(vn>0){b.vx-=1.65*vn*nx;b.vy-=1.65*vn*ny;b.vz-=1.65*vn*nz}b.vx*=.97;b.vy*=.97;b.vz*=.97}const speed=Math.hypot(b.vx,b.vy);if(speed>12){b.vx*=12/speed;b.vy*=12/speed}
 }
 for(let pass=0;pass<2;pass++)for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],b=live[j],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,d=Math.hypot(dx,dy,dz);if(d>0&&d<br*2){const nx=dx/d,ny=dy/d,nz=dz/d,p=(br*2-d)*.5;a.x-=nx*p;a.y-=ny*p;a.z-=nz*p;b.x+=nx*p;b.y+=ny*p;b.z+=nz*p;const v=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny+(b.vz-a.vz)*nz;if(v<0){const k=-v*.88;a.vx-=k*nx;a.vy-=k*ny;a.vz-=k*nz;b.vx+=k*nx;b.vy+=k*ny;b.vz+=k*nz}}}
 // Constrain the drum again after pair separation.
 for(const b of live){const d=Math.hypot(b.x,b.y,b.z),limit=R-br-.025;if(d>limit){const nx=b.x/d,ny=b.y/d,nz=b.z/d;b.x=nx*limit;b.y=ny*limit;b.z=nz*limit;const v=b.vx*nx+b.vy*ny+b.vz*nz;if(v>0){b.vx-=1.65*v*nx;b.vy-=1.65*v*ny;b.vz-=1.65*v*nz;}}b.vz*=.9995;}
}
function loop(now){const delta=Math.min(.06,(now-last)/1000);if(!paused)drawClock+=delta*1000;acc+=delta*1.5;last=now;while(acc>=1/240){step(1/240);acc-=1/240}for(const b of balls){if(b.drawn||b.flying)continue;b.m.position.set(b.x,b.y,b.z);b.m.rotation.x+=b.vy*.003;b.m.rotation.z-=b.vx*.003}updateDraw(drawClock);renderer.render(scene,camera);requestAnimationFrame(loop)}
function showResults(done=false){
 const displayed=$('#sortNumbers').checked?[...drawn].sort((a,b)=>a-b):drawn;
 $('#resultBalls').replaceChildren(...displayed.map(n=>{const el=document.createElement('span');el.className='result-ball'+(winning.has(n)?' hit':'');el.style.setProperty('--ball-color',palette[(n-1)%palette.length]);el.textContent=n;el.title=winning.has(n)?n+'번 당첨':n+'번';return el;}));
 $('#drawNumbers').replaceChildren(...drawn.map(n=>{const el=document.createElement('span');el.textContent=n;el.className=winning.has(n)?'hit':'';return el;}));
 const hits=drawn.filter(n=>winning.has(n)).sort((a,b)=>a-b);
 $('#resultTitle').textContent=(done?'추첨 완료':'추첨 중')+' · '+drawn.length+' / '+order.length;
 $('#matchPanel').dataset.status=hits.length?'hit':done?'miss':'waiting';
 $('#matchSummary').textContent=hits.length?'당첨 '+hits.length+'개 · '+hits.join(', '):(done?'일치하는 당첨번호가 없습니다.':'당첨번호 확인 중…');
}
function updateDraw(now){
 if(!running||paused)return;
 if(flight){
  const t=Math.min(1,(now-flight.start)/timing.flight),u=1-(1-t)**3;
  flight.ball.m.position.set(flight.x*(1-u),flight.y*(1-u)+.7*u,flight.z*(1-u)+3*u);flight.ball.m.scale.setScalar(1+u*1.5);
  if(t===1){const ball=flight.ball;ball.drawn=true;ball.flying=false;ball.m.visible=false;ball.m.scale.setScalar(1);drawn.push(flight.number);flight=null;const done=drawn.length===order.length;showResults(done);nextDraw=now+timing.gap;if(manual&&!done){$('#mix').disabled=false;$('#mix').textContent='다음 공 뽑기 ▶';$('#state').textContent='버튼을 누르면 다음 공이 나옵니다';}if(done){running=false;mixing=true;$('#state').textContent='추첨 완료 · 공은 계속 섞입니다';$('#mix').textContent='다시 추첨 ▶';$('#mix').disabled=false;lockSettings(false);}syncButtons();}
 }else if(now>=nextDraw&&(!manual||requested)){requested=false;const number=order[drawn.length],ball=balls[number-1];ball.flying=true;flight={number,ball,start:now,x:ball.x,y:ball.y,z:ball.z};$('#state').textContent=(drawn.length+1)+'번째 공 추첨 중';}
}
function syncButtons(){
 const isManual=$('#drawMode').value==='manual';$('#stage').classList.toggle('manual-mode',isManual);
 $('#manualDraw').hidden=!isManual;$('#mix').hidden=isManual;
 $('#manualDraw').disabled=running&&(!!flight||requested);
 $('#manualDraw').textContent='번호추첨';
 $('#mix').disabled=false;$('#mix').textContent=running?(paused?'계속 추첨 ▶':'일시정지 ⏸'):drawn.length?'다시 추첨 ▶':'추첨 시작 ▶';
}
function setTiming(){
 const rate=Math.max(.5,Math.min(10,Number($('#drawSpeed').value)||1));
 const next={mix:2200/rate,flight:700/rate,gap:500/rate},ratio=next.flight/timing.flight;
 if(running){if(flight)flight.start=drawClock-(drawClock-flight.start)*ratio;nextDraw=drawClock+Math.max(0,nextDraw-drawClock)*ratio;}
 timing=next;
}
function triggerDraw(){
 if(running){
  if(manual){if(!flight&&!requested){requested=true;nextDraw=drawClock;}}
  else{paused=!paused;$('#drawSpeed').disabled=!paused;$('#state').textContent=paused?'일시정지 · 속도를 조절할 수 있습니다':'추첨을 계속합니다';}
  syncButtons();return;
 }
 let config;try{config=parseSettings($('#drawCount').value,$('#winningNumbers').value);}catch(e){$('#validation').textContent=e.message;return;}
 reset(drawn.length===0);setTiming();winning=config.winning;order=drawOrder(config.count);manual=$('#drawMode').value==='manual';requested=manual;running=true;mixing=true;nextDraw=drawClock+timing.mix;lockSettings(true);$('#state').textContent='공을 섞고 있습니다';showResults();syncButtons();
}
$('#mix').onclick=triggerDraw;$('#manualDraw').onclick=triggerDraw;
const settingsKey='namharu-lotto-air-settings-v1';
function saveSettings(){try{localStorage.setItem(settingsKey,JSON.stringify({count:$('#drawCount').value,winning:$('#winningNumbers').value,mode:$('#drawMode').value,speed:$('#drawSpeed').value,sort:$('#sortNumbers').checked}));}catch{}}
function loadSettings(){try{const v=JSON.parse(localStorage.getItem(settingsKey));if(!v||typeof v!=='object')return;
 const count=Number(v.count),speed=Number(v.speed);
 if(Number.isInteger(count)&&count>=1&&count<=45)$('#drawCount').value=count;
 if(typeof v.winning==='string')$('#winningNumbers').value=v.winning;
 if(['auto','manual'].includes(v.mode))$('#drawMode').value=v.mode;
 if(Number.isFinite(speed)&&speed>=.5&&speed<=10)$('#drawSpeed').value=speed;
 if(typeof v.sort==='boolean')$('#sortNumbers').checked=v.sort;
 $('#drawSpeedValue').textContent=Number($('#drawSpeed').value).toFixed(1)+'배';
}catch{}}
for(const id of ['drawCount','winningNumbers','drawMode','drawSpeed','sortNumbers'])$('#'+id).addEventListener('input',saveSettings);
loadSettings();setTiming();
$('#sortNumbers').onchange=()=>{if(order.length)showResults(drawn.length===order.length);};$('#drawMode').onchange=syncButtons;$('#drawSpeed').oninput=e=>{$('#drawSpeedValue').textContent=Number(e.target.value).toFixed(1)+'배';setTiming();};$('#reset').onclick=()=>reset();$('#mix').disabled=$('#reset').disabled=false;reset();requestAnimationFrame(loop);
}catch(e){$('#error').hidden=false;$('#error').textContent='3D 화면을 시작하지 못했습니다: '+e.message;$('#state').textContent='실행 오류';console.error(e)}

