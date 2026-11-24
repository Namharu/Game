(() => {
'use strict';
const A=AvatarGarden;let config={settings:A.defaults,library:A.builtins};
try{const embedded=document.getElementById('overlayInit');if(embedded)config=JSON.parse(embedded.textContent);else{const raw=new URLSearchParams(location.hash.slice(1)).get('settings');if(raw)config.settings=JSON.parse(raw);}}catch{}
const garden=new A.Garden(document.getElementById('stage'),A.normalize(config.settings),config.library);
let liveRequested=false;
const tools=document.createElement('details');tools.className='overlay-tools';tools.innerHTML='<summary>팬더 채팅 연결</summary><p>실제 연결 시험 기능 · 방송도우미의 개인 채팅 위젯 주소를 입력하세요.</p><label>채팅 위젯 주소<input id="pandaSource" type="password" autocomplete="off" placeholder="https://p.pandahp.kr/chat/…"></label><button id="pandaConnect">실제 채팅 연결</button><button id="pandaDemo">샘플 모드</button><p id="pandaState" role="status">샘플 모드</p><p>연결 후 이 설정창을 접으세요. 연결 실패 시 가짜 채팅으로 대체하지 않습니다.</p>';
document.body.append(tools);const $=s=>tools.querySelector(s),badge=document.querySelector('.demo-banner');
const connection=new PandaChat.Connection({onStatus:info=>{$('#pandaState').textContent=info.text;badge.textContent=liveRequested?info.text:'가상 채팅 · 팬더 연결 없음';badge.hidden=liveRequested&&(info.state==='ready'||info.state==='live');tools.hidden=badge.hidden;},onChat:m=>{if(!/^!(공지|타이머|시간|방송시간)(?:\s|$)/.test(m.text))garden.say(m.name,m.text,'base',m.id);}});
const connect=source=>{liveRequested=true;garden.setLive(true);connection.connect(source);};
$('#pandaConnect').onclick=()=>connect($('#pandaSource').value.trim());$('#pandaDemo').onclick=()=>{liveRequested=false;garden.setLive(false);$('#pandaSource').value='';connection.disconnect();};
const source=new URLSearchParams(location.hash.slice(1)).get('source');if(source)connect(source);
addEventListener('pagehide',()=>{connection.disconnect(true);garden.destroy();});
})();
