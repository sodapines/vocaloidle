const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../cover-reveal/core.js');
const pool=require('../cover-reveal/pool.json');
const art=require('../result-art.js');
test('daily selection is stable across every date in its first pool cycle',()=>{
  const ids=new Set();for(let i=0;i<pool.length;i++){const key=new Date((C.dayNumber(C.EPOCH)+i)*86400000).toISOString().slice(0,10);const a=C.dailySong(pool,key);assert.equal(a,C.dailySong(pool,key));ids.add(a.vocadbId);}assert.equal(ids.size,pool.length);assert.equal(C.dailySong(pool,'2026-09-05'),null);assert.equal(C.dailySong(pool,'2026-02-30'),null);
});
test('six skips reveal the answer, stop accepting guesses, and survive reload',()=>{
  const song=pool[0];let r=C.newRound(song,C.EPOCH);let prev=0;
  for(let i=0;i<6;i++){assert.ok(C.crop(r).size>prev);prev=C.crop(r).size;r=C.submit(r,null,true);}assert.equal(r.done,true);assert.equal(r.win,false);assert.equal(C.crop(r).size,100);assert.equal(C.submit(r,song.vocadbId),r);assert.deepEqual(C.restore(r,song,C.EPOCH,'daily').guesses,r.guesses);assert.equal(C.marks(r),'🖼️ ⬛⬛⬛⬛⬛⬛');
});
test('correct answers finish at the current stage and duplicate wrong songs cost no reveal',()=>{
 let r=C.newRound(pool[0],C.EPOCH);r=C.submit(r,pool[1].vocadbId);assert.equal(C.submit(r,pool[1].vocadbId),r);r=C.submit(r,pool[0].vocadbId);assert.equal(r.win,true);assert.equal(r.guesses.length,2);assert.match(C.share(r),/🟥🟩⬜⬜⬜⬜/);assert.doesNotMatch(C.share(r),new RegExp(pool[0].vocadbId));assert.equal(art.marks('cover',r),C.marks(r));
});
test('saved results are revalidated rather than trusting completion flags',()=>{
 const song=pool[0],r=C.newRound(song,C.EPOCH);const restored=C.restore({...r,done:true,win:true},song,C.EPOCH,'daily');assert.equal(restored.done,false);assert.equal(C.restore({...r,songId:'bad'},song,C.EPOCH,'daily'),null);assert.equal(C.restore({...r,guesses:Array(7).fill({skipped:true})},song,C.EPOCH,'daily'),null);
});
test('crop expands monotonically around the same focal point in both difficulties',()=>{
 for(const difficulty of ['normal','easy']){let r=C.newRound(pool[10],C.EPOCH,'unlimited',difficulty);let before=null;for(let i=0;i<6;i++){const crop=C.crop(r).inset.split(' ').map(parseFloat);assert.ok(crop.every(n=>n>=0));if(before)crop.forEach((v,k)=>assert.ok(v<=before[k]+.000001));before=crop;r=C.submit(r,null,true);}}
});
test('viewfinder zooms out monotonically and ends on the full artwork',()=>{
 let r=C.newRound(pool[10],C.EPOCH),last=Infinity;for(let i=0;i<6;i++){const v=C.view(C.crop(r));assert.ok(v.scale<=last&&v.scale>=1&&v.scale<=4);last=v.scale;r=C.submit(r,null,true);}assert.deepEqual(C.view(C.crop(r)),{scale:1,dx:0,dy:0});
});
test('art fixes keep every daily slot unique',()=>{
 const {swaps}=require('../cover-reveal/art-fixes.json');const ids=pool.map(s=>String((swaps[s.vocadbId]||s).vocadbId));assert.equal(new Set(ids).size,pool.length);
});
test('search supports alternate scripts, punctuation, and producer names',()=>{
 const data=[{vocadbId:1,title:"Rollin' Girl",acceptedTitles:['ローリンガール'],artistString:'wowaka feat. Hatsune Miku'}];for(const query of ['rollingirl','ローリン','wowaka'])assert.equal(C.search(data,query)[0].vocadbId,1);assert.deepEqual(C.search(data,''),[]);
});
test('archive excludes today and future days and daily streak expires after a missed day',()=>{
 assert.deepEqual(C.archiveDates(C.EPOCH),[]);assert.deepEqual(C.archiveDates('2026-09-08'),['2026-09-06','2026-09-07']);const win=date=>C.submit(C.newRound(pool[0],date),pool[0].vocadbId);const rows=[win('2026-09-06'),win('2026-09-07')];assert.equal(C.stats(rows,'2026-09-08').streak,2);assert.equal(C.stats(rows,'2026-09-09').streak,0);assert.equal(C.stats(rows,'2026-09-09').best,2);
});
test('combined emoji rows preserve each game’s meaning and legacy Timeline order',()=>{
 assert.equal(art.marks('heardle',{won:true,attempts:3,guesses:[{result:'Artist'},{result:'Strong'},{result:'Correct'}]}),'🔊 🟨🟪🟩⬜⬜⬜');
 assert.equal(art.marks('connections',{guesses:[[0,1,0,2],[3,3,3,3]]}),'🟨🟩🟨🟦\n🟪🟪🟪🟪');
 assert.equal(art.marks('masume',{gridSize:2,answers:{'0,0':123,'1,1':124},rarity:{'0,0':90,'1,1':0}}),'🟪⬛\n⬛🟩');
 assert.equal(art.marks('mikudle',{moves:['bike','mike','miku'],hints:[1]}),'🟨🟩');
 assert.equal(art.marks('timeline',{done:true,order:['2','1','3']},[{vocadbId:1,publishDate:'2007'},{vocadbId:2,publishDate:'2008'},{vocadbId:3,publishDate:'2009'}]),'🟨🟨🟩');
});
