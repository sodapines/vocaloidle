#!/usr/bin/env node
// Fetches NicoNicodouga view counts for all songs in data/songs.json
// and writes results to data/views.json.
// Run: node scripts/fetch-nnd-views.js
// Requires Node 18+ (built-in fetch) or Node 16 with the https module fallback below.

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SONGS_PATH = path.join(__dirname, '..', 'data', 'songs.json');
const VIEWS_PATH = path.join(__dirname, '..', 'data', 'views.json');
const DELAY_MS   = 600; // stay well under NND rate limits

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getNndNumericId(song) {
  const urls = [song.coverArt, ...(song.coverArts || [])].filter(Boolean);
  for (const url of urls) {
    const m = url.match(/nicovideo\.cdn\.nimg\.jp\/thumbnails\/(\d+)\//);
    if (m) return m[1];
  }
  return null;
}

function fetchXml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'sodapines-vocaloid-game/1.0 (view-count-fetcher)' }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchViewCount(numericId) {
  const url = `https://ext.nicovideo.jp/api/getthumbinfo/sm${numericId}`;
  const xml = await fetchXml(url);
  // Check for error status
  if (xml.includes('status="fail"')) {
    const code = xml.match(/<code>([^<]+)<\/code>/)?.[1] || 'unknown';
    throw new Error(`API error: ${code}`);
  }
  const m = xml.match(/<view_counter>(\d+)<\/view_counter>/);
  if (!m) throw new Error('view_counter not found in response');
  return parseInt(m[1], 10);
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(SONGS_PATH, 'utf8'));

  // Preserve existing data so a partial run doesn't lose previous results
  let existing = {};
  try {
    const prev = JSON.parse(fs.readFileSync(VIEWS_PATH, 'utf8'));
    existing = prev.views || {};
  } catch { /* first run */ }

  const views = { ...existing };
  let fetched = 0;
  let skipped = 0;
  let failed  = 0;

  for (const song of songs) {
    const nndId = getNndNumericId(song);
    if (!nndId) {
      console.log(`[SKIP] ${song.title} — no NND thumbnail URL`);
      skipped++;
      continue;
    }

    try {
      await sleep(DELAY_MS);
      const count = await fetchViewCount(nndId);
      views[String(song.vocadbId)] = count;
      fetched++;
      console.log(`[OK]   ${song.title}: ${count.toLocaleString()}`);
    } catch (err) {
      failed++;
      console.log(`[FAIL] ${song.title} (sm${nndId}): ${err.message}`);
    }
  }

  const output = {
    updated: new Date().toISOString().slice(0, 10),
    views
  };

  fs.writeFileSync(VIEWS_PATH, JSON.stringify(output, null, 2));
  console.log(`\nDone: ${fetched} fetched, ${skipped} skipped, ${failed} failed`);
  console.log(`Written to ${VIEWS_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
