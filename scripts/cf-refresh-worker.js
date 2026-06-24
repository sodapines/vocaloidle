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
 *   - "0 0 * * *"   -> NicoNico slice 0  +  full YouTube refresh (YT is cheap/batched)
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

async function fetchSongs() {
  const res = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/songs.json`, {
    headers: { "User-Agent": UA },
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

  // Refresh only songs that already have a NicoNico count (the maintained set).
  const ids = Object.keys(views).filter((_, i) => i % N_SLICES === sliceIndex);
  let updated = 0;
  for (const id of ids) {
    const song = byId.get(id);
    const vid = song && song.nndOriginalId;
    if (!vid) continue;
    await sleep(NND_DELAY_MS);
    try {
      const s = await fetchNndStats(vid);
      if (s) { views[id] = s.views; stats[id] = s; updated++; }
    } catch { /* transient -> keep existing */ }
  }

  const today = new Date().toISOString().slice(0, 10);
  await ghPutJson("data/views.json", { updated: today, views }, viewsFile.sha, token, `chore(data): refresh NicoNico views slice ${sliceIndex} (${updated})`);
  await ghPutJson("data/nndstats.json", { updated: today, stats }, statsFile.sha, token, `chore(data): refresh NicoNico stats slice ${sliceIndex} (${updated})`);
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

  await ghPutJson("data/ytviews.json", { updated: new Date().toISOString().slice(0, 10), stats }, ytFile.sha, token, `chore(data): refresh YouTube stats (${updated})`);
  return updated;
}

/* ───────────────────────── Entry points ───────────────────────── */

async function runSlice(sliceIndex, env) {
  const nico = await refreshNicoSlice(sliceIndex, env);
  let yt = 0;
  if (sliceIndex === 0) yt = await refreshYouTube(env); // YouTube is cheap -> full refresh nightly
  return { sliceIndex, nico, yt };
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
