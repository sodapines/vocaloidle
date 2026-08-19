// Backfills `synthEngines` (and keeps `synthNames` in sync) on every song in
// data/songs.json by re-fetching its VocaDB artist credits and reading each
// vocalist's real artistType (Vocaloid / UTAU / SynthesizerV / CeVIO / …).
// add.html already captures this for newly-submitted songs; this covers the
// older entries that predate that.
//
// Writes data/songs.json in place. Safe to re-run: songs that already have
// synthEngines are skipped unless --force is passed.
//
// Usage: node scripts/backfill-synth-engine.js [--limit N] [--force]

const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const songsPath = path.join(rootDir, "data", "songs.json");

const API = "https://vocadb.net/api/songs";
const CONCURRENCY = 4;
const RETRIES = 3;

const args = process.argv.slice(2);
const force = args.includes("--force");
const limitArg = args.indexOf("--limit");
const limit = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : Infinity;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJson(url) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "VOCALOIDLE-39charts/1.0 (data enrichment)" },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === RETRIES) throw err;
      await sleep(600 * attempt);
    }
  }
  return null;
}

// Mirrors add.html's SYNTH_ARTIST_TYPES: anything credited as a vocalist with
// one of these artistTypes is a synth voice, not a human guest singer.
const SYNTH_ARTIST_TYPES = /^(Vocaloid|UTAU|CeVIO|SynthesizerV|NEUTRINO|VoiSona|NewType|Voiceroid|AIVoice|OtherVoiceSynthesizer)$/i;

function pickEngines(data) {
  if (!data) return null;
  const synthNames = [];
  const synthEngines = [];
  for (const a of data.artists || []) {
    if (!/Vocalist/i.test(a.categories || "")) continue;
    const artist = a.artist || {};
    const name = String(artist.name || a.name || "").trim();
    const type = String(artist.artistType || "");
    if (!name || !SYNTH_ARTIST_TYPES.test(type)) continue;
    synthNames.push(name);
    if (!synthEngines.includes(type)) synthEngines.push(type);
  }
  return { synthNames, synthEngines };
}

async function main() {
  const songs = JSON.parse(await fs.readFile(songsPath, "utf8"));

  const pending = songs
    .filter(s => s.vocadbId && (force || !Array.isArray(s.synthEngines)))
    .slice(0, limit);

  console.log(`songs: ${songs.length}, already tagged: ${songs.filter(s => Array.isArray(s.synthEngines)).length}, to fetch: ${pending.length}`);

  let done = 0, failed = 0;
  const queue = [...pending];

  async function worker() {
    while (queue.length) {
      const song = queue.shift();
      try {
        const data = await fetchJson(`${API}/${song.vocadbId}?fields=Artists&lang=English`);
        const picked = pickEngines(data);
        if (picked) {
          song.synthNames = picked.synthNames;
          song.synthEngines = picked.synthEngines;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
        console.warn(`  ! ${song.vocadbId}: ${err.message}`);
      }
      done++;
      if (done % 100 === 0) {
        console.log(`  ${done}/${pending.length}…`);
        await fs.writeFile(songsPath, JSON.stringify(songs));
      }
      await sleep(120); // stay polite: ~8 req/s across 4 workers
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await fs.writeFile(songsPath, JSON.stringify(songs));

  const breakdown = {};
  for (const s of songs) {
    for (const e of s.synthEngines || []) breakdown[e] = (breakdown[e] || 0) + 1;
  }
  console.log(`done. fetched ${done}, failed ${failed}. engine breakdown:`, breakdown);
}

main().catch(err => { console.error(err); process.exit(1); });
