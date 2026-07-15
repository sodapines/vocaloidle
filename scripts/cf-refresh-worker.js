/**
 * 39charts nightly view-refresh Worker
 * ------------------------------------
 * A DEDICATED Cloudflare Worker (separate from the Heardle / 39charts-submissions
 * Workers, so those are never touched). It refreshes NicoNico + YouTube view
 * counts and commits the updated JSON back to the GitHub repo. The site stays
 * fully static; this only updates data files.
 *
 * It refreshes the WHOLE catalogue every night, split across 3 cron fires so each
 * run stays under the Workers subrequest cap (~1,000/invocation):
 *   - "0 0 * * *"   -> NicoNico+bilibili slice 0, full YouTube refresh, publish approved
 *   - "30 0 * * *"  -> NicoNico slice 1
 *   - "0 1 * * *"   -> NicoNico slice 2
 *
 * SETUP (Cloudflare dashboard):
 *   1. Workers & Pages -> Create Worker -> name it e.g. "vocaloidle-refresh".
 *   2. Paste this file into the editor and Deploy.
 *   3. Settings -> Variables -> add SECRETS (Encrypt):
 *        GITHUB_TOKEN  = a fine-grained GitHub PAT scoped to sodapines/vocaloidle
 *                        with "Contents: Read and write".
 *        YT_API_KEY    = your YouTube Data API v3 key.
 *        REFRESH_TOKEN = any random string (lets you trigger a run manually).
 *   3b. Settings -> Bindings -> add the CHARTS_DB KV namespace (same one the
 *       submissions Worker uses) so approved songs are auto-published nightly.
 *   4. Settings -> Triggers -> Cron Triggers -> add the three schedules above.
 *
 * Manual test (after deploy):
 *   https://vocaloidle-refresh.<you>.workers.dev/run?slice=0&token=REFRESH_TOKEN
 */

const OWNER = "sodapines";
const REPO = "vocaloidle";
const BRANCH = "main";
const N_SLICES = 3;          // NicoNico slices per night
const NND_DELAY_MS = 120;    // polite spacing between NicoNico requests
const UA = "vocaloidle-refresh-worker";

const CRON_SLICE = { "0 0 * * *": 0, "30 0 * * *": 1, "0 1 * * *": 2 };

/* ───────────────────────── GitHub helpers ───────────────────────── */

async function ghGetJson(path, token) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": UA, Accept: "application/vnd.github+json" },
  });
  if (res.status === 404) return { sha: null, data: null };
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`);
  const body = await res.json();
  const json = JSON.parse(decodeURIComponent(escape(atob(body.content.replace(/\n/g, "")))));
  return { sha: body.sha, data: json };
}

async function ghPutJson(path, obj, sha, token, message) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(obj, null, 2))));
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "User-Agent": UA, Accept: "application/vnd.github+json" },
    body: JSON.stringify({ message, content, sha: sha || undefined, branch: BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path}: ${res.status} ${await res.text()}`);
}

let SONGS_TOKEN = null; // set per-run so fetchSongs works on private repos too
async function fetchSongs() {
  // Contents API with the raw media type: authenticated, works for private
  // repos and for files over the 1 MB base64 limit (songs.json is ~3 MB).
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/data/songs.json?ref=${BRANCH}`, {
    headers: {
      "User-Agent": UA,
      Accept: "application/vnd.github.raw",
      ...(SONGS_TOKEN ? { Authorization: `Bearer ${SONGS_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`songs.json: ${res.status}`);
  return res.json();
}

/* ───────────────────────── NicoNico ───────────────────────── */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchNndStats(videoId) {
  const res = await fetch(`https://ext.nicovideo.jp/api/getthumbinfo/${videoId}`, { headers: { "User-Agent": UA } });
  const xml = await res.text();
  if (xml.includes('status="fail"')) return null; // deleted/unavailable -> keep existing value
  const v = xml.match(/<view_counter>(\d+)<\/view_counter>/);
  if (!v) return null;
  const c = xml.match(/<comment_num>(\d+)<\/comment_num>/);
  const m = xml.match(/<mylist_counter>(\d+)<\/mylist_counter>/);
  return { views: +v[1], comments: c ? +c[1] : null, mylist: m ? +m[1] : null };
}

