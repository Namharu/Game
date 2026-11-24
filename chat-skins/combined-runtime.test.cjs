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
