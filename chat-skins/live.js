(() => {
 'use strict';const q=new URLSearchParams(location.hash.slice(1)),config=ChatSkins.normalize(Object.fromEntries(q)),source=q.get('source'),demo=!source&&q.get('demo')==='1';
 document.querySelector('#skinStyle').textContent=ChatSkins.css({...config,notice:''});
 const chat=new CombinedChat({feed:document.querySelector('#liveFeed'),notice:document.querySelector('#liveNotice'),config}),status=document.querySelector('#liveStatus');
 const resize=new ResizeObserver(()=>chat.trim());resize.observe(document.querySelector('#liveFeed'));
 const connection=new PandaChat.Connection({onStatus:s=>{status.textContent=s.text;status.hidden=s.state==='ready'||s.state==='live';},onChat:m=>chat.receive(m)});
 const broadcast=new PandaBroadcast(data=>{chat.commands.obs=data;chat.renderNotice();});const tick=setInterval(()=>chat.renderNotice(),500);
 if(source){connection.connect(source);broadcast.start(source);}
 else if(demo){document.body.classList.add('demo');status.textContent='가상 수신 테스트';const form=document.querySelector('#demoForm');form.hidden=false;form.onsubmit=e=>{e.preventDefault();const result=chat.receive({name:'테스트 사용자',text:document.querySelector('#demoMessage').value,role:document.querySelector('#demoRole').value});document.querySelector('#demoResult').textContent=result.message||'일반 채팅을 표시했어요.';};chat.receive({name:'미리보기',text:'일반 채팅과 공지가 함께 나옵니다.',role:'viewer'});}
 else status.textContent='연결 주소가 없습니다. 채팅스킨 화면에서 OBS 적용 주소를 복사하세요.';
 addEventListener('hashchange',()=>location.reload());
 addEventListener('pagehide',()=>{clearInterval(tick);broadcast.stop();resize.disconnect();connection.disconnect(true);});
})();