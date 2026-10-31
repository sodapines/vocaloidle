# Weekly song tournament

Sixty-four songs, one round a week, six weeks a tournament. The bracket and results are
static files in `data/tournament/`; only votes go through a Worker.

## Setup

1. **D1:** Cloudflare dashboard → Storage & Databases → D1 → create `tournament-votes`.
2. **Worker:** Workers & Pages → create `vocaloidle-tournament`, paste `scripts/tournament-worker.js`, deploy.
3. **Binding:** Worker → Settings → Bindings → D1 database, variable name `DB`.
4. **Turnstile:** Turnstile → add a widget for `vocaloidle.sodapines.dev`. Keep the site key and secret.
5. **Worker settings:** add secrets `TURNSTILE_SECRET`, `ADMIN_TOKEN`, `VOTER_SALT` (random strings for the last two) and variable `ALLOWED_ORIGIN` = `https://vocaloidle.sodapines.dev`.
6. **Create the table:** `curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" https://<worker-url>/setup`
7. **Rate limit:** Security → WAF → rate limiting rule for the Worker's `/vote` path.
8. **Site config:** put the Worker URL and Turnstile site key in `tournament/config.js`.
9. **GitHub secrets:** `TOURNAMENT_API` (Worker URL) and `TOURNAMENT_ADMIN_TOKEN`.
10. **Start:** Actions → Weekly song tournament → Run workflow. It creates tournament 1.

## Weekly flow

Sunday 23:00 UTC, the Action reads ballots, publishes the round, and opens the next. After the
final it archives the bracket and picks 64 unused songs. Ties go to the higher seed.
