#!/usr/bin/env node
// Builds data/artists.json — a { name: imageUrl } map of VocaDB artist pictures
// for every vocalist and producer referenced in data/songs.json. The song pages
// use it to show real avatars instead of letter placeholders.
//
// Resumable: names already in the map are skipped unless --force.
// Run: node scripts/fetch-artist-images.js [--force]
// Requires Node 18+ (built-in fetch).

const fs = require("fs");
const path = require("path");

const SONGS_PATH = path.join(__dirname, "..", "data", "songs.json");
const OUT_PATH = path.join(__dirname, "..", "data", "artists.json");
const DELAY_MS = 250;
const SAVE_EVERY = 40;
const FORCE = process.argv.includes("--force");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function picUrl(item) {
  const p = item && item.mainPicture;
  return p ? (p.urlThumb || p.urlSmallThumb || p.urlOriginal || null) : null;
}

async function searchArtists(name, matchMode) {
  const url = `https://vocadb.net/api/artists?query=${encodeURIComponent(name)}`
    + `&maxResults=5&nameMatchMode=${matchMode}&fields=MainPicture,AdditionalNames&lang=English`;
  const res = await fetch(url, { headers: { "User-Agent": "sodapines-vocaloid-game/1.0 (artist-image-fetcher)" } });
  if (!res.ok) throw new Error(`VocaDB ${res.status}`);
  return (await res.json()).items || [];
}

// Pick the best result WITH a picture. Some artists have a pictureless duplicate
// entry plus a real one under an alias (e.g. "32ki" → "Satsuki"), so we can't just
// take the first hit — we take the first relevance-ranked result that has a picture.
async function resolveImage(name) {
  for (const mode of ["Exact", "Auto"]) {
    let items;
    try { items = await searchArtists(name, mode); }
    catch (err) { if (mode === "Auto") throw err; else continue; }
    const withPic = items.find((i) => picUrl(i));
    if (withPic) return picUrl(withPic);
  }
  return null;
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(SONGS_PATH, "utf8"));

  let images = {};
  try { images = JSON.parse(fs.readFileSync(OUT_PATH, "utf8")).images || {}; } catch {}

  const names = new Set();
  for (const s of songs) {
    for (const n of s.producerNames || []) if (n) names.add(n);
    for (const n of s.singerNames || []) if (n && !/various/i.test(n)) names.add(n);
  }

  let found = 0, none = 0, failed = 0, skipped = 0, since = 0;
  for (const name of names) {
    // Skip names we already have a picture for; retry the empties (they may now
    // resolve via the improved alias-aware lookup).
    if (!FORCE && images[name]) { skipped++; continue; }
    try {
      await sleep(DELAY_MS);
      const url = await resolveImage(name);
      images[name] = url || ""; // "" = looked up, no picture (don't retry next run)
      if (url) { found++; console.log(`[IMG]  ${name}`); }
      else { none++; console.log(`[NONE] ${name}`); }
    } catch (err) {
      failed++;
      console.log(`[FAIL] ${name}: ${err.message}`);
    }
    if (++since >= SAVE_EVERY) {
      fs.writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), images }, null, 2));
      since = 0;
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), images }, null, 2));
  console.log(`\nDone: ${found} with picture, ${none} none, ${failed} failed, ${skipped} skipped. ${names.size} unique names.`);
  console.log(`Written to ${OUT_PATH}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
