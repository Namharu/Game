"use strict";
window.ChatSkins=(()=>{
const fonts=[
{id:'system',name:'기본 고딕',label:'기본 고딕 · 또렷한 기본 글꼴'},
{id:'noto',name:'본고딕',label:'본고딕 · 깔끔하고 읽기 편하게',variable:true},
{id:'jua',name:'주아체',label:'주아체 · 둥글고 귀엽게'},
{id:'dohyeon',name:'도현체',label:'도현체 · 굵고 시원하게'},
{id:'gowun',name:'고운돋움',label:'고운돋움 · 부드럽고 단정하게'},
{id:'pen',name:'나눔손글씨 펜',label:'나눔손글씨 펜 · 편안한 손글씨'},
{id:'gaegu',name:'개구체',label:'개구체 · 장난스러운 손글씨'},
{id:'myeongjo',name:'나눔명조',label:'나눔명조 · 차분한 책 글씨'}
];
const themes=[
{id:'retropink',name:'레트로 글라스 핑크',tag:'분홍 제목줄 · 대각선 반사광',fresh:true,bg:'#f9d4e9',ink:'#a94f82',accent:'#d987b2',line:'#c788ad'},
{id:'arcane',name:'아케인 골드',tag:'청록 안개 · 연속 금속 프레임',fresh:true,bg:'#071d23',ink:'#f1d278',accent:'#43c7c1',line:'#ac9158'},
{id:'hanok',name:'한옥 설날',tag:'기와 지붕 · 한지 말풍선',fresh:true,bg:'#fff9e9',ink:'#4a4c65',accent:'#9b7549',line:'#b4a580'},
{id:'scifi',name:'스페이스 콘솔',tag:'검은 철판 · 녹색 터미널',fresh:true,bg:'#11151a',ink:'#a1ed85',accent:'#87b7c4',line:'#5c6c7d'},
{id:'tactical',name:'택티컬',tag:'카본 패턴 · 노란 경고선',fresh:true,bg:'#191b1d',ink:'#f6ce67',accent:'#b8b8a8',line:'#6a6b60'},
{id:'rainbow',name:'레인보우 라인',tag:'흰 패널 · 무지개 외곽선',fresh:true,bg:'#ffffff',ink:'#363349',accent:'#b58ad2',line:'#c2b5df'},
{id:'gold',name:'골든 스타',tag:'금빛 모서리 · 별 장식',fresh:true,bg:'#16141c',ink:'#fff4d1',accent:'#edd39c',line:'#d9b673'},
{id:'dotted',name:'도트 스티치',tag:'점선 바느질 · 작은 이름표',fresh:true,bg:'#ffffff',ink:'#393644',accent:'#707983',line:'#aaa9b4'},
{id:'window',name:'클래식 윈도우',tag:'보라 제목줄 · 네모 창',fresh:true,bg:'#ffffff',ink:'#302c55',accent:'#8c70d4',line:'#8d87a8'},
{id:'messenger',name:'메신저 톡',tag:'노란 말풍선 · 오른쪽 이름',fresh:true,bg:'#ffeb54',ink:'#383123',accent:'#574e35',line:'#dfc838'},
{id:'round',name:'라운드 다크',tag:'둥근 반투명 캡슐',fresh:true,bg:'#272b38',ink:'#ffffff',accent:'#e3dcc7',line:'#596174'},
{id:'balloon',name:'소프트 벌룬',tag:'반투명 회색 · 말풍선 꼬리',fresh:true,bg:'#c5d0dc',ink:'#253245',accent:'#445973',line:'#c5d0dc'},
{id:'neonbright',name:'네온 라인',tag:'색이 교차하는 빛 테두리',fresh:true,bg:'#17242d',ink:'#ffffff',accent:'#73e5fa',line:'#66dbe8'},
{id:'neonfill',name:'네온 캔디',tag:'보라·민트·핑크 채움',fresh:true,bg:'#c282df',ink:'#ffffff',accent:'#ffffff',line:'#ebc8ff'},
{id:'whitebox',name:'화이트 박스',tag:'이름과 본문을 나눈 흰 상자',fresh:true,bg:'#ffffff',ink:'#353945',accent:'#566175',line:'#d5dce4'},
{id:'blackbox',name:'블랙 박스',tag:'검정 패널 · 또렷한 흰 글씨',fresh:true,bg:'#15181e',ink:'#ffffff',accent:'#bac9d6',line:'#404854'},
{id:'leather',name:'브라운 레더',tag:'가죽 질감 · 두 줄 스티치',fresh:true,bg:'#ca965b',ink:'#35251e',accent:'#66462c',line:'#805433'},
{id:'postit',name:'컬러 포스트잇',tag:'접힌 모서리 · 컬러 메모',fresh:true,bg:'#ffe392',ink:'#4c4434',accent:'#775f38',line:'#d8b96b'},
{id:'food',name:'토스트 타임',tag:'식빵 테두리 · 버터 이름표',fresh:true,bg:'#fff3cc',ink:'#674725',accent:'#bd8745',line:'#d09d5b'},
{id:'hud',name:'오렌지 HUD',tag:'기울어진 기술 패널',fresh:true,bg:'#18232e',ink:'#ffffff',accent:'#ffb85a',line:'#538ba5'},
{id:'danmaku',name:'흐르는 자막',tag:'오른쪽에서 왼쪽으로 흐름',fresh:true,bg:'#ffffff',ink:'#ffffff',accent:'#9de1ef',line:'#ffffff'},
{id:'halloween',name:'할로윈 파티',tag:'거미줄 · 박쥐와 호박',fresh:true,bg:'#fff4e6',ink:'#493650',accent:'#8153a2',line:'#5d3c78'},
{id:'heartpop',name:'하트 팝',tag:'핑크 프레임 · 하늘색 말풍선',fresh:true,bg:'#f092c6',ink:'#325c76',accent:'#a64782',line:'#ffd1ed'},
{id:'winter',name:'스노우 윈터',tag:'쌓인 눈 · 얼음 프레임',fresh:true,bg:'#dff6ff',ink:'#27618a',accent:'#3c91c9',line:'#81cbed'},
{id:'desktop',name:'블루 레트로',tag:'입체 창틀 · 분리된 제목 표시줄',fresh:true,bg:'#f1f0ff',ink:'#484470',accent:'#736fbc',line:'#aaa5df'},
{id:'crayon',name:'크레용 스케치',tag:'손그림 테두리 · 종이 말풍선',fresh:true,bg:'#fffef7',ink:'#534b64',accent:'#9771b1',line:'#b095c3'},
{id:'chalk',name:'초록 칠판',tag:'나무 액자 · 분필 글씨',fresh:true,bg:'#123d35',ink:'#fffdee',accent:'#e7ce84',line:'#956c4c'},
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
const priority=['retropink','desktop','arcane','halloween'];themes.sort((a,b)=>(priority.includes(a.id)?priority.indexOf(a.id):-1)===-1?(priority.includes(b.id)?1:0):(priority.includes(b.id)?priority.indexOf(a.id)-priority.indexOf(b.id):-1));
const aliases={pink:'heart','retro-blue':'desktop','retro-pink':'retropink',mint:'snow',cloud:'snow',pixel:'rpg',gold:'rpg',midnight:'neon'};
function normalize(s={}){const id=aliases[s.theme]||s.theme;return{noticeScale:Math.max(100,Math.min(200,Number(s.noticeScale)||130)),notice:String(s.notice||'').slice(0,120),noticeSkin:['match','pink','night','gold'].includes(s.noticeSkin)?s.noticeSkin:'match',noticePosition:s.noticePosition==='bottom'?'bottom':'top',font:fonts.some(f=>f.id===s.font)?s.font:'system',theme:themes.some(t=>t.id===id)?id:'heart',palette:['original','mint','lavender'].includes(s.palette)?s.palette:'original',size:Math.max(14,Math.min(32,Number(s.size)||22)),opacity:Math.max(20,Math.min(100,Number(s.opacity)||96)),gap:Math.max(8,Math.min(32,Number(s.gap)||14))};}
function css(input,fontBase="https://namharu.github.io/Game/chat-skins/fonts/"){const s=normalize(input),t={...themes.find(t=>t.id===s.theme)},q='.message__wrapper.chat';
const selectedFont=fonts.find(f=>f.id===s.font),fontFamily=s.font==='system'?'"Malgun Gothic",system-ui,sans-serif':'"NHChat-'+s.font+'","Malgun Gothic",system-ui,sans-serif';
const dark=['neon','rpg','chalk','arcane','scifi','tactical','gold','round','blackbox','hud','neonbright'].includes(t.id);
if(s.palette!=='original'&&t.id!=='clear'){const mint=s.palette==='mint';t.accent=dark?(mint?'#a3edce':'#d8b5ff'):(mint?'#3d8a78':'#9364ae');t.bg=dark?(mint?'#162e2b':'#272039'):(mint?'#f0fff8':'#fcf4ff');t.ink=dark?'#f7f5ff':(mint?'#345e52':'#624776');t.line=mint?'#99ccb8':'#ceb0df';}
const rgb=[1,3,5].map(i=>parseInt(t.bg.slice(i,i+2),16)).join(','),bg=`rgba(${rgb},${s.opacity/100})`;
let out=`/* NAMHARU · ${t.name} · 팬더 방송도우미 / OBS 사용자 지정 CSS */\n`;
if(s.font!=='system')out+=`@font-face{font-family:"NHChat-${s.font}";src:url("${fontBase}${s.font}.woff2") format("woff2");font-style:normal;font-weight:${selectedFont.variable?'100 900':'400'};font-display:swap;}\n`;
if(s.notice.trim()){
 const noticeSize=Math.round(s.size*s.noticeScale/100),noticeHeight=Math.max(110,Math.ceil(noticeSize*3.1+40)),noticeSpace=noticeHeight+22;
 const colors={match:[t.bg,t.ink,t.line],pink:['#fff0f6','#853b61','#e6a1bf'],night:['#20243b','#f8f5ff','#8e88b9'],gold:['#242129','#ffedb3','#c9a65f']}[s.noticeSkin];
 const content=JSON.stringify('공지  ·  '+s.notice.trim()).replace(/\\n/g,'\\a ').replace(/\\r/g,'').replace(/</g,'\\3c ').replace(/>/g,'\\3e ');
 out+=`#chat-preview-container{box-sizing:border-box!important;height:calc(100% - ${noticeSpace}px)!important;margin-${s.noticePosition}:${noticeSpace}px!important;overflow:hidden!important;clip-path:inset(0)!important;}
body::before{content:${content};box-sizing:border-box!important;position:fixed!important;${s.noticePosition}:10px!important;left:12px!important;right:12px!important;height:${noticeHeight}px!important;padding:20px 22px!important;border:2px solid ${colors[2]}!important;border-radius:14px!important;background:${colors[0]}!important;color:${colors[1]}!important;font:700 ${noticeSize}px/1.55 ${fontFamily}!important;white-space:pre-wrap!important;overflow:hidden!important;overflow-wrap:anywhere!important;text-align:left!important;text-shadow:none!important;z-index:20!important;pointer-events:none!important;}
`;
}
const rule=(part,body)=>{out+=part.split(',').map(x=>q+x).join(',')+'{'+body.split(';').filter(Boolean).map(x=>x+'!important').join(';')+';}\n';};
rule('',`box-sizing:border-box;position:relative;display:block;list-style:none;width:fit-content;min-width:140px;max-width:calc(100% - 32px);margin:${Math.round(s.gap/2)}px 16px;padding:13px 18px;overflow:visible;text-align:left;text-indent:0;background:${bg};color:${t.ink};border:1.5px solid ${t.line};border-radius:18px;box-shadow:0 3px 0 ${t.line}55;font:${s.size}px/1.5 ${fontFamily}`);
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
const art=svg=>'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
if(t.id==='halloween'){
const web=art(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42"><g fill="none" stroke="${t.line}" stroke-width="1"><path d="M0 0L40 0M0 0L36 17M0 0L28 29M0 0L15 38M0 0L0 42M10 0Q8 5 9 9Q4 8 0 12M20 0Q17 9 18 18Q10 16 0 24M30 0Q25 14 27 27Q14 24 0 36"/></g></svg>`);
const bat=art(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 46"><path d="M21 24Q7 12 2 28L7 37L14 34L22 41M37 24Q51 12 56 28L51 37L44 34L36 41" fill="#b5a0d6" stroke="#695385" stroke-width="1.5"/><path d="M20 19L20 8L28 15L38 8L38 21Q46 27 38 37Q29 45 20 36Q13 27 20 19" fill="#c9b2dd" stroke="#695385" stroke-width="1.5"/><circle cx="23" cy="26" r="2" fill="#493851"/><circle cx="35" cy="26" r="2" fill="#493851"/><path d="M26 32q3 3 6 0" fill="none" stroke="#695385"/><ellipse cx="18" cy="30" rx="3" ry="2" fill="#edb7ce"/><ellipse cx="39" cy="30" rx="3" ry="2" fill="#edb7ce"/></svg>`);
rule('',`border:3px solid ${t.line};border-radius:16px;padding:15px 22px 18px 43px;background:${web} left top/34px 34px no-repeat,${web} right bottom/30px 30px no-repeat,#faf4ff;box-shadow:inset 0 0 0 2px #d4c4e4,0 4px 0 ${t.line}88`);
rule(' .message__nick','margin-top:-29px;margin-bottom:10px;margin-left:-14px');rule(' .chat__nick-group',`border:2px solid ${t.line};border-radius:18px;background:${t.accent};padding:3px 11px;box-shadow:inset 0 1px 0 #ffffff66`);rule(' .message__name, .message__name *','color:white');
rule('::after',`content:"";position:absolute;left:-7px;bottom:-6px;width:49px;height:39px;background:${bat} center/contain no-repeat`);
}
if(t.id==='halloween'){
const pumpkin=art(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 44"><path d="M23 11q-3-6 2-9" fill="none" stroke="#756249" stroke-width="3"/><path d="M23 11C1 5-1 37 13 39Q23 44 33 39C47 37 47 5 23 11" fill="#f2b47e" stroke="#b5785b" stroke-width="2"/><ellipse cx="17" cy="24" rx="2" ry="3" fill="#65434b"/><ellipse cx="29" cy="24" rx="2" ry="3" fill="#65434b"/><path d="M20 32q4 4 8-1" fill="none" stroke="#65434b" stroke-width="2"/></svg>`);
rule(':nth-child(even)','border-color:#b87960;background-color:#fff4e9;box-shadow:inset 0 0 0 2px #e8c7b3,0 4px 0 #ad796688');rule(':nth-child(even) .chat__nick-group','background:#e5a875;border-color:#a87560');rule(':nth-child(even) .message__name, :nth-child(even) .message__name *','color:#533d4c');rule(':nth-child(even)::after',`background-image:${pumpkin};width:37px;height:37px;left:0`);
}
if(t.id==='heartpop'){
rule('',`padding:32px 9px 10px;border:3px solid ${t.line};border-radius:15px;background:linear-gradient(120deg,#fff4,transparent 60%),${bg};box-shadow:inset 0 0 0 2px #d26fae,0 3px 0 #a34e8a66`);
rule('::before',`content:"♡";position:absolute;right:9px;top:1px;color:#fff6fa;font:24px/26px Georgia;text-shadow:1px 1px 0 #c971a5`);
rule('::after','content:"♡  LOVE CHAT";position:absolute;left:11px;top:7px;color:#fff8fc;font:10px/15px monospace;letter-spacing:1px');
rule(' .message__box','background:linear-gradient(135deg,#e6fbff,#bfefff);border:2px solid #fff5fc;border-radius:9px;padding:10px 13px;box-shadow:inset 0 0 0 1px #8ccadd');
rule(' .message__nick','margin-top:-20px;margin-bottom:7px');rule(' .chat__nick-group','background:#f5fdff;border:1px solid #9dc7db;border-radius:5px;padding:2px 7px');
rule(' .message__name, .message__name *','color:#45839f');rule(' .message__text, .message__text *','color:#325c76');
}
if(t.id==='winter'){
const snow=art(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 35" preserveAspectRatio="none"><path d="M0 21Q10 7 23 14Q35 0 48 10Q60 5 73 12Q89 1 105 10Q119 3 133 10Q150 0 164 10Q182 4 198 12Q212 2 228 10Q241 4 254 13Q276 2 300 18L300 28Q288 18 279 27Q270 34 265 23Q245 30 237 22Q216 30 206 24Q185 31 175 22Q159 27 149 23Q123 31 112 22Q90 32 81 22Q65 30 53 22Q28 31 20 23Q9 30 0 26Z" fill="#fff" stroke="#bfe4f8" stroke-width="1.4"/></svg>`);
rule('',`padding:17px 13px 14px;border:5px solid ${t.accent};border-radius:19px;box-shadow:0 0 0 2px #c4efff,inset 0 0 0 2px white,0 5px 0 #488fc066;background:radial-gradient(circle at 90% 80%,#fff 0 2px,transparent 3px),${bg}`);
rule('::before',`content:"";position:absolute;top:-20px;left:-5px;right:-5px;height:35px;background:${snow} center/100% 100% no-repeat`);
rule('::after','content:"❄";position:absolute;right:6px;bottom:1px;color:#6db1d8;font:20px/23px Georgia');
rule(' .message__box','background:#ffffff9c;border-radius:10px;padding:9px 12px;border:1px solid #ffffff');rule(' .message__nick','margin-bottom:7px');rule(' .chat__nick-group',`border-radius:13px;background:${t.accent};padding:3px 9px`);rule(' .message__name, .message__name *','color:white');
}
if(['desktop','retropink'].includes(t.id)){
const pink=t.id==='retropink',frame=pink?'#e696be':'#a9adef',inner=pink?'#f9d2e7':'#d8dcff',ink=pink?'#bb5c90':'#5b55a2',edge=pink?'#c388a9':'#8185c2';
rule('',`padding:0;border:2px solid ${edge};border-radius:5px;background:${frame};box-shadow:inset 0 0 0 2px #ffffff44,0 3px 0 ${edge}55;overflow:hidden`);
rule(' .message__box','padding:0');rule(' .message__nick',`margin:0;padding:5px 9px;border-bottom:1px solid ${edge};background:#ffffff0a`);rule(' .message__name, .message__name *',`color:${ink}`);
rule(' .message__text',`margin:5px;padding:8px 10px;background:${inner};border:2px solid ${edge}bb;border-radius:2px;color:${ink}`);rule(' .message__text *',`color:${ink}`);
rule('::after','content:"";position:absolute;inset:0;background:linear-gradient(128deg,transparent 0 68%,#ffffff3b 68% 78%,transparent 78%);pointer-events:none');
}
if(t.id==='crayon'){
rule('',`padding:13px 18px 14px;border:3px solid ${t.line};border-radius:5px 13px 7px 16px / 13px 5px 15px 6px;background:${bg};box-shadow:2px 1px 0 #fff9,inset 0 0 0 1px ${t.line}66`);
rule('::before',`content:"";position:absolute;inset:3px;border:1px dashed ${t.line}88;border-radius:8px 3px 11px 5px`);
rule(' .message__nick','margin-top:-27px;margin-bottom:10px');rule(' .chat__nick-group',`padding:3px 13px;background:${t.accent};border:2px dotted #f4e5ff;border-radius:5px 9px 3px 7px;transform:rotate(-2deg);box-shadow:1px 2px 0 ${t.line}`);rule(' .message__name, .message__name *','color:#ffffff');
rule('::after',`content:"✎";position:absolute;right:5px;bottom:0;color:${t.accent};font-size:20px`);
}
if(t.id==='chalk'){
rule('',`padding:13px 18px;border:6px solid ${t.line};border-top-color:#b48760;border-bottom-color:#75523d;border-radius:4px;background:repeating-linear-gradient(177deg,transparent 0 13px,#ffffff04 14px 15px),${bg};box-shadow:inset 0 0 12px #071e2477,0 3px 0 #352c2944`);
rule(' .message__nick','border-bottom:1px dashed #dfebcf66;padding-bottom:7px');rule(' .message__text, .message__text *','text-shadow:1px 0 0 #ffffff22;font-weight:500');
rule('::after','content:"";position:absolute;right:17px;bottom:-3px;width:26px;height:4px;border-radius:2px;background:#ffffe4;transform:rotate(-5deg);box-shadow:-34px 0 0 #efc5cf');
}
if(t.id==='arcane'){
rule('',`width:calc(100% - 32px);padding:12px 15px;margin:0 16px;border:0;border-left:5px double ${t.line};border-right:5px double ${t.line};border-radius:0;background:radial-gradient(ellipse at 80% 0,#008e8730,transparent 70%),${bg};box-shadow:inset 0 0 0 2px #17646288`);
rule(':first-child',`margin-top:22px;padding-top:18px;border-top:5px double ${t.line};border-radius:16px 16px 0 0`);rule(':last-child',`padding-bottom:18px;border-bottom:5px double ${t.line};border-radius:0 0 16px 16px`);rule(':only-child',`border:5px double ${t.line};border-radius:16px`);
rule(' .message__box',`padding:8px 10px;border:1px solid ${t.line}88;background:#00000055`);rule(' .message__nick','margin-bottom:2px');rule(' .message__text','font-weight:700');
}
if(t.id==='hanok'){
const roof=art(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 28"><path d="M0 14L180 14V23H0z" fill="#b8a586"/><path d="M0 18Q9 26 18 18Q27 26 36 18Q45 26 54 18Q63 26 72 18Q81 26 90 18Q99 26 108 18Q117 26 126 18Q135 26 144 18Q153 26 162 18Q171 26 180 18V5H0Z" fill="#585950"/><path d="M9 2v16m18-16v16m18-16v16m18-16v16m18-16v16m18-16v16m18-16v16m18-16v16m18-16v16m18-16v16" stroke="#77776a" stroke-width="8" stroke-linecap="round"/></svg>`);
rule('',`padding:20px 16px 13px;border:3px double ${t.line};border-radius:0 0 13px 13px;background:repeating-linear-gradient(90deg,transparent 0 4px,#a68e5710 5px),${bg}`);rule('::before',`content:"";position:absolute;left:-7px;right:-7px;top:-15px;height:28px;background:${roof} left top/180px 28px repeat-x`);rule('::after','content:"❀";position:absolute;right:7px;bottom:3px;color:#cd8e93;font-size:17px');
}
if(['scifi','tactical'].includes(t.id)){
rule('',`padding:14px 16px;border:3px ridge ${t.line};border-radius:5px;background:repeating-linear-gradient(135deg,#ffffff04 0 2px,transparent 2px 6px),${bg};box-shadow:inset 0 0 0 2px #0009,0 2px 0 #0006`);rule(' .message__nick',`border-bottom:1px solid ${t.line};padding-bottom:7px`);rule('::before',`content:"";position:absolute;left:7px;right:7px;top:3px;height:2px;background:linear-gradient(90deg,${t.accent} 0 18%,transparent 18% 82%,${t.accent} 82%)`);
if(t.id==='tactical')rule('',`border-left:6px solid ${t.ink};border-radius:0`);
}
if(t.id==='rainbow'){
rule('','border:3px solid transparent;border-radius:8px;background:linear-gradient(#ffffff,#ffffff) padding-box,linear-gradient(135deg,#e9a77f,#f4df96,#a9d4b4,#91c4e4,#caade7) border-box;box-shadow:0 3px 0 #2228');rule(' .message__nick','border-bottom:1px solid #e1dce9;padding-bottom:6px');
}
if(t.id==='gold'){
rule('',`border:2px solid ${t.line};border-radius:12px 4px;background:${bg};box-shadow:0 0 7px ${t.line}77,inset 0 0 0 3px #ffffff0c`);rule('::before',`content:"✦";position:absolute;left:-8px;top:-12px;font-size:23px;color:${t.accent};text-shadow:0 0 6px ${t.accent}`);rule('::after',`content:"✧";position:absolute;right:-7px;bottom:-12px;font-size:26px;color:${t.accent}`);rule(' .chat__nick-group',`background:${t.accent};padding:2px 8px;border-radius:6px`);rule(' .message__name, .message__name *','color:#393026');
}
if(t.id==='dotted'){
rule('',`border:2px dashed ${t.line};border-radius:6px;background:${bg};box-shadow:0 0 0 3px #fff,inset 0 0 0 2px #eeeeee`);rule(' .message__nick','margin-top:-24px;margin-bottom:8px');rule(' .chat__nick-group','background:#fff;border:1px dotted #9b9ba4;padding:2px 7px;border-radius:3px');
}
if(t.id==='window'){
rule('',`border:2px solid ${t.line};border-radius:0;padding:0;background:${bg};box-shadow:3px 3px 0 #29223755`);rule(' .message__nick',`padding:5px 8px;background:${t.accent};margin:0`);rule(' .message__name, .message__name *','color:white');rule(' .message__text','padding:9px 12px');
}
if(t.id==='messenger'){
rule('',`border:0;border-radius:7px;padding:12px 16px;background:${bg};box-shadow:0 2px 0 #5e5c3c44`);rule(' .message__nick','text-align:right;margin-top:-31px;margin-bottom:16px');rule(' .message__name, .message__name *','color:#fff;text-shadow:0 1px 2px #3c4b60');rule('::after',`content:"";position:absolute;right:-8px;top:10px;border-left:12px solid ${t.bg};border-bottom:12px solid transparent`);
}
if(t.id==='round')rule('',`background:${bg};border:0;border-radius:20px;padding:12px 16px;box-shadow:none`);
if(t.id==='balloon'){
rule('',`background:${bg};border:0;border-radius:9px;padding:12px 16px;box-shadow:0 2px 0 #1112`);rule('::after',`content:"";position:absolute;bottom:-7px;left:15px;border-top:9px solid ${t.bg};border-right:9px solid transparent`);
}
if(['neonbright','neonfill'].includes(t.id)){
rule('',`border:2px solid ${t.line};border-radius:12px;padding:12px 16px;background:${bg};box-shadow:0 0 7px ${t.line},inset 0 0 6px ${t.line}55`);
if(t.id==='neonbright'){
rule(':nth-child(3n+2)','border-color:#f2a0b5;box-shadow:0 0 8px #f7809a,inset 0 0 6px #f7809a55');rule(':nth-child(3n)','border-color:#f5d88a;box-shadow:0 0 8px #ecc45f,inset 0 0 6px #ecc45f55');
}else{rule(':nth-child(3n+2)','background:#38bfc2;border-color:#b5ffff;box-shadow:0 0 7px #68e7e9');rule(':nth-child(3n)','background:#d97da9;border-color:#ffcced;box-shadow:0 0 7px #ef9dcd');}
}
if(['whitebox','blackbox'].includes(t.id)){
rule('',`border:0;border-radius:3px;padding:0;background:${bg};box-shadow:none`);rule(' .message__nick',`padding:6px 10px;margin:0;border-bottom:1px solid ${t.line}`);rule(' .message__text','padding:9px 12px');
}
if(t.id==='leather'){
rule('',`border:4px solid ${t.line};border-radius:10px;padding:16px 19px;background:radial-gradient(#643b191f .7px,transparent 1px) 0 0/4px 4px,${bg};box-shadow:inset 0 2px 5px #633c2144,0 3px 0 #39251c44`);rule('::before',`content:"";position:absolute;inset:4px;border:1px dashed #ffdfb9;border-radius:5px`);rule(' .message__nick','border-bottom:1px dashed #79553666;padding-bottom:6px');
}
if(t.id==='postit'){
rule('',`border:0;border-radius:0;padding:13px 17px 20px;background:${bg};box-shadow:2px 4px 0 #0002`);rule('::after','content:"";position:absolute;right:0;bottom:0;border-top:17px solid #0002;border-right:17px solid #fff8');rule(':nth-child(3n+2)','background:#c8edf1');rule(':nth-child(3n)','background:#f4c9e5');rule(' .message__nick','border-bottom:1px solid #0002;padding-bottom:5px');
}
if(t.id==='food'){
rule('',`border:5px solid ${t.line};border-radius:28px 28px 11px 11px;padding:15px 17px;background:radial-gradient(circle at 15% 70%,#c9934322 0 2px,transparent 3px),${bg};box-shadow:inset 0 0 0 3px #f0ce94,0 3px 0 #966b3e66`);rule(' .chat__nick-group','background:#f9d56d;border:1px solid #d6aa50;border-radius:5px;padding:2px 8px;box-shadow:1px 2px 0 #bf8c3b33');
}
if(t.id==='hud'){
rule('',`border:1px solid ${t.line};border-left:5px solid ${t.accent};border-radius:2px 12px 2px 12px;padding:13px 18px;background:linear-gradient(120deg,#fff1,transparent),${bg};box-shadow:0 0 5px #73c9f055;transform:skew(-4deg)`);rule(' .message__box','transform:skew(4deg)');rule(' .message__text','font-style:italic;font-weight:700');rule('::after',`content:"///";position:absolute;right:6px;top:2px;font:10px monospace;color:${t.accent}`);
}
if(t.id==='danmaku'){
rule('','background:none;border:0;padding:0;box-shadow:none;white-space:nowrap;max-width:none;min-width:0;animation:namharu-danmaku 12s linear infinite');rule(' .message__nick, .message__text','display:inline');rule(' .message__text, .message__text *','white-space:nowrap;text-shadow:0 1px 3px black');rule(' .message__name, .message__name *','text-shadow:0 1px 3px black');out+='@keyframes namharu-danmaku{from{transform:translateX(420px)}to{transform:translateX(-100%)}}@media(prefers-reduced-motion:reduce){'+q+'{animation:none!important}}';
}
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
if(['halloween','crayon','snow','rpg','winter','dotted','messenger'].includes(t.id))rule('',`margin-top:${Math.max(23,s.gap)}px`);
if(s.font!=='system'){
rule(' .message__name, .message__name *, .message__text, .message__text *',`font-family:${fontFamily}`);
if(!selectedFont.variable)rule(' .message__name, .message__name *, .message__text, .message__text *','font-weight:400');
}
return out;}
return{themes,fonts,normalize,css};})();
