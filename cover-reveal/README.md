# Cover Reveal

Static game at `/cover-reveal/`; uses the existing VOCALOIDLE chrome, shared rail and archive styles. No build step or additional services required.

- Daily launch: September 6, 2026, local midnight. Archive excludes today and future dates.
- `pool.json` freezes 664 songs with at least 1M NicoNico views at launch, including artwork fallbacks and aliases. Keep its order and records immutable: daily selection uses the day index, cycles without repeats, and must not change when the shared catalog grows. Add future pools with an explicit version/date boundary instead of rebuilding this file. `art-fixes.json` holds the exceptions: `art` lists non-Topic artwork for songs whose thumbnail came from an auto-generated YouTube Topic upload, and `swaps` replaces a song in its slot when it has no other art.
- All progress keys start with `cr_`. Daily and archive share the date's save, but playing an old date does not count toward daily stats. Unlimited keeps its current round and latest 500 completed games. Daily statistics are derived from unique date saves, avoiding replay double-counting.
- Six wrong guesses/skips end the round. Image failures disable guessing and offer retry; a failed image never silently substitutes a different daily song.
- Backup import validates its own app/version/key scope and round history before applying data. Existing completed days are preserved. Settings, achievements, and Unlimited history are included.
- Artwork remains on the original image hosts. The game tries the original YouTube thumbnail, then catalog artwork fallbacks; a network failure may require retrying. No artwork is generated or copied to this repository.
- Tests: `node --test tests/*.test.cjs` from the repository root.

`../result-art.js` supplies homepage emoji rows for all games. Old Grid saves did not record rarity; they show filled/unfilled squares until opening Grid once recalculates and saves rarity. New saves preserve purple rarity squares. Legacy Timeline rows can be reconstructed from saved order and catalog release dates.
