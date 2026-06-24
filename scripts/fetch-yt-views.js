#!/usr/bin/env node
// Fetches YouTube stats (views, likes, comments) for every song that has a
// YouTube PV id (song.ytOriginalId, populated by scripts/flag-nnd-original.js)
// and writes data/ytviews.json — the YouTube counterpart to data/views.json.
//
// The YouTube Data API v3 lets us batch up to 50 video ids per request, and
// `part=statistics` returns views, likes AND comments in that single call — so
// the whole catalogue costs only ~30 quota units (daily free quota is 10,000).
//
// Setup:
//   1. Create a YouTube Data API v3 key in the Google Cloud console.
//   2. Provide it via the YT_API_KEY environment variable (never commit it):
//        bash/zsh:    YT_API_KEY=xxxx node scripts/fetch-yt-views.js
//        PowerShell:  $env:YT_API_KEY="xxxx"; node scripts/fetch-yt-views.js
//
// Requires Node 18+ (built-in fetch).

const fs = require("fs");
const path = require("path");

const SONGS_PATH = path.join(__dirname, "..", "data", "songs.json");
const VIEWS_PATH = path.join(__dirname, "..", "data", "ytviews.json");
const API_KEY = process.env.YT_API_KEY;
const BATCH = 50;
const DELAY_MS = 200;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchStats(ids) {
  // part=statistics,status — both are free (videos.list is 1 unit per call regardless).
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,status&id=${ids.join(",")}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const out = {};
  for (const item of data.items || []) {
    const st = item.statistics || {};
    out[item.id] = {
      views: st.viewCount != null ? parseInt(st.viewCount, 10) : null,
      likes: st.likeCount != null ? parseInt(st.likeCount, 10) : null,       // hidden on some videos
      comments: st.commentCount != null ? parseInt(st.commentCount, 10) : null, // disabled on some
      embeddable: item.status ? item.status.embeddable !== false : true,     // false => can't embed in-page
    };
  }
  return out;
}

async function main() {
  if (!API_KEY) {
    console.error("Missing YT_API_KEY environment variable. See the header of this file.");
    process.exit(1);
  }

  const songs = JSON.parse(fs.readFileSync(SONGS_PATH, "utf8"));

  // Map each unique YouTube id to the songs that use it.
  const idToSongs = new Map();
  for (const song of songs) {
    const id = song.ytOriginalId;
    if (!id) continue;
    if (!idToSongs.has(id)) idToSongs.set(id, []);
    idToSongs.get(id).push(song.vocadbId);
  }
  const ids = [...idToSongs.keys()];
  console.log(`${ids.length} unique YouTube ids across ${songs.length} songs`);

  const stats = {};
  let resolved = 0, missing = 0;

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    await sleep(DELAY_MS);
    let batchStats;
    try {
      batchStats = await fetchStats(batch);
    } catch (err) {
      console.log(`[FAIL] batch ${i / BATCH + 1}: ${err.message}`);
      continue;
    }
    for (const id of batch) {
      const s = batchStats[id];
      if (!s || s.views == null) { missing++; continue; } // deleted / private / removed
      for (const vocadbId of idToSongs.get(id)) stats[String(vocadbId)] = s;
      resolved++;
    }
    console.log(`[OK] ${Math.min(i + BATCH, ids.length)}/${ids.length} ids processed`);
  }

  fs.writeFileSync(VIEWS_PATH, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), stats }, null, 2));
  console.log(`\nDone: ${resolved} videos resolved, ${missing} unavailable.`);
  console.log(`Written to ${VIEWS_PATH}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
