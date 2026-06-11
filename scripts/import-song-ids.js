const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const jsonPath = path.join(dataDir, "songs.json");
const jsPath = path.join(dataDir, "songs.js");
const idListPath = path.join(dataDir, "song-ids.txt");
const inputPath = process.argv[2];
const audioBaseUrl = (process.env.AUDIO_BASE_URL || "https://audio.sodapines.dev").replace(/\/+$/, "");
const audioExtension = (process.env.AUDIO_EXTENSION || "mp3").replace(/^\./, "");
const importDate = new Date().toISOString().slice(0, 10);
const importBatch = `batch-${importDate}`;
const poolLists = [
  { id: 186, tag: "nnd-100k", name: "(NND) More than 100K views" },
  { id: 30, tag: "nnd-1m", name: "(NND) More than 1M views" },
  { id: 6477, tag: "nnd-10m", name: "(NND) More than 10M views" },
  { id: 2665, tag: "yt-1m", name: "(YT) More than 1M views" },
  { id: 6478, tag: "yt-10m", name: "(YT) More than 10M views" },
  { id: 10463, tag: "yt-100m", name: "(YT) More than 100M views" },
  { id: 12694, tag: "project-sekai", name: "Game: Project SEKAI COLORFUL STAGE! feat. Hatsune Miku" },
  { id: 9375, tag: "project-sekai", name: "Game: Project SEKAI COLORFUL STAGE! feat. Hatsune Miku (Original Songs)" },
  { id: 10219, tag: "project-sekai", name: "Contest: Project SEKAI COLORFUL STAGE! feat. Hatsune Miku (Song Contest Winners)" },
];

if (!inputPath) {
  throw new Error("Usage: node scripts/import-song-ids.js <path-to-id-list>");
}

const artistAliases = new Map(
  Object.entries({
    THREE: ["THREEE", "Surii", "surii", "すりぃ"],
    THREEE: ["THREE", "Surii", "surii", "すりぃ"],
    Surii: ["THREE", "THREEE", "surii", "すりぃ"],
    "すりぃ": ["THREE", "THREEE", "Surii", "surii"],
  }),
);

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

function cleanName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
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
  const singerNames = unique(splitNames(singerPart).map(cleanSingerName));
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
  if (url.includes("/maxresdefault.jpg")) return 100;
  if (url.includes("/sddefault.jpg")) return 90;
  if (url.includes("nicovideo.cdn.nimg.jp")) return 85;
  if (url.includes("/hqdefault.jpg")) return 80;
  if (!url.includes("ytimg.com")) return 75;
  if (url.includes("/mqdefault.jpg")) return 60;
  if (url.includes("/default.jpg")) return 20;
  if (url.includes("ytimg.com")) return 45;
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

function pickPrimaryArtist(song) {
  const producer = song.artists?.find((artist) => artist.categories?.includes("Producer"));
  const circle = song.artists?.find((artist) => artist.categories?.includes("Circle"));
  const firstNamedArtist = song.artists?.find((artist) => artist.name);

  return producer?.name || circle?.name || firstNamedArtist?.name || song.artistString || "Unknown";
}

function getAcceptedTitles(song) {
  const titles = [song.defaultName, song.name, ...(song.names?.map((name) => name.value) || [])].filter(Boolean);
  return [...new Set(titles)];
}

function getPoolNames(details) {
  return unique((details?.pools || []).map((pool) => pool.name));
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

async function fetchSong(id) {
  const fields = "Artists,Names,PVs,ThumbUrl,MainPicture";
  const response = await fetch(`https://vocadb.net/api/songs/${id}?fields=${fields}&lang=English`);

  if (!response.ok) {
    throw new Error(`VocaDB ${id} returned ${response.status}`);
  }

  return response.json();
}

async function fetchPoolSongIds(pool) {
  const ids = new Set();
  const maxResults = 100;
  let start = 0;

  while (true) {
    const url = new URL(`https://vocadb.net/api/songLists/${pool.id}/songs`);
    url.searchParams.set("start", String(start));
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("getTotalCount", "true");
    url.searchParams.set("fields", "AdditionalNames");
    url.searchParams.set("lang", "English");

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`${pool.name} returned ${response.status}; pool tags skipped`);
      return ids;
    }

    const data = await response.json();
    const items = data.items || [];
    items.forEach((item) => {
      const id = item?.song?.id;
      if (id) ids.add(String(id));
    });

    start += items.length;
    if (items.length === 0 || start >= (data.totalCount || 0)) break;
  }

  return ids;
}

