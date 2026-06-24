/**
 * 39charts API Worker
 * Deploy to: 39charts-api.sodapines.workers.dev
 *
 * Setup in Cloudflare dashboard:
 *   1. Create a KV namespace, bind it to this Worker as: CHARTS_DB
 *   2. Add a Worker secret: ADMIN_TOKEN = <strong random string>
 *   3. Paste this file into the Worker editor and deploy
 *
 * Endpoints:
 *   GET  /vocadb/:id                    — proxy VocaDB API (public)
 *   POST /submissions                   — submit a song for review (public)
 *   GET  /submissions?status=pending    — list submissions (admin)
 *   POST /submissions/:id/approve       — approve a submission (admin)
 *   DELETE /submissions/:id             — reject a submission (admin)
 *   GET  /submissions/export            — download approved songs JSON (admin)
 */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function isAdmin(req, env) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0 && token === env.ADMIN_TOKEN;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {

      /* ── VocaDB proxy ─────────────────────────────────────── */
      const vocaMatch = path.match(/^\/vocadb\/(\d+)$/);
      if (method === "GET" && vocaMatch) {
        const res = await fetch(
          `https://vocadb.net/api/songs/${vocaMatch[1]}?fields=Names,PVs,Artists,Tags&lang=Default`,
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) return json({ error: `VocaDB returned ${res.status}` }, res.status);
        return json(await res.json());
      }

      /* ── Submit a song for review ─────────────────────────── */
      if (method === "POST" && path === "/submissions") {
        let body;
        try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

        if (!body.song?.vocadbId || !body.song?.title)
          return json({ error: "Missing required song fields (vocadbId, title)" }, 400);

        // Reject duplicate IDs already in the queue
        const existing = await env.CHARTS_DB.get(`song_id:${body.song.vocadbId}`);
        if (existing) return json({ error: "A submission for this song ID already exists", duplicate: true }, 409);

        const id = crypto.randomUUID();
        const entry = {
          id,
          song: body.song,
          status: "pending",
          submittedAt: new Date().toISOString(),
          reviewedAt: null,
          note: (body.note || "").slice(0, 300),
        };

        await env.CHARTS_DB.put(`sub:${id}`, JSON.stringify(entry));
        // Index by vocadb ID to detect duplicates quickly
        await env.CHARTS_DB.put(`song_id:${body.song.vocadbId}`, id);

        return json({ ok: true, id }, 201);
      }

      /* ── Admin: export must come before list (prefix match) ── */
      if (method === "GET" && path === "/submissions/export") {
        if (!isAdmin(req, env)) return json({ error: "Unauthorized" }, 401);

        const { keys } = await env.CHARTS_DB.list({ prefix: "sub:" });
        const entries = await Promise.all(
          keys.map(k => env.CHARTS_DB.get(k.name).then(v => (v ? JSON.parse(v) : null)))
        );
        const approved = entries.filter(e => e?.status === "approved").map(e => e.song);

        return new Response(JSON.stringify(approved, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="approved_songs.json"',
            ...corsHeaders(),
          },
        });
      }

      /* ── Admin: list submissions ──────────────────────────── */
      if (method === "GET" && path === "/submissions") {
        if (!isAdmin(req, env)) return json({ error: "Unauthorized" }, 401);

        const status = url.searchParams.get("status") || "pending";
        const { keys } = await env.CHARTS_DB.list({ prefix: "sub:" });
        const entries = await Promise.all(
          keys.map(k => env.CHARTS_DB.get(k.name).then(v => (v ? JSON.parse(v) : null)))
        );

        const filtered = entries
          .filter(e => e && (status === "all" || e.status === status))
          .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

        return json(filtered);
      }

      /* ── Admin: approve ───────────────────────────────────── */
      const approveMatch = path.match(/^\/submissions\/([^/]+)\/approve$/);
      if (method === "POST" && approveMatch) {
        if (!isAdmin(req, env)) return json({ error: "Unauthorized" }, 401);

        const raw = await env.CHARTS_DB.get(`sub:${approveMatch[1]}`);
        if (!raw) return json({ error: "Submission not found" }, 404);

        const entry = JSON.parse(raw);
        entry.status = "approved";
        entry.reviewedAt = new Date().toISOString();
        await env.CHARTS_DB.put(`sub:${entry.id}`, JSON.stringify(entry));
        return json({ ok: true });
      }

      /* ── Admin: reject ────────────────────────────────────── */
      const subMatch = path.match(/^\/submissions\/([^/]+)$/);
      if (method === "DELETE" && subMatch) {
        if (!isAdmin(req, env)) return json({ error: "Unauthorized" }, 401);

        const raw = await env.CHARTS_DB.get(`sub:${subMatch[1]}`);
        if (!raw) return json({ error: "Submission not found" }, 404);

        const entry = JSON.parse(raw);
        entry.status = "rejected";
        entry.reviewedAt = new Date().toISOString();
        await env.CHARTS_DB.put(`sub:${entry.id}`, JSON.stringify(entry));
        // Clean up the duplicate-detection key
        await env.CHARTS_DB.delete(`song_id:${entry.song.vocadbId}`);
        return json({ ok: true });
      }

      return json({ error: "Not found" }, 404);

    } catch (e) {
      return json({ error: e.message }, 500);
    }
  },
};
