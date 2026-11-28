/* Preferences only: never saves received chat messages or donation history. */
(() => {
 'use strict';const sourceKey='namharu-panda-widget-source-v1';
 const read=(key,fallback='')=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
 const write=(key,value)=>{try{localStorage.setItem(key,value);return true;}catch{return false;}};
 function bindSource(inputs){
  const elements=inputs.filter(Boolean);let lastSaved=read(sourceKey);
  const restore=()=>{const stored=read(sourceKey);if(stored)elements.forEach(el=>{if(!el.value)el.value=stored;});};
  elements.forEach(el=>{if(lastSaved)el.value=lastSaved;
   let label;if(typeof document!=='undefined'){label=document.createElement('small');label.setAttribute('role','status');label.style.cssText='display:block;margin:6px 0;color:inherit';el.after(label);label.textContent=lastSaved?'개인 채팅 주소를 불러왔습니다.':'';}
   const save=()=>{const value=el.value.trim();if(!write(sourceKey,value)){if(label)label.textContent='주소 저장 실패: 브라우저 저장 공간을 확인하세요.';el.setCustomValidity('브라우저 저장 공간을 사용할 수 없습니다.');return false;}lastSaved=value;el.setCustomValidity('');elements.forEach(other=>{if(other!==el)other.value=value;});if(label)label.textContent=value?'개인 채팅 주소 저장됨 · 새로고침 후에도 유지됩니다.':'저장된 주소를 지웠습니다.';return true;};
   el.addEventListener('input',save);el.addEventListener('change',save);el.addEventListener('blur',()=>{if(el.value.trim())save();});
   if(typeof document!=='undefined'){const button=document.createElement('button');button.type='button';button.textContent='채팅 주소 저장';button.addEventListener('click',save);label.after(button);}
  });
  addEventListener('pageshow',restore);
  // Capture autofilled/pasted values even when the browser omitted input/change.
  const flush=()=>{const el=elements.find(x=>x.value.trim()&&x.value.trim()!==lastSaved);if(el)el.dispatchEvent(new Event('change',{bubbles:true}));};
  addEventListener('pagehide',flush);if(typeof document!=='undefined')document.addEventListener('click',flush,true);
  addEventListener('storage',e=>{if(e.key===sourceKey){lastSaved=e.newValue||'';elements.forEach(el=>{if(document.activeElement!==el)el.value=lastSaved;});}});
 }
 function bindOption(id,key){const el=document.getElementById(id);if(!el)return;const stored=read(key);if(stored!==''){el.value=stored;el.dispatchEvent(new Event('change',{bubbles:true}));}const save=()=>write(key,el.value);el.addEventListener('input',save);el.addEventListener('change',save);}
 globalThis.SkinPreferences={read,write,bindSource,bindOption,sourceKey};
 if(typeof document==='undefined')return;
 bindSource(['combinedSource','widgetPandaUrl','pandaUrl','source'].map(id=>document.getElementById(id)));
 const page=location.pathname.split('/').filter(Boolean).slice(-2).join('/');
 if(document.getElementById('combinedSource'))bindOption('background','namharu-chat-preview-background');
 for(const id of ['widgetObsPort','widgetRole','nick','emotion'])bindOption(id,'namharu-skin-option:'+page+':'+id);
})();
