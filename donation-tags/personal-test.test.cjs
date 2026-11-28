const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
require('./local-images.js');require('./auto-file.js');
const testCode='/* Local development only. This file is excluded from GitHub. */\nglobalThis.LocalDonationTest = () => {};';
global.fetch=async p=>({ok:true,text:async()=>p==='local-test.js'?testCode:fs.readFileSync(path.join(__dirname,p),'utf8')});
(async()=>{
 global.location={hostname:'localhost'};
 let saved=await DonationLocal.bundle({min:100},'');
 assert(saved.includes(testCode));
 global.location={hostname:'namharu.github.io'};
 const publicHtml=await DonationLocal.bundle({},'');assert(!publicHtml.includes(testCode));
 const messages=[];
 const writer=new DonationAutoFile({bundle:DonationLocal.bundle,report:m=>messages.push(m)});
 writer.handle={name:'personal.html',queryPermission:async()=> 'granted',getFile:async()=>({text:async()=>saved}),createWritable:async()=>({write:async s=>{saved=s;},close:async()=>{}})};
 for(const min of [200,300]){await writer.write({min},'');assert(saved.includes(testCode));assert(saved.includes('"localTesting":true'));assert(saved.includes('"min":'+min));}
 for(const m of saved.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 assert(!messages.some(m=>m.includes('실패')));
 console.log('PASS public export excludes tests; personal tests survive repeated public-origin automatic saves');
})().catch(e=>{console.error(e);process.exitCode=1;});
