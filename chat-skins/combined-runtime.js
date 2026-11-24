/* Normal chat and moderator notices share one read-only Panda connection. */
(() => {
 'use strict';
 class CombinedChat {
  constructor({feed,notice,config}){this.feed=feed;this.notice=notice;this.config=config;this.commands=new ChatWidgets.Commands();this.commands.notice=config.notice||'';this.renderNotice();}
  renderNotice(){const row=this.commands.snapshot()[0],text=row?.text||'';this.notice.textContent=text;this.notice.hidden=!text;this.notice.dataset.skin='plain';this.notice.style.order=this.config.noticePosition==='bottom'?'2':'0';
   const t=ChatSkins.themes.find(t=>t.id===this.config.theme),colors={match:[t.bg,t.ink,t.line],pink:['#fff0f6','#853b61','#e6a1bf'],night:['#20243b','#f8f5ff','#8e88b9'],gold:['#242129','#ffedb3','#c9a65f']}[this.config.noticeSkin];
   Object.assign(this.notice.style,{background:colors[0],color:colors[1],border:'2px solid '+colors[2],borderRadius:'14px',textShadow:'none',padding:'20px 22px',fontSize:Math.round(this.config.size*this.config.noticeScale/100)+'px',minHeight:'110px',lineHeight:'1.5',textAlign:'left',fontFamily:this.config.font==='system'?'"Malgun Gothic",system-ui,sans-serif':'"NHChat-'+this.config.font+'",system-ui,sans-serif'});
}
  receive(m){
   if(/^!(공지|타이머|시간|방송시간)(?:\s|$)/.test(m.text.trim())){const next=new ChatWidgets.Commands();next.obs=this.commands.obs;if(/^!타이머\s+추가(?:\s|$)/.test(m.text.trim()))next.timerEnd=this.commands.timerEnd;const result=next.run(m.text,m.role);if(result.ok){this.commands=next;this.renderNotice();return result;}if(m.role==='broadcaster'||m.role==='manager')return result;}
   const row=document.createElement('div');row.className='message__wrapper chat';const box=document.createElement('div');box.className='message__box';const nick=document.createElement('p');nick.className='message__nick';const group=document.createElement('span');group.className='chat__nick-group';
   if(m.role==='broadcaster'||m.role==='manager'){const badge=document.createElement('span');badge.className='chat__grade-badge';badge.textContent=m.role==='broadcaster'?'BJ':'M';group.append(badge);}
   const name=document.createElement('span');name.className='message__name';name.textContent=m.name;group.append(name);nick.append(group);const text=document.createElement('div');text.className='message__text';text.textContent=m.text;box.append(nick,text);row.append(box);this.feed.append(row);this.trim();return {handled:false};
  }
  trim(){while(this.feed.children.length>60)this.feed.firstElementChild.remove();this.feed.scrollTop=this.feed.scrollHeight;}
 }
 window.CombinedChat=CombinedChat;
})();
