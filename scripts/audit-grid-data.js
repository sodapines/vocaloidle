const fs = require("node:fs");
const path = require("node:path");
const Grid = require("../masume/core.js");

const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, "data", file), "utf8"));
const songs = read("songs.json");
const details = read("songdetails.json").songs || {};
const nico = read("views.json").views || {};
const youtube = read("ytviews.json").stats || {};
const bilibili = read("biliviews.json").stats || {};
const sources = { nico, youtube, bilibili };

const ids = new Set();
const duplicateIds = [];
const missingDetails = [], missingLanguage = [], missingTags = [], missingViews = [];
const aliasOnlyOneWord = [];

for (const song of songs) {
  const id = String(song.vocadbId);
  if (ids.has(id)) duplicateIds.push(id);
  ids.add(id);
  const info = details[id];
  if (!info) missingDetails.push(id);
  if (!info || !Array.isArray(info.langs) || !info.langs.length) missingLanguage.push(id);
  if (!info || !Array.isArray(info.tags) || !info.tags.length) missingTags.push(id);
  if (Grid.combinedViews(song, sources) == null) missingViews.push(id);
  const canonical = String(song.title || "").normalize("NFKC").trim();
  if (Grid.isOneWordTitle(song) && /\s/u.test(canonical)) aliasOnlyOneWord.push(id);
}

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    songs: songs.length,
    details: songs.length - missingDetails.length,
    languages: songs.length - missingLanguage.length,
    tags: songs.length - missingTags.length,
    trackedViews: songs.length - missingViews.length,
  },
  issues: { duplicateIds, missingDetails, missingLanguage, missingTags, missingViews, aliasOnlyOneWord },
};

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Grid data audit · ${songs.length} songs`);
  console.log(`details ${report.totals.details}/${songs.length} · languages ${report.totals.languages}/${songs.length} · tags ${report.totals.tags}/${songs.length} · views ${report.totals.trackedViews}/${songs.length}`);
  for (const [name, values] of Object.entries(report.issues)) {
    console.log(`${name}: ${values.length}${values.length ? ` · ${values.slice(0, 20).join(", ")}${values.length > 20 ? "…" : ""}` : ""}`);
  }
}

if (process.argv.includes("--strict") && (duplicateIds.length || missingDetails.length)) process.exitCode = 1;
