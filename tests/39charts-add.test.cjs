const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const page = fs.readFileSync(path.join(__dirname, "../39charts/add.html"), "utf8");

test("39charts accepts and stages batches of VocaDB IDs", () => {
  assert.match(page, /<textarea class="fetch-input" id="url-input"/);
  assert.match(page, /function parseIds\(raw\)/);
  assert.match(page, /new Set\(String\(raw\|\|""\)\.split\(\/\[\\s,;\]\+\//);
  assert.match(page, /const pendingItems = new Map\(\)/);
  assert.match(page, /Math\.min\(4,ids\.length\)/);
  assert.match(page, /id="submit-all-btn"/);
  assert.doesNotMatch(page, /let pendingData = null/);
});

test("batch entry keeps Enter for new lines and uses a shortcut to fetch", () => {
  assert.match(page, /e\.key==="Enter"&&\(e\.ctrlKey\|\|e\.metaKey\)/);
});

test("bilibili PVs have independent view-tier metadata", () => {
  for (const tier of ["100m", "10m", "1m", "100k", "10k"]) {
    assert.match(page, new RegExp(`tag:\\"bili-${tier}\\"`));
  }
  assert.match(page, /tierTags\.push\(`bili-\$\{tiers\.bili\}`\)/);
  assert.match(page, /tierField\("bili","BILI"/);
  assert.match(page, /\^\(nnd\|yt\|bili\)-\(100m\|10m\|1m\|100k\|10k\)\$/);
});

test("the admin queue can approve a large batch safely", () => {
  assert.match(page, /id="admin-approve-all-btn" disabled>Approve All/);
  assert.match(page, /async function approveAll\(\)/);
  assert.match(page, /confirm\(`Approve all \$\{rows\.length\} pending songs\?/);
  assert.match(page, /Math\.min\(4,rows\.length\)/);
  assert.match(page, /Approved \$\{approved\} of \$\{rows\.length\}/);
});
