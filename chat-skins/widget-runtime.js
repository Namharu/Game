/* Chat widget commands. Transport supplies verified broadcaster/manager roles. */
(() => {
'use strict';
  const formatDuration=ms=>{const s=Math.max(0,Math.floor(ms/1000));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(n=>String(n).padStart(2,'0')).join(':');};
  class Commands{
    constructor(){this.notice='';this.clock=false;this.timerEnd=null;this.streamVisible=false;this.obs=null;}
    // Live roles come from the Panda adapter, never from nickname text. The explicit demo UI uses simulated roles.
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

globalThis.ChatWidgets={formatDuration,Commands,ObsConnection};
})();
