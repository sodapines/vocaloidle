'use strict';
const T=TournamentCore,$=id=>document.getElementById(id),CONFIG=window.TOURNAMENT_CONFIG||{};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data=null,shown=0,match=0,picks={},details={},turnstileToken='',isArchive=false,settings={auto:true,tags:true};try{settings={...settings,...JSON.parse(localStorage.getItem('tn_settings'))};}catch(_){}
const fetchJSON=url=>fetch(url,{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);
const storeKey=()=>'tn_picks_'+data.number+'_'+data.open;
function entrantsFor(round){return round===0?data.entrants:data.rounds[round-1].winners;}
function tagsOf(song){if(!settings.tags)return[];const info=details[song.id]||{},tags=info.tags||[];return(tags.length?tags:[...(info.vocalists||[]),info.type].filter(Boolean)).slice(0,3);}
function cardHtml(song,side,result){
  const state=result?(result.winner===side?' is-winner':' is-loser'):'';
  const field=(key,value,sub)=>'<div class="meta-field"><span class="meta-key">['+key+']</span>'+value+(sub?'<span class="meta-sub">'+sub+'</span>':'')+'</div>';
  return '<div class="song-col '+(side?'is-b':'is-a')+state+'"><div class="song-col-header"><span class="col-header-title" title="'+esc(song.title)+'">'+esc(song.title)+'</span><span class="col-header-status">#'+song.seed+'</span></div><div class="song-thumb"><img src="'+esc(song.cover||'../favicon.jpg')+'" alt="" referrerpolicy="no-referrer"><div class="thumb-scanlines"></div><div class="tier-badges">'+tagsOf(song).map(tag=>'<span class="tier-badge">'+esc(tag)+'</span>').join('')+'</div></div><div class="song-meta-bar">'+field('year','<span class="meta-val">'+esc(song.year||'—')+'</span>','upload')+(result?field('votes','<span class="meta-val">'+result.votes[side]+'</span>','this round'):'')+field('artist','<span class="meta-val meta-artist" title="'+esc(song.artist)+'">'+esc(song.artist)+'</span>')+'</div><div class="song-links"><a class="song-link" href="'+esc(song.link.url)+'" target="_blank" rel="noopener">Listen on '+esc(song.link.service)+'</a><a class="song-link" href="https://vocadb.net/S/'+esc(song.id)+'" target="_blank" rel="noopener">VocaDB</a></div></div>';
}
function renderTabs(){const last=isArchive?data.rounds.length-1:data.open;$('tn-tabs').innerHTML=['R64','R32','R16','QF','SF','Final'].map((name,i)=>'<button type="button" class="mode-btn'+(i===shown?' is-active':'')+'" '+(i>last?'disabled':'data-round="'+i+'"')+'>'+name+'</button>').join('');}
function renderRound(){
  const round=data.rounds[shown],open=!isArchive&&shown===data.open,pairs=T.pairs(entrantsFor(shown)),canVote=open&&CONFIG.api;
  match=Math.min(match,pairs.length-1);const pair=pairs[match],result=round.results?.[match];
  $('tn-round').textContent='[ '+T.ROUNDS[shown]+' ]';$('tn-side-round').textContent=['R64','R32','R16','QF','SF','Final'][shown];$('tn-side-matches').textContent=pairs.length;
  const vote=side=>'<button type="button" class="guess-btn '+(side?'guess-b':'guess-a')+(picks[match]===side?' is-picked':'')+'" data-side="'+side+'" aria-pressed="'+(picks[match]===side)+'"><span class="guess-arrow">'+(side+1)+'</span>Vote</button>';
  $('tn-matches').innerHTML='<div class="game-area">'+cardHtml(pair[0],0,result)+'<div class="vs-col"><div class="vs-round-label">Matchup</div><div class="vs-round-num">'+(match+1)+' / '+pairs.length+'</div><div class="vs-text">[VS]</div>'+(canVote?'<div class="guess-btns">'+vote(0)+vote(1)+'</div>':'')+'<div class="tn-step"><button type="button" data-goto="'+(match-1)+'" aria-label="Previous matchup" '+(match?'':'disabled')+'>◀</button><button type="button" data-goto="'+(match+1)+'" aria-label="Next matchup" '+(match<pairs.length-1?'':'disabled')+'>▶</button></div></div>'+cardHtml(pair[1],1,result)+'</div><div class="tn-dots">'+pairs.map((_,i)=>'<button type="button" data-goto="'+i+'" aria-label="Matchup '+(i+1)+'" class="'+(i===match?'is-current ':'')+(picks[i]!==undefined&&open?'is-done':'')+'" title="Matchup '+(i+1)+'"></button>').join('')+'</div>';
  $('tn-submit').hidden=!canVote;updateProgress(pairs.length);renderTabs();
}
function updateProgress(total){const count=Object.keys(picks).length;$('tn-side-picks').textContent=count+' / '+total;$('tn-progress-top').textContent=total+' matchups';$('tn-progress').textContent=count+' of '+total+' matchups picked';$('tn-send').disabled=!count||!turnstileToken;}
async function send(){
  const total=entrantsFor(data.open).length/2;$('tn-send').disabled=true;$('tn-progress').textContent='Sending…';
  try{const res=await fetch(CONFIG.api+'/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tournament:data.number,round:data.open,picks,token:turnstileToken})});
    if(!res.ok)throw Error((await res.json()).error);
    localStorage.setItem(storeKey(),JSON.stringify(picks));$('tn-progress').textContent='Votes saved. You can change them until the round closes.';
  }catch(error){$('tn-progress').textContent=error.message==='closed'?'This round has closed.':'Your votes could not be saved. Please try again.';}
  turnstileToken='';window.turnstile?.reset();const note=$('tn-progress').textContent;updateProgress(total);$('tn-progress').textContent=note;
}
function loadTurnstile(){if(!CONFIG.turnstileSiteKey)return;window.onTurnstile=()=>turnstile.render('#tn-turnstile',{sitekey:CONFIG.turnstileSiteKey,callback:token=>{turnstileToken=token;updateProgress(entrantsFor(data.open).length/2);}});const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstile&render=explicit';script.async=true;document.head.append(script);}
function castVote(side){
  picks[match]=side;
  const total=entrantsFor(shown).length/2;
  if(settings.auto){const next=Array.from({length:total},(_,i)=>(match+1+i)%total).find(i=>picks[i]===undefined);if(next!==undefined)match=next;}
  renderRound();
}
const isDark=()=>document.documentElement.classList.contains('dark-mode');
function renderSettings(){$('tn-settings-body').innerHTML=[['dark','Dark mode','Applies across the site',isDark()],['auto','Auto-advance','Jump to the next unpicked matchup after voting',settings.auto],['tags','Show tags','Show VocaDB tags on the artwork',settings.tags]].map(([key,label,desc,on])=>'<div class="settings-row"><div><div class="s-label">'+label+'</div><div class="s-desc">'+desc+'</div></div><button type="button" class="settings-toggle'+(on?' is-on':'')+'" role="switch" aria-checked="'+on+'" aria-label="'+label+'" data-setting="'+key+'">'+(on?'ON':'OFF')+'</button></div>').join('');}
function changeSetting(key){
  if(key==='dark'){const dark=!isDark();document.documentElement.classList.toggle('dark-mode',dark);localStorage.setItem('vl-global-theme',dark?'dark':'light');}
  else{settings[key]=!settings[key];localStorage.setItem('tn_settings',JSON.stringify(settings));renderRound();}
  renderSettings();
}
document.addEventListener('keydown',event=>{if(!data||event.target.closest('input,textarea,dialog'))return;const total=entrantsFor(shown).length/2;if(event.key==='ArrowLeft'&&match>0){match--;renderRound();}if(event.key==='ArrowRight'&&match<total-1){match++;renderRound();}if(!isArchive&&shown===data.open&&CONFIG.api&&(event.key==='1'||event.key==='2'))castVote(Number(event.key)-1);});
document.addEventListener('click',event=>{
  const tab=event.target.closest('[data-round]');if(tab){shown=Number(tab.dataset.round);match=0;renderRound();return;}
  const go=event.target.closest('[data-goto]');if(go){match=Number(go.dataset.goto);renderRound();return;}
  const vote=event.target.closest('[data-side]');if(vote){castVote(Number(vote.dataset.side));return;}
  if(event.target.id==='tn-open-settings'){renderSettings();$('tn-settings').showModal();return;}
  if(event.target.id==='tn-close-settings'){$('tn-settings').close();return;}
  const toggle=event.target.closest('[data-setting]');if(toggle){changeSetting(toggle.dataset.setting);return;}
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
  if(!isArchive){try{picks=JSON.parse(localStorage.getItem(storeKey()))||{};}catch(_){picks={};}const tick=()=>{const left=Math.max(0,Date.parse(data.rounds[data.open].closesAt)-Date.now());$('tn-closes').textContent=Math.floor(left/864e5)+'d '+Math.floor(left/36e5)%24+'h '+Math.floor(left/6e4)%60+'m';};tick();setInterval(tick,30000);loadTurnstile();}
  renderRound();
  fetchJSON('../data/songdetails.json').then(file=>{details=file?.songs||{};renderRound();});
}
boot();
