(() => {
 const controls=document.querySelector('.controls');if(!controls)return;
 const sections=[...controls.querySelectorAll(':scope > fieldset')];
 const tabs=document.createElement('nav');tabs.className='studio-tabs';tabs.setAttribute('aria-label','후원 시그 설정');
 const labels=['방송 연결','크기·정렬','전용 네임택'];
 const panels=sections.map((section,i)=>{const panel=document.createElement('section');panel.className='settings-tab';panel.id='settings-tab-'+i;section.before(panel);panel.append(section);return panel;});
 // Keep download/copy buttons and their explanations with the file settings.
 const last=panels.at(-1);while(last.nextElementSibling)last.append(last.nextElementSibling);
 const files=document.createElement('section');files.className='connection-files';const heading=document.createElement('h3');heading.textContent='OBS 파일 저장';files.append(heading,...last.childNodes);panels[0].append(files);last.remove();panels.pop();const help=document.createElement('p');help.className='connection-save-help';help.textContent='실시간 연결 방식은 위의 OBS 출력 주소를 한 번 등록하면 변경사항이 바로 반영됩니다. HTML 파일 방식을 선택한 경우에는 아래 기능으로 저장한 파일을 OBS의 로컬 파일로 지정하세요. 이후 파일 저장 완료 시 OBS 소스를 새로고침하세요. 두 방식 중 하나를 사용하면 됩니다.';files.insertBefore(help,heading.nextSibling);
 const preview=document.querySelector('.preview');document.body.classList.add('tabbed-control');preview.querySelector('h2').textContent='시그 배치 조작';const select=index=>{if(!preview.hidden&&preview.clientWidth)preview.style.setProperty('--editor-width',preview.clientWidth+'px');preview.hidden=index===0;if(index>0)panels[index].append(preview);else controls.append(preview);panels.forEach((panel,i)=>{panel.hidden=i!==index;tabs.children[i].setAttribute('aria-pressed',String(i===index));});};
 labels.forEach((label,i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-controls',panels[i].id);button.onclick=()=>{select(i);controls.scrollTop=0;};tabs.append(button);});
 controls.insertBefore(tabs,panels[0]);select(0);
})();
