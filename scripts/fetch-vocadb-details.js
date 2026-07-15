// Fetch per-song details from the VocaDB API that songs.json lacks:
//   - full artist credits (fixes "Various artists" — real producers + roles, real vocalists)
//   - songType (Original / Remaster / Remix / Cover / …)
//   - cultureCodes (song languages)
//   - top community tags ("catchy", "2D animated PV", …) for the song page tag bar
// Writes data/songdetails.json keyed by vocadbId. Safe to re-run: already
// fetched ids are kept unless --force is passed.
//
// Usage: node scripts/fetch-vocadb-details.js [--limit N] [--force]

const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const songsPath = path.join(rootDir, "data", "songs.json");
const outPath = path.join(rootDir, "data", "songdetails.json");

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

// Vocalist credit names carry voicebank suffixes ("Hatsune Miku V3 (Dark)");
// keep the raw name — the site's normaliser already handles matching.
function pickDetails(data) {
  if (!data) return null;
  const producers = [];
  const vocalists = [];
  for (const a of data.artists || []) {
    const name = String(a.name || "").trim();
    if (!name) continue;
    const categories = String(a.categories || "");
    const roles = String(a.effectiveRoles || a.roles || "").replace(/^Default$/, "");
    if (/Vocalist/i.test(categories)) {
      if (!/Support/i.test(roles)) vocalists.push(name);
    } else if (/Producer|Circle|Band/i.test(categories)) {
      producers.push({ name, roles });
    }
  }
  // Top community tags by vote count. Skip the vocalist/language ones that the
  // site already surfaces through its own chips.
  const SKIP_TAGS = /^(japanese|english|chinese|korean|spanish)$/i;
  const tags = (data.tags || [])
    .filter(t => t.tag && t.tag.name && !SKIP_TAGS.test(t.tag.name) && t.tag.categoryName !== "Vocalists" && t.tag.categoryName !== "Languages")
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 8)
    .map(t => t.tag.name);
  return {
    type: data.songType || null,
    langs: Array.isArray(data.cultureCodes) ? data.cultureCodes : [],
    producers,
    vocalists,
    tags,
  };
}

async function main() {
  const songs = JSON.parse(await fs.readFile(songsPath, "utf8"));
  let existing = { updated: null, songs: {} };
  try { existing = JSON.parse(await fs.readFile(outPath, "utf8")); } catch {}
  if (!existing.songs || typeof existing.songs !== "object") existing.songs = {};

  const pending = songs
    .map(s => s.vocadbId)
    .filter(id => id && (force || !existing.songs[String(id)]))
    .slice(0, limit);

  console.log(`songs: ${songs.length}, already cached: ${Object.keys(existing.songs).length}, to fetch: ${pending.length}`);

  let done = 0, failed = 0;
  const queue = [...pending];

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      try {
        const data = await fetchJson(`${API}/${id}?fields=Artists,CultureCodes,Tags&lang=English`);
        const details = pickDetails(data);
        if (details) existing.songs[String(id)] = details;
        else failed++;
      } catch (err) {
        failed++;
        console.warn(`  ! ${id}: ${err.message}`);
      }
      done++;
      if (done % 100 === 0) {
        console.log(`  ${done}/${pending.length}…`);
        existing.updated = new Date().toISOString().slice(0, 10);
        await fs.writeFile(outPath, JSON.stringify(existing));
      }
      await sleep(120); // stay polite: ~8 req/s across 4 workers
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  existing.updated = new Date().toISOString().slice(0, 10);
  await fs.writeFile(outPath, JSON.stringify(existing));

  const types = {};
  for (const d of Object.values(existing.songs)) types[d.type] = (types[d.type] || 0) + 1;
  console.log(`done. fetched ${done}, failed ${failed}. songType breakdown:`, types);
}

main().catch(err => { console.error(err); process.exit(1); });
