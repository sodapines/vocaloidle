/* Spoiler-free result marks shared by the homepage. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ResultArt = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function read(storage, key) { try { return JSON.parse(storage.getItem(key) || 'null'); } catch (_) { return null; } }
  function marks(game, saved, songs) {
    if (!saved) return '';
    if (typeof saved.shareArt === 'string') return saved.shareArt;
    if (game === 'heardle') {
      const palette = { Wrong:'🟥', Strong:'🟪', Artist:'🟨', Vocal:'🟦', Skipped:'⬛', Correct:'🟩', Answer:'⬛' };
      let out = '';
      for (let i=0;i<6;i++) {
        const guess = (saved.guesses || [])[i];
        out += palette[guess?.result] || (saved.won ? (i+1 === saved.attempts ? '🟩' : i+1 < saved.attempts ? '⬛' : '⬜') : '⬛');
        if (guess?.result === 'Answer') break;
      }
      return '🔊 ' + out;
    }
    if (game === 'higher') return (saved.results || []).map(r => r === true || r?.correct ? '🟩' : '🟥').join('');
    if (game === 'masume') {
      if (!saved.answers) return '';
      const size = saved.gridSize || 4;
      return Array.from({length:size}, (_,r) => Array.from({length:size},(_,c) => {
        const key = r+','+c;
        return saved.answers[key] == null ? '⬛' : (saved.rarity?.[key] >= 70 ? '🟪' : '🟩');
      }).join('')).join('\n');
    }
    if (game === 'timeline') {
      if (!saved.done) return '';
      let result = saved.result;
      if (!result && Array.isArray(saved.order) && songs?.length) {
        const byId = new Map(songs.map(s => [String(s.vocadbId), s]));
        const order = saved.order.map(id => byId.get(String(id)));
        if (order.some(s => !s?.publishDate)) return '';
        const truth = [...order].sort((a,b) => a.publishDate.localeCompare(b.publishDate));
        result = order.map((s,i) => truth.indexOf(s) === i ? 'right' : Math.abs(truth.indexOf(s)-i) === 1 ? 'close' : 'wrong');
      }
      return (result || []).map(r => r === 'right' ? '🟩' : r === 'close' ? '🟨' : '⬛').join('');
    }
    if (game === 'connections') return (saved.guesses || []).map(row => row.map(i => ['🟨','🟩','🟦','🟪'][i] || '⬛').join('')).join('\n');
    if (game === 'mikudle') return (saved.moves || []).slice(1).map((_,i) => (saved.hints || []).includes(i+1) ? '🟨' : '🟩').join('');
    if (game === 'cover') return '🖼️ ' + (saved.guesses || []).map(g => g.correct ? '🟩' : g.skipped ? '⬛' : '🟥').join('') + '⬜'.repeat(Math.max(0,6-(saved.guesses || []).length));
    return '';
  }
  function savedFor(storage, game, date) {
    if (game === 'heardle') return read(storage,'vocaloid-heardle-stats')?.results?.[date];
    if (game === 'higher') { const s=read(storage,'soda_hol_daily_state'); return s?.date === date ? s : null; }
    return read(storage,({masume:'masume',timeline:'tl',connections:'vc',mikudle:'mk',cover:'cr'})[game]+'_daily_'+date);
  }
  return { marks, savedFor };
});
