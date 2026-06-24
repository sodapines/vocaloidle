const fs = require("node:fs/promises");
const path = require("node:path");

const audioExtensions = new Set([".mp3", ".m4a", ".ogg", ".wav", ".webm"]);
const rootDir = path.resolve(__dirname, "..");
const audioDir = path.join(rootDir, "audio");
const dataDir = path.join(rootDir, "data");
const jsonPath = path.join(dataDir, "songs.json");
const jsPath = path.join(dataDir, "songs.js");
const idListPath = process.env.VOCADB_ID_FILE
  ? path.resolve(process.env.VOCADB_ID_FILE)
  : path.join(dataDir, "song-ids.txt");
const audioBaseUrl = normalizeBaseUrl(process.env.AUDIO_BASE_URL || process.argv[2] || "");
const remoteAudioExtension = normalizeExtension(process.env.AUDIO_EXTENSION || "mp3");

function normalizeBaseUrl(value) {
  return value.trim().replace(/\/+$/, "");
}

function normalizeExtension(value) {
  return value.trim().replace(/^\./, "") || "mp3";
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getSongId(fileName) {
  const parsedPath = path.parse(fileName);
  return /^\d+$/.test(parsedPath.name) ? Number(parsedPath.name) : null;
}

async function getExistingSongs() {
  try {
    return JSON.parse(await fs.readFile(jsonPath, "utf8"));
  } catch {
    return [];
  }
}

async function getAudioFilesFromIdList() {
  try {
    const contents = await fs.readFile(idListPath, "utf8");

    return contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const parsedPath = path.parse(line);
        const id = getSongId(line);
        const fileName = path.extname(line) ? line : `${parsedPath.name}.${remoteAudioExtension}`;
        return { fileName, id };
      })
      .filter((file) => file.id)
      .sort((first, second) => first.id - second.id);
  } catch {
    return [];
  }
}

async function getAudioFiles() {
  const idListFiles = await getAudioFilesFromIdList();

  if (idListFiles.length > 0) {
    return idListFiles;
  }

  const entries = await fs.readdir(audioDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => audioExtensions.has(path.extname(fileName).toLowerCase()))
    .map((fileName) => ({
      fileName,
      id: getSongId(fileName),
    }))
    .filter((file) => file.id)
    .sort((first, second) => first.id - second.id);
}

