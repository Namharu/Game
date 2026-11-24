(() => {
  'use strict';
  const A=AvatarGarden;let config={settings:A.defaults,library:A.builtins};
  try{const embedded=document.getElementById('overlayInit');if(embedded)config=JSON.parse(embedded.textContent);else{const raw=new URLSearchParams(location.hash.slice(1)).get('settings');if(raw)config.settings=JSON.parse(raw);}}catch{}
  const garden=new A.Garden(document.getElementById('stage'),A.normalize(config.settings),config.library);
  const tools=document.createElement('details');tools.className='overlay-tools';tools.innerHTML='<summary>미리보기 테스트 도구</summary><p>팬더 채팅 연결 없음 · 아래 명령은 이 화면에서만 실행됩니다.</p><form><label>테스트 역할<select id="testRole"><option value="viewer">시청자</option><option value="broadcaster">방송자</option><option value="manager">매니저</option></select></label><div class="form-row"><input id="testMessage" maxlength="200" placeholder="!공지 안녕하세요" required aria-label="테스트 채팅"><button>전송</button></div></form><p id="testFeedback" role="status"></p><label>OBS 포트<input id="port" type="number" min="1" max="65535" value="4455"></label><label>OBS 비밀번호<input id="password" type="password" autocomplete="off"></label><button id="connect" type="button">OBS 연결</button> <button id="disconnect" type="button">해제</button><p id="connection" role="status">OBS 연결 안 됨</p>';
  document.body.append(tools);const $=s=>tools.querySelector(s);
  const obs=new A.ObsConnection(s=>$('#connection').textContent=s,d=>garden.commands.obs=d);
  tools.querySelector('form').onsubmit=e=>{e.preventDefault();const text=$('#testMessage').value.trim();const result=garden.commands.run(text,$('#testRole').value);if(!result.handled)garden.say('테스트',text);$('#testFeedback').textContent=result.message||'가상 채팅 표시';$('#testMessage').value='';};
  $('#connect').onclick=()=>{const password=$('#password').value;$('#password').value='';obs.connect($('#port').value,password);};$('#disconnect').onclick=()=>obs.disconnect();
  addEventListener('pagehide',()=>{obs.disconnect(true);garden.destroy();});
})();
