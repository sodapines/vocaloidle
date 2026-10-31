const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const core = require("../mikudle/core.js");
const gameplayWords = require("../mikudle/words.js");

const words = core.makeWordSet(["lime", "mime", "mike", "miku", "cake", "make"]);

test("oneLetterApart requires one and only one changed letter", () => {
  assert.equal(core.oneLetterApart("lime", "mime"), true);
  assert.equal(core.oneLetterApart("mime", "mike"), true);
  assert.equal(core.oneLetterApart("lime", "lime"), false);
  assert.equal(core.oneLetterApart("lime", "cake"), false);
});

test("validateMove checks shape, adjacency, and dictionary membership", () => {
  assert.deepEqual(core.validateMove("lime", "mime", words), { ok: true, word: "mime" });
  assert.equal(core.validateMove("lime", "miku", words).reason, "Change exactly one letter.");
  assert.equal(core.validateMove("lime", "lome", words).reason, "That word is not in the common-word list.");
  assert.equal(core.validateMove("lime", "cat", words).reason, "Enter exactly four letters.");
});

test("shortestPath finds a route to MIKU", () => {
  assert.deepEqual(core.shortestPath("cake", "miku", words), ["cake", "make", "mike", "miku"]);
  assert.deepEqual(core.shortestPath("lime", "miku", words), ["lime", "mime", "mike", "miku"]);
});

test("daily choice is deterministic", () => {
  assert.equal(core.pickForKey(["a", "b", "c"], "2026-08-19"), core.pickForKey(["a", "b", "c"], "2026-08-19"));
});

test("archive contains launch day through yesterday and excludes today", () => {
  assert.deepEqual(core.archiveDateKeys("2026-08-19", "2026-08-22"), ["2026-08-19", "2026-08-20", "2026-08-21"]);
  assert.deepEqual(core.archiveDateKeys("2026-08-19", "2026-08-19"), []);
});

