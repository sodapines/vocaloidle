#!/usr/bin/env node
// Builds data/viewhistory.json — daily per-platform stats per song, mined from
// the git history of the data files (the nightly Cloudflare refresh commits
// one snapshot per night to origin/main).
//
// {
//   updated: "YYYY-MM-DD",
//   dates: ["YYYY-MM-DD", ...],
//   songs: {
//     "<vocadbId>": {          // arrays parallel to `dates`, null = no data
//       n:  [..],  // NicoNico views      nc: [..] comments   nm: [..] mylists
//       y:  [..],  // YouTube views       yl: [..] likes      yc: [..] comments
//       b:  [..],  // bilibili views      bl: [..] likes      bc: [..] comments
//     }
//   }
// }
// Series that are entirely null are omitted. Combined views = n+y+b client-side.
//
// Run: node scripts/build-view-history.js [ref]   (default ref: origin/main)

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REF = process.argv[2] || "origin/main";
const FILES = ["data/views.json", "data/ytviews.json", "data/biliviews.json", "data/nndstats.json"];
const OUT = path.join(__dirname, "..", "data", "viewhistory.json");
const MAX_DAYS = 120; // keep the file from growing unbounded

function git(...args) {
  return execFileSync("git", args, { cwd: path.join(__dirname, ".."), maxBuffer: 256 * 1024 * 1024 }).toString();
}

const log = git("log", "--format=%H %ad", "--date=short", "--reverse", REF, "--", ...FILES)
  .trim().split("\n").filter(Boolean)
  .map(l => { const [sha, date] = l.split(" "); return { sha, date }; });

if (!log.length) { console.error("No history found on " + REF); process.exit(1); }

// Keep the LAST commit of each calendar day (the completed nightly snapshot).
const byDay = new Map();
for (const c of log) byDay.set(c.date, c.sha);
const days = [...byDay.entries()].slice(-MAX_DAYS);

function readJsonAt(sha, file) {
  try { return JSON.parse(git("show", `${sha}:${file}`)); } catch { return null; }
}

const num = v => (typeof v === "number" ? v : null);

const dates = [];
const perDay = [];
for (const [date, sha] of days) {
  const views = readJsonAt(sha, "data/views.json");
  const nndstats = readJsonAt(sha, "data/nndstats.json");
  const yt = readJsonAt(sha, "data/ytviews.json");
  const bili = readJsonAt(sha, "data/biliviews.json");
  const nndV = (views && views.views) || {};
  const nndS = (nndstats && nndstats.stats) || {};
  const ytS = (yt && yt.stats) || {};
  const biliS = (bili && bili.stats) || {};
  const day = {};
  const ids = new Set([...Object.keys(nndV), ...Object.keys(nndS), ...Object.keys(ytS), ...Object.keys(biliS)]);
  for (const id of ids) {
    const e = {
      n: num(nndV[id]) ?? num(nndS[id] && nndS[id].views),
      nc: num(nndS[id] && nndS[id].comments),
      nm: num(nndS[id] && nndS[id].mylist),
      y: num(ytS[id] && ytS[id].views),
      yl: num(ytS[id] && ytS[id].likes),
      yc: num(ytS[id] && ytS[id].comments),
      b: num(biliS[id] && biliS[id].views),
      bl: num(biliS[id] && biliS[id].likes),
      bc: num(biliS[id] && biliS[id].comments),
    };
    if (Object.values(e).some(v => v !== null)) day[id] = e;
  }
  dates.push(date);
  perDay.push(day);
  console.log(`${date} (${sha.slice(0, 7)}): ${Object.keys(day).length} songs`);
}

const KEYS = ["n", "nc", "nm", "y", "yl", "yc", "b", "bl", "bc"];
const songs = {};
const allIds = new Set(perDay.flatMap(d => Object.keys(d)));
for (const id of allIds) {
  const entry = {};
  for (const k of KEYS) {
    const series = perDay.map(d => (d[id] && d[id][k] != null ? d[id][k] : null));
    if (series.some(v => v !== null)) entry[k] = series;
  }
  if (Object.keys(entry).length) songs[id] = entry;
}

fs.writeFileSync(OUT, JSON.stringify({
  updated: new Date().toISOString().slice(0, 10),
  dates,
  songs,
}));
console.log(`Wrote ${OUT}: ${dates.length} days, ${Object.keys(songs).length} songs, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
