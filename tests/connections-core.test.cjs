const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Core = require("../connections/core.js");

test("archive dates include the epoch and exclude today", () => {
  assert.deepEqual(Core.archiveDates("2026-07-22"), ["2026-07-19","2026-07-20","2026-07-21"]);
  assert.deepEqual(Core.archiveDates("2026-07-19"), []);
});

test("challenge mode uses a three-strike limit", () => {
  assert.equal(Core.strikeLimit(false), 4);
  assert.equal(Core.strikeLimit(true), 3);
});

test("duration formatting is stable", () => {
  assert.equal(Core.formatDuration(0), "0:00");
  assert.equal(Core.formatDuration(125999), "2:05");
});

test("category plans are balanced by kind and contain no duplicates", () => {
  const plan=Core.chooseDistinctKinds(["producer","producer","vocalist","year","tag","views"],()=>0.25,4);
  assert.equal(plan.length,4);
  assert.equal(new Set(plan).size,4);
});

test("frozen manifests hydrate groups and preserve tile order", () => {
  const songs = Array.from({length:16}, (_,i)=>({vocadbId:i+1,title:`Song ${i+1}`}));
  const entry = {groups:Array.from({length:4},(_,g)=>({kind:"tag",value:`g${g}`,ids:Array.from({length:4},(_,i)=>String(g*4+i+1))})),tiles:Array.from({length:16},(_,i)=>String(16-i))};
  const puzzle = Core.hydrateManifest(entry,songs);
  assert.equal(puzzle.groups.length,4);
  assert.deepEqual(puzzle.tiles.map(s=>s.vocadbId),Array.from({length:16},(_,i)=>16-i));
  assert.equal(puzzle.groups[2].songs[0].title,"Song 9");
});

test("invalid or incomplete manifests fail closed", () => {
  const songs = Array.from({length:16},(_,i)=>({vocadbId:i+1}));
  const duplicate = {groups:Array.from({length:4},()=>({ids:["1","2","3","4"]})),tiles:Array.from({length:16},(_,i)=>String(i+1))};
  assert.equal(Core.hydrateManifest(duplicate,songs),null);
});

test("the shipped launch manifest resolves against the current song pool", () => {
  const root=path.join(__dirname,"..");
  const songs=JSON.parse(fs.readFileSync(path.join(root,"data","songs.json"),"utf8"));
  const manifests=JSON.parse(fs.readFileSync(path.join(root,"connections","manifests.json"),"utf8"));
  const puzzle=Core.hydrateManifest(manifests["2026-07-19"],songs);
  assert.ok(puzzle);
  assert.equal(new Set(puzzle.tiles.map(song=>song.vocadbId)).size,16);
});

test("backup parser rejects other apps and filters malformed daily keys", () => {
  assert.throws(()=>Core.sanitizeBackup({app:"other",version:1,stats:{},unlimitedStats:{}}));
  const parsed=Core.sanitizeBackup({app:Core.APP,version:1,stats:{played:2},unlimitedStats:{played:1},dailies:{"2026-07-19":{solved:[],done:true},oops:{solved:[],done:true}},settings:{timer:"1"}});
  assert.deepEqual(Object.keys(parsed.dailies),["2026-07-19"]);
  assert.equal(parsed.settings.timer,"1");
});
