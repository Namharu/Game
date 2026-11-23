"use strict";
window.ChatSkins = (() => {
const themes = [
 {id:'pink',name:'로즈 밀크',tag:'말풍선',bg:'#ffe9f1',ink:'#694858',accent:'#b25582',line:'#f7b9d0',radius:'22px 22px 22px 5px',mark:'♥'},
 {id:'cat',name:'살구 고양이',tag:'캐릭터',bg:'#fff0d6',ink:'#704b36',accent:'#b46c39',line:'#daa575',radius:'20px',mark:'ฅ',type:'cat'},
 {id:'retro-blue',name:'블루 데스크',tag:'레트로',bg:'#e9f0ff',ink:'#334268',accent:'#536fc5',line:'#536fc5',radius:'5px',mark:'▣',type:'retro'},
 {id:'retro-pink',name:'핑크 데스크',tag:'레트로',bg:'#ffe9f4',ink:'#743d66',accent:'#b4669c',line:'#b4669c',radius:'5px',mark:'▣',type:'retro'},
 {id:'memo',name:'레몬 메모',tag:'메모지',bg:'#fff3ae',ink:'#625322',accent:'#9a7824',line:'#ead78a',radius:'2px 2px 22px 2px',mark:'✎',type:'memo'},
 {id:'mint',name:'민트 소다',tag:'말풍선',bg:'#e0f8ef',ink:'#29594e',accent:'#2b8d78',line:'#a0dbc9',radius:'5px 24px 24px 24px',mark:'✿'},
 {id:'cloud',name:'구름 편지',tag:'말풍선',bg:'#f3faff',ink:'#4d6683',accent:'#6b9ec6',line:'#c2e2f4',radius:'32px',mark:'☁',type:'cloud'},
 {id:'neon',name:'나이트 글로우',tag:'네온',bg:'#21182f',ink:'#f3e8ff',accent:'#dfb3ff',line:'#bb83f5',radius:'5px 20px 20px 20px',mark:'✦',type:'neon'},
 {id:'pixel',name:'픽셀 퀘스트',tag:'레트로',bg:'#263d35',ink:'#f2ffca',accent:'#d8ee96',line:'#adce70',radius:'0',mark:'◆',type:'pixel'},
 {id:'gold',name:'골드 라운지',tag:'클래식',bg:'#282623',ink:'#f6e7c8',accent:'#e7c277',line:'#b4965d',radius:'10px',mark:'♛',type:'gold'},
 {id:'midnight',name:'모던 다크',tag:'심플',bg:'#252a34',ink:'#edf0f8',accent:'#b2c3e6',line:'#505c72',radius:'12px',mark:'●'},
 {id:'clear',name:'클리어',tag:'심플',bg:'#ffffff',ink:'#ffffff',accent:'#ffcde5',line:'#ffffff',radius:'0',mark:'',type:'clear'}
];
function normalize(s={}){return {theme:themes.some(t=>t.id===s.theme)?s.theme:'pink',size:Math.max(14,Math.min(28,Number(s.size)||18)),opacity:Math.max(20,Math.min(100,Number(s.opacity)||90)),gap:Math.max(8,Math.min(32,Number(s.gap)||18))};}
function css(input){const s=normalize(input),t=themes.find(t=>t.id===s.theme),r=parseInt(t.bg.slice(1,3),16),g=parseInt(t.bg.slice(3,5),16),b=parseInt(t.bg.slice(5,7),16),q='.message__wrapper.chat',box=q,name=q+' .message__name';
let out=`/* NAMHARU · ${t.name} · 팬더 방송도우미 채팅용 CSS */
${q}{display:block!important;position:relative!important;margin:${s.gap}px 6px!important;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;overflow:visible!important;max-width:calc(100% - 12px)!important;}
${box}{position:relative!important;display:block!important;padding:14px 18px!important;background:rgba(${r},${g},${b},${s.opacity/100})!important;color:${t.ink}!important;border:1px solid ${t.line}!important;border-radius:${t.radius}!important;box-shadow:0 4px 12px #00000016!important;font-family:"Malgun Gothic",system-ui,sans-serif!important;font-size:${s.size}px!important;line-height:1.55!important;text-shadow:none!important;overflow-wrap:anywhere!important;word-break:normal!important;}
${box} *{font-family:inherit!important;text-shadow:inherit!important;}
${name}{display:block!important;float:none!important;width:auto!important;margin:0 0 7px!important;padding:0!important;color:${t.accent}!important;font-size:${Math.round(s.size*.76)}px!important;font-weight:800!important;line-height:1.4!important;}
${name} *{color:inherit!important;font-size:inherit!important;}
${name}::before{content:"${t.mark}"!important;margin-right:6px!important;}
${box}::before,${box}::after{content:none!important;}
`;
if(t.type==='retro')out+=`${box}{padding-top:38px!important;border-width:2px!important;box-shadow:3px 3px 0 ${t.line}70!important;}${box}::before{content:"CHAT                         −  □  ×"!important;position:absolute!important;top:0!important;left:0!important;right:0!important;padding:3px 9px!important;height:24px!important;background:${t.accent}!important;color:white!important;font-size:11px!important;white-space:pre!important;border-radius:2px 2px 0 0!important;}`;
if(t.type==='cat')out+=`${box}{border-width:2px!important;margin-top:13px!important;}${box}::before{content:""!important;position:absolute!important;top:-13px!important;left:21px!important;width:20px!important;height:20px!important;background:${t.bg}!important;border-top:2px solid ${t.line}!important;border-left:2px solid ${t.line}!important;transform:rotate(45deg)!important;border-radius:5px 0 0!important;}${box}::after{content:"= ･ω･ ="!important;position:absolute!important;right:13px!important;top:8px!important;font-size:12px!important;color:${t.accent}!important;}${name}{padding-right:65px!important;}`;
if(t.type==='memo')out+=`${box}{box-shadow:3px 5px 0 #8b712526!important;border:0!important;border-top:6px solid #ead573!important;}`;
if(t.type==='neon')out+=`${box}{box-shadow:0 0 12px ${t.line}60,inset 3px 0 ${t.line}!important;}`;
if(t.type==='pixel')out+=`${box}{border:3px solid ${t.line}!important;box-shadow:5px 5px 0 #18251b!important;font-family:monospace!important;}`;
if(t.type==='gold')out+=`${box}{border-top:3px double ${t.line}!important;border-bottom:3px double ${t.line}!important;}`;
if(t.type==='cloud')out+=`${box}{border:3px solid white!important;box-shadow:0 4px 0 #c9e5f08a!important;}`;
if(t.type==='clear')out+=`${box}{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;text-shadow:0 1px 3px #000,1px 0 2px #000,-1px 0 2px #000!important;}`;
out+=`${q}{text-align:left!important;box-sizing:border-box!important;width:calc(100% - 12px)!important;list-style:none!important;}
${q} .message__box{display:block!important;width:auto!important;margin:0!important;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;}
${q} .message__nick{display:block!important;white-space:normal!important;margin:0!important;padding:0!important;line-height:1.4!important;text-indent:0!important;}
${q} .message__name{display:inline!important;}
${q} .message__text,${q} .message__text *{display:revert!important;color:${t.ink}!important;font-size:${s.size}px!important;font-weight:500!important;line-height:1.55!important;text-shadow:${t.type==='clear'?'0 1px 3px #000,1px 0 2px #000,-1px 0 2px #000':'none'}!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;}
${q} .message__text{display:block!important;float:none!important;width:auto!important;max-width:100%!important;margin:6px 0 0!important;padding:0!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;}
${q} .message__text img{display:inline-block!important;max-width:100%!important;height:auto!important;vertical-align:middle!important;}
`;
return out;}
return {themes,normalize,css};})();
