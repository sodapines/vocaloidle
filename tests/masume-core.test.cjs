const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Grid = require("../masume/core.js");

test("one-word criteria include Latin-script accepted titles but not spacing-free Japanese alone", () => {
  assert.equal(Grid.isOneWordTitle({ title: "Night Stew!!!!", acceptedTitles: ["ヤミナベ!!!!", "Yaminabe!!!!"] }), true);
  assert.equal(Grid.isOneWordTitle({ title: "After the Darkness", acceptedTitles: ["闇あがり"] }), false);
  assert.equal(Grid.isOneWordTitle({ title: "After the Darkness", acceptedTitles: ["Yamiagari"] }), true);
});

test("number criteria inspect every accepted title", () => {
  assert.equal(Grid.hasNumberTitle({ title: "Eighty-eight", acceptedTitles: ["88☆彡"] }), true);
});

test("combined views distinguishes unknown from a known low total", () => {
  const sources = { nico: {}, youtube: {}, bilibili: { 2: { views: 581 } } };
  assert.equal(Grid.combinedViews({ vocadbId: 1 }, sources), null);
  assert.equal(Grid.combinedViews({ vocadbId: 2 }, sources), 581);
});

test("unknown totals do not receive artificial rarity points", () => {
  const songs = new Map([["a", { id: "a", views: 1000 }], ["b", { id: "b", views: 10 }], ["x", { id: "x", views: null }]]);
  const getSong = id => songs.get(String(id));
  const getViews = song => song.views;
  const pool = Grid.sortByViews(["x", "b", "a"], getSong, getViews);
  assert.deepEqual(pool, ["a", "b", "x"]);
  assert.equal(Grid.viewRarity(pool, "b", getSong, getViews), 100);
  assert.equal(Grid.viewRarity(pool, "x", getSong, getViews), 0);
});

test("Grid uses accepted titles for criteria and normalized roster tags", () => {
  const page = fs.readFileSync(path.join(__dirname, "../masume/index.html"), "utf8");
  assert.match(page, /f: VocaGridCore\.isOneWordTitle/);
  assert.match(page, /f: VocaGridCore\.hasNumberTitle/);
  assert.match(page, /function songTags\(song\)/);
  assert.match(page, /project-sekai/);
  assert.match(page, /view-rarity score/);
});

test("approved songs are enriched before the refresh worker publishes them", () => {
  const worker = fs.readFileSync(path.join(__dirname, "../scripts/cf-refresh-worker.js"), "utf8");
  const detailCommit = worker.indexOf('ghPutJson("data/songdetails.json"');
  const rosterCommit = worker.indexOf('ghPutJson("data/songs.json"', detailCommit);
  assert.ok(detailCommit > 0 && rosterCommit > detailCommit);
  assert.match(worker, /publishApproved deferred/);
});

test("the import path preserves platform IDs needed by nightly view refreshes", () => {
  const importer = fs.readFileSync(path.join(__dirname, "../scripts/import-song-ids.js"), "utf8");
  assert.match(importer, /nndOriginalId: \(nndPv && nndPv\.pvId\)/);
  assert.match(importer, /ytOriginalId:\s+\(ytPv && ytPv\.pvId\)/);
});

test("the reported edge cases resolve against the current data", () => {
  const root = path.join(__dirname, "..");
  const songs = JSON.parse(fs.readFileSync(path.join(root, "data/songs.json"), "utf8"));
  const details = JSON.parse(fs.readFileSync(path.join(root, "data/songdetails.json"), "utf8")).songs;
  const byAlias = alias => songs.find(song => Grid.titleAliases(song).some(title => title.toLowerCase() === alias.toLowerCase()));
  assert.equal(Grid.isOneWordTitle(byAlias("Yaminabe!!!!")), true);
  assert.deepEqual(details[String(byAlias("Dystopia Pt.2").vocadbId)].langs, ["zh"]);
  assert.ok(byAlias("88"));
});
