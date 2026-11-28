(() => {
 'use strict';
 // Place whole nickname groups; fill down first, then available space to the right.
 function pack(sizes,width,height,scale,gap=12){const placed=[];let x=0,y=0,columnWidth=0;for(const size of sizes){const w=size.width*scale,h=size.height*scale;if(y>0&&y+h>height+.01){x+=columnWidth+gap;y=0;columnWidth=0;}if(x+w>width+.01||y+h>height+.01)return null;placed.push({x,y,width:w,height:h});columnWidth=Math.max(columnWidth,w);y+=h+gap;}return placed;}
 function layout(sizes,width,height,minScale=.6,direction="down"){if(direction==="right"){const result=layout(sizes.map(s=>({width:s.height,height:s.width})),height,width,minScale,"down");return {...result,positions:result.positions.map(p=>({x:p.y,y:p.x,width:p.height,height:p.width}))};}width=Math.max(1,width);height=Math.max(1,height);if(!sizes.length)return {scale:1,positions:[],extraShrink:false};const gap=12;const full=pack(sizes,width,height,1,gap);if(full)return {scale:1,positions:full,extraShrink:false};let low=0,high=1,best=[];for(let i=0;i<32;i++){const scale=(low+high)/2,p=pack(sizes,width,height,scale,gap*scale);if(p){low=scale;best=p;}else high=scale;}return {scale:low,positions:best,extraShrink:low<minScale};}

 function columns(sizes,height,gap=4){let x=0,y=0,columnWidth=0,bottom=0;const positions=[];for(const size of sizes){if(y>0&&y+size.height>height){x+=columnWidth+gap;y=0;columnWidth=0;}positions.push({x,y,width:size.width,height:size.height});columnWidth=Math.max(columnWidth,size.width);bottom=Math.max(bottom,y+size.height);y+=size.height+gap;}return {positions,width:x+columnWidth,height:bottom};}
 globalThis.DonationLayout={layout,pack,columns};
})();
