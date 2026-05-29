const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const LEADERBOARD_TTL_SECONDS = 300;
const LEADERBOARD_KEY = "agg:leaderboard";
const DIFFICULTY_MIN_PLAYS = 100;
const DIFFICULTY_POOLS_KEY = "agg:difficulty-pools:v2";
const HTTP_CACHE_SECONDS = 60;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function computeRow(songId, data) {
  const plays = data.plays || 0;
  const wins = data.wins || 0;
  const winRate = plays > 0 ? wins / plays : 0;
  const attempts = data.attempts || {};
  const total = Object.values(attempts).reduce((sum, value) => sum + value, 0);
  const weighted = Object.entries(attempts).reduce(
    (sum, [attempt, value]) => sum + Number(attempt) * value,
    0,
  );
  const avgAttempts = total > 0 ? weighted / total : null;
  return { songId, plays, wins, winRate, avgAttempts, attempts };
}

function getDifficultyKey(winRate) {
  const rate = winRate * 100;
  if (rate >= 85) return "free";
  if (rate >= 70) return "easy";
  if (rate >= 40) return "medium";
  if (rate >= 15) return "hard";
  return "unknown";
}

async function rebuildAggregates(env) {
  const keys = [];
  let cursor;
  do {
    const page = await env.STATS.list({ prefix: "song:", cursor });
    keys.push(...page.keys);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  const rows = await Promise.all(
    keys.map(async (key) => {
      const raw = await env.STATS.get(key.name);
      return computeRow(key.name.replace("song:", ""), raw ? JSON.parse(raw) : {});
    }),
  );
  const filtered = rows.filter((row) => row.plays >= 5);
  const payload = { builtAt: Date.now(), rows: filtered };
  await env.STATS.put(LEADERBOARD_KEY, JSON.stringify(payload), {
    expirationTtl: LEADERBOARD_TTL_SECONDS,
  });
  await env.STATS.put(DIFFICULTY_POOLS_KEY, JSON.stringify(buildDifficultyPools(filtered)), {
    expirationTtl: LEADERBOARD_TTL_SECONDS,
  });
  return payload;
}

async function getLeaderboard(env) {
  const cached = await env.STATS.get(LEADERBOARD_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return rebuildAggregates(env);
}

function buildDifficultyPools(rows) {
  const pools = {
    free: { count: 0, ids: [] },
    easy: { count: 0, ids: [] },
    medium: { count: 0, ids: [] },
    hard: { count: 0, ids: [] },
    unknown: { count: 0, ids: [] },
  };

  rows
    .filter((row) => row.plays >= DIFFICULTY_MIN_PLAYS)
    .forEach((row) => {
    const key = getDifficultyKey(row.winRate || 0);
    pools[key].ids.push(String(row.songId));
    pools[key].count += 1;
  });

  return { builtAt: Date.now(), minPlays: DIFFICULTY_MIN_PLAYS, pools };
}

async function getDifficultyPools(env) {
  const cached = await env.STATS.get(DIFFICULTY_POOLS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  const { rows } = await getLeaderboard(env);
  const payload = buildDifficultyPools(rows);
  await env.STATS.put(DIFFICULTY_POOLS_KEY, JSON.stringify(payload), {
    expirationTtl: LEADERBOARD_TTL_SECONDS,
  });
  return payload;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      if (request.method === "POST" && url.pathname === "/record") {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        const { songId, won, attempts } = body;
        if (!songId) return json({ error: "missing songId" }, 400);

        const key = `song:${songId}`;
        const existing = JSON.parse((await env.STATS.get(key)) || "{}");
        existing.plays = (existing.plays || 0) + 1;
        existing.wins = (existing.wins || 0) + (won ? 1 : 0);
        existing.attempts = existing.attempts || {};

        if (won && attempts >= 1 && attempts <= 6) {
          const attemptKey = String(attempts);
          existing.attempts[attemptKey] = (existing.attempts[attemptKey] || 0) + 1;
        }

        await env.STATS.put(key, JSON.stringify(existing));
        await env.STATS.delete(LEADERBOARD_KEY);
        await env.STATS.delete(DIFFICULTY_POOLS_KEY);
        return json({ ok: true });
      }

      if (request.method === "GET" && url.pathname === "/stats") {
        const songId = url.searchParams.get("songId");
        if (!songId) return json({ error: "missing songId" }, 400);
        const data = await env.STATS.get(`song:${songId}`);
        return json(data ? JSON.parse(data) : {});
      }

      if (request.method === "GET" && url.pathname === "/difficulty-pools") {
        return json(await getDifficultyPools(env), 200, {
          "Cache-Control": `public, max-age=${HTTP_CACHE_SECONDS}`,
        });
      }

      if (request.method === "GET" && url.pathname === "/leaderboard") {
        const sort = url.searchParams.get("sort") || "plays";
        const limit = Math.min(Number(url.searchParams.get("limit") || 20), 1000);
        const { rows } = await getLeaderboard(env);
        const sorted = [...rows];

        if (sort === "easiest") {
          sorted.sort((a, b) => b.winRate - a.winRate || (a.avgAttempts ?? 99) - (b.avgAttempts ?? 99) || b.plays - a.plays);
        } else if (sort === "hardest") {
          sorted.sort((a, b) => a.winRate - b.winRate || (b.avgAttempts ?? 0) - (a.avgAttempts ?? 0) || b.plays - a.plays);
        } else {
          sorted.sort((a, b) => b.plays - a.plays);
        }

        return json(sorted.slice(0, limit), 200, {
          "Cache-Control": `public, max-age=${HTTP_CACHE_SECONDS}`,
        });
      }

      return json({ error: "not found" }, 404);
    } catch (err) {
      return json({ error: err?.message || "internal error" }, 500);
    }
  },
};
