(()=>{
 const studio=document.querySelector('.studio'),preview=document.querySelector('.editor'),collection=document.querySelector('.collection');
 const controls=document.createElement('section');controls.className='editor tabbed-controls studio-controls';
 const tabs=document.createElement('nav');tabs.className='studio-tabs studio-nav';tabs.setAttribute('aria-label','채팅 스킨 작업 단계');
 const settings=document.createElement('section');settings.id='styleSettings';settings.className='tab-content';settings.hidden=true;
 const title=document.createElement('h2');title.textContent='글씨·채팅 설정';settings.append(title,preview.querySelector(':scope > .adjustments'));
 const notice=preview.querySelector('.simple-notice');const connection=document.createElement('section');connection.id='connectionSettings';connection.className='tab-content simple-notice';connection.hidden=true;
 const connectionTitle=document.createElement('h2');connectionTitle.textContent='OBS 연결·저장';connection.append(connectionTitle);
 const sourceLabel=notice.querySelector('label[for="combinedSource"]');for(let node=sourceLabel;node;){const next=node.nextSibling;connection.append(node);node=next;}
 const saved=document.createElement('p');saved.className='save-status';saved.setAttribute('role','status');saved.textContent='설정 자동 저장 켜짐 · 선택한 스킨, 글씨 크기, 공지 옵션과 개인 채팅 주소는 이 브라우저에 저장됩니다. OBS의 URL은 설정 변경 후 위 주소를 다시 복사해 적용하세요.';connection.append(saved);
 const legacy=document.querySelector('details.install'),demo=document.querySelector('.obs-demo');if(legacy)connection.append(legacy);if(demo)connection.append(demo);
 settings.append(notice);const help=document.createElement('details');help.className='notice-help';const summary=document.createElement('summary');summary.textContent='공지 명령어 사용 방법';help.append(summary);for(const p of [...notice.querySelectorAll(':scope > p')].slice(0,2))help.append(p);notice.querySelector('h3').after(help);
 for(const p of notice.querySelectorAll(':scope > p'))if(p.textContent.includes('아래에서 연결 주소'))p.textContent='공지 디자인과 위치를 고른 뒤 ③ OBS 연결·저장 탭에서 주소를 복사하세요. 이후 공지 내용은 방송 채팅 명령으로 바꿀 수 있습니다.';
 collection.classList.add('tab-content');const panels=[collection,settings,connection];
 for(const [index,label] of ['① 스킨 고르기','② 글씨·공지 설정','③ OBS 연결·저장'].entries()){const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(index===0));button.setAttribute('aria-controls',panels[index].id);button.onclick=()=>{studio.classList.toggle("gallery-mode",index===0);requestAnimationFrame(()=>dispatchEvent(new Event("resize")));panels.forEach((panel,i)=>panel.hidden=i!==index);for(const b of tabs.children)b.setAttribute('aria-pressed',String(b===button));};tabs.append(button);}
 controls.append(...panels);studio.prepend(controls);studio.before(tabs);studio.classList.add('studio-workspace','gallery-mode');document.body.classList.add('skin-studio');preview.classList.add('live-preview','studio-preview');const heading=document.createElement('h2');heading.textContent='채팅 미리보기 · 직접 테스트';preview.prepend(heading);

})();