async function refreshNicoSlice(sliceIndex, env) {
  const token = env.GITHUB_TOKEN;
  const songs = await fetchSongs();
  const byId = new Map(songs.map((s) => [String(s.vocadbId), s]));

  const viewsFile = await ghGetJson("data/views.json", token);
  const statsFile = await ghGetJson("data/nndstats.json", token);
  const views = (viewsFile.data && viewsFile.data.views) || {};
  const stats = (statsFile.data && statsFile.data.stats) || {};

  // Refresh every song with a NicoNico id (so newly published songs get their
  // first count on the next nightly run).
  const allIds = songs.filter(s => s.nndOriginalId).map(s => String(s.vocadbId));
  const ids = allIds.filter((_, i) => i % N_SLICES === sliceIndex);
  let updated = 0, failed = 0, lastError = "";
  for (const id of ids) {
    const song = byId.get(id);
    const vid = song && song.nndOriginalId;
    if (!vid) continue;
    await sleep(NND_DELAY_MS);
    try {
      const s = await fetchNndStats(vid);
      if (s) { views[id] = s.views; stats[id] = s; updated++; }
      else failed++;
    } catch (e) { failed++; lastError = e.message; }
  }

  // Nothing changed -> don't commit an identical snapshot; surface the failure
  // count instead so a broken night is visible in the worker logs.
  if (updated === 0) {
    console.log(`NND slice ${sliceIndex}: 0 updated, ${failed} failed of ${ids.length}${lastError ? ` — last error: ${lastError}` : ""}`);
    return 0;
  }
  const today = new Date().toISOString().slice(0, 10);
  await ghPutJson("data/views.json", { updated: today, views }, viewsFile.sha, token, `chore(data): refresh NicoNico views slice ${sliceIndex} (${updated} ok, ${failed} failed)`);
  await ghPutJson("data/nndstats.json", { updated: today, stats }, statsFile.sha, token, `chore(data): refresh NicoNico stats slice ${sliceIndex} (${updated} ok, ${failed} failed)`);
  return updated;
}

/* ───────────────────────── YouTube ───────────────────────── */

async function refreshYouTube(env) {
  const token = env.GITHUB_TOKEN;
  const key = env.YT_API_KEY;
  if (!key) throw new Error("Missing YT_API_KEY");

  const songs = await fetchSongs();
  const idToSongs = new Map();
  for (const s of songs) {
    if (!s.ytOriginalId) continue;
    if (!idToSongs.has(s.ytOriginalId)) idToSongs.set(s.ytOriginalId, []);
    idToSongs.get(s.ytOriginalId).push(String(s.vocadbId));
  }
  const ytIds = [...idToSongs.keys()];

  const ytFile = await ghGetJson("data/ytviews.json", token);
  const stats = (ytFile.data && ytFile.data.stats) || {};
  let updated = 0;

  for (let i = 0; i < ytIds.length; i += 50) {
    const batch = ytIds.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,status&id=${batch.join(",")}&key=${key}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) continue;
    const data = await res.json();
    const got = {};
    for (const item of data.items || []) {
      const st = item.statistics || {};
      if (st.viewCount == null) continue;
      got[item.id] = {
        views: parseInt(st.viewCount, 10),
        likes: st.likeCount != null ? parseInt(st.likeCount, 10) : null,
        comments: st.commentCount != null ? parseInt(st.commentCount, 10) : null,
        embeddable: item.status ? item.status.embeddable !== false : true,
      };
    }
    for (const id of batch) {
      if (!got[id]) continue;
      for (const vocadbId of idToSongs.get(id)) { stats[vocadbId] = got[id]; updated++; }
    }
  }

  if (updated === 0) {
    console.log(`YouTube refresh: 0 updated of ${ytIds.length} ids — check YT_API_KEY / quota`);
    return 0;
  }
  await ghPutJson("data/ytviews.json", { updated: new Date().toISOString().slice(0, 10), stats }, ytFile.sha, token, `chore(data): refresh YouTube stats (${updated})`);
  return updated;
}

/* ───────────────────────── bilibili ───────────────────────── */

const BILI_DELAY_MS = 150;
const BILI_DISCOVER_MAX = 15; // new-PV lookups per night (2 subrequests each)
const BILI_HEADERS = { "User-Agent": "Mozilla/5.0", Referer: "https://www.bilibili.com" };

async function fetchBiliStat(id) {
  const q = /^BV/i.test(id) ? `bvid=${id}` : `aid=${id}`;
  const res = await fetch(`https://api.bilibili.com/x/web-interface/view?${q}`, { headers: BILI_HEADERS });
  if (!res.ok) return null;
  const j = await res.json();
  if (j.code !== 0 || !j.data || !j.data.stat) return null;
  const out = { views: j.data.stat.view, likes: j.data.stat.like, comments: j.data.stat.reply, id };
  if (j.data.pic) out.pic = String(j.data.pic).replace(/^http:/, "https:");
  return out;
}

