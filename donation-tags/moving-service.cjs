const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
require('../moving-chat/engine.js');
function createMovingService({settingsPath,outputFile='',source='',token}){
 let saved={};try{saved=JSON.parse(fs.readFileSync(settingsPath,'utf8'));}catch{}
 let config=AvatarGarden.normalize(saved.config),custom=Array.isArray(saved.custom)?saved.custom:[],initialized=!!saved.initialized;
 let currentSource=typeof saved.source==='string'?saved.source:source,revision=1,serial=0,events=[],status='채팅 주소를 연결하세요.';
 const epoch=crypto.randomUUID();
 const emit=e=>{events.push({...e,serial:++serial});if(events.length>200)events.shift();};
 const connection=new PandaChat.Connection({onStatus:s=>{status=s.text;},onChat:m=>{if(!/^!(공지|타이머|시간|방송시간)(?:\s|$)/.test(m.text))emit({type:'chat',name:m.name,text:m.text,emotion:'base',id:m.id});}});
 const persist=()=>{fs.writeFileSync(settingsPath,JSON.stringify({initialized,config,custom,source:currentSource}));if(outputFile)fs.writeFileSync(outputFile,'<!doctype html><meta charset="utf-8"><title>캐릭터 방송 출력</title><style>html,body{margin:0;background:transparent}</style><script>location.replace("http://127.0.0.1:8880/moving-chat/output.html#'+token+'");</script>');};
 persist();if(currentSource)connection.connect(currentSource);
 const validateLibrary=value=>{if(!Array.isArray(value)||value.length>20)throw Error('custom');const ids=new Set();return value.map(a=>{if(!a||!/^custom-[\w-]{1,100}$/.test(a.id)||ids.has(a.id)||typeof a.name!=='string')throw Error('avatar');ids.add(a.id);const images={};for(const k of ['base','idle','happy','sad','angry'])if(a.images?.[k]){const image=a.images[k];if(typeof image!=='string'||image.length>6000000||!/^data:image\/(png|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image))throw Error('image');images[k]=image;}if(!images.base)throw Error('base');return {id:a.id,name:a.name.slice(0,100),flip:!!a.flip,images};});};
 async function handle(req,res,url){const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  if(req.headers.authorization!=='Bearer '+token)return json(403,{error:'token'});
  if(req.method==='GET'&&url.pathname==='/__moving/model'){const changed=Number(url.searchParams.get('since'))!==revision;return json(200,{revision,epoch,serial,status,events:events.filter(e=>e.serial>Number(url.searchParams.get('after')||0)),...(changed?{initialized,config,custom,source:currentSource,outputFile}: {})});}
  if(req.method!=='POST')return json(404,{error:'not found'});
  try{let chunks=[],length=0;for await(const chunk of req){length+=chunk.length;if(length>90*1024*1024)throw Error('size');chunks.push(chunk);}const data=JSON.parse(Buffer.concat(chunks));
   if(url.pathname==='/__moving/settings'){const nextCustom=validateLibrary(data.custom),nextSource=String(data.source||'');if(nextSource)PandaChat.keyFromUrl(nextSource);config=AvatarGarden.normalize(data.config);custom=nextCustom;initialized=true;const reconnect=nextSource!==currentSource;currentSource=nextSource;persist();revision++;if(reconnect){connection.disconnect(true);if(currentSource)connection.connect(currentSource);else status='연결 해제 · 테스트만 표시';}return json(200,{ok:true,revision});}
   if(url.pathname==='/__moving/command'){if(data.type==='test'){if(typeof data.name!=='string'||!data.name.trim()||typeof data.text!=='string'||!data.text.trim())throw Error('test');emit({type:'chat',name:data.name.trim().slice(0,100),text:data.text.slice(0,200),emotion:['base','idle','happy','sad','angry'].includes(data.emotion)?data.emotion:'base',id:'test:'+data.name.trim().slice(0,100),test:true});}else if(['clearTests','jump','pause'].includes(data.type))emit({type:data.type,paused:!!data.paused});else throw Error('command');return json(200,{ok:true});}
   return json(404,{error:'not found'});
  }catch{return json(400,{error:'잘못된 설정 또는 이미지입니다.'});}
 }
 return {handle,close:()=>connection.disconnect(true)};
}
module.exports={createMovingService};
