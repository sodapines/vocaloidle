#!/usr/bin/env node
// Fetches NicoNicodouga stats (views, comments, mylists) for all songs in
// data/songs.json. getthumbinfo returns all three in one call. Writes:
//   data/views.json    — { views: { id: number } }  (the view count; used by the games)
//   data/nndstats.json — { stats: { id: { views, comments, mylist } } }  (used by 39charts)
//
// A song gets an entry only if it has a usable, LIVE NicoNico upload:
//   1. A live ORIGINAL upload (best-of if several; recovers deleted-first-original songs).
//   2. Otherwise the best live REPRINT / other upload, but only if >= RESCUE_MIN_VIEWS.
//
// Usage:
//   node scripts/fetch-nnd-views.js                 # refresh every song
//   node scripts/fetch-nnd-views.js --missing-only  # only fill songs with no count
//
// Requires Node 18+ (built-in fetch).

const fs = require("fs");
const path = require("path");
const https = require("https");

const SONGS_PATH = path.join(__dirname, "..", "data", "songs.json");
const VIEWS_PATH = path.join(__dirname, "..", "data", "views.json");
const NNDSTATS_PATH = path.join(__dirname, "..", "data", "nndstats.json");
const DELAY_MS = 600;
const RESCUE_MIN_VIEWS = 1_000_000;
const MISSING_ONLY = process.argv.includes("--missing-only");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function fetchXml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { "User-Agent": "sodapines-vocaloid-game/1.0 (view-count-fetcher)" },
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(body));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

// Returns { views, comments, mylist } or throws. "API error:" = video unavailable.
async function fetchNndStats(videoId) {
  const xml = await fetchXml(`https://ext.nicovideo.jp/api/getthumbinfo/${videoId}`);
  if (xml.includes('status="fail"')) {
    const code = xml.match(/<code>([^<]+)<\/code>/)?.[1] || "unknown";
    throw new Error(`API error: ${code}`);
  }
  const v = xml.match(/<view_counter>(\d+)<\/view_counter>/);
  if (!v) throw new Error("view_counter not found in response");
  const c = xml.match(/<comment_num>(\d+)<\/comment_num>/);
  const m = xml.match(/<mylist_counter>(\d+)<\/mylist_counter>/);
  return { views: parseInt(v[1], 10), comments: c ? parseInt(c[1], 10) : null, mylist: m ? parseInt(m[1], 10) : null };
}

// All NicoNico PVs for a song from VocaDB, as { id, type }.
async function fetchNndPvs(vocadbId) {
  const res = await fetch(`https://vocadb.net/api/songs/${vocadbId}?fields=PVs&lang=English`, {
    headers: { "User-Agent": "sodapines-vocaloid-game/1.0 (view-count-fetcher)" },
  });
  if (!res.ok) throw new Error(`VocaDB ${vocadbId} returned ${res.status}`);
  const data = await res.json();
  return (data.pvs || data.PVs || [])
    .filter((pv) => pv.service === "NicoNicoDouga" && pv.pvId)
    .map((pv) => ({ id: pv.pvId, type: pv.pvType }));
}

// Decide the usable upload for a song. Returns { stats, id, via } or null.
async function resolveStats(song) {
  const tried = new Set();

  if (song.nndOriginalId) {
    tried.add(song.nndOriginalId);
    await sleep(DELAY_MS);
    try {
      const stats = await fetchNndStats(song.nndOriginalId);
      return { stats, id: song.nndOriginalId, via: "original" };
    } catch (err) {
      if (!/^API error:/.test(err.message)) throw err;
    }
  }

  await sleep(DELAY_MS);
  const pvs = await fetchNndPvs(song.vocadbId);
  const originals = [];
  const others = [];
  for (const pv of pvs) {
    if (tried.has(pv.id)) continue;
    tried.add(pv.id);
    await sleep(DELAY_MS);
    let stats;
    try { stats = await fetchNndStats(pv.id); } catch { continue; }
    (pv.type === "Original" ? originals : others).push({ stats, id: pv.id });
  }

  if (originals.length) {
    const best = originals.sort((a, b) => b.stats.views - a.stats.views)[0];
    return { ...best, via: "original-alt" };
  }
  if (others.length) {
    const best = others.sort((a, b) => b.stats.views - a.stats.views)[0];
    if (best.stats.views >= RESCUE_MIN_VIEWS) return { ...best, via: "rescue" };
  }
  return null;
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(SONGS_PATH, "utf8"));

  let views = {}, stats = {};
  try { views = JSON.parse(fs.readFileSync(VIEWS_PATH, "utf8")).views || {}; } catch {}
  try { stats = JSON.parse(fs.readFileSync(NNDSTATS_PATH, "utf8")).stats || {}; } catch {}

  let fetched = 0, rescued = 0, skipped = 0, dropped = 0, failed = 0;

  for (const song of songs) {
    const key = String(song.vocadbId);
    if (MISSING_ONLY && views[key] != null) { skipped++; continue; }

    try {
      const result = await resolveStats(song);
      if (result) {
        views[key] = result.stats.views;
        stats[key] = result.stats;
        fetched++;
        if (result.via === "rescue") rescued++;
        const tag = result.via === "rescue" ? "RESCUE" : result.via === "original-alt" ? "ALT" : "OK";
        console.log(`[${tag}] ${song.title} (${result.id}): ${result.stats.views.toLocaleString()}`);
      } else if (views[key] != null) {
        delete views[key];
        delete stats[key];
        dropped++;
        console.log(`[DROP] ${song.title} — no usable original or ${(RESCUE_MIN_VIEWS / 1e6)}M+ upload`);
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      console.log(`[FAIL] ${song.title} (vocadbId ${key}): ${err.message}`);
    }
  }

  const updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(VIEWS_PATH, JSON.stringify({ updated, views }, null, 2));
  fs.writeFileSync(NNDSTATS_PATH, JSON.stringify({ updated, stats }, null, 2));
  console.log(`\nDone: ${fetched} fetched (${rescued} rescued), ${dropped} dropped, ${skipped} skipped, ${failed} failed`);
  console.log(`Written to ${VIEWS_PATH} and ${NNDSTATS_PATH}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
