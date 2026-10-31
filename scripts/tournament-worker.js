/**
 * Weekly song tournament vote Worker. Stores one ballot per voter per round in D1;
 * the GitHub Action reads ballots through /tally and publishes results.
 *
 * Setup: docs/TOURNAMENT.md
 * Bindings and secrets: DB (D1), TURNSTILE_SECRET, ADMIN_TOKEN, VOTER_SALT.
 * Variable: ALLOWED_ORIGIN, e.g. https://vocaloidle.sodapines.dev
 */

const CURRENT_URL = "https://raw.githubusercontent.com/sodapines/vocaloidle/main/data/tournament/current.json";
const SCHEMA = "CREATE TABLE IF NOT EXISTS ballots (tournament INTEGER NOT NULL, round INTEGER NOT NULL, voter TEXT NOT NULL, picks TEXT NOT NULL, PRIMARY KEY (tournament, round, voter))";

function validBallot(picks, matchCount) {
  if (!picks || typeof picks !== "object" || Array.isArray(picks)) return false;
  const entries = Object.entries(picks);
  return entries.length > 0 && entries.length <= matchCount &&
    entries.every(([match, side]) => /^\d+$/.test(match) && Number(match) < matchCount && (side === 0 || side === 1));
}

// Per-instance limit: a cheap brake on floods before any Turnstile or database work.
const recent = new Map();
function limited(ip, now = Date.now()) {
  if (recent.size > 5000) recent.clear();
  const hits = (recent.get(ip) || []).filter(time => now - time < 60000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 10;
}

async function hash(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(token, ip, env, fetcher) {
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(token || ""), remoteip: ip });
  const res = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  return !!(await res.json()).success;
}

async function openRound(fetcher) {
  const res = await fetcher(CURRENT_URL, { cf: { cacheTtl: 60, cacheEverything: true } });
  if (!res.ok) return null;
  const current = await res.json();
  if (!current || current.open === undefined) return null;
  const round = current.rounds[current.open];
  const size = current.open === 0 ? current.entrants.length : current.rounds[current.open - 1].winners.length;
  return { tournament: current.number, round: current.open, closesAt: round.closesAt, matchCount: size / 2 };
}

export async function handle(request, env, fetcher = fetch) {
  const url = new URL(request.url);
  const cors = {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  if (url.pathname === "/tally" && request.method === "GET") {
    if (request.headers.get("Authorization") !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: "unauthorized" }, 401);
    const { results } = await env.DB.prepare("SELECT picks FROM ballots WHERE tournament = ? AND round = ?")
      .bind(Number(url.searchParams.get("tournament")), Number(url.searchParams.get("round"))).all();
    return json({ ballots: results.map(row => JSON.parse(row.picks)) });
  }

  if (url.pathname === "/vote" && request.method === "POST") {
    if (request.headers.get("Origin") !== env.ALLOWED_ORIGIN) return json({ error: "forbidden" }, 403);
    if (limited(request.headers.get("CF-Connecting-IP") || "")) return json({ error: "busy" }, 429);
    let body;
    try { body = await request.json(); } catch { return json({ error: "invalid" }, 400); }
    const round = await openRound(fetcher);
    if (!round || round.tournament !== body.tournament || round.round !== body.round || Date.now() >= Date.parse(round.closesAt)) return json({ error: "closed" }, 409);
    if (!validBallot(body.picks, round.matchCount)) return json({ error: "invalid" }, 400);
    const ip = request.headers.get("CF-Connecting-IP") || "";
    if (!await verifyTurnstile(body.token, ip, env, fetcher)) return json({ error: "verification" }, 403);
    // The salted hash is one-way and changes each round; raw addresses are never stored.
    const voter = await hash(`${env.VOTER_SALT}:${round.tournament}:${round.round}:${ip}`);
    await env.DB.prepare("INSERT INTO ballots (tournament, round, voter, picks) VALUES (?, ?, ?, ?) ON CONFLICT (tournament, round, voter) DO UPDATE SET picks = excluded.picks")
      .bind(round.tournament, round.round, voter, JSON.stringify(body.picks)).run();
    return json({ ok: true });
  }

  if (url.pathname === "/setup" && request.method === "POST") {
    if (request.headers.get("Authorization") !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: "unauthorized" }, 401);
    await env.DB.prepare(SCHEMA).run();
    return json({ ok: true });
  }
  return json({ error: "not found" }, 404);
}

export default { fetch: (request, env) => handle(request, env) };
