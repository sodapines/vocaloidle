const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const pages = {
  grid: fs.readFileSync(path.join(root, 'masume/index.html'), 'utf8'),
  timeline: fs.readFileSync(path.join(root, 'timeline/index.html'), 'utf8'),
  connections: fs.readFileSync(path.join(root, 'connections/index.html'), 'utf8'),
};

test('Grid, Timeline, and Connections include paired decorative rails', () => {
  for (const [name, source] of Object.entries(pages)) {
    assert.match(source, /page-rail page-rail-left/, `${name} needs a left rail`);
    assert.match(source, /page-rail page-rail-right/, `${name} needs a right rail`);
    assert.match(source, /@media \(max-width:1050px\) \{ \.page-rail \{ display:none; \} \}/);
  }
});

test('desktop layouts use compact left, center, and right columns', () => {
  assert.match(pages.grid, /grid-template-columns:190px minmax\(0,600px\) 220px/);
  assert.match(pages.timeline, /grid-template-columns:190px minmax\(0,580px\) 220px/);
  assert.match(pages.connections, /grid-template-columns:190px minmax\(0,580px\) 220px/);
});

test('mode controls align with each three-column frame', () => {
  assert.match(pages.grid, /\.game-mode-bar \{ width:min\(100%,1022px\); margin-inline:auto; \}/);
  assert.match(pages.timeline, /\.game-mode-bar, \.mode-tools \{ width:min\(100%,1002px\); margin-inline:auto; \}/);
  assert.match(pages.connections, /\.nnd-body > \.mode-bar \{ grid-column:1 \/ -1; grid-row:1; \}/);
});

test('Connections assigns its game panels to the center and supports both sidebars', () => {
  assert.match(pages.connections, /id="status-panel"/);
  assert.match(pages.connections, /id="board-panel"/);
  assert.match(pages.connections, /\[ Modes \]/);
  assert.match(pages.connections, /align-content:start; align-items:start/);
  assert.match(pages.connections, /\.nnd-main \{ grid-column:2; grid-row:2; display:flex; \}/);
  assert.match(pages.connections, /\.nnd-side \{ display:contents; \}/);
});

test('each desktop sidebar is an independent vertical stack without shared grid rows', () => {
  assert.match(pages.grid, /\.ms-side-left, \.ms-side-right \{ display:flex; flex-direction:column; gap:6px; \}/);
  assert.match(pages.timeline, /\.tl-side-left, \.tl-side-right \{ display:flex; flex-direction:column; gap:6px; \}/);
  assert.match(pages.connections, /\.nnd-side-left, \.nnd-side-right \{ display:flex; flex-direction:column; gap:5px; \}/);
  assert.doesNotMatch(pages.grid, /\.ms-right > \.panel:nth-child/);
  assert.doesNotMatch(pages.timeline, /\.tl-right > \.panel:nth-child/);
  assert.doesNotMatch(pages.connections, /\.nnd-side > \.panel:nth-child/);
});
