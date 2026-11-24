const assert=require('node:assert/strict');global.window=global;
class Element{constructor(){this.children=[];this.dataset={};this.style={};this.textContent='';this.hidden=false;}append(...els){for(const e of els){e.parent=this;this.children.push(e);}}remove(){this.parent.children.splice(this.parent.children.indexOf(this),1);}get firstElementChild(){return this.children[0];}get scrollHeight(){return this.children.length*60;}}
global.document={createElement:()=>new Element()};require('./themes.js');require('./widget-runtime.js');require('./combined-runtime.js');
const feed=new Element(),notice=new Element(),chat=new CombinedChat({feed,notice,config:ChatSkins.normalize({notice:'처음 공지'})});
assert.equal(notice.textContent,'공지 · 처음 공지');
chat.receive({role:'viewer',name:'시청자',text:'안녕하세요'});assert.equal(feed.children.length,1);
chat.receive({role:'viewer',name:'방송자',text:'!공지 사칭 명령'});assert.equal(notice.textContent,'공지 · 처음 공지');assert.equal(feed.children.length,2);
chat.receive({role:'broadcaster',name:'방송자',text:'!공지 새 공지'});assert.equal(notice.textContent,'공지 · 새 공지');assert.equal(feed.children.length,2);
chat.receive({role:'manager',name:'매니저',text:'!공지 매니저 수정'});assert.equal(notice.textContent,'공지 · 매니저 수정');
chat.receive({role:'viewer',name:'방문자',text:'공지가 있어도 채팅 계속'});assert.equal(feed.children.length,3);
chat.receive({role:'manager',name:'매니저',text:'!공지 끄기'});assert.equal(notice.hidden,true);assert.equal(feed.children.length,3);
chat.receive({role:'broadcaster',name:'방송자',text:'!공지 <img src=x onerror=alert(1)>'});assert.equal(notice.textContent,'공지 · <img src=x onerror=alert(1)>');assert.equal(notice.children.length,0);
for(let i=0;i<80;i++)chat.receive({role:'viewer',name:'테스트',text:String(i)});assert.equal(feed.children.length,60);assert.equal(feed.scrollTop,feed.scrollHeight);
console.log('PASS combined chat: normal messages, notice roles/update/off, text safety, bounded history');

const send=(text,role='manager')=>chat.receive({role,name:'테스트',text});
send('!타이머 5:00');assert.equal(chat.commands.notice,'');assert.equal(chat.commands.snapshot().length,1);assert.match(notice.textContent,/남은 시간/);
const end=chat.commands.timerEnd;send('!타이머 잘못된값');assert.equal(chat.commands.timerEnd,end);send('!시간','viewer');assert.equal(chat.commands.timerEnd,end);
send('!시간');assert.equal(chat.commands.timerEnd,null);assert.match(notice.textContent,/현재 시각/);assert.equal(chat.commands.snapshot().length,1);
chat.commands.obs={active:true,duration:65000,at:Date.now(),ttl:30000};send('!방송시간');assert.equal(chat.commands.clock,false);assert.match(notice.textContent,/방송 중 · 00:01:05/);assert.equal(chat.commands.snapshot().length,1);
send('!공지 다시 공지');assert.equal(chat.commands.streamVisible,false);assert.equal(notice.textContent,'공지 · 다시 공지');send('!시간 끄기');assert.equal(notice.hidden,true);
assert.equal(notice.style.fontSize,'29px');assert.equal(notice.style.minHeight,'110px');console.log('PASS exclusive display switching, invalid/unauthorized preservation, broadcast data, larger type');

send('!타이머 1분');const initialEnd=chat.commands.timerEnd;send('!타이머 추가 1분');assert.equal(chat.commands.timerEnd,initialEnd+60000);assert.equal(chat.commands.snapshot().length,1);send('!타이머 중지');assert.equal(chat.commands.timerEnd,null);assert.equal(notice.hidden,true);send('!공지 유지');send('!타이머 추가 1분');assert.equal(notice.textContent,'공지 · 유지');console.log('PASS timer extension preserves countdown and stop hides shared display');