test("share text is mode-aware, semantic, and contains no link", () => {
  const daily = core.buildShareText({ mode: "daily", puzzleNumber: 2, dateKey: "2026-08-19", moves: 3, par: 3, hints: 0, marks: "🟩🟩🟩", start: "love" });
  assert.equal(daily, "VOCALOID Mikudle · Daily · 2026-08-19\nResult · Solved · 3 moves · par 3 · no hints\n🟩🟩🟩\nLOVE → MIKU");
  const archive = core.buildShareText({ mode: "archive", dateKey: "2026-08-19", moves: 4, par: 3, hints: 1, marks: "🟩🟨🟩🟩", start: "cake" });
  assert.match(archive, /^VOCALOID Mikudle · Archive · 2026-08-19\nResult · Solved · 4 moves · par 3 · 1 hint/);
  assert.doesNotMatch(archive, /https?:\/\//);
});

test("hint usage remains counted after its move is undone", () => {
  const page = fs.readFileSync(path.join(__dirname, "../mikudle/index.html"), "utf8");
  assert.match(page, /hints:\[\],hintCount:0/);
  assert.match(page, /if\(hinted\)\{state\.hints\.push\(state\.moves\.length-1\);state\.hintCount\+=1\}/);
  assert.match(page, /hints:state\.hintCount,marks:squares/);
  assert.match(page, /hints:state\.hints,hintCount:state\.hintCount/);
  const undoHandler = page.match(/\$\("undo-btn"\)\.addEventListener\("click",function\(\)\{([\s\S]*?)\}\);/);
  assert.ok(undoHandler, "undo handler should exist");
  assert.doesNotMatch(undoHandler[1], /hintCount/, "undo must not erase permanent hint usage");
});

test("gameplay dictionary accepts ordinary four-letter words", () => {
  for (const word of ["live", "kids", "blue", "book", "door", "shoe", "star", "work", "word", "rink", "aunt", "clue", "leap", "torn", "wipe", "mope", "nope", "dope", "lope", "atop", "bred", "coed", "cuff", "fuss", "monk", "puff", "rite", "whoa"]) {
    assert.equal(gameplayWords.includes(word), true, `${word} should be accepted`);
  }
  assert.deepEqual(core.validateMove("love", "live", core.makeWordSet(gameplayWords)), { ok: true, word: "live" });
  assert.deepEqual(core.validateMove("mink", "rink", core.makeWordSet(gameplayWords)), { ok: true, word: "rink" });
  assert.ok(core.shortestPath("rink", "miku", core.makeWordSet(gameplayWords.filter((word) => word !== "mink"))), "rink should not force the player to reuse MINK");
  assert.deepEqual(core.validateMove("hope", "mope", core.makeWordSet(gameplayWords)), { ok: true, word: "mope" });
  assert.ok(core.shortestPath("mope", "miku", core.makeWordSet(gameplayWords.filter((word) => word !== "hope"))), "mope should not force the player to reuse HOPE");
});

test("gameplay dictionary is normalized and duplicate-free", () => {
  assert.equal(gameplayWords.length, new Set(gameplayWords).size);
  assert.equal(gameplayWords.length, 1564);
  for (const word of gameplayWords) assert.match(word, /^[a-z]{4}$/, `${word} should be exactly four lowercase letters`);
});

test("every reviewed common-word addition stays playable toward MIKU", () => {
  const reachable = new Set(["miku"]);
  const queue = ["miku"];
  while (queue.length) {
    const current = queue.shift();
    for (const candidate of gameplayWords) {
      if (!reachable.has(candidate) && core.oneLetterApart(current, candidate)) {
        reachable.add(candidate);
        queue.push(candidate);
      }
    }
  }
  assert.equal(gameplayWords.reviewedCommonWords.length, 769);
  for (const word of gameplayWords.reviewedCommonWords) {
    assert.ok(reachable.has(word), `${word} should join a route to MIKU`);
  }
});

test("gameplay dictionary excludes web artifacts and proper-name-only entries", () => {
  for (const word of ["href", "jpeg", "john", "anna", "xbox", "bool", "corp", "dont", "hist"]) {
    assert.equal(gameplayWords.includes(word), false, `${word} should not be accepted`);
  }
});

test("every curated daily start can reach MIKU through the gameplay dictionary", () => {
  const starts = ["lime", "time", "fire", "cake", "milk", "pink", "cute", "face", "name", "game", "rain", "hair", "love", "hope", "bike", "mink"];
  const set = core.makeWordSet(gameplayWords);
  for (const start of starts) assert.ok(core.shortestPath(start, "miku", set), `No route for ${start}`);
});

test("archive cells own their bottom border and Mikudle pads the final week", () => {
  const sharedCss = fs.readFileSync(path.join(__dirname, "..", "archive-shared.css"), "utf8");
  const page = fs.readFileSync(path.join(__dirname, "..", "mikudle", "index.html"), "utf8");
  assert.match(sharedCss, /\.archive-day,\.ha-day\{[^}]*border-bottom:1px solid/);
  assert.match(page, /while\(cellCount\+\+%7\)html\+=/);
});

test("Mikudle includes the Higher or Lower parity surfaces", () => {
  const page = fs.readFileSync(path.join(__dirname, "..", "mikudle", "index.html"), "utf8");
  for (const id of ["about-modal", "ach-preview-fill", "recent-history", "stats-body", "opt-motion", "opt-large", "opt-pool"]) {
    assert.match(page, new RegExp(`id=["']${id}["']`), `${id} should be present`);
  }
  assert.match(page, /data-lang="(?:en|es|ja|ko)"/);
  assert.match(page, /class="fi fi-us"/);
  assert.match(page, /class="mode-tabs"/);
  assert.match(page, /max-width:1160px/);
  assert.match(page, /@media\(min-width:1051px\)\{\.cols\{grid-template-columns:200px minmax\(0,580px\) 220px;justify-content:center\}\.mode-bar\{width:min\(100%,1012px\);margin-left:auto;margin-right:auto\}\}/);
  assert.match(page, /left-rail[\s\S]*class="panel dictionary"/);
});

test("Mikudle follows Heardle's rail, stats, and achievement patterns", () => {
  const page = fs.readFileSync(path.join(__dirname, "..", "mikudle", "index.html"), "utf8");
  assert.match(page, /page-rail page-rail-left[^>]*><span>VOCALOID WORD LADDER<\/span>/);
  assert.match(page, /page-rail-left\{right:calc\(50% \+ 516px\)\}/);
  assert.match(page, /class="panel-link full-stats" href="#" id="stats-open"/);
  assert.doesNotMatch(page, /<nav class="header-links">[\s\S]*?<a href="#" id="stats-open">Stats<\/a>/);
  for (const id of ["stats-copy-profile", "achievements-summary", "achievement-search-input"]) {
    assert.match(page, new RegExp(`id=["']${id}["']`), `${id} should be present`);
  }
  assert.match(page, /data-stats-mode="daily"/);
  assert.match(page, /data-achievement-category="skill"/);
});

test("eligible games use distinct project color identities", () => {
  const grid = fs.readFileSync(path.join(__dirname, "..", "masume", "index.html"), "utf8");
  const timeline = fs.readFileSync(path.join(__dirname, "..", "timeline", "index.html"), "utf8");
  const connections = fs.readFileSync(path.join(__dirname, "..", "connections", "index.html"), "utf8");
  const heardle = fs.readFileSync(path.join(__dirname, "..", "heardle", "index.html"), "utf8");
  const higherLower = fs.readFileSync(path.join(__dirname, "..", "higher-or-lower", "index.html"), "utf8");
  assert.match(grid, /--red: #2a9d8f; --red-dark: #17645d/);
  assert.match(timeline, /--red: #8657b5; --red-dark: #563078/);
  assert.match(connections, /--red: #c77420; --red-dark: #88440b/);
  assert.match(heardle, /\.\.\/styles\.css/);
  assert.match(higherLower, /--red:\s*#3266ba/);
  assert.match(higherLower, /--match-red:\s*#cc0000/);
});

test("the homepage uses Mikudle's ladder mark", () => {
  const page = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(page, /class="mk-mark"><svg[^>]*viewBox="0 0 28 28"/);
  assert.doesNotMatch(page, /class="mk-mark"><b>WORD<\/b>/);
  assert.match(page, /Mikudle<\/span><strong>v0\.5<\/strong>/);
});

test("accepted Mikudle moves clear the answer field and use the blue identity", () => {
  const game = fs.readFileSync(path.join(__dirname, "..", "mikudle", "index.html"), "utf8");
  const home = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(game, /state\.moves\.push\(check\.word\);if\(\$\("word-input"\)\)\$\("word-input"\)\.value=""/);
  assert.match(game, /--miku:#20aed0/);
  assert.match(home, /\.tp-cell\.mikudle[^}]*#20aed0/);
  assert.doesNotMatch(game + home, /#(?:c43f84|d85b9d|85265a)/i);
});
