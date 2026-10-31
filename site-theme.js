/* Homepage changes reset the site theme; each game's existing setting can override it. */
(function(root){
  'use strict';
  const simple={'vl-home-theme':['dark','light'],'vh-darkmode':['true','false'],masume_dark:['1','0'],tl_dark:['1','0'],vc_dark:['1','0'],mk_dark:['1','0'],'39c_dark':['1','0']};
  const objects={soda_hol_settings:'darkMode',cr_settings:'dark'};
  function setGlobal(storage,dark){
    Object.entries(simple).forEach(([key,values])=>storage.setItem(key,values[dark?0:1]));
    Object.entries(objects).forEach(([key,field])=>{let value={};try{value=JSON.parse(storage.getItem(key))||{};}catch(_){}storage.setItem(key,JSON.stringify({...value,[field]:dark}));});
    storage.setItem('vl-global-theme',dark?'dark':'light');
    storage.setItem('vl-theme-change',JSON.stringify({dark,nonce:Date.now()+Math.random()}));
  }
  if(typeof module==='object'&&module.exports){module.exports={setGlobal};return;}
  // Shared page background. Injected here because every page loads this file; the repeated :root outranks every page's own !important rules.
  const base=document.currentScript.src.replace(/site-theme\.js.*$/,'');
  const backdrop=document.createElement('style');
  const top=':root:root:root:root';
  backdrop.textContent=`${top},${top} body{background:#ebebe9 url("${base}home-bg.svg") 0 0/80px 40px !important}${top}.dark-mode,${top}.dark-mode body,${top} body.dark-mode{background:#121212 url("${base}home-bg-dark.svg") 0 0/80px 40px !important}${top} body .page-rail span{background:#ebebe9 !important}${top}.dark-mode body .page-rail span,${top} body.dark-mode .page-rail span{background:#121212 !important}`;
  document.head.appendChild(backdrop);
  function apply(dark){document.documentElement.classList.toggle('dark-mode',dark);if(document.body)document.body.classList.toggle('dark-mode',dark);root.dispatchEvent(new CustomEvent('vocaloidle-theme',{detail:{dark}}));}
  root.SiteTheme={setGlobal(dark){try{setGlobal(localStorage,dark);}catch(_){}apply(dark);}};
  root.addEventListener('storage',event=>{if(event.key==='vl-theme-change'&&event.newValue){try{apply(JSON.parse(event.newValue).dark);}catch(_){}}});
  // Restore each section's native preference early, before the first paint.
  try{const section=location.pathname.split('/').filter(Boolean)[0]||'';const keys={'heardle':'vh-darkmode','higher-or-lower':'soda_hol_settings','cover-reveal':'cr_settings','masume':'masume_dark','timeline':'tl_dark','connections':'vc_dark','mikudle':'mk_dark','39charts':'39c_dark'};const key=keys[section]||'vl-home-theme';const stored=localStorage.getItem(key);let dark=stored===null?localStorage.getItem('vl-global-theme')==='dark':objects[key]?!!JSON.parse(stored)[objects[key]]:stored===simple[key][0];document.documentElement.classList.toggle('dark-mode',dark);}catch(_){}
})(typeof window==='object'?window:globalThis);
