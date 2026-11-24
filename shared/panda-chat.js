/* Read-only Panda helper connection. User widget keys never enter repository files or localStorage. */
(() => {
  'use strict';
  function keyFromUrl(value){
    let u;try{u=new URL(String(value).trim());}catch{throw Error('팬더 방송도우미에서 복사한 채팅 위젯 주소를 넣어 주세요.');}
    if(u.protocol!=='https:'||u.hostname!=='p.pandahp.kr'||u.port||u.username||u.password||!u.pathname.startsWith('/chat/'))throw Error('p.pandahp.kr/chat/… 형식의 채팅 위젯 주소가 필요합니다.');
    const key=u.pathname.replace(/\/$/,'').split('/').pop();
    if(!/^[A-Za-z0-9._~=:!-]{20,512}$/.test(key))throw Error('미리보기 주소가 아닌 개인 채팅 위젯 주소를 넣어 주세요.');
    return key;
  }
  function tokenChannel(token){
    try{const b=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');const info=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b),c=>c.charCodeAt(0))));if(typeof info.info?.channel!=='string'||!info.info.channel)throw Error();return info.info.channel;}catch{throw Error('팬더 연결 응답을 해석하지 못했어요. 위젯 주소를 새로 발급해 확인하세요.');}
  }
  function chatFromPublication(p){
    const d=p?.data;if(!d||!['bj','manager','chatter'].includes(d.type)||typeof d.message!=='string'||typeof d.nk!=='string')return null;
    return {id:typeof d.id==='string'||typeof d.id==='number'?String(d.id):d.nk,name:d.nk.slice(0,64),text:d.message.slice(0,1000),role:d.type==='bj'?'broadcaster':d.type==='manager'?'manager':'viewer'};
  }
  class Connection{
    constructor({onStatus=()=>{},onChat=()=>{},onMode=()=>{}}={}){this.onStatus=onStatus;this.onChat=onChat;this.onMode=onMode;this.generation=0;this.client=null;this.key='';this.token='';this.count=0;this.seen=new Set();}
    report(state,text){this.onStatus({state,text,count:this.count});}
    disconnect(silent=false){this.generation++;clearTimeout(this.deadline);this.abort?.abort();if(this.client){this.client.removeAllListeners();this.client.disconnect();this.client=null;}this.key='';this.token='';this.seen.clear();this.onMode(false);if(!silent)this.report('off','연결 해제 · 샘플 모드');}
    async getToken(type,generation){
      const url=new URL('https://api.pandahp.kr/new-token/chat');url.searchParams.set('key',this.key);url.searchParams.set('type',type);if(type==='REGEN'&&this.token)url.searchParams.set('chatToken',this.token);
      const abort=new AbortController();this.abort=abort;const timeout=setTimeout(()=>abort.abort(),10000);
      try{const r=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer',signal:abort.signal});if(!r.ok)throw Error(r.status===400||r.status===401||r.status===403?'주소가 만료되었거나 연결할 수 없어요. 방송도우미의 채팅 주소와 방송 상태를 확인하세요.':`팬더 연결 응답 오류 (${r.status})`);const data=await r.json();if(generation!==this.generation)return null;if(typeof data.chatToken!=='string'||!data.chatToken)throw Error('연결키를 받지 못했어요. 방송이 켜져 있는지와 채팅 위젯 주소를 확인하세요.');this.token=data.chatToken;return data.chatToken;}finally{clearTimeout(timeout);}
    }
    async connect(value){
      let key;try{key=keyFromUrl(value);}catch(err){this.report('error',err.message);return false;}
      this.disconnect(true);this.key=key;this.count=0;const generation=this.generation;this.onMode(true);this.report('connecting','팬더 연결키 확인 중…');
      try{const token=await this.getToken('NEW',generation);if(!token||generation!==this.generation)return false;const channel=tokenChannel(token);
        const client=new Centrifuge('wss://chat-ws.neolive.kr/connection/websocket',{debug:false,refreshAttempts:3,refreshInterval:1000,onRefresh:(_ctx,cb)=>{this.getToken('REGEN',generation).then(t=>{if(t&&generation===this.generation)cb({status:200,data:{token:t}});}).catch(()=>{cb({status:403});if(generation===this.generation)this.report('error','연결키 갱신 실패 · 위젯 주소로 다시 연결하세요.');});},onRefreshFailed:()=>{if(generation===this.generation)this.fail('연결키가 만료됐어요. 다시 연결하세요.');}});
        this.client=client;client.setToken(token);client.on('connect',()=>{if(generation===this.generation)this.report('connecting','채팅 채널 확인 중…');});client.on('disconnect',ctx=>{if(generation===this.generation)this.report('disconnected',ctx.reconnect?'연결이 끊겨 재연결 중입니다.':'채팅 연결이 종료됐어요. 다시 연결하세요.');});client.on('error',()=>{if(generation===this.generation)this.report('error','팬더 채팅 연결 오류 · 주소와 방송 상태를 확인하세요.');});
        const sub=client.subscribe(channel,p=>{if(generation!==this.generation)return;const m=chatFromPublication(p);if(!m)return;const stamp=Number.isFinite(p.offset)&&p.offset>0?`${p.epoch||''}:${p.offset}`:null;if(stamp&&this.seen.has(stamp))return;if(stamp){this.seen.add(stamp);if(this.seen.size>500)this.seen.delete(this.seen.values().next().value);}this.count++;this.report('live',`실제 채팅 ${this.count}건 수신`);this.onChat(m);});
        sub.on('subscribe',()=>{if(generation!==this.generation)return;clearTimeout(this.deadline);this.report('ready','채팅 연결됨 · 새 채팅을 기다리고 있어요.');});sub.on('error',()=>{if(generation===this.generation)this.fail('채팅 채널 접근 실패 · 방송 상태와 위젯 주소를 확인하세요.');});
        this.deadline=setTimeout(()=>{if(generation===this.generation)this.fail('채팅 연결 시간 초과 · 방송 상태와 네트워크를 확인하세요.');},15000);client.connect();return true;
      }catch(err){if(generation!==this.generation)return false;const message=err.name==='AbortError'?'팬더 응답 시간 초과 · 다시 연결하세요.':err instanceof TypeError?'팬더 연결 요청이 차단되거나 네트워크가 끊겼어요.':err instanceof SyntaxError?'팬더 연결 응답 형식을 확인하지 못했어요.':err.message;this.fail(message);return false;}
    }
    fail(message){this.disconnect(true);this.report('error',message);}
  }
  globalThis.PandaChat={Connection,keyFromUrl,tokenChannel,chatFromPublication};
})();
