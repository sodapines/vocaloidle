#!/usr/bin/env node
// Builds data/recentadditions.json — a chronological "newly added to
// 39charts" feed, mined from the git history of data/songs.json (mirrors
// build-view-history.js's approach: walk every commit that touched the
// file, diff which vocadbIds are new at each step). No schema changes to
// songs.json and no changes to the production Cloudflare worker needed —
// this is purely a local rebuild, same as viewhistory.json.
//
// { updated: "YYYY-MM-DD", additions: [ { id: "12345", date: "YYYY-MM-DD" }, ... ] }
// (newest first; song details are looked up live from data/songs.json —
// this file only records which id showed up on which date)
//
// Run: node scripts/build-recent-additions.js [ref]   (default ref: origin/main)

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REF = process.argv[2] || "origin/main";
const FILE = "data/songs.json";
const OUT = path.join(__dirname, "..", "data", "recentadditions.json");
const MAX_ENTRIES = 500;

function git(...args) {
  return execFileSync("git", args, { cwd: path.join(__dirname, ".."), maxBuffer: 512 * 1024 * 1024 }).toString();
}

// --full-history: without it, git prunes commits a later merge overrode,
// same reasoning as build-view-history.js.
const log = git("log", "--full-history", "--format=%H %ad", "--date=short", "--reverse", REF, "--", FILE)
  .trim().split("\n").filter(Boolean)
  .map(l => { const [sha, date] = l.split(" "); return { sha, date }; });

if (!log.length) { console.error("No history found on " + REF); process.exit(1); }

// Keep the LAST commit of each calendar day — several publish commits can
// land the same night (submission publish + refresh both touch the file).
const byDay = new Map();
for (const c of log) byDay.set(c.date, c.sha);
const days = [...byDay.entries()];

function readIdsAt(sha) {
  try {
    const data = JSON.parse(git("show", `${sha}:${FILE}`));
    return Array.isArray(data) ? data.map(s => String(s.vocadbId)) : [];
  } catch { return []; }
}

const seen = new Set();
const additions = [];
for (const [date, sha] of days) {
  const ids = readIdsAt(sha);
  let freshCount = 0;
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    additions.push({ id, date });
    freshCount++;
  }
  console.log(`${date} (${sha.slice(0, 7)}): ${freshCount} new, ${seen.size} total`);
}

// Newest first, capped — the oldest (bulk-import baseline) entries fall off
// the end naturally once the site has more than MAX_ENTRIES organic adds.
additions.reverse();
const capped = additions.slice(0, MAX_ENTRIES);

fs.writeFileSync(OUT, JSON.stringify({
  updated: new Date().toISOString().slice(0, 10),
  additions: capped,
}));
console.log(`Wrote ${OUT}: ${capped.length} additions (of ${additions.length} total), ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
