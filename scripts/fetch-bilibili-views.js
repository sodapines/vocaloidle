#!/usr/bin/env node
// Builds data/biliviews.json — live bilibili view counts for every song whose
// VocaDB entry lists a Bilibili PV (Original preferred, Reprint accepted).
//
//   { updated: "YYYY-MM-DD", stats: { "<vocadbId>": { views, likes, comments, id } } }
//
// Two-step per song: VocaDB /api/songs/{id}?fields=PVs for the PV id, then
// bilibili /x/web-interface/view for the live stat. Songs with no Bilibili PV
// are recorded as null so re-runs skip them; pass --force to re-check all.
//
// Run: node scripts/fetch-bilibili-views.js [--force] [--refresh]
//   --refresh re-fetches live stats for songs that already have a stored
//   bilibili id (no VocaDB round-trip), e.g. to update views/likes/comments.

const fs = require("fs");
const path = require("path");

const SONGS_PATH = path.join(__dirname, "..", "data", "songs.json");
const OUT_PATH = path.join(__dirname, "..", "data", "biliviews.json");
const DELAY_MS = 300;
const SAVE_EVERY = 40;
const FORCE = process.argv.includes("--force");
const REFRESH = process.argv.includes("--refresh");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function getJson(url, headers) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function biliPv(vocadbId) {
  const data = await getJson(
    `https://vocadb.net/api/songs/${vocadbId}?fields=PVs`,
    { "User-Agent": "sodapines-vocaloid-game/1.0 (bilibili-views)" }
  );
  const pvs = (data.pvs || []).filter((p) => p.service === "Bilibili" && !p.disabled);
  return pvs.find((p) => p.pvType === "Original") || pvs.find((p) => p.pvType === "Reprint") || null;
}

async function biliViews(pv) {
  const s = String(pv.pvId || pv.url || "");
  const bv = s.match(/BV[0-9A-Za-z]+/);
  const aid = s.replace(/\D/g, "");
  const q = bv ? `bvid=${bv[0]}` : (aid ? `aid=${aid}` : null);
  if (!q) return null;
  const data = await getJson(
    `https://api.bilibili.com/x/web-interface/view?${q}`,
    { "User-Agent": "Mozilla/5.0", Referer: "https://www.bilibili.com" }
  );
  if (data.code !== 0 || !data.data || !data.data.stat) return null;
  const stat = data.data.stat;
  const out = { views: stat.view, likes: stat.like, comments: stat.reply, id: bv ? bv[0] : aid };
  if (data.data.pic) out.pic = String(data.data.pic).replace(/^http:/, "https:");
  return out;
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(SONGS_PATH, "utf8"));
  let out = { stats: {}, checked: {} };
  try {
    const prev = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
    out.stats = prev.stats || {};
    out.checked = prev.checked || {};
  } catch {}

  const save = () => fs.writeFileSync(OUT_PATH, JSON.stringify({
    updated: new Date().toISOString().slice(0, 10),
    stats: out.stats,
    checked: out.checked,
  }, null, 1));

  let found = 0, none = 0, failed = 0, skipped = 0, since = 0;
  for (const s of songs) {
    const key = String(s.vocadbId);
    if (REFRESH && out.stats[key] && out.stats[key].id) {
      // Re-hit bilibili directly with the stored id — no VocaDB round-trip.
      try {
        await sleep(DELAY_MS);
        const r = await biliViews({ pvId: out.stats[key].id });
        if (r) { out.stats[key] = r; found++; console.log(`[BILI] ${s.title}: ${r.views.toLocaleString()} views, ${r.likes.toLocaleString()} likes`); }
        else failed++;
      } catch (err) { failed++; console.log(`[FAIL] ${key}: ${err.message}`); }
      if (++since >= SAVE_EVERY) { save(); since = 0; }
      continue;
    }
    // checked[key] === 0 means "no bilibili PV" — skip unless forced.
    if (!FORCE && (out.stats[key] || out.checked[key] === 0)) { skipped++; continue; }
    try {
      await sleep(DELAY_MS);
      const pv = await biliPv(s.vocadbId);
      if (!pv) { out.checked[key] = 0; none++; }
      else {
        await sleep(DELAY_MS);
        const r = await biliViews(pv);
        if (r) { out.stats[key] = r; out.checked[key] = 1; found++; console.log(`[BILI] ${s.title}: ${r.views.toLocaleString()}`); }
        else { out.checked[key] = 0; none++; }
      }
    } catch (err) {
      failed++;
      console.log(`[FAIL] ${key}: ${err.message}`);
    }
    if (++since >= SAVE_EVERY) { save(); since = 0; console.log(`  …${found} found, ${none} none, ${failed} failed`); }
  }
  save();
  console.log(`Done: ${found} with bilibili views, ${none} without, ${failed} failed, ${skipped} skipped.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
