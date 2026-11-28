(()=>{
 const studio=document.querySelector('.studio'),preview=document.querySelector('.editor');
 const settings=document.createElement('section');settings.className='editor settings-panel';settings.setAttribute('aria-label','채팅 설정');
 const tabs=document.createElement('nav');tabs.className='settings-tabs';tabs.setAttribute('aria-label','설정 종류');
 const style=document.createElement('div');style.className='settings-body';style.id='styleSettings';
 style.append(preview.querySelector(':scope > .adjustments'));
 const notice=preview.querySelector('.simple-notice');notice.classList.add('settings-body');notice.id='noticeSettings';notice.hidden=true;
 for(const [label,panel] of [['글꼴·크기',style],['공지·방송 연결',notice]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(panel===style));button.onclick=()=>{style.hidden=panel!==style;notice.hidden=panel!==notice;for(const b of tabs.children)b.setAttribute('aria-pressed',String(b===button));};tabs.append(button);}
 settings.append(tabs,style,notice);studio.insertBefore(settings,preview);preview.classList.add('live-preview');
 const heading=document.createElement('h2');heading.textContent='미리보기 · 직접 테스트';preview.prepend(heading);
 const help=document.createElement('details');help.className='notice-help';const summary=document.createElement('summary');summary.textContent='공지 명령어 사용 방법';help.append(summary);for(const p of [...notice.querySelectorAll(':scope > p')].slice(0,2))help.append(p);notice.querySelector('h3').after(help);
})();
