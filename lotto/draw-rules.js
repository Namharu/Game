export function parseSettings(countText, winningText){
 const count=Number(countText);
 if(!Number.isInteger(count)||count<1||count>45)throw Error('뽑을 공 개수는 1~45개로 입력하세요.');
 const tokens=winningText.trim().split(/[\s,，]+/).filter(Boolean);
 if(!tokens.length||tokens.some(n=>!/^\d+$/.test(n)||+n<1||+n>45))throw Error('당첨번호는 1~45 사이 숫자를 쉼표나 공백으로 구분해 주세요.');
 return {count,winning:new Set(tokens.map(Number))};
}
export function drawOrder(count,random=Math.random){
 const pool=Array.from({length:45},(_,i)=>i+1);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,count);
}
