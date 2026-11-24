/* Original NAMHARU avatar preview. No Panda chat transport is enabled here. */
(() => {
  'use strict';
  const builtins = [
    {id:'cat',name:'치즈 고양이',images:{base:'assets/cat.png'}},
    {id:'rabbit',name:'리본 토끼',images:{base:'assets/rabbit.png'}},
    {id:'dog',name:'골든 강아지',images:{base:'assets/dog.png'}},
    {id:'slime',name:'복숭아 슬라임',images:{base:'assets/slime.png'}}
  ];
  const skins = [
    {id:'round',name:'포근한 기본',colors:['#ffffff','#695674','#44364d','#88659d','#ffffff']},
    {id:'cloud',name:'라벤더 구름',colors:['#f8f3ff','#b19ace','#66507d','#9c7fbb','#ffffff']},
    {id:'comic',name:'톡! 코믹',colors:['#ffffff','#39303e','#342a3a','#eb86ac','#ffffff']},
    {id:'game',name:'별빛 퀘스트',colors:['#292b43','#d9bd79','#fff0c7','#68567e','#fff4d9']},
    {id:'note',name:'작은 메모',colors:['#fff4b9','#d3b77f','#6a5539','#c19a69','#ffffff']},
    {id:'neon',name:'민트 네온',colors:['#202f3b','#73e4d2','#e1fff9','#478e8b','#ffffff']}
  ];
  const colorKeys=['bubbleBg','bubbleBorder','bubbleText','nameBg','nameText'];
  const defaults={selected:['cat','rabbit','dog','slime'],enabled:true,size:112,speed:35,count:6,background:'garden',skin:'round',font:'jua',fontSize:18,duration:6,showNames:true,...Object.fromEntries(colorKeys.map((k,i)=>[k,skins[0].colors[i]]))};
  const bounded=(x,min,max,fallback)=>Number.isFinite(Number(x))?Math.min(max,Math.max(min,Number(x))):fallback;
  function normalize(s={}){
    if(!s||typeof s!=='object')s={};
    const v={...defaults};
    for(const k of colorKeys)if(/^#[0-9a-f]{6}$/i.test(s[k]||''))v[k]=s[k];
    for(const [k,min,max] of [['size',64,160],['speed',0,100],['count',1,12],['fontSize',14,26],['duration',2,15]])v[k]=bounded(s[k],min,max,defaults[k]);
    v.count=Math.round(v.count);
    for(const k of ['enabled','showNames'])if(typeof s[k]==='boolean')v[k]=s[k];
    if(Array.isArray(s.selected))v.selected=[...new Set(s.selected.filter(x=>typeof x==='string'))].slice(0,30);
    if(skins.some(x=>x.id===s.skin))v.skin=s.skin;
    if(['jua','gowun','system'].includes(s.font))v.font=s.font;
    if(['garden','night','checker'].includes(s.background))v.background=s.background;
    return v;
  }
  const formatDuration=ms=>{const s=Math.max(0,Math.floor(ms/1000));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(n=>String(n).padStart(2,'0')).join(':');};
  class Commands{
    constructor(){this.notice='';this.clock=false;this.timerEnd=null;this.streamVisible=false;this.obs=null;}
    // role is supplied by the local test UI. A future live adapter must use authenticated server roles, never nickname text.
    run(text,role,now=Date.now()){
      const m=String(text).trim().match(/^!(공지|타이머|시간|방송시간)(?:\s+(.*))?$/s);
      if(!m)return {handled:false};
      if(!['broadcaster','manager'].includes(role))return {handled:true,ok:false,message:'방송자·매니저만 사용할 수 있는 명령입니다. 변경하지 않았어요.'};
      const cmd=m[1],arg=(m[2]||'').trim(),off=['끄기','중지','삭제'].includes(arg);
      if(cmd==='공지'){
        if(!arg)return {handled:true,ok:false,message:'사용법: !공지 내용 / !공지 끄기'};
        this.notice=off?'':arg.slice(0,200);
      }else if(cmd==='타이머'){
        if(off)this.timerEnd=null;
        else{
          let seconds=0;
          if(/^\d{1,5}$/.test(arg))seconds=Number(arg);
          else if(/^\d{1,4}:[0-5]\d$/.test(arg)){const [m,s]=arg.split(':').map(Number);seconds=m*60+s;}
          if(!(seconds>0&&seconds<=86400))return {handled:true,ok:false,message:'사용법: !타이머 5:00 또는 !타이머 300 (1초~24시간)'};
          this.timerEnd=now+seconds*1000;
        }
      }else{
        if(arg&&!off&&!['켜기','시작'].includes(arg))return {handled:true,ok:false,message:`사용법: !${cmd} / !${cmd} 끄기`};
        if(cmd==='시간')this.clock=!off;else this.streamVisible=!off;
      }
      return {handled:true,ok:true,message:cmd==='방송시간'&&!off&&!this.obs?'방송시간 표시를 켰어요. OBS를 연결해야 실제 경과 시간이 나옵니다.':`${cmd} ${off?'표시를 껐어요.':'명령을 적용했어요.'}`};
    }
    snapshot(now=Date.now()){
      const r=[];
      if(this.notice)r.push({kind:'notice-item',text:'공지 · '+this.notice});
      if(this.clock)r.push({kind:'clock',text:'현재 시각 · '+new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now)});
      if(this.timerEnd!==null){const left=Math.max(0,this.timerEnd-now);r.push({kind:left?'timer':'timer-done',text:left?'남은 시간 · '+formatDuration(Math.ceil(left/1000)*1000):'타이머 종료!'});}
      if(this.streamVisible){const o=this.obs;let text='OBS 연결 필요';if(o&&now-o.at<8000)text=o.active?(o.reconnecting?'재연결 중 · ':'방송 중 · ')+formatDuration(o.duration+Math.max(0,now-o.at)):'방송 대기 중';else if(o)text='OBS 연결 확인 중';r.push({kind:'stream',text});}
      return r;
    }
  }
  class ObsConnection{
    constructor(onStatus,onData){this.onStatus=onStatus;this.onData=onData;this.socket=null;this.interval=null;this.deadline=null;this.sequence=0;this.lastReply=0;}
    disconnect(silent=false){clearInterval(this.interval);clearTimeout(this.deadline);if(this.socket){this.socket.onclose=null;this.socket.close();this.socket=null;}this.onData(null);if(!silent)this.onStatus('OBS 연결 해제');}
    async connect(port,password){
      this.disconnect(true);if(!/^\d+$/.test(String(port))||Number(port)<1||Number(port)>65535){this.onStatus('올바른 포트 번호를 입력하세요.');return;}
      let ws;try{ws=new WebSocket(`ws://127.0.0.1:${port}`);}catch{this.onStatus('브라우저가 로컬 연결을 차단했습니다. OBS 로컬 HTML에서 연결해 보세요.');return;}
      this.socket=ws;this.onStatus('OBS 연결 중…');this.deadline=setTimeout(()=>{if(this.socket===ws){this.disconnect(true);this.onStatus('연결 시간 초과 · OBS 서버 설정과 비밀번호를 확인하세요.');}},10000);
      const send=(op,d)=>{if(ws.readyState===1)ws.send(JSON.stringify({op,d}));};
      ws.onmessage=async event=>{
        try{const m=JSON.parse(event.data);if(this.socket!==ws)return;
          if(m.op===0){let authentication;
            if(m.d.authentication){if(!globalThis.crypto?.subtle)throw Error('이 환경에서 보안 인증을 사용할 수 없습니다.');const a=m.d.authentication;
              const hash=async s=>btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))));
              authentication=await hash(await hash(password+a.salt)+a.challenge);
            }
            password='';if(this.socket!==ws)return;send(1,{rpcVersion:1,eventSubscriptions:0,...(authentication?{authentication}:{})});
          }else if(m.op===2){clearTimeout(this.deadline);this.lastReply=Date.now();this.onStatus('OBS 연결됨 · 송출 상태와 경과 시간을 읽고 있어요.');
            const poll=()=>{if(Date.now()-this.lastReply>8000){this.disconnect(true);this.onStatus('OBS 응답이 끊겼습니다. 다시 연결하세요.');return;}send(6,{requestType:'GetStreamStatus',requestId:'stream-'+ ++this.sequence});};poll();this.interval=setInterval(poll,2000);
          }else if(m.op===7&&m.d.requestType==='GetStreamStatus'){
            if(!m.d.requestStatus?.result)throw Error('OBS 송출 상태를 읽지 못했습니다.');
            const d=m.d.responseData;this.lastReply=Date.now();this.onData({active:!!d.outputActive,reconnecting:!!d.outputReconnecting,duration:Math.max(0,Number(d.outputDuration)||0),at:this.lastReply});
          }
        }catch{this.disconnect(true);this.onStatus('OBS 연결 실패 · 서버 설정과 인증 비밀번호를 확인하세요.');}
      };
      ws.onerror=()=>{if(this.socket===ws)this.onStatus('OBS 연결 실패 · 서버 실행, 포트, 브라우저 로컬 연결 허용을 확인하세요.');};
      ws.onclose=()=>{if(this.socket===ws){this.disconnect(true);this.onStatus('OBS 연결 종료 · 인증과 서버 설정을 확인한 뒤 다시 연결하세요.');}};
    }
  }
  class Garden{
    constructor(stage,settings,library){this.stage=stage;this.layer=stage.querySelector('.actors');this.hud=stage.querySelector('.hud');this.commands=new Commands();this.members=[];this.library=library;this.paused=false;this.last=0;this.nextSample=performance.now()+3000;this.tick=0;this.configure(settings,true);this.frame=requestAnimationFrame(t=>this.animate(t));}
    configure(s,rebuild=false){this.settings=normalize(s);const v=this.settings;
      ['bubbleBg','bubbleBorder','bubbleText','nameBg','nameText'].forEach((k,i)=>this.stage.style.setProperty(['--bubble-bg','--bubble-border','--bubble-text','--name-bg','--name-text'][i],v[k]));
      this.stage.style.setProperty('--avatar-size',v.size+'px');this.stage.style.setProperty('--chat-size',v.fontSize+'px');this.stage.style.setProperty('--chat-font',v.font==='jua'?'AvatarJua':v.font==='gowun'?'AvatarGowun':'system-ui');
      if(this.stage.dataset.background)this.stage.dataset.background=v.background;
      this.layer.hidden=!v.enabled;
      if(rebuild)this.reset();
      for(const m of this.members){m.speech.dataset.skin=v.skin;m.name.hidden=!v.showNames;m.nick.hidden=!v.showNames;}
    }
    choices(){return this.library.filter(x=>this.settings.selected.includes(x.id));}
    reset(){this.layer.replaceChildren();this.members=[];const choices=this.choices();if(!choices.length)return;const names=['하루별','구름이','달빛토끼','별사탕','복숭아','몽실이','초코','새싹','바다','햇살','노을','솜솜'];for(let i=0;i<this.settings.count;i++)this.addMember(names[i],choices[i%choices.length],i);this.sample();}
    addMember(name,avatar,index=this.members.length){
      const el=document.createElement('div');el.className='actor';const body=document.createElement('div');body.className='avatar-body';const img=new Image();img.alt='';img.src=avatar.images.base;body.append(img);
      const nick=document.createElement('div');nick.className='actor-name';nick.textContent=name;nick.hidden=!this.settings.showNames;
      const speech=document.createElement('div');speech.className='speech';speech.dataset.skin=this.settings.skin;speech.hidden=true;const tag=document.createElement('b');tag.textContent=name;tag.hidden=!this.settings.showNames;const text=document.createElement('span');speech.append(tag,text);el.append(body,nick,speech);this.layer.append(el);
      const m={el,body,img,nick,speech,name:tag,text,user:name,avatar,x:Math.max(0,(this.stage.clientWidth-this.settings.size)*(index+.5)/this.settings.count),dir:index%2?-1:1,phase:index*1.7,until:0,jump:0,emotion:'base',changeAt:performance.now()+2000+Math.random()*4000};this.members.push(m);return m;
    }
    say(name,text,emotion='base'){
      const choices=this.choices();if(!choices.length)return;
      let m=this.members.find(x=>x.user===name);if(!m){if(this.members.length>=12){const old=this.members.shift();old.el.remove();}m=this.addMember(name,choices[Math.floor(Math.random()*choices.length)]);}
      m.text.textContent=String(text).slice(0,200);m.text.title=m.text.textContent;m.speech.hidden=false;m.until=Date.now()+this.settings.duration*1000;m.emotion=emotion;m.img.src=m.avatar.images[emotion]||m.avatar.images.base;m.jump=emotion==='happy'?performance.now():0;
      // Bound both the speech box and its tail after layout, including at narrow viewport edges.
      this.positionBubble(m);
    }
    positionBubble(m){const w=this.stage.clientWidth;m.speech.style.maxWidth=Math.min(230,Math.max(90,w-24))+'px';const bw=m.speech.offsetWidth;const center=m.x+this.settings.size/2;const offset=Math.max(12,Math.min(w-bw-12,center-bw/2))-m.x;m.speech.style.left=offset+'px';m.speech.style.transform='none';m.speech.style.setProperty('--tail',Math.max(14,Math.min(bw-14,center-(offset+m.x)))+'px');}
    sample(){if(!this.members.length)return;const messages=['오늘도 반가워요 ♡','우리 같이 놀아요!','ㅋㅋㅋㅋ 너무 귀여워','좋은 하루 보내세요 ✦','폴짝!'];const m=this.members[this.tick++%this.members.length];this.say(m.user,messages[this.tick%messages.length],this.tick%3===0?'happy':'base');}
    jump(){for(const m of this.members)m.jump=performance.now();}
    animate(t){const dt=Math.min(.05,(t-(this.last||t))/1000);this.last=t;const w=this.stage.clientWidth,v=this.settings,reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      for(const m of this.members){const speaking=Date.now()<m.until;if(!speaking&&!m.speech.hidden){m.speech.hidden=true;m.emotion='base';m.img.src=m.avatar.images.base;}
        const moving=!this.paused&&!reduced&&v.enabled&&!speaking&&v.speed>0;
        m.el.style.zIndex=speaking?'3':'1';
        if(!speaking){const src=(!moving&&m.avatar.images.idle)||m.avatar.images.base;if(m.img.getAttribute('src')!==src)m.img.src=src;}
        if(moving){m.x+=m.dir*v.speed*dt*.65;if(t>m.changeAt){m.dir=Math.random()>.5?1:-1;m.changeAt=t+3000+Math.random()*5000;}}
        const max=Math.max(0,w-v.size);if(m.x<0){m.x=0;m.dir=1;}if(m.x>max){m.x=max;m.dir=-1;}
        const j=!this.paused&&!reduced&&m.jump&&t-m.jump<700?Math.sin((t-m.jump)/700*Math.PI)*38:0;
        m.el.style.transform=`translate(${m.x}px,${-j}px)`;const bob=moving?Math.sin(t/130+m.phase)*3:0;const flip=(m.dir<0?-1:1)*(m.avatar.flip?-1:1);m.body.style.transform=`translateY(${bob}px) scaleX(${flip}) rotate(${moving?Math.sin(t/130+m.phase)*3:0}deg)`;
        if(speaking)this.positionBubble(m);
      }
      if(!this.paused&&t>this.nextSample){this.sample();this.nextSample=t+4200;}
      const lines=this.commands.snapshot();const signature=JSON.stringify(lines);if(signature!==this.hudSignature){this.hudSignature=signature;this.hud.replaceChildren(...lines.map(x=>{const e=document.createElement('div');e.className='hud-item '+x.kind;e.textContent=x.text;return e;}));}
      this.frame=requestAnimationFrame(t=>this.animate(t));
    }
    destroy(){cancelAnimationFrame(this.frame);}
  }
  globalThis.AvatarGarden={builtins,skins,colorKeys,defaults,normalize,formatDuration,Commands,ObsConnection,Garden};
})();
