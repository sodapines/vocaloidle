# Vocaloidle

Fan-made VOCALOID music games, including VOCALOID Heardle and VOCALOID Higher or Lower.

## Disclaimer

This project was created with the assistance of AI as a fun fan project after the existing VOCALOID Heardle appeared to be down. It is not meant to replace or compete with the original, and I do not claim ownership over VOCALOID, the songs, producers, characters, or related media used for identification/reference. In addition, this project will not be included in any future portfolio of mine.

This project is maintained by sodapines and facilitated by VocaStats. Feedback, corrections, bug reports, and suggestions are welcome, especially for song metadata, broken audio links, missing songs, duplicate entries, or gameplay issues.

Contact: kzen@sodapines.dev

## Project structure

- `index.html` - Vocaloidle home and game selector
- `heardle/index.html` - VOCALOID Heardle page markup
- `heardle/app.js` - Heardle game logic
- `heardle/settings.js` - Heardle settings logic
- `higher-or-lower/index.html` - Higher or Lower page, styles, and game logic
- `styles.css` - shared Heardle visual design
- `data/songs.js` - generated song metadata used by the browser
- `data/views.json` - cached NicoNico view counts used by Higher or Lower
- `data/song-ids.txt` - VocaDB song IDs used for regeneration
- `scripts/generate-songs.js` - refreshes metadata from VocaDB

## Refresh song metadata

```sh
node scripts/generate-songs.js https://audio.sodapines.dev
