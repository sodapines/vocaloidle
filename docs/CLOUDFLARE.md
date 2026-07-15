# Cloudflare setup — how new songs & daily refreshes work

Last updated: 2026-07-05 (late evening — pipeline is LIVE; repo turned out to be public already)

This documents the whole Cloudflare pipeline for the site (Heardle + 39charts),
what each piece does, what is already done, and what still needs doing before
the automated stuff actually runs end-to-end.

---

## The three Workers

| Worker | Source file | Purpose |
|---|---|---|
| **Heardle stats** | `scripts/stats-worker.js` | Game stats/leaderboard for Heardle. Separate KV, unrelated to the refresh pipeline. Don't touch. |
| **39charts-api** (`39charts-api.sodapines.workers.dev`) | `39charts/worker.js` | Song submission queue: VocaDB proxy, submit, admin list/approve/reject/export. Stores everything in the **CHARTS_DB** KV namespace. |
| **vocaloidle-refresh** | `scripts/cf-refresh-worker.js` | Nightly cron worker. Refreshes NicoNico + YouTube + bilibili view counts, **auto-publishes approved submissions**, and commits the updated JSON files back to the GitHub repo. |

The site itself is fully static — pages read `data/*.json`. The workers only
ever *write those JSON files to GitHub*; nothing is served dynamically.

## How data flows

### Daily view refresh (nightly, 3 cron fires)

```
cron 0 0 * * *   → slice 0: publish approved songs → NND slice 0 + bili slice 0
                   + full YouTube refresh (batched, cheap) + bili PV discovery
cron 30 0 * * *  → slice 1: NND slice 1 + bili slice 1
cron 0 1 * * *   → slice 2: NND slice 2 + bili slice 2
```

Each fire:
1. Reads `data/songs.json` from `raw.githubusercontent.com/sodapines/vocaloidle/main/...`
2. Reads the current data JSONs via the GitHub contents API
3. Hits the platform APIs (NND getthumbinfo / YouTube Data API / bilibili web-interface)
4. Commits updated `data/views.json`, `data/nndstats.json`, `data/ytviews.json`,
   `data/biliviews.json` back to the repo

Slicing keeps each invocation at ~600–700 subrequests, under the ~1,000/invocation cap.

### New songs (submission → live on site)

1. Visitor pastes a VocaDB URL on `39charts/add.html` → `POST /submissions`
   → stored in CHARTS_DB KV as `sub:<id>` (status `pending`), plus a
   `song_id:<vocadbId>` key for duplicate detection.
2. Admin (you) loads the queue on add.html with the admin token → **Approve**
   → entry becomes status `approved`. **Nothing is visible on the site yet.**
3. That night, the refresh worker's slice-0 run calls `publishApproved()`:
   - finds `approved` entries without a `published` flag
   - appends their song objects to `data/songs.json` and commits to GitHub
   - marks the KV entries `published: true` (so they are never double-added)
4. The same night's refresh fetches the new songs' view counts (submissions
   store `nndOriginalId` / `ytOriginalId` from the detected PVs; bilibili PV
   discovery finds their bili ids within a night or two).

So after full setup, **Approve is the only manual step, ever.**

## Secrets & bindings

### 39charts-api (already deployed & working)
- KV binding `CHARTS_DB` ✅
- Secret `ADMIN_TOKEN` — the token you type into the admin queue box ✅

### vocaloidle-refresh (fully configured ✅)
Settings → Variables and Secrets (all set):
- `GITHUB_TOKEN` — fine-grained GitHub PAT for `sodapines/vocaloidle`,
  permission **Contents: Read and write**
- `YT_API_KEY` — YouTube Data API v3 key (same one used locally)
- `REFRESH_TOKEN` — any random string; lets you trigger runs manually

Settings → Triggers → Cron: `0 0 * * *`, `30 0 * * *`, `0 1 * * *` — all three set ✅
(times are UTC = 5:00–6:00 PM Pacific the evening before)

