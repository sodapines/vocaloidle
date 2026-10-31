'use strict';
const T=TournamentCore,$=id=>document.getElementById(id),CONFIG=window.TOURNAMENT_CONFIG||{};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data=null,shown=0,picks={},turnstileToken='',isArchive=false;
const fetchJSON=url=>fetch(url,{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);
const storeKey=()=>'tn_picks_'+data.number+'_'+data.open;
function entrantsFor(round){return round===0?data.entrants:data.rounds[round-1].winners;}
function songHtml(song,match,side,round,result){
  const open=!isArchive&&round===data.open;
  const state=result?(result.winner===side?' is-winner':' is-loser'):(open&&picks[match]===side?' is-picked':'');
  return '<div class="tn-song'+state+'"><img src="'+esc(song.cover||'../favicon.jpg')+'" alt="" loading="lazy" referrerpolicy="no-referrer"><div class="tn-info"><b title="'+esc(song.title)+'">'+esc(song.title)+'</b><small>'+esc(song.artist)+'</small><small>#'+song.seed+(song.year?' · '+esc(song.year):'')+'</small>'+(result?'<span class="tn-votes">'+result.votes[side]+' votes</span>':'')+'</div><div class="tn-actions"><a href="'+esc(song.link.url)+'" target="_blank" rel="noopener">Listen on '+esc(song.link.service)+' ↗</a>'+(open&&CONFIG.api?'<button type="button" data-match="'+match+'" data-side="'+side+'" aria-pressed="'+(picks[match]===side)+'">Vote</button>':'')+'</div></div>';
}
function renderTabs(){const last=isArchive?data.rounds.length-1:data.open;$('tn-tabs').innerHTML=T.ROUNDS.slice(0,last+1).map((name,i)=>'<button type="button" data-round="'+i+'" class="'+(i===shown?'is-active':'')+'">'+name+'</button>').join('');}
function renderRound(){
  const round=data.rounds[shown],open=!isArchive&&shown===data.open,pairs=T.pairs(entrantsFor(shown));
  $('tn-round').textContent='[ '+T.ROUNDS[shown]+' ]';
  $('tn-matches').innerHTML=pairs.map((pair,i)=>'<div class="tn-match">'+songHtml(pair[0],i,0,shown,round.results?.[i])+'<span class="tn-vs">VS</span>'+songHtml(pair[1],i,1,shown,round.results?.[i])+'</div>').join('');
  $('tn-submit').hidden=!open||!CONFIG.api;
  if(open&&!CONFIG.api)$('tn-matches').insertAdjacentHTML('afterbegin','<p class="tn-empty">Voting opens soon.</p>');
  updateProgress(pairs.length);renderTabs();
}
function updateProgress(total){const count=Object.keys(picks).length;$('tn-progress').textContent=count+' of '+total+' matchups picked';$('tn-send').disabled=!count||!turnstileToken;}
async function send(){
  const total=entrantsFor(data.open).length/2;$('tn-send').disabled=true;$('tn-progress').textContent='Sending…';
  try{const res=await fetch(CONFIG.api+'/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tournament:data.number,round:data.open,picks,token:turnstileToken})});
    if(!res.ok)throw Error((await res.json()).error);
    localStorage.setItem(storeKey(),JSON.stringify(picks));$('tn-progress').textContent='Votes saved. You can change them until the round closes.';
  }catch(error){$('tn-progress').textContent=error.message==='closed'?'This round has closed.':'Your votes could not be saved. Please try again.';}
  turnstileToken='';window.turnstile?.reset();const note=$('tn-progress').textContent;updateProgress(total);$('tn-progress').textContent=note;
}
function loadTurnstile(){if(!CONFIG.turnstileSiteKey)return;window.onTurnstile=()=>turnstile.render('#tn-turnstile',{sitekey:CONFIG.turnstileSiteKey,callback:token=>{turnstileToken=token;updateProgress(entrantsFor(data.open).length/2);}});const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstile&render=explicit';script.async=true;document.head.append(script);}
document.addEventListener('click',event=>{
  const tab=event.target.closest('[data-round]');if(tab){shown=Number(tab.dataset.round);renderRound();return;}
  const vote=event.target.closest('[data-match]');if(vote){picks[vote.dataset.match]=Number(vote.dataset.side);renderRound();return;}
  if(event.target.id==='tn-send')send();
});
async function boot(){
  const wanted=new URLSearchParams(location.search).get('t');isArchive=/^\d+$/.test(wanted||'');
  data=await fetchJSON(isArchive?'../data/tournament/archive/'+wanted+'.json':'../data/tournament/current.json');
  const past=await fetchJSON('../data/tournament/archive/index.json')||[];
  $('tn-archive').innerHTML=past.length?[...past].reverse().map(t=>'<a href="?t='+t.number+'"><span>Tournament #'+t.number+'</span><span>★ '+esc(t.champion.title)+'</span></a>').join(''):'<p class="tn-empty">The first champion is still to be crowned.</p>';
  if(!data){$('tn-title').textContent='The first tournament starts soon.';$('tn-matches').innerHTML='<p class="tn-empty">Check back soon.</p>';return;}
  $('tn-title').innerHTML='Tournament <b>#'+data.number+'</b>'+(data.champion?' · ★ '+esc(data.champion.title):'');
  shown=isArchive?data.rounds.length-1:data.open;
  if(!isArchive){try{picks=JSON.parse(localStorage.getItem(storeKey()))||{};}catch(_){picks={};}$('tn-closes').textContent='Round closes '+new Date(data.rounds[data.open].closesAt).toLocaleString();loadTurnstile();}
  renderRound();
}
boot();