function normalizeImageUrl(value) {
  return value ? value.replace(/^http:\/\//, "https://") : "";
}

function getYouTubeImageCandidates(videoId) {
  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/default.jpg`,
  ];
}

function getYouTubeImageVideoId(url) {
  const match = url.match(/(?:i\d?\.ytimg\.com\/vi\/|img\.youtube\.com\/vi\/)([^/]+)/);
  return match?.[1] || "";
}

function expandImageCandidates(url) {
  const videoId = getYouTubeImageVideoId(url);
  return videoId ? getYouTubeImageCandidates(videoId) : [url];
}

function getCoverArtScore(url) {
  if (url.includes("/maxresdefault.jpg")) {
    return 100;
  }

  if (url.includes("/sddefault.jpg")) {
    return 90;
  }

  if (url.includes("nicovideo.cdn.nimg.jp")) {
    return 85;
  }

  if (!url.includes("ytimg.com")) {
    return 75;
  }

  if (url.includes("/hqdefault.jpg")) {
    return 80;
  }

  if (url.includes("/mqdefault.jpg")) {
    return 60;
  }

  if (url.includes("/default.jpg")) {
    return 20;
  }

  if (url.includes("ytimg.com")) {
    return 45;
  }

  return 50;
}

function getCoverArtCandidates(song) {
  const pvs = song.pvs || [];
  const originalPv = pvs.find((pv) => pv.pvType === "Original" && pv.thumbUrl);
  const youtubePvs = pvs.filter((pv) => pv.service === "Youtube" && pv.pvId);
  const candidates = [
    song.mainPicture?.urlThumb,
    song.thumbUrl,
    originalPv?.thumbUrl,
    song.mainPicture?.urlSmallThumb,
    song.mainPicture?.urlOriginal,
    ...youtubePvs.flatMap((pv) => getYouTubeImageCandidates(pv.pvId)),
    ...pvs.map((pv) => pv.thumbUrl),
  ]
    .map(normalizeImageUrl)
    .flatMap(expandImageCandidates)
    .filter(Boolean);

  return [...new Set(candidates)].sort((firstUrl, secondUrl) => getCoverArtScore(secondUrl) - getCoverArtScore(firstUrl));
}

function pickCoverArt(song) {
  return getCoverArtCandidates(song)[0] || "";
}

function pickPrimaryArtist(song) {
  const producer = song.artists?.find((artist) => artist.categories?.includes("Producer"));
  const circle = song.artists?.find((artist) => artist.categories?.includes("Circle"));
  const firstNamedArtist = song.artists?.find((artist) => artist.name);

  return producer?.name || circle?.name || firstNamedArtist?.name || song.artistString || "Unknown";
}

const artistAliases = new Map(
  Object.entries({
    THREE: ["THREEE", "Surii", "surii", "すりぃ"],
    THREEE: ["THREE", "Surii", "surii", "すりぃ"],
    Surii: ["THREE", "THREEE", "surii", "すりぃ"],
    "すりぃ": ["THREE", "THREEE", "Surii", "surii"],
  }),
);

function cleanName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function unique(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const cleaned = cleanName(value);
    const key = cleaned.toLowerCase();

    if (cleaned && !seen.has(key)) {
      seen.add(key);
      result.push(cleaned);
    }
  }

  return result;
}

function splitNames(value) {
  return cleanName(value)
    .split(/\s*,\s*/)
    .map(cleanName)
    .filter(Boolean);
}

function removeParenthetical(value) {
  return cleanName(value).replace(/\s*\([^)]*\)/g, "").trim();
}

function cleanSingerName(value) {
  return removeParenthetical(value)
    .replace(/\b(Append|V[1-9](?:X)?|English|Japanese|Chinese|Korean|AI|SV|Old)\b/gi, "")
    .replace(/\b(Original|Dark|Soft|Solid|Sweet|Light|Vivid|Power|Warm|Whisper|Straight|Natural|Native|Adult|Young|Spicy|Sugar|Unknown|Hard)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getProducerAndSingerParts(artistString = "") {
  const parts = artistString.split(/\s+feat\.\s+/i);

  return {
    producerPart: parts[0] || "",
    singerPart: parts.slice(1).join(" feat. "),
  };
}

function buildDisplayMetadata(song) {
  const artistString = song.artistString || song.artist || "";
  const { producerPart, singerPart } = getProducerAndSingerParts(artistString);
  const producerNames = unique(splitNames(producerPart || song.artist));
  const singerNames = unique(
    splitNames(singerPart)
      .map(cleanSingerName),
  );
  const searchableSingerNames = unique(splitNames(singerPart).flatMap((name) => [removeParenthetical(name), cleanSingerName(name)]));
  const aliasNames = unique(
    [...producerNames, song.artist]
      .flatMap((name) => [name, ...(artistAliases.get(name) || [])]),
  );
  const displayParts = [
    producerNames.join(", "),
    singerNames.length ? `feat. ${singerNames.join(", ")}` : "",
  ].filter(Boolean);

  return {
    producerNames,
    singerNames,
    displayArtist: displayParts.join(" "),
    suggestionArtistString: displayParts.join(" "),
    artistSearchNames: unique([
      song.artist,
      artistString,
      ...producerNames,
      ...singerNames,
      ...searchableSingerNames,
      ...aliasNames,
    ]),
  };
}

function getAcceptedTitles(song) {
  const titles = [song.defaultName, song.name, ...(song.names?.map((name) => name.value) || [])].filter(Boolean);
  return [...new Set(titles)];
}

async function fetchSong(id) {
  const fields = "Artists,Names,PVs,ThumbUrl,MainPicture";
  const response = await fetch(`https://vocadb.net/api/songs/${id}?fields=${fields}&lang=English`);

  if (!response.ok) {
    throw new Error(`VocaDB ${id} returned ${response.status}`);
  }

  return response.json();
}

function getDateForSong(existingById, id, index) {
  const existingDate = existingById.get(id)?.date;

  if (existingDate) {
    return existingDate;
  }

  const latestDate = [...existingById.values()]
    .map((song) => song.date)
    .filter(Boolean)
    .sort()
    .at(-1);
  const startDate = latestDate ? addDays(new Date(`${latestDate}T00:00:00`), 1) : new Date();

  return toDateKey(addDays(startDate, index));
}

function getAudioClip(fileName) {
  return audioBaseUrl ? `${audioBaseUrl}/${fileName}` : `audio/${fileName}`;
}

async function main() {
  const audioFiles = await getAudioFiles();

  if (audioFiles.length === 0) {
    throw new Error("No VocaDB-ID audio files found. Rename files like audio/1322.mp3 first.");
  }

  const existingSongs = await getExistingSongs();
  const existingById = new Map(existingSongs.map((song) => [Number(song.vocadbId), song]));
  const generatedSongs = [];

  for (const [index, audioFile] of audioFiles.entries()) {
    const song = await fetchSong(audioFile.id);
    const coverArts = getCoverArtCandidates(song);
    const nndOriginalPv = (song.pvs || []).find(
      (pv) => pv.service === "NicoNicoDouga" && pv.pvType === "Original",
    );
    const generatedSong = {
      date: getDateForSong(existingById, audioFile.id, index),
      vocadbId: audioFile.id,
      title: song.name || song.defaultName,
      artist: pickPrimaryArtist(song),
      artistString: song.artistString || pickPrimaryArtist(song),
      vocadbName: song.name || song.defaultName,
      vocadbUrl: `https://vocadb.net/S/${audioFile.id}`,
      coverArt: coverArts[0] || "",
      coverArts,
      publishDate: song.publishDate || "",
      acceptedTitles: getAcceptedTitles(song),
      audioClip: getAudioClip(audioFile.fileName),
      // Only songs with an ORIGINAL NicoNico upload belong in the view-count games.
      // Reprints / other-media NND uploads can be deleted or differ in views.
      nndOriginal: Boolean(nndOriginalPv),
      nndOriginalId: nndOriginalPv?.pvId || "",
    };

    generatedSongs.push({
      ...generatedSong,
      ...buildDisplayMetadata(generatedSong),
    });
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(jsonPath, `${JSON.stringify(generatedSongs, null, 2)}\n`);
  await fs.writeFile(jsPath, `window.VOCALOID_HEARDLE_SONGS = ${JSON.stringify(generatedSongs, null, 2)};\n`);

  console.log(`Generated ${generatedSongs.length} songs from VocaDB.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
