const assert=require('node:assert/strict');
require('./widget-runtime.js');
require('../moving-chat/engine.js');
const {Commands,ObsConnection}=global.ChatWidgets;
const {normalize}=global.AvatarGarden;
let checks=0;const check=(x)=>{assert.ok(x);checks++};const c=new Commands(),now=100000;
for(const role of ['viewer','unknown','V','',undefined])for(const cmd of ['!공지 변조','!타이머 10','!시간','!방송시간']){check(c.run(cmd,role,now).ok===false);check(c.snapshot(now).length===0);}
for(const role of ['broadcaster','manager']){check(c.run('!공지 테스트',role,now).ok);check(c.notice==='테스트');}
check(c.run('!타이머 1:30','manager',now).ok);check(c.timerEnd===190000);check(c.snapshot(190000).some(x=>x.text==='타이머 종료!'));
for(const text of ['!타이머 1:99','!타이머 -10','!타이머 86401','!타이머 abc','!타이머 0']){check(!c.run(text,'manager',now).ok);check(c.timerEnd===190000);}
for(const [text,seconds] of [['1분',60],['30초',30],['1분 30초',90],['1분30초',90],['1시간',3600],['1시간 2분 3초',3723],['24시간',86400],['1 분',60],['5:00',300],['300',300]]){check(c.run('!타이머 '+text,'manager',now).ok);check(c.timerEnd===now+seconds*1000);}
const lastEnd=c.timerEnd;for(const text of ['0분','25시간','24시간 1초','-1분','1.5분','1분 abc','1분 2분','30초 1분','1시간2']){check(!c.run('!타이머 '+text,'manager',now).ok);check(c.timerEnd===lastEnd);}
check(c.run('!타이머 1분','manager',now).ok);check(c.run('!타이머 추가 1분','manager',now+10000).ok);check(c.timerEnd===now+120000);
check(c.run('!타이머 추가 30초','manager',now+20000).ok);check(c.timerEnd===now+150000);
const before=c.timerEnd;check(!c.run('!타이머 추가 24시간','manager',now).ok);check(c.timerEnd===before);check(!c.run('!타이머 추가 1분','viewer',now).ok);check(c.timerEnd===before);
const stopped=new Commands();check(!stopped.run('!타이머 추가 1분','manager',now).ok);check(stopped.timerEnd===null);stopped.timerEnd=now-1;check(!stopped.run('!타이머 추가 1분','manager',now).ok);
check(c.run('!타이머 중지','manager',now).ok);check(c.timerEnd===null);check(c.run('!시간','manager',now).ok);check(c.snapshot(now).some(x=>x.kind==='clock'));
check(c.run('!방송시간','manager',now).ok);check(c.snapshot(now).some(x=>x.text==='방송시간 연결 필요'));
c.obs={active:true,duration:65000,at:now};check(c.snapshot(now+1000).some(x=>x.text==='방송 중 · 00:01:06'));check(c.snapshot(now+9000).some(x=>x.text==='방송시간 연결 확인 중'));
c.obs={active:false,duration:65000,at:now};check(c.snapshot(now).some(x=>x.text==='방송 대기 중'));
check(!c.run('일반 채팅','viewer',now).handled);check(!c.run('!공지사항','manager',now).handled);
const s=normalize({count:Infinity,size:999,fontSize:-1,bubbleBg:'url(https://bad)',selected:'oops'});check(s.count===6&&s.size===160&&s.fontSize===14&&s.bubbleBg==='#ffffff');
class WS{static instances=[];constructor(url){this.url=url;this.readyState=1;this.sent=[];WS.instances.push(this)}send(s){this.sent.push(JSON.parse(s))}close(){this.readyState=3}}
global.WebSocket=WS;global.crypto=require('node:crypto').webcrypto;
(async()=>{let received;const client=new ObsConnection(()=>{},x=>received=x);await client.connect(4455,'test-only-password');const ws=WS.instances[0];await ws.onmessage({data:JSON.stringify({op:0,d:{authentication:{salt:'salt',challenge:'challenge'}}})});check(ws.sent[0].op===1&&typeof ws.sent[0].d.authentication==='string');check(!JSON.stringify(ws.sent).includes('test-only-password'));await ws.onmessage({data:JSON.stringify({op:2,d:{}})});check(ws.sent[1].d.requestType==='GetStreamStatus');await ws.onmessage({data:JSON.stringify({op:7,d:{requestType:'GetStreamStatus',requestStatus:{result:true},responseData:{outputActive:true,outputDuration:123456}}})});check(received.active&&received.duration===123456);check(ws.sent.every(m=>m.op!==6||m.d.requestType==='GetStreamStatus'));client.disconnect();check(received===null);console.log('PASS',checks,'permission, timer, stream-state and OBS protocol checks');})().catch(e=>{console.error(e);process.exitCode=1});
