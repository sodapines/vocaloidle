(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TournamentCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const ROUNDS=['Round of 64','Round of 32','Round of 16','Quarterfinals','Semifinals','Final'];
  const TIERS={top:16,mid:32,gem:16};
  function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function shuffled(items,random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  // Standard seeding order, so the strongest seeds can only meet in late rounds.
  function seedOrder(size){let order=[0];while(order.length<size){const next=order.length*2-1;order=order.flatMap(seed=>[seed,next-seed]);}return order;}
  /* songs: eligible [{id,views}] sorted or not. Tiers split the catalogue by views. */
  function pickField(songs,seed){
    const ranked=[...songs].sort((a,b)=>b.views-a.views||String(a.id).localeCompare(String(b.id)));
    if(ranked.length<64)throw new Error('Need at least 64 eligible songs');
    const random=rng(seed),topEnd=Math.max(TIERS.top,Math.floor(ranked.length*.15)),midEnd=Math.max(topEnd+TIERS.mid,Math.floor(ranked.length*.6));
    const take=(from,to,count)=>shuffled(ranked.slice(from,to),random).slice(0,count);
    const pool=ranked.length-midEnd>=TIERS.gem?ranked.length:midEnd+TIERS.gem;
    return{top:take(0,topEnd,TIERS.top),mid:take(topEnd,midEnd,TIERS.mid),gem:take(midEnd,pool,TIERS.gem)};
  }
  /* 64 entrants, ordered by bracket slot: each pod is top v gem, then mid v mid. */
  function buildBracket(field){
    const byViews=list=>[...list].sort((a,b)=>b.views-a.views);
    const top=byViews(field.top),gem=byViews(field.gem).reverse(),mid=byViews(field.mid);
    const slots=[];
    seedOrder(16).forEach((rank,pod)=>{slots.push(top[rank],gem[rank],mid[pod*2],mid[pod*2+1]);});
    const seeds=new Map(byViews([...field.top,...field.mid,...field.gem]).map((song,i)=>[song.id,i+1]));
    return slots.map(song=>({...song,seed:seeds.get(song.id)}));
  }
  function pairs(entrants){const out=[];for(let i=0;i<entrants.length;i+=2)out.push([entrants[i],entrants[i+1]]);return out;}
  /* counts: {matchIndex:[votesA,votesB]}. Ties go to the higher (smaller) seed. */
  function resolveRound(entrants,counts){
    const results=pairs(entrants).map((pair,i)=>{const votes=counts[i]||[0,0];const a=votes[0]||0,b=votes[1]||0;const winner=a===b?(pair[0].seed<pair[1].seed?0:1):(a>b?0:1);return{votes:[a,b],winner,tie:a===b};});
    return{results,winners:results.map((r,i)=>pairs(entrants)[i][r.winner])};
  }
  function tallyBallots(ballots,matchCount){
    const counts={};for(let i=0;i<matchCount;i++)counts[i]=[0,0];
    for(const ballot of ballots)for(const [match,side]of Object.entries(ballot||{})){if(counts[match]&&(side===0||side===1))counts[match][side]++;}
    return counts;
  }
  function validBallot(picks,matchCount){
    if(!picks||typeof picks!=='object'||Array.isArray(picks))return false;
    const entries=Object.entries(picks);
    return entries.length>0&&entries.length<=matchCount&&entries.every(([match,side])=>/^\d+$/.test(match)&&Number(match)<matchCount&&(side===0||side===1));
  }
  return{ROUNDS,TIERS,rng,seedOrder,pickField,buildBracket,pairs,resolveRound,tallyBallots,validBallot};
});
