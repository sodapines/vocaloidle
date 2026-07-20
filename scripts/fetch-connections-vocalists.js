// Build the vocalist map used only by VOCALOID Connections.
// Supporting/subvocal credits are excluded via VocaDB's isSupport flag.
//
// Usage: node scripts/fetch-connections-vocalists.js

const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const songsPath = path.join(rootDir, "data", "songs.json");
const outPath = path.join(rootDir, "data", "connections-vocalists.json");
const API = "https://vocadb.net/api/songs";
const CONCURRENCY = 4;
const RETRIES = 3;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function fetchSong(id) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const response = await fetch(`${API}/${id}?fields=Artists&lang=English`, {
        headers: { "User-Agent": "VOCALOIDLE-Connections/1.0 (vocalist data)" },
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      if (attempt === RETRIES) throw error;
      await sleep(600 * attempt);
    }
  }
  return null;
}

function mainVocalists(data) {
  const names = [];
  for (const credit of (data && data.artists) || []) {
    const name = String(credit.name || "").trim();
    const categories = String(credit.categories || "");
    const roles = String(credit.effectiveRoles || credit.roles || "");
    if (name && /Vocalist/i.test(categories) && !credit.isSupport && !/Support/i.test(roles)) names.push(name);
  }
  return [...new Set(names)];
}

async function main() {
  const songs = JSON.parse(await fs.readFile(songsPath, "utf8"));
  const ids = songs.map(song => song.vocadbId).filter(Boolean);
  const vocalists = {};
  let cursor = 0;
  let failed = 0;

  async function worker() {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      try {
        vocalists[String(id)] = mainVocalists(await fetchSong(id));
      } catch (error) {
        failed++;
        console.error(`VocaDB ${id}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const sorted = Object.fromEntries(Object.entries(vocalists).sort((a, b) => Number(a[0]) - Number(b[0])));
  const updated = new Date().toISOString().slice(0, 10);
  await fs.writeFile(outPath, JSON.stringify({ updated, vocalists: sorted }));
  console.log(`Connections vocalists: ${Object.keys(sorted).length} songs, ${failed} failed.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
