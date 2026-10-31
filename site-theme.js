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
  function apply(dark){document.documentElement.classList.toggle('dark-mode',dark);if(document.body)document.body.classList.toggle('dark-mode',dark);root.dispatchEvent(new CustomEvent('vocaloidle-theme',{detail:{dark}}));}
  root.SiteTheme={setGlobal(dark){try{setGlobal(localStorage,dark);}catch(_){}apply(dark);}};
  root.addEventListener('storage',event=>{if(event.key==='vl-theme-change'&&event.newValue){try{apply(JSON.parse(event.newValue).dark);}catch(_){}}});
  // Restore each section's native preference early, before the first paint.
  try{const section=location.pathname.split('/').filter(Boolean)[0]||'';const keys={'heardle':'vh-darkmode','higher-or-lower':'soda_hol_settings','cover-reveal':'cr_settings','masume':'masume_dark','timeline':'tl_dark','connections':'vc_dark','mikudle':'mk_dark','39charts':'39c_dark'};const key=keys[section]||'vl-home-theme';const stored=localStorage.getItem(key);let dark=stored===null?localStorage.getItem('vl-global-theme')==='dark':objects[key]?!!JSON.parse(stored)[objects[key]]:stored===simple[key][0];document.documentElement.classList.toggle('dark-mode',dark);}catch(_){}
})(typeof window==='object'?window:globalThis);
