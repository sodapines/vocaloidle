#!/usr/bin/env node
// Rebuilds data/artists.json from scratch using exact VocaDB artist IDs taken
// from each song's credits, instead of name search. Name search picked wrong
// entries for several artists (KAFU → a human producer, HACHI → a cover
// artist, Kagamine Len → a joke "DESI VER." entry). Song credits carry the
// real artist ID, so the picture is guaranteed to belong to the credited
// artist. Specific voicebank credits ("Hatsune Miku V4X (Original)") are also
// keyed by their exact name for the vocalists page.
//
// Names that never appear in credits fall back to a type-aware name search
// (vocal-synth types for vocalists, producer-ish types for producers).
// Placeholder images (< 2 KB transparent PNGs) are rejected everywhere.
//
// Run: node scripts/rebuild-artist-images.js   (takes several minutes)

const fs = require("fs");
const path = require("path");

const SONGS_PATH = path.join(__dirname, "..", "data", "songs.json");
const DETAILS_PATH = path.join(__dirname, "..", "data", "songdetails.json");
const OUT_PATH = path.join(__dirname, "..", "data", "artists.json");
const DELAY_MS = 200;
const MIN_BYTES = 2000;
const UA = { "User-Agent": "sodapines-vocaloid-game/1.0 (artist-image-rebuild)" };

const SYNTH_TYPES = new Set(["Vocaloid","UTAU","CeVIO","SynthesizerV","NEUTRINO","VoiSona","NewType","Voiceroid","OtherVoiceSynthesizer"]);
const PRODUCER_TYPES = new Set(["Producer","Circle","Band","Animator","Illustrator","OtherGroup","OtherIndividual"]);

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function getJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`VocaDB ${res.status}`);
  return res.json();
}

function picUrls(item) {
  const p = item && item.mainPicture;
  if (!p) return [];
  return [p.urlThumb, p.urlOriginal, p.urlSmallThumb].filter(Boolean);
}

async function imageOk(url) {
  try {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) return false;
    return (await res.arrayBuffer()).byteLength >= MIN_BYTES;
  } catch { return false; }
}

async function validPic(item) {
  for (const url of picUrls(item)) {
    await sleep(DELAY_MS);
    if (await imageOk(url)) return url;
  }
  return null;
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(SONGS_PATH, "utf8"));
  let details = {};
  try { details = JSON.parse(fs.readFileSync(DETAILS_PATH, "utf8")).songs || {}; } catch {}

  // Every name the site looks up, with its role.
  const needed = new Map(); // exact name -> "producer" | "vocalist"
  for (const s of songs) {
    for (const n of s.producerNames || []) if (n) needed.set(n, "producer");
    if (s.artist && !/^various/i.test(s.artist) && !needed.has(s.artist)) needed.set(s.artist, "producer");
    for (const n of s.singerNames || []) if (n && !/various/i.test(n)) needed.set(n, "vocalist");
  }
  for (const d of Object.values(details))
    for (const n of d.vocalists || []) if (n && !/various/i.test(n) && !needed.has(n)) needed.set(n, "vocalist");
  console.log(`${needed.size} unique names to resolve.`);

  // Pass 1: harvest exact artist IDs from song credits. Stop early once every
  // needed name is covered.
  const idByName = new Map(); // lowercased credit name -> artist id
  const neededLower = new Map([...needed.keys()].map((n) => [n.toLowerCase(), n]));
  const covered = () => [...neededLower.keys()].every((k) => idByName.has(k));
  let processed = 0;
  for (const s of songs) {
    if (covered()) break;
    // Only fetch songs that can still contribute an uncovered name.
    const candidates = [
      ...(s.producerNames || []), s.artist || "",
      ...(s.singerNames || []),
      ...((details[String(s.vocadbId)] || {}).vocalists || []),
    ].filter((n) => n && neededLower.has(n.toLowerCase()) && !idByName.has(n.toLowerCase()));
    if (!candidates.length) continue;
    try {
      await sleep(DELAY_MS);
      const data = await getJson(`https://vocadb.net/api/songs/${s.vocadbId}?fields=Artists&lang=English`);
      for (const a of data.artists || []) {
        if (!a.artist || !a.artist.id) continue;
        const key = String(a.name || a.artist.name || "").toLowerCase();
        if (key && !idByName.has(key)) idByName.set(key, a.artist.id);
        const key2 = String(a.artist.name || "").toLowerCase();
        if (key2 && !idByName.has(key2)) idByName.set(key2, a.artist.id);
      }
    } catch (err) {
      console.log(`[SONG FAIL] ${s.vocadbId}: ${err.message}`);
    }
    if (++processed % 50 === 0) console.log(`  …credits pass: ${processed} songs fetched`);
  }
  console.log(`Credit pass done: ${idByName.size} credit names collected.`);

  // Pass 2: fetch each needed artist's picture by exact ID.
  const artistCache = new Map(); // id -> validated url or ""
  const images = {};
  let done = 0, viaId = 0, viaSearch = 0, none = 0;

  async function typeAwareSearch(name, role) {
    const allowed = role === "vocalist" ? SYNTH_TYPES : PRODUCER_TYPES;
    for (const mode of ["Exact", "Auto"]) {
      let items;
      try {
        await sleep(DELAY_MS);
        items = (await getJson(
          `https://vocadb.net/api/artists?query=${encodeURIComponent(name)}&maxResults=8&nameMatchMode=${mode}&fields=MainPicture&lang=English`
        )).items || [];
      } catch { continue; }
      for (const item of items.filter((i) => allowed.has(i.artistType))) {
        const url = await validPic(item);
        if (url) return url;
      }
    }
    return null;
  }

  for (const [name, role] of needed) {
    const id = idByName.get(name.toLowerCase());
    let url = null;
    if (id != null) {
      if (artistCache.has(id)) url = artistCache.get(id) || null;
      else {
        try {
          await sleep(DELAY_MS);
          const item = await getJson(`https://vocadb.net/api/artists/${id}?fields=MainPicture&lang=English`);
          url = await validPic(item);
        } catch {}
        artistCache.set(id, url || "");
      }
      if (url) viaId++;
    }
    if (!url) {
      url = await typeAwareSearch(name, role);
      if (url) { viaSearch++; console.log(`[SEARCH] ${name} -> ${url}`); }
    }
    if (!url) { none++; }
    images[name] = url || "";
    if (++done % 40 === 0) {
      fs.writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), images }, null, 2));
      console.log(`  …images: ${done}/${needed.size}`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), images }, null, 2));
  console.log(`Done: ${viaId} via credit ID, ${viaSearch} via typed search, ${none} without picture. ${needed.size} names.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