async function refreshBiliSlice(sliceIndex, env) {
  const token = env.GITHUB_TOKEN;
  const file = await ghGetJson("data/biliviews.json", token);
  const stats = (file.data && file.data.stats) || {};
  const checked = (file.data && file.data.checked) || {};

  // Refresh the stored set, sliced like NicoNico.
  const ids = Object.keys(stats).filter((_, i) => i % N_SLICES === sliceIndex);
  let updated = 0;
  for (const id of ids) {
    const st = stats[id];
    if (!st || !st.id) continue;
    await sleep(BILI_DELAY_MS);
    try {
      const r = await fetchBiliStat(st.id);
      if (r) { stats[id] = r; updated++; }
    } catch { /* transient -> keep existing */ }
  }

  // Slice 0 also checks a few never-checked songs for a bilibili PV (bounded).
  let discovered = 0;
  if (sliceIndex === 0) {
    const songs = await fetchSongs();
    const unchecked = songs.filter(s => !stats[String(s.vocadbId)] && checked[String(s.vocadbId)] === undefined).slice(0, BILI_DISCOVER_MAX);
    for (const song of unchecked) {
      const key = String(song.vocadbId);
      await sleep(BILI_DELAY_MS);
      try {
        const res = await fetch(`https://vocadb.net/api/songs/${key}?fields=PVs`, { headers: { "User-Agent": UA } });
        if (!res.ok) { continue; }
        const data = await res.json();
        const pvs = (data.pvs || []).filter(p => p.service === "Bilibili" && !p.disabled);
        const pv = pvs.find(p => p.pvType === "Original") || pvs.find(p => p.pvType === "Reprint");
        if (!pv) { checked[key] = 0; continue; }
        const sId = String(pv.pvId || pv.url || "");
        const bv = sId.match(/BV[0-9A-Za-z]+/);
        const id = bv ? bv[0] : sId.replace(/D/g, "");
        if (!id) { checked[key] = 0; continue; }
        await sleep(BILI_DELAY_MS);
        const r = await fetchBiliStat(id);
        if (r) { stats[key] = r; checked[key] = 1; discovered++; }
        else checked[key] = 0;
      } catch { /* leave unchecked -> retried next night */ }
    }
  }

  if (updated + discovered === 0) {
    console.log(`bilibili slice ${sliceIndex}: 0 updated of ${ids.length} — bilibili may be blocking Cloudflare IPs`);
    return 0;
  }
  await ghPutJson("data/biliviews.json", { updated: new Date().toISOString().slice(0, 10), stats, checked }, file.sha, token, `chore(data): refresh bilibili stats slice ${sliceIndex} (${updated}+${discovered})`);
  return updated + discovered;
}

/* ───────────────────── Publish approved submissions ───────────────────── */

// Appends approved-but-unpublished queue entries to data/songs.json and marks
// them published in KV. Needs the CHARTS_DB binding; silently skipped without it.
async function publishApproved(env) {
  if (!env.CHARTS_DB) return 0;
  const token = env.GITHUB_TOKEN;
  const { keys } = await env.CHARTS_DB.list({ prefix: "sub:" });
  const entries = (await Promise.all(
    keys.map(k => env.CHARTS_DB.get(k.name).then(v => (v ? JSON.parse(v) : null)))
  )).filter(e => e && e.status === "approved" && !e.published && e.song);
  if (!entries.length) return 0;

  const songsFile = await ghGetJson("data/songs.json", token);
  const songs = songsFile.data || [];
  const have = new Set(songs.map(s => String(s.vocadbId)));
  let added = 0;
  for (const e of entries) {
    if (!have.has(String(e.song.vocadbId))) {
      songs.push(e.song);
      have.add(String(e.song.vocadbId));
      added++;
    }
    e.published = true;
    await env.CHARTS_DB.put(`sub:${e.id}`, JSON.stringify(e));
  }
  if (added) {
    await ghPutJson("data/songs.json", songs, songsFile.sha, token, `feat(data): publish ${added} approved submission(s)`);
  }
  return added;
}

/* ───────────────────────── Entry points ───────────────────────── */

async function runSlice(sliceIndex, env) {
  SONGS_TOKEN = env.GITHUB_TOKEN;
  let published = 0;
  if (sliceIndex === 0) published = await publishApproved(env);
  const nico = await refreshNicoSlice(sliceIndex, env);
  const bili = await refreshBiliSlice(sliceIndex, env);
  let yt = 0;
  if (sliceIndex === 0) yt = await refreshYouTube(env); // YouTube is cheap -> full refresh nightly
  return { sliceIndex, nico, bili, yt, published };
}

export default {
  async scheduled(event, env, ctx) {
    const sliceIndex = CRON_SLICE[event.cron] ?? 0;
    ctx.waitUntil(runSlice(sliceIndex, env));
  },

  // Manual trigger for testing: /run?slice=0&token=REFRESH_TOKEN
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== "/run") return new Response("vocaloidle-refresh worker", { status: 200 });
    if (!env.REFRESH_TOKEN || url.searchParams.get("token") !== env.REFRESH_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }
    const sliceIndex = Math.max(0, Math.min(N_SLICES - 1, parseInt(url.searchParams.get("slice") || "0", 10)));
    try {
      const result = await runSlice(sliceIndex, env);
      return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(`Error: ${e.message}`, { status: 500 });
    }
  },
};
