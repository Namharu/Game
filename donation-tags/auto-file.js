(() => {
 'use strict';
 class AutoFile {
  constructor({bundle,report}){this.bundle=bundle;this.report=report;this.handle=null;this.queue=Promise.resolve();this.pending=0;}
  write(config,source){
   const handle=this.handle;if(!handle)return Promise.resolve();
   const snapshot=JSON.parse(JSON.stringify(config));this.pending++;this.report('HTML 자동 저장 중… 창을 닫지 마세요.');
   const job=this.queue.then(async()=>{
    if(await handle.queryPermission({mode:'readwrite'})!=='granted')throw Error('파일 쓰기 권한이 필요합니다. 자동 저장 연결 버튼을 눌러 주세요.');
    const html=await this.bundle(snapshot,source);const stream=await handle.createWritable();
    try{await stream.write(html);await stream.close();}catch(error){try{await stream.abort();}catch{}throw error;}
   });
   this.queue=job.catch(()=>{});
   return job.then(()=>{if(--this.pending===0)this.report('자동 저장 완료 · '+handle.name+' · OBS 소스를 새로고침하세요.');},error=>{this.pending--;this.report('자동 저장 실패 · '+error.message);});
  }
 }
 globalThis.DonationAutoFile=AutoFile;
})();
