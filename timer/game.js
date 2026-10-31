const $=s=>document.querySelector(s);let remaining=300000,total=300000,deadline=0,running=false,paused=false,finished=false;const key='namharu-timer-settings-v1';
function duration(){const m=Number($('#minutes').value),s=Number($('#seconds').value);if(!Number.isInteger(m)||m<0||m>999||!Number.isInteger(s)||s<0||s>59||m*60+s===0)throw Error('0분 1초부터 999분 59초까지 설정하세요.');return (m*60+s)*1000;}
function lock(value){document.querySelectorAll('#settings input').forEach(el=>el.disabled=value);}
function render(){const seconds=Math.ceil(Math.max(0,remaining)/1000),text=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');$('#display').textContent=text;document.title=(finished?'시간 종료':text)+' — 남하루 타이머';$('#progress').style.width=(total?Math.max(0,remaining/total)*100:0)+'%';document.body.classList.toggle('finished',finished);}
function save(){try{localStorage.setItem(key,JSON.stringify({minutes:$('#minutes').value,seconds:$('#seconds').value}));}catch{}}
function configure(){if(running||paused)return;try{remaining=total=duration();finished=false;$('#error').textContent='';$('#status').textContent='시간을 설정하세요';$('#start').textContent='시작';save();render();}catch(e){$('#error').textContent=e.message;}}
function tick(){if(!running)return;remaining=Math.max(0,deadline-Date.now());if(remaining===0){running=false;finished=true;paused=false;lock(false);$('#status').textContent='시간이 종료되었습니다';$('#start').textContent='다시 시작';}render();}
$('#start').onclick=()=>{if(running){tick();if(finished)return;running=false;paused=true;$('#status').textContent='일시정지';$('#start').textContent='계속';return;}if(!paused){try{remaining=total=duration();save();}catch(e){$('#error').textContent=e.message;return;}}finished=false;paused=false;running=true;deadline=Date.now()+remaining;lock(true);$('#error').textContent='';$('#status').textContent='카운트다운 중';$('#start').textContent='일시정지';render();};
$('#reset').onclick=()=>{running=paused=finished=false;lock(false);configure();};document.querySelectorAll('[data-adjust]').forEach(b=>b.onclick=()=>adjustTime(Number(b.dataset.adjust)));
function adjustTime(seconds){
 const now=Date.now(),active=running||paused;
 if(running)remaining=Math.max(0,deadline-now);
 const previousTotal=total;
 total=Math.max(1000,Math.min(59999000,(active?total:remaining)+seconds*1000));
 remaining=active?Math.max(0,remaining+total-previousTotal):total;
 const configuredSeconds=Math.round(total/1000);
 $('#minutes').value=Math.floor(configuredSeconds/60);$('#seconds').value=configuredSeconds%60;
 save();
 $('#error').textContent='';
 if(active){
  if(running)deadline=now+remaining;
  if(remaining===0){running=paused=false;finished=true;lock(false);$('#status').textContent='시간이 종료되었습니다';$('#start').textContent='다시 시작';}
 }else{
  const value=Math.ceil(remaining/1000);$('#minutes').value=Math.floor(value/60);$('#seconds').value=value%60;total=remaining;finished=false;$('#status').textContent='시간을 설정하세요';$('#start').textContent='시작';save();
 }
 render();
}
$('#minutes').oninput=$('#seconds').oninput=configure;try{const saved=JSON.parse(localStorage.getItem(key));if(saved){$('#minutes').value=saved.minutes;$('#seconds').value=saved.seconds;duration();}}catch{$('#minutes').value=5;$('#seconds').value=0;}configure();setInterval(tick,100);document.addEventListener('visibilitychange',tick);
