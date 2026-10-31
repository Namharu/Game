const $=selector=>document.querySelector(selector);
const screens=['countScreen','configScreen','playScreen'].map(id=>$('#'+id));
const countValue=$('#countValue'),loadPanel=$('#loadPanel'),presetSelect=$('#presetSelect');
const nameInputs=$('#nameInputs'),resultInputs=$('#resultInputs'),straightLines=$('#straightLines');
const starters=$('#starters'),outcomes=$('#outcomes'),canvas=$('#ladderCanvas'),ctx=canvas.getContext('2d');
const playStatus=$('#playStatus'),seedLabel=$('#seedLabel'),allResults=$('#allResults'),resultList=$('#resultList');
const matchedPanel=document.createElement('section');matchedPanel.className='matched-panel';matchedPanel.innerHTML='<h2>매칭 결과</h2><p id="matchedHint">참가자나 결과를 선택하면 확인한 결과가 표시됩니다.</p><ol id="matchedList" aria-live="polite"></ol>';
const side=$('.square-controls')||$('.game > aside');side.replaceChildren(matchedPanel);
function renderMatches(){
 $('#matchedList').innerHTML=[...revealed].map(start=>'<li style="--route-color:'+colors[start%colors.length]+'"><b>'+escapeHtml(names[start])+'</b><span>→</span><strong>'+escapeHtml(results[mapping[start]])+'</strong></li>').join('');
 $('#matchedHint').hidden=revealed.size>0;
}

const presetName=$('#presetName'),saveMessage=$('#saveMessage'),loadMessage=$('#loadMessage');
let popupTimer;
function hideMatchPopup(){clearTimeout(popupTimer);$('#matchPopup').hidden=true;}
function showMatchPopup(start){hideMatchPopup();$('#matchPopupText').textContent=names[start]+' - '+results[mapping[start]];$('#matchPopup').hidden=false;popupTimer=setTimeout(hideMatchPopup,3000);}
$('.stage').addEventListener('click',event=>{if(!$('#matchPopup').hidden){hideMatchPopup();event.preventDefault();event.stopPropagation();}},true);
const STORAGE_KEY='namharu-ladder-presets-v1';
const colors=['#ff3f55','#13bdb6','#835cff','#ff8a2a','#1688e3','#e741aa','#3ca75b','#c29700','#7349c5','#e25834','#2f9ec8','#cb4d76'];
let count=4,names=[],results=[],ladder=[],mapping=[],seed=0,activeStart=-1,activeEnd=-1,animating=false;
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const values=container=>[...container.querySelectorAll('input')].map(input=>input.value.trim());
let revealed = new Set(), currentProgress = 0, animationEpoch = 0;
const showScreen=id=>{if(id!=='playScreen'){hideMatchPopup();animationEpoch++;animating=false;currentProgress=0;revealed.clear();renderMatches();}screens.forEach(screen=>screen.hidden=screen.id!==id)};

function setCount(next){count=Math.max(2,Math.min(12,next));countValue.textContent=count}
function buildConfig(initialNames=[],initialResults=[]){
  names=Array.from({length:count},(_,index)=>initialNames[index]||`참가자 ${index+1}`);results=Array.from({length:count},(_,index)=>initialResults[index]||`결과 ${index+1}`);
  const columns=`repeat(${count},minmax(0,1fr))`;[nameInputs,resultInputs,straightLines].forEach(element=>element.style.gridTemplateColumns=columns);
  nameInputs.innerHTML=names.map((name,index)=>`<input maxlength="18" value="${escapeHtml(name)}" aria-label="${index+1}번 이름">`).join('');
  resultInputs.innerHTML=results.map((result,index)=>`<input maxlength="18" value="${escapeHtml(result)}" aria-label="${index+1}번 결과">`).join('');
  straightLines.innerHTML=Array.from({length:count},()=>'<span></span>').join('');$('#configCount').textContent=`${count} PLAYERS`;showScreen('configScreen');
}
function captureConfig(){names=values(nameInputs).map((value,index)=>value||`참가자 ${index+1}`);results=values(resultInputs).map((value,index)=>value||`결과 ${index+1}`)}
function createLadder(){
 hideMatchPopup();
  animationEpoch++;animating=false;revealed.clear();currentProgress=0;
  
  const rows=Math.max(8,count*3);ladder=Array.from({length:rows},()=>[]);
  for(let row=0;row<rows;row++)for(let col=0;col<count-1;col++){if(ladder[row].includes(col-1)||Math.random()>.34)continue;ladder[row].push(col)}
  for(let col=0;col<count-1;col++)if(!ladder.some(row=>row.includes(col)))ladder[Math.floor(Math.random()*rows)].push(col);
  mapping=Array.from({length:count},(_,start)=>trace(start).end);seed+=1;activeStart=-1;activeEnd=-1;seedLabel.textContent=`LADDER ${String(seed).padStart(2,'0')}`;playStatus.textContent='이름이나 결과를 선택하세요';renderPlayLabels();requestAnimationFrame(resizeCanvas);
}
function boardMetrics(){const width=parseFloat(canvas.style.width)||canvas.parentElement.clientWidth,height=500;return{width,height,left:38,right:width-38,top:18,bottom:height-18}}
function trace(start){
  const m=boardMetrics(),xAt=col=>m.left+(m.right-m.left)*col/(count-1),yAt=row=>m.top+(m.bottom-m.top)*(row+1)/(ladder.length+1);let col=start,points=[{x:xAt(col),y:m.top}];
  ladder.forEach((rungs,row)=>{const y=yAt(row);points.push({x:xAt(col),y});if(rungs.includes(col)){col++;points.push({x:xAt(col),y})}else if(rungs.includes(col-1)){col--;points.push({x:xAt(col),y})}});points.push({x:xAt(col),y:m.bottom});return{end:col,points};
}
function resizeCanvas(){if($('#playScreen').hidden)return;const width=Math.max(664,canvas.parentElement.clientWidth-16),height=500,dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
function draw(){
  const m=boardMetrics();ctx.clearRect(0,0,m.width,m.height);
  const paper=ctx.createLinearGradient(0,0,0,m.height);paper.addColorStop(0,'#f7faf4');paper.addColorStop(1,'#dfe9e1');ctx.fillStyle=paper;ctx.fillRect(0,0,m.width,m.height);
  // Only completed routes and the currently traversed portion are visible.
  for(const start of revealed) paintRoute(trace(start).points,1,start);
  if(animating && activeStart>=0) paintRoute(trace(activeStart).points,currentProgress,activeStart);
}
function paintRoute(path,progress,start){
  if(progress<=0)return;
  const lengths=[],total=path.slice(1).reduce((sum,point,index)=>{const previous=path[index],length=Math.hypot(point.x-previous.x,point.y-previous.y);lengths.push(length);return sum+length},0);
  let remaining=total*Math.min(1,progress),current=path[0];ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=colors[start%colors.length];ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(current.x,current.y);
  for(let index=1;index<path.length&&remaining>0;index++){const next=path[index],segment=lengths[index-1];if(remaining>=segment){ctx.lineTo(next.x,next.y);remaining-=segment;current=next}else{const ratio=remaining/segment;ctx.lineTo(current.x+(next.x-current.x)*ratio,current.y+(next.y-current.y)*ratio);remaining=0}}ctx.stroke();
}
function renderPlayLabels(){
 renderMatches();
  const columns=`repeat(${count},minmax(0,1fr))`;starters.style.gridTemplateColumns=columns;outcomes.style.gridTemplateColumns=columns;starters.innerHTML=names.map((name,index)=>`<button type="button" data-start="${index}">${escapeHtml(name)}</button>`).join('');outcomes.innerHTML=results.map((result,index)=>`<button type="button" data-end="${index}">${escapeHtml(result)}</button>`).join('');starters.querySelectorAll('button').forEach(button=>button.onclick=()=>run(Number(button.dataset.start)));outcomes.querySelectorAll('button').forEach(button=>button.onclick=()=>run(mapping.indexOf(Number(button.dataset.end))));for(const start of revealed){starters.children[start]?.classList.add('revealed');outcomes.children[mapping[start]]?.classList.add('revealed');}if(activeStart>=0)starters.children[activeStart]?.classList.add('active');if(activeEnd>=0)outcomes.children[activeEnd]?.classList.add('active');
}
async function run(start){
  if(animating||start<0)return;
  activeStart=start;activeEnd=-1;currentProgress=0;
  if(revealed.has(start)){activeEnd=mapping[start];renderPlayLabels();draw();playStatus.textContent=names[start]+' → '+results[activeEnd];showMatchPopup(start);return;}
  animating=true;const epoch=++animationEpoch;renderPlayLabels();const duration=1500,startTime=performance.now();playStatus.textContent=names[start]+' 경로 확인 중';
  await new Promise(resolve=>{const frame=now=>{if(epoch!==animationEpoch){resolve();return;}currentProgress=Math.min(1,(now-startTime)/duration);draw();if(currentProgress<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  if(epoch!==animationEpoch)return;
  activeEnd=mapping[start];revealed.add(start);animating=false;currentProgress=0;renderPlayLabels();draw();playStatus.textContent=names[start]+' → '+results[activeEnd];showMatchPopup(start);
}
function startGame(){captureConfig();createLadder();showScreen('playScreen');allResults.hidden=true;requestAnimationFrame(resizeCanvas)}
function showAll(){animationEpoch++;animating=false;currentProgress=0;revealed=new Set(names.map((_,i)=>i));draw();renderPlayLabels();resultList.innerHTML=mapping.map((end,start)=>`<li><b>${escapeHtml(names[start])}</b> → ${escapeHtml(results[end])}</li>`).join('');allResults.hidden=true}
function readPresets(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return{}}}function writePresets(presets){localStorage.setItem(STORAGE_KEY,JSON.stringify(presets))}
function refreshPresets(selected=''){const presets=readPresets();presetSelect.innerHTML='<option value="">설정을 선택하세요</option>'+Object.keys(presets).map(name=>`<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');presetSelect.value=selected}
function savePreset(){captureConfig();const key=presetName.value.trim()||'기본 설정',presets=readPresets();presets[key]={count,names,results};writePresets(presets);refreshPresets(key);saveMessage.textContent=`‘${key}’ 저장 완료`;setTimeout(()=>saveMessage.textContent='',1800)}
function loadSelected(){const key=presetSelect.value,data=readPresets()[key];if(!key||!data){loadMessage.textContent='불러올 설정을 선택하세요.';return}setCount(data.count);presetName.value=key;buildConfig(data.names,data.results);loadPanel.hidden=true}
function deleteSelected(){const key=presetSelect.value;if(!key){loadMessage.textContent='삭제할 설정을 선택하세요.';return}const presets=readPresets();delete presets[key];writePresets(presets);refreshPresets();loadMessage.textContent=`‘${key}’ 삭제 완료`}
$('#minusCount').onclick=()=>setCount(count-1);$('#plusCount').onclick=()=>setCount(count+1);$('#goConfig').onclick=()=>buildConfig();$('#openLoad').onclick=()=>{refreshPresets();loadPanel.hidden=!loadPanel.hidden};$('#backToCount').onclick=()=>{captureConfig();showScreen('countScreen')};$('#startLadder').onclick=startGame;$('#editSettings').onclick=()=>{allResults.hidden=true;buildConfig(names,results)};$('#newLadder').onclick=()=>{createLadder();allResults.hidden=true};$('#showAll').onclick=showAll;$('#closeResults').onclick=()=>allResults.hidden=true;$('#savePreset').onclick=savePreset;$('#loadPreset').onclick=loadSelected;$('#deletePreset').onclick=deleteSelected;addEventListener('resize',resizeCanvas);setCount(4);refreshPresets();showScreen('countScreen');
$('#newLadder').onclick=()=>{allResults.hidden=true;buildConfig(names,results)};
$('#editSettings').onclick=()=>{allResults.hidden=true;loadPanel.hidden=true;showScreen('countScreen')};

