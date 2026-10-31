#!/usr/bin/env node
// Weekly tournament step. Closes the open round using the Worker's tally, opens the
// next one, archives a finished bracket, and starts the next tournament.
//
// Run: TOURNAMENT_API=https://... TOURNAMENT_ADMIN_TOKEN=... node scripts/advance-tournament.js
// With no current tournament, it only starts one and needs neither variable.

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Core = require("../tournament/core.js");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "data", "tournament");
const read = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { if (fallback !== undefined) return fallback; throw new Error(`Cannot read ${file}`); } };
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value));
const WEEK = 7 * 864e5;
const YT_ID = /(?:ytimg\.com|youtube\.com)\/vi\/([\w-]{11})/;

function loadFixes() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, "song-fixes.js"), "utf8"), { window, Set });
  return window.VocaSongFixes;
}

async function youtubeLive(id) {
  try { return (await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`, { signal: AbortSignal.timeout(10000) })).ok; }
  catch { return false; }
}
async function nicoLive(id) {
  try { return (await (await fetch(`https://ext.nicovideo.jp/api/getthumbinfo/${id}`, { signal: AbortSignal.timeout(10000) })).text()).includes('status="ok"'); }
  catch { return false; }
}

/* Main upload first; a Topic upload only when nothing else is live. */
async function findLink(song, topic, biliStats) {
  const ids = [song.ytOriginalId, ...[song.coverArt, ...(song.coverArts || [])].map(url => (String(url).match(YT_ID) || [])[1])].filter(Boolean);
  const unique = [...new Set(ids)];
  for (const id of unique.filter(id => !topic.has(id))) if (await youtubeLive(id)) return { service: "YouTube", url: `https://www.youtube.com/watch?v=${id}` };
  if (song.nndOriginalId && await nicoLive(song.nndOriginalId)) return { service: "NicoNico", url: `https://www.nicovideo.jp/watch/${song.nndOriginalId}` };
  const bili = biliStats[String(song.vocadbId)];
  if (bili && bili.id) return { service: "bilibili", url: `https://www.bilibili.com/video/${/^BV/i.test(bili.id) ? bili.id : `av${bili.id}`}` };
  for (const id of unique.filter(id => topic.has(id))) if (await youtubeLive(id)) return { service: "YouTube", url: `https://www.youtube.com/watch?v=${id}` };
  return null;
}

function cover(song, fixes) {
  const urls = fixes.withoutTopic([...new Set([...(song.ytOriginalId ? [`https://i.ytimg.com/vi/${song.ytOriginalId}/hqdefault.jpg`] : []), song.coverArt, ...(song.coverArts || [])].filter(url => url && !/nicovideo\.jp\/watch|bilibili\.com\/video/.test(url)))]);
  return urls[0] || "";
}

async function startTournament(number, now) {
  const songs = read(path.join(root, "data", "songs.json"));
  const nico = read(path.join(root, "data", "views.json"), { views: {} }).views;
  const yt = read(path.join(root, "data", "ytviews.json"), { stats: {} }).stats;
  const bili = read(path.join(root, "data", "biliviews.json"), { stats: {} }).stats;
  const topic = new Set(read(path.join(root, "data", "thumb-checks.json"), { topic: [] }).topic);
  const usedFile = path.join(dir, "used.json");
  let used = new Set(read(usedFile, []).map(String));
  const fixes = loadFixes();
  const views = id => (nico[id] || 0) + ((yt[id] && yt[id].views) || 0) + ((bili[id] && bili[id].views) || 0);
  const catalogue = songs.map(song => ({ id: String(song.vocadbId), views: views(String(song.vocadbId)), song })).filter(entry => entry.views > 0);
  let eligible = catalogue.filter(entry => !used.has(entry.id));
  if (eligible.length < 128) { used = new Set(); eligible = catalogue; } // Everything has had a turn: start over.

  const entries = new Map();
  const excluded = new Set();
  const seed = (number * 2654435761 + now.getUTCFullYear()) >>> 0;
  for (let attempt = 0; attempt < 30; attempt++) {
    const field = Core.pickField(eligible.filter(entry => !excluded.has(entry.id)), seed);
    const picks = [...field.top, ...field.mid, ...field.gem];
    let dead = 0;
    for (const entry of picks) {
      if (entries.has(entry.id)) continue;
      const link = await findLink(entry.song, topic, bili);
      if (link) entries.set(entry.id, link); else { excluded.add(entry.id); dead++; }
    }
    console.log(`attempt ${attempt + 1}: ${dead} song(s) without a live link`);
    if (dead) continue;
    const decorate = entry => ({ id: entry.id, title: entry.song.title, artist: fixes.artist(entry.song), year: String(entry.song.publishDate || "").slice(0, 4), views: entry.views, cover: cover(entry.song, fixes), link: entries.get(entry.id) });
    const entrants = Core.buildBracket({ top: field.top.map(decorate), mid: field.mid.map(decorate), gem: field.gem.map(decorate) });
    entrants.forEach(entry => used.add(entry.id));
    write(usedFile, [...used]);
    return { number, startedAt: now.toISOString(), entrants, rounds: [{ index: 0, closesAt: new Date(now.getTime() + WEEK).toISOString() }], open: 0 };
  }
  throw new Error("Could not find 64 songs with live links");
}

async function tally(number, round) {
  const res = await fetch(`${process.env.TOURNAMENT_API}/tally?tournament=${number}&round=${round}`, { headers: { Authorization: `Bearer ${process.env.TOURNAMENT_ADMIN_TOKEN}` } });
  if (!res.ok) throw new Error(`Tally failed: ${res.status}`);
  return (await res.json()).ballots;
}

async function main() {
  const now = new Date();
  const currentFile = path.join(dir, "current.json");
  const current = read(currentFile, null);
  if (!current) { write(currentFile, await startTournament(1, now)); console.log("Started tournament 1"); return; }

  const roundIndex = current.open;
  const entrants = roundIndex === 0 ? current.entrants : current.rounds[roundIndex - 1].winners;
  const ballots = await tally(current.number, roundIndex);
  const { results, winners } = Core.resolveRound(entrants, Core.tallyBallots(ballots, entrants.length / 2));
  Object.assign(current.rounds[roundIndex], { results, winners, ballots: ballots.length });

  if (winners.length === 1) {
    current.champion = winners[0];
    current.finishedAt = now.toISOString();
    delete current.open;
    write(path.join(dir, "archive", `${current.number}.json`), current);
    const indexFile = path.join(dir, "archive", "index.json");
    write(indexFile, [...read(indexFile, []), { number: current.number, finishedAt: current.finishedAt, champion: current.champion }]);
    write(currentFile, await startTournament(current.number + 1, now));
    console.log(`Finished tournament ${current.number}`);
    return;
  }
  current.open = roundIndex + 1;
  current.rounds.push({ index: current.open, closesAt: new Date(now.getTime() + WEEK).toISOString() });
  write(currentFile, current);
  console.log(`Opened ${Core.ROUNDS[current.open]}`);
}

main().catch(err => { console.error(err); process.exit(1); });
