/* Read-only broadcast start time from Panda helper; no local clock guess. */
(() => {
 class PandaBroadcast {
  constructor(onData){this.onData=onData;this.generation=0;}
  stop(){this.generation++;clearTimeout(this.timer);this.abort?.abort();}
  async start(source){this.stop();const generation=this.generation;let userIdx;
   const get=async(path,params)=>{const u=new URL('https://api.pandahp.kr/'+path);u.search=new URLSearchParams(params);const abort=new AbortController();this.abort=abort;const timeout=setTimeout(()=>abort.abort(),10000);try{const r=await fetch(u,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:abort.signal});if(!r.ok)throw Error();return await r.json();}finally{clearTimeout(timeout);}};
   const poll=async()=>{try{if(!userIdx){const preset=await get('preset/secret',{key:PandaChat.keyFromUrl(source)});userIdx=preset.userIdx;if(!userIdx)throw Error();}if(generation!==this.generation)return;const data=await get('on-air/secret',{userIdx});if(generation!==this.generation)return;const at=Date.now(),start=Date.parse(data.startTime);if(data.isOnAir&&(!Number.isFinite(start)||start>at))throw Error();this.onData({active:!!data.isOnAir,duration:data.isOnAir?at-start:0,at,ttl:30000});}catch{if(generation===this.generation)this.onData(null);}finally{if(generation===this.generation)this.timer=setTimeout(poll,10000);}};
   await poll();
  }
 }
 window.PandaBroadcast=PandaBroadcast;
})();