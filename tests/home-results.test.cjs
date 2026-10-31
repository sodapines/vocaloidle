const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
function setup(saved = {}, clipboard = async () => {}) {
  const nodes = new Map();
  const node = () => ({ textContent: '', hidden: true, value: '', classList: { toggle() {} }, appendChild() {}, addEventListener(type, fn) { this[type] = fn; }, focus() {}, select() {} });
  const document = { getElementById(id) { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); }, createElement: node };
  const ctx = vm.createContext({ homeSongsReady: Promise.resolve([]), ResultArt: require("../result-art.js"), document, localStorage: { getItem: key => saved[key] || null }, navigator: { clipboard: { writeText: clipboard } } });
  vm.runInContext(source.slice(source.indexOf('    var todaysResults ='), source.indexOf('    refreshTodaysPuzzles();')), ctx);
  vm.runInContext('refreshTodaysPuzzles()', ctx);
  const start = source.indexOf('    document.getElementById("tp-copy-results").addEventListener');
  vm.runInContext(source.slice(start, source.indexOf('    function tierLabel', start)), ctx);
  return { ctx, nodes };
}
test('combined results count correct guesses, include seven games, and omit song answers', async () => {
  const initial = setup();
  const key = initial.ctx.todaysResultsDate;
  let copied;
  const { ctx, nodes } = setup({ soda_hol_daily_state: JSON.stringify({ date: key, completed: true, results: [{ correct: false, songA: 'Secret answer' }, { correct: true }] }) }, async text => { copied = text; });
  await nodes.get('tp-copy-results').click();
  assert.equal(ctx.todaysResults.length, 7);
  assert.match(copied, /🟥🟩/);
  assert.match(copied, /Higher \/ Lower: 1\/2 correct/);
  assert.match(copied, /Heardle: Not played yet/);
  assert.doesNotMatch(copied, /Secret answer/);
  assert.equal(nodes.get('tp-copy-status').textContent, 'All results copied!');
});
test('old daily results are not shared as today and denied clipboard exposes manual copy', async () => {
  const { nodes } = setup({ soda_hol_daily_state: JSON.stringify({ date: '2000-01-01', completed: true, results: [true] }), masume_stats: '{broken' }, async () => { throw Error('denied'); });
  await nodes.get('tp-copy-results').click();
  const fallback = nodes.get('tp-copy-fallback');
  assert.equal(fallback.hidden, false);
  assert.match(fallback.value, /Higher \/ Lower: Not played yet/);
  assert.match(fallback.value, /Grid: Not played yet/);
});
