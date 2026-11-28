/* Preferences only: never saves received chat messages or donation history. */
(() => {
 'use strict';const sourceKey='namharu-panda-widget-source-v1';
 const read=(key,fallback='')=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
 const write=(key,value)=>{try{localStorage.setItem(key,value);return true;}catch{return false;}};
 function bindSource(inputs){const elements=inputs.filter(Boolean),stored=read(sourceKey);elements.forEach(el=>{el.value=stored;const save=()=>{const value=el.value.trim();if(!write(sourceKey,value)){el.setCustomValidity('브라우저 저장 공간을 사용할 수 없습니다.');el.reportValidity();return;}el.setCustomValidity('');elements.forEach(other=>{if(other!==el)other.value=value;});};el.addEventListener('input',save);el.addEventListener('change',save);});addEventListener('storage',e=>{if(e.key===sourceKey)elements.forEach(el=>{if(document.activeElement!==el)el.value=e.newValue||'';});});}
 function bindOption(id,key){const el=document.getElementById(id);if(!el)return;const stored=read(key);if(stored!==''){el.value=stored;el.dispatchEvent(new Event('change',{bubbles:true}));}const save=()=>write(key,el.value);el.addEventListener('input',save);el.addEventListener('change',save);}
 globalThis.SkinPreferences={read,write,bindSource,bindOption,sourceKey};
 if(typeof document==='undefined')return;
 bindSource(['combinedSource','widgetPandaUrl','pandaUrl','source'].map(id=>document.getElementById(id)));
 const page=location.pathname.split('/').filter(Boolean).slice(-2).join('/');
 if(document.getElementById('combinedSource'))bindOption('background','namharu-chat-preview-background');
 for(const id of ['widgetObsPort','widgetRole','nick','emotion'])bindOption(id,'namharu-skin-option:'+page+':'+id);
})();
