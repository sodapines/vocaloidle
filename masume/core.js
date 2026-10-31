(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VocaGridCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function titleAliases(song) {
    return [...new Set([
      song && song.title,
      song && song.vocadbName,
      ...((song && song.acceptedTitles) || []),
    ].filter(Boolean).map(value => String(value).normalize("NFKC").trim()).filter(Boolean))];
  }

  function isLatinTitle(value) {
    const title = String(value || "");
    return /[\p{Script=Latin}\d]/u.test(title) &&
      !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(title);
  }

  function isOneWordTitle(song) {
    return titleAliases(song).some(title => isLatinTitle(title) && !/\s/u.test(title));
  }

  function hasNumberTitle(song) {
    return titleAliases(song).some(title => /\d/u.test(title));
  }

  function combinedViews(song, sources) {
    const id = String(song && song.vocadbId);
    const nico = sources.nico[id];
    const youtube = sources.youtube[id] && sources.youtube[id].views;
    const bilibili = sources.bilibili[id] && sources.bilibili[id].views;
    const counts = [nico, youtube, bilibili];
    if (!counts.some(Number.isFinite)) return null;
    return counts.reduce((sum, count) => sum + (Number.isFinite(count) ? count : 0), 0);
  }

  function sortByViews(ids, getSong, getViews) {
    return [...ids].sort((left, right) => {
      const a = getViews(getSong(left));
      const b = getViews(getSong(right));
      if (a == null && b == null) return String(left).localeCompare(String(right));
      if (a == null) return 1;
      if (b == null) return -1;
      return b - a || String(left).localeCompare(String(right));
    });
  }

  function viewRarity(pool, id, getSong, getViews) {
    const selectedViews = getViews(getSong(id));
    if (selectedViews == null) return 0;
    const known = pool.filter(candidate => getViews(getSong(candidate)) != null);
    const rank = known.indexOf(String(id));
    if (rank < 0 || known.length < 2) return 0;
    return Math.round(100 * rank / (known.length - 1));
  }

  return { titleAliases, isOneWordTitle, hasNumberTitle, combinedViews, sortByViews, viewRarity };
});
