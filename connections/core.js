(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ConnectionsCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const APP = "vocaloid-connections";
  const EPOCH = "2026-07-19";
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const plain = value => value && typeof value === "object" && !Array.isArray(value);
  function strikeLimit(challenge) { return challenge ? 3 : 4; }
  function formatDuration(ms) {
    const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
  function chooseDistinctKinds(kinds, random = Math.random, count = 4) {
    const pool = [...new Set(kinds)];
    for (let i=pool.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    return pool.slice(0,count);
  }
  function archiveDates(today, epoch = EPOCH) {
    if (!DAY_RE.test(today) || !DAY_RE.test(epoch)) return [];
    const out = [], cursor = new Date(`${epoch}T12:00:00`), end = new Date(`${today}T12:00:00`);
    while (cursor < end) {
      out.push(`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}-${String(cursor.getDate()).padStart(2,"0")}`);
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }
  function hydrateManifest(entry, songs) {
    if (!plain(entry) || !Array.isArray(entry.groups) || entry.groups.length !== 4 || !Array.isArray(entry.tiles) || entry.tiles.length !== 16) return null;
    const byId = new Map(songs.map(song => [String(song.vocadbId), song]));
    const ids = entry.groups.flatMap(group => Array.isArray(group.ids) ? group.ids.map(String) : []);
    if (ids.length !== 16 || new Set(ids).size !== 16 || entry.tiles.map(String).some(id => !ids.includes(id)) || new Set(entry.tiles.map(String)).size !== 16) return null;
    if (ids.some(id => !byId.has(id))) return null;
    const groups = entry.groups.map(group => ({...group, songs:group.ids.map(id => byId.get(String(id)))}));
    return {groups, tiles:entry.tiles.map(id => byId.get(String(id)))};
  }
  function sanitizeBackup(input) {
    if (!plain(input) || input.app !== APP || input.version !== 1 || !plain(input.stats) || !plain(input.unlimitedStats)) throw new Error("Invalid Connections backup");
    const dailies = {};
    if (plain(input.dailies)) for (const [day, value] of Object.entries(input.dailies)) {
      if (DAY_RE.test(day) && plain(value) && Array.isArray(value.solved) && typeof value.done === "boolean") dailies[day] = value;
    }
    return {app:APP,version:1,exportedAt:String(input.exportedAt||""),stats:input.stats,unlimitedStats:input.unlimitedStats,achievements:plain(input.achievements)?input.achievements:{},settings:plain(input.settings)?input.settings:{},dailies};
  }
  return {APP,EPOCH,DAY_RE,strikeLimit,formatDuration,chooseDistinctKinds,archiveDates,hydrateManifest,sanitizeBackup};
});
