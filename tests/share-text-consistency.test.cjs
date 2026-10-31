const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const section = (source, start, end) => {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
};

test('daily share cards use a title line, a result line, then emoji art', () => {
  const heardle = section(read('heardle/app.js'), 'function buildShareText()', '// ── GLOBAL RANKINGS');
  const timeline = section(read('timeline/index.html'), 'function shareText()', '/* ── events ── */');
  const grid = section(read('masume/index.html'), 'function shareText()', 'function renderResult()');
  const connections = section(read('connections/index.html'), 'function shareText()', '/* ═══════════════ game setup');
  const higherLower = read('higher-or-lower/index.html');

  assert.match(heardle, /VOCALOID Heardle · Daily ·/);
  assert.match(heardle, /Result ·.*Solved.*guesses/);
  assert.match(heardle, /\.join\(""\)/);
  assert.match(timeline, /\$\{head\}\\nResult · \$\{rightN\}\/\$\{totalN\} correct\\n\$\{art\}/);
  assert.match(grid, /\$\{head\}\\nResult · \$\{filled\}\/\$\{n \* n\} filled ·/);
  assert.match(connections, /\$\{heading\}\\n\$\{result\}\\n\$\{rows\}/);
  assert.match(higherLower, /VOCALOID Higher or Lower · Daily · \$\{date\}\\nResult · \$\{correct\}\/\$\{DAILY_GUESS_COUNT\} correct\\n\$\{marks\}/);
});

test('result shares contain no website links or promotional statistics', () => {
  const heardle = section(read('heardle/app.js'), 'function buildShareText()', '// ── GLOBAL RANKINGS');
  const timeline = section(read('timeline/index.html'), 'function shareText()', '/* ── events ── */');
  const grid = section(read('masume/index.html'), 'function shareText()', 'function renderResult()');
  const connections = section(read('connections/index.html'), 'function shareText()', '/* ═══════════════ game setup');

  for (const share of [heardle, timeline, grid, connections]) {
    assert.doesNotMatch(share, /https?:\/\//);
  }
  assert.doesNotMatch(heardle, /shareGlobalStats|lastGlobalStats/);
});
