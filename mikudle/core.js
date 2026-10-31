(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MikudleCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalizeWord(value) {
    return String(value || "").trim().toLowerCase();
  }

  function oneLetterApart(a, b) {
    a = normalizeWord(a);
    b = normalizeWord(b);
    if (a.length !== 4 || b.length !== 4) return false;
    var changes = 0;
    for (var i = 0; i < 4; i++) {
      if (a[i] !== b[i] && ++changes > 1) return false;
    }
    return changes === 1;
  }

  function makeWordSet(words) {
    return new Set((words || []).map(normalizeWord).filter(function (word) {
      return /^[a-z]{4}$/.test(word);
    }));
  }

  function neighbors(word, words) {
    var set = words instanceof Set ? words : makeWordSet(words);
    var out = [];
    set.forEach(function (candidate) {
      if (oneLetterApart(word, candidate)) out.push(candidate);
    });
    return out.sort();
  }

  function shortestPath(start, target, words) {
    start = normalizeWord(start);
    target = normalizeWord(target);
    var set = words instanceof Set ? new Set(words) : makeWordSet(words);
    set.add(start);
    set.add(target);
    var queue = [start];
    var previous = new Map([[start, null]]);
    for (var head = 0; head < queue.length; head++) {
      var current = queue[head];
      if (current === target) break;
      neighbors(current, set).forEach(function (next) {
        if (!previous.has(next)) {
          previous.set(next, current);
          queue.push(next);
        }
      });
    }
    if (!previous.has(target)) return null;
    var path = [];
    for (var at = target; at !== null; at = previous.get(at)) path.push(at);
    return path.reverse();
  }

  function validateMove(from, next, words, target) {
    from = normalizeWord(from);
    next = normalizeWord(next);
    target = normalizeWord(target || "miku");
    if (!/^[a-z]{4}$/.test(next)) return { ok: false, reason: "Enter exactly four letters." };
    if (!oneLetterApart(from, next)) return { ok: false, reason: "Change exactly one letter." };
    var set = words instanceof Set ? words : makeWordSet(words);
    if (next !== target && !set.has(next)) return { ok: false, reason: "That word is not in the common-word list." };
    return { ok: true, word: next };
  }

  function hashString(value) {
    var hash = 2166136261;
    value = String(value);
    for (var i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function pickForKey(items, key) {
    if (!items || !items.length) return null;
    return items[hashString(key) % items.length];
  }

  function archiveDateKeys(epochKey, todayKey) {
    function utcForKey(key) {
      var parts = String(key || "").split("-").map(Number);
      if (parts.length !== 3 || parts.some(function (part) { return !Number.isFinite(part); })) return NaN;
      return Date.UTC(parts[0], parts[1] - 1, parts[2]);
    }
    var start = utcForKey(epochKey);
    var end = utcForKey(todayKey);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return [];
    var out = [];
    for (var at = start; at < end; at += 86400000) out.push(new Date(at).toISOString().slice(0, 10));
    return out;
  }

  function buildShareText(options) {
    options = options || {};
    var mode = options.mode || "daily";
    var heading = mode === "daily" ? "VOCALOID Mikudle · Daily · " + options.dateKey
      : mode === "archive" ? "VOCALOID Mikudle · Archive · " + options.dateKey
      : "VOCALOID Mikudle · Practice";
    var moves = Number(options.moves) || 0;
    var par = Number(options.par) || 0;
    var hints = Number(options.hints) || 0;
    var marks = String(options.marks || "");
    var route = String(options.start || "").toUpperCase() + " → MIKU";
    return heading + "\nResult · Solved · " + moves + " move" + (moves === 1 ? "" : "s") + " · par " + par
      + (hints ? " · " + hints + " hint" + (hints === 1 ? "" : "s") : " · no hints")
      + "\n" + marks + "\n" + route;
  }

  return {
    normalizeWord: normalizeWord,
    oneLetterApart: oneLetterApart,
    makeWordSet: makeWordSet,
    neighbors: neighbors,
    shortestPath: shortestPath,
    validateMove: validateMove,
    pickForKey: pickForKey,
    archiveDateKeys: archiveDateKeys,
    buildShareText: buildShareText
  };
});
