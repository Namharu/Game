const assert=require('node:assert/strict');require('./core.js');require('./placement.js');
const D=DonationTags,P=DonationPlacement,board=new D.Board(),config=D.normalize({mode:'all'});
board.add({name:'A',count:100},config);board.add({name:'A',count:1000},config);board.add({name:'B',count:100},config);
assert.equal(P.groups(board,'manual').length,3);assert.equal(P.groups(board,'right').length,2);assert.equal(P.groups(board,'largest')[0][1].length,2);
const area={width:800,height:600},other={x:200,y:100,width:100,height:100};
const aligned=P.snap({x:204,y:300,width:100,height:100},area,[other]);assert.equal(aligned.x,200);assert(aligned.guides.length);
assert.equal(P.snap({x:204,y:301,width:100,height:100},area,[other],false).x,204);
assert.deepEqual(P.snap({x:-100,y:900,width:100,height:100},area,[],false),{x:0,y:500,guides:[]});
const positions=D.normalize({positions:{'m:1':{x:.25,y:.5},'g:nick:A':{x:2,y:-1},bad:{x:1,y:1},'m:2':{x:NaN,y:0}}}).positions;
assert.deepEqual(positions,{'m:1':{x:.25,y:.5},'g:nick:A':{x:1,y:0}});
assert.equal(D.normalize({stackDirection:'manual'}).stackDirection,'manual');
console.log('PASS individual/group identity, edge snapping, bypass, bounds and coordinate-only persistence');
const scaled=D.normalize({positions:{'m:1':{x:.2,y:.3,scale:.75},'g:nick:A':{x:0,y:0,scale:99}}}).positions;assert.equal(scaled['m:1'].scale,.75);assert.equal(scaled['g:nick:A'].scale,3);console.log('PASS per-card and group resize persistence');

assert.equal(D.normalize().outputWidth,1920);assert.equal(D.normalize().outputHeight,1080);assert.equal(D.normalize({outputWidth:1000}).outputWidth,1000);
for(const zoom of [.25,.5,1]){const controller=Object.create(P.Controller.prototype);controller.root={dataset:{viewScale:String(zoom)},clientWidth:984,clientHeight:1064};let stored;controller.commit=(key,value)=>stored=value;const el={dataset:{placeKey:'m:1',userScale:'1'},style:{left:'392px',top:'432px'},getBoundingClientRect:()=>({left:0,top:0,right:200*zoom,bottom:200*zoom,width:200*zoom,height:200*zoom})};controller.store(el);assert.equal(stored.x,.5);assert.equal(stored.y,.5);}
console.log('PASS preview scaling preserves OBS coordinates and configured resolution');
