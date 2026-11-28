const assert=require('node:assert/strict');require('./auto-file.js');
(async()=>{
 const writes=[],messages=[];let active=0,maxActive=0,permission='granted';
 const handle={name:'test.html',queryPermission:async()=>permission,createWritable:async()=>{maxActive=Math.max(maxActive,++active);return {write:async html=>writes.push(html),close:async()=>{active--;},abort:async()=>{active--;}};}};
 const writer=new DonationAutoFile({bundle:async(c,s)=>JSON.stringify({c,s}),report:s=>messages.push(s)});writer.handle=handle;
 const config={custom:[{key:'A',image:'original'}]};const first=writer.write(config,'test-source');config.custom.push({key:'B',image:'second'});const second=writer.write(config,'test-source');await Promise.all([first,second]);
 assert.equal(maxActive,1);assert.equal(JSON.parse(writes[0]).c.custom.length,1);assert.equal(JSON.parse(writes[1]).c.custom.length,2);assert.equal(writer.pending,0);
 permission='prompt';await writer.write(config,'test-source');assert.equal(writes.length,2);assert(messages.at(-1).includes('실패'));
 permission='granted';await writer.write(config,'test-source');assert.equal(writes.length,3);assert(messages.at(-1).includes('완료'));
 console.log('PASS sequential atomic saves, cumulative snapshots, denied permission and recovery');
})().catch(e=>{console.error(e);process.exitCode=1;});