Settings → Bindings:
- KV namespace `CHARTS_DB` → same namespace as 39charts-api ✅ (required for auto-publish)

## Status checklist

Already done ✅ (as of 2026-07-05)
- [x] 39charts-api worker deployed with CHARTS_DB + ADMIN_TOKEN
- [x] Refresh worker code with bilibili refresh + auto-publish **deployed**
- [x] Secrets on vocaloidle-refresh: GITHUB_TOKEN, YT_API_KEY, REFRESH_TOKEN
- [x] CHARTS_DB KV binding added to vocaloidle-refresh
- [x] All three cron triggers set
- [x] add.html stores nnd/yt video ids in submissions (needed for auto-publish)
- [x] KV cleaned of old test submissions (they predated the video-id fix)
- [x] Local refresh scripts work as manual fallback (see below)

Surprise discovery (2026-07-05 smoke test) 🎉
- The repo at `github.com/sodapines/vocaloidle` is **already publicly readable**
  and the worker has been firing on its crons for a while — origin/main has a
  trail of `chore(data): refresh … (0)` commits.
- The smoke test returned `{"sliceIndex":0,"nico":0,"bili":0,"yt":0,"published":0}`
  and committed successfully. **The pipeline is fully live end-to-end.**
- The zeros are because the *pushed* `data/songs.json` is an old snapshot with
  no `nndOriginalId`/`ytOriginalId` on any song, so the worker finds nothing
  it can refresh. All the enriched data + new code exist locally only.

Still to do 🔲
1. [ ] **Push local `main`** — the enriched songs.json (with platform ids),
   fresh view data, new site pages, and worker source. This is the last step;
   the next nightly run after pushing will do a real full refresh.
   - Note: origin/main has diverged (the worker's no-op data commits). When
     pushing, rebase/merge and keep the LOCAL versions of `data/*.json` —
     local data is strictly fresher than anything the worker wrote.
2. [ ] Re-run the smoke test after pushing:
   `https://vocaloidle-refresh.<account>.workers.dev/run?slice=0&token=<REFRESH_TOKEN>`
   → should now return real counts, roughly
   `{"sliceIndex":0,"nico":~420,"bili":~170,"yt":~1420,"published":0}`.

## Why "the JSON website didn't work" (historical note)

GitHub's raw endpoint (`raw.githubusercontent.com/...`) returns 404 for
private repos without a token — that was the working theory for the earlier
failed browser check. The 2026-07-05 smoke test proved the repo is actually
publicly readable now, so if a raw-JSON check fails today, suspect a typo in
the path/branch rather than repo visibility.

## Manual fallback (for between-nightly updates or if the worker is down)

Run locally from the repo root — these write the same `data/*.json` files:

```powershell
node scripts/fetch-nnd-views.js                # NicoNico views/comments/mylists (~15–20 min)
$env:YT_API_KEY = "..."; node scripts/fetch-yt-views.js   # YouTube (<1 min, batched)
node scripts/fetch-bilibili-views.js --refresh # bilibili views/likes/comments (~5 min)
node scripts/fetch-bilibili-views.js           # + discover bili PVs for new songs
node scripts/fetch-vocadb-details.js           # VocaDB credits/types/langs/tags (new songs only)
```

Manual new-song path (rarely needed now): approve in the queue →
**Export Approved** on add.html (downloads `approved_songs.json`) → merge into
`data/songs.json` by hand (or ask Claude) → run the fetch scripts above.
Normally the nightly auto-publish makes this unnecessary.

## Cost / limits sanity check

- Static JSON loads from visitors never touch the Workers.
- Nightly load: 3 cron invocations/day, ~600–700 subrequests each —
  designed against the ~1,000 subrequests/invocation limit.
- YouTube API: ~30 units/night out of the 10,000/day free quota.
- The site pages cache data JSONs in sessionStorage with a 10-minute TTL, so
  visitor traffic to the static files stays light regardless.
