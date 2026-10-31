#!/usr/bin/env node
// Freezes upcoming Connections and Grid dailies into each game's manifests.json,
// so later song, credit, or view changes cannot alter a published board. Runs the
// games' own generators in headless Chrome. Existing dates are never replaced.
//
// Run: CHROME=/path/to/chrome node scripts/freeze-daily-boards.js [daysAhead]

const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const DAYS_AHEAD = parseInt(process.argv[2] || "3", 10);
const CHROME = process.env.CHROME || "google-chrome";
const PORT = 8940;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };

const dates = Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => new Date(Date.now() + i * 864e5).toISOString().slice(0, 10));
const GAMES = {
  connections: `const out={};for(const d of ${JSON.stringify(dates)}){if(MANIFESTS[d])continue;const p=generatePuzzle('daily-'+d);if(p){const groups=p.map(({songs,...g})=>({...g,ids:songs.map(s=>String(s.vocadbId))}));out[d]={groups,tiles:groups.flatMap(g=>g.ids)}}}`,
  masume: `const out={};const k=c=>[CRITS[c].kind,CRITS[c].name];for(const d of ${JSON.stringify(dates)}){if(MANIFESTS[d])continue;const r=generateGrid(4,mulberry32(seedFromString('masume-daily-'+d)));if(r)out[d]={rows:r.rows.map(k),cols:r.cols.map(k)}}`,
};
const inject = game => `<script>addEventListener('load',()=>setTimeout(async()=>{${GAMES[game]};await fetch('/out?game=${game}',{method:'POST',body:JSON.stringify(out)})},3000))</script>`;

function freeze(game) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { server.close(); chrome.kill(); reject(new Error(`${game}: timed out`)); }, 90000);
    const server = http.createServer((req, res) => {
      const url = req.url.split("?")[0];
      if (url === "/out") {
        let body = "";
        req.on("data", chunk => { body += chunk; }).on("end", () => {
          res.end("ok");
          clearTimeout(timer); server.close(); chrome.kill();
          const file = path.join(root, game, "manifests.json");
          const added = JSON.parse(body);
          fs.writeFileSync(file, JSON.stringify({ ...added, ...JSON.parse(fs.readFileSync(file, "utf8")) }));
          console.log(`${game}: froze ${Object.keys(added).join(", ") || "nothing new"}`);
          resolve();
        });
        return;
      }
      const file = path.join(root, url.endsWith("/") ? url + "index.html" : url);
      fs.readFile(file, (err, data) => {
        if (err) { res.statusCode = 404; res.end(); return; }
        res.setHeader("content-type", TYPES[path.extname(file)] || "application/octet-stream");
        res.end(file.endsWith(`${game}/index.html`) ? data + inject(game) : data);
      });
    }).listen(PORT);
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "freeze-"));
    const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", `--user-data-dir=${profile}`, `http://localhost:${PORT}/${game}/`], { stdio: "ignore" });
  });
}

(async () => { for (const game of Object.keys(GAMES)) await freeze(game); })().catch(err => { console.error(err); process.exit(1); });
