const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const jsonPath = path.join(rootDir, "data", "songs.json");
const jsPath = path.join(rootDir, "data", "songs.js");
const poolLists = [
  { id: 186, tag: "nnd-100k", name: "(NND) More than 100K views" },
  { id: 30, tag: "nnd-1m", name: "(NND) More than 1M views" },
  { id: 6477, tag: "nnd-10m", name: "(NND) More than 10M views" },
  { id: 2665, tag: "yt-1m", name: "(YT) More than 1M views" },
  { id: 6478, tag: "yt-10m", name: "(YT) More than 10M views" },
  { id: 10463, tag: "yt-100m", name: "(YT) More than 100M views" },
  { id: 12694, tag: "project-sekai", name: "Game: Project SEKAI COLORFUL STAGE! feat. Hatsune Miku" },
  { id: 9375, tag: "project-sekai", name: "Game: Project SEKAI COLORFUL STAGE! feat. Hatsune Miku (Original Songs)" },
  { id: 10219, tag: "project-sekai", name: "Contest: Project SEKAI COLORFUL STAGE! feat. Hatsune Miku (Song Contest Winners)" },
];
const managedPoolTags = new Set(poolLists.map((pool) => pool.tag));
const managedPoolNames = new Set(poolLists.map((pool) => pool.name.toLowerCase()));

function cleanName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function unique(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const cleaned = cleanName(value);
    const key = cleaned.toLowerCase();

    if (cleaned && !seen.has(key)) {
      seen.add(key);
      result.push(cleaned);
    }
  }

  return result;
}

async function fetchPoolSongIds(pool) {
  const ids = new Set();
  const maxResults = 100;
  let start = 0;

  while (true) {
    const url = new URL(`https://vocadb.net/api/songLists/${pool.id}/songs`);
    url.searchParams.set("start", String(start));
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("getTotalCount", "true");
    url.searchParams.set("fields", "AdditionalNames");
    url.searchParams.set("lang", "English");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${pool.name} returned ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || [];
    items.forEach((item) => {
      const id = item?.song?.id;
      if (id) ids.add(String(id));
    });

    start += items.length;
    if (items.length === 0 || start >= (data.totalCount || 0)) break;
  }

  return ids;
}

async function main() {
  const songs = JSON.parse(await fs.readFile(jsonPath, "utf8"));
  const memberships = new Map();

  for (const pool of poolLists) {
    const ids = await fetchPoolSongIds(pool);
    console.log(`${pool.name}: ${ids.size} VocaDB songs`);
    ids.forEach((id) => {
      const current = memberships.get(id) || [];
      current.push(pool);
      memberships.set(id, current);
    });
  }

  let taggedSongs = 0;
  const enriched = songs.map((song) => {
    const songPools = memberships.get(String(song.vocadbId)) || [];
    if (songPools.length > 0) taggedSongs += 1;

    const existingTags = (song.sourceTags || []).filter((tag) => !managedPoolTags.has(tag));
    const existingPools = (song.vocadbPools || []).filter((name) => !managedPoolNames.has(cleanName(name).toLowerCase()));

    return {
      ...song,
      vocadbPools: unique([...existingPools, ...songPools.map((pool) => pool.name)]),
      sourceTags: unique([...existingTags, ...songPools.map((pool) => pool.tag)]),
    };
  });

  await fs.writeFile(jsonPath, `${JSON.stringify(enriched, null, 2)}\n`);
  await fs.writeFile(jsPath, `window.VOCALOID_HEARDLE_SONGS = ${JSON.stringify(enriched, null, 2)};\n`);

  console.log(`Local songs checked: ${songs.length}`);
  console.log(`Local songs tagged with milestone pools: ${taggedSongs}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
