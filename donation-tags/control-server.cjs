const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function createServer({root=path.resolve(__dirname,'..'),settingsPath=path.join(__dirname,'.local-control.json'),initial={}}={}){
 let saved={};try{saved=JSON.parse(fs.readFileSync(settingsPath,'utf8'));}catch{}let settings={...initial,...saved};settings.token ||= crypto.randomBytes(32).toString('hex');
 const persist=()=>fs.writeFileSync(settingsPath,JSON.stringify(settings));persist();let state={version:0,width:1920,height:1080,nodes:[]},lastSeen=0,lastDigest="",owner="";
 const server=http.createServer(async(req,res)=>{const origin='http://'+req.headers.host;const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(!/^(127\.0\.0\.1|localhost):\d+$/.test(req.headers.host||''))return json(403,{error:'host'});
 const url=new URL(req.url,origin);if(req.headers.origin&&req.headers.origin!==origin)return json(403,{error:'origin'});
 if(url.pathname.startsWith('/__donation/')){
  if(url.pathname==='/__donation/session'&&req.method==='GET')return json(200,{token:settings.token,config:settings.config,source:settings.source||''});
  if(req.headers.authorization!=='Bearer '+settings.token)return json(403,{error:'token'});
  if(req.method==='GET'&&url.pathname==='/__donation/state')return json(200,url.searchParams.get('since')===String(state.version)?{version:state.version}:{...state});
  if(req.method==='POST'&&url.pathname==='/__donation/claim'){owner=String(req.headers['x-controller']||'');return json(200,{ok:true});}
  if(req.method==='POST'&&owner&&req.headers['x-controller']!==owner)return json(409,{error:'another controller'});
  if(req.method==='POST'){try{let chunks=[],length=0;for await(const chunk of req){length+=chunk.length;if(length>100*1024*1024)throw Error('size');chunks.push(chunk);}const data=JSON.parse(Buffer.concat(chunks).toString());
   if(url.pathname==='/__donation/state'){if(!Array.isArray(data.nodes)||!Number.isFinite(data.width)||!Number.isFinite(data.height)||data.width<1||data.height<1)throw Error('state');const digest=crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");if(digest!==lastDigest){state={nodes:data.nodes,width:data.width,height:data.height,version:state.version+1};lastDigest=digest;}lastSeen=Date.now();return json(200,{ok:true});}
   if(url.pathname==='/__donation/settings'){settings.config=data.config;settings.source=String(data.source||'');persist();return json(200,{ok:true});}
  }catch{return json(400,{error:'invalid request'});}}
  return json(404,{error:'not found'});
 }
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return json(400,{});}const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep)||path.relative(root,file).split(path.sep).some(p=>p.startsWith('.')))return json(403,{});
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};if(!types[path.extname(file)])return json(403,{});
 fs.readFile(file,(err,data)=>{if(err)return json(404,{});res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});res.end(data);});
 });
 // Live records are RAM only and disappear when the controller is absent for 30 seconds.
 const timer=setInterval(()=>{if(lastSeen&&Date.now()-lastSeen>30000){state={...state,nodes:[],version:state.version+1};lastSeen=0;lastDigest="";}},5000);timer.unref();server.on('close',()=>clearInterval(timer));return server;
}
if(require.main===module){let initial={};const arg=process.argv.indexOf('--import');if(arg>=0){const text=fs.readFileSync(process.argv[arg+1],'utf8');const match=text.match(/globalThis\.DonationTagBundle=([\s\S]*?);<\/script>/);if(match){const b=JSON.parse(match[1]);initial={config:b.config,source:b.source};}}
 const server=createServer({initial});server.listen(8880,'127.0.0.1',()=>console.log('Donation control ready at http://127.0.0.1:8880/donation-tags/'));server.on('error',e=>{console.error(e.code);process.exitCode=1;});}
module.exports={createServer};
