/* Static signature selection follows the helper's image priority. No private keys stored. */
(() => {
 'use strict';
 const object=v=>{try{return typeof v==='string'?JSON.parse(v):v;}catch{return null;}};
 function donation(p){const d=p?.data;let m=object(d?.message);if(!m)return null;const test=d.type==='helper'&&m.name==='HelperAddSpon';if(test)m=object(m.message);else if(!['SponCoin','ItemCoin'].includes(d.type))return null;
  const count=Number(m?.coin);if(!Number.isSafeInteger(count)||count<=0||typeof m.nick!=='string'||!m.nick.trim())return null;
  return {id:m.id!=null?String(m.id):'',name:m.nick.slice(0,100),count,image:url(m.heart?.image),test};
 }
 function url(s){try{const u=new URL(s);return u.protocol==='https:'?u.href:'';}catch{return '';}}
 function customImage(s){return typeof s==='string'&&s.length<=28000000&&/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(s)?s:url(s);}
 function signature(count,h){return url(h?.oneBj?.[count]?.image||h?.one?.[count]?.image||h?.onceCoin?.[count]?.image||h?.rangeBj?.image||h?.range?.[count]?.image||h?.defaultBj?.image||h?.default?.image);}
 function normalize(c={}){const num=(v,d,min,max)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):d;const sizePercent=num(c.sizePercent,c.width===undefined?100:Number(c.width)/180*100,10,250);return {sizePercent,groupDirection:'down',stackDirection:c.stackDirection==='manual'?'manual':['down','largest'].includes(c.stackDirection)?'largest':'right',positions:Object.fromEntries(Object.entries(c.positions&&typeof c.positions==='object'?c.positions:{}).filter(([key,p])=>/^(m:|g:)/.test(key)&&p&&Number.isFinite(p.x)&&Number.isFinite(p.y)).map(([key,p])=>[key,{x:num(p.x,0,0,1),y:num(p.y,0,0,1)}])),testName:String(c.testName||'남하루').trim().slice(0,100)||'남하루',testCount:Math.floor(num(c.testCount,100,1,1e9)),mode:['all','min','exact','both','either'].includes(c.mode)?c.mode:'min',min:num(c.min,100,1,1e9),exact:String(c.exact||'100,282,704').slice(0,1000),width:180*sizePercent/100,minScale:num(c.minScale,60,20,100),seconds:num(c.seconds,0,0,86400),overlap:true,custom:Array.isArray(c.custom)?c.custom.filter(x=>x&&typeof x.key==='string'&&customImage(x.image)).slice(0,100).map(x=>({key:x.key.slice(0,100),image:customImage(x.image)})):[]};}
 function displayItems(items,direction){return direction==='largest'?[...items].sort((a,b)=>b.count-a.count||a.serial-b.serial):items;}
 function localTest(c){return {id:'',name:c.testName,count:c.testCount,image:'',test:true,localTest:true};}
 function clearTests(board){for(const [key,items] of board.groups){const kept=items.filter(d=>!d.localTest);if(kept.length)board.groups.set(key,kept);else board.groups.delete(key);}}
 function accepts(d,c){const hit=c.exact.split(/[,\s]+/).map(Number).includes(d.count),min=d.count>=c.min;return c.mode==='all'||c.mode==='min'&&min||c.mode==='exact'&&hit||c.mode==='both'&&min&&hit||c.mode==='either'&&(min||hit);}
 class Board{constructor(){this.groups=new Map();this.serial=0;}add(d,c,now=Date.now()){if(!accepts(d,c))return false;const key='nick:'+d.name;const group=this.groups.get(key)||[];group.push({...d,at:now,serial:++this.serial});this.groups.set(key,group);return true;}prune(c,now=Date.now()){if(!c.seconds)return;for(const [k,g] of this.groups){const kept=g.filter(d=>now-d.at<c.seconds*1000);if(kept.length)this.groups.set(k,kept);else this.groups.delete(k);}}}
 globalThis.DonationTags={donation,signature,url,customImage,normalize,displayItems,accepts,Board,localTest,clearTests};
})();
