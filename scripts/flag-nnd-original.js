#!/usr/bin/env node
// Flags every song in data/songs.json with whether it has an ORIGINAL NicoNico
// upload on VocaDB (PV with service "NicoNicoDouga" and pvType "Original").
//
// Songs whose only NicoNico presence is a Reprint / Other-media upload should NOT
// be in the games, because reprints can be deleted or carry different view counts
// (which ruins Higher or Lower streaks). This adds two fields per song:
//   nndOriginal   : boolean  — true if an original NND PV exists
//   nndOriginalId : string   — the original NND video id (e.g. "sm9714351"), "" if none
//
// Resumable: songs that already have `nndOriginal` set are skipped unless --force.
// Run: node scripts/flag-nnd-original.js [--force]
// Requires Node 18+ (built-in fetch).

const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "..", "data", "songs.json");
const JS_PATH = path.join(__dirname, "..", "data", "songs.js");
const DELAY_MS = 200; // polite spacing between VocaDB requests
const SAVE_EVERY = 25; // checkpoint to disk so partial runs are not lost
const FORCE = process.argv.includes("--force");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function writeFiles(songs) {
  const json = `${JSON.stringify(songs, null, 2)}\n`;
  fs.writeFileSync(JSON_PATH, json);
  fs.writeFileSync(JS_PATH, `window.VOCALOID_HEARDLE_SONGS = ${JSON.stringify(songs, null, 2)};\n`);
}

async function fetchPvs(id) {
  const res = await fetch(`https://vocadb.net/api/songs/${id}?fields=PVs&lang=English`, {
    headers: { "User-Agent": "sodapines-vocaloid-game/1.0 (nnd-original-flagger)" },
  });
  if (!res.ok) throw new Error(`VocaDB ${id} returned ${res.status}`);
  const data = await res.json();
  return data.pvs || data.PVs || [];
}

function findNndOriginal(pvs) {
  // Prefer an explicitly Original NicoNico PV. Never accept Reprint / Other.
  return pvs.find((pv) => pv.service === "NicoNicoDouga" && pv.pvType === "Original") || null;
}

function findYouTube(pvs) {
  // Prefer the official Original YouTube upload; fall back to any YouTube PV.
  return (
    pvs.find((pv) => pv.service === "Youtube" && pv.pvType === "Original") ||
    pvs.find((pv) => pv.service === "Youtube") ||
    null
  );
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

  let checked = 0;
  let original = 0;
  let reprintOnly = 0;
  let failed = 0;
  let skipped = 0;
  let processedSinceSave = 0;

  for (const song of songs) {
    // Resume only when BOTH the NND flag and the YouTube id have been recorded.
    if (!FORCE && typeof song.nndOriginal === "boolean" && typeof song.ytOriginalId === "string") {
      skipped++;
      continue;
    }

    try {
      await sleep(DELAY_MS);
      const pvs = await fetchPvs(song.vocadbId);
      const pv = findNndOriginal(pvs);
      song.nndOriginal = Boolean(pv);
      song.nndOriginalId = pv ? pv.pvId : "";
      const yt = findYouTube(pvs);
      song.ytOriginalId = yt ? yt.pvId : "";
      checked++;
      if (pv) {
        original++;
        console.log(`[ORIG] ${song.title} -> ${pv.pvId}`);
      } else {
        reprintOnly++;
        const nnd = pvs.filter((p) => p.service === "NicoNicoDouga").map((p) => p.pvType).join(",") || "none";
        console.log(`[DROP] ${song.title} (vocadbId ${song.vocadbId}) — no original NND PV [${nnd}]`);
      }
    } catch (err) {
      // Leave the field unset on failure so the song is not wrongly excluded.
      failed++;
      console.log(`[FAIL] ${song.title} (vocadbId ${song.vocadbId}): ${err.message}`);
    }

    if (++processedSinceSave >= SAVE_EVERY) {
      writeFiles(songs);
      processedSinceSave = 0;
    }
  }

  writeFiles(songs);
  console.log(
    `\nDone: ${checked} checked (${original} original, ${reprintOnly} reprint-only/dropped), ${failed} failed, ${skipped} skipped (already flagged).`
  );
  console.log(`Written to ${JSON_PATH} and ${JS_PATH}`);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