async function fetchPoolMemberships() {
  const memberships = new Map();

  for (const pool of poolLists) {
    const ids = await fetchPoolSongIds(pool);
    ids.forEach((id) => {
      const current = memberships.get(id) || [];
      current.push(pool);
      memberships.set(id, current);
    });
  }

  return memberships;
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main() {
  const inputIds = unique(
    (await fs.readFile(inputPath, "utf8"))
      .split(/\r?\n/)
      .map((line) => line.match(/(\d+)\s*$/)?.[1])
      .filter(Boolean),
  ).map(Number);
  const existingIdLines = (await fs.readFile(idListPath, "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const existingIdSet = new Set(existingIdLines.map(Number));
  const newIds = inputIds.filter((id) => !existingIdSet.has(id));
  const existingSongs = JSON.parse(await fs.readFile(jsonPath, "utf8"));
  const existingSongIds = new Set(existingSongs.map((song) => Number(song.vocadbId)));
  const idsToFetch = newIds.filter((id) => !existingSongIds.has(id));
  const latestDate = existingSongs
    .map((song) => song.date)
    .filter(Boolean)
    .sort()
    .at(-1);
  const startDate = latestDate ? addDays(new Date(`${latestDate}T00:00:00Z`), 1) : new Date();

  console.log(`Input IDs: ${inputIds.length}`);
  console.log(`New IDs: ${newIds.length}`);
  console.log(`Fetching from VocaDB: ${idsToFetch.length}`);

  const poolMemberships = await fetchPoolMemberships();

  const fetchedSongs = await mapWithConcurrency(idsToFetch, 6, async (id, index) => {
    const vocadbSong = await fetchSong(id);
    const poolMatches = poolMemberships.get(String(id)) || [];
    const vocadbPools = getPoolNames({ pools: poolMatches });
    const coverArts = getCoverArtCandidates(vocadbSong);
    const generatedSong = {
      date: toDateKey(addDays(startDate, index)),
      vocadbId: id,
      title: vocadbSong.name || vocadbSong.defaultName,
      artist: pickPrimaryArtist(vocadbSong),
      artistString: vocadbSong.artistString || pickPrimaryArtist(vocadbSong),
      vocadbName: vocadbSong.name || vocadbSong.defaultName,
      vocadbUrl: `https://vocadb.net/S/${id}`,
      coverArt: coverArts[0] || "",
      coverArts,
      publishDate: vocadbSong.publishDate || "",
      acceptedTitles: getAcceptedTitles(vocadbSong),
      audioClip: `${audioBaseUrl}/${id}.${audioExtension}`,
      vocadbPools,
      sourceTags: unique(["community", "new", ...poolMatches.map((pool) => pool.tag)]),
      addedBatch: importBatch,
      addedAt: importDate,
    };

    return {
      ...generatedSong,
      ...buildDisplayMetadata(generatedSong),
    };
  });

  const nextIdLines = [...existingIdLines, ...newIds.map(String)];
  const nextSongs = [...existingSongs, ...fetchedSongs];

  await fs.writeFile(idListPath, `${nextIdLines.join("\n")}\n`);
  await fs.writeFile(jsonPath, `${JSON.stringify(nextSongs, null, 2)}\n`);
  await fs.writeFile(jsPath, `window.VOCALOID_HEARDLE_SONGS = ${JSON.stringify(nextSongs, null, 2)};\n`);

  console.log(`Songs before: ${existingSongs.length}`);
  console.log(`Songs after: ${nextSongs.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
