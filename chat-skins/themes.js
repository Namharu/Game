"use strict";
window.ChatSkins=(()=>{
const themes=[
{id:'heart',name:'러브레터',tag:'하트 봉인 · 레이스 프레임',bg:'#fff5f8',ink:'#62374d',accent:'#c74d7e',line:'#e9aac2'},
{id:'cat',name:'냥냥 밀크',tag:'고양이 귀 · 작은 발자국',bg:'#fffaf2',ink:'#59473e',accent:'#ac7751',line:'#d9b596'},
{id:'snow',name:'구름 소다',tag:'구름 이름표 · 물방울 유리',bg:'#f1fbff',ink:'#31566f',accent:'#397fa9',line:'#a8d9ec'},
{id:'retro',name:'체리 데스크',tag:'미니 윈도우 · 체크 패턴',bg:'#fff3f6',ink:'#634254',accent:'#c97898',line:'#dca3bb'},
{id:'memo',name:'라일락 다이어리',tag:'스프링 노트 · 테이프',bg:'#faf6ff',ink:'#59456e',accent:'#8967af',line:'#c6b2dd'},
{id:'neon',name:'오로라 네온',tag:'빛나는 테두리 · 유리 패널',bg:'#16172f',ink:'#f4f1ff',accent:'#c7a2ff',line:'#a388e4'},
{id:'rpg',name:'별빛 퀘스트',tag:'별자리 · 골드 이름표',bg:'#20283d',ink:'#f6edda',accent:'#ebce8e',line:'#bba472'},
{id:'comic',name:'피치 톡',tag:'둥근 말풍선 · 캔디 이름표',bg:'#fff5ef',ink:'#664644',accent:'#cf746d',line:'#f0bcb0'},
{id:'clear',name:'클린 라이브',tag:'배경 없이 · 또렷한 자막',bg:'#ffffff',ink:'#ffffff',accent:'#ffe0ed',line:'#ffffff'}
];
const aliases={pink:'heart','retro-blue':'retro','retro-pink':'retro',mint:'snow',cloud:'snow',pixel:'rpg',gold:'rpg',midnight:'neon'};
function normalize(s={}){const id=aliases[s.theme]||s.theme;return{theme:themes.some(t=>t.id===id)?id:'heart',palette:['original','mint','lavender'].includes(s.palette)?s.palette:'original',size:Math.max(14,Math.min(32,Number(s.size)||22)),opacity:Math.max(20,Math.min(100,Number(s.opacity)||96)),gap:Math.max(8,Math.min(32,Number(s.gap)||14))};}
function css(input){const s=normalize(input),t={...themes.find(t=>t.id===s.theme)},q='.message__wrapper.chat';
const dark=['neon','rpg'].includes(t.id);
if(s.palette!=='original'&&t.id!=='clear'){const mint=s.palette==='mint';t.accent=dark?(mint?'#a3edce':'#d8b5ff'):(mint?'#3d8a78':'#9364ae');t.bg=dark?(mint?'#162e2b':'#272039'):(mint?'#f0fff8':'#fcf4ff');t.ink=dark?'#f7f5ff':(mint?'#345e52':'#624776');t.line=mint?'#99ccb8':'#ceb0df';}
const rgb=[1,3,5].map(i=>parseInt(t.bg.slice(i,i+2),16)).join(','),bg=`rgba(${rgb},${s.opacity/100})`;
let out=`/* NAMHARU · ${t.name} · 팬더 방송도우미 / OBS 사용자 지정 CSS */\n`;
const rule=(part,body)=>{out+=part.split(',').map(x=>q+x).join(',')+'{'+body.split(';').filter(Boolean).map(x=>x+'!important').join(';')+';}\n';};
rule('',`box-sizing:border-box;position:relative;display:block;list-style:none;width:fit-content;min-width:140px;max-width:calc(100% - 32px);margin:${s.gap+14}px 16px;padding:13px 18px;overflow:visible;text-align:left;text-indent:0;background:${bg};color:${t.ink};border:1.5px solid ${t.line};border-radius:18px;box-shadow:0 3px 0 ${t.line}55;font:${s.size}px/1.5 "Malgun Gothic",system-ui,sans-serif`);
rule(' *, *::before, *::after','font-family:inherit;box-sizing:border-box');rule('::before,::after','content:none;pointer-events:none');
rule(' .message__box','display:block;margin:0;padding:0;background:none;border:0;box-shadow:none;width:auto;max-width:100%');
rule(' .message__nick',`display:block;position:relative;white-space:normal;margin:0 0 6px;padding:0;line-height:1.3;text-indent:0;font-size:${Math.round(s.size*.76)}px`);
rule(' .message__name, .message__name *',`color:${t.accent};font-size:${Math.round(s.size*.76)}px;font-weight:800;text-shadow:none;line-height:1.3`);
rule(' .message__text, .message__text *',`color:${t.ink};font-size:${s.size}px;font-weight:600;line-height:1.5;text-shadow:none;white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;letter-spacing:-.025em`);
rule(' .message__text','display:block;float:none;width:auto;max-width:100%;margin:0;padding:0;text-indent:0;background:none;border:0;border-radius:0;box-shadow:none');
rule(' .message__text img','display:inline-block;max-width:100%;height:auto;vertical-align:middle');
rule(' .chat__nick-group','display:inline-flex;align-items:center;gap:5px;white-space:normal;vertical-align:middle');
rule(' .chat__grade-badge',`display:inline-flex;align-items:center;flex:none;vertical-align:middle;font-size:${Math.round(s.size*.8)}px`);
rule(' .chat__grade-badge svg, .chat__grade-badge img','width:auto;height:1em;max-width:none');
if(t.id==='heart'){
rule('',`border:3px double ${t.line};border-radius:20px 20px 20px 5px;padding:14px 20px;background:radial-gradient(circle at 100% 0,#ffc5dc44,transparent 60%),${bg};box-shadow:0 4px 0 ${t.line}45,inset 0 0 0 4px #ffffff88`);
rule('::before',`content:"♥";position:absolute;right:13px;top:-14px;width:29px;height:29px;text-align:center;font:18px/27px Georgia;color:${t.accent};background:${t.bg};border:2px solid ${t.line};border-radius:50%;transform:rotate(12deg)`);
rule(' .message__nick','padding-right:20px');rule('::after',`content:"✧";position:absolute;right:8px;bottom:4px;font-size:16px;color:${t.line}`);
}
if(t.id==='cat'){
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="40" viewBox="0 0 72 40"><path d="M4 37L8 5Q9 2 13 5L26 17Q36 14 46 17L59 5Q63 2 64 7L68 37" fill="${t.bg}" stroke="${t.line}" stroke-width="2"/><path d="M12 12L14 24L22 19M59 12L58 24L50 19" fill="#efb7b6"/><path d="M23 29q3-4 6 0m14 0q3-4 6 0M33 33q3 3 6 0" fill="none" stroke="${t.ink}" stroke-width="1.8" stroke-linecap="round"/></svg>`;
rule('',`border-radius:17px 17px 17px 5px;padding:13px 19px;margin-top:${s.gap+23}px;background:${bg}`);
rule('::before',`content:"";position:absolute;right:14px;top:-30px;width:65px;height:36px;background:url("data:image/svg+xml,${encodeURIComponent(svg)}") center/contain no-repeat`);
rule(' .message__nick','padding-right:55px');rule('::after',`content:"•";position:absolute;right:9px;bottom:4px;color:${t.line};font-size:15px;text-shadow:-4px -5px 0 ${t.line},2px -7px 0 ${t.line},6px -3px 0 ${t.line}`);
}
if(t.id==='snow'){
rule('',`border:2px solid ${t.line};border-radius:24px 24px 24px 7px;box-shadow:inset 0 0 0 4px #ffffff99,0 4px 12px #396e8b20;background:radial-gradient(ellipse at top left,#ffffffee,transparent 80%),${bg};padding:17px 18px 12px`);
rule(' .message__nick','margin-top:-30px;margin-bottom:9px');rule(' .chat__nick-group',`background:${t.bg};border:1.5px solid ${t.line};border-radius:20px;padding:4px 12px;box-shadow:0 3px 0 #ffffffaa`);
rule('::after',`content:"✦  ˚";position:absolute;right:11px;bottom:3px;color:${t.line};font-size:15px`);
}
if(t.id==='retro'){
rule('',`padding:35px 15px 13px;border:2px solid ${t.line};border-radius:10px;box-shadow:3px 4px 0 ${t.line}66;background:linear-gradient(90deg,#ffffff22 50%,transparent 50%) 0 0/12px 12px,${bg}`);
rule('::before',`content:"●  ●  ●";position:absolute;left:0;right:0;top:0;height:23px;padding-left:9px;border-radius:7px 7px 0 0;background:${t.accent};color:#fff8;font:10px/23px monospace;border-bottom:1px solid ${t.line}`);
rule('::after','content:"CHAT  −  □  ×";position:absolute;top:4px;right:9px;font:10px/15px monospace;color:white');
rule(' .message__text',`background:#ffffff65;padding:7px 10px;border:1px solid ${t.line}88;border-radius:5px`);
}
if(t.id==='memo'){
rule('',`padding:15px 18px 14px 29px;border-radius:4px 14px 14px 4px;border:1px solid ${t.line};background:repeating-linear-gradient(transparent 0 27px,${t.line}33 27px 28px),${bg};box-shadow:3px 4px 0 ${t.line}55`);
rule('::before',`content:"";position:absolute;left:7px;top:10px;bottom:10px;width:8px;background:radial-gradient(ellipse,#8e7b9f 0 30%,transparent 40%) 0 0/8px 15px;border-right:1px solid ${t.line}`);
rule('::after',`content:"";position:absolute;right:17px;top:-8px;width:42px;height:16px;transform:rotate(9deg);background:${t.line}99;border-left:2px dotted #fff9;border-right:2px dotted #fff9`);
}
if(t.id==='neon'){
rule('',`border:1px solid ${t.line};border-left:3px solid ${t.accent};border-radius:5px 18px 18px 5px;background:linear-gradient(115deg,#b978ff22,transparent 65%),${bg};box-shadow:0 0 9px ${t.accent}55,inset 0 0 12px ${t.line}22;padding:14px 19px`);
rule(' .message__nick',`border-bottom:1px solid ${t.line}44;padding-bottom:6px`);rule('::after',`content:"✧";position:absolute;right:10px;top:8px;color:${t.accent};text-shadow:0 0 8px ${t.accent};font-size:18px`);
}
if(t.id==='rpg'){
rule('',`border:3px double ${t.line};border-radius:5px 18px 5px 18px;padding:17px 20px 14px;background:radial-gradient(ellipse at top right,#dfbd6922,transparent 70%),${bg};box-shadow:inset 0 0 0 3px #0b122666,0 3px 0 #10162a55`);
rule(' .message__nick','margin-top:-30px;margin-bottom:9px');rule(' .chat__nick-group',`background:${t.bg};border:1px solid ${t.line};border-radius:4px 12px;padding:4px 12px`);
rule('::after',`content:"✦";position:absolute;right:7px;bottom:3px;font-size:15px;color:${t.accent}`);
}
if(t.id==='comic'){
rule('',`border:1.5px solid ${t.line};border-radius:22px 22px 22px 5px;padding:12px 18px 14px;box-shadow:0 4px 0 ${t.line}55;background:${bg}`);
rule(' .chat__nick-group',`background:${t.accent};border:2px solid #fff9;border-radius:15px;padding:3px 10px;box-shadow:0 2px 0 ${t.line}55`);rule(' .message__name, .message__name *','color:white');
rule('::after',`content:"";position:absolute;bottom:-6px;left:13px;width:10px;height:10px;transform:rotate(45deg);background:${t.bg};border-right:1.5px solid ${t.line};border-bottom:1.5px solid ${t.line}`);
}
if(t.id==='clear'){
rule('','padding:0;min-width:0;background:none;border:0;border-radius:0;box-shadow:none');rule(' .message__nick, .message__text','display:inline');rule(' .message__text::before','content:"  ";white-space:pre');rule(' .message__name, .message__name *, .message__text, .message__text *','text-shadow:0 1px 3px #000,1px 0 2px #000,-1px 0 2px #000');
}
return out;}
return{themes,normalize,css};})();
