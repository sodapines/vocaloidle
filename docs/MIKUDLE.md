# Mikudle — word-ladder game idea

Status: **idea, not started**. Word-list feasibility checked 2026-08-19; no code
written in the repo yet.

## The pitch

A word-ladder puzzle (like the classic "Word Ladder" / Doublets game): you're
given a random 4-letter starting word and have to reach **MIKU**, changing one
letter at a time, with every intermediate step a real word.

```
lime -> mime -> mike -> miku
```

Fits the site's existing daily-puzzle pattern (Heardle, Higher/Lower, Grid,
Timeline, Connections) — same shell, same daily-key/streak/archive
conventions could apply here too.

## Feasibility check (2026-08-19)

Ran a throwaway exploration script against two independent English word
lists (`an-array-of-english-words`, `word-list` — both ~5,500 four-letter
words, results nearly identical between them). Not committed to the repo;
this doc is the record of what it found.

**MIKU only has one real-word neighbor:** `mike` (u→e). Every possible chain's
last hop is `mike -> miku`, so every puzzle converges on the same final
"aha" — `make` / `mile` / `bike` are the most common runner-up steps.

**Coverage is basically unconstrained:** 5,452 of 5,528 four-letter words
(98.6%) can reach MIKU at all. Starting-word selection isn't the bottleneck.

**Distance distribution** (steps to MIKU) is a clean bell curve peaking
around 5:

| dist | words | dist | words |
|---|---|---|---|
| 1 | 1 | 7 | 701 |
| 2 | 19 | 8 | 474 |
| 3 | 198 | 9 | 104 |
| 4 | 831 | 10 | 32 |
| 5 | 1765 | 11 | 8 |
| 6 | 1316 | 12 | 3 |

**Everyday words land in a fair range.** Hand-checked ~50 common words
(rather than trusting the raw dictionary) — most fall in the 3–8 step range,
which feels like the right daily-puzzle difficulty band:

```
lime 3   time 3   fire 3   cake 3   milk 3
love 4   hope 4   pink 4   cute 4   face 4
kids 5   girl 5   name 5   song 5   game 5
book 6   cool 6   door 6   coat 6
star 7   rain 7   hair 7
blue 8   snow 8   shoe 8
```

## The one real blocker: word curation

Raw dictionary word lists are full of obscure/archaic filler that's technically
valid but nobody would recognize — `ympt`, `gaks`, `aias`, `odyl`, etc. show
up as intermediate steps on longer chains. A puzzle built from the raw list
would let the *answer* path use words the player has never heard of, which
isn't fair.

Needs a "is this word common enough" filter before real puzzle curation can
start. A quick npm search for a ready-made frequency word list came up empty
(`google-10000-english` doesn't exist on npm; `most-common-words-by-language`
has a broken dependency). Options, not yet evaluated:
- Hand-build a stoplist / allowlist for 4-letter words only (~5,500 words is
  small enough to review in a sitting, or filter via a scored pass).
- Find a different frequency source (SCOWL, NGSL, a Wordle-adjacent
  answer-word list) and cross-reference offline.

## What building this would take

- **Puzzle-gen script** (`scripts/` — offline, not shipped to the client):
  build the word graph, filter to common words, generate/curate a daily
  start word with a good chain length (par) for each day, write a data file
  similar in spirit to `data/recentadditions.json`.
- **Game UI**: new top-level folder (`mikudle/`, matching `masume/`,
  `timeline/`, `connections/`) — can crib the daily-key, stats/streak,
  archive-calendar, dark-mode, and mobile-nav scaffolding directly from
  Timeline or Masume rather than inventing it.
- **Homepage integration**: new tile in `[AVAILABLE PROJECTS]`, new entry in
  the "Today's Puzzles" strip + details modal (`index.html`), new version
  chip in the Site Stats bar.

Rough sizing: a bare MVP (one daily puzzle, basic input/win state, no
archive) is about a day's work reusing existing patterns. Full parity with
the other games (archive mode, stats depth, mobile polish, i18n) is closer
to what Timeline and Masume actually took — many iterative passes.
