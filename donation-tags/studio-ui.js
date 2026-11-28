(() => {
 const controls=document.querySelector('.controls');if(!controls)return;
 const sections=[...controls.querySelectorAll(':scope > fieldset')];
 const tabs=document.createElement('nav');tabs.className='studio-tabs';tabs.setAttribute('aria-label','후원 시그 설정');
 const labels=['방송 연결','크기·정렬','전용 네임택','OBS 저장'];
 const panels=sections.map((section,i)=>{const panel=document.createElement('section');panel.className='settings-tab';panel.id='settings-tab-'+i;section.before(panel);panel.append(section);return panel;});
 // Keep download/copy buttons and their explanations with the file settings.
 const last=panels.at(-1);while(last.nextElementSibling)last.append(last.nextElementSibling);
 const select=index=>panels.forEach((panel,i)=>{panel.hidden=i!==index;tabs.children[i].setAttribute('aria-pressed',String(i===index));});
 labels.forEach((label,i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-controls',panels[i].id);button.onclick=()=>{select(i);controls.scrollTop=0;};tabs.append(button);});
 controls.insertBefore(tabs,panels[0]);select(1);
})();
