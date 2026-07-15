#!/usr/bin/env node
// Validates every image URL in data/artists.json. VocaDB serves a tiny
// transparent placeholder PNG (~876 bytes) for artists whose matched entry has
// no real picture (e.g. HACHI), which renders as a blank tile on the producers
// page. Any image smaller than MIN_BYTES is treated as bad; the artist is then
// re-resolved against the VocaDB API, testing each candidate's picture until
// one passes. Unresolvable entries are blanked so pages fall back to song art.
//
// Run: node scripts/validate-artist-images.js

const fs = require("fs");
const path = require("path");

const OUT_PATH = path.join(__dirname, "..", "data", "artists.json");
const MIN_BYTES = 2000;
const DELAY_MS = 200;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function imageOk(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "sodapines-vocaloid-game/1.0 (artist-image-validator)" } });
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    return buf.byteLength >= MIN_BYTES;
  } catch { return false; }
}

function picUrls(item) {
  const p = item && item.mainPicture;
  if (!p) return [];
  return [p.urlThumb, p.urlSmallThumb, p.urlOriginal].filter(Boolean);
}

async function searchArtists(name, matchMode) {
  const url = `https://vocadb.net/api/artists?query=${encodeURIComponent(name)}`
    + `&maxResults=6&nameMatchMode=${matchMode}&fields=MainPicture,AdditionalNames&lang=English`;
  const res = await fetch(url, { headers: { "User-Agent": "sodapines-vocaloid-game/1.0 (artist-image-validator)" } });
  if (!res.ok) throw new Error(`VocaDB ${res.status}`);
  return (await res.json()).items || [];
}

async function reResolve(name) {
  for (const mode of ["Exact", "Auto"]) {
    let items;
    try { items = await searchArtists(name, mode); } catch { continue; }
    for (const item of items) {
      for (const url of picUrls(item)) {
        await sleep(DELAY_MS);
        if (await imageOk(url)) return url;
      }
    }
  }
  return null;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
  const images = data.images || {};
  const names = Object.keys(images).filter((n) => images[n]);
  let ok = 0, fixed = 0, blanked = 0, done = 0;

  for (const name of names) {
    await sleep(DELAY_MS);
    if (await imageOk(images[name])) { ok++; }
    else {
      const url = await reResolve(name);
      if (url) { images[name] = url; fixed++; console.log(`[FIXED] ${name} -> ${url}`); }
      else { images[name] = ""; blanked++; console.log(`[BLANK] ${name}`); }
    }
    if (++done % 40 === 0) {
      fs.writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), images }, null, 2));
      console.log(`  …${done}/${names.length}`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), images }, null, 2));
  console.log(`Done: ${ok} ok, ${fixed} fixed, ${blanked} blanked of ${names.length}.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
