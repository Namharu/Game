(() => {
 'use strict';
 const clamp=(n,max)=>Math.max(0,Math.min(Math.max(0,max),n));
 function snap(rect,area,others=[],enabled=true){
  let x=clamp(rect.x,area.width-rect.width),y=clamp(rect.y,area.height-rect.height);const guides=[];
  if(enabled){for(const axis of ['x','y']){const dim=axis==='x'?'width':'height',length=rect[dim],limit=area[dim];let pos=axis==='x'?x:y;
   const targets=[0,limit/2,limit];for(const r of others)targets.push(r[axis],r[axis]+r[dim]/2,r[axis]+r[dim]);
   let best=null;for(const edge of [0,length/2,length])for(const target of targets){const value=target-edge,delta=Math.abs(value-pos);if(value>=0&&value<=limit-length&&delta<=8&&(!best||delta<best.delta))best={value,delta,target};}
   // Also offer a consistent 8px gap between neighbours.
   for(const r of others)for(const value of [r[axis]+r[dim]+8,r[axis]-length-8]){const delta=Math.abs(value-pos);if(value>=0&&value<=limit-length&&delta<=8&&(!best||delta<best.delta))best={value,delta,target:value};}
   if(best){pos=best.value;guides.push({axis,at:best.target});}else{const grid=Math.round(pos/10)*10;if(Math.abs(grid-pos)<=3)pos=clamp(grid,limit-length);}
   if(axis==='x')x=pos;else y=pos;
  }}return {x,y,guides};
 }
 function groups(board,mode){return mode==='manual'?[...board.groups.values()].flat().sort((a,b)=>a.serial-b.serial).map(d=>['m:'+d.serial,[d]]):[...board.groups].map(([key,items])=>['g:'+key,items]);}
 class Controller{
  constructor(root,{commit,changed}){this.root=root;this.commit=commit;this.changed=changed;this.selected=null;this.dragging=false;
   root.addEventListener('pointerdown',e=>{const el=e.target.closest('.group');if(!el||e.button!==0||e.target.closest('button,input,select'))return;e.preventDefault();this.select(el);const r=el.getBoundingClientRect();this.dragging=true;this.drag={el,key:el.dataset.placeKey,id:e.pointerId,x:e.clientX,y:e.clientY,startX:parseFloat(el.style.left)||0,startY:parseFloat(el.style.top)||0,width:r.width,height:r.height};root.setPointerCapture(e.pointerId);});
   root.addEventListener('pointermove',e=>{if(!this.drag||e.pointerId!==this.drag.id)return;const d=this.drag;this.move(d.el,{x:d.startX+e.clientX-d.x,y:d.startY+e.clientY-d.y,width:d.width,height:d.height},!e.altKey);});
   const end=e=>{if(!this.drag||e.pointerId!==this.drag.id)return;const d=this.drag;this.drag=null;this.dragging=false;if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);this.clearGuides();if(e.type==='pointercancel'){d.el.style.left=d.startX+'px';d.el.style.top=d.startY+'px';this.changed();}else this.store(d.el);};root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
   root.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||e.target.closest('input,textarea,select,button'))return;const el=e.target.closest('.group');if(!el)return;e.preventDefault();const step=e.shiftKey?10:1,r=el.getBoundingClientRect();this.move(el,{x:parseFloat(el.style.left)+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),y:parseFloat(el.style.top)+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0),width:r.width,height:r.height},false);this.store(el);});
   root.addEventListener('dragstart',e=>e.preventDefault());
  }
  select(el){this.selected=el.dataset.placeKey;this.restore();el.focus({preventScroll:true});}
  restore(){for(const el of this.root.querySelectorAll('.group'))el.classList.toggle('placement-selected',el.dataset.placeKey===this.selected);}
  clearGuides(){for(const el of this.root.querySelectorAll('.snap-guide'))el.remove();}
  move(el,rect,enabled){const area={width:this.root.clientWidth,height:this.root.clientHeight},base=this.root.getBoundingClientRect();const others=[...this.root.querySelectorAll('.group')].filter(g=>g!==el).map(g=>{const r=g.getBoundingClientRect();return {x:r.left-base.left,y:r.top-base.top,width:r.width,height:r.height};});const p=snap(rect,area,others,enabled);el.style.left=p.x+'px';el.style.top=p.y+'px';this.clearGuides();for(const guide of p.guides){const line=document.createElement('i');line.className='snap-guide '+guide.axis;line.style[guide.axis==='x'?'left':'top']=guide.at+'px';this.root.append(line);}}
  store(el){const r=el.getBoundingClientRect(),x=parseFloat(el.style.left)||0,y=parseFloat(el.style.top)||0;this.commit(el.dataset.placeKey,{x:x/Math.max(1,this.root.clientWidth-r.width),y:y/Math.max(1,this.root.clientHeight-r.height)});}
 }
 globalThis.DonationPlacement={snap,groups,Controller};
})();
