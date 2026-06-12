const clipStages = [1, 2, 4, 7, 11, 16];
const maxClipLength = clipStages.at(-1);
const songs = window.VOCALOID_HEARDLE_SONGS || [];
const statsKey = "vocaloid-heardle-stats";
const unlimitedStatsKey = "vocaloid-heardle-unlimited-stats";
const filteredStatsKey = "vocaloid-heardle-filtered-stats";
const archiveResultsKey = "vocaloid-heardle-archive-results";
const achievementsKey = "vocaloid-heardle-achievements";
const bookmarksKey = "vocaloid-heardle-bookmarks";
const unlimitedRecentKey = "vocaloid-heardle-unlimited-recent";
const unlimitedRecentLimit = 100;
const unlimitedHistoryKey = "vocaloid-heardle-unlimited-history";
const filteredHistoryKey = "vocaloid-heardle-filtered-history";
const unlimitedHistoryLimit = 100;
const unlimitedActiveRoundKey = "vocaloid-heardle-unlimited-active-round";
const unlimitedDifficultyStatsKey = "vocaloid-heardle-unlimited-difficulty-stats";
const unlimitedDifficultyHistoryKey = "vocaloid-heardle-unlimited-difficulty-history";
const unlimitedDifficultyRecentKey = "vocaloid-heardle-unlimited-difficulty-recent";
const unlimitedFiltersKey = "vocaloid-heardle-unlimited-filters";
const visitorCountedKey = "vocaloid-heardle-visitor-counted";
const sessionModeKey = "vocaloid-heardle-session-mode";
const sessionDifficultyKey = "vocaloid-heardle-session-difficulty";
const contactEmail = "kzen@sodapines.dev";

const UNLIMITED_DIFFICULTIES = ["all", "free", "easy", "medium", "hard", "unknown"];
const UNLIMITED_PRACTICE_DIFFICULTIES = UNLIMITED_DIFFICULTIES.filter((key) => key !== "all");
const DIFFICULTY_MIN_PLAYS = 10;
const FILTER_PROGRAMS = ["VOCALOID", "SynthV", "UTAU", "CeVIO", "Piapro"];
const FILTER_YEARS = Array.from({ length: 20 }, (_, index) => String(2007 + index));
const NEW_SONG_BOOST_RATE = 0.15;
const NEW_SONG_WINDOW_DAYS = 45;

// ── DANMAKU COMMENT POOL ──
const DANMAKU_POOL = [
  "草", "www", "神曲!!", "懐かしい～", "ボカロ最高", "I know this one!!",
  "GOAT song fr", "わかる", "これ好きすぎる", "名曲", "泣ける", "やばい",
  "初見でわかった", "むずい", "懐かしすぎ", "天才", "ｗｗｗ", "好きすぎる",
  "ずるい", "エモい", "うわーこれ知ってる", "全部聴いた", "神", "この曲やばい",
  "ボカロ沼へようこそ", "わかった！", "あーこれか", "うおおお", "ｷﾀ━━━!!",
  "こんなん絶対わかんない", "余裕でしょ", "え待って何これ", "知らん曲だ",
  "これむず", "何回聴いた", "泣", "名曲すぎ", "懐かしすぎて死ぬ",
  "ggez", "no way i know this", "wait i've heard this", "too easy lol",
  "this is a banger", "no clue", "i love this song", "goat",
  "absolutely no idea", "WAIT I KNOW THIS", "classic", "underrated fr",
];

const SENBONZAKURA_COMMENTS = [
  "千本桜!!", "千本桜キタ━━━!!", "SENBONZAKURA!!!", "これは千本桜でしょ",
  "千本桜すき", "ｷﾀｷﾀｷﾀ━━━!!", "千本桜神曲", "わかった千本桜",
  "千本桜余裕", "これは有名すぎる", "伝説の曲", "www千本桜",
  "LETS GOOO", "SENBONZAKURA LETS GO", "no way its senbonzakura",
  "CALLED IT", "千本桜は別格", "千本桜！！！", "神！！！",
  "ボカロ最高峰", "殿堂入り当然", "千本桜すぎ草", "キタキタキタキタ",
];

let mylistCount = Number(localStorage.getItem("vocaloid-heardle-mylist") || 0);

function initMylist() {
  const el = document.getElementById("nnd-mylist-count");
  if (el) el.textContent = mylistCount.toLocaleString();
}

// ── i18n ──
const STRINGS = {
  en: {
    dailyPuzzle: "daily puzzle",
    unlimitedPuzzle: "unlimited puzzle",
    unlimitedPracticePuzzle: (label) => `${label} practice`,
    daily: "Daily",
    unlimited: "Unlimited",
    archive: "Archive",
    archivePuzzle: "archive puzzle",
    difficultyAll: "All",
    difficultyFreeShort: "Free",
    difficultyEasyShort: "Easy",
    difficultyMediumShort: "Medium",
    difficultyHardShort: "Hard",
    difficultyUnknownShort: "???",
    difficultyAllNote: "Unlimited mode · counted in global rankings",
    difficultyPracticeNote: "Practice mode · not counted in global rankings",
    difficultyLoading: "Loading difficulty pools...",
    difficultyUnavailable: "No eligible songs in this difficulty yet.",
    attempt: (n, total) => `Attempt ${n} of ${total}`,
    coverCaption: "cover art appears after the answer",
    noSchedule: "No puzzle is scheduled for today yet.",
    songTitle: "Song Title",
    submit: "Submit",
    skip: "Skip",
    giveUp: "Give Up",
    nextSong: "Next Song",
    copyResult: "Copy Result",
    pastGuesses: "Past Guesses",
    videoBracket: "[VIDEO]",
    videoOpeningClip: "Opening Clip",
    metaViewsBracket: "[views]",
    metaCategoryBracket: "[category]",
    metaMylistBracket: "[mylist]",
    metaSourceBracket: "[source]",
    logBracket: "[LOG]",
    modalMylistPrefix: "[MYLIST]",
    modalUpdatePrefix: "[UPDATE]",
    modalSourcePrefix: "[SOURCE]",
    noGuesses: "No guesses yet",
    correct: "Correct",
    wrong: "Wrong",
    strongMatch: "Strong match",
    artistMatch: "Artist match",
    vocalMatch: "Vocal match",
    skipped: "Skipped",
    answer: "Answer",
    gaveUp: "Gave up",
    dailyStats: "Daily Stats",
    unlimitedStats: "Unlimited Stats",
    played: "Played",
    won: "Won",
    winRate: "Win Rate",
    streak: "Streak",
    bestStreak: "Best Streak",
    songsInPool: "Songs in pool",
    viewFullStats: "View full stats →",
    sidebarDifficulty: "Difficulty",
    sidebarArchive: "Archive",
    sidebarTotal: "Total",
    sidebarMilestones: "Milestones",
    milestoneHallOfFame: "Hall of Fame",
    milestoneHallOfLegends: "Hall of Legends",
    milestoneHallOfMyths: "Hall of Myths",
    milestoneFooter: "NicoNico view tiers",
    sidebarVisitors: "Visitors",
    visitorTotal: "Total visitors",
    visitorSince: "Since",
    sidebarNews: "News",
    newsV15: "Unlimited song filters & pool milestones",
    newsV14: "Practice modes & pool checker",
    newsV13: "Bookmarks & partial credit",
    newsV12: "Artist match feedback",
    newsV11: "Achievements & global rankings",
    howToPlay: "How to Play",
    hallOfMyths: "Hall of Myths",
    links: "Links",
    toastCorrect: (title) => `Correct! - ${title}`,
    toastAnswer: (title) => `The answer was: ${title}`,
    toastCopied: "Result copied to clipboard",
    toastAchievementUnlocked: "Achievement unlocked",
    modalAchievementsTitle: "Achievements",
    achievementsSummary: (unlocked, total) => `${unlocked} / ${total} unlocked`,
    achievementStatusUnlocked: (date) => `Unlocked ${date}`,
    achievementStatusLocked: "Locked",
    achievementHiddenTitle: "???",
    achievementHiddenDesc: "This achievement is still hidden.",
    achievementCategoryAll: "All",
    achievementCategoryGeneral: "General",
    achievementCategoryDaily: "Daily",
    achievementCategoryUnlimited: "Unlimited",
    achievementCategoryArchive: "Archive",
    achievementCategoryKnowledge: "Knowledge",
    achievementCategoryChallenge: "Challenge",
    achievementCategorySecret: "Secret",
    achievementSearchLabel: "Search achievements",
    achievementSearchPlaceholder: "Search by name, description, or category",
    achievementNoResults: "No achievements match that search.",
    bookmark: "Bookmark",
    bookmarked: "Bookmarked",
    modalBookmarksTitle: "Bookmarks",
    bookmarksIntro: "Saved songs stay on this device. Audio previews use the hosted puzzle clips.",
    bookmarksSearchPlaceholder: "Search bookmarks...",
    bookmarksEmpty: "No bookmarks yet.",
    bookmarksNoResults: "No bookmarked songs match that search.",
    bookmarksPlay: "Play",
    bookmarksPause: "Pause",
    bookmarksRemove: "Remove",
    bookmarksYear: "Year",
    toastStatsReset: "Stats have been reset",
    toastAlreadyGuessed: "Already guessed.",
    toastStrongMatch: "Artist and vocal match, but the song title is different.",
    toastArtistMatch: "Artist matches, but the song title is different.",
    toastVocalMatch: "Vocal matches, but the song title is different.",
    toastSelectSong: "Select a song from the list.",
    heardleDaily: "VOCALOID Heardle Daily",
    heardleUnlimited: "VOCALOID Heardle Unlimited",
    heardleUnlimitedDifficulty: (label) => `VOCALOID Heardle Unlimited - ${label}`,
    heardleArchive: "VOCALOID Heardle Archive",
    shareGlobalStats: (rate, avg) => `${rate}% solve${avg !== null ? ` · ${avg.toFixed(1)}/6 avg` : ""}`,
    shareSelectResult: "Select Result",
    placeholder: "type your guess...",
    disclaimer: "Some songs may not begin playing within the first second.",
    marquee: "★ A new daily puzzle is available each day ★ Use unlimited mode to practice anytime ★ Guess the VOCALOID song from the opening clip in 6 tries or less ★ Share your score with friends! ★ Songs sourced from VocaDB ★",
    introCopy: "Guess the VOCALOID song from the opening clip.",
    breadcrumb: "Games > Music > VOCALOID > Heardle",
    footerText: "VOCALOID Heardle: fan-made daily guessing game (c) 2026 | Not affiliated with Crypton Future Media, NicoNico, or VocaDB | Song data from",
    footerPageTop: "Page Top",
    howToPlayStep1: "Press ▶ to hear the opening clip",
    howToPlayStep2: "Type the song title and submit",
    howToPlayStep3: "Wrong or skipped? More clip unlocks",
    howToPlayStep4: "Guess correctly in 6 tries to win",
    howToPlayStep5: "Share your score when done!",
    hofNote: "Most viewed VOCALOID songs on NicoNico",
    modalHowToPlayTitle: "How to Play",
    modalHowToPlayP1: "Listen to the intro, then find the correct VOCALOID song.",
    modalHowToPlayP2: "Skipped or incorrect attempts unlock more of the clip.",
    modalHowToPlayP3: "Guess in as few tries as possible and share your score.",
    modalHowToPlayPlay: "Play",
    modalAboutTitle: "About",
    modalAboutP1: "VOCALOID Heardle is a daily song guessing game built around VOCALOID and vocal synth music.",
    modalAboutP2: "Each puzzle reveals a little more of the intro after every wrong guess or skip. Song details and VocaDB links appear after the answer.",
    modalSupportTitle: "Support",
    modalSupportP1: "VOCALOID Heardle is maintained by sodapines as a small fan-made music puzzle project.",
    modalSupportP2: "For bugs, song corrections, or suggestions, email",
    modalSupportP3: "Hosting and the stats backend cost a bit each month to keep running. If you've enjoyed the game and want to chip in, even a one-time tip helps cover those costs.",
    modalReleaseTitle: "Release Notes",
    modalReleaseVersion: "Official Release v1.0",
    modalReleaseIntro: "This release collects the major updates being prepared for the public site.",
    modalReleaseArchive: "Daily Archive with playable past puzzles, monthly completion summaries, and hardest/easiest daily notes.",
    modalReleaseRandom: "Random Archive Puzzle for jumping into older dailies without picking a date.",
    modalReleaseStats: "Global song stats, solve rates, average attempts, and expanded rankings with Lowest/Highest Avg tabs.",
    modalReleasePool: "Song Pool credits, VocaDB source information, and clearer project disclaimers.",
    modalReleaseCommunity: "Suggest a Song, Report Issue forms, and Community Suggested tags for future additions.",
    modalReleaseLanguage: "English/Japanese interface support with song title display options.",
    modalReleasePolish: "Retro NicoNico-inspired layout polish, improved autocomplete, and Cloudflare-hosted audio support.",
    modalSongPoolTitle: "Song Pool",
    modalSongPoolSummary: "Songs are sourced from VocaDB. Daily puzzles are selected from a curated VOCALOID/music database.",
    modalSongPoolTotal: "Total songs in pool",
    modalSongPoolSources: "Sources used",
    modalSongPoolSourcesValue: "VocaDB, YouTube, NicoNico, Cloudflare R2 audio hosting",
    modalSongPoolCredit: "Song data credit",
    modalSongPoolDisclaimer: "VOCALOID Heardle is a fan-made project and is not affiliated with Crypton Future Media, NicoNico, VocaDB, or the artists represented in the song pool.",
    modalSuggestTitle: "Suggest a Song",
    modalSuggestIntro: "Send a song for future puzzle consideration. Suggestions are not guaranteed, but they help improve the pool.",
    modalSuggestCheckTitle: "Check the current pool",
    modalSuggestCheckIntro: "Search first to see if the song is already playable.",
    modalSuggestCheckLabel: "Song search",
    modalSuggestCheckPlaceholder: "type a song title, producer, or vocal synth...",
    modalSuggestCheckStart: "Start typing to check the song pool.",
    modalSuggestCheckNone: "No close matches found in the current pool.",
    modalSuggestCheckStatus: "Already in game",
    modalSuggestLabelTitle: "Song title",
    modalSuggestLabelProducer: "Producer",
    modalSuggestLabelVocal: "Vocal synth",
    modalSuggestLabelVocadb: "VocaDB link",
    modalSuggestLabelSource: "YouTube/NicoNico link",
    modalSuggestLabelReason: "Why should this be included?",
    modalSuggestSubmit: "Email Suggestion",
    modalReportTitle: "Report Issue",
    modalReportIntro: "Use this form to report a problem with the current puzzle.",
    modalReportLabelReason: "Reason",
    modalReportLabelDetails: "Details",
    modalReportDetailPlaceholder: "What happened?",
    modalReportSubmit: "Email Report",
    modalReportOptMetadata: "Wrong song metadata",
    modalReportOptAudio: "Audio does not play",
    modalReportOptSource: "Wrong source",
    modalReportOptDuplicate: "Duplicate song",
    modalReportOptStartpoint: "Bad starting point",
    modalReportOptAnswer: "Answer not accepted",
    modalReportOptOther: "Other",
    reportIssue: "Report issue",
    modalStatsTitle: "Stats",
    modalStatsDailyBtn: "Daily",
    modalStatsUnlimitedBtn: "Unlimited",
    modalStatsFilteredBtn: "Filtered",
    filterButton: "Filters",
    filterButtonCount: (count) => `Filters (${count})`,
    filterSongsMatch: (count) => `${count.toLocaleString()} songs match`,
    filterNoYears: "No years selected",
    filterTagProducer: (value) => `Producer: ${value}`,
    filterTagVoicebank: (value) => `Voicebank: ${value}`,
    filterTagProgram: (value) => `Program: ${value}`,
    filterTagYears: (value) => `Years: ${value}`,
    filterTagCommunity: "Community",
    filterTagNewSongs: "New songs",
    filterModalTitle: "Unlimited Filters",
    filterModalNote: "Limit the next Unlimited song pool using local VocaDB metadata.",
    filterWarning: "Changing filters during an unfinished Unlimited round will count that round as a loss. Completed rounds are safe.",
    filterProducerLabel: "Producer / artist",
    filterVoicebankLabel: "Voicebank / vocal synth",
    filterProducerPlaceholder: "type a producer...",
    filterVoicebankPlaceholder: "type a voicebank...",
    filterProgramLabel: "Program used",
    filterYearLabel: "Publish year",
    filterCommunityLabel: "Community suggested",
    filterNewSongsLabel: "New songs",
    filterInclusiveLabel: "Inclusive",
    filterOptionsLabel: "Options",
    filterYearStatusLabel: "Selected",
    filterMatchLabel: "Songs",
    filterClear: "Clear",
    filterApply: "Apply",
    statsSectionDistribution: "Guess Distribution",
    statsSectionOverview: "Overview",
    statsSectionDetail: "Detail",
    statsPlayed: "Played",
    statsWon: "Won",
    statsWinRate: "Win rate",
    statsCurrentStreak: "Streak",
    statsMaxStreak: "Max streak",
    statsAvgAttempts: "Avg attempts",
    statsFirstTry: "First-try solves",
    statsRarestSolve: "Rarest solve",
    statsRarestFirstTry: "Rarest 1/6",
    statsBestPublishYear: "Best publish year",
    statsMostPlayedYear: "Most played year",
    statsArchiveGroup: "Archive Mode",
    statsArchiveProgress: "Progress",
    statsAchievementsGroup: "Achievements",
    statsAchievementsProgress: "Progress",
    statsNoneYet: "None yet",
    statsYearLine: (year, won, played, rate) => `${year} - ${rate}% (${won}/${played})`,
    statsYearPlayedLine: (year, played) => `${year} - ${played} played`,
    statsRarestLine: (title, rate) => `${title} · ${rate}% global solve`,
    statsArchiveProgressLine: (solved, total, rate) => `${solved}/${total} solved · ${rate}%`,
    statsAchievementsProgressLine: (unlocked, total, rate) => `${unlocked}/${total} unlocked · ${rate}%`,
    statsCopyProfile: "Copy Profile",
    profileCopied: "Profile copied to clipboard",
    profileDaily: "Daily",
    profileUnlimited: "Unlimited",
    profileArchive: "Archive",
    profileAchievements: "Achievements",
    profileAvgSolve: "Avg solve",
    profileBestStreak: "Best streak",
    profileRarestSolve: "Rarest solve",
    profileRarestFirstTry: "Rarest 1/6",
    profileFirstTry: "First tries",
    profilePlayed: "played",
    profileWinRate: "win rate",
    profileSolved: "solved",
    profileOpened: "opened",
    profileNoData: "none yet",
    sbAvgAttempts: "Avg Attempts",
    nextDailyCountdown: (h, m, s) => `Next puzzle in <strong>${h}h ${m}m ${s}s</strong>`,
    nextDailyReady: "A new daily puzzle is available!",
    archiveSolved: "Solved",
    archiveFailed: "Open",
    archiveUnplayed: "Available",
    archiveSummaryOpened: "Played",
    archiveSummarySolved: "Solved",
    archiveSummaryRevealed: "Revealed",
    archiveSummaryComplete: "Complete",
    archiveMonthBadge: (solved, total, rate) => `${solved}/${total} solved · ${rate}%`,
    archiveHardest: "Hardest daily",
    archiveEasiest: "Easiest daily",
    archiveInsightsLoading: "Loading month difficulty...",
    archiveInsightsEmpty: "Month difficulty appears after you open archive puzzles.",
    archiveRandom: "Random Archive Puzzle",
    archiveRandomEmpty: "No archive puzzles are available yet.",
    tagCommunitySuggested: "Community suggested",
    tagNewSong: "New",
    tagNnd100k: "Hall of Fame",
    tagNnd1m: "Hall of Legends",
    tagNnd10m: "Hall of Myths",
    tagYt1m: "YouTube 1M",
    tagYt10m: "YouTube 10M",
    tagYt100m: "YouTube 100M",
    tagProjectSekai: "Project SEKAI",
    tagSpecialTest: "Special test label",
    kofiNudgeText: "Enjoying the project? Tips help keep it running.",
    kofiNudgeLink: "Support on Ko-fi →",
    settingsTitle: "Settings",
    settingDarkMode: "Dark Mode",
    settingDarkModeDesc: "Switch between light and dark theme",
    settingBeigeBackground: "Beige Background",
    settingBeigeBackgroundDesc: "Use a warmer beige page background",
    settingBulletComments: "Bullet Comments",
    settingBulletCommentsDesc: "Scrolling danmaku overlay on cover art",
    settingCommentSpeed: "Comment Speed",
    settingCommentSpeedDesc: "How fast bullet comments scroll",
    settingSpeedSlow: "Slow",
    settingSpeedNormal: "Normal",
    settingSpeedFast: "Fast",
    settingCompactMode: "Compact Mode",
    settingCompactModeDesc: "Hides marquee, tags, and sidebar at once",
    settingMarqueeBar: "Marquee Bar",
    settingMarqueeBarDesc: "Scrolling announcement at the top",
    settingSidebar: "Sidebar",
    settingSidebarDesc: "Stats and info panel on the right",
    settingSidebarExtras: "Sidebar Extras",
    settingSidebarExtrasDesc: "News, rankings, visitors, and decorative panels",
    settingTags: "Tags",
    settingTagsDesc: "Category and active filter tags",
    settingAutocomplete: "Autocomplete",
    settingAutocompleteDesc: "Show song suggestions while typing",
    settingDensity: "Bullet Comment Density",
    settingDensityDesc: "How many comments appear on screen",
    settingDensityFew: "Few",
    settingDensityMedium: "Medium",
    settingDensityMany: "Many",
    settingVolume: "Volume",
    settingVolumeDesc: "Clip playback volume",
    settingTitleDisplay: "Song Title Display",
    settingTitleDisplayDesc: "How song titles appear in suggestions and history",
    settingClearInput: "Clear Input on Wrong",
    settingClearInputDesc: "Clears the guess field after a wrong answer",
    settingBackupStats: "Backup Stats",
    settingBackupStatsDesc: "Export or import local stats data",
    settingExportStats: "Export",
    settingImportStats: "Import",
    settingImportPlaceholder: "Paste exported stats JSON here",
    toastStatsExported: "Stats backup copied to clipboard",
    toastStatsImported: "Stats backup imported",
    toastStatsImportFailed: "Stats import failed. Check the backup text.",
    settingReportIssue: "Report Issue",
    settingReportIssueDesc: "Send metadata, audio, duplicate, or answer problems",
    settingReportIssueBtn: "Report",
    settingResetStats: "Reset Stats",
    settingResetStatsDesc: "Permanently clear all your stats",
    settingResetBtn: "Reset",
    settingResetConfirm: "Are you sure? This cannot be undone.",
    settingResetYes: "Yes, reset",
    settingResetNo: "Cancel",
    infoLabel: "[INFO]",
    metaViews: "▶ Views:",
    metaCategory: "Category:",
    metaSource: "Source:",
    navAbout: "About",
    navSupport: "Support",
    navSettings: "Settings",
    navUpdates: "Updates",
    linkReleaseNotes: "Release Notes",
    linkReleaseVersion: "Release v1.5",
    linkAchievements: "Achievements",
    linkSongPool: "Song Pool",
    linkSuggestSong: "Suggest a Song",
    linkReportIssue: "Report an Issue",
    hofSong1: "Senbonzakura",
    hofSong2: "I'll Make You Do the Miku Miku",
    hofSong3: "Melt",
    hofSong4: "World's End Dancehall",
    hofSong5: "Matryoshka",
    hofArtist1: "Kurousa",
    hofArtist2: "ika",
    hofArtist3: "ryo",
    hofArtist4: "wowaka",
    hofArtist5: "hachi",
    linkVocaDB: "VocaDB ↗",
    linkNicoNico: "NicoNico ↗",
    linkAbout: "About this site",
    linkContact: "Contact / Support",
    rankingsHeader: "Global Rankings",
    rankingsTabPlays: "Popular",
    rankingsTabHardest: "Hardest",
    rankingsTabEasiest: "Easiest",
    rankingsTabAvgLow: "Lowest Avg",
    rankingsTabAvgHigh: "Highest Avg",
    rankingsSeeAll: "See all →",
    rankingsNote: "Unlimited mode only · Min. 5 plays",
    rankingsModalTitle: "Global Rankings",
    rankingsPlays: (n) => `${n}`,
    rankingsWin: (n) => `${n}%`,
    rankingsAvgAttempts: (n) => `${n}`,
    rankingsHeaderSong: "Song / Artist",
    rankingsHeaderPlays: "Plays",
    rankingsHeaderWin: "Win%",
    rankingsHeaderAvg: "Avg",
    rankingsNoData: "No data yet.",
    rankingsNoDataModal: "No data yet, play some unlimited songs first!",
    rankingsLoading: "Loading...",
    archiveTitle: "Daily Archive",
    archiveNote: "Play previous daily puzzles. New completed dailies appear here automatically.",
    archiveEmpty: "No puzzle",
    globalStats: (rate, avg, plays) => `Global solve rate: <span class="gs-rate${rate < 30 ? ' gs-hard' : ''}">${rate}%</span> · Avg winning attempts: <span class="gs-rate">${avg}/6</span> · ${plays.toLocaleString()} plays`,
    globalStatsNoWins: (rate, plays) => `Global solve rate: <span class="gs-rate gs-hard">${rate}%</span> · ${plays.toLocaleString()} plays`,
    globalStatsNone: "",
    globalComparisonBeat: "You beat the global average.",
    globalComparisonMatched: "You matched the global average.",
    globalComparisonClose: "Close to the global average.",
    globalComparisonLate: "Later than average.",
    globalComparisonRevealed: "Revealed.",
    globalComparisonLine: (attempts, avg, verdict) => `Your solve: <span>${attempts}/6</span> · Global avg: <span>${avg}/6</span><br>${verdict}`,
    globalComparisonRevealLine: (avg, verdict) => `Global avg: <span>${avg}/6</span><br>${verdict}`,
    difficultyLabel: (label) => `Difficulty: ${label}`,
    difficultyFree: "Free",
    difficultyEasy: "Easy",
    difficultyMedium: "Medium",
    difficultyHard: "Hard",
    difficultyUnknown: "what is this song???",
    introCopy: "Guess the VOCALOID song from the opening clip.",
    breadcrumb: "Games > Music > VOCALOID > Heardle",
    footerText: "VOCALOID Heardle: fan-made daily guessing game (c) 2026 | Not affiliated with Crypton Future Media or NicoNico | Song data from",
    howToPlayStep1: "Press ▶ to hear the opening clip",
    howToPlayStep2: "Type the song title and submit",
    howToPlayStep3: "Wrong or skipped? More clip unlocks",
    howToPlayStep4: "Guess correctly in 6 tries to win",
    howToPlayStep5: "Share your score when done!",
    hofNote: "Most viewed VOCALOID songs on NicoNico",
  },
  jp: {
    dailyPuzzle: "毎日のパズル",
    unlimitedPuzzle: "無制限モード",
    unlimitedPracticePuzzle: (label) => `${label}練習`,
    daily: "毎日",
    unlimited: "無制限",
    archive: "アーカイブ",
    archivePuzzle: "アーカイブ問題",
    difficultyAll: "すべて",
    difficultyFreeShort: "サービス",
    difficultyEasyShort: "簡単",
    difficultyMediumShort: "普通",
    difficultyHardShort: "難しい",
    difficultyUnknownShort: "???",
    difficultyAllNote: "無制限モード・グローバルランキング対象",
    difficultyPracticeNote: "練習モード・グローバルランキング対象外",
    difficultyLoading: "難易度プールを読み込み中...",
    difficultyUnavailable: "この難易度には対象曲がまだありません。",
    attempt: (n, total) => `挑戦 ${n} / ${total}`,
    coverCaption: "正解後にジャケット画像が表示されます",
    noSchedule: "本日のパズルはまだ準備されていません。",
    songTitle: "曲名",
    submit: "送信",
    skip: "スキップ",
    giveUp: "ギブアップ",
    nextSong: "次の曲",
    copyResult: "結果をコピー",
    pastGuesses: "過去の回答",
    noGuesses: "まだ回答がありません",
    correct: "正解",
    wrong: "不正解",
    skipped: "スキップ",
    answer: "答え",
    gaveUp: "ギブアップ",
    dailyStats: "毎日の統計",
    unlimitedStats: "無制限の統計",
    played: "プレイ数",
    won: "正解数",
    winRate: "正解率",
    streak: "連続正解",
    bestStreak: "最高連続正解",
    songsInPool: "曲数",
    viewFullStats: "全統計を見る →",
    howToPlay: "遊び方",
    hallOfMyths: "殿堂入り",
    links: "リンク",
    toastCorrect: (title) => `正解！- ${title}`,
    toastAnswer: (title) => `正解は：${title}`,
    toastCopied: "結果をコピーしました",
    toastAchievementUnlocked: "\u5B9F\u7E3E\u89E3\u9664",
    modalAchievementsTitle: "\u5B9F\u7E3E",
    achievementsSummary: (unlocked, total) => `${unlocked} / ${total} \u89E3\u9664\u6E08\u307F`,
    achievementStatusUnlocked: (date) => `${date}\u306B\u89E3\u9664`,
    achievementStatusLocked: "\u672A\u89E3\u9664",
    achievementHiddenTitle: "???",
    achievementHiddenDesc: "\u6761\u4EF6\u306F\u307E\u3060\u79D8\u5BC6\u3067\u3059\u3002",
    achievementCategoryAll: "\u3059\u3079\u3066",
    achievementCategoryGeneral: "\u4E00\u822C",
    achievementCategoryDaily: "\u30C7\u30A4\u30EA\u30FC",
    achievementCategoryUnlimited: "\u7121\u5236\u9650",
    achievementCategoryArchive: "\u30A2\u30FC\u30AB\u30A4\u30D6",
    achievementCategoryKnowledge: "\u77E5\u8B58",
    achievementCategoryChallenge: "\u30C1\u30E3\u30EC\u30F3\u30B8",
    achievementCategorySecret: "\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8",
    achievementSearchLabel: "\u5B9F\u7E3E\u3092\u691C\u7D22",
    achievementSearchPlaceholder: "\u540D\u524D\u30FB\u8AAC\u660E\u30FB\u30AB\u30C6\u30B4\u30EA\u3067\u691C\u7D22",
    achievementNoResults: "\u6761\u4EF6\u306B\u4E00\u81F4\u3059\u308B\u5B9F\u7E3E\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    bookmark: "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF",
    bookmarked: "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u6E08\u307F",
    modalBookmarksTitle: "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF",
    bookmarksIntro: "\u4FDD\u5B58\u3057\u305F\u66F2\u306F\u3053\u306E\u7AEF\u672B\u306B\u6B8B\u308A\u307E\u3059\u3002\u97F3\u58F0\u30D7\u30EC\u30D3\u30E5\u30FC\u306F\u30D1\u30BA\u30EB\u7528\u306E\u914D\u4FE1\u30AF\u30EA\u30C3\u30D7\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002",
    bookmarksSearchPlaceholder: "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u3092\u691C\u7D22...",
    bookmarksEmpty: "\u307E\u3060\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
    bookmarksNoResults: "\u6761\u4EF6\u306B\u4E00\u81F4\u3059\u308B\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
    bookmarksPlay: "\u518D\u751F",
    bookmarksPause: "\u4E00\u6642\u505C\u6B62",
    bookmarksRemove: "\u524A\u9664",
    bookmarksYear: "\u5E74",
    toastStatsReset: "統計をリセットしました",
    toastAlreadyGuessed: "すでに回答済みです。",
    toastSelectSong: "リストから曲を選んでください。",
    heardleDaily: "VOCALOID Heardle 毎日",
    heardleUnlimited: "VOCALOID Heardle 無制限",
    heardleUnlimitedDifficulty: (label) => `VOCALOID Heardle 無制限 - ${label}`,
    heardleArchive: "VOCALOID Heardle アーカイブ",
    shareGlobalStats: (rate, avg) => `正解率${rate}%${avg !== null ? `・平均${avg.toFixed(1)}/6` : ""}`,
    shareSelectResult: "結果を選択",
    placeholder: "曲名を入力...",
    disclaimer: "曲によっては最初の1秒で再生が始まらない場合があります。",
    marquee: "★ 毎日新しいパズルが更新されます ★ 無制限モードでいつでも練習できます ★ 6回以内にVOCALOID曲を当てよう ★ 結果をシェアしよう！ ★ 楽曲データはVocaDBより ★",
    introCopy: "イントロを聴いてVOCALOID曲を当てよう。",
    breadcrumb: "ゲーム > 音楽 > VOCALOID > Heardle",
    footerText: "VOCALOID Heardle：ファンメイドの毎日クイズゲーム (c) 2026 | クリプトン・フューチャー・メディア及びニコニコと無関係 | 楽曲データ：",
    howToPlayStep1: "▶ を押してイントロを聴く",
    howToPlayStep2: "曲名を入力して送信する",
    howToPlayStep3: "不正解・スキップでより長いクリップが解放される",
    howToPlayStep4: "6回以内に正解する",
    howToPlayStep5: "結果をシェアしよう！",
    hofNote: "ニコニコ動画で最も再生されたVOCALOID曲",
    modalHowToPlayTitle: "遊び方",
    modalHowToPlayP1: "イントロを聴いて、正しいVOCALOID曲を見つけよう。",
    modalHowToPlayP2: "スキップまたは不正解でクリップがより長く解放される。",
    modalHowToPlayP3: "なるべく少ない回数で正解してスコアをシェアしよう。",
    modalHowToPlayPlay: "プレイ",
    modalAboutTitle: "について",
    modalAboutP1: "VOCALOID HeardleはVOCALOIDとボーカル合成音楽をテーマにした毎日の曲当てゲームです。",
    modalAboutP2: "不正解やスキップのたびにイントロが少しずつ解放されます。正解後に曲の詳細とVocaDBリンクが表示されます。",
    modalSupportTitle: "サポート",
    modalSupportP1: "VOCALOID Heardleはsodapinesが運営するファンメイドの音楽パズルプロジェクトです。",
    modalSupportP2: "バグ・曲の修正・ご提案はこちらまで：",
    modalSupportP3: "サーバーと統計バックエンドの維持には毎月少し費用がかかります。気に入っていただけたら、1回限りの寄付でも運営の助けになります。",
    modalSongPoolTitle: "曲プール",
    modalSongPoolSummary: "楽曲はVocaDBから取得しています。デイリーパズルはVOCALOID/音楽データベースからキュレーションされた曲から選ばれます。",
    modalSongPoolTotal: "プールの総曲数",
    modalSongPoolSources: "使用ソース",
    modalSongPoolSourcesValue: "VocaDB・YouTube・ニコニコ動画・Cloudflare R2 音声ホスティング",
    modalSongPoolCredit: "楽曲データ提供",
    modalSongPoolDisclaimer: "VOCALOID Heardleはファンメイドのプロジェクトであり、クリプトン・フューチャー・メディア、ニコニコ動画、VocaDB、および曲プールに含まれるアーティストとは無関係です。",
    modalSuggestTitle: "曲を提案する",
    modalSuggestIntro: "今後のパズル候補として曲を送ってください。採用は保証されませんが、プール改善に役立ちます。",
    modalSuggestCheckTitle: "現在のプールを確認",
    modalSuggestCheckIntro: "送信前に、すでに遊べる曲か検索で確認できます。",
    modalSuggestCheckLabel: "曲検索",
    modalSuggestCheckPlaceholder: "曲名、プロデューサー、ボーカル合成を入力...",
    modalSuggestCheckStart: "入力して曲プールを確認してください。",
    modalSuggestCheckNone: "現在のプールに近い一致はありません。",
    modalSuggestCheckStatus: "ゲームに登録済み",
    modalSuggestLabelTitle: "曲名",
    modalSuggestLabelProducer: "プロデューサー",
    modalSuggestLabelVocal: "ボーカル合成",
    modalSuggestLabelVocadb: "VocaDBリンク",
    modalSuggestLabelSource: "YouTube/ニコニコリンク",
    modalSuggestLabelReason: "なぜ追加すべきですか？",
    modalSuggestSubmit: "メールで提案",
    modalReportTitle: "問題を報告",
    modalReportIntro: "現在のパズルの問題をこのフォームで報告してください。",
    modalReportLabelReason: "理由",
    modalReportLabelDetails: "詳細",
    modalReportDetailPlaceholder: "何が起きましたか？",
    modalReportSubmit: "メールで報告",
    modalReportOptMetadata: "曲のメタデータが間違っている",
    modalReportOptAudio: "音声が再生されない",
    modalReportOptSource: "ソースが違う",
    modalReportOptDuplicate: "曲が重複している",
    modalReportOptStartpoint: "再生開始位置が悪い",
    modalReportOptAnswer: "正解が受け付けられない",
    modalReportOptOther: "その他",
    reportIssue: "問題を報告",
    linkSongPool: "曲プール",
    linkSuggestSong: "曲を提案する",
    modalStatsTitle: "統計",
    modalStatsDailyBtn: "毎日",
    modalStatsUnlimitedBtn: "無制限",
    statsPlayed: "プレイ数",
    statsWon: "正解数",
    statsWinRate: "正解率",
    statsCurrentStreak: "現在の連続正解",
    statsMaxStreak: "最高連続正解",
    statsAvgAttempts: "平均挑戦回数",
    statsFirstTry: "一発正解",
    statsRarestSolve: "最レア正解",
    statsRarestFirstTry: "最レア一発正解",
    statsArchiveGroup: "アーカイブ",
    statsArchiveProgress: "進捗",
    statsAchievementsGroup: "\u5B9F\u7E3E",
    statsAchievementsProgress: "\u9032\u6357",
    statsNoneYet: "まだありません",
    statsRarestLine: (title, rate) => `${title} - グローバル正解率${rate}%`,
    statsArchiveProgressLine: (solved, total, rate) => `${solved}/${total} 正解 · ${rate}%`,
    statsAchievementsProgressLine: (unlocked, total, rate) => `${unlocked}/${total} \u89E3\u9664\u6E08\u307F \u00B7 ${rate}%`,
    statsCopyProfile: "プロフィールをコピー",
    profileCopied: "プロフィールをコピーしました",
    profileDaily: "毎日",
    profileUnlimited: "無制限",
    profileArchive: "アーカイブ",
    profileAchievements: "\u5B9F\u7E3E",
    profileAvgSolve: "平均正解",
    profileBestStreak: "最高連続正解",
    profileRarestSolve: "最レア正解",
    profileRarestFirstTry: "最レア一発正解",
    profileFirstTry: "一発正解",
    profilePlayed: "プレイ",
    profileWinRate: "正解率",
    profileSolved: "正解",
    profileOpened: "開封",
    profileNoData: "まだありません",
    sbAvgAttempts: "平均挑戦",
    nextDailyCountdown: (h, m, s) => `次の問題まで <strong>${h}時間${m}分${s}秒</strong>`,
    nextDailyReady: "新しい問題が利用可能です！",
    archiveSolved: "解放済み",
    archiveFailed: "開封",
    archiveUnplayed: "プレイ可能",
    archiveSummaryOpened: "プレイ",
    archiveSummarySolved: "正解",
    archiveSummaryRevealed: "開封",
    archiveSummaryComplete: "達成率",
    archiveMonthBadge: (solved, total, rate) => `${solved}/${total} 正解 · ${rate}%`,
    archiveHardest: "最難関デイリー",
    archiveEasiest: "最易デイリー",
    archiveInsightsLoading: "月間難易度を読み込み中...",
    archiveInsightsEmpty: "アーカイブ問題を開くと月間難易度が表示されます。",
    archiveRandom: "ランダムアーカイブ",
    archiveRandomEmpty: "利用できるアーカイブ問題はまだありません。",
    tagCommunitySuggested: "コミュニティ推薦",
    tagNewSong: "新曲",
    tagNnd100k: "VOCALOID\u6BBF\u5802\u5165\u308A",
    tagNnd1m: "VOCALOID\u4F1D\u8AAC\u5165\u308A",
    tagNnd10m: "VOCALOID\u795E\u8A71\u5165\u308A",
    tagYt1m: "YouTube 100\u4E07",
    tagYt10m: "YouTube 1000\u4E07",
    tagYt100m: "YouTube 1\u5104",
    tagProjectSekai: "Project SEKAI",
    tagSpecialTest: "特別テストラベル",
    kofiNudgeText: "楽しんでいただけましたか？支援は運営の助けになります。",
    kofiNudgeLink: "Ko-fiで支援する →",
    settingsTitle: "設定",
    settingDarkMode: "ダークモード",
    settingDarkModeDesc: "ライト・ダークテーマの切り替え",
    settingBeigeBackground: "\u30D9\u30FC\u30B8\u30E5\u80CC\u666F",
    settingBeigeBackgroundDesc: "\u6696\u304B\u3044\u8272\u5473\u306E\u30D9\u30FC\u30B8\u30E5\u80CC\u666F\u306B\u3059\u308B",
    settingBulletComments: "弾幕コメント",
    settingBulletCommentsDesc: "カバー画像上にスクロールするコメント",
    settingCommentSpeed: "コメント速度",
    settingCommentSpeedDesc: "コメントのスクロール速度",
    settingSpeedSlow: "遅い",
    settingSpeedNormal: "普通",
    settingSpeedFast: "速い",
    settingCompactMode: "コンパクトモード",
    settingCompactModeDesc: "マーキー・タグ・サイドバーを一括非表示",
    settingMarqueeBar: "マーキーバー",
    settingMarqueeBarDesc: "上部のスクロールアナウンス",
    settingSidebar: "サイドバー",
    settingSidebarDesc: "右側の統計・情報パネル",
    settingTags: "タグ",
    settingTagsDesc: "カテゴリと有効なフィルタータグ",
    settingAutocomplete: "オートコンプリート",
    settingAutocompleteDesc: "入力中に曲名の候補を表示",
    settingDensity: "弾幕コメント密度",
    settingDensityDesc: "画面に表示されるコメント数",
    settingDensityFew: "少ない",
    settingDensityMedium: "普通",
    settingDensityMany: "多い",
    settingVolume: "音量",
    settingVolumeDesc: "クリップの再生音量",
    settingTitleDisplay: "曲名表示",
    settingTitleDisplayDesc: "候補・履歴での曲名の表示方法",
    settingClearInput: "不正解時に入力をクリア",
    settingClearInputDesc: "不正解後に入力欄を自動クリア",
    settingBackupStats: "統計バックアップ",
    settingBackupStatsDesc: "ローカル統計をエクスポート/インポート",
    settingExportStats: "エクスポート",
    settingImportStats: "インポート",
    settingImportPlaceholder: "エクスポートした統計JSONを貼り付け",
    toastStatsExported: "統計バックアップをコピーしました",
    toastStatsImported: "統計バックアップをインポートしました",
    toastStatsImportFailed: "インポートに失敗しました。バックアップ内容を確認してください。",
    settingResetStats: "統計のリセット",
    settingResetStatsDesc: "すべての統計を完全に削除",
    settingResetBtn: "リセット",
    settingResetConfirm: "本当によろしいですか？元に戻せません。",
    settingResetYes: "はい、リセット",
    settingResetNo: "キャンセル",
    infoLabel: "【情報】",
    metaViews: "▶ 再生数：",
    metaCategory: "カテゴリ：",
    metaSource: "ソース：",
    navAbout: "サイトについて",
    navSupport: "サポート",
    navSettings: "設定",
    hofSong1: "千本桜",
    hofSong2: "みくみくにしてあげる♪",
    hofSong3: "メルト",
    hofSong4: "ワールズエンド・ダンスホール",
    hofSong5: "マトリョシカ",
    hofArtist1: "黒うさ",
    hofArtist2: "ika",
    hofArtist3: "ryo",
    hofArtist4: "wowaka",
    hofArtist5: "ハチ",
    linkVocaDB: "VocaDB ↗",
    linkNicoNico: "ニコニコ動画 ↗",
    linkAbout: "このサイトについて",
    linkContact: "お問い合わせ",
    rankingsHeader: "グローバルランキング",
    rankingsTabPlays: "再生数",
    rankingsTabHardest: "難しい",
    rankingsTabEasiest: "簡単",
    rankingsTabAvgLow: "低平均",
    rankingsTabAvgHigh: "高平均",
    rankingsSeeAll: "すべて見る →",
    rankingsNote: "無制限モードのプレイのみ対象。5回未満のプレイは除外されます。",
    rankingsModalTitle: "グローバルランキング",
    rankingsPlays: (n) => `${n}回再生`,
    rankingsWin: (n) => `正解率${n}%`,
    rankingsAvgAttempts: (n) => `${n} 平均挑戦数`,
    rankingsNoData: "データがまだありません。",
    rankingsNoDataModal: "データがまだありません - 無制限モードで曲を当ててみよう！",
    rankingsLoading: "読み込み中...",
    archiveTitle: "アーカイブ",
    archiveNote: "過去のデイリーパズルをプレイできます。終了したデイリーは自動的に追加されます。",
    archiveEmpty: "パズルなし",
    globalStats: (rate, avg, plays) => `グローバル正解率: <span class="gs-rate${rate < 30 ? ' gs-hard' : ''}">${rate}%</span> · 平均挑戦回数: <span class="gs-rate">${avg}/6</span> · ${plays.toLocaleString()}回`,
    globalStatsNoWins: (rate, plays) => `グローバル正解率: <span class="gs-rate gs-hard">${rate}%</span> · ${plays.toLocaleString()}回`,
    globalStatsNone: "",
    globalComparisonBeat: "グローバル平均より早く正解しました。",
    globalComparisonMatched: "グローバル平均と同じ結果です。",
    globalComparisonClose: "グローバル平均に近い結果です。",
    globalComparisonLate: "グローバル平均より遅めです。",
    globalComparisonRevealed: "答えを開示しました。",
    globalComparisonLine: (attempts, avg, verdict) => `あなたの正解: <span>${attempts}/6</span> · 全体平均: <span>${avg}/6</span><br>${verdict}`,
    globalComparisonRevealLine: (avg, verdict) => `全体平均: <span>${avg}/6</span><br>${verdict}`,
    difficultyLabel: (label) => `難易度: ${label}`,
    difficultyFree: "サービス",
    difficultyEasy: "簡単",
    difficultyMedium: "普通",
    difficultyHard: "難しい",
    difficultyUnknown: "なんの曲？？？",
    introCopy: "イントロを聴いてVOCALOID曲を当てよう。",
    breadcrumb: "ゲーム > 音楽 > VOCALOID > Heardle",
    footerText: "VOCALOID Heardle：ファンメイドの毎日クイズゲーム (c) 2026 | クリプトン・フューチャー・メディア及びニコニコと無関係 | 楽曲データ：",
    howToPlayStep1: "▶ を押してイントロを聴く",
    howToPlayStep2: "曲名を入力して送信する",
    howToPlayStep3: "不正解・スキップでより長いクリップが解放される",
    howToPlayStep4: "6回以内に正解する",
    howToPlayStep5: "結果をシェアしよう！",
    hofNote: "ニコニコ動画で最も再生されたVOCALOID曲",
  },
};

Object.assign(STRINGS.jp, {
  modalReleaseTitle: "更新情報",
  modalReleaseVersion: "正式リリース v1.0",
  modalReleaseIntro: "このリリースでは、公開版サイトに向けた主な更新をまとめています。",
  modalReleaseArchive: "過去のデイリーパズルを遊べるアーカイブ、達成率、月ごとの難易度メモを追加。",
  modalReleaseStats: "グローバル楽曲統計、正解率、平均挑戦回数、ランキングを追加。",
  modalReleasePool: "曲プールのクレジット、VocaDBソース情報、プロジェクトの免責表記を整理。",
  modalReleaseCommunity: "曲の提案フォームと問題報告フォームでコミュニティからのフィードバックに対応。",
  modalReleaseLanguage: "英語/日本語インターフェースと曲名表示オプションに対応。",
  modalReleasePolish: "ニコニコ風レトロUIの調整、オートコンプリート改善、Cloudflare配信音声への対応。",
  navUpdates: "更新情報",
  linkReleaseNotes: "更新情報",
  linkReleaseVersion: "リリース v1.2",
  linkAchievements: "\u5B9F\u7E3E",
});

Object.assign(STRINGS.jp, {
  linkReleaseVersion: "\u30EA\u30EA\u30FC\u30B9 v1.5",
  strongMatch: "\u5F37\u4E00\u81F4",
  artistMatch: "\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u4E00\u81F4",
  vocalMatch: "\u30DC\u30FC\u30AB\u30EB\u4E00\u81F4",
  toastStrongMatch: "\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u3068\u30DC\u30FC\u30AB\u30EB\u306F\u4E00\u81F4\u3057\u3066\u3044\u307E\u3059\u304C\u3001\u66F2\u540D\u304C\u9055\u3044\u307E\u3059\u3002",
  toastArtistMatch: "\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u306F\u4E00\u81F4\u3057\u3066\u3044\u307E\u3059\u304C\u3001\u66F2\u540D\u304C\u9055\u3044\u307E\u3059\u3002",
  toastVocalMatch: "\u30DC\u30FC\u30AB\u30EB\u306F\u4E00\u81F4\u3057\u3066\u3044\u307E\u3059\u304C\u3001\u66F2\u540D\u304C\u9055\u3044\u307E\u3059\u3002",
});

Object.assign(STRINGS.jp, {
  modalReleaseArchive: "過去のデイリーパズル、月ごとの達成サマリー、最難関/最易デイリーのメモを追加。",
  modalReleaseRandom: "日付を選ばず過去のデイリーに飛べるランダムアーカイブ問題を追加。",
  modalReleaseStats: "グローバル楽曲統計、正解率、平均挑戦回数、低平均/高平均タブ付きランキングを追加。",
  modalReleaseCommunity: "曲の提案、問題報告フォーム、今後の追加曲向けコミュニティ推薦タグに対応。",
});

STRINGS.es = {
  ...STRINGS.en,
};

Object.assign(STRINGS.es, {
  dailyPuzzle: "puzle diario",
  unlimitedPuzzle: "puzle ilimitado",
  unlimitedPracticePuzzle: (label) => `practica ${label.toLowerCase()}`,
  daily: "Diario",
  unlimited: "Ilimitado",
  archive: "Archivo",
  archivePuzzle: "puzle de archivo",
  difficultyAll: "Todo",
  difficultyFreeShort: "Libre",
  difficultyEasyShort: "Facil",
  difficultyMediumShort: "Medio",
  difficultyHardShort: "Dificil",
  difficultyUnknownShort: "???",
  difficultyAllNote: "Modo ilimitado · cuenta para las clasificaciones globales",
  difficultyPracticeNote: "Modo de practica · no cuenta para las clasificaciones globales",
  difficultyLoading: "Cargando grupos de dificultad...",
  difficultyUnavailable: "Todavia no hay canciones disponibles en esta dificultad.",
  attempt: (n, total) => `Intento ${n} de ${total}`,
  coverCaption: "la portada aparece despues de la respuesta",
  noSchedule: "Todavia no hay puzle programado para hoy.",
  songTitle: "Titulo de la cancion",
  submit: "Enviar",
  skip: "Saltar",
  giveUp: "Rendirse",
  nextSong: "Siguiente cancion",
  copyResult: "Copiar resultado",
  pastGuesses: "Intentos anteriores",
  noGuesses: "Aun no hay intentos",
  correct: "Correcto",
  wrong: "Incorrecto",
  strongMatch: "Coincidencia fuerte",
  artistMatch: "Artista correcto",
  vocalMatch: "Voz correcta",
  skipped: "Saltado",
  answer: "Respuesta",
  gaveUp: "Revelado",
  dailyStats: "Estadisticas diarias",
  unlimitedStats: "Estadisticas ilimitadas",
  played: "Jugadas",
  won: "Ganadas",
  winRate: "Tasa de victoria",
  streak: "Racha",
  bestStreak: "Mejor racha",
  songsInPool: "Canciones en el pool",
  viewFullStats: "Ver estadisticas completas →",
  howToPlay: "Como jugar",
  hallOfMyths: "Salon de mitos",
  links: "Enlaces",
  toastCorrect: (title) => `Correcto! - ${title}`,
  toastAnswer: (title) => `La respuesta era: ${title}`,
  toastCopied: "Resultado copiado al portapapeles",
  toastAchievementUnlocked: "Logro desbloqueado",
  modalAchievementsTitle: "Logros",
  achievementsSummary: (unlocked, total) => `${unlocked} / ${total} desbloqueados`,
  achievementStatusUnlocked: (date) => `Desbloqueado ${date}`,
  achievementStatusLocked: "Bloqueado",
  achievementHiddenDesc: "Este logro sigue oculto.",
  achievementCategoryAll: "Todo",
  achievementCategoryGeneral: "General",
  achievementCategoryDaily: "Diario",
  achievementCategoryUnlimited: "Ilimitado",
  achievementCategoryArchive: "Archivo",
  achievementCategoryKnowledge: "Conocimiento",
  achievementCategoryChallenge: "Reto",
  achievementCategorySecret: "Secreto",
  achievementSearchLabel: "Buscar logros",
  achievementSearchPlaceholder: "Buscar por nombre, descripcion o categoria",
  achievementNoResults: "No hay logros que coincidan con esa busqueda.",
  bookmark: "Marcar",
  bookmarked: "Marcada",
  modalBookmarksTitle: "Marcadores",
  bookmarksIntro: "Las canciones guardadas se quedan en este dispositivo. Las vistas previas usan los clips alojados del juego.",
  bookmarksSearchPlaceholder: "Buscar marcadores...",
  bookmarksEmpty: "Todavia no hay marcadores.",
  bookmarksNoResults: "Ningun marcador coincide con esa busqueda.",
  bookmarksPlay: "Reproducir",
  bookmarksPause: "Pausar",
  bookmarksRemove: "Quitar",
  bookmarksYear: "Ano",
  toastStatsReset: "Las estadisticas se han reiniciada",
  toastAlreadyGuessed: "Ya has usado ese intento.",
  toastStrongMatch: "El artista y la voz coinciden, pero el titulo es distinto.",
  toastArtistMatch: "El artista coincide, pero el titulo es distinto.",
  toastVocalMatch: "La voz coincide, pero el titulo es distinto.",
  toastSelectSong: "Selecciona una cancion de la lista.",
  heardleDaily: "VOCALOID Heardle Diario",
  heardleUnlimited: "VOCALOID Heardle Ilimitado",
  heardleUnlimitedDifficulty: (label) => `VOCALOID Heardle Ilimitado - ${label}`,
  heardleArchive: "VOCALOID Heardle Archivo",
  shareGlobalStats: (rate, avg) => `${rate}% de aciertos${avg !== null ? ` · media ${avg.toFixed(1)}/6` : ""}`,
  shareSelectResult: "Seleccionar resultado",
  placeholder: "escribe tu intento...",
  disclaimer: "Algunas canciones pueden no empezar a sonar durante el primer segundo.",
  marquee: "★ Hay un nuevo puzle diario cada dia ★ Usa el modo ilimitado para practicar cuando quieras ★ Adivina la cancion VOCALOID con el clip inicial en 6 intentos o menos ★ -Comparte tu resultado con tus amigos! ★ Canciones obtenidas de VocaDB ★",
  introCopy: "Adivina la cancion VOCALOID a partir del clip inicial.",
  breadcrumb: "Juegos - Masica - VOCALOID - Heardle",
  footerText: "VOCALOID Heardle: juego diario fan-made de adivinar canciones (c) 2026 | No afiliado con Crypton Future Media ni NicoNico | Datos de canciones de",
  howToPlayStep1: "Pulsa ▶ para escuchar el clip inicial",
  howToPlayStep2: "Escribe el titulo de la cancion y env-alo",
  howToPlayStep3: "-Fallaste o saltaste? Se desbloquea mas clip",
  howToPlayStep4: "Acierta en 6 intentos para ganar",
  howToPlayStep5: "-Comparte tu puntuaci-n al terminar!",
  hofNote: "Canciones VOCALOID mas vistas en NicoNico",
  modalHowToPlayTitle: "Como jugar",
  modalHowToPlayP1: "Escucha la intro y encuentra la cancion VOCALOID correcta.",
  modalHowToPlayP2: "Los saltos o intentos incorrectos desbloquean mas parte del clip.",
  modalHowToPlayP3: "Acierta en el menor n-mero de intentos posible y comparte tu resultado.",
  modalHowToPlayPlay: "Jugar",
  modalAboutTitle: "Acerca de",
  modalAboutP1: "VOCALOID Heardle es un juego diario de adivinar canciones centrado en masica VOCALOID y vocal synth.",
  modalAboutP2: "Cada puzle revela un poco mas de la intro despues de cada fallo o salto. Los detalles de la cancion y los enlaces a VocaDB aparecen despues de revelar la respuesta.",
  modalSupportTitle: "Soporte",
  modalSupportP1: "VOCALOID Heardle es mantenido por sodapines como un peque-o proyecto fan-made de puzles musicales.",
  modalSupportP2: "Para bugs, correcciones de canciones o sugerencias, escribe a",
  modalSupportP3: "El alojamiento y el backend de estadisticas tienen un coste mensual. Si disfrutas del juego, una propina ayuda a mantenerlo funcionando.",
  modalReleaseTitle: "Notas de version",
  modalReleaseVersion: "Lanzamiento oficial v1.0",
  modalReleaseIntro: "Esta version reune las principales actualizaciones preparadas para el sitio publico.",
  modalReleaseArchive: "Archivo diario con puzles anteriores jugables, resumenes mensuales y notas de diarios mas faciles/difaciles.",
  modalReleaseRandom: "Puzle aleatorio del archivo para saltar a diarios antiguos sin elegir fecha.",
  modalReleaseStats: "Estadisticas globales de canciones, tasas de acierto, intentos medios y clasificaciones ampliadas.",
  modalReleasePool: "Creditos del pool de canciones, informacion de VocaDB y avisos mas claros del proyecto.",
  modalReleaseCommunity: "Formularios para sugerir canciones, reportar problemas y etiquetas de sugerencia comunitaria para futuras adiciones.",
  modalReleaseLanguage: "Interfaz en ingl-s, japon-s, coreano y espanol con opciones de visualizaci-n de titulos.",
  modalReleasePolish: "Pulido visual retro inspirado en NicoNico, mejor autocompletado y soporte para audio alojado en Cloudflare.",
  modalSongPoolTitle: "Pool de canciones",
  modalSongPoolSummary: "Las canciones se obtienen de VocaDB. Los puzles diarios se eligen de una base curada de masica VOCALOID.",
  modalSongPoolTotal: "Total de canciones en el pool",
  modalSongPoolSources: "Fuentes usadas",
  modalSongPoolSourcesValue: "VocaDB, YouTube, NicoNico y audio alojado en Cloudflare R2",
  modalSongPoolCredit: "Cr-dito de datos de canciones",
  modalSongPoolDisclaimer: "VOCALOID Heardle es un proyecto fan-made y no esta afiliado con Crypton Future Media, NicoNico, VocaDB ni los artistas representados en el pool.",
  modalSuggestTitle: "Sugerir una cancion",
  modalSuggestIntro: "Envia una cancion para considerarla en futuros puzles. Las sugerencias no estan garantizadas, pero ayudan a mejorar el pool.",
  modalSuggestCheckTitle: "Comprobar el pool actual",
  modalSuggestCheckIntro: "Busca primero para ver si la cancion ya esta disponible.",
  modalSuggestCheckLabel: "Buscar cancion",
  modalSuggestCheckPlaceholder: "escribe un titulo, productor o vocal synth...",
  modalSuggestCheckStart: "Empieza a escribir para comprobar el pool.",
  modalSuggestCheckNone: "No se encontraron coincidencias cercanas en el pool actual.",
  modalSuggestCheckStatus: "Ya esta en el juego",
  modalSuggestLabelTitle: "Titulo de la cancion",
  modalSuggestLabelProducer: "Productor",
  modalSuggestLabelVocal: "Vocal synth",
  modalSuggestLabelVocadb: "Enlace de VocaDB",
  modalSuggestLabelSource: "Enlace de YouTube/NicoNico",
  modalSuggestLabelReason: "Por que deberia incluirse?",
  modalSuggestSubmit: "Enviar sugerencia por email",
  modalReportTitle: "Reportar problema",
  modalReportIntro: "Usa este formulario para reportar un problema con el puzle actual.",
  modalReportLabelReason: "Motivo",
  modalReportLabelDetails: "Detalles",
  modalReportDetailPlaceholder: "Que ocurrio?",
  modalReportSubmit: "Enviar reporte por email",
  modalReportOptMetadata: "Metadatos incorrectos",
  modalReportOptAudio: "El audio no se reproduce",
  modalReportOptSource: "Fuente incorrecta",
  modalReportOptDuplicate: "Cancion duplicada",
  modalReportOptStartpoint: "Mal punto de inicio",
  modalReportOptAnswer: "No acepta la respuesta",
  modalReportOptOther: "Otro",
  reportIssue: "Reportar problema",
  modalStatsTitle: "Estadisticas",
  modalStatsDailyBtn: "Diario",
  modalStatsUnlimitedBtn: "Ilimitado",
  statsPlayed: "Jugadas",
  statsWon: "Ganadas",
  statsWinRate: "Tasa de victoria",
  statsCurrentStreak: "Racha actual",
  statsMaxStreak: "Racha maxima",
  statsAvgAttempts: "Intentos medios al ganar",
  statsFirstTry: "Aciertos al primer intento",
  statsRarestSolve: "Acierto mas raro",
  statsRarestFirstTry: "1/6 mas raro",
  statsBestPublishYear: "Mejor ano de publicaci-n",
  statsMostPlayedYear: "Ano mas jugado",
  statsArchiveGroup: "Modo Archivo",
  statsArchiveProgress: "Progreso",
  statsAchievementsGroup: "Logros",
  statsAchievementsProgress: "Progreso",
  statsNoneYet: "Todavia nada",
  statsYearLine: (year, won, played, rate) => `${year} - ${rate}% (${won}/${played})`,
  statsYearPlayedLine: (year, played) => `${year} - ${played} jugadas`,
  statsRarestLine: (title, rate) => `${title} · ${rate}% de acierto global`,
  statsArchiveProgressLine: (solved, total, rate) => `${solved}/${total} resueltos · ${rate}%`,
  statsAchievementsProgressLine: (unlocked, total, rate) => `${unlocked}/${total} desbloqueados · ${rate}%`,
  statsCopyProfile: "Copiar perfil",
  profileCopied: "Perfil copiado al portapapeles",
  profileDaily: "Diario",
  profileUnlimited: "Ilimitado",
  profileArchive: "Archivo",
  profileAchievements: "Logros",
  profileAvgSolve: "Media de acierto",
  profileBestStreak: "Mejor racha",
  profileRarestSolve: "Acierto mas raro",
  profileRarestFirstTry: "1/6 mas raro",
  profileFirstTry: "Primeros intentos",
  profilePlayed: "jugadas",
  profileWinRate: "tasa de victoria",
  profileSolved: "resueltos",
  profileOpened: "abiertos",
  profileNoData: "todav-a nada",
  sbAvgAttempts: "Intentos medios",
  nextDailyCountdown: (h, m, s) => `Siguiente puzle en <strong>${h}h ${m}m ${s}s</strong>`,
  nextDailyReady: "-Hay un nuevo puzle diario disponible!",
  archiveSolved: "Resuelto",
  archiveFailed: "Abierto",
  archiveUnplayed: "Disponible",
  archiveSummaryOpened: "Jugados",
  archiveSummarySolved: "Resueltos",
  archiveSummaryRevealed: "Revelados",
  archiveSummaryComplete: "Completo",
  archiveMonthBadge: (solved, total, rate) => `${solved}/${total} resueltos · ${rate}%`,
  archiveHardest: "Diario mas dif-cil",
  archiveEasiest: "Diario mas f-cil",
  archiveInsightsLoading: "Cargando dificultad mensual...",
  archiveInsightsEmpty: "La dificultad del mes aparece despues de abrir puzles del archivo.",
  archiveRandom: "Puzle aleatorio del archivo",
  archiveRandomEmpty: "Todavia no hay puzles de archivo disponibles.",
  tagCommunitySuggested: "Sugerido por la comunidad",
  tagNewSong: "Nueva",
  tagNnd100k: "Hall of Fame",
  tagNnd1m: "Hall of Legends",
  tagNnd10m: "Hall of Myths",
  tagYt1m: "YouTube 1 M",
  tagYt10m: "YouTube 10 M",
  tagYt100m: "YouTube 100 M",
  tagProjectSekai: "Project SEKAI",
  tagSpecialTest: "Etiqueta especial de prueba",
  kofiNudgeText: "-Te gusta el proyecto? Las propinas ayudan a mantenerlo.",
  kofiNudgeLink: "Apoyar en Ko-fi →",
  settingsTitle: "Ajustes",
  settingDarkMode: "Modo oscuro",
  settingDarkModeDesc: "Cambiar entre tema claro y oscuro",
  settingBeigeBackground: "Fondo beige",
  settingBeigeBackgroundDesc: "Usar un fondo de pagina beige mas calido",
  settingBulletComments: "Comentarios danmaku",
  settingBulletCommentsDesc: "Texto flotante sobre la portada",
  settingCommentSpeed: "Velocidad de comentarios",
  settingCommentSpeedDesc: "Qu- tan rapido se mueven los comentarios",
  settingSpeedSlow: "Lento",
  settingSpeedNormal: "Normal",
  settingSpeedFast: "Rapido",
  settingCompactMode: "Modo compacto",
  settingCompactModeDesc: "Oculta marquesina, etiquetas y barra lateral a la vez",
  settingMarqueeBar: "Barra de avisos",
  settingMarqueeBarDesc: "Anuncio desplazable en la parte superior",
  settingSidebar: "Barra lateral",
  settingSidebarDesc: "Panel de estadisticas e informacion a la derecha",
  settingTags: "Etiquetas",
  settingTagsDesc: "Etiquetas de categoria y filtros activos",
  settingAutocomplete: "Autocompletar",
  settingAutocompleteDesc: "Mostrar sugerencias de canciones al escribir",
  settingDensity: "Densidad de comentarios",
  settingDensityDesc: "Cuantos comentarios aparecen en pantalla",
  settingDensityFew: "Pocos",
  settingDensityMedium: "Medio",
  settingDensityMany: "Muchos",
  settingVolume: "Volumen",
  settingVolumeDesc: "Volumen del clip",
  settingTitleDisplay: "Visualizacion de titulos",
  settingTitleDisplayDesc: "Como aparecen los titulos en sugerencias e historial",
  settingClearInput: "Limpiar al fallar",
  settingClearInputDesc: "Limpia el campo despues de una respuesta incorrecta",
  settingBackupStats: "Copia de estadisticas",
  settingBackupStatsDesc: "Exportar o importar datos locales",
  settingExportStats: "Exportar",
  settingImportStats: "Importar",
  settingImportPlaceholder: "Pega aque el JSON exportado",
  toastStatsExported: "Copia de estadisticas copiada al portapapeles",
  toastStatsImported: "Copia de estadisticas importada",
  toastStatsImportFailed: "No se pudo importar. Revisa el texto de la copia.",
  settingReportIssue: "Reportar problema",
  settingReportIssueDesc: "Enviar problemas de metadatos, audio, duplicados o respuestas",
  settingReportIssueBtn: "Reportar",
  settingResetStats: "Reiniciar estadisticas",
  settingResetStatsDesc: "Borrar permanentemente todas tus estadisticas",
  settingResetBtn: "Reiniciar",
  settingResetConfirm: "-Seguro? Esto no se puede deshacer.",
  settingResetYes: "Si, reiniciar",
  settingResetNo: "Cancelar",
  infoLabel: "[INFO]",
  metaViews: "▶ Reproducciones:",
  metaCategory: "Categoria:",
  metaSource: "Fuente:",
  navAbout: "Acerca de",
  navSupport: "Soporte",
  navSettings: "Ajustes",
  navUpdates: "Actualizaciones",
  linkReleaseNotes: "Notas de version",
  linkReleaseVersion: "Version v1.5",
  linkAchievements: "Logros",
  linkSongPool: "Pool de canciones",
  linkSuggestSong: "Sugerir una cancion",
  linkVocaDB: "VocaDB ↗",
  linkNicoNico: "NicoNico ↗",
  linkAbout: "Acerca de este sitio",
  linkContact: "Contacto / Soporte",
  rankingsHeader: "Clasificaciones globales",
  rankingsTabPlays: "Popular",
  rankingsTabHardest: "Mas dif-cil",
  rankingsTabEasiest: "Mas f-cil",
  rankingsTabAvgLow: "Media mas baja",
  rankingsTabAvgHigh: "Media mas alta",
  rankingsSeeAll: "Ver todo →",
  rankingsNote: "Basado solo en partidas del modo ilimitado. Se excluyen canciones con menos de 5 jugadas.",
  rankingsModalTitle: "Clasificaciones globales",
  rankingsPlays: (n) => `${n} jugadas`,
  rankingsWin: (n) => `${n}%`,
  rankingsAvgAttempts: (n) => `${n} intentos de media`,
  rankingsNoData: "Aun no hay datos.",
  rankingsNoDataModal: "Aun no hay datos, -juega algunas canciones en ilimitado primero!",
  rankingsLoading: "Cargando...",
  archiveTitle: "Archivo diario",
  archiveNote: "Juega puzles diarios anteriores. Los diarios completados aparecen aque autom-ticamente.",
  archiveEmpty: "Sin puzle",
  globalStats: (rate, avg, plays) => `Tasa global de acierto: <span class="gs-rate${rate < 30 ? ' gs-hard' : ''}">${rate}%</span> · Intentos medios al ganar: <span class="gs-rate">${avg}/6</span> · ${plays.toLocaleString()} jugadas`,
  globalStatsNoWins: (rate, plays) => `Tasa global de acierto: <span class="gs-rate gs-hard">${rate}%</span> · ${plays.toLocaleString()} jugadas`,
  globalStatsNone: "",
  globalComparisonBeat: "Superaste la media global.",
  globalComparisonMatched: "Igualaste la media global.",
  globalComparisonClose: "Cerca de la media global.",
  globalComparisonLate: "Mas tarde que la media.",
  globalComparisonRevealed: "Respuesta revelada.",
  globalComparisonLine: (attempts, avg, verdict) => `Tu resultado: <span>${attempts}/6</span> · Media global: <span>${avg}/6</span><br>${verdict}`,
  globalComparisonRevealLine: (avg, verdict) => `Media global: <span>${avg}/6</span><br>${verdict}`,
  difficultyLabel: (label) => `Dificultad: ${label}`,
  difficultyFree: "Libre",
  difficultyEasy: "Facil",
  difficultyMedium: "Medio",
  difficultyHard: "Dificil",
  difficultyUnknown: "-que cancion es esta???",
});

let currentReleaseVersion = "v1.5";


STRINGS.ko = {
  ...STRINGS.en,
};

Object.assign(STRINGS.ko, {
  dailyPuzzle: "데일리 퍼즐",
  unlimitedPuzzle: "무제한 퍼즐",
  unlimitedPracticePuzzle: (label) => `${label} 연습`,
  daily: "데일리",
  unlimited: "무제한",
  archive: "아카이브",
  archivePuzzle: "아카이브 퍼즐",
  difficultyAll: "전체",
  difficultyFreeShort: "프리",
  difficultyEasyShort: "쉬움",
  difficultyMediumShort: "보통",
  difficultyHardShort: "어려움",
  difficultyUnknownShort: "???",
  difficultyAllNote: "무제한 모드 · 글로벌 랭킹에 반영됨",
  difficultyPracticeNote: "연습 모드 · 글로벌 랭킹에 반영되지 않음",
  difficultyLoading: "난이도 풀을 불러오는 중...",
  difficultyUnavailable: "아직 이 난이도에 해당하는 곡이 없습니다.",
  attempt: (n, total) => `도전 ${n} / ${total}`,
  coverCaption: "정답을 맞히면 커버 아트가 표시됩니다",
  noSchedule: "오늘 예정된 퍼즐이 아직 없습니다.",
  songTitle: "곡 제목",
  submit: "제출",
  skip: "스킵",
  giveUp: "포기",
  nextSong: "다음 곡",
  copyResult: "결과 복사",
  pastGuesses: "이전 추측",
  noGuesses: "아직 추측이 없습니다",
  correct: "정답",
  wrong: "오답",
  strongMatch: "강한 일치",
  artistMatch: "아티스트 일치",
  vocalMatch: "보컬 일치",
  skipped: "스킵",
  answer: "정답",
  gaveUp: "포기",
  dailyStats: "데일리 통계",
  unlimitedStats: "무제한 통계",
  played: "플레이",
  won: "승리",
  winRate: "승률",
  streak: "연속 기록",
  bestStreak: "최고 연속 기록",
  songsInPool: "곡 풀",
  viewFullStats: "전체 통계 보기 →",
  howToPlay: "플레이 방법",
  hallOfMyths: "명곡 전당",
  links: "링크",
  toastCorrect: (title) => `정답! - ${title}`,
  toastAnswer: (title) => `정답은 ${title}였습니다`,
  toastCopied: "결과를 클립보드에 복사했습니다",
  toastAchievementUnlocked: "업적 달성",
  modalAchievementsTitle: "업적",
  achievementsSummary: (unlocked, total) => `${unlocked} / ${total} 달성`,
  achievementStatusUnlocked: (date) => `${date} 달성`,
  achievementStatusLocked: "잠김",
  achievementHiddenTitle: "???",
  achievementHiddenDesc: "아직 숨겨진 업적입니다.",
  achievementCategoryAll: "전체",
  achievementCategoryGeneral: "일반",
  achievementCategoryDaily: "데일리",
  achievementCategoryUnlimited: "무제한",
  achievementCategoryArchive: "아카이브",
  achievementCategoryKnowledge: "지식",
  achievementCategoryChallenge: "도전",
  achievementCategorySecret: "비밀",
  achievementSearchLabel: "업적 검색",
  achievementSearchPlaceholder: "이름, 설명, 카테고리로 검색",
  achievementNoResults: "검색과 일치하는 업적이 없습니다.",
  bookmark: "북마크",
  bookmarked: "북마크됨",
  modalBookmarksTitle: "북마크",
  bookmarksIntro: "저장한 곡은 이 기기에 남습니다. 오디오 미리듣기는 호스팅된 퍼즐 클립을 사용합니다.",
  bookmarksSearchPlaceholder: "북마크 검색...",
  bookmarksEmpty: "아직 북마크가 없습니다.",
  bookmarksNoResults: "검색과 일치하는 북마크가 없습니다.",
  bookmarksPlay: "재생",
  bookmarksPause: "일시정지",
  bookmarksRemove: "삭제",
  bookmarksYear: "연도",
  toastStatsReset: "통계를 초기화했습니다",
  toastAlreadyGuessed: "이미 추측했습니다.",
  toastStrongMatch: "아티스트와 보컬은 맞지만 곡 제목이 다릅니다.",
  toastArtistMatch: "아티스트는 맞지만 곡 제목이 다릅니다.",
  toastVocalMatch: "보컬은 맞지만 곡 제목이 다릅니다.",
  toastSelectSong: "목록에서 곡을 선택하세요.",
  heardleDaily: "VOCALOID Heardle 데일리",
  heardleUnlimited: "VOCALOID Heardle 무제한",
  heardleUnlimitedDifficulty: (label) => `VOCALOID Heardle 무제한 - ${label}`,
  heardleArchive: "VOCALOID Heardle 아카이브",
  shareGlobalStats: (rate, avg) => `${rate}% 정답률${avg !== null ? ` · 평균 ${avg.toFixed(1)}/6` : ""}`,
  shareSelectResult: "결과 선택",
  placeholder: "추측을 입력하세요...",
  disclaimer: "일부 곡은 첫 1초 안에 소리가 바로 나오지 않을 수 있습니다.",
  marquee: "★ 매일 새로운 데일리 퍼즐이 열립니다 ★ 무제한 모드로 언제든 연습하세요 ★ 6번 안에 오프닝 클립의 VOCALOID 곡을 맞혀보세요 ★ 친구에게 결과를 공유하세요! ★ 곡 정보는 VocaDB에서 가져옵니다 ★",
  introCopy: "오프닝 클립을 듣고 VOCALOID 곡을 맞혀보세요.",
  breadcrumb: "게임 > 음악 > VOCALOID > Heardle",
  footerText: "VOCALOID Heardle: 팬메이드 데일리 추측 게임 (c) 2026 | Crypton Future Media 또는 NicoNico와 관련이 없습니다 | 곡 데이터:",
  howToPlayStep1: "▶를 눌러 오프닝 클립을 듣기",
  howToPlayStep2: "곡 제목을 입력하고 제출하기",
  howToPlayStep3: "오답 또는 스킵하면 더 긴 클립이 열립니다",
  howToPlayStep4: "6번 안에 맞히면 승리",
  howToPlayStep5: "끝나면 결과를 공유하세요!",
  hofNote: "NicoNico에서 많이 재생된 VOCALOID 곡",
  modalHowToPlayTitle: "플레이 방법",
  modalHowToPlayP1: "인트로를 듣고 올바른 VOCALOID 곡을 찾아보세요.",
  modalHowToPlayP2: "스킵하거나 틀리면 클립이 조금 더 열립니다.",
  modalHowToPlayP3: "가능한 적은 시도로 맞히고 점수를 공유하세요.",
  modalHowToPlayPlay: "플레이",
  modalAboutTitle: "소개",
  modalAboutP1: "VOCALOID Heardle은 VOCALOID와 보컬 신스 음악을 중심으로 만든 데일리 곡 추측 게임입니다.",
  modalAboutP2: "오답이나 스킵을 할 때마다 인트로가 조금씩 더 공개됩니다. 정답 후에는 곡 정보와 VocaDB 링크가 표시됩니다.",
  modalSupportTitle: "지원",
  modalSupportP1: "VOCALOID Heardle은 sodapines가 운영하는 작은 팬메이드 음악 퍼즐 프로젝트입니다.",
  modalSupportP2: "버그, 곡 정보 수정, 제안은 이메일로 보내주세요:",
  modalSupportP3: "호스팅과 통계 백엔드는 매달 비용이 듭니다. 게임을 즐기셨다면 작은 후원도 운영에 도움이 됩니다.",
  modalReleaseTitle: "업데이트 내역",
  modalReleaseVersion: "공식 릴리스 v1.0",
  modalReleaseIntro: "공개 사이트를 위해 준비한 주요 업데이트를 모았습니다.",
  modalReleaseArchive: "지난 데일리 퍼즐을 플레이할 수 있는 아카이브, 월별 달성 요약, 가장 어려운/쉬운 데일리 메모를 추가했습니다.",
  modalReleaseRandom: "날짜를 고르지 않고 예전 데일리로 바로 들어가는 랜덤 아카이브 퍼즐을 추가했습니다.",
  modalReleaseStats: "글로벌 곡 통계, 정답률, 평균 시도 수, 확장 랭킹을 추가했습니다.",
  modalReleasePool: "곡 풀 크레딧, VocaDB 출처 정보, 프로젝트 면책 문구를 정리했습니다.",
  modalReleaseCommunity: "곡 제안, 문제 신고 폼, 향후 추가곡용 커뮤니티 추천 태그를 추가했습니다.",
  modalReleaseLanguage: "영어/일본어/한국어 인터페이스와 곡 제목 표시 옵션을 지원합니다.",
  modalReleasePolish: "레트로 NicoNico풍 레이아웃, 자동완성 개선, Cloudflare 호스팅 오디오를 지원합니다.",
  modalSongPoolTitle: "곡 풀",
  modalSongPoolSummary: "곡 정보는 VocaDB에서 가져옵니다. 데일리 퍼즐은 선별된 VOCALOID/음악 데이터베이스에서 선택됩니다.",
  modalSongPoolTotal: "풀의 총 곡 수",
  modalSongPoolSources: "사용한 출처",
  modalSongPoolSourcesValue: "VocaDB, YouTube, NicoNico, Cloudflare R2 오디오 호스팅",
  modalSongPoolCredit: "곡 데이터 출처",
  modalSongPoolDisclaimer: "VOCALOID Heardle은 팬메이드 프로젝트이며 Crypton Future Media, NicoNico, VocaDB 또는 수록 아티스트와 관련이 없습니다.",
  modalSuggestTitle: "곡 제안",
  modalSuggestIntro: "향후 퍼즐에 들어갈 곡을 제안하세요. 제안이 반드시 반영되지는 않지만 곡 풀 개선에 도움이 됩니다.",
  modalSuggestCheckTitle: "현재 풀 확인",
  modalSuggestCheckIntro: "먼저 검색해서 이미 플레이 가능한 곡인지 확인하세요.",
  modalSuggestCheckLabel: "곡 검색",
  modalSuggestCheckPlaceholder: "곡 제목, 프로듀서, 보컬 신스를 입력...",
  modalSuggestCheckStart: "곡 풀을 확인하려면 입력을 시작하세요.",
  modalSuggestCheckNone: "현재 풀에서 가까운 결과를 찾지 못했습니다.",
  modalSuggestCheckStatus: "이미 게임에 있음",
  modalSuggestLabelTitle: "곡 제목",
  modalSuggestLabelProducer: "프로듀서",
  modalSuggestLabelVocal: "보컬 신스",
  modalSuggestLabelVocadb: "VocaDB 링크",
  modalSuggestLabelSource: "YouTube/NicoNico 링크",
  modalSuggestLabelReason: "왜 포함되어야 하나요?",
  modalSuggestSubmit: "이메일로 제안",
  modalReportTitle: "문제 신고",
  modalReportIntro: "현재 퍼즐의 문제를 신고할 수 있습니다.",
  modalReportLabelReason: "사유",
  modalReportLabelDetails: "상세 내용",
  modalReportDetailPlaceholder: "무슨 일이 있었나요?",
  modalReportSubmit: "이메일로 신고",
  modalReportOptMetadata: "곡 정보가 잘못됨",
  modalReportOptAudio: "오디오가 재생되지 않음",
  modalReportOptSource: "출처가 잘못됨",
  modalReportOptDuplicate: "중복 곡",
  modalReportOptStartpoint: "시작 지점이 좋지 않음",
  modalReportOptAnswer: "정답이 인정되지 않음",
  modalReportOptOther: "기타",
  reportIssue: "문제 신고",
  modalStatsTitle: "통계",
  modalStatsDailyBtn: "데일리",
  modalStatsUnlimitedBtn: "무제한",
  statsPlayed: "플레이",
  statsWon: "승리",
  statsWinRate: "승률",
  statsCurrentStreak: "현재 연속 기록",
  statsMaxStreak: "최고 연속 기록",
  statsAvgAttempts: "평균 정답 시도",
  statsFirstTry: "1회 정답",
  statsRarestSolve: "가장 희귀한 정답",
  statsRarestFirstTry: "가장 희귀한 1/6",
  statsBestPublishYear: "가장 잘 맞힌 공개 연도",
  statsMostPlayedYear: "가장 많이 플레이한 연도",
  statsArchiveGroup: "아카이브 모드",
  statsArchiveProgress: "진행도",
  statsAchievementsGroup: "업적",
  statsAchievementsProgress: "진행도",
  statsNoneYet: "아직 없음",
  statsYearLine: (year, won, played, rate) => `${year} - ${rate}% (${won}/${played})`,
  statsYearPlayedLine: (year, played) => `${year} - ${played}회 플레이`,
  statsRarestLine: (title, rate) => `${title} · 글로벌 정답률 ${rate}%`,
  statsArchiveProgressLine: (solved, total, rate) => `${solved}/${total} 해결 · ${rate}%`,
  statsAchievementsProgressLine: (unlocked, total, rate) => `${unlocked}/${total} 달성 · ${rate}%`,
  statsCopyProfile: "프로필 복사",
  profileCopied: "프로필을 클립보드에 복사했습니다",
  profileDaily: "데일리",
  profileUnlimited: "무제한",
  profileArchive: "아카이브",
  profileAchievements: "업적",
  profileAvgSolve: "평균 정답",
  profileBestStreak: "최고 연속 기록",
  profileRarestSolve: "가장 희귀한 정답",
  profileRarestFirstTry: "가장 희귀한 1/6",
  profileFirstTry: "1회 정답",
  profilePlayed: "플레이",
  profileWinRate: "승률",
  profileSolved: "해결",
  profileOpened: "열림",
  profileNoData: "아직 없음",
  sbAvgAttempts: "평균 시도",
  nextDailyCountdown: (h, m, s) => `다음 퍼즐까지 <strong>${h}시간 ${m}분 ${s}초</strong>`,
  nextDailyReady: "새 데일리 퍼즐이 열렸습니다!",
  archiveSolved: "해결",
  archiveFailed: "공개",
  archiveUnplayed: "가능",
  archiveSummaryOpened: "플레이",
  archiveSummarySolved: "해결",
  archiveSummaryRevealed: "공개",
  archiveSummaryComplete: "완료",
  archiveMonthBadge: (solved, total, rate) => `${solved}/${total} 해결 · ${rate}%`,
  archiveHardest: "가장 어려운 데일리",
  archiveEasiest: "가장 쉬운 데일리",
  archiveInsightsLoading: "월별 난이도 불러오는 중...",
  archiveInsightsEmpty: "아카이브 퍼즐을 열면 월별 난이도가 표시됩니다.",
  archiveRandom: "랜덤 아카이브 퍼즐",
  archiveRandomEmpty: "아직 이용 가능한 아카이브 퍼즐이 없습니다.",
  archiveEmpty: "퍼즐 없음",
  globalStats: (rate, avg, plays) => `글로벌 정답률: <span class="gs-rate${rate < 30 ? ' gs-hard' : ''}">${rate}%</span> · 평균 정답 시도: <span class="gs-rate">${avg}/6</span> · ${plays.toLocaleString()}회`,
  globalStatsNoWins: (rate, plays) => `글로벌 정답률: <span class="gs-rate gs-hard">${rate}%</span> · ${plays.toLocaleString()}회`,
  globalStatsNone: "",
  globalComparisonBeat: "글로벌 평균보다 빠르게 맞혔습니다.",
  globalComparisonMatched: "글로벌 평균과 같은 결과입니다.",
  globalComparisonClose: "글로벌 평균에 가까운 결과입니다.",
  globalComparisonLate: "글로벌 평균보다 늦었습니다.",
  globalComparisonRevealed: "정답을 공개했습니다.",
  globalComparisonLine: (attempts, avg, verdict) => `내 결과: <span>${attempts}/6</span> · 글로벌 평균: <span>${avg}/6</span><br>${verdict}`,
  globalComparisonRevealLine: (avg, verdict) => `글로벌 평균: <span>${avg}/6</span><br>${verdict}`,
  difficultyLabel: (label) => `난이도: ${label}`,
  difficultyFree: "프리",
  difficultyEasy: "쉬움",
  difficultyMedium: "보통",
  difficultyHard: "어려움",
  difficultyUnknown: "이게 무슨 곡이지???",
  tagCommunitySuggested: "커뮤니티 추천",
  tagNewSong: "신곡",
  tagNnd100k: "Hall of Fame",
  tagNnd1m: "Hall of Legends",
  tagNnd10m: "Hall of Myths",
    tagYt1m: "YouTube 100\uB9CC",
    tagYt10m: "YouTube 1000\uB9CC",
  tagYt100m: "YouTube 1\uC5B5",
  tagProjectSekai: "Project SEKAI",
  tagSpecialTest: "특별 테스트 라벨",
  kofiNudgeText: "프로젝트가 마음에 드셨나요? 후원은 운영에 도움이 됩니다.",
  kofiNudgeLink: "Ko-fi에서 후원 →",
  settingsTitle: "설정",
  settingDarkMode: "다크 모드",
  settingDarkModeDesc: "라이트/다크 테마 전환",
  settingBeigeBackground: "\uBCA0\uC774\uC9C0 \uBC30\uACBD",
  settingBeigeBackgroundDesc: "\uB354 \uB530\uB73B\uD55C \uBCA0\uC774\uC9C0\uC0C9 \uD398\uC774\uC9C0 \uBC30\uACBD \uC0AC\uC6A9",
  settingBulletComments: "탄막 댓글",
  settingBulletCommentsDesc: "커버 아트 위에 흐르는 탄막 오버레이",
  settingCommentSpeed: "댓글 속도",
  settingCommentSpeedDesc: "탄막 댓글이 흐르는 속도",
  settingSpeedSlow: "느림",
  settingSpeedNormal: "보통",
  settingSpeedFast: "빠름",
  settingCompactMode: "컴팩트 모드",
  settingCompactModeDesc: "마키, 태그, 사이드바를 한 번에 숨김",
  settingMarqueeBar: "마키 바",
  settingMarqueeBarDesc: "상단 스크롤 공지",
  settingSidebar: "사이드바",
  settingSidebarDesc: "오른쪽 통계와 정보 패널",
  settingTags: "\ud0dc\uadf8",
  settingTagsDesc: "\uce74\ud14c\uace0\ub9ac\uc640 \ud65c\uc131 \ud544\ud130 \ud0dc\uadf8",
  settingAutocomplete: "자동완성",
  settingAutocompleteDesc: "입력 중 곡 제안 표시",
  settingDensity: "탄막 밀도",
  settingDensityDesc: "화면에 표시되는 댓글 수",
  settingDensityFew: "적게",
  settingDensityMedium: "보통",
  settingDensityMany: "많이",
  settingVolume: "음량",
  settingVolumeDesc: "클립 재생 음량",
  settingTitleDisplay: "곡 제목 표시",
  settingTitleDisplayDesc: "제안과 기록에 표시되는 곡 제목 언어",
  settingClearInput: "오답 후 입력 지우기",
  settingClearInputDesc: "오답일 때 추측 입력칸을 비움",
  settingBackupStats: "통계 백업",
  settingBackupStatsDesc: "로컬 통계 데이터를 내보내거나 가져오기",
  settingExportStats: "내보내기",
  settingImportStats: "가져오기",
  settingImportPlaceholder: "내보낸 통계 JSON을 여기에 붙여넣기",
  toastStatsExported: "통계 백업을 클립보드에 복사했습니다",
  toastStatsImported: "통계 백업을 가져왔습니다",
  toastStatsImportFailed: "통계 가져오기에 실패했습니다. 백업 텍스트를 확인하세요.",
  settingReportIssue: "문제 신고",
  settingReportIssueDesc: "메타데이터, 오디오, 중복, 정답 문제 보내기",
  settingReportIssueBtn: "신고",
  settingResetStats: "통계 초기화",
  settingResetStatsDesc: "모든 통계를 영구적으로 삭제",
  settingResetBtn: "초기화",
  settingResetConfirm: "정말 초기화할까요? 되돌릴 수 없습니다.",
  settingResetYes: "네, 초기화",
  settingResetNo: "취소",
  infoLabel: "[정보]",
  metaViews: "▶ 재생수:",
  metaCategory: "카테고리:",
  metaSource: "출처:",
  navAbout: "소개",
  navSupport: "지원",
  navSettings: "설정",
  navUpdates: "업데이트",
  linkReleaseNotes: "업데이트 내역",
  linkReleaseVersion: "릴리스 v1.5",
  linkAchievements: "업적",
  linkSongPool: "곡 풀",
  linkSuggestSong: "곡 제안",
  hofSong1: "천본앵",
  hofSong2: "미쿠미쿠하게 해줄게",
  hofSong3: "멜트",
  hofSong4: "월즈 엔드 댄스홀",
  hofSong5: "마트료시카",
  linkVocaDB: "VocaDB ↗",
  linkNicoNico: "NicoNico ↗",
  linkAbout: "사이트 소개",
  linkContact: "문의 / 지원",
  rankingsHeader: "글로벌 랭킹",
  rankingsTabPlays: "인기",
  rankingsTabHardest: "어려움",
  rankingsTabEasiest: "쉬움",
  rankingsTabAvgLow: "낮은 평균",
  rankingsTabAvgHigh: "높은 평균",
  rankingsSeeAll: "전체 보기 →",
  rankingsNote: "무제한 모드 플레이만 기준입니다. 5회 미만 플레이된 곡은 제외됩니다.",
  rankingsModalTitle: "글로벌 랭킹",
  rankingsPlays: (n) => `${n}회 플레이`,
  rankingsWin: (n) => `${n}%`,
  rankingsAvgAttempts: (n) => `${n} 평균 시도`,
  rankingsLoading: "불러오는 중...",
  rankingsNoData: "아직 데이터 없음",
  rankingsNoDataModal: "아직 표시할 데이터가 없습니다.",
  archiveTitle: "데일리 아카이브",
  archiveNote: "지난 데일리 퍼즐을 플레이하세요. 완료한 데일리는 자동으로 여기에 나타납니다.",
});

const SYSTEM_LABEL_STRINGS = {
  videoBracket: "[VIDEO]",
  metaViewsBracket: "[views]",
  metaCategoryBracket: "[category]",
  metaMylistBracket: "[mylist]",
  metaSourceBracket: "[source]",
  logBracket: "[LOG]",
  modalMylistPrefix: "[MYLIST]",
  modalUpdatePrefix: "[UPDATE]",
  modalSourcePrefix: "[SOURCE]",
};

Object.assign(STRINGS.jp, SYSTEM_LABEL_STRINGS, {
  videoOpeningClip: "Opening Clip",
  filterSongsMatch: (count) => `${count.toLocaleString()}\u66f2\u304c\u4e00\u81f4`,
  filterNoYears: "\u5e74\u306f\u672a\u9078\u629e",
  filterTagNewSongs: "\u65b0\u66f2",
  filterModalTitle: "\u7121\u5236\u9650\u30d5\u30a3\u30eb\u30bf\u30fc",
  filterModalNote: "\u30ed\u30fc\u30ab\u30eb\u306eVocaDB\u30e1\u30bf\u30c7\u30fc\u30bf\u3067\u6b21\u306e\u7121\u5236\u9650\u66f2\u30d7\u30fc\u30eb\u3092\u7d5e\u308a\u8fbc\u307f\u307e\u3059\u3002",
  filterWarning: "\u672a\u5b8c\u4e86\u306e\u7121\u5236\u9650\u30e9\u30a6\u30f3\u30c9\u4e2d\u306b\u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u5909\u66f4\u3059\u308b\u3068\u3001\u305d\u306e\u30e9\u30a6\u30f3\u30c9\u306f\u8ca0\u3051\u3068\u3057\u3066\u8a18\u9332\u3055\u308c\u307e\u3059\u3002\u5b8c\u4e86\u6e08\u307f\u306e\u30e9\u30a6\u30f3\u30c9\u306f\u5b89\u5168\u3067\u3059\u3002",
  filterProducerLabel: "\u30d7\u30ed\u30c7\u30e5\u30fc\u30b5\u30fc / \u30a2\u30fc\u30c6\u30a3\u30b9\u30c8",
  filterVoicebankLabel: "\u97f3\u6e90 / \u30dc\u30fc\u30ab\u30eb\u30b7\u30f3\u30bb",
  filterProducerPlaceholder: "\u30d7\u30ed\u30c7\u30e5\u30fc\u30b5\u30fc\u3092\u5165\u529b...",
  filterVoicebankPlaceholder: "\u97f3\u6e90\u3092\u5165\u529b...",
  filterProgramLabel: "\u4f7f\u7528\u30bd\u30d5\u30c8",
  filterYearLabel: "\u516c\u958b\u5e74",
  filterCommunityLabel: "\u30b3\u30df\u30e5\u30cb\u30c6\u30a3\u63d0\u6848",
  filterNewSongsLabel: "\u65b0\u66f2",
  filterInclusiveLabel: "\u5305\u62ec",
  filterOptionsLabel: "\u30aa\u30d7\u30b7\u30e7\u30f3",
  filterYearStatusLabel: "\u9078\u629e\u4e2d",
  filterMatchLabel: "\u66f2\u6570",
  filterClear: "\u30af\u30ea\u30a2",
  filterApply: "\u9069\u7528",
  statsSectionDistribution: "\u56de\u7b54\u5206\u5e03",
  statsSectionOverview: "\u6982\u8981",
  statsSectionDetail: "\u8a73\u7d30",
  sidebarDifficulty: "\u96e3\u6613\u5ea6",
  sidebarArchive: "\u30a2\u30fc\u30ab\u30a4\u30d6",
  sidebarTotal: "\u5408\u8a08",
  sidebarMilestones: "\u30de\u30a4\u30eb\u30b9\u30c8\u30fc\u30f3",
  milestoneHallOfFame: "\u6bbf\u5802\u5165\u308a",
  milestoneHallOfLegends: "\u4f1d\u8aac\u5165\u308a",
  milestoneHallOfMyths: "\u795e\u8a71\u5165\u308a",
  milestoneFooter: "\u6b63\u89e3\u5f8c\u306b\u8868\u793a\u3055\u308c\u308b\u30cb\u30b3\u30cb\u30b3\u518d\u751f\u6570\u30c6\u30a3\u30a2",
  sidebarVisitors: "\u8a2a\u554f\u8005",
  visitorTotal: "\u7dcf\u8a2a\u554f\u8005\u6570",
  visitorSince: "\u958b\u59cb",
  sidebarNews: "\u30cb\u30e5\u30fc\u30b9",
  newsV15: "\u7121\u5236\u9650\u30d5\u30a3\u30eb\u30bf\u30fc\uff06\u30d7\u30fc\u30eb\u30de\u30a4\u30eb\u30b9\u30c8\u30fc\u30f3",
  newsV14: "\u7df4\u7fd2\u30e2\u30fc\u30c9\uff06\u30d7\u30fc\u30eb\u30c1\u30a7\u30c3\u30ab\u30fc",
  newsV13: "\u30d6\u30c3\u30af\u30de\u30fc\u30af\uff06\u90e8\u5206\u4e00\u81f4",
  newsV12: "\u30a2\u30fc\u30c6\u30a3\u30b9\u30c8\u4e00\u81f4\u30d5\u30a3\u30fc\u30c9\u30d0\u30c3\u30af",
  newsV11: "\u5b9f\u7e3e\uff06\u30b0\u30ed\u30fc\u30d0\u30eb\u30e9\u30f3\u30ad\u30f3\u30b0",
  linkReportIssue: "\u554f\u984c\u3092\u5831\u544a",
  footerPageTop: "\u30da\u30fc\u30b8\u4e0a\u90e8",
  rankingsHeaderSong: "\u66f2 / \u30a2\u30fc\u30c6\u30a3\u30b9\u30c8",
  rankingsHeaderPlays: "\u30d7\u30ec\u30a4",
  rankingsHeaderWin: "\u52dd\u7387",
  rankingsHeaderAvg: "\u5e73\u5747",
  rankingsNote: "\u7121\u5236\u9650\u30e2\u30fc\u30c9\u306e\u307f \u00b7 \u6700\u4f4e5\u30d7\u30ec\u30a4",
});
Object.assign(STRINGS.es, SYSTEM_LABEL_STRINGS, {
  videoOpeningClip: "Clip inicial",
  filterSongsMatch: (count) => `${count.toLocaleString()} canciones coinciden`,
  filterNoYears: "No hay anos seleccionados",
  filterTagNewSongs: "Canciones nuevas",
  filterModalTitle: "Filtros de ilimitado",
  filterModalNote: "Limita el proximo grupo de canciones ilimitadas usando metadatos locales de VocaDB.",
  filterWarning: "Cambiar filtros durante una ronda ilimitada sin terminar contara esa ronda como perdida. Las rondas completadas estan a salvo.",
  filterProducerLabel: "Productor / artista",
  filterVoicebankLabel: "Voicebank / sintetizador vocal",
  filterProducerPlaceholder: "escribe un productor...",
  filterVoicebankPlaceholder: "escribe un voicebank...",
  filterProgramLabel: "Programa usado",
  filterYearLabel: "Ano de publicacion",
  filterCommunityLabel: "Sugerida por la comunidad",
  filterNewSongsLabel: "Canciones nuevas",
  filterInclusiveLabel: "Inclusivo",
  filterOptionsLabel: "Opciones",
  filterYearStatusLabel: "Seleccionado",
  filterMatchLabel: "Canciones",
  filterClear: "Limpiar",
  filterApply: "Aplicar",
  statsSectionDistribution: "Distribucion de intentos",
  statsSectionOverview: "Resumen",
  statsSectionDetail: "Detalle",
  sidebarDifficulty: "Dificultad",
  sidebarArchive: "Archivo",
  sidebarTotal: "Total",
  sidebarMilestones: "Hitos",
  milestoneHallOfFame: "Salon de fama",
  milestoneHallOfLegends: "Salon de leyendas",
  milestoneHallOfMyths: "Salon de mitos",
  milestoneFooter: "Niveles de vistas de NicoNico mostrados despues de la respuesta",
  sidebarVisitors: "Visitantes",
  visitorTotal: "Visitantes totales",
  visitorSince: "Desde",
  sidebarNews: "Noticias",
  newsV15: "Filtros ilimitados e hitos del pool",
  newsV14: "Modos de practica y verificador",
  newsV13: "Favoritos y credito parcial",
  newsV12: "Coincidencia de artista",
  newsV11: "Logros y rankings globales",
  linkReportIssue: "Reportar un problema",
  footerPageTop: "Arriba",
  rankingsHeaderSong: "Cancion / Artista",
  rankingsHeaderPlays: "Jugadas",
  rankingsHeaderWin: "Vict.",
  rankingsHeaderAvg: "Prom.",
  rankingsNote: "Solo modo ilimitado · Min. 5 jugadas",
});
Object.assign(STRINGS.ko, SYSTEM_LABEL_STRINGS, {
  videoOpeningClip: "Opening Clip",
  filterSongsMatch: (count) => `${count.toLocaleString()}\uace1 \uc77c\uce58`,
  filterNoYears: "\uc120\ud0dd\ub41c \uc5f0\ub3c4 \uc5c6\uc74c",
  filterTagNewSongs: "\uc0c8 \uace1",
  filterModalTitle: "\ubb34\uc81c\ud55c \ud544\ud130",
  filterModalNote: "\ub85c\uceec VocaDB \uba54\ud0c0\ub370\uc774\ud130\ub85c \ub2e4\uc74c \ubb34\uc81c\ud55c \uace1 \ud480\uc744 \uc904\uc785\ub2c8\ub2e4.",
  filterWarning: "\uc644\ub8cc\ud558\uc9c0 \uc54a\uc740 \ubb34\uc81c\ud55c \ub77c\uc6b4\ub4dc \uc911 \ud544\ud130\ub97c \ubc14\uafb8\uba74 \uadf8 \ub77c\uc6b4\ub4dc\ub294 \ud328\ubc30\ub85c \ucc98\ub9ac\ub429\ub2c8\ub2e4. \uc644\ub8cc\ub41c \ub77c\uc6b4\ub4dc\ub294 \uc548\uc804\ud569\ub2c8\ub2e4.",
  filterProducerLabel: "\ud504\ub85c\ub4c0\uc11c / \uc544\ud2f0\uc2a4\ud2b8",
  filterVoicebankLabel: "\ubcf4\uc774\uc2a4\ubc45\ud06c / \ubcf4\uceec \uc2e0\uc2a4",
  filterProducerPlaceholder: "\ud504\ub85c\ub4c0\uc11c \uc785\ub825...",
  filterVoicebankPlaceholder: "\ubcf4\uc774\uc2a4\ubc45\ud06c \uc785\ub825...",
  filterProgramLabel: "\uc0ac\uc6a9 \ud504\ub85c\uadf8\ub7a8",
  filterYearLabel: "\uacf5\uac1c \uc5f0\ub3c4",
  filterCommunityLabel: "\ucee4\ubba4\ub2c8\ud2f0 \ucd94\ucc9c",
  filterNewSongsLabel: "\uc0c8 \uace1",
  filterInclusiveLabel: "\ud3ec\ud568",
  filterOptionsLabel: "\uc635\uc158",
  filterYearStatusLabel: "\uc120\ud0dd\ub428",
  filterMatchLabel: "\uace1",
  filterClear: "\uc9c0\uc6b0\uae30",
  filterApply: "\uc801\uc6a9",
  statsSectionDistribution: "\uc2dc\ub3c4 \ubd84\ud3ec",
  statsSectionOverview: "\uc694\uc57d",
  statsSectionDetail: "\uc0c1\uc138",
  sidebarDifficulty: "\ub09c\uc774\ub3c4",
  sidebarArchive: "\uc544\uce74\uc774\ube0c",
  sidebarTotal: "\ud569\uacc4",
  sidebarMilestones: "\ub9c8\uc77c\uc2a4\ud1a4",
  milestoneHallOfFame: "\uba85\uc608\uc758 \uc804\ub2f9",
  milestoneHallOfLegends: "\uc804\uc124\uc758 \uc804\ub2f9",
  milestoneHallOfMyths: "\uc2e0\ud654\uc758 \uc804\ub2f9",
  milestoneFooter: "\uc815\ub2f5 \uacf5\uac1c \ud6c4 \ud45c\uc2dc\ub418\ub294 NicoNico \uc7ac\uc0dd\uc218 \ud2f0\uc5b4",
  sidebarVisitors: "\ubc29\ubb38\uc790",
  visitorTotal: "\ucd1d \ubc29\ubb38\uc790",
  visitorSince: "\uc2dc\uc791",
  sidebarNews: "\ub274\uc2a4",
  newsV15: "\ubb34\uc81c\ud55c \ud544\ud130 & \ud480 \ub9c8\uc77c\uc2a4\ud1a4",
  newsV14: "\uc5f0\uc2b5 \ubaa8\ub4dc & \ud480 \uccb4\ucee4",
  newsV13: "\ubd81\ub9c8\ud06c & \ubd80\ubd84 \uc77c\uce58",
  newsV12: "\uc544\ud2f0\uc2a4\ud2b8 \uc77c\uce58 \ud53c\ub4dc\ubc31",
  newsV11: "\uc5c5\uc801 & \uae00\ub85c\ubc8c \ub7ad\ud0b9",
  linkReportIssue: "\ubb38\uc81c \uc2e0\uace0",
  footerPageTop: "\uc704\ub85c",
  rankingsHeaderSong: "\uace1 / \uc544\ud2f0\uc2a4\ud2b8",
  rankingsHeaderPlays: "\ud50c\ub808\uc774",
  rankingsHeaderWin: "\uc2b9\ub960",
  rankingsHeaderAvg: "\ud3c9\uade0",
  rankingsNote: "\ubb34\uc81c\ud55c \ubaa8\ub4dc\ub9cc \u00b7 \ucd5c\uc18c 5\ud50c\ub808\uc774",
});

Object.assign(STRINGS.jp, {
  settingSidebarExtras: "\u30b5\u30a4\u30c9\u30d0\u30fc\u8ffd\u52a0\u9805\u76ee",
  settingSidebarExtrasDesc: "\u30cb\u30e5\u30fc\u30b9\u3001\u30e9\u30f3\u30ad\u30f3\u30b0\u3001\u8a2a\u554f\u8005\u3001\u88c5\u98fe\u30d1\u30cd\u30eb",
});

Object.assign(STRINGS.es, {
  settingSidebarExtras: "Extras de barra lateral",
  settingSidebarExtrasDesc: "Noticias, rankings, visitantes y paneles decorativos",
});

Object.assign(STRINGS.ko, {
  settingSidebarExtras: "\uc0ac\uc774\ub4dc\ubc14 \ucd94\uac00 \ud328\ub110",
  settingSidebarExtrasDesc: "\ub274\uc2a4, \ub7ad\ud0b9, \ubc29\ubb38\uc790, \uc7a5\uc2dd \ud328\ub110",
});

const RELEASE_NOTES = {
  en: {
    "v1.5": {
      version: "Release v1.5",
      intro: "This update adds deeper Unlimited song filtering while keeping normal Unlimited stats separate and readable.",
      items: [
        "VocaDB pool milestones now appear after reveal: Hall of Fame, Hall of Legends, Hall of Myths, YouTube 1M/10M/100M, and Project SEKAI.",
        "Added a Beige Background setting for players who prefer a warmer light-mode page color.",
        "Added Unlimited filters for producer, voicebank, vocal synth program, publish year, and community-suggested songs.",
        "Added a New Songs filter and a light normal Unlimited boost for songs marked as newly added.",
        "Filtered Unlimited now uses its own local stats tab, so filtered streaks and wins stay separate from normal Unlimited.",
        "Active filters appear as removable tags in the top tag row, with filtered song counts shown on the difficulty buttons.",
        "Settings and layout polish: Autocomplete is now separate from compact display controls, Tags can be hidden directly, dark-mode grid lines are softer, and the sidebar order now puts help and charts before stats.",
        "Keyboard-only play is smoother: Enter focuses the guess box, Enter advances after completion without reopening the mobile keyboard, Space controls audio, and Ctrl/Cmd shortcuts work from the guess field.",
        "Autocomplete now surfaces the accepted title that best matches what you type, with the normal display title shown beneath when it differs.",
        "Polished the Global Rankings and stats modals with cleaner table spacing, mobile-friendly rankings columns, and clearer progress sections.",
        "Added old-web sidebar modules for News, pool milestones, helpful links, and a classic visitor counter.",
        "Added Inclusive filtering for broader pools, letting matched songs come from any selected filter category instead of every category at once.",
        "Changing filters during an unfinished Unlimited round now counts that round as a loss; completed rounds are safe.",
      ],
    },
    "v1.4": {
      version: "Release v1.4",
      intro: "This update adds difficulty practice modes to Unlimited, plus new local achievements and polish around practice play.",
      items: [
        "Added Unlimited practice filters for free, easy, medium, hard, and ??? songs while keeping All as the normal Unlimited mode.",
        "The free practice tier now starts at 85% global solve rate instead of 90%, giving it a healthier song pool.",
        "Practice modes use the same active-round protection as normal Unlimited, so refreshing or rerolling cannot preserve a streak for free.",
        "Added new practice achievements, including a hidden challenge for dedicated practice clears.",
        "Suggest a Song now includes a pool checker, so players can search the current database before sending a request.",
        "The PV area now reads more like an old embedded NicoNico-style video module, with a compact [VIDEO] strip and attached metadata bar.",
        "Sidebar charts were tightened into rank, title, and stat columns so Hall of Myths and Global Rankings feel more like old chart widgets.",
        "Fixed the Copy Result button being hidden by some browser extensions, and corrected the Japanese artist display for AMARA.",
      ],
    },
    "v1.3": {
      version: "Release v1.3",
      intro: "This update focuses on finding, saving, and identifying songs more comfortably while keeping the core game intact.",
      items: [
        "Added achievement search so the achievements list can be filtered by name, description, or category.",
        "Added local bookmarks for saving revealed songs on this device, with searchable bookmark history, thumbnails, VocaDB links, and hosted audio previews.",
        "Bookmark audio previews now respect the volume setting and show elapsed playback time.",
        "Improved bookmark thumbnail fallback handling so saved songs can try alternate cover sources when a low-quality placeholder appears.",
        "Added Strong match for guesses that share both producer credit and main vocal synth with the correct song.",
        "Added vocal-match partial credit: guesses with the correct main vocal synth now show as Vocal match instead of plain Wrong.",
        "Strong, artist, and vocal matches now have separate purple, yellow, and blue feedback states in history, sidebar attempt boxes, cover-placeholder feedback, and copied result squares.",
        "Fixed same-title variants so selecting one version no longer blocks another version just because the displayed title is identical.",
        "Added Unlimited difficulty practice submodes for Free, Easy, Medium, Hard, and ??? songs. These practice stats stay local and do not affect global rankings.",
      ],
    },
    "v1.2": {
      version: "Release v1.2",
      intro: "This update expands the song pool and adds clearer feedback for close guesses and personal listening stats.",
      items: [
        "Added 78 new playable songs from the latest batch, bringing the pool to 1079 songs.",
        "Artist-match partial credit: if the guessed song or typed artist matches the correct song's producer credit, the attempt is marked as Artist match instead of plain Wrong.",
        "Artist matches now appear as yellow in guess history, sidebar attempt boxes, and shared result squares.",
        "The cover-art question mark now changes color based on the latest pre-answer state: white by default, red after a wrong guess, yellow after an artist match, and gray after a skip.",
        "Sidebar current-attempt boxes are neutral white so they no longer look like an artist-match result before any guess is made.",
        "Stats now track publish-year performance locally, including Best publish year and Most played year.",
        "Added two new hidden achievements: a Miku-themed language easter egg and a top-50 hardest-song challenge.",
      ],
    },
    "v1.1": {
      version: "Release v1.1",
      intro: "This update expands the game around stats, personal progress, achievements, visual polish, and unlimited mode history.",
      items: [
        "Achievements system with 42 total achievements across General, Daily, Unlimited, Archive, Knowledge, Challenge, and Secret categories - including hidden achievements.",
        "Full Global Rankings modal with Popular, Hardest, Easiest, Lowest Avg, and Highest Avg tabs.",
        "Expanded personal stats with first-try solves, rarest solve, rarest 1/6, archive progress, and achievement progress.",
        "Copy Profile button for sharing local Daily, Unlimited, and Archive progress without accounts.",
        "Post-solve global comparison toast showing how your result compares with the global average.",
        "Settings backup tools for exporting and importing local stats, archive progress, and unlimited history.",
        "Archive calendar now shows attempt count per solved puzzle (1/6 through 6/6) with a color gradient from green to red.",
        "Unlimited History: your last 100 unlimited puzzle results, accessible from the Unlimited stats tab.",
        "Bullet comments now draw from a large randomized pool and cycle differently each puzzle. Senbonzakura gets its own comment set.",
        "マイリスト counter in the video meta row increments each time you solve a puzzle correctly, persisted across sessions.",
        "One secret achievement remains undocumented. It involves a specific song and the right settings.",
        "Song pool update to 1001 playable songs with duplicate entries removed and refreshed audio links.",
        "Unlimited mode now avoids recently played songs across a larger window, and Skip extends active playback to the newly unlocked clip length.",
        "Japanese result sharing now localizes mode labels and global stats text more completely.",
      ],
    },
    "v1.0": {
      version: "Official Release v1.0",
      intro: "This release collected the major updates prepared for the public site.",
      items: [
        "Daily Archive with playable past puzzles, monthly completion summaries, and hardest/easiest daily notes.",
        "Random Archive Puzzle for jumping into older dailies without picking a date.",
        "Global song stats, solve rates, average attempts, and expanded rankings with Lowest/Highest Avg tabs.",
        "Song Pool credits, VocaDB source information, and clearer project disclaimers.",
        "Suggest a Song, Report Issue forms, and Community Suggested tags for future additions.",
        "English/Japanese interface support with song title display options.",
        "Retro NicoNico-inspired layout polish, improved autocomplete, and Cloudflare-hosted audio support.",
      ],
    },
  },
  jp: {
    "v1.5": {
      version: "\u30EA\u30EA\u30FC\u30B9 v1.5",
      intro: "\u3053\u306E\u66F4\u65B0\u3067\u306F\u3001\u901A\u5E38\u306E\u7121\u5236\u9650\u7D71\u8A08\u3068\u5206\u3051\u305F\u307E\u307E\u3001\u3088\u308A\u7D30\u304B\u304F\u66F2\u3092\u7D5E\u308A\u8FBC\u3081\u308B\u6A5F\u80FD\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002",
      items: [
        "VocaDB\u306E\u30DE\u30A4\u30EB\u30B9\u30C8\u30FC\u30F3\u30D7\u30FC\u30EB\u306E\u66F2\u306F\u3001\u89E3\u7B54\u5F8C\u306BVOCALOID\u6BBF\u5802\u5165\u308A\u3001VOCALOID\u4F1D\u8AAC\u5165\u308A\u3001VOCALOID\u795E\u8A71\u5165\u308A\u3001YouTube 100\u4E07/1000\u4E07/1\u5104\u3001Project SEKAI\u306E\u30BF\u30B0\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
        "\u30E9\u30A4\u30C8\u8868\u793A\u7528\u306B\u3001\u6696\u304B\u3044\u8272\u5473\u306E\u30D9\u30FC\u30B8\u30E5\u80CC\u666F\u8A2D\u5B9A\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002",
        "\u7121\u5236\u9650\u30E2\u30FC\u30C9\u306B\u3001\u30D7\u30ED\u30C7\u30E5\u30FC\u30B5\u30FC\u3001\u30DC\u30A4\u30B9\u30D0\u30F3\u30AF\u3001\u6B4C\u58F0\u30BD\u30D5\u30C8\u3001\u516C\u958B\u5E74\u3001\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u63A8\u85A6\u66F2\u306E\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002",
        "\u30D5\u30A3\u30EB\u30BF\u30FC\u4ED8\u304D\u7121\u5236\u9650\u306F\u5C02\u7528\u306E\u30ED\u30FC\u30AB\u30EB\u7D71\u8A08\u30BF\u30D6\u3092\u4F7F\u3046\u305F\u3081\u3001\u901A\u5E38\u306E\u7121\u5236\u9650\u30B9\u30C8\u30EA\u30FC\u30AF\u3068\u5206\u304B\u308C\u307E\u3059\u3002",
        "\u6709\u52B9\u306A\u30D5\u30A3\u30EB\u30BF\u30FC\u306F\u4E0A\u90E8\u306E\u30BF\u30B0\u884C\u306B\u8868\u793A\u3055\u308C\u3001\u96E3\u6613\u5EA6\u30DC\u30BF\u30F3\u306B\u306F\u7D5E\u308A\u8FBC\u307F\u5F8C\u306E\u66F2\u6570\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
        "設定を整理し、オートコンプリートを表示設定から独立させました。タグ表示の切り替え、暗色テーマの罫線調整、サイドバー順の見直しも行いました。",
        "キーボードだけでも遊びやすくなりました。プレイ中は Enter で回答欄に移動し、終了後は Enter で次の曲へ進み、Space で音声プレビューを再生できます。",
        "\u30aa\u30fc\u30c8\u30b3\u30f3\u30d7\u30ea\u30fc\u30c8\u306f\u3001\u5165\u529b\u306b\u6700\u3082\u8fd1\u3044\u5225\u540d\u30fb\u8868\u8a18\u3092\u5019\u88dc\u540d\u3068\u3057\u3066\u8868\u793a\u3057\u3001\u901a\u5e38\u306e\u8868\u793a\u540d\u304c\u7570\u306a\u308b\u5834\u5408\u306f\u4e0b\u306b\u8868\u793a\u3057\u307e\u3059\u3002",
        "\u30B0\u30ED\u30FC\u30D0\u30EB\u30E9\u30F3\u30AD\u30F3\u30B0\u3068\u7D71\u8A08\u30E2\u30FC\u30C0\u30EB\u306E\u8868\u793A\u3092\u8ABF\u6574\u3057\u3001\u30E2\u30D0\u30A4\u30EB\u3067\u3082\u8AAD\u307F\u3084\u3059\u3044\u5217\u5E45\u3068\u9032\u6357\u8868\u793A\u306B\u3057\u307E\u3057\u305F\u3002",
        "\u30cb\u30e5\u30fc\u30b9\u3001\u30d7\u30fc\u30eb\u30de\u30a4\u30eb\u30b9\u30c8\u30fc\u30f3\u3001\u30ea\u30f3\u30af\u3001\u30ec\u30c8\u30ed\u306a\u8a2a\u554f\u8005\u30ab\u30a6\u30f3\u30bf\u30fc\u3092\u53e4\u3044Web\u98a8\u306e\u30b5\u30a4\u30c9\u30d0\u30fc\u30e2\u30b8\u30e5\u30fc\u30eb\u3068\u3057\u3066\u8ffd\u52a0\u3057\u307e\u3057\u305f\u3002",
        "\u300CInclusive\u300D\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u8FFD\u52A0\u3057\u3001\u9078\u3093\u3060\u6761\u4EF6\u306E\u3044\u305A\u308C\u304B\u306B\u4E00\u81F4\u3059\u308B\u5E83\u3044\u66F2\u30D7\u30FC\u30EB\u3092\u4F5C\u308C\u308B\u3088\u3046\u306B\u3057\u307E\u3057\u305F\u3002",
        "\u672A\u5B8C\u4E86\u306E\u7121\u5236\u9650\u30E9\u30A6\u30F3\u30C9\u4E2D\u306B\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u5909\u66F4\u3059\u308B\u3068\u3001\u305D\u306E\u30E9\u30A6\u30F3\u30C9\u306F\u8CA0\u3051\u3068\u3057\u3066\u8A18\u9332\u3055\u308C\u307E\u3059\u3002\u5B8C\u4E86\u5F8C\u306E\u5909\u66F4\u306F\u5B89\u5168\u3067\u3059\u3002",
      ],
    },
    "v1.4": {
      version: "\u30EA\u30EA\u30FC\u30B9 v1.4",
      intro: "\u3053\u306E\u66F4\u65B0\u3067\u306F\u3001\u7121\u5236\u9650\u30E2\u30FC\u30C9\u306B\u96E3\u6613\u5EA6\u5225\u306E\u7DF4\u7FD2\u30E2\u30FC\u30C9\u3068\u65B0\u3057\u3044\u30ED\u30FC\u30AB\u30EB\u5B9F\u7E3E\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002",
      items: [
        "\u7121\u5236\u9650\u30E2\u30FC\u30C9\u306B\u3001free\u3001easy\u3001medium\u3001hard\u3001??? \u306E\u7DF4\u7FD2\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002All \u306F\u5F93\u6765\u3069\u304A\u308A\u306E\u7121\u5236\u9650\u30E2\u30FC\u30C9\u3067\u3059\u3002",
        "free \u7DF4\u7FD2\u306E\u57FA\u6E96\u3092\u30B0\u30ED\u30FC\u30D0\u30EB\u6B63\u89E3\u738785%\u4EE5\u4E0A\u306B\u5909\u66F4\u3057\u3001\u5BFE\u8C61\u66F2\u3092\u5897\u3084\u3057\u307E\u3057\u305F\u3002",
        "\u7DF4\u7FD2\u30E2\u30FC\u30C9\u306B\u3082\u901A\u5E38\u306E\u7121\u5236\u9650\u30E2\u30FC\u30C9\u3068\u540C\u3058\u4E2D\u65AD\u4FDD\u8B77\u3092\u9069\u7528\u3057\u3001\u66F4\u65B0\u3084\u518D\u62BD\u9078\u3067\u30B9\u30C8\u30EA\u30FC\u30AF\u3092\u7DAD\u6301\u3067\u304D\u306A\u3044\u3088\u3046\u306B\u3057\u307E\u3057\u305F\u3002",
        "\u7DF4\u7FD2\u30E2\u30FC\u30C9\u7528\u306E\u65B0\u3057\u3044\u5B9F\u7E3E\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002\u3058\u3063\u304F\u308A\u904A\u3076\u3068\u898B\u3064\u304B\u308B\u96A0\u3057\u5B9F\u7E3E\u3082\u3042\u308A\u307E\u3059\u3002",
        "\u300C\u66F2\u3092\u63D0\u6848\u300D\u306B\u73FE\u5728\u306E\u66F2\u30D7\u30FC\u30EB\u691C\u7D22\u3092\u8FFD\u52A0\u3057\u3001\u9001\u4FE1\u524D\u306B\u3059\u3067\u306B\u767B\u9332\u6E08\u307F\u304B\u78BA\u8A8D\u3067\u304D\u308B\u3088\u3046\u306B\u3057\u307E\u3057\u305F\u3002",
        "\u30AB\u30D0\u30FC/PV\u8868\u793A\u3092\u3001[VIDEO]\u30B9\u30C8\u30EA\u30C3\u30D7\u3068\u30E1\u30BF\u60C5\u5831\u884C\u304C\u4E00\u4F53\u306B\u306A\u3063\u305F\u53E4\u3044\u30CB\u30B3\u30CB\u30B3\u98A8\u306E\u52D5\u753B\u30E2\u30B8\u30E5\u30FC\u30EB\u306B\u8ABF\u6574\u3057\u307E\u3057\u305F\u3002",
        "\u30B5\u30A4\u30C9\u30D0\u30FC\u306E\u30C1\u30E3\u30FC\u30C8\u3092\u9806\u4F4D\u3001\u66F2\u540D\u3001\u60C5\u5831\u306E3\u5217\u306B\u6574\u5217\u3057\u3001Hall of Myths\u3068\u30B0\u30ED\u30FC\u30D0\u30EB\u30E9\u30F3\u30AD\u30F3\u30B0\u3092\u3088\u308A\u53E4\u3044\u30C1\u30E3\u30FC\u30C8\u8868\u793A\u3089\u3057\u304F\u3057\u307E\u3057\u305F\u3002",
        "\u4E00\u90E8\u306E\u30D6\u30E9\u30A6\u30B6\u62E1\u5F35\u3067 Copy Result \u30DC\u30BF\u30F3\u304C\u975E\u8868\u793A\u306B\u306A\u308B\u554F\u984C\u3092\u907F\u3051\u3001AMARA \u306E\u65E5\u672C\u8A9E\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u8868\u793A\u3082\u4FEE\u6B63\u3057\u307E\u3057\u305F\u3002",
      ],
    },
    "v1.3": {
      version: "\u30EA\u30EA\u30FC\u30B9 v1.3",
      intro: "\u3053\u306E\u66F4\u65B0\u3067\u306F\u3001\u57FA\u672C\u306E\u30B2\u30FC\u30E0\u6027\u306F\u305D\u306E\u307E\u307E\u306B\u3001\u66F2\u3092\u63A2\u3059\u30FB\u4FDD\u5B58\u3059\u308B\u30FB\u8FD1\u3044\u56DE\u7B54\u3092\u898B\u5206\u3051\u308B\u4F53\u9A13\u3092\u6539\u5584\u3057\u307E\u3057\u305F\u3002",
      items: [
        "\u5B9F\u7E3E\u691C\u7D22\u3092\u8FFD\u52A0\u3057\u3001\u540D\u524D\u30FB\u8AAC\u660E\u30FB\u30AB\u30C6\u30B4\u30EA\u3067\u7D5E\u308A\u8FBC\u3081\u308B\u3088\u3046\u306B\u3057\u307E\u3057\u305F\u3002",
        "\u89E3\u7B54\u5F8C\u306E\u66F2\u3092\u3053\u306E\u7AEF\u672B\u306B\u4FDD\u5B58\u3067\u304D\u308B\u30ED\u30FC\u30AB\u30EB\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u3092\u8FFD\u52A0\u3057\u3001\u691C\u7D22\u3001\u30B5\u30E0\u30CD\u30A4\u30EB\u3001VocaDB\u30EA\u30F3\u30AF\u3001\u914D\u4FE1\u97F3\u58F0\u30D7\u30EC\u30D3\u30E5\u30FC\u306B\u5BFE\u5FDC\u3057\u307E\u3057\u305F\u3002",
        "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u306E\u97F3\u58F0\u30D7\u30EC\u30D3\u30E5\u30FC\u304C\u97F3\u91CF\u8A2D\u5B9A\u3092\u53CD\u6620\u3057\u3001\u518D\u751F\u6642\u9593\u3082\u8868\u793A\u3059\u308B\u3088\u3046\u306B\u306A\u308A\u307E\u3057\u305F\u3002",
        "\u4FDD\u5B58\u6E08\u307F\u66F2\u306E\u30B5\u30E0\u30CD\u30A4\u30EB\u304C\u4F4E\u753B\u8CEA\u306E\u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u306B\u306A\u3063\u305F\u5834\u5408\u3001\u5225\u306E\u30AB\u30D0\u30FC\u5019\u88DC\u3092\u8A66\u3059\u3088\u3046\u306B\u3057\u307E\u3057\u305F\u3002",
        "\u30D7\u30ED\u30C7\u30E5\u30FC\u30B5\u30FC\u8868\u8A18\u3068\u30E1\u30A4\u30F3\u30DC\u30FC\u30AB\u30EB\u30B7\u30F3\u30BB\u306E\u4E21\u65B9\u304C\u6B63\u89E3\u66F2\u3068\u4E00\u81F4\u3059\u308B\u56DE\u7B54\u3092\u300CStrong match\u300D\u3068\u3057\u3066\u8868\u793A\u3059\u308B\u3088\u3046\u306B\u3057\u307E\u3057\u305F\u3002",
        "\u30DC\u30FC\u30AB\u30EB\u4E00\u81F4\u306E\u90E8\u5206\u70B9\u3092\u8FFD\u52A0\u3057\u3001\u6B63\u89E3\u66F2\u3068\u540C\u3058\u30E1\u30A4\u30F3\u30DC\u30FC\u30AB\u30EB\u30B7\u30F3\u30BB\u306E\u66F2\u3092\u56DE\u7B54\u3057\u305F\u5834\u5408\u3001\u901A\u5E38\u306E\u4E0D\u6B63\u89E3\u3067\u306F\u306A\u304F\u300CVocal match\u300D\u3068\u3057\u3066\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
        "\u5F37\u4E00\u81F4\u3001\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u4E00\u81F4\u3001\u30DC\u30FC\u30AB\u30EB\u4E00\u81F4\u306F\u3001\u56DE\u7B54\u5C65\u6B74\u3001\u30B5\u30A4\u30C9\u30D0\u30FC\u306E\u8A66\u884C\u30DE\u30B9\u3001\u30AB\u30D0\u30FC\u6B04\u306E\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3001\u5171\u6709\u7D50\u679C\u3067\u305D\u308C\u305E\u308C\u7D2B\u3001\u9EC4\u8272\u3001\u9752\u3068\u3057\u3066\u8868\u793A\u3055\u308C\u307E\u3059\u3002",
        "\u540C\u3058\u66F2\u540D\u306E\u5225\u30D0\u30FC\u30B8\u30E7\u30F3\u3092\u9078\u3093\u3060\u5834\u5408\u3001\u8868\u793A\u540D\u304C\u540C\u3058\u3067\u3082\u300C\u3059\u3067\u306B\u56DE\u7B54\u6E08\u307F\u300D\u306B\u306A\u3089\u306A\u3044\u3088\u3046\u4FEE\u6B63\u3057\u307E\u3057\u305F\u3002",
        "\u7121\u5236\u9650\u30E2\u30FC\u30C9\u306B\u3001\u30B5\u30FC\u30D3\u30B9\u3001\u7C21\u5358\u3001\u666E\u901A\u3001\u96E3\u3057\u3044\u3001??? \u306E\u96E3\u6613\u5EA6\u7DF4\u7FD2\u30B5\u30D6\u30E2\u30FC\u30C9\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002\u7DF4\u7FD2\u7D71\u8A08\u306F\u30ED\u30FC\u30AB\u30EB\u306E\u307F\u306B\u4FDD\u5B58\u3055\u308C\u3001\u30B0\u30ED\u30FC\u30D0\u30EB\u30E9\u30F3\u30AD\u30F3\u30B0\u306B\u306F\u53CD\u6620\u3055\u308C\u307E\u305B\u3093\u3002",
      ],
    },
    "v1.2": {
      version: "リリース v1.2",
      intro: "この更新では、曲プールの追加、惜しい回答のフィードバック、公開年ごとの個人統計を強化しました。",
      items: [
        "最新バッチから78曲のプレイ可能曲を追加し、曲プールは1079曲になりました。",
        "アーティスト一致の部分点を追加しました。回答した曲、または入力したアーティストが正解曲のプロデューサー表記と一致した場合、通常の不正解ではなく「Artist match」として表示されます。",
        "アーティスト一致は、回答履歴、サイドバーの試行マス、共有結果のマスで黄色表示になります。",
        "正解前のカバー欄の「?」が直近の状態に応じて変化します。初期状態は白、不正解後は赤、アーティスト一致後は黄色、スキップ後は灰色になります。",
        "サイドバーの現在の試行マスを白に変更し、未回答の状態でアーティスト一致のように見えないようにしました。",
        "公開年ごとのローカル統計を追加し、「得意な公開年」と「よくプレイする公開年」を表示するようにしました。",
        "ミクテーマの言語イースターエッグと、難関上位50曲チャレンジの2つの隠し実績を追加しました。",
      ],
    },
    "v1.1": {
      version: "リリース v1.1",
      intro: "この更新では、統計・個人の進捗・実績・ビジュアル・無制限モードの履歴機能を中心に拡張しました。",
      items: [
        "General、Daily、Unlimited、Archive、Knowledge、Challenge、Secretの7カテゴリに合計42個の実績を追加（隠し実績含む）。",
        "人気、難しい、簡単、低平均、高平均タブ付きのグローバルランキングモーダルを追加。",
        "一発正解、最レア正解、最レア1/6、アーカイブ進捗、実績進捗を含む個人統計を拡張。",
        "アカウントなしでDaily、Unlimited、Archiveの進捗を共有できるプロフィールコピーを追加。",
        "クリア後に自分の結果とグローバル平均を比較する通知を追加。",
        "ローカル統計・アーカイブ進捗・無制限履歴をエクスポート/インポートできるバックアップ機能を追加。",
        "アーカイブカレンダーに正解した試行回数（1/6〜6/6）を色グラデーション付きで表示。",
        "無制限モードの直近100件のプレイ履歴を統計タブから確認できるようになりました。",
        "弾幕コメントがランダムプールから選ばれるようになり、毎回異なるコメントが表示されます。千本桜には専用コメントセットを用意。",
        "動画メタ行にマイリストカウンターを追加。正解するたびに増加し、リロード後も保持されます。",
        "ある特定の曲と、ある設定の組み合わせで解除できる隠し実績が1つあります。",
        "曲プールを1001曲に更新し、重複曲を削除、音声リンクを更新。",
        "無制限モードで直近の曲をより広い範囲で避けるようにし、スキップ時は再生中の音声が新しい秒数まで延長されるよう改善。",
        "日本語の結果共有でモード名とグローバル統計テキストをより完全に翻訳。",
      ],
    },
    "v1.0": {
      version: "正式リリース v1.0",
      intro: "このリリースでは、公開版サイトに向けた主な更新をまとめました。",
      items: [
        "過去のデイリーパズル、月ごとの達成サマリー、最難関/最易デイリーのメモを追加。",
        "日付を選ばず過去のデイリーに飛べるランダムアーカイブ問題を追加。",
        "グローバル楽曲統計、正解率、平均挑戦回数、低平均/高平均タブ付きランキングを追加。",
        "曲プールのクレジット、VocaDBソース情報、プロジェクトの免責表記を整理。",
        "曲の提案、問題報告フォーム、今後の追加曲向けコミュニティ推薦タグに対応。",
        "英語/日本語インターフェースと曲名表示オプションに対応。",
        "ニコニコ風レトロUIの調整、オートコンプリート改善、Cloudflare配信音声への対応。",
      ],
    },
  },
};


RELEASE_NOTES.ko = {
  "v1.5": {
    version: "릴리스 v1.5",
    intro: "이번 업데이트는 일반 무제한 통계와 분리된 상태로 더 자세한 무제한 곡 필터를 추가합니다.",
    items: [
      "VocaDB \uB9C8\uC77C\uC2A4\uD1A4 \uD480\uC5D0 \uD3EC\uD568\uB41C \uACE1\uC740 \uC815\uB2F5 \uACF5\uAC1C \uD6C4 Hall of Fame, Hall of Legends, Hall of Myths, YouTube 100\uB9CC/1000\uB9CC/1\uC5B5, Project SEKAI \uD0DC\uADF8\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
      "\uBC1D\uC740 \uD654\uBA74\uC5D0\uC11C \uB354 \uB530\uB73B\uD55C \uC0C9\uAC10\uC744 \uC6D0\uD558\uB294 \uD50C\uB808\uC774\uC5B4\uB97C \uC704\uD574 \uBCA0\uC774\uC9C0 \uBC30\uACBD \uC124\uC815\uC744 \uCD94\uAC00\uD588\uC2B5\uB2C8\uB2E4.",
      "무제한 모드에 프로듀서, 보이스뱅크, 보컬 신스 프로그램, 공개 연도, 커뮤니티 추천 곡 필터를 추가했습니다.",
      "필터가 적용된 무제한은 별도의 로컬 통계 탭을 사용하므로 일반 무제한 기록과 분리됩니다.",
      "활성 필터는 상단 태그 줄에 제거 가능한 태그로 표시되며, 난이도 버튼에는 필터 적용 후 곡 수가 표시됩니다.",
      "설정에서 자동완성을 표시 옵션과 분리하고, 태그 숨김 설정, 어두운 테마의 더 부드러운 격자선, 도움말과 차트를 먼저 보여주는 사이드바 순서를 추가했습니다.",
      "키보드만으로 더 쉽게 플레이할 수 있습니다. 라운드 중 Enter는 추측 입력창으로 이동하고, 완료 후 Enter는 다음 곡으로 넘어가며, Space는 오디오 미리듣기를 제어합니다.",
      "글로벌 랭킹과 통계 모달의 표 간격을 다듬어 모바일에서도 랭킹 열과 진행도 섹션이 더 읽기 쉬워졌습니다.",
      "\uc790\ub3d9\uc644\uc131\uc740 \uc785\ub825\uacfc \uac00\uc7a5 \uac00\uae4c\uc6b4 \ubcc4\uce6d/\ud45c\uae30\ub97c \ud6c4\ubcf4 \uc774\ub984\uc73c\ub85c \ud45c\uc2dc\ud558\uace0, \uc77c\ubc18 \ud45c\uc2dc\uba85\uc774 \ub2e4\ub974\uba74 \uc544\ub798\uc5d0 \ud568\uaed8 \ubcf4\uc5ec\uc90d\ub2c8\ub2e4.",
      "\ub274\uc2a4, \ud480 \ub9c8\uc77c\uc2a4\ud1a4, \ub9c1\ud06c, \ub808\ud2b8\ub85c \ubc29\ubb38\uc790 \uce74\uc6b4\ud130\ub97c \uc624\ub798\ub41c Web \uc2a4\ud0c0\uc77c \uc0ac\uc774\ub4dc\ubc14 \ubaa8\ub4c8\ub85c \ucd94\uac00\ud588\uc2b5\ub2c8\ub2e4.",
      "Inclusive 필터를 추가해 선택한 조건 중 하나라도 맞는 더 넓은 곡 풀을 만들 수 있습니다.",
      "완료하지 않은 무제한 라운드 중 필터를 변경하면 해당 라운드는 패배로 기록됩니다. 완료된 라운드는 안전합니다.",
    ],
  },
  "v1.4": {
    version: "릴리스 v1.4",
    intro: "이번 업데이트는 무제한 모드에 난이도별 연습 필터와 새로운 로컬 업적을 추가합니다.",
    items: [
      "무제한 모드에 프리, 쉬움, 보통, 어려움, ??? 연습 필터를 추가했습니다. 전체는 기존 무제한 모드처럼 작동합니다.",
      "프리 연습 기준을 글로벌 정답률 85% 이상으로 조정해 대상 곡을 늘렸습니다.",
      "연습 모드에도 무제한 모드와 같은 중단 보호를 적용해 새로고침이나 재추첨으로 기록을 유지할 수 없게 했습니다.",
      "곡 제안 화면에 현재 곡 풀 검색을 추가해 제출 전에 이미 등록된 곡인지 확인할 수 있습니다.",
      "PV 영역을 오래된 임베드 비디오 모듈처럼 다듬고, [VIDEO] 헤더와 연결된 메타 정보 바를 추가했습니다.",
      "사이드바 차트를 순위, 곡명, 제작자/통계 열로 정렬해 Hall of Myths와 Global Rankings가 오래된 차트 위젯처럼 보이도록 했습니다.",
      "일부 브라우저 확장에서 결과 복사 버튼이 사라지는 문제를 피하고, AMARA의 일본어 아티스트 표시를 수정했습니다.",
    ],
  },
  "v1.3": {
    version: "릴리스 v1.3",
    intro: "이번 업데이트는 곡 검색, 저장, 가까운 추측 피드백을 개선했습니다.",
    items: [
      "업적 검색을 추가해 이름, 설명, 카테고리로 필터링할 수 있습니다.",
      "정답 후 곡을 이 기기에 저장하는 로컬 북마크를 추가했습니다. 검색, 썸네일, VocaDB 링크, 오디오 미리듣기를 지원합니다.",
      "북마크 오디오 미리듣기가 음량 설정을 반영하고 재생 시간을 표시합니다.",
      "정답 곡과 프로듀서 및 메인 보컬 신스가 모두 일치하는 추측을 강한 일치로 표시합니다.",
      "메인 보컬 신스가 맞으면 일반 오답 대신 보컬 일치로 표시하는 부분 점수를 추가했습니다.",
      "같은 제목의 다른 버전을 선택해도 제목이 같다는 이유만으로 이미 추측한 것으로 막히지 않게 수정했습니다.",
      "무제한 모드에 난이도별 연습 서브모드를 추가했습니다. 연습 통계는 로컬에만 저장되고 글로벌 랭킹에는 반영되지 않습니다.",
    ],
  },
  "v1.2": {
    version: "릴리스 v1.2",
    intro: "이번 업데이트는 곡 풀 확장, 가까운 정답 피드백, 공개 연도별 개인 통계를 추가했습니다.",
    items: [
      "최신 배치에서 새 플레이 가능 곡을 추가했습니다.",
      "추측한 곡이나 입력한 아티스트가 정답 곡의 프로듀서와 일치하면 아티스트 일치로 표시합니다.",
      "아티스트 일치는 추측 기록, 사이드바 칸, 공유 결과에서 노란색으로 표시됩니다.",
      "정답 전 커버 박스의 물음표가 최근 상태에 따라 바뀝니다.",
      "공개 연도별 로컬 통계를 추가해 가장 잘 맞힌 연도와 가장 많이 플레이한 연도를 표시합니다.",
      "새 숨겨진 업적을 추가했습니다.",
    ],
  },
  "v1.1": {
    version: "릴리스 v1.1",
    intro: "이번 업데이트는 통계, 개인 진행도, 업적, 시각적 polish, 무제한 모드 기록을 확장했습니다.",
    items: [
      "일반, 데일리, 무제한, 아카이브, 지식, 도전, 비밀 카테고리에 업적 시스템을 추가했습니다.",
      "인기, 어려움, 쉬움, 낮은 평균, 높은 평균 탭이 있는 전체 글로벌 랭킹 모달을 추가했습니다.",
      "1회 정답, 가장 희귀한 정답, 가장 희귀한 1/6, 아카이브 진행도, 업적 진행도를 포함해 개인 통계를 확장했습니다.",
      "계정 없이 진행도를 공유할 수 있는 프로필 복사 버튼을 추가했습니다.",
      "정답 후 내 결과와 글로벌 평균을 비교하는 알림을 추가했습니다.",
      "로컬 통계, 아카이브 진행도, 무제한 기록을 내보내고 가져올 수 있는 백업 도구를 추가했습니다.",
      "아카이브 캘린더에 정답 시도 횟수를 색상으로 표시합니다.",
      "무제한 통계 탭에서 최근 100개의 무제한 퍼즐 기록을 확인할 수 있습니다.",
      "탄막 댓글 풀과 전용 곡 댓글 세트를 확장했습니다.",
    ],
  },
  "v1.0": {
    version: "공식 릴리스 v1.0",
    intro: "공개 사이트를 위해 준비한 주요 업데이트를 모은 릴리스입니다.",
    items: [
      "지난 데일리 퍼즐을 플레이할 수 있는 데일리 아카이브를 추가했습니다.",
      "날짜를 고르지 않고 과거 데일리로 들어가는 랜덤 아카이브 퍼즐을 추가했습니다.",
      "글로벌 곡 통계, 정답률, 평균 시도 수, 확장 랭킹을 추가했습니다.",
      "곡 풀 크레딧, VocaDB 출처 정보, 프로젝트 면책 문구를 정리했습니다.",
      "곡 제안, 문제 신고 폼, 향후 추가곡을 위한 커뮤니티 추천 태그를 추가했습니다.",
      "영어/일본어/한국어 인터페이스와 곡 제목 표시 옵션을 지원합니다.",
      "레트로 NicoNico풍 레이아웃, 자동완성 개선, Cloudflare 호스팅 오디오를 지원합니다.",
    ],
  },
};

RELEASE_NOTES.es = {
  "v1.5": {
    version: "Version v1.5",
    intro: "Esta actualizacion agrega filtros mas detallados para Unlimited manteniendo sus estadisticas separadas.",
    items: [
      "Los hitos de pools de VocaDB ahora aparecen al revelar: Hall of Fame, Hall of Legends, Hall of Myths, YouTube 1 M/10 M/100 M y Project SEKAI.",
      "Se agrego un ajuste de fondo beige para quienes prefieren un color claro mas calido.",
      "Se agregaron filtros de Unlimited por productor, voicebank, programa vocal, ano de publicacion y canciones sugeridas por la comunidad.",
      "Unlimited con filtros ahora tiene su propia pestana de estadisticas locales, separada del Unlimited normal.",
      "Los filtros activos aparecen como etiquetas removibles en la fila superior, y los botones de dificultad muestran el conteo filtrado.",
      "Los ajustes ahora separan Autocompletar de los controles compactos, permiten ocultar etiquetas, suavizan la cuadricula del modo oscuro y reordenan la barra lateral para mostrar ayuda y rankings primero.",
      "El juego es mas comodo solo con teclado: Enter enfoca el campo de respuesta, Enter avanza despues de terminar sin reabrir el teclado movil, Espacio controla el audio y los atajos Ctrl/Cmd funcionan desde el campo de respuesta.",
      "El autocompletado ahora muestra el titulo alternativo aceptado que mejor coincide con lo que escribes, con el titulo normal debajo si es diferente.",
      "Se pulieron los modales de clasificaciones globales y estadisticas con mejor espaciado, columnas moviles mas legibles y secciones de progreso mas claras.",
      "Se agregaron modulos laterales de estilo web antiguo para noticias, hitos del pool, enlaces utiles y un contador clasico de visitantes.",
      "Se agrego el filtro Inclusive para crear pools mas amplios con canciones que coincidan con cualquiera de las categorias elegidas.",
      "Cambiar filtros durante una ronda de Unlimited sin terminar cuenta esa ronda como derrota. Las rondas completadas son seguras.",
    ],
  },
  "v1.4": {
    version: "Version v1.4",
    intro: "Esta actualizaci-n a-ade filtros de practica por dificultad al modo ilimitado y nuevos logros locales.",
    items: [
      "El modo ilimitado ahora tiene filtros de practica: Libre, Facil, Medio, Dificil y ???. Todo funciona como el ilimitado normal.",
      "El umbral de practica Libre se ajust- a 85% o mas de acierto global para incluir mas canciones.",
      "La protecci-n contra reiniciar o cambiar de cancion para conservar rachas tambi-n se aplica a los modos de practica.",
      "La p-gina de sugerir cancion ahora permite comprobar si una cancion ya esta en el juego antes de enviarla.",
      "El -rea PV ahora se siente mas como un reproductor de v-deo incrustado retro, con cabecera [VIDEO] y una barra de metadatos conectada.",
      "Las listas laterales Hall of Myths y Global Rankings ahora se alinean como filas compactas de rango, titulo y productor/estad-stica.",
      "Se corrigieron casos donde el bot-n de copiar resultado desaparec-a con algunas extensiones del navegador y se ajust- la visualizaci-n japonesa de AMARA.",
      "Se a-adi- traducci-n de interfaz en espanol.",
    ],
  },
  "v1.3": {
    version: "Version v1.3",
    intro: "Esta actualizaci-n mejora c-mo buscas, guardas y reconoces respuestas cercanas sin cambiar el flujo principal del juego.",
    items: [
      "Se a-adi- busqueda de logros por nombre, descripcion o categoria.",
      "Se a-adieron marcadores locales para guardar canciones reveladas en este dispositivo, con busqueda, miniaturas, enlaces a VocaDB y vista previa de audio.",
      "Las vistas previas de audio de marcadores respetan el volumen configurado y muestran el tiempo de reproducci-n.",
      "Si una miniatura guardada cae en un placeholder de baja calidad, el juego intenta otras opciones de portada.",
      "Las respuestas con el productor y la voz principal correctos aparecen como coincidencia fuerte.",
      "Se a-adi- coincidencia de voz cuando la cancion elegida comparte la voz principal con la respuesta.",
      "Las coincidencias fuerte, de artista y de voz se muestran con colores distintos en historial, resumen y resultados compartidos.",
      "Las versiones distintas con el mismo titulo ya no quedan bloqueadas solo por compartir nombre.",
    ],
  },
  "v1.2": {
    version: "Version v1.2",
    intro: "Esta actualizaci-n ampl-a el pool de canciones y a-ade mas feedback para respuestas parciales.",
    items: [
      "Se a-adieron nuevas canciones jugables al pool.",
      "Las coincidencias de artista ahora dan cr-dito parcial cuando el productor coincide con la cancion correcta.",
      "Las coincidencias de artista se muestran en amarillo en el historial, los cuadros de intento y el resultado compartido.",
      "El signo de interrogaci-n de la portada cambia de color seg-n el -ltimo estado: blanco, rojo, amarillo o gris.",
      "Se a-adieron estadisticas locales por ano de publicaci-n, incluyendo mejor ano y ano mas jugado.",
      "Se a-adieron nuevos logros secretos.",
    ],
  },
  "v1.1": {
    version: "Version v1.1",
    intro: "Esta actualizaci-n ampl-a estadisticas, progreso personal, logros y herramientas de respaldo.",
    items: [
      "Se a-adi- un sistema local de logros con categorias generales, diarias, ilimitadas, archivo, conocimiento, reto y secreto.",
      "Se a-adi- un modal completo de clasificaciones globales con pesta-as de popularidad, dificultad y media de intentos.",
      "Se ampliaron las estadisticas personales con aciertos al primer intento, aciertos raros, progreso del archivo y progreso de logros.",
      "Se a-adi- un perfil copiable sin cuentas, usando solo datos locales.",
      "Tras resolver un puzle, el juego compara tu resultado con la media global.",
      "Se a-adieron exportaci-n e importaci-n de estadisticas locales.",
      "El calendario del archivo muestra mas informacion de progreso y resultados.",
      "El modo ilimitado guarda historial reciente para consultar desde estadisticas.",
    ],
  },
  "v1.0": {
    version: "Lanzamiento oficial v1.0",
    intro: "El primer lanzamiento publico reune el juego diario, el archivo y las funciones comunitarias b-sicas.",
    items: [
      "Archivo diario con puzles anteriores jugables y resumen mensual.",
      "Puzle aleatorio del archivo para jugar diarios antiguos sin elegir una fecha.",
      "Estadisticas globales de canciones, tasas de acierto e intentos medios.",
      "Creditos del pool de canciones e informacion de VocaDB.",
      "Formularios para sugerir canciones y reportar problemas.",
      "Soporte de interfaz en ingl-s, japon-s, coreano y espanol.",
      "Dise-o retro inspirado en NicoNico, autocompletado mejorado y audio alojado en Cloudflare.",
    ],
  },
};

const ACHIEVEMENTS = [
  {
    id: "first_solve",
    category: "general",
    hidden: false,
    title: {
      en: "First Clear",
      jp: "初クリア",
    },
    description: {
      en: "Solve any puzzle.",
      jp: "いずれかのパズルを正解する。",
    },
  },
  {
    id: "first_try",
    category: "general",
    hidden: false,
    title: {
      en: "Instant Recognition",
      jp: "即答",
    },
    description: {
      en: "Solve a puzzle on the first try.",
      jp: "1回目の挑戦で正解する。",
    },
  },
  {
    id: "daily_streak_5",
    category: "daily",
    hidden: false,
    title: {
      en: "Regular Listener",
      jp: "5日連続シグナル",
    },
    description: {
      en: "Build a 5-day daily win streak.",
      jp: "デイリーで5日連続正解する。",
    },
  },
  {
    id: "daily_streak_10",
    category: "daily",
    hidden: false,
    title: {
      en: "Daily Commitment",
      jp: "放送習慣",
    },
    description: {
      en: "Build a 10-day daily win streak.",
      jp: "デイリーで10日連続正解する。",
    },
  },
  {
    id: "unlimited_10_wins",
    category: "unlimited",
    hidden: false,
    title: {
      en: "On Repeat",
      jp: "練習室",
    },
    description: {
      en: "Win 10 Unlimited puzzles.",
      jp: "無制限モードで10回正解する。",
    },
  },
  {
    id: "unlimited_50_wins",
    category: "unlimited",
    hidden: false,
    title: {
      en: "Smart Fan",
      jp: "深いローテーション",
    },
    description: {
      en: "Win 50 Unlimited puzzles.",
      jp: "無制限モードで50回正解する。",
    },
  },
  {
    id: "archive_first",
    category: "archive",
    hidden: false,
    title: {
      en: "Archive Opened",
      jp: "アーカイブ開封",
    },
    description: {
      en: "Play an Archive puzzle.",
      jp: "アーカイブパズルをプレイする。",
    },
  },
  {
    id: "archive_10_solved",
    category: "archive",
    hidden: false,
    title: {
      en: "Going Through the Archives",
      jp: "バックログリスナー",
    },
    description: {
      en: "Solve 10 Archive puzzles.",
      jp: "アーカイブパズルを10問正解する。",
    },
  },
  {
    id: "archive_month_complete",
    category: "archive",
    hidden: false,
    title: {
      en: "Month Complete",
      jp: "月間コンプリート",
    },
    description: {
      en: "Open every available puzzle in a month.",
      jp: "1か月分の利用可能なパズルをすべて開く。",
    },
  },
  {
    id: "rare_solve",
    category: "knowledge",
    hidden: false,
    title: {
      en: "Deep Cut",
      jp: "ディープカット",
    },
    description: {
      en: "Solve a song with a global solve rate under 20%.",
      jp: "グローバル正解率20%未満の曲を正解する。",
    },
  },
  {
    id: "rare_first_try",
    category: "knowledge",
    hidden: true,
    title: {
      en: "True Fan",
      jp: "シグナルロック",
    },
    description: {
      en: "Solve a rare song on the first try.",
      jp: "レアな曲を1回目で正解する。",
    },
  },
  {
    id: "no_skip_win",
    category: "challenge",
    hidden: false,
    title: {
      en: "Got It First Try",
      jp: "スキップ不要",
    },
    description: {
      en: "Solve a puzzle without using Skip.",
      jp: "スキップを使わずに正解する。",
    },
  },
  {
    id: "clutch_solve",
    category: "challenge",
    hidden: false,
    title: {
      en: "Squeaked By",
      jp: "ラストチャンス",
    },
    description: {
      en: "Solve a puzzle on the sixth try.",
      jp: "6回目の挑戦で正解する。",
    },
  },
  {
    id: "full_reveal",
    category: "challenge",
    hidden: true,
    title: {
      en: "I Knew That One",
      jp: "答えはそこにあった",
    },
    description: {
      en: "Reveal a puzzle after using all attempts.",
      jp: "すべての挑戦を使い切って答えを見る。",
    },
  },
  // ── NEW ACHIEVEMENTS ──
  {
    id: "daily_played_30",
    category: "daily",
    hidden: false,
    title: {
      en: "Habit",
      jp: "習慣",
    },
    description: {
      en: "Play 30 daily puzzles.",
      jp: "デイリーパズルを30回プレイする。",
    },
  },
  {
    id: "daily_streak_30",
    category: "daily",
    hidden: false,
    title: {
      en: "Committed",
      jp: "30日連続",
    },
    description: {
      en: "Build a 30-day daily win streak.",
      jp: "デイリーで30日連続正解する。",
    },
  },
  {
    id: "daily_win_rate_90",
    category: "daily",
    hidden: false,
    title: {
      en: "Sharp Ear",
      jp: "鋭い耳",
    },
    description: {
      en: "Reach a 90% win rate on daily puzzles (min. 10 played).",
      jp: "デイリーパズルの勝率90%以上（10回以上プレイ）。",
    },
  },
  {
    id: "unlimited_100_wins",
    category: "unlimited",
    hidden: false,
    title: {
      en: "Knowledge is Power",
      jp: "常連",
    },
    description: {
      en: "Win 100 Unlimited puzzles.",
      jp: "無制限モードで100回正解する。",
    },
  },
  {
    id: "unlimited_first_try_streak_3",
    category: "unlimited",
    hidden: true,
    title: {
      en: "Hot Streak",
      jp: "連続即答",
    },
    description: {
      en: "Solve 3 Unlimited puzzles in a row on the first try.",
      jp: "無制限モードで3連続1回正解する。",
    },
  },
  {
    id: "archive_25_solved",
    category: "archive",
    hidden: false,
    title: {
      en: "Deep in the Vault",
      jp: "アーカイブ25問",
    },
    description: {
      en: "Solve 25 Archive puzzles.",
      jp: "アーカイブパズルを25問正解する。",
    },
  },
  {
    id: "archive_2_months_complete",
    category: "archive",
    hidden: false,
    title: {
      en: "Completionist",
      jp: "コンプリート2か月",
    },
    description: {
      en: "Complete every puzzle in 2 different months.",
      jp: "2か月分のパズルをすべてクリアする。",
    },
  },
  {
    id: "knowledge_very_rare_solve",
    category: "knowledge",
    hidden: false,
    title: {
      en: "Obscure Taste",
      jp: "超レア正解",
    },
    description: {
      en: "Solve a song with a global solve rate under 10%.",
      jp: "グローバル正解率10%未満の曲を正解する。",
    },
  },
  {
    id: "knowledge_100_unique",
    category: "knowledge",
    hidden: false,
    title: {
      en: "Extensive Library",
      jp: "100曲制覇",
    },
    description: {
      en: "Solve 100 different songs across all modes.",
      jp: "全モードで100種類の曲を正解する。",
    },
  },
  {
    id: "challenge_no_wrong",
    category: "challenge",
    hidden: false,
    title: {
      en: "Clean Sheet",
      jp: "ノーミス",
    },
    description: {
      en: "Solve a puzzle without any wrong guesses.",
      jp: "一度も間違えずに正解する。",
    },
  },
  {
    id: "challenge_perfect_daily_week",
    category: "challenge",
    hidden: false,
    title: {
      en: "Perfect Week",
      jp: "完璧な1週間",
    },
    description: {
      en: "Solve 7 daily puzzles in a row on the first try.",
      jp: "デイリーパズルを7連続で1回正解する。",
    },
  },
  {
    id: "challenge_second_try",
    category: "challenge",
    hidden: false,
    title: {
      en: "Almost Instant",
      jp: "惜しい",
    },
    description: {
      en: "Solve a puzzle on the second try.",
      jp: "2回目の挑戦で正解する。",
    },
  },
  {
    id: "secret_play_midnight",
    category: "secret",
    hidden: true,
    title: {
      en: "Night Owl",
      jp: "夜型",
    },
    description: {
      en: "Play a puzzle between midnight and 4am.",
      jp: "深夜0時〜4時の間にパズルをプレイする。",
    },
  },
  {
    id: "secret_share_result",
    category: "secret",
    hidden: true,
    title: {
      en: "Tell Your Friends",
      jp: "シェアした",
    },
    description: {
      en: "Share your result.",
      jp: "結果をシェアする。",
    },
  },
  // ── NEW ACHIEVEMENTS ──
  {
    id: "daily_played_all_month",
    category: "daily",
    hidden: false,
    title: {
      en: "Perfect Attendance",
      jp: "皆勤賞",
    },
    description: {
      en: "Play every day for a full calendar month.",
      jp: "1か月間、毎日パズルをプレイする。",
    },
  },
  {
    id: "daily_bounce_back",
    category: "daily",
    hidden: false,
    title: {
      en: "Back at It",
      jp: "カムバック",
    },
    description: {
      en: "Play the day after losing a streak.",
      jp: "ストリークが途切れた翌日もプレイする。",
    },
  },
  {
    id: "unlimited_200_wins",
    category: "unlimited",
    hidden: false,
    title: {
      en: "No Life",
      jp: "廃人",
    },
    description: {
      en: "Win 200 Unlimited puzzles.",
      jp: "無制限モードで200回正解する。",
    },
  },
  {
    id: "unlimited_500_wins",
    category: "unlimited",
    hidden: false,
    title: {
      en: "This Is All I Do",
      jp: "これしかやってない",
    },
    description: {
      en: "Win 500 Unlimited puzzles.",
      jp: "無制限モードで500回正解する。",
    },
  },
  {
    id: "unlimited_quick_win",
    category: "unlimited",
    hidden: false,
    title: {
      en: "Speed Run",
      jp: "スピードクリア",
    },
    description: {
      en: "Win an Unlimited puzzle without ever letting the full clip play.",
      jp: "無制限モードでクリップを最後まで聴かずに正解する。",
    },
  },
  {
    id: "archive_50_solved",
    category: "archive",
    hidden: false,
    title: {
      en: "Going Way Back",
      jp: "大昔まで",
    },
    description: {
      en: "Solve 50 Archive puzzles.",
      jp: "アーカイブパズルを50問正解する。",
    },
  },
  {
    id: "knowledge_same_song_twice",
    category: "knowledge",
    hidden: false,
    title: {
      en: "Already Knew That One",
      jp: "また同じ曲",
    },
    description: {
      en: "Solve the same song in two different modes.",
      jp: "同じ曲を異なるモードで2回正解する。",
    },
  },
  {
    id: "knowledge_rare_5_solves",
    category: "knowledge",
    hidden: false,
    title: {
      en: "Consistently Obscure",
      jp: "一貫してマニア",
    },
    description: {
      en: "Solve 5 different songs each with a global solve rate under 20%.",
      jp: "グローバル正解率20%未満の曲を5種類正解する。",
    },
  },
  {
    id: "challenge_clutch_3",
    category: "challenge",
    hidden: false,
    title: {
      en: "Always Down to the Wire",
      jp: "いつもギリギリ",
    },
    description: {
      en: "Solve 3 puzzles on the sixth try.",
      jp: "6回目の挑戦で3回正解する。",
    },
  },
  {
    id: "secret_open_achievements",
    category: "secret",
    hidden: true,
    title: {
      en: "Achievement Hunter",
      jp: "実績コレクター",
    },
    description: {
      en: "Open the Achievements page.",
      jp: "実績ページを開く。",
    },
  },
  {
    id: "secret_switch_language",
    category: "secret",
    hidden: true,
    title: {
      en: "バイリンガル",
      jp: "Bilingual",
    },
    description: {
      en: "Switch the interface language.",
      jp: "インターフェース言語を切り替える。",
    },
  },
  {
    id: "secret_weekend_play",
    category: "secret",
    hidden: true,
    title: {
      en: "No Plans Today",
      jp: "休日も欠かさず",
    },
    description: {
      en: "Play a puzzle on a weekend.",
      jp: "週末にパズルをプレイする。",
    },
  },
  {
    id: "secret_daily_no_preview",
    category: "secret",
    hidden: true,
    title: {
      en: "Cheater?",
      jp: "チーター？",
    },
    description: {
      en: "Solve the daily puzzle without playing the audio preview.",
      jp: "音声プレビューを再生せずにデイリーパズルを正解する。",
    },
  },
  {
    id: "secret_senbonzakura",
    category: "secret",
    hidden: true,
    title: {
      en: "千本桜",
      jp: "千本桜",
    },
    description: {
      en: "Guess Senbonzakura correctly with bullet comments set to maximum.",
      jp: "弾幕コメントを最大にして「千本桜」に正解する。",
    },
  },
  {
    id: "secret_mikumiku_jp",
    category: "secret",
    hidden: true,
    title: {
      en: "みくみくにしてあげる♪",
      jp: "みくみくにしてあげる♪",
    },
    description: {
      en: "Guess Miku Miku ni Shite Ageru♪ while the interface language is Japanese.",
      jp: "インターフェース言語を日本語にして「みくみくにしてあげる♪」に正解する。",
    },
  },
  {
    id: "secret_top_50_hardest",
    category: "secret",
    hidden: true,
    title: {
      en: "Deep Cut Certified",
      jp: "難関常連",
    },
    description: {
      en: "Solve a song currently ranked in the top 50 hardest global songs.",
      jp: "グローバルランキングで難関上位50曲に入っている曲に正解する。",
    },
  },
  {
    id: "practice_first_clear",
    category: "unlimited",
    hidden: false,
    title: {
      en: "Practice Room",
      jp: "\u7DF4\u7FD2\u958B\u59CB",
    },
    description: {
      en: "Solve any Unlimited practice puzzle.",
      jp: "\u7121\u5236\u9650\u306E\u7DF4\u7FD2\u30D1\u30BA\u30EB\u30921\u554F\u6B63\u89E3\u3059\u308B\u3002",
    },
  },
  {
    id: "practice_all_tiers",
    category: "challenge",
    hidden: false,
    title: {
      en: "Across the Board",
      jp: "\u5168\u96E3\u6613\u5EA6\u5236\u8987",
    },
    description: {
      en: "Solve at least one practice puzzle in every difficulty tier.",
      jp: "\u3059\u3079\u3066\u306E\u96E3\u6613\u5EA6\u306E\u7DF4\u7FD2\u30D1\u30BA\u30EB\u30921\u554F\u4EE5\u4E0A\u6B63\u89E3\u3059\u308B\u3002",
    },
  },
  {
    id: "secret_unknown_first_try_10",
    category: "secret",
    hidden: true,
    title: {
      en: "Beyond the Unknown",
      jp: "\u672A\u77E5\u306E\u5965\u3078",
    },
    description: {
      en: "Solve 10 ??? practice puzzles in a row on the first try.",
      jp: "??? \u7DF4\u7FD2\u309210\u9023\u7D9A\u30671\u56DE\u6B63\u89E3\u3059\u308B\u3002",
    },
  },
];

const ACHIEVEMENT_KO = {
  first_solve: ["첫 클리어", "어떤 퍼즐이든 하나 해결하기."],
  first_try: ["즉시 인식", "첫 번째 시도에 퍼즐 해결하기."],
  daily_streak_5: ["꾸준한 리스너", "데일리 5일 연속 정답 기록 만들기."],
  daily_streak_10: ["데일리 약속", "데일리 10일 연속 정답 기록 만들기."],
  unlimited_10_wins: ["반복 재생", "무제한 퍼즐 10회 승리."],
  unlimited_50_wins: ["똑똑한 팬", "무제한 퍼즐 50회 승리."],
  archive_first: ["아카이브 개봉", "아카이브 퍼즐 플레이하기."],
  archive_10_solved: ["아카이브 탐색", "아카이브 퍼즐 10개 해결하기."],
  archive_month_complete: ["한 달 완료", "한 달의 이용 가능한 모든 퍼즐 열기."],
  rare_solve: ["딥 컷", "글로벌 정답률 20% 미만의 곡 해결하기."],
  rare_first_try: ["진짜 팬", "희귀한 곡을 첫 번째 시도에 해결하기."],
  no_skip_win: ["첫 귀에 알았다", "스킵 없이 퍼즐 해결하기."],
  clutch_solve: ["아슬아슬", "여섯 번째 시도에 퍼즐 해결하기."],
  full_reveal: ["그거 아는 곡이었는데", "모든 시도를 사용한 뒤 퍼즐 정답 공개하기."],
  daily_played_30: ["습관", "데일리 퍼즐 30회 플레이."],
  daily_streak_30: ["헌신", "데일리 30일 연속 정답 기록 만들기."],
  daily_win_rate_90: ["날카로운 귀", "데일리 퍼즐 승률 90% 달성(최소 10회 플레이)."],
  unlimited_100_wins: ["아는 것이 힘", "무제한 퍼즐 100회 승리."],
  unlimited_first_try_streak_3: ["뜨거운 연속 기록", "무제한 퍼즐 3개를 연속으로 첫 번째 시도에 해결하기."],
  archive_25_solved: ["금고 깊숙이", "아카이브 퍼즐 25개 해결하기."],
  archive_2_months_complete: ["완주자", "서로 다른 2개월의 모든 퍼즐 완료하기."],
  knowledge_very_rare_solve: ["마이너 취향", "글로벌 정답률 10% 미만의 곡 해결하기."],
  knowledge_100_unique: ["방대한 라이브러리", "모든 모드에서 서로 다른 곡 100개 해결하기."],
  challenge_no_wrong: ["무실점", "오답 없이 퍼즐 해결하기."],
  challenge_perfect_daily_week: ["완벽한 일주일", "데일리 퍼즐 7개를 연속으로 첫 번째 시도에 해결하기."],
  challenge_second_try: ["거의 즉답", "두 번째 시도에 퍼즐 해결하기."],
  secret_play_midnight: ["올빼미형", "자정부터 새벽 4시 사이에 퍼즐 플레이하기."],
  secret_share_result: ["친구에게 알리기", "결과 공유하기."],
  daily_played_all_month: ["개근", "한 달 동안 매일 퍼즐 플레이하기."],
  daily_bounce_back: ["다시 시작", "연속 기록을 잃은 다음 날 플레이하기."],
  unlimited_200_wins: ["현생 없음", "무제한 퍼즐 200회 승리."],
  unlimited_500_wins: ["이것만 하고 있음", "무제한 퍼즐 500회 승리."],
  unlimited_quick_win: ["스피드런", "전체 클립을 끝까지 듣지 않고 무제한 퍼즐 승리하기."],
  archive_50_solved: ["먼 과거까지", "아카이브 퍼즐 50개 해결하기."],
  knowledge_same_song_twice: ["이미 알고 있던 곡", "같은 곡을 서로 다른 모드에서 두 번 해결하기."],
  knowledge_rare_5_solves: ["꾸준히 마이너", "글로벌 정답률 20% 미만의 서로 다른 곡 5개 해결하기."],
  challenge_clutch_3: ["항상 끝까지", "여섯 번째 시도에 퍼즐 3개 해결하기."],
  secret_open_achievements: ["업적 사냥꾼", "업적 페이지 열기."],
  secret_switch_language: ["바이링구얼", "인터페이스 언어 바꾸기."],
  secret_weekend_play: ["오늘 약속 없음", "주말에 퍼즐 플레이하기."],
  secret_senbonzakura: ["천본앵", "탄막 댓글을 최대로 설정하고 천본앵 맞히기."],
  secret_mikumiku_jp: ["미쿠미쿠하게 해줄게♪", "인터페이스 언어를 일본어로 설정한 상태에서 미쿠미쿠하게 해줄게♪ 맞히기."],
  secret_top_50_hardest: ["딥 컷 인증", "현재 글로벌 어려운 곡 상위 50위 안의 곡 해결하기."],
  practice_first_clear: ["연습실", "무제한 연습 퍼즐 하나 해결하기."],
  practice_all_tiers: ["전 구간 제패", "모든 난이도 티어에서 연습 퍼즐을 하나 이상 해결하기."],
  secret_unknown_first_try_10: ["미지의 너머", "??? 연습 퍼즐 10개를 연속으로 첫 번째 시도에 해결하기."],
};

const ACHIEVEMENT_ES = {
  first_solve: ["Primer clear", "Resuelve cualquier puzle."],
  first_try: ["Reconocimiento instant-neo", "Resuelve un puzle al primer intento."],
  daily_streak_5: ["Oyente constante", "Consigue una racha diaria de 5 victorias."],
  daily_streak_10: ["Compromiso diario", "Consigue una racha diaria de 10 victorias."],
  unlimited_10_wins: ["En repetici-n", "Gana 10 puzles ilimitados."],
  unlimited_50_wins: ["Fan con memoria", "Gana 50 puzles ilimitados."],
  archive_first: ["Archivo abierto", "Juega un puzle de archivo."],
  archive_10_solved: ["Revisando el archivo", "Resuelve 10 puzles de archivo."],
  archive_month_complete: ["Mes completo", "Abre todos los puzles disponibles de un mes."],
  rare_solve: ["Corte profundo", "Resuelve una cancion con menos de 20% de acierto global."],
  rare_first_try: ["Fan de verdad", "Resuelve una cancion rara al primer intento."],
  no_skip_win: ["Sin saltos", "Resuelve un puzle sin usar Saltar."],
  clutch_solve: ["Por los pelos", "Resuelve un puzle en el sexto intento."],
  full_reveal: ["Yo s- la conoc-a", "Revela un puzle despues de usar todos los intentos."],
  daily_played_30: ["H-bito", "Juega 30 puzles diarios."],
  daily_streak_30: ["Constancia", "Consigue una racha diaria de 30 victorias."],
  daily_win_rate_90: ["O-do fino", "Alcanza 90% de victorias en diarios (m-nimo 10 jugados)."],
  unlimited_100_wins: ["El saber es poder", "Gana 100 puzles ilimitados."],
  unlimited_first_try_streak_3: ["Racha encendida", "Resuelve 3 puzles ilimitados seguidos al primer intento."],
  archive_25_solved: ["Dentro de la b-veda", "Resuelve 25 puzles de archivo."],
  archive_2_months_complete: ["Completista", "Completa todos los puzles de 2 meses distintos."],
  knowledge_very_rare_solve: ["Gusto oscuro", "Resuelve una cancion con menos de 10% de acierto global."],
  knowledge_100_unique: ["Biblioteca extensa", "Resuelve 100 canciones distintas entre todos los modos."],
  challenge_no_wrong: ["Hoja limpia", "Resuelve un puzle sin intentos incorrectos."],
  challenge_perfect_daily_week: ["Semana perfecta", "Resuelve 7 diarios seguidos al primer intento."],
  challenge_second_try: ["Casi instant-neo", "Resuelve un puzle en el segundo intento."],
  secret_play_midnight: ["Ave nocturna", "Juega un puzle entre medianoche y las 4 a. m."],
  secret_share_result: ["Cu-ntaselo a tus amigos", "Comparte tu resultado."],
  daily_played_all_month: ["Asistencia perfecta", "Juega todos los dias durante un mes calendario completo."],
  daily_bounce_back: ["De vuelta", "Juega al dia siguiente de perder una racha."],
  unlimited_200_wins: ["Sin vida", "Gana 200 puzles ilimitados."],
  unlimited_500_wins: ["Esto es todo lo que hago", "Gana 500 puzles ilimitados."],
  unlimited_quick_win: ["Speedrun", "Gana un puzle ilimitado sin dejar que suene el clip completo."],
  archive_50_solved: ["Hasta el fondo", "Resuelve 50 puzles de archivo."],
  knowledge_same_song_twice: ["Ya me la sab-a", "Resuelve la misma cancion en dos modos distintos."],
  knowledge_rare_5_solves: ["Siempre de nicho", "Resuelve 5 canciones distintas con menos de 20% de acierto global."],
  challenge_clutch_3: ["Siempre al limite", "Resuelve 3 puzles en el sexto intento."],
  secret_open_achievements: ["Cazalogros", "Abre la p-gina de logros."],
  secret_switch_language: ["Bilingue", "Cambia el idioma de la interfaz."],
  secret_weekend_play: ["Sin planes hoy", "Juega un puzle durante el fin de semana."],
  secret_senbonzakura: ["Senbonzakura", "Acierta Senbonzakura con los comentarios danmaku al m-ximo."],
  secret_mikumiku_jp: ["Miku Miku ni Shite Ageru♪", "Acierta Miku Miku ni Shite Ageru♪ con la interfaz en japon-s."],
  secret_top_50_hardest: ["Deep cut certificado", "Resuelve una cancion que esta entre las 50 mas difaciles globales."],
  practice_first_clear: ["Sala de practica", "Resuelve cualquier puzle de practica ilimitada."],
  practice_all_tiers: ["De lado a lado", "Resuelve al menos un puzle de practica en cada dificultad."],
  secret_unknown_first_try_10: ["Mas all- de lo desconocido", "Resuelve 10 puzles de practica ??? seguidos al primer intento."],
};

ACHIEVEMENT_KO.secret_daily_no_preview = ["Cheater?", "Solve the daily puzzle without playing the audio preview."];
ACHIEVEMENT_ES.secret_daily_no_preview = ["-Trampa?", "Resuelve el puzle diario sin reproducir la vista previa de audio."];

ACHIEVEMENTS.forEach((achievement) => {
  const ko = ACHIEVEMENT_KO[achievement.id];
  if (ko) {
    achievement.title.ko = ko[0];
    achievement.description.ko = ko[1];
  }
  const es = ACHIEVEMENT_ES[achievement.id];
  if (es) {
    achievement.title.es = es[0];
    achievement.description.es = es[1];
  }
});

const achievementById = new Map(ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]));
const achievementToastQueue = [];
let achievementToastActive = false;

function getLang() {
  return localStorage.getItem("vh-lang") || "en";
}

function getDateLocale() {
  const lang = getLang();
  if (lang === "jp") return "ja-JP";
  if (lang === "ko") return "ko-KR";
  if (lang === "es") return "es-ES";
  return "en-US";
}

function t(key, ...args) {
  const lang = getLang();
  const val = STRINGS[lang]?.[key] ?? STRINGS.en[key];
  return typeof val === "function" ? val(...args) : val;
}

function getDifficultyLabel(key = "all") {
  const map = {
    all: "difficultyAll",
    free: "difficultyFreeShort",
    easy: "difficultyEasyShort",
    medium: "difficultyMediumShort",
    hard: "difficultyHardShort",
    unknown: "difficultyUnknownShort",
  };
  return t(map[key] || "difficultyAll");
}

function getDifficultyPracticeLabel(key = "all") {
  const label = getDifficultyLabel(key);
  return getLang() === "jp" ? label : label.toLowerCase();
}

function isUnlimitedPracticeMode() {
  return state.mode === "unlimited" && state.unlimitedDifficulty !== "all";
}

function getUnlimitedModeStatusNote() {
  if (hasActiveUnlimitedFilters()) return t("difficultyPracticeNote");
  return state.unlimitedDifficulty === "all" ? t("difficultyAllNote") : t("difficultyPracticeNote");
}

function rememberCurrentMode() {
  try {
    sessionStorage.setItem(sessionModeKey, state.mode || "daily");
    sessionStorage.setItem(sessionDifficultyKey, state.unlimitedDifficulty || "all");
  } catch {
    // Session storage is only a convenience for same-tab refresh behavior.
  }
}

function getRememberedSessionMode() {
  try {
    return {
      mode: sessionStorage.getItem(sessionModeKey) || "",
      difficulty: sessionStorage.getItem(sessionDifficultyKey) || "all",
    };
  } catch {
    return { mode: "", difficulty: "all" };
  }
}

function renderReleaseNotes() {
  const lang = getLang();
  const notes = RELEASE_NOTES[lang]?.[currentReleaseVersion] || RELEASE_NOTES.en[currentReleaseVersion];
  const versionEl = document.querySelector("#release-version");
  const introEl = document.querySelector("#release-intro");
  const listEl = document.querySelector(".release-list");

  if (versionEl) versionEl.textContent = notes.version;
  if (introEl) introEl.textContent = notes.intro;
  if (listEl) {
    listEl.innerHTML = notes.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  document.querySelectorAll(".release-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.releaseVersion === currentReleaseVersion);
  });
}

function hasJapanese(str) {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(str);
}

function hasKorean(str) {
  return /[\uac00-\ud7af]/.test(str);
}

function getJpTitle(song) {
  const jpTitle = (song.acceptedTitles || []).find(hasJapanese);
  return jpTitle || song.title;
}

function getKrTitle(song) {
  const krTitle = (song.acceptedTitles || []).find(hasKorean);
  return krTitle || song.title;
}

// Truncate long titles with ellipsis to keep layouts from breaking.
// Used at render sites where overflow causes visual problems (rankings, toasts).
// NOT applied to autocomplete or guess matching - those need full titles.
function truncateTitle(title, max = 40) {
  if (!title) return "";
  return title.length > max ? title.slice(0, max - 1).trimEnd() + "-" : title;
}

function getDisplayTitle(song) {
  const titleMode = localStorage.getItem("vh-title-mode") || "en";
  if (titleMode === "jp") return getJpTitle(song);
  if (titleMode === "kr") return getKrTitle(song);
  if (titleMode === "en") {
    // if en mode but lang is jp, still show EN title
    return song.title;
  }
  // fallback: if no explicit mode, follow language
  if (getLang() === "jp") return getJpTitle(song);
  if (getLang() === "ko") return getKrTitle(song);
  return song.title;
}

function refreshTitleSurfaces() {
  Object.keys(rankingsCache).forEach((key) => {
    rankingsCache[key] = null;
  });

  render();

  if (state.isComplete) {
    revealAnswer();
  }

  if (!suggestionList.hidden && guessInput.value.trim()) {
    renderSuggestions();
  }

  loadSidebarRankings(currentSbTab);
  if (activeModal?.id === "rankings") {
    loadModalRankings(currentModalTab);
  }
  if (activeModal?.id === "bookmarks") {
    renderBookmarks();
  }
}

function applyLanguage() {
  const lang = getLang();
  document.documentElement.lang = lang === "jp" ? "ja" : lang === "ko" ? "ko" : lang === "es" ? "es" : "en";

  // flag buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });

  const set = (sel, key, ...args) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = t(key, ...args);
  };
  const setSidebarHeader = (sel, key) => {
    const el = document.querySelector(sel);
    if (el) {
      el.innerHTML = `<span class="sb-hbracket">[</span>${escapeHtml(t(key))}<span class="sb-hbracket">]</span>`;
    }
  };

  // game UI
  set("#guess-input-label", "songTitle");
  set("#submit-button-text", "submit");
  set("#skip-button", "skip");
  set("#give-up-button", "giveUp");
  set("#next-button", "nextSong");
  set("#copy-result-button-text", "copyResult");
  const videoBracketLabel = document.querySelector("#video-bracket-label");
  if (videoBracketLabel) videoBracketLabel.textContent = t("videoBracket");
  const videoTitleLabel = document.querySelector("#video-title-label");
  if (videoTitleLabel) videoTitleLabel.textContent = t("videoOpeningClip");
  const videoMetaLabels = document.querySelectorAll(".nnd-meta-row .nnd-meta-label");
  if (videoMetaLabels[0]) videoMetaLabels[0].textContent = t("metaViewsBracket");
  if (videoMetaLabels[1]) videoMetaLabels[1].textContent = t("metaCategoryBracket");
  if (videoMetaLabels[2]) videoMetaLabels[2].textContent = t("metaSourceBracket");
  const mylistItem = document.querySelector(".nnd-meta-row .nnd-meta-item:nth-child(3)");
  if (mylistItem && !mylistItem.querySelector(".nnd-meta-label")) {
    const mylistLabel = document.createElement("span");
    mylistLabel.className = "nnd-meta-label";
    mylistLabel.id = "meta-mylist-label";
    mylistItem.prepend(mylistLabel, " ");
  }
  const mylistLabel = document.querySelector("#meta-mylist-label");
  if (mylistLabel) mylistLabel.textContent = t("metaMylistBracket");
  const historyTitle = document.querySelector(".guess-history h3");
  if (historyTitle) historyTitle.textContent = `${t("logBracket")} ${t("pastGuesses")}`;
  set(".nnd-marquee-inner", "marquee");
  set(".intro-copy", "introCopy");
  const clipNote = document.querySelector(".clip-note");
  if (clipNote) clipNote.textContent = t("disclaimer");

  // breadcrumb
  const breadcrumb = document.querySelector(".nnd-breadcrumb");
  if (breadcrumb) breadcrumb.textContent = t("breadcrumb");

  // sidebar
  set(".sb-played-label", "played");
  set(".sb-won-label", "won");
  set(".sb-winrate-label", "winRate");
  set(".sb-streak-label", "streak");
  set(".sb-best-label", "bestStreak");
  set(".sb-avg-label", "sbAvgAttempts");
  set(".sb-total-label", "songsInPool");
  set(".sidebar-link.full-stats", "viewFullStats");
  setSidebarHeader(".sb-difficulty-header", "sidebarDifficulty");
  setSidebarHeader(".sb-archive-header", "sidebarArchive");
  setSidebarHeader(".sb-milestones-header", "sidebarMilestones");
  setSidebarHeader(".sb-visitors-header", "sidebarVisitors");
  setSidebarHeader(".sb-news-header", "sidebarNews");
  setSidebarHeader(".sb-howtoplay-header", "howToPlay");
  setSidebarHeader(".sb-hallofmyths-header", "hallOfMyths");
  setSidebarHeader(".sb-rankings-header", "rankingsHeader");
  setSidebarHeader(".sb-links-header", "links");
  set(".sb-diff-free-label", "difficultyFreeShort");
  set(".sb-diff-easy-label", "difficultyEasyShort");
  set(".sb-diff-medium-label", "difficultyMediumShort");
  set(".sb-diff-hard-label", "difficultyHardShort");
  set(".sb-archive-solved-label", "archiveSummarySolved");
  set(".sb-archive-total-label", "sidebarTotal");
  set(".sb-archive-progress-label", "statsArchiveProgress");
  set(".sidebar-hof-note", "hofNote");
  set(".sidebar-hof-footer", "hofNote");
  set(".ms-fame-label", "milestoneHallOfFame");
  set(".ms-legends-label", "milestoneHallOfLegends");
  set(".ms-myths-label", "milestoneHallOfMyths");
  set(".sidebar-milestones-footer", "milestoneFooter");
  set(".visitor-total-label", "visitorTotal");
  set(".visitor-since-label", "visitorSince");
  set(".news-v15", "newsV15");
  set(".news-v14", "newsV14");
  set(".news-v13", "newsV13");
  set(".news-v12", "newsV12");
  set(".news-v11", "newsV11");

  // sidebar how to play steps
  const steps = document.querySelectorAll(".nnd-sidebar-howto p");
  const stepKeys = ["howToPlayStep1","howToPlayStep2","howToPlayStep3","howToPlayStep4","howToPlayStep5"];
  steps.forEach((p, i) => {
    if (stepKeys[i]) {
      const num = p.querySelector(".how-num");
      p.textContent = "";
      if (num) p.appendChild(num);
      const text = document.createElement("span");
      text.className = "how-text";
      text.textContent = t(stepKeys[i]);
      p.appendChild(text);
    }
  });

  // mode buttons
  const daily = document.querySelector("#daily-mode-button");
  const unlimited = document.querySelector("#unlimited-mode-button");
  const archive = document.querySelector("#archive-mode-button");
  if (daily) daily.childNodes[0].textContent = t("daily") + " ";
  if (unlimited) unlimited.textContent = t("unlimited");
  if (archive) archive.textContent = t("archive");
  difficultyModeButtons.forEach((button) => {
    const key = button.dataset.unlimitedDifficulty || "all";
    const countEl = button.querySelector("[data-difficulty-count]");
    button.childNodes[0].textContent = getDifficultyLabel(key) + " ";
    if (countEl) button.appendChild(countEl);
  });
  statsDifficultyButtons.forEach((button) => {
    button.textContent = getDifficultyLabel(button.dataset.statsDifficulty || "all");
  });
  if (difficultyPracticeNote) {
    difficultyPracticeNote.textContent = getUnlimitedModeStatusNote();
  }
  if (unlimitedFilterButton) {
    const count = getActiveFilterCount();
    unlimitedFilterButton.textContent = count > 0 ? t("filterButtonCount", count) : t("filterButton");
  }
  renderFilterTags();

  // input placeholder
  if (guessInput) guessInput.placeholder = t("placeholder");

  // cover caption if not complete
  if (!state.isComplete) {
    if (coverCaption) coverCaption.textContent = t("coverCaption");
  }
  renderSourceTags();

  // modals
  set("#how-to-play-title", "modalHowToPlayTitle");
  set("#about-title", "modalAboutTitle");
  set("#support-title", "modalSupportTitle");
  const releaseTitle = document.querySelector("#release-notes-title");
  if (releaseTitle) releaseTitle.textContent = `${t("modalUpdatePrefix")} ${t("modalReleaseTitle")}`;
  renderReleaseNotes();
  const songPoolTitle = document.querySelector("#song-pool-title");
  if (songPoolTitle) songPoolTitle.textContent = `${t("modalSourcePrefix")} ${t("modalSongPoolTitle")}`;
  set("#suggest-song-title", "modalSuggestTitle");
  set("#report-issue-title", "modalReportTitle");
  set("#stats-title", "modalStatsTitle");
  set("#achievements-title", "modalAchievementsTitle");
  set("#achievement-search-label", "achievementSearchLabel");
  const achievementSearchInputEl = document.querySelector("#achievement-search-input");
  if (achievementSearchInputEl) achievementSearchInputEl.placeholder = t("achievementSearchPlaceholder");
  const bookmarksTitle = document.querySelector("#bookmarks-title");
  if (bookmarksTitle) bookmarksTitle.textContent = `${t("modalMylistPrefix")} ${t("modalBookmarksTitle")}`;
  set("#bookmarks-intro", "bookmarksIntro");
  const bookmarksSearchInputEl = document.querySelector("#bookmarks-search-input");
  if (bookmarksSearchInputEl) bookmarksSearchInputEl.placeholder = t("bookmarksSearchPlaceholder");
  set("#settings-title", "settingsTitle");
  set("#stats-daily-button", "modalStatsDailyBtn");
  set("#stats-unlimited-button", "modalStatsUnlimitedBtn");
  set("#stats-filtered-button", "modalStatsFilteredBtn");
  set("#unlimited-filters-title", "filterModalTitle");
  set("#unlimited-filters-note", "filterModalNote");
  const filterWarningText = document.querySelector("#unlimited-filter-warning span");
  if (filterWarningText) filterWarningText.textContent = t("filterWarning");
  set("#filter-producer-label", "filterProducerLabel");
  set("#filter-voicebank-label", "filterVoicebankLabel");
  const filterProducerInputEl = document.querySelector("#filter-producer-input");
  if (filterProducerInputEl) filterProducerInputEl.placeholder = t("filterProducerPlaceholder");
  const filterVoicebankInputEl = document.querySelector("#filter-voicebank-input");
  if (filterVoicebankInputEl) filterVoicebankInputEl.placeholder = t("filterVoicebankPlaceholder");
  set("#filter-program-label", "filterProgramLabel");
  set("#filter-year-label", "filterYearLabel");
  set("#filter-community-label", "filterCommunityLabel");
  set("#filter-new-songs-label", "filterNewSongsLabel");
  set("#filter-inclusive-label", "filterInclusiveLabel");
  set("#filter-options-label", "filterOptionsLabel");
  set("#filter-year-status-label", "filterYearStatusLabel");
  set("#filter-match-label", "filterMatchLabel");
  set("#filter-clear-button", "filterClear");
  set("#filter-apply-button", "filterApply");
  set("#stats-section-distribution", "statsSectionDistribution");
  set("#stats-section-overview", "statsSectionOverview");
  set("#stats-section-detail", "statsSectionDetail");
  set("#stats-copy-profile", "statsCopyProfile");

  // stats modal grid labels
  const statLabels = document.querySelectorAll(".stats-grid span");
  const statLabelKeys = ["statsPlayed","statsWon","statsWinRate","statsCurrentStreak","statsMaxStreak","statsAvgAttempts"];
  statLabels.forEach((el, i) => { if (statLabelKeys[i]) el.textContent = t(statLabelKeys[i]); });

  // how to play modal
  const htpPs = document.querySelectorAll("#how-to-play .instruction-list p");
  if (htpPs[0]) htpPs[0].lastChild.textContent = t("modalHowToPlayP1");
  if (htpPs[1]) htpPs[1].lastChild.textContent = t("modalHowToPlayP2");
  if (htpPs[2]) htpPs[2].lastChild.textContent = t("modalHowToPlayP3");
  const htpPlay = document.querySelector("#how-to-play .modal-action");
  if (htpPlay) htpPlay.textContent = t("modalHowToPlayPlay");

  // about modal
  const aboutPs = document.querySelectorAll("#about p");
  if (aboutPs[0]) aboutPs[0].textContent = t("modalAboutP1");
  if (aboutPs[1]) aboutPs[1].textContent = t("modalAboutP2");

  // support modal
  const supportPs = document.querySelectorAll("#support p");
  if (supportPs[0]) supportPs[0].textContent = t("modalSupportP1");
  if (supportPs[1]) {
    supportPs[1].textContent = t("modalSupportP2") + " ";
    const emailLink = document.createElement("a");
    emailLink.href = "mailto:kzen@sodapines.dev";
    emailLink.textContent = "kzen@sodapines.dev";
    supportPs[1].appendChild(emailLink);
  }
  if (supportPs[2]) supportPs[2].textContent = t("modalSupportP3");
  // song pool / contribution modals
  const songPoolSummary = document.querySelector("#song-pool-summary");
  if (songPoolSummary) songPoolSummary.textContent = t("modalSongPoolSummary");
  const songPoolCount = document.querySelector("#song-pool-count");
  if (songPoolCount) songPoolCount.textContent = songs.length.toLocaleString();
  const infoLabels = document.querySelectorAll("#song-pool dt");
  const infoValues = document.querySelectorAll("#song-pool dd");
  const infoLabelKeys = ["modalSongPoolTotal", "modalSongPoolSources", "modalSongPoolCredit"];
  infoLabels.forEach((el, i) => { if (infoLabelKeys[i]) el.textContent = t(infoLabelKeys[i]); });
  if (infoValues[1]) infoValues[1].textContent = t("modalSongPoolSourcesValue");
  const songPoolFinePrint = document.querySelector("#song-pool .fine-print");
  if (songPoolFinePrint) songPoolFinePrint.textContent = t("modalSongPoolDisclaimer");
  const suggestIntro = document.querySelector("#suggest-song > p");
  if (suggestIntro) suggestIntro.textContent = t("modalSuggestIntro");
  set("#suggest-check-title", "modalSuggestCheckTitle");
  set("#suggest-check-intro", "modalSuggestCheckIntro");
  set("#suggest-check-label", "modalSuggestCheckLabel");
  if (suggestCheckInput) suggestCheckInput.placeholder = t("modalSuggestCheckPlaceholder");
  renderSuggestCheckResults();
  // suggest-song form labels
  const sLabelTitle = document.querySelector("#suggest-label-title");
  if (sLabelTitle) { sLabelTitle.firstChild.textContent = t("modalSuggestLabelTitle") + " "; }
  const sLabelProducer = document.querySelector("#suggest-label-producer");
  if (sLabelProducer) { sLabelProducer.firstChild.textContent = t("modalSuggestLabelProducer") + " "; }
  const sLabelVocal = document.querySelector("#suggest-label-vocal");
  if (sLabelVocal) { sLabelVocal.firstChild.textContent = t("modalSuggestLabelVocal") + " "; }
  const sLabelVocadb = document.querySelector("#suggest-label-vocadb");
  if (sLabelVocadb) { sLabelVocadb.firstChild.textContent = t("modalSuggestLabelVocadb") + " "; }
  const sLabelSource = document.querySelector("#suggest-label-source");
  if (sLabelSource) { sLabelSource.firstChild.textContent = t("modalSuggestLabelSource") + " "; }
  const sLabelReason = document.querySelector("#suggest-label-reason");
  if (sLabelReason) { sLabelReason.firstChild.textContent = t("modalSuggestLabelReason") + " "; }
  const sSubmitBtn = document.querySelector("#suggest-submit-btn");
  if (sSubmitBtn) sSubmitBtn.textContent = t("modalSuggestSubmit");
  const reportIntro = document.querySelector("#report-context");
  if (reportIntro && !state.puzzle) reportIntro.textContent = t("modalReportIntro");
  // report-issue form labels and options
  const rLabelReason = document.querySelector("#report-label-reason");
  if (rLabelReason) { rLabelReason.firstChild.textContent = t("modalReportLabelReason") + "\n          "; }
  const rLabelDetails = document.querySelector("#report-label-details");
  if (rLabelDetails) { rLabelDetails.firstChild.textContent = t("modalReportLabelDetails") + " "; }
  const reportDetails = document.querySelector("#report-details");
  if (reportDetails) reportDetails.placeholder = t("modalReportDetailPlaceholder");
  const rSubmitBtn = document.querySelector("#report-submit-btn");
  if (rSubmitBtn) rSubmitBtn.textContent = t("modalReportSubmit");
  const reportOptIds = [
    ["report-opt-metadata", "modalReportOptMetadata"],
    ["report-opt-audio",    "modalReportOptAudio"],
    ["report-opt-source",   "modalReportOptSource"],
    ["report-opt-duplicate","modalReportOptDuplicate"],
    ["report-opt-startpoint","modalReportOptStartpoint"],
    ["report-opt-answer",   "modalReportOptAnswer"],
    ["report-opt-other",    "modalReportOptOther"],
  ];
  reportOptIds.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });
  const reportLink = document.querySelector("#report-issue-link");
  if (reportLink) reportLink.textContent = t("reportIssue");

  // settings modal
  set("#settings-title", "settingsTitle");
  const settingRows = [
    ["[id='setting-darkmode']", "settingDarkMode", "settingDarkModeDesc"],
    ["[id='setting-beigebg']", "settingBeigeBackground", "settingBeigeBackgroundDesc"],
    ["[id='setting-danmaku']", "settingBulletComments", "settingBulletCommentsDesc"],
    ["[id='setting-compact']", "settingCompactMode", "settingCompactModeDesc"],
    ["[id='setting-marquee']", "settingMarqueeBar", "settingMarqueeBarDesc"],
    ["[id='setting-sidebar']", "settingSidebar", "settingSidebarDesc"],
    ["[id='setting-sidebarextras']", "settingSidebarExtras", "settingSidebarExtrasDesc"],
    ["[id='setting-tags']", "settingTags", "settingTagsDesc"],
    ["[id='setting-autocomplete']", "settingAutocomplete", "settingAutocompleteDesc"],
    ["[id='setting-clearwrong']", "settingClearInput", "settingClearInputDesc"],
    ["[id='setting-export-stats']", "settingBackupStats", "settingBackupStatsDesc"],
    ["[id='reset-stats-button']", "settingResetStats", "settingResetStatsDesc"],
  ];
  settingRows.forEach(([btnSel, labelKey, descKey]) => {
    const btn = document.querySelector(btnSel);
    if (!btn) return;
    const row = btn.closest(".settings-row");
    if (!row) return;
    const label = row.querySelector(".settings-label");
    const desc = row.querySelector(".settings-desc");
    if (label) label.textContent = t(labelKey);
    if (desc) desc.textContent = t(descKey);
  });

  // comment speed label/desc - separate from its buttons
  const speedRow = document.querySelector("[data-setting='danmaku-speed']")?.closest(".settings-row");
  if (speedRow) {
    const lbl = speedRow.querySelector(".settings-label");
    const dsc = speedRow.querySelector(".settings-desc");
    if (lbl) lbl.textContent = t("settingCommentSpeed");
    if (dsc) dsc.textContent = t("settingCommentSpeedDesc");
  }

  // comment speed buttons
  const speedBtns = document.querySelectorAll("[data-setting='danmaku-speed']");
  const speedKeys = ["settingSpeedSlow","settingSpeedNormal","settingSpeedFast"];
  speedBtns.forEach((btn, i) => { if (speedKeys[i]) btn.textContent = t(speedKeys[i]); });

  // density label/desc
  const densityRow = document.querySelector("[data-setting='danmaku-density']")?.closest(".settings-row");
  if (densityRow) {
    const lbl = densityRow.querySelector(".settings-label");
    const dsc = densityRow.querySelector(".settings-desc");
    if (lbl) lbl.textContent = t("settingDensity");
    if (dsc) dsc.textContent = t("settingDensityDesc");
  }
  const densityBtns = document.querySelectorAll("[data-setting='danmaku-density']");
  const densityKeys = ["settingDensityFew","settingDensityMedium","settingDensityMany"];
  densityBtns.forEach((btn, i) => { if (densityKeys[i]) btn.textContent = t(densityKeys[i]); });

  // volume label/desc
  const volInput = document.querySelector("#setting-volume");
  if (volInput) {
    const row = volInput.closest(".settings-row");
    if (row) {
      const lbl = row.querySelector(".settings-label");
      const dsc = row.querySelector(".settings-desc");
      if (lbl) lbl.textContent = t("settingVolume");
      if (dsc) dsc.textContent = t("settingVolumeDesc");
    }
  }

  // title mode row - always visible, overrides language for song titles
  const titleModeRow = document.querySelector("#title-mode-row");
  if (titleModeRow) {
    titleModeRow.hidden = false;
    const lbl = titleModeRow.querySelector(".settings-label");
    const dsc = titleModeRow.querySelector(".settings-desc");
    if (lbl) lbl.textContent = t("settingTitleDisplay");
    if (dsc) dsc.textContent = t("settingTitleDisplayDesc");
  }

  // reset stats confirm
  const resetConfirmText = document.querySelector("#reset-stats-confirm > span");
  if (resetConfirmText) resetConfirmText.textContent = t("settingResetConfirm");
  const exportStatsBtn = document.querySelector("#setting-export-stats");
  if (exportStatsBtn) exportStatsBtn.textContent = t("settingExportStats");
  const importStatsBtn = document.querySelector("#setting-import-stats");
  if (importStatsBtn) importStatsBtn.textContent = t("settingImportStats");
  const statsImportInput = document.querySelector("#stats-import-input");
  if (statsImportInput) statsImportInput.placeholder = t("settingImportPlaceholder");
  const statsImportConfirm = document.querySelector("#stats-import-confirm");
  if (statsImportConfirm) statsImportConfirm.textContent = t("settingImportStats");
  const statsImportCancel = document.querySelector("#stats-import-cancel");
  if (statsImportCancel) statsImportCancel.textContent = t("settingResetNo");
  const resetBtn = document.querySelector("#reset-stats-button");
  if (resetBtn) resetBtn.textContent = t("settingResetBtn");
  const resetYes = document.querySelector("#reset-stats-yes");
  if (resetYes) resetYes.textContent = t("settingResetYes");
  const resetNo = document.querySelector("#reset-stats-no");
  if (resetNo) resetNo.textContent = t("settingResetNo");

  // topbar date
  const dateEl = document.querySelector("#nnd-date");
  if (dateEl) {
    const d = new Date();
    dateEl.textContent = new Intl.DateTimeFormat(getDateLocale(), { year: "numeric", month: "long", day: "numeric" }).format(d);
  }

  // [INFO] marquee label
  const marqueeLabel = document.querySelector(".nnd-marquee-label");
  if (marqueeLabel) marqueeLabel.textContent = t("infoLabel");

  // meta row labels
  const currentMetaLabels = document.querySelectorAll(".nnd-meta-row .nnd-meta-label");
  if (currentMetaLabels[0]) currentMetaLabels[0].textContent = t("metaViewsBracket");
  if (currentMetaLabels[1]) currentMetaLabels[1].textContent = t("metaCategoryBracket");
  if (currentMetaLabels[2]) currentMetaLabels[2].textContent = t("metaMylistBracket");
  if (currentMetaLabels[3]) currentMetaLabels[3].textContent = t("metaSourceBracket");

  // top-right nav
  document.querySelectorAll(".nnd-header-links a").forEach(a => {
    const target = a.dataset.modalTarget;
    if (target === "about") a.textContent = t("navAbout");
    if (target === "support") a.textContent = t("navSupport");
    if (target === "achievements") a.textContent = t("linkAchievements");
    if (target === "bookmarks") a.textContent = t("modalBookmarksTitle");
    if (target === "release-notes") a.textContent = t("navUpdates");
    if (target === "settings") a.textContent = t("navSettings");
    if (target === "song-pool") a.textContent = t("linkSongPool");
    if (target === "suggest-song") a.textContent = t("linkSuggestSong");
  });
  document.querySelectorAll(".nnd-mobile-settings a").forEach(a => {
    const target = a.dataset.modalTarget;
    if (target === "about") a.textContent = t("navAbout");
    if (target === "support") a.textContent = t("navSupport");
    if (target === "achievements") a.textContent = t("linkAchievements");
    if (target === "bookmarks") a.textContent = t("modalBookmarksTitle");
    if (target === "release-notes") a.textContent = t("navUpdates");
    if (target === "settings") a.textContent = "⚙ " + t("navSettings");
    // Ko-fi link has no data-modal-target - leave its text alone.
  });

  // Hall of Myths songs and artists
  const hofSongs = document.querySelectorAll(".hof-song");
  const hofArtists = document.querySelectorAll(".hof-artist");
  const hofSongKeys = ["hofSong1","hofSong2","hofSong3","hofSong4","hofSong5"];
  const hofArtistKeys = ["hofArtist1","hofArtist2","hofArtist3","hofArtist4","hofArtist5"];
  hofSongs.forEach((el, i) => { if (hofSongKeys[i]) el.textContent = t(hofSongKeys[i]); });
  hofArtists.forEach((el, i) => { if (hofArtistKeys[i]) el.textContent = t(hofArtistKeys[i]); });

  // sidebar links
  document.querySelectorAll(".nnd-sidebar .sidebar-link:not(.full-stats)").forEach(a => {
    const href = a.getAttribute("href") || "";
    const target = a.dataset.modalTarget;
    if (href.includes("vocadb.net")) a.textContent = t("linkVocaDB");
    else if (href.includes("nicovideo.jp")) a.textContent = t("linkNicoNico");
    else if (target === "song-pool") a.textContent = t("linkSongPool");
    else if (target === "suggest-song") a.textContent = t("linkSuggestSong");
    else if (target === "report-issue") a.textContent = t("linkReportIssue");
    else if (target === "release-notes") a.textContent = t("linkReleaseNotes");
    else if (target === "achievements") a.textContent = t("linkAchievements");
    else if (target === "bookmarks") a.textContent = t("modalBookmarksTitle");
    else if (target === "about") a.textContent = t("linkAbout");
    else if (target === "support") a.textContent = t("linkContact");
  });

  // footer links
  document.querySelectorAll(".site-footer a[data-modal-target]").forEach(a => {
    const target = a.dataset.modalTarget;
    if (target === "song-pool") a.textContent = t("linkSongPool");
    else if (target === "suggest-song") a.textContent = t("linkSuggestSong");
    else if (target === "release-notes") a.textContent = t("linkReleaseVersion");
    else if (target === "achievements") a.textContent = t("linkAchievements");
    else if (target === "bookmarks") a.textContent = t("modalBookmarksTitle");
  });
  set(".footer-copy-text", "footerText");
  set(".footer-pagetop", "footerPageTop");

  // sidebar rankings
  set(".sb-rankings-header", "rankingsHeader");
  set("#sb-rankings-see-all", "rankingsSeeAll");
  const sbTabs = document.querySelectorAll(".sb-rankings-tab");
  const sbTabKeys = ["rankingsTabPlays", "rankingsTabHardest", "rankingsTabEasiest"];
  sbTabs.forEach((btn, i) => { if (sbTabKeys[i]) btn.textContent = t(sbTabKeys[i]); });

  // rankings modal
  set("#rankings-title", "rankingsModalTitle");
  set("#rankings-header-song", "rankingsHeaderSong");
  set("#rankings-header-plays", "rankingsHeaderPlays");
  set("#rankings-header-win", "rankingsHeaderWin");
  set("#rankings-header-avg", "rankingsHeaderAvg");
  const rankingsNote = document.querySelector(".rankings-note");
  if (rankingsNote) rankingsNote.textContent = t("rankingsNote");
  const modalTabs = document.querySelectorAll(".rankings-tab");
  const modalTabKeys = ["rankingsTabPlays", "rankingsTabHardest", "rankingsTabEasiest", "rankingsTabAvgLow", "rankingsTabAvgHigh"];
  modalTabs.forEach((btn, i) => { if (modalTabKeys[i]) btn.textContent = t(modalTabKeys[i]); });

  set("#archive-title", "archiveTitle");
  const archiveNote = document.querySelector(".archive-note");
  if (archiveNote) archiveNote.textContent = t("archiveNote");
  set("#archive-random-button", "archiveRandom");
  renderArchiveCalendar();

  // re-render rankings with new language
  loadSidebarRankings(currentSbTab);

  // re-render guesses and update sidebar stats label
  renderGuesses();
  if (typeof renderStats === "function") renderStats();
  if (typeof renderAchievements === "function") renderAchievements();
  if (typeof renderBookmarkButton === "function") renderBookmarkButton();
  if (typeof renderBookmarks === "function") renderBookmarks();
  if (typeof renderUnlimitedFilterModal === "function") renderUnlimitedFilterModal();

  // re-render the cached global win rate line so it switches language too
  renderGlobalStats();

  // translate Ko-fi nudge under the result area
  const kofiNudgeText = document.querySelector(".kofi-nudge-text");
  if (kofiNudgeText) kofiNudgeText.textContent = t("kofiNudgeText");
  const kofiNudgeLink = document.querySelector(".kofi-nudge-link");
  if (kofiNudgeLink) kofiNudgeLink.textContent = t("kofiNudgeLink");

  // re-tick countdown so the unit labels (h/m/s vs 時間/分/秒) update right away
  if (typeof renderCountdownTick === "function" && nextDailyCountdownEl && !nextDailyCountdownEl.hidden) {
    renderCountdownTick();
  }
}

const state = {
  mode: "daily",
  attempt: 1,
  clipStage: 0,
  guesses: [],
  puzzle: null,
  isComplete: false,
  hasPlayedPreview: false,
  lastResult: null,
  lastUnlimitedTitle: "",
  unlimitedQueue: [],
  unlimitedDifficulty: "all",
  unlimitedFilters: null,
  statsMode: "daily",
  statsDifficulty: "all",
  achievementCategory: "all",
  achievementSearch: "",
  bookmarksSearch: "",
  archiveDate: null,
  archiveMonth: null,
};

const gamePanel = document.querySelector("#game-panel");
const puzzleDate = document.querySelector("#puzzle-date");
const attemptCount = document.querySelector("#attempt-count");
const clipLength = document.querySelector("#clip-length");
const videoHeaderLength = document.querySelector("#video-header-length");
const playButton = document.querySelector("#play-button");
const skipButton = document.querySelector("#skip-button");
const guessForm = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const guessList = document.querySelector("#guess-list");
const suggestionList = document.querySelector("#suggestion-list");
const scheduleMessage = document.querySelector("#schedule-message");
const modeEyebrow = document.querySelector("#mode-eyebrow");
const dailyModeButton = document.querySelector("#daily-mode-button");
const unlimitedModeButton = document.querySelector("#unlimited-mode-button");
const archiveModeButton = document.querySelector("#archive-mode-button");
const difficultyModePanel = document.querySelector("#difficulty-mode-panel");
const difficultyPracticeNote = document.querySelector("#difficulty-practice-note");
const difficultyModeButtons = [...document.querySelectorAll("[data-unlimited-difficulty]")];
const unlimitedFilterButton = document.querySelector("#unlimited-filter-button");
const filterTagList = document.querySelector("#filter-tag-list");
const filterProducerInput = document.querySelector("#filter-producer-input");
const filterVoicebankInput = document.querySelector("#filter-voicebank-input");
const filterProducerSuggestions = document.querySelector("#filter-producer-suggestions");
const filterVoicebankSuggestions = document.querySelector("#filter-voicebank-suggestions");
const filterProducerSelected = document.querySelector("#filter-producer-selected");
const filterVoicebankSelected = document.querySelector("#filter-voicebank-selected");
const filterProgramList = document.querySelector("#filter-program-list");
const filterYearList = document.querySelector("#filter-year-list");
const filterYearSummary = document.querySelector("#filter-year-summary");
const filterCommunity = document.querySelector("#filter-community");
const filterNewSongs = document.querySelector("#filter-new-songs");
const filterInclusive = document.querySelector("#filter-inclusive");
const filterMatchCount = document.querySelector("#filter-match-count");
const filterClearButton = document.querySelector("#filter-clear-button");
const filterApplyButton = document.querySelector("#filter-apply-button");
const statsDifficultySwitch = document.querySelector("#stats-difficulty-switch");
const statsDifficultyButtons = [...document.querySelectorAll("[data-stats-difficulty]")];
const nextButton = document.querySelector("#next-button");
const shareButton = document.querySelector("#copy-result-button");
const bookmarkButton = document.querySelector("#bookmark-button");
const shareOutput = document.querySelector("#copy-result-output");
const coverImage = document.querySelector("#cover-image");
const coverFallback = document.querySelector("#cover-fallback");
const coverPlaceholderMark = document.querySelector("#cover-placeholder-mark");
const coverCaption = document.querySelector("#cover-caption");
const sourceTags = document.querySelector("#source-tags");
const sourceLink = document.querySelector("#source-link");
const globalStatsEl = document.querySelector("#global-stats");
const resultTools = document.querySelector("#result-tools");
const reportIssueNudge = document.querySelector("#report-issue-nudge");
const statPlayed = document.querySelector("#stat-played");
const statWon = document.querySelector("#stat-won");
const statWinRate = document.querySelector("#stat-win-rate");
const statCurrentStreak = document.querySelector("#stat-current-streak");
const statMaxStreak = document.querySelector("#stat-max-streak");
const statAvgAttempts = document.querySelector("#stat-avg-attempts");
const statsDetailList = document.querySelector("#stats-detail-list");
const nextDailyCountdownEl = document.querySelector("#next-daily-countdown");
const kofiNudgeEl = document.querySelector("#kofi-nudge");
const distributionItems = document.querySelectorAll("[data-distribution]");
const statsDailyButton = document.querySelector("#stats-daily-button");
const statsUnlimitedButton = document.querySelector("#stats-unlimited-button");
const statsFilteredButton = document.querySelector("#stats-filtered-button");
const statsCopyProfileButton = document.querySelector("#stats-copy-profile");
const exportStatsButton = document.querySelector("#setting-export-stats");
const importStatsButton = document.querySelector("#setting-import-stats");
const statsImportPanel = document.querySelector("#stats-import-panel");
const statsImportInput = document.querySelector("#stats-import-input");
const statsImportConfirm = document.querySelector("#stats-import-confirm");
const statsImportCancel = document.querySelector("#stats-import-cancel");
const achievementsSummary = document.querySelector("#achievements-summary");
const achievementsList = document.querySelector("#achievements-list");
const achievementSearchInput = document.querySelector("#achievement-search-input");
const bookmarksList = document.querySelector("#bookmarks-list");
const bookmarksSearchInput = document.querySelector("#bookmarks-search-input");
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalButtons = document.querySelectorAll("[data-modal-target]");
const modalCloseButtons = document.querySelectorAll(".modal-close, .modal-action");
const archiveGrid = document.querySelector("#archive-grid");
const archiveMonthLabel = document.querySelector("#archive-month-label");
const archiveSummary = document.querySelector("#archive-summary");
const archiveInsights = document.querySelector("#archive-insights");
const archiveRandomButton = document.querySelector("#archive-random-button");
const archivePrevMonth = document.querySelector("#archive-prev-month");
const archiveNextMonth = document.querySelector("#archive-next-month");
const suggestSongForm = document.querySelector("#suggest-song-form");
const suggestCheckInput = document.querySelector("#suggest-check-input");
const suggestCheckResults = document.querySelector("#suggest-check-results");
const reportIssueForm = document.querySelector("#report-issue-form");
const reportContext = document.querySelector("#report-context");
let activeModal = null;
let currentAudio = null;
let bookmarkAudio = null;
let bookmarkAudioId = null;
let bookmarkProgressTimer = null;
let clipTimer = null;
let progressFrame = null;
let activeSuggestionIndex = -1;
let selectedSuggestionSongId = null;
let suppressNextGuessAutofocus = false;

function getDefaultStats() {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    firstTrySolves: 0,
    hardestSolved: null,
    rarestFirstTry: null,
    yearStats: {},
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      fail: 0,
    },
    results: {},
  };
}

function normalizeYearStats(raw = {}) {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([year]) => /^\d{4}$/.test(String(year)))
      .map(([year, value]) => [
        year,
        {
          played: Number(value?.played) || 0,
          won: Number(value?.won) || 0,
        },
      ]),
  );
}

function normalizeStats(parsedStats = {}, options = {}) {
  const defaultStats = getDefaultStats();
  const distribution = {
    ...defaultStats.distribution,
    ...(parsedStats.distribution || {}),
  };

  return {
    ...defaultStats,
    ...parsedStats,
    firstTrySolves: Number.isFinite(Number(parsedStats.firstTrySolves))
      ? Number(parsedStats.firstTrySolves)
      : Number(distribution[1]) || 0,
    hardestSolved: parsedStats.hardestSolved || null,
    rarestFirstTry: parsedStats.rarestFirstTry || null,
    yearStats: normalizeYearStats(parsedStats.yearStats),
    distribution,
    results: options.keepResults === false
      ? {}
      : {
          ...defaultStats.results,
          ...(parsedStats.results || {}),
        },
  };
}

function loadStats() {
  try {
    const parsedStats = JSON.parse(localStorage.getItem(statsKey)) || {};
    return normalizeStats(parsedStats);
  } catch {
    return getDefaultStats();
  }
}

function saveStats(stats) {
  localStorage.setItem(statsKey, JSON.stringify(stats));
}

function loadUnlimitedStats() {
  try {
    return normalizeStats(JSON.parse(localStorage.getItem(unlimitedStatsKey)) || {}, { keepResults: false });
  } catch {
    return getDefaultStats();
  }
}

function saveUnlimitedStats(stats) {
  localStorage.setItem(unlimitedStatsKey, JSON.stringify(stats));
}

function loadFilteredStats() {
  try {
    return normalizeStats(JSON.parse(localStorage.getItem(filteredStatsKey)) || {}, { keepResults: false });
  } catch {
    return getDefaultStats();
  }
}

function saveFilteredStats(stats) {
  localStorage.setItem(filteredStatsKey, JSON.stringify(stats));
}

function loadUnlimitedDifficultyStatsMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(unlimitedDifficultyStatsKey)) || {};
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveUnlimitedDifficultyStatsMap(map) {
  localStorage.setItem(unlimitedDifficultyStatsKey, JSON.stringify(map));
}

function loadUnlimitedDifficultyStats(difficulty = state.statsDifficulty || state.unlimitedDifficulty) {
  const map = loadUnlimitedDifficultyStatsMap();
  return normalizeStats(map[difficulty] || {}, { keepResults: false });
}

function saveUnlimitedDifficultyStats(difficulty, stats) {
  const map = loadUnlimitedDifficultyStatsMap();
  map[difficulty] = normalizeStats(stats, { keepResults: false });
  saveUnlimitedDifficultyStatsMap(map);
}

function loadArchiveResults() {
  try {
    return JSON.parse(localStorage.getItem(archiveResultsKey)) || {};
  } catch {
    return {};
  }
}

function saveArchiveResults(results) {
  localStorage.setItem(archiveResultsKey, JSON.stringify(results));
}

function normalizeBookmarks(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).filter(Boolean))];
}

function loadBookmarks() {
  try {
    return normalizeBookmarks(JSON.parse(localStorage.getItem(bookmarksKey)) || []);
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks) {
  localStorage.setItem(bookmarksKey, JSON.stringify(normalizeBookmarks(bookmarks)));
}

function normalizeFilterList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
}

function getDefaultUnlimitedFilters() {
  return {
    producers: [],
    voicebanks: [],
    programs: [],
    years: [],
    community: false,
    newSongs: false,
    inclusive: false,
  };
}

function normalizeUnlimitedFilters(value) {
  const source = isPlainObject(value) ? value : {};
  return {
    producers: normalizeFilterList(source.producers || source.producer ? [].concat(source.producers || source.producer) : []),
    voicebanks: normalizeFilterList(source.voicebanks || source.voicebank ? [].concat(source.voicebanks || source.voicebank) : []),
    programs: normalizeFilterList(source.programs).filter((program) => FILTER_PROGRAMS.includes(program)),
    years: normalizeFilterList(source.years).filter((year) => FILTER_YEARS.includes(year)).sort(),
    community: Boolean(source.community),
    newSongs: Boolean(source.newSongs || source.recent || source.recentlyAdded),
    inclusive: Boolean(source.inclusive),
  };
}

function loadUnlimitedFilters() {
  try {
    return normalizeUnlimitedFilters(JSON.parse(localStorage.getItem(unlimitedFiltersKey)) || {});
  } catch {
    return getDefaultUnlimitedFilters();
  }
}

function saveUnlimitedFilters(filters) {
  const normalized = normalizeUnlimitedFilters(filters);
  localStorage.setItem(unlimitedFiltersKey, JSON.stringify(normalized));
  return normalized;
}

function getActiveFilterCount(filters = state.unlimitedFilters || getDefaultUnlimitedFilters()) {
  return [
    filters.producers?.length,
    filters.voicebanks?.length,
    filters.programs?.length,
    filters.years?.length,
    filters.community,
    filters.newSongs,
  ].filter(Boolean).length;
}

function hasActiveUnlimitedFilters(filters = state.unlimitedFilters || getDefaultUnlimitedFilters()) {
  return getActiveFilterCount(filters) > 0;
}

function cleanFilterName(name) {
  return String(name || "").replace(/\s+/g, " ").trim();
}

function getFilterProducerNames(song) {
  return normalizeFilterList([
    ...(song?.producerNames || []),
    song?.artist,
  ].map(cleanFilterName));
}

function getFilterVoicebankNames(song) {
  return normalizeFilterList(song?.singerNames || []).map(cleanFilterName);
}

function getVoicebankTagName(name) {
  if (getLang() !== "jp") return name;
  const map = {
    "Hatsune Miku": "初音ミク",
    "Kagamine Rin": "鏡音リン",
    "Kagamine Len": "鏡音レン",
    "Megurine Luka": "巡音ルカ",
    "Kasane Teto": "重音テト",
    "GUMI": "GUMI",
    "KAITO": "KAITO",
    "MEIKO": "MEIKO",
    "flower": "flower",
    "IA": "IA",
    "KAFU": "可不",
  };
  return map[name] || name;
}

function getSongPrograms(song) {
  const text = getFilterVoicebankNames(song).join(" ").toLowerCase();
  const programs = new Set();
  if (/\bsv\b|synthv|synthesizer v|kasane teto sv|teto sv|kafu|haru|rime|sekai|coko/.test(text)) programs.add("SynthV");
  if (/kasane teto|namine ritsu|momone momo|akita neru|defoko|utau/.test(text) && !/sv|synthv|synthesizer v/.test(text)) programs.add("UTAU");
  if (/kafu|可不|sekai|星界|rime|裏命|coko|狐子|haru|羽累|cevio/.test(text)) programs.add("CeVIO");
  if (/nt|piapro/.test(text)) programs.add("Piapro");
  if (/hatsune miku|kagamine rin|kagamine len|megurine luka|kaito|meiko|gumi|gackpo|megpoid|vflower|flower|ia|yuzuki yukari|otomachi una|mayu|lily|avanna|luo tianyi/.test(text)) programs.add("VOCALOID");
  if (programs.size === 0) programs.add("VOCALOID");
  return [...programs];
}

function getLatestAddedBatch() {
  const batches = normalizeFilterList(songs.map((song) => song.addedBatch || song.batch || ""));
  return batches.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }))[0] || "";
}

function isRecentlyAddedSong(song) {
  if (!song) return false;
  const tags = Array.isArray(song.sourceTags) ? song.sourceTags.map((tag) => normalizeGuess(tag)) : [];
  if (tags.some((tag) => ["new", "new song", "new songs", "recent", "recently added"].includes(tag))) return true;

  const latestBatch = getLatestAddedBatch();
  const songBatch = String(song.addedBatch || song.batch || "").trim();
  if (latestBatch && songBatch && songBatch === latestBatch) return true;

  const addedAt = Date.parse(song.addedAt || song.addedDate || "");
  if (Number.isFinite(addedAt)) {
    return Date.now() - addedAt <= NEW_SONG_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  }

  return false;
}

function songMatchesOneFilterCategory(song, filters, category) {
  if (category === "producers") {
    if (!filters.producers.length) return null;
    const names = new Set(getFilterProducerNames(song).map(normalizeGuess));
    return filters.producers.some((name) => names.has(normalizeGuess(name)));
  }
  if (category === "voicebanks") {
    if (!filters.voicebanks.length) return null;
    const names = new Set(getFilterVoicebankNames(song).map(normalizeGuess));
    return filters.voicebanks.some((name) => names.has(normalizeGuess(name)));
  }
  if (category === "programs") {
    if (!filters.programs.length) return null;
    const programs = new Set(getSongPrograms(song));
    return filters.programs.some((program) => programs.has(program));
  }
  if (category === "years") {
    if (!filters.years.length) return null;
    return filters.years.includes(getPublishYear(song));
  }
  if (category === "community") {
    if (!filters.community) return null;
    return hasSourceTag(song, "community");
  }
  if (category === "newSongs") {
    if (!filters.newSongs) return null;
    return isRecentlyAddedSong(song);
  }
  return null;
}

function songMatchesUnlimitedFilters(song, filters = state.unlimitedFilters || getDefaultUnlimitedFilters()) {
  const checks = ["producers", "voicebanks", "programs", "years", "community", "newSongs"]
    .map((category) => songMatchesOneFilterCategory(song, filters, category))
    .filter((value) => value !== null);
  if (checks.length === 0) return true;
  return filters.inclusive ? checks.some(Boolean) : checks.every(Boolean);
}

function applyUnlimitedFiltersToSongs(playableSongs, filters = state.unlimitedFilters || getDefaultUnlimitedFilters()) {
  return hasActiveUnlimitedFilters(filters)
    ? playableSongs.filter((song) => songMatchesUnlimitedFilters(song, filters))
    : playableSongs;
}

function isBookmarked(vocadbId) {
  if (!vocadbId) return false;
  return loadBookmarks().includes(String(vocadbId));
}

function toggleBookmark(song = state.puzzle) {
  if (!song?.vocadbId) return;
  const id = String(song.vocadbId);
  const bookmarks = loadBookmarks();
  const nextBookmarks = bookmarks.includes(id)
    ? bookmarks.filter((bookmarkId) => bookmarkId !== id)
    : [id, ...bookmarks];
  saveBookmarks(nextBookmarks);
  renderBookmarkButton();
  renderBookmarks();
}

function getDefaultAchievements() {
  return {
    version: 1,
    unlocked: {},
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeAchievements(parsedAchievements = {}) {
  const defaultAchievements = getDefaultAchievements();
  const unlocked = isPlainObject(parsedAchievements.unlocked)
    ? Object.fromEntries(
        Object.entries(parsedAchievements.unlocked)
          .filter(([id, unlockedAt]) => typeof id === "string" && typeof unlockedAt === "string")
      )
    : {};

  return {
    ...defaultAchievements,
    ...parsedAchievements,
    version: Number.isFinite(Number(parsedAchievements.version))
      ? Number(parsedAchievements.version)
      : defaultAchievements.version,
    unlocked,
  };
}

function loadAchievements() {
  try {
    return normalizeAchievements(JSON.parse(localStorage.getItem(achievementsKey)) || {});
  } catch {
    return getDefaultAchievements();
  }
}

function saveAchievements(achievements) {
  localStorage.setItem(achievementsKey, JSON.stringify(normalizeAchievements(achievements)));
}

function getAchievementText(achievement, field) {
  const lang = getLang();
  return achievement?.[field]?.[lang] || achievement?.[field]?.en || "";
}

function queueAchievementToast(id) {
  const achievement = achievementById.get(id);
  if (!achievement) return;
  achievementToastQueue.push(achievement);
  if (!achievementToastActive) {
    showNextAchievementToast();
  }
}

function showNextAchievementToast() {
  const achievement = achievementToastQueue.shift();
  if (!achievement) {
    achievementToastActive = false;
    return;
  }

  achievementToastActive = true;
  const existing = document.querySelector("#achievement-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "achievement-toast";
  toast.innerHTML = `
    <span class="nnd-toast-label achievement-toast-symbol" aria-hidden="true">★</span>
    <span class="achievement-toast-body">
      <span class="achievement-toast-kicker">${escapeHtml(t("toastAchievementUnlocked"))}</span>
      <strong>${escapeHtml(getAchievementText(achievement, "title"))}</strong>
      <span>${escapeHtml(getAchievementText(achievement, "description"))}</span>
    </span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("nnd-toast-fade"), 3400);
  setTimeout(() => {
    toast.remove();
    showNextAchievementToast();
  }, 4000);
}

function unlockAchievement(id, unlockedAt = new Date().toISOString()) {
  if (!achievementById.has(id)) return false;
  const achievements = loadAchievements();
  if (achievements.unlocked[id]) return false;
  achievements.unlocked[id] = unlockedAt;
  saveAchievements(achievements);
  if (activeModal?.id === "achievements") {
    renderAchievements();
  }
  queueAchievementToast(id);
  return true;
}

function formatAchievementDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getDateLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getAchievementCategoryKey(category) {
  const keys = {
    all: "achievementCategoryAll",
    general: "achievementCategoryGeneral",
    daily: "achievementCategoryDaily",
    unlimited: "achievementCategoryUnlimited",
    archive: "achievementCategoryArchive",
    knowledge: "achievementCategoryKnowledge",
    challenge: "achievementCategoryChallenge",
    secret: "achievementCategorySecret",
  };
  return keys[category] || "achievementCategoryAll";
}

function renderAchievementTabs() {
  document.querySelectorAll("[data-achievement-category]").forEach((button) => {
    const category = button.dataset.achievementCategory || "all";
    button.textContent = t(getAchievementCategoryKey(category));
    button.classList.toggle("is-active", category === state.achievementCategory);
  });
}

function achievementMatchesSearch(achievement, query, unlocked) {
  if (!query) return true;
  const isUnlocked = Boolean(unlocked[achievement.id]);
  const isHidden = achievement.hidden && !isUnlocked;
  const title = isHidden ? t("achievementHiddenTitle") : getAchievementText(achievement, "title");
  const description = isHidden ? t("achievementHiddenDesc") : getAchievementText(achievement, "description");
  const categoryLabel = t(getAchievementCategoryKey(achievement.category));
  const searchable = [title, description, categoryLabel, achievement.category].join(" ");
  return normalizeGuess(searchable).includes(query);
}

function renderAchievements() {
  if (!achievementsList || !achievementsSummary) return;
  const achievements = loadAchievements();
  const unlocked = achievements.unlocked || {};
  const unlockedCount = ACHIEVEMENTS.filter((achievement) => unlocked[achievement.id]).length;
  const totalCount = ACHIEVEMENTS.length;
  const unlockedRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const currentCategory = state.achievementCategory || "all";
  const searchQuery = normalizeGuess(state.achievementSearch || "");
  if (achievementSearchInput && achievementSearchInput.value !== (state.achievementSearch || "")) {
    achievementSearchInput.value = state.achievementSearch || "";
  }
  const filtered = ACHIEVEMENTS.filter((achievement) => (
    currentCategory === "all" ||
    achievement.category === currentCategory ||
    (currentCategory === "secret" && achievement.hidden)
  )).filter((achievement) => achievementMatchesSearch(achievement, searchQuery, unlocked));

  achievementsSummary.innerHTML = `
    <div class="achievements-summary-top">
      <strong>${escapeHtml(t("achievementsSummary", unlockedCount, totalCount))}</strong>
      <em>${unlockedRate}%</em>
    </div>
    <div class="achievement-progress-track" aria-hidden="true">
      <span style="width:${unlockedRate}%"></span>
    </div>
  `;

  if (filtered.length === 0) {
    achievementsList.innerHTML = `
      <div class="achievement-empty">${escapeHtml(t("achievementNoResults"))}</div>
    `;
    renderAchievementTabs();
    return;
  }

  achievementsList.innerHTML = filtered.map((achievement) => {
    const unlockedAt = unlocked[achievement.id];
    const isUnlocked = Boolean(unlockedAt);
    const isHidden = achievement.hidden && !isUnlocked;
    const title = isHidden ? t("achievementHiddenTitle") : getAchievementText(achievement, "title");
    const description = isHidden ? t("achievementHiddenDesc") : getAchievementText(achievement, "description");
    const dateText = isUnlocked
      ? t("achievementStatusUnlocked", formatAchievementDate(unlockedAt))
      : t("achievementStatusLocked");
    const categoryLabel = t(getAchievementCategoryKey(achievement.category));
    const classes = [
      "achievement-card",
      isUnlocked ? "is-unlocked" : "is-locked",
      isHidden ? "is-hidden" : "",
      achievement.id === "secret_senbonzakura" ? "is-senbonzakura" : "",
      achievement.id === "secret_mikumiku_jp" ? "is-mikumiku" : "",
    ].filter(Boolean).join(" ");

    return `
      <article class="${classes}">
        <div class="achievement-card-head">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(categoryLabel)}</span>
        </div>
        <p>${escapeHtml(description)}</p>
        <small>${escapeHtml(dateText)}</small>
      </article>
    `;
  }).join("");

  renderAchievementTabs();
}

function renderBookmarkButton() {
  if (!bookmarkButton) return;
  const canBookmark = Boolean(state.isComplete && state.puzzle?.vocadbId);
  bookmarkButton.hidden = !canBookmark;
  if (!canBookmark) return;
  const bookmarked = isBookmarked(state.puzzle.vocadbId);
  bookmarkButton.classList.toggle("is-bookmarked", bookmarked);
  bookmarkButton.textContent = bookmarked ? "★" : "☆";
  bookmarkButton.title = t(bookmarked ? "bookmarked" : "bookmark");
  bookmarkButton.setAttribute("aria-label", t(bookmarked ? "bookmarked" : "bookmark"));
}

function getBookmarkSearchText(song) {
  return [
    getDisplayTitle(song),
    song.title,
    song.vocadbName,
    getSuggestionArtist(song),
    song.artistString,
    getPublishYear(song),
    ...(song.acceptedTitles || []),
    ...(song.producerNames || []),
    ...(song.singerNames || []),
  ].filter(Boolean).join(" ");
}

function renderBookmarks() {
  if (!bookmarksList) return;
  const bookmarkIds = loadBookmarks();
  const bookmarkedSongs = bookmarkIds
    .map((id) => getSongById(id))
    .filter(Boolean);
  const query = normalizeGuess(state.bookmarksSearch || "");
  if (bookmarksSearchInput && bookmarksSearchInput.value !== (state.bookmarksSearch || "")) {
    bookmarksSearchInput.value = state.bookmarksSearch || "";
  }

  if (bookmarkedSongs.length === 0) {
    bookmarksList.innerHTML = `<div class="bookmarks-empty">${escapeHtml(t("bookmarksEmpty"))}</div>`;
    return;
  }

  const filteredSongs = query
    ? bookmarkedSongs.filter((song) => normalizeGuess(getBookmarkSearchText(song)).includes(query))
    : bookmarkedSongs;

  if (filteredSongs.length === 0) {
    bookmarksList.innerHTML = `<div class="bookmarks-empty">${escapeHtml(t("bookmarksNoResults"))}</div>`;
    return;
  }

  bookmarksList.innerHTML = filteredSongs.map((song) => {
    const id = String(song.vocadbId);
    const title = truncateTitle(getDisplayTitle(song), 52);
    const artist = truncateTitle(getSuggestionArtist(song), 60);
    const year = getPublishYear(song);
    const isPlaying = bookmarkAudioId === id && bookmarkAudio && !bookmarkAudio.paused;
    const elapsed = isPlaying ? formatBookmarkTime(bookmarkAudio.currentTime || 0) : "0:00";
    const duration = isPlaying && Number.isFinite(bookmarkAudio.duration)
      ? formatBookmarkTime(bookmarkAudio.duration)
      : "";
    const timeText = duration ? `${elapsed} / ${duration}` : elapsed;
    const coverArts = getCoverArts(song);
    const cover = coverArts[0] || "";
    const coverList = coverArts.join("|");

    return `
      <article class="bookmark-card">
        <div class="bookmark-thumb">
          ${cover
            ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy" data-cover-index="0" data-cover-list="${escapeHtml(coverList)}">`
            : `<span>?</span>`}
        </div>
        <div class="bookmark-info">
          <div class="bookmark-title-row">
            <strong>${escapeHtml(title)}</strong>
            ${year ? `<small>${escapeHtml(year)}</small>` : ""}
          </div>
          <span>${escapeHtml(artist)}</span>
          <div class="bookmark-actions">
            <button type="button" data-bookmark-play="${escapeHtml(id)}">${escapeHtml(t(isPlaying ? "bookmarksPause" : "bookmarksPlay"))}</button>
            <span class="bookmark-time">${escapeHtml(timeText)}</span>
            <a href="${escapeHtml(song.vocadbUrl || "https://vocadb.net")}" target="_blank" rel="noreferrer">VocaDB</a>
            <button class="bookmark-remove" type="button" data-bookmark-remove="${escapeHtml(id)}" title="${escapeHtml(t("bookmarksRemove"))}" aria-label="${escapeHtml(t("bookmarksRemove"))}">-</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function showNextBookmarkThumb(img) {
  if (!img) return false;
  const urls = String(img.dataset.coverList || "").split("|").filter(Boolean);
  const nextIndex = Number(img.dataset.coverIndex || 0) + 1;
  if (nextIndex < urls.length) {
    img.dataset.coverIndex = String(nextIndex);
    img.src = urls[nextIndex];
    return true;
  }

  const thumb = img.closest(".bookmark-thumb");
  if (thumb) thumb.innerHTML = "<span>?</span>";
  return false;
}

function isLowQualityBookmarkThumb(img) {
  const imageUrl = img?.currentSrc || img?.src || "";
  if (!imageUrl.includes("ytimg.com")) return false;
  if (img.naturalWidth <= 320 || img.naturalHeight <= 180) return true;
  return imageUrl.includes("/maxresdefault.jpg") && img.naturalWidth < 1000;
}

function stopBookmarkAudio() {
  if (bookmarkProgressTimer) {
    clearInterval(bookmarkProgressTimer);
    bookmarkProgressTimer = null;
  }
  if (bookmarkAudio) {
    bookmarkAudio.pause();
    bookmarkAudio.currentTime = 0;
  }
  bookmarkAudio = null;
  bookmarkAudioId = null;
}

function toggleBookmarkAudio(vocadbId) {
  const song = getSongById(vocadbId);
  if (!song?.audioClip) return;
  const id = String(vocadbId);
  if (bookmarkAudioId === id && bookmarkAudio && !bookmarkAudio.paused) {
    stopBookmarkAudio();
    renderBookmarks();
    return;
  }

  stopClip();
  stopBookmarkAudio();
  bookmarkAudioId = id;
  bookmarkAudio = new Audio(song.audioClip);
  bookmarkAudio.volume = getVolume();
  bookmarkAudio.addEventListener("ended", () => {
    stopBookmarkAudio();
    renderBookmarks();
  });
  bookmarkProgressTimer = setInterval(renderBookmarks, 500);
  bookmarkAudio.play().catch(() => {
    stopBookmarkAudio();
  }).finally(renderBookmarks);
}

function formatBookmarkTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function getArchiveMonthCompletion(dateKey) {
  if (!dateKey) return { played: 0, total: 0 };
  const currentMonth = dateKey.slice(0, 7);
  const archiveSongs = getArchiveSongs().filter((song) => song.date?.startsWith(currentMonth));
  const archiveResults = loadArchiveResults();
  const dailyResults = loadStats().results || {};
  const played = archiveSongs.filter((song) => archiveResults[song.date] || dailyResults[song.date]).length;
  return {
    played,
    total: archiveSongs.length,
  };
}

function countUniqueSolvedSongs() {
  const dailyResults = loadStats().results || {};
  const archiveResults = loadArchiveResults();
  const unlimitedStats = loadUnlimitedStats();
  const ids = new Set();
  for (const r of Object.values(dailyResults)) {
    if (r?.won && r.vocadbId) ids.add(String(r.vocadbId));
  }
  for (const r of Object.values(archiveResults)) {
    if (r?.won && r.vocadbId) ids.add(String(r.vocadbId));
  }
  // unlimited doesn't store per-result history, use firstTrySolves + won as proxy
  // best we can do without per-result storage is add won count not already in ids
  return ids.size + Math.max(0, (unlimitedStats.won || 0) - ids.size);
}

function getDailyFirstTryStreak(stats) {
  const results = stats.results || {};
  const sorted = Object.keys(results).sort().reverse();
  let streak = 0;
  for (const key of sorted) {
    const r = results[key];
    if (r?.won && r.attempts === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getUnlimitedFirstTryStreak() {
  // Track via achievements storage as a simple counter since unlimited has no per-result log
  const achievements = loadAchievements();
  return Number(achievements.unlimitedFirstTryStreak) || 0;
}

const practiceAchievementDifficulties = ["free", "easy", "medium", "hard", "unknown"];

function resetUnknownPracticeFirstTryStreak() {
  const achievements = loadAchievements();
  if ((Number(achievements.unknownPracticeFirstTryStreak) || 0) === 0) return;
  achievements.unknownPracticeFirstTryStreak = 0;
  saveAchievements(achievements);
}

function trackPracticeAchievements(result, won, attempts) {
  const difficulty = result?.difficulty || "all";
  if (!practiceAchievementDifficulties.includes(difficulty)) return;

  const achievements = loadAchievements();
  let shouldUnlockFirstClear = false;
  let shouldUnlockAllTiers = false;
  let shouldUnlockUnknownStreak = false;

  if (won) {
    shouldUnlockFirstClear = true;
    const solved = Array.isArray(achievements.practiceSolvedDifficulties)
      ? achievements.practiceSolvedDifficulties.map(String)
      : [];
    if (!solved.includes(difficulty)) {
      solved.push(difficulty);
      achievements.practiceSolvedDifficulties = solved;
    }
    if (practiceAchievementDifficulties.every((key) => solved.includes(key))) {
      shouldUnlockAllTiers = true;
    }
  }

  if (difficulty === "unknown") {
    achievements.unknownPracticeFirstTryStreak = won && attempts === 1
      ? (Number(achievements.unknownPracticeFirstTryStreak) || 0) + 1
      : 0;
    if (achievements.unknownPracticeFirstTryStreak >= 10) {
      shouldUnlockUnknownStreak = true;
    }
  }

  saveAchievements(achievements);
  if (shouldUnlockFirstClear) unlockAchievement("practice_first_clear");
  if (shouldUnlockAllTiers) unlockAchievement("practice_all_tiers");
  if (shouldUnlockUnknownStreak) unlockAchievement("secret_unknown_first_try_10");
}

function countCompletedArchiveMonths() {
  const archiveSongs = getArchiveSongs();
  const archiveResults = loadArchiveResults();
  const dailyResults = loadStats().results || {};
  const monthMap = {};
  for (const song of archiveSongs) {
    const month = song.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { total: 0, played: 0 };
    monthMap[month].total++;
    if (archiveResults[song.date] || dailyResults[song.date]) monthMap[month].played++;
  }
  return Object.values(monthMap).filter((m) => m.total > 0 && m.played >= m.total).length;
}

function checkDailyPlayedAllMonth() {
  const stats = loadStats();
  const results = stats.results || {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Check previous month if today is the 1st
  const checkYear = month === 0 && today.getDate() === 1 ? year - 1 : year;
  const checkMonth = today.getDate() === 1 ? (month === 0 ? 11 : month - 1) : month;
  const daysToCheck = today.getDate() === 1
    ? new Date(checkYear, checkMonth + 1, 0).getDate()
    : today.getDate() - 1;
  let playedAll = true;
  for (let d = 1; d <= daysToCheck; d++) {
    const key = `${checkYear}-${String(checkMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (!results[key]) { playedAll = false; break; }
  }
  return daysToCheck >= 28 && playedAll;
}

function checkBounceBack() {
  const stats = loadStats();
  const results = stats.results || {};
  const today = new Date();
  const todayKey = getDateKey();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  const dayBefore = new Date(yesterday);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const dbKey = `${dayBefore.getFullYear()}-${String(dayBefore.getMonth() + 1).padStart(2, "0")}-${String(dayBefore.getDate()).padStart(2, "0")}`;
  // Yesterday was a loss and the day before existed (had a streak to break), today they played
  return results[yKey] && !results[yKey].won && results[dbKey] && results[todayKey];
}

function countRareSolves() {
  const achievements = loadAchievements();
  return Number(achievements.rareSolveCount) || 0;
}

function countClutchSolves() {
  const achievements = loadAchievements();
  return Number(achievements.clutchSolveCount) || 0;
}

function getSolvedVocadbIds() {
  const dailyResults = loadStats().results || {};
  const archiveResults = loadArchiveResults();
  const ids = new Set();
  for (const r of Object.values(dailyResults)) {
    if (r?.won && r.vocadbId) ids.add(String(r.vocadbId));
  }
  for (const r of Object.values(archiveResults)) {
    if (r?.won && r.vocadbId) ids.add(String(r.vocadbId));
  }
  return ids;
}

function checkLocalAchievements(result, context = {}) {
  if (!result) return;

  const mode = context.mode || result.mode || state.mode;
  const won = Boolean(result.won);
  const rawAttempts = result.attempts;
  const attempts = Number(rawAttempts) || 0;
  const guesses = result.guesses || [];

  // Time-based secrets
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  if (hour < 4) unlockAchievement("secret_play_midnight");
  if (day === 0 || day === 6) unlockAchievement("secret_weekend_play");

  if (won) {
    unlockAchievement("first_solve");
    if (attempts === 1) unlockAchievement("first_try");
    if (attempts === 2) unlockAchievement("challenge_second_try");
    if (!guesses.some((guess) => guess.result === "Skipped")) unlockAchievement("no_skip_win");
    if (!guesses.some((guess) => guess.result === "Wrong" || guess.result === "Strong" || guess.result === "Artist" || guess.result === "Vocal" || guess.result === "Skipped")) unlockAchievement("challenge_no_wrong");
    if (String(result.vocadbId) === "1355" && getLang() === "jp") {
      unlockAchievement("secret_mikumiku_jp");
    }

    // Clutch solve tracking
    if (attempts === clipStages.length) {
      unlockAchievement("clutch_solve");
      const achievements = loadAchievements();
      achievements.clutchSolveCount = (Number(achievements.clutchSolveCount) || 0) + 1;
      saveAchievements(achievements);
      if (achievements.clutchSolveCount >= 3) unlockAchievement("challenge_clutch_3");
    }

    // Unique songs
    const uniqueSolved = countUniqueSolvedSongs();
    if (uniqueSolved >= 100) unlockAchievement("knowledge_100_unique");

    // Same song in two modes
    if (result.vocadbId) {
      const existingIds = getSolvedVocadbIds();
      // If this vocadbId was already solved in a different mode, it qualifies
      const dailyResults = loadStats().results || {};
      const archiveResults = loadArchiveResults();
      const id = String(result.vocadbId);
      const inDaily = Object.values(dailyResults).some((r) => r?.won && String(r.vocadbId) === id);
      const inArchive = Object.values(archiveResults).some((r) => r?.won && String(r.vocadbId) === id);
      const inUnlimited = mode === "unlimited";
      if ((inDaily && (inArchive || inUnlimited)) || (inArchive && inUnlimited)) {
        unlockAchievement("knowledge_same_song_twice");
      }
    }
  } else if (rawAttempts === null || state.attempt >= clipStages.length || guesses.some((guess) => guess.result === "Answer")) {
    unlockAchievement("full_reveal");
  }

  if (mode === "daily") {
    if (won && result.playedPreview === false) {
      unlockAchievement("secret_daily_no_preview");
    }

    const stats = loadStats();
    if (stats.currentStreak >= 5) unlockAchievement("daily_streak_5");
    if (stats.currentStreak >= 10) unlockAchievement("daily_streak_10");
    if (stats.currentStreak >= 30) unlockAchievement("daily_streak_30");
    if (stats.played >= 30) unlockAchievement("daily_played_30");
    if (stats.played >= 10 && stats.won / stats.played >= 0.9) unlockAchievement("daily_win_rate_90");
    if (checkDailyPlayedAllMonth()) unlockAchievement("daily_played_all_month");
    if (checkBounceBack()) unlockAchievement("daily_bounce_back");

    if (won && attempts === 1) {
      const perfectStreak = getDailyFirstTryStreak(stats);
      if (perfectStreak >= 7) unlockAchievement("challenge_perfect_daily_week");
    }
  }

  if (mode === "unlimited") {
    const stats = loadUnlimitedStats();
    if (stats.won >= 10) unlockAchievement("unlimited_10_wins");
    if (stats.won >= 50) unlockAchievement("unlimited_50_wins");
    if (stats.won >= 100) unlockAchievement("unlimited_100_wins");
    if (stats.won >= 200) unlockAchievement("unlimited_200_wins");
    if (stats.won >= 500) unlockAchievement("unlimited_500_wins");

    if (won) {
      // Quick win: solved without any clip advancing (attempts === 1, no skips)
      if (attempts === 1 && !guesses.some((g) => g.result === "Skipped")) {
        unlockAchievement("unlimited_quick_win");
      }

      // First-try streak
      if (attempts === 1) {
        const streak = getUnlimitedFirstTryStreak();
        if (streak >= 3) unlockAchievement("unlimited_first_try_streak_3");
      }
    }
  }

  if (mode === "unlimited-practice") {
    trackPracticeAchievements(result, won, attempts);
  }

  if (mode === "archive") {
    unlockAchievement("archive_first");
    const archive = getArchiveStatsSummary();
    if (archive.solved >= 10) unlockAchievement("archive_10_solved");
    if (archive.solved >= 25) unlockAchievement("archive_25_solved");
    if (archive.solved >= 50) unlockAchievement("archive_50_solved");
    const month = getArchiveMonthCompletion(result.date);
    if (month.total > 0 && month.played >= month.total) {
      unlockAchievement("archive_month_complete");
      const completedMonths = countCompletedArchiveMonths();
      if (completedMonths >= 2) unlockAchievement("archive_2_months_complete");
    }
  }
}

function checkGlobalAchievements(globalRate, context = {}) {
  const result = context.result || state.lastResult;
  if (!result?.won || !Number.isFinite(globalRate)) return;
  if (globalRate < 20) {
    unlockAchievement("rare_solve");
    const achievements = loadAchievements();
    const prev = Number(achievements.rareSolveCount) || 0;
    achievements.rareSolveCount = prev + 1;
    saveAchievements(achievements);
    if (achievements.rareSolveCount >= 5) unlockAchievement("knowledge_rare_5_solves");
  }
  if (globalRate < 10) unlockAchievement("knowledge_very_rare_solve");
  if (globalRate < 20 && result.attempts === 1) unlockAchievement("rare_first_try");
}

function buildStatsBackup() {
  return {
    app: "vocaloid-heardle",
    version: 3,
    exportedAt: new Date().toISOString(),
    stats: normalizeStats(loadStats()),
    unlimitedStats: normalizeStats(loadUnlimitedStats(), { keepResults: false }),
    filteredStats: normalizeStats(loadFilteredStats(), { keepResults: false }),
    unlimitedFilters: normalizeUnlimitedFilters(state.unlimitedFilters || loadUnlimitedFilters()),
    unlimitedDifficultyStats: loadUnlimitedDifficultyStatsMap(),
    archiveResults: loadArchiveResults(),
    achievements: loadAchievements(),
    bookmarks: loadBookmarks(),
    unlimitedHistory: loadUnlimitedHistory(),
    filteredHistory: loadFilteredHistory(),
    unlimitedDifficultyHistory: loadUnlimitedDifficultyHistoryMap(),
  };
}

function sanitizeArchiveResults(results) {
  if (!isPlainObject(results)) return {};
  return Object.fromEntries(
    Object.entries(results).filter(([dateKey, result]) => (
      /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && isPlainObject(result)
    ))
  );
}

function parseStatsBackup(text) {
  const backup = JSON.parse(text);
  if (!isPlainObject(backup)) throw new Error("Backup must be an object.");

  const dailySource = backup.stats || backup.dailyStats || backup.daily;
  const unlimitedSource = backup.unlimitedStats || backup.unlimited;
  const filteredSource = backup.filteredStats || backup.filtered || {};
  const archiveSource = backup.archiveResults || backup.archive || {};
  const achievementsSource = backup.achievements || {};

  if (!isPlainObject(dailySource) || !isPlainObject(unlimitedSource)) {
    throw new Error("Backup is missing stats.");
  }

  return {
    stats: normalizeStats(dailySource),
    unlimitedStats: normalizeStats(unlimitedSource, { keepResults: false }),
    filteredStats: normalizeStats(filteredSource, { keepResults: false }),
    unlimitedFilters: normalizeUnlimitedFilters(backup.unlimitedFilters || {}),
    unlimitedDifficultyStats: isPlainObject(backup.unlimitedDifficultyStats) ? backup.unlimitedDifficultyStats : {},
    archiveResults: sanitizeArchiveResults(archiveSource),
    achievements: normalizeAchievements(achievementsSource),
    bookmarks: normalizeBookmarks(backup.bookmarks || []),
    unlimitedHistory: Array.isArray(backup.unlimitedHistory) ? backup.unlimitedHistory.slice(0, unlimitedHistoryLimit) : [],
    filteredHistory: Array.isArray(backup.filteredHistory) ? backup.filteredHistory.slice(0, unlimitedHistoryLimit) : [],
    unlimitedDifficultyHistory: isPlainObject(backup.unlimitedDifficultyHistory) ? backup.unlimitedDifficultyHistory : {},
  };
}

function refreshAfterStatsImport() {
  renderStats();
  renderDifficultyModeControls();
  renderAchievements();
  renderBookmarkButton();
  renderBookmarks();
  renderArchiveCalendar();
  renderSourceTags();
  checkNewBadge();
}

function saveArchiveResult(dateKey, result) {
  if (!dateKey) return;
  const results = loadArchiveResults();
  results[dateKey] = result;
  saveArchiveResults(results);
}

function getArchiveStatsSummary() {
  const archiveSongs = getArchiveSongs();
  const archiveResults = loadArchiveResults();
  const dailyResults = loadStats().results || {};
  const entries = archiveSongs
    .map((song) => ({
      song,
      result: archiveResults[song.date] || dailyResults[song.date] || null,
    }))
    .filter((entry) => entry.result);
  const played = entries.length;
  const solved = entries.filter((entry) => entry.result.won).length;
  const revealed = played - solved;
  const total = archiveSongs.length;
  const completionRate = total > 0 ? Math.round((played / total) * 100) : 0;
  const solvedRate = total > 0 ? Math.round((solved / total) * 100) : 0;

  return {
    played,
    solved,
    revealed,
    total,
    completionRate,
    solvedRate,
  };
}

function getAchievementStatsSummary() {
  const achievements = loadAchievements();
  const unlockedCount = ACHIEVEMENTS.filter((achievement) => achievements.unlocked?.[achievement.id]).length;
  const total = ACHIEVEMENTS.length;
  return {
    unlocked: unlockedCount,
    total,
    rate: total > 0 ? Math.round((unlockedCount / total) * 100) : 0,
  };
}

function getStatsForMode(mode) {
  if (mode === "filtered") {
    return loadFilteredStats();
  }
  if (mode === "unlimited") {
    return state.statsDifficulty === "all"
      ? loadUnlimitedStats()
      : loadUnlimitedDifficultyStats(state.statsDifficulty);
  }
  return loadStats();
}

function saveStatsForMode(mode, stats) {
  if (mode === "filtered") {
    saveFilteredStats(stats);
    return;
  }
  if (mode === "unlimited") {
    if ((state.unlimitedDifficulty || "all") === "all") {
      saveUnlimitedStats(stats);
    } else {
      saveUnlimitedDifficultyStats(state.unlimitedDifficulty, stats);
    }
    return;
  }
  saveStats(stats);
}

function renderDifficultyModeControls() {
  if (difficultyModePanel) difficultyModePanel.hidden = state.mode !== "unlimited";
  if (difficultyPracticeNote) {
    difficultyPracticeNote.hidden = state.mode !== "unlimited";
    difficultyPracticeNote.textContent = getUnlimitedModeStatusNote();
  }

  difficultyModeButtons.forEach((button) => {
    const key = button.dataset.unlimitedDifficulty || "all";
    const count = getUnlimitedDifficultyCount(key);
    const countEl = button.querySelector("[data-difficulty-count]");
    button.classList.toggle("is-active", key === state.unlimitedDifficulty);
    button.disabled = key !== "all" && (difficultyPools.status === "loading" || difficultyPools.status === "idle" || count === 0);
    if (countEl) countEl.textContent = `(${count})`;
  });
  if (unlimitedFilterButton) {
    const count = getActiveFilterCount();
    unlimitedFilterButton.textContent = count > 0 ? t("filterButtonCount", count) : t("filterButton");
    unlimitedFilterButton.classList.toggle("is-active", count > 0);
  }
  renderFilterTags();
}

function renderUnlimitedHistory() {
  const list = document.querySelector("#unlimited-history-list");
  if (!list) return;
  const difficulty = state.statsMode === "filtered"
    ? "filtered"
    : state.statsMode === "unlimited" ? state.statsDifficulty : "all";
  const history = loadUnlimitedHistoryForDifficulty(difficulty);
  if (history.length === 0) {
    list.innerHTML = `<div class="unlimited-history-empty">No unlimited puzzles played yet.</div>`;
    return;
  }
  list.innerHTML = history.map((entry, i) => {
    const title = entry.displayTitle || entry.title || "Unknown";
    const artist = entry.artist || "";
    const attemptLabel = entry.won
      ? `${entry.attempts}/${clipStages.length}`
      : `x/${clipStages.length}`;
    const date = entry.completedAt
      ? new Date(entry.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "";
    return `
      <div class="unlimited-history-row ${entry.won ? "is-won" : "is-lost"}">
        <span class="unlimited-history-num">${i + 1}</span>
        <span class="unlimited-history-info">
          <span class="unlimited-history-title">${escapeHtml(title)}</span>
          <span class="unlimited-history-artist">${escapeHtml(artist)}</span>
        </span>
        <span class="unlimited-history-meta">
          <span class="unlimited-history-attempts">${attemptLabel}</span>
          <span class="unlimited-history-date">${escapeHtml(date)}</span>
        </span>
      </div>
    `;
  }).join("");
}

function renderSidebarSummaryBoxes() {
  const difficultyKeys = ["free", "easy", "medium", "hard", "unknown"];
  difficultyKeys.forEach((difficulty) => {
    const el = document.querySelector(`#sb-diff-${difficulty}`);
    if (!el) return;
    const stats = loadUnlimitedDifficultyStats(difficulty);
    el.textContent = stats.played > 0
      ? `${Math.round((stats.won / stats.played) * 100)}%`
      : "-";
  });

  const archive = getArchiveStatsSummary();
  const solvedEl = document.querySelector("#sb-archive-solved");
  const totalEl = document.querySelector("#sb-archive-total");
  const pctEl = document.querySelector("#sb-archive-pct");
  const barEl = document.querySelector("#sb-archive-bar");
  if (solvedEl) solvedEl.textContent = archive.solved;
  if (totalEl) totalEl.textContent = archive.total;
  if (pctEl) pctEl.textContent = `${archive.solvedRate}%`;
  if (barEl) barEl.style.width = `${archive.solvedRate}%`;
}

function renderStats() {
  const stats = state.statsMode === "daily"
    ? loadStats()
    : state.statsMode === "filtered"
      ? loadFilteredStats()
      : state.statsDifficulty === "all"
      ? loadUnlimitedStats()
      : loadUnlimitedDifficultyStats(state.statsDifficulty);
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDistribution = Math.max(...Object.values(stats.distribution), 1);

  statPlayed.textContent = stats.played;
  statWon.textContent = stats.won;
  statWinRate.textContent = `${winRate}%`;
  statCurrentStreak.textContent = stats.currentStreak;
  statMaxStreak.textContent = stats.maxStreak;

  // Personal avg attempts - weighted average of solve buckets 1-6.
  // "-" if no successful solves yet, since 0 average is misleading.
  if (statAvgAttempts) {
    const personalAvg = computePersonalAvg(stats.distribution);
    statAvgAttempts.textContent = personalAvg === null ? "-" : personalAvg.toFixed(1);
  }

  renderStatsDetails(stats);

  distributionItems.forEach((item) => {
    const key = item.dataset.distribution;
    const value = stats.distribution[key] || 0;
    const barHeight = Math.max((value / maxDistribution) * 100, value > 0 ? 10 : 4);
    const wrapper = item.closest("div");
    const bar = wrapper.querySelector(".guess-bar");

    item.textContent = value;
    bar.style.height = `${barHeight}%`;
    bar.style.opacity = value > 0 ? "1" : "0.45";
  });

  statsDailyButton.classList.toggle("is-active", state.statsMode === "daily");
  statsUnlimitedButton.classList.toggle("is-active", state.statsMode === "unlimited");
  if (statsFilteredButton) statsFilteredButton.classList.toggle("is-active", state.statsMode === "filtered");
  if (statsDifficultySwitch) statsDifficultySwitch.hidden = state.statsMode !== "unlimited";
  statsDifficultyButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.statsDifficulty === state.statsDifficulty);
  });

  // sync sidebar stats
  const sbMode = state.mode === "unlimited"
    ? hasActiveUnlimitedFilters()
      ? loadFilteredStats()
      : state.unlimitedDifficulty === "all"
      ? loadUnlimitedStats()
      : loadUnlimitedDifficultyStats(state.unlimitedDifficulty)
    : loadStats();
  const sbWinRate = sbMode.played > 0 ? Math.round((sbMode.won / sbMode.played) * 100) : 0;
  const sbPlayed = document.querySelector("#sb-played");
  const sbWon = document.querySelector("#sb-won");
  const sbRate = document.querySelector("#sb-rate");
  const sbStreak = document.querySelector("#sb-streak");
  const sbBest = document.querySelector("#sb-best");
  const sbAvg = document.querySelector("#sb-avg");
  if (sbPlayed) sbPlayed.textContent = sbMode.played;
  if (sbWon) sbWon.textContent = sbMode.won;
  if (sbRate) {
    sbRate.textContent = `${sbWinRate}%`;
    const bar = document.querySelector("#sb-winrate-bar");
    if (bar) bar.style.width = `${sbWinRate}%`;
  }
  if (sbStreak) {
    sbStreak.textContent = sbMode.currentStreak;
    const streakRow = document.querySelector("#streak-row");
    if (streakRow) streakRow.classList.toggle("streak-hot", sbMode.currentStreak >= 5);
  }
  if (sbBest) sbBest.textContent = sbMode.maxStreak;
  if (sbAvg) {
    const sbPersonalAvg = computePersonalAvg(sbMode.distribution);
    sbAvg.textContent = sbPersonalAvg === null ? "-" : sbPersonalAvg.toFixed(1);
  }

  const totalEl = document.querySelector("#sb-total-songs");
  if (totalEl) totalEl.textContent = songs.length.toLocaleString();

  // update sidebar label
  const sbLabel = document.querySelector("#sb-mode-label");
  if (sbLabel) {
    const statsLabel = state.mode === "unlimited" && hasActiveUnlimitedFilters()
      ? `${t("modalStatsFilteredBtn")} ${t("unlimitedStats")}`
      : state.mode === "unlimited" && state.unlimitedDifficulty !== "all"
        ? `${getDifficultyLabel(state.unlimitedDifficulty)} ${t("unlimitedStats")}`
        : state.mode === "unlimited" ? t("unlimitedStats") : t("dailyStats");
    sbLabel.textContent = statsLabel;
  }

  // show history link only on unlimited tab
  const historyLink = document.querySelector("#unlimited-history-link");
  if (historyLink) historyLink.hidden = state.statsMode !== "unlimited" && state.statsMode !== "filtered";

  renderSidebarSummaryBoxes();
}

function formatRarestStat(record) {
  if (!record || !record.title) return t("statsNoneYet");
  return t("statsRarestLine", escapeHtml(record.title), record.rate);
}

function getPublishYearSummaries(yearStats = {}) {
  const rows = Object.entries(normalizeYearStats(yearStats))
    .map(([year, data]) => ({
      year,
      played: Number(data.played) || 0,
      won: Number(data.won) || 0,
      rate: data.played > 0 ? Math.round((data.won / data.played) * 100) : 0,
    }))
    .filter((row) => row.played > 0);

  const best = [...rows].sort((a, b) => (
    b.rate - a.rate ||
    b.won - a.won ||
    b.played - a.played ||
    Number(b.year) - Number(a.year)
  ))[0] || null;

  const mostPlayed = [...rows].sort((a, b) => (
    b.played - a.played ||
    b.won - a.won ||
    Number(b.year) - Number(a.year)
  ))[0] || null;

  return { best, mostPlayed };
}

function formatBestYearStat(row) {
  if (!row) return t("statsNoneYet");
  return t("statsYearLine", row.year, row.won, row.played, row.rate);
}

function formatMostPlayedYearStat(row) {
  if (!row) return t("statsNoneYet");
  return t("statsYearPlayedLine", row.year, row.played);
}

function renderStatsDetails(stats) {
  if (!statsDetailList) return;
  const summary = getLocalStatsSummary(stats);
  const yearSummary = getPublishYearSummaries(stats.yearStats);
  const archive = getArchiveStatsSummary();
  const achievements = getAchievementStatsSummary();
  const rows = [
    [t("statsFirstTry"), String(summary.firstTrySolves)],
    [t("statsRarestSolve"), formatRarestStat(summary.rarestSolve)],
    [t("statsRarestFirstTry"), formatRarestStat(summary.rarestFirstTry)],
    [t("statsBestPublishYear"), formatBestYearStat(yearSummary.best)],
    [t("statsMostPlayedYear"), formatMostPlayedYearStat(yearSummary.mostPlayed)],
  ];

  const statRows = rows.map(([label, value]) => `
    <div class="stats-detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  const archiveBlock = `
    <div class="stats-detail-group">
      <h3>${escapeHtml(t("statsArchiveGroup"))}</h3>
      <div class="archive-progress-stat">
        <div class="archive-progress-top">
          <span>${escapeHtml(t("statsArchiveProgress"))}</span>
          <strong>${escapeHtml(t("statsArchiveProgressLine", archive.solved, archive.total, archive.solvedRate))}</strong>
        </div>
        <div class="archive-progress-bar" aria-hidden="true">
          <span class="archive-progress-solved" style="width:${archive.total > 0 ? (archive.solved / archive.total) * 100 : 0}%"></span>
          <span class="archive-progress-revealed" style="width:${archive.total > 0 ? (archive.revealed / archive.total) * 100 : 0}%"></span>
        </div>
      </div>
    </div>
  `;

  const achievementsBlock = `
    <div class="stats-detail-group">
      <h3>${escapeHtml(t("statsAchievementsGroup"))}</h3>
      <div class="archive-progress-stat">
        <div class="archive-progress-top">
          <span>${escapeHtml(t("statsAchievementsProgress"))}</span>
          <strong>${escapeHtml(t("statsAchievementsProgressLine", achievements.unlocked, achievements.total, achievements.rate))}</strong>
        </div>
        <div class="achievement-progress-track" aria-hidden="true">
          <span style="width:${achievements.rate}%"></span>
        </div>
      </div>
    </div>
  `;

  statsDetailList.innerHTML = statRows + archiveBlock + achievementsBlock;
}

// Weighted average of solve attempts 1-6. Returns null if no solves recorded.
function computePersonalAvg(distribution) {
  if (!distribution) return null;
  let total = 0;
  let weighted = 0;
  for (let i = 1; i <= 6; i++) {
    const c = Number(distribution[i]) || 0;
    total += c;
    weighted += i * c;
  }
  return total > 0 ? weighted / total : null;
}

function getLocalStatsSummary(stats) {
  const played = Number(stats.played) || 0;
  const solved = Number(stats.won) || 0;
  return {
    played,
    solved,
    winRate: played > 0 ? Math.round((solved / played) * 100) : 0,
    avgSolve: computePersonalAvg(stats.distribution),
    firstTrySolves: Number(stats.firstTrySolves) || Number(stats.distribution?.[1]) || 0,
    currentStreak: Number(stats.currentStreak) || 0,
    maxStreak: Number(stats.maxStreak) || 0,
    rarestSolve: stats.hardestSolved || null,
    rarestFirstTry: stats.rarestFirstTry || null,
  };
}

function getProfileStats() {
  return {
    daily: getLocalStatsSummary(loadStats()),
    unlimited: getLocalStatsSummary(loadUnlimitedStats()),
    archive: getArchiveStatsSummary(),
    achievements: getAchievementStatsSummary(),
  };
}

function formatProfileAvg(value) {
  return value === null || value === undefined ? "-" : `${value.toFixed(1)}/6`;
}

function formatProfileRarest(record) {
  if (!record || !record.title) return t("profileNoData");
  return `${record.title} - ${record.rate}%`;
}

function chooseRarestRecord(...records) {
  return records
    .filter((record) => record && record.title && typeof record.rate === "number")
    .sort((a, b) => a.rate - b.rate)[0] || null;
}

function buildProfileText() {
  const profile = getProfileStats();
  const daily = profile.daily;
  const unlimited = profile.unlimited;
  const archive = profile.archive;
  const achievements = profile.achievements;
  const totalPlayed = daily.played + unlimited.played;
  const totalSolved = daily.solved + unlimited.solved;
  const totalWinRate = totalPlayed > 0 ? Math.round((totalSolved / totalPlayed) * 100) : 0;

  return [
    "VOCALOID Heardle Profile",
    "",
    `${totalPlayed} ${t("profilePlayed")} - ${totalWinRate}% ${t("profileWinRate")}`,
    `${t("profileDaily")}: ${daily.played} ${t("profilePlayed")} - ${daily.winRate}% - ${t("profileAvgSolve")}: ${formatProfileAvg(daily.avgSolve)}`,
    `${t("profileUnlimited")}: ${unlimited.played} ${t("profilePlayed")} - ${unlimited.winRate}% - ${t("profileAvgSolve")}: ${formatProfileAvg(unlimited.avgSolve)}`,
    `${t("profileFirstTry")}: ${daily.firstTrySolves + unlimited.firstTrySolves}`,
    `${t("profileBestStreak")}: ${Math.max(daily.maxStreak, unlimited.maxStreak)}`,
    `${t("profileRarestSolve")}: ${formatProfileRarest(chooseRarestRecord(daily.rarestSolve, unlimited.rarestSolve))}`,
    `${t("profileRarestFirstTry")}: ${formatProfileRarest(chooseRarestRecord(daily.rarestFirstTry, unlimited.rarestFirstTry))}`,
    `${t("profileArchive")}: ${archive.solved}/${archive.total} ${t("profileSolved")} - ${archive.completionRate}% ${t("profileOpened")}`,
    `${t("profileAchievements")}: ${achievements.unlocked}/${achievements.total} - ${achievements.rate}%`,
  ].join("\n");
}

// Countdown to the next local midnight, when a new daily puzzle becomes available.
// Only ticks while the daily round is complete (saves cycles when not visible).
let countdownTimer = null;
function updateNextDailyCountdown() {
  if (!nextDailyCountdownEl) return;
  // Show only when a daily round is finished. Hidden in unlimited mode entirely.
  const shouldShow = state.mode === "daily" && state.isComplete;
  if (!shouldShow) {
    nextDailyCountdownEl.hidden = true;
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    return;
  }
  renderCountdownTick();
  if (!countdownTimer) {
    countdownTimer = setInterval(renderCountdownTick, 1000);
  }
}

function renderCountdownTick() {
  if (!nextDailyCountdownEl) return;
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const ms = tomorrow - now;
  if (ms <= 0) {
    nextDailyCountdownEl.innerHTML = `<strong>${t("nextDailyReady")}</strong>`;
    nextDailyCountdownEl.hidden = false;
    return;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  nextDailyCountdownEl.innerHTML = t("nextDailyCountdown", h, m, s);
  nextDailyCountdownEl.hidden = false;
}

function getArchiveSongs() {
  const todayKey = getDateKey();
  return songs
    .filter((song) => song.date && song.audioClip && song.date <= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getArchiveSongMap() {
  return new Map(getArchiveSongs().map((song) => [song.date, song]));
}

function getMinArchiveMonth() {
  return new Date(2026, 4, 1);
}

function getMaxArchiveMonth() {
  const archiveSongs = getArchiveSongs();
  const latestDate = archiveSongs.at(-1)?.date || getDateKey();
  const latest = parseDateKey(latestDate);
  return new Date(latest.getFullYear(), latest.getMonth(), 1);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function clampArchiveMonth(date) {
  const min = getMinArchiveMonth();
  const max = getMaxArchiveMonth();
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

function ensureArchiveMonth() {
  if (state.archiveMonth) return;
  state.archiveMonth = getMaxArchiveMonth();
}

function shiftArchiveMonth(offset) {
  ensureArchiveMonth();
  state.archiveMonth = clampArchiveMonth(new Date(
    state.archiveMonth.getFullYear(),
    state.archiveMonth.getMonth() + offset,
    1
  ));
  renderArchiveCalendar();
}

function getRandomArchiveSong() {
  const archiveSongList = getArchiveSongs();
  if (archiveSongList.length === 0) return null;

  const dailyResults = loadStats().results || {};
  const archiveResults = loadArchiveResults();
  const unopened = archiveSongList.filter((song) => !archiveResults[song.date] && !dailyResults[song.date]);
  const pool = unopened.length > 0 ? unopened : archiveSongList;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

function renderArchiveCalendar() {
  if (!archiveGrid || !archiveMonthLabel) return;
  ensureArchiveMonth();
  state.archiveMonth = clampArchiveMonth(state.archiveMonth);

  const lang = getLang();
  const archiveSongList = getArchiveSongs();
  const archiveSongs = new Map(archiveSongList.map((song) => [song.date, song]));
  const dailyResults = loadStats().results || {};
  const archiveResults = loadArchiveResults();
  const todayKey = getDateKey();
  const monthStart = state.archiveMonth;
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = new Intl.DateTimeFormat(getDateLocale(), {
    month: "long",
    year: "numeric",
  }).format(monthStart);
  archiveMonthLabel.textContent = monthLabel;

  if (archivePrevMonth) archivePrevMonth.disabled = monthKey(monthStart) <= monthKey(getMinArchiveMonth());
  if (archiveNextMonth) archiveNextMonth.disabled = monthKey(monthStart) >= monthKey(getMaxArchiveMonth());
  if (archiveSummary) {
    const monthSongList = archiveSongList.filter((song) => {
      const songDate = parseDateKey(song.date);
      return songDate.getFullYear() === year && songDate.getMonth() === month;
    });
    const monthResultEntries = monthSongList
      .map((song) => archiveResults[song.date] || dailyResults[song.date] || null)
      .filter(Boolean);
    const monthSolvedCount = monthResultEntries.filter((result) => result.won).length;
    const monthSolveRate = monthSongList.length > 0
      ? Math.round((monthSolvedCount / monthSongList.length) * 100)
      : 0;
    archiveMonthLabel.innerHTML = `
      <span>${escapeHtml(monthLabel)}</span>
      <span class="archive-month-badge">${escapeHtml(t("archiveMonthBadge", monthSolvedCount, monthSongList.length, monthSolveRate))}</span>
    `;

    const resultEntries = monthSongList
      .map((song) => archiveResults[song.date] || dailyResults[song.date] || null)
      .filter(Boolean);
    const openedCount = resultEntries.length;
    const solvedCount = resultEntries.filter((result) => result.won).length;
    const revealedCount = openedCount - solvedCount;
    const completionRate = monthSongList.length > 0
      ? Math.round((openedCount / monthSongList.length) * 100)
      : 0;

    archiveSummary.innerHTML = [
      [t("archiveSummaryOpened"), openedCount],
      [t("archiveSummarySolved"), solvedCount],
      [t("archiveSummaryRevealed"), revealedCount],
      [t("archiveSummaryComplete"), `${completionRate}%`],
    ].map(([label, value]) => `
      <span class="archive-summary-item">
        <strong>${escapeHtml(String(value))}</strong>
        <span>${escapeHtml(label)}</span>
      </span>
    `).join("");
  }
  renderArchiveInsights(year, month, archiveSongList);

  const cells = [];
  for (let i = 0; i < firstDay.getDay(); i++) {
    cells.push(`<span class="archive-day is-empty" aria-hidden="true"></span>`);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const song = archiveSongs.get(key);
    const disabled = !song || key > todayKey;
    const selected = key === state.archiveDate;
    const result = archiveResults[key] || dailyResults[key] || null;
    const completed = Boolean(result);
    const title = !song ? t("archiveEmpty") : completed ? getDisplayTitle(song) : t("archiveUnplayed");
    const visibleTitle = !song ? title : truncateTitle(title, window.matchMedia("(max-width: 680px)").matches ? 28 : 14);
    const status = result ? (result.won ? t("archiveSolved") : t("archiveFailed")) : "";
    const attemptLabel = result?.won && result.attempts ? `${result.attempts}/${clipStages.length}` : "";
    const attemptClass = result?.won && result.attempts ? `is-attempt-${result.attempts}` : "";
    const cellClass = [
      "archive-day",
      selected ? "is-selected" : "",
      completed ? "is-complete" : "",
      result?.won ? "is-solved" : "",
      result && !result.won ? "is-failed" : "",
      !song ? "is-no-puzzle" : "",
      song && !completed ? "is-locked" : "",
      attemptClass,
    ].filter(Boolean).join(" ");

    cells.push(`
      <button
        class="${cellClass}"
        type="button"
        data-archive-date="${key}"
        ${disabled ? "disabled" : ""}
        title="${escapeHtml(title)}"
      >
        <span class="archive-day-number">${day}</span>
        <span class="archive-day-title">${escapeHtml(visibleTitle)}</span>
        ${attemptLabel ? `<span class="archive-day-attempt">${escapeHtml(attemptLabel)}</span>` : status ? `<span class="archive-day-status">${escapeHtml(status)}</span>` : ""}
      </button>
    `);
  }

  archiveGrid.innerHTML = cells.join("");
}

const archiveGlobalStatsCache = new Map();

async function getSongGlobalStats(songId) {
  if (!songId) return null;
  const key = String(songId);
  if (archiveGlobalStatsCache.has(key)) return archiveGlobalStatsCache.get(key);

  try {
    const res = await fetch(`${WORKER_URL}/stats?songId=${encodeURIComponent(key)}`);
    if (!res.ok) {
      archiveGlobalStatsCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const plays = data.plays || 0;
    if (plays < 1) {
      archiveGlobalStatsCache.set(key, null);
      return null;
    }
    const wins = data.wins || 0;
    const rate = Math.round((wins / plays) * 100);
    const buckets = data.attempts || {};
    let totalSolves = 0;
    let weightedSum = 0;
    for (const [attempt, count] of Object.entries(buckets)) {
      const n = parseInt(attempt, 10);
      const c = Number(count) || 0;
      if (Number.isFinite(n) && n >= 1 && n <= 6) {
        totalSolves += c;
        weightedSum += n * c;
      }
    }
    const avg = totalSolves > 0 ? weightedSum / totalSolves : null;
    const stats = { plays, wins, rate, avg };
    archiveGlobalStatsCache.set(key, stats);
    return stats;
  } catch {
    archiveGlobalStatsCache.set(key, null);
    return null;
  }
}

async function renderArchiveInsights(year, month, archiveSongList) {
  if (!archiveInsights) return;
  const requestedMonth = monthKey(new Date(year, month, 1));
  const dailyResults = loadStats().results || {};
  const archiveResults = loadArchiveResults();
  const monthSongs = archiveSongList.filter((song) => {
    const songDate = parseDateKey(song.date);
    return songDate.getFullYear() === year && songDate.getMonth() === month;
  }).filter((song) => archiveResults[song.date] || dailyResults[song.date]);

  if (monthSongs.length === 0) {
    archiveInsights.innerHTML = `<p>${escapeHtml(t("archiveInsightsEmpty"))}</p>`;
    return;
  }

  archiveInsights.innerHTML = `<p>${escapeHtml(t("archiveInsightsLoading"))}</p>`;
  const rows = (await Promise.all(monthSongs.map(async (song) => {
    const stats = await getSongGlobalStats(song.vocadbId);
    return stats ? { song, ...stats } : null;
  }))).filter(Boolean);

  if (requestedMonth !== monthKey(state.archiveMonth)) return;
  if (rows.length === 0) {
    archiveInsights.innerHTML = `<p>${escapeHtml(t("archiveInsightsEmpty"))}</p>`;
    return;
  }

  const hardest = [...rows].sort((a, b) =>
    a.rate - b.rate ||
    (b.avg ?? 0) - (a.avg ?? 0) ||
    b.plays - a.plays
  )[0];
  const easiest = [...rows].sort((a, b) =>
    b.rate - a.rate ||
    (a.avg ?? 7) - (b.avg ?? 7) ||
    b.plays - a.plays
  )[0];
  const renderRow = (label, entry) => `
    <span class="archive-insight-row">
      <strong>${escapeHtml(label)}:</strong>
      <span>${escapeHtml(truncateTitle(getDisplayTitle(entry.song), 32))}</span>
      <em>${entry.rate}%</em>
    </span>
  `;

  archiveInsights.innerHTML = [
    renderRow(t("archiveHardest"), hardest),
    renderRow(t("archiveEasiest"), easiest),
  ].join("");
}

function makeMailto(subject, body) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function getPuzzleContextLines() {
  const puzzle = state.puzzle;
  return [
    `Mode: ${state.mode}`,
    `Date: ${state.archiveDate || getDateKey()}`,
    `Song: ${puzzle ? getDisplayTitle(puzzle) : "Unknown"}`,
    `Artist: ${puzzle ? getSuggestionArtist(puzzle) : "Unknown"}`,
    `VocaDB ID: ${puzzle?.vocadbId || "Unknown"}`,
    `VocaDB URL: ${puzzle?.vocadbUrl || "Unknown"}`,
    `Audio URL: ${puzzle?.audioClip || "Unknown"}`,
  ];
}

function updateReportContext() {
  if (!reportContext) return;
  if (!state.puzzle) {
    reportContext.textContent = t("modalReportIntro");
    return;
  }
  reportContext.textContent = `Reporting: ${getDisplayTitle(state.puzzle)} - ${getSuggestionArtist(state.puzzle)}`;
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);

  if (!modal) {
    return;
  }

  closeModal();
  activeModal = modal;
  if (modalId === "report-issue") updateReportContext();
  modal.hidden = false;
  modalBackdrop.hidden = false;
}

function closeModal() {
  if (activeModal) {
    if (activeModal.id === "bookmarks") stopBookmarkAudio();
    activeModal.hidden = true;
    activeModal = null;
  }

  modalBackdrop.hidden = true;
}

function formatToday() {
  const lang = getLang();
  const today = new Date();
  if (lang === "jp") {
    return new Intl.DateTimeFormat(getDateLocale(), {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(today);
  }
  if (lang === "ko") {
    return new Intl.DateTimeFormat(getDateLocale(), {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(today);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(today);
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeGuess(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getSongSearchValues(song) {
  return [
    song.title,
    song.artist,
    song.artistString,
    song.displayArtist,
    song.suggestionArtistString,
    song.vocadbName,
    ...(song.acceptedTitles || []),
    ...(song.producerNames || []),
    ...(song.singerNames || []),
    ...(song.artistSearchNames || []),
  ].filter(Boolean);
}

const JP_NAME_MAP = {
  // ── Vocaloid / Synth singers ──
  "Hatsune Miku": "初音ミク",
  "Kagamine Rin": "鏡音リン",
  "Kagamine Len": "鏡音レン",
  "Megurine Luka": "巡音ルカ",
  "KAITO": "KAITO",
  "MEIKO": "MEIKO",
  "Gumi": "GUMI",
  "IA": "IA",
  "Kaai Yuki": "歌愛ユキ",
  "Kasane Teto": "重音テト",
  "Yuzuki Yukari": "結月ゆかり",
  "Tohoku Zunko": "東北ずん子",
  "Kizuna Akari": "紲星あかり",
  "Tone Rion": "音街ウナ",
  "Una": "音街ウナ",
  "Nekomura Iroha": "猫村いろは",
  "SF-A2 miki": "SF-A2 miki",
  "CUL": "CUL",
  "VY1": "VY1",
  "VY2": "VY2",
  "Lily": "Lily",
  "Macne Nana": "マクネナナ",
  "Kokone": "ここね",
  "Mayu": "MAYU",
  "Azuki": "小豆",
  "Merli": "メルリ",
  "Galaco": "GALACO",
  "Rana": "ラナ",
  "Ring Suzune": "鈴音リン",
  "Fukase": "FUKASE",
  "Tsurumaki Maki": "弦巻マキ",
  "Tohoku Kiritan": "東北きりたん",
  "Tohoku Itako": "東北イタコ",
  "Shizuku Otonase": "音瀬しずく",
  "Akane Lino": "燐音アカネ",
  "Various artists": "Various artists",
  // ── Producers ──
  "PinocchioP": "ピノキオピー",
  "DECO*27": "DECO*27",
  "wowaka": "wowaka",
  "ryo": "ryo",
  "supercell": "supercell",
  "kemu": "kemu",
  "cosMo@BousouP": "cosMo@暴走P",
  "HachioujiP": "八王子P",
  "MikuP": "ミクP",
  "MikitoP": "みきとP",
  "UtataP": "うたたP",
  "UtsuP": "うつP",
  "Utsu-P": "うつP",
  "LamazeP": "ラマーズP",
  "GomP": "GomP",
  "Gom": "Gom",
  "NayutalieN": "ナユタン星人",
  "Orangestar": "Orangestar",
  "n-buna": "n-buna",
  "doriko": "doriko",
  "halyosy": "halyosy",
  "baker": "baker",
  "kz": "kz",
  "livetune": "livetune",
  "samfree": "samfree",
  "sasakure.UK": "sasakure.UK",
  "Satsuki ga Tenkomori": "さつき が てんこもり",
  "syudou": "しゅーず",
  "inabakumori": "稲葉曇",
  "Yoasobi": "YOASOBI",
  "Eve": "Eve",
  "Reol": "Reol",
  "iroha(sasaki)": "iroha(sasaki)",
  "mothy": "悪ノP",
  "Hitoshizuku": "一粒",
  "HitoshizukuP": "一粒P",
  "KurousaP": "黒うさP",
  "Last Note.": "LastNote.",
  "Nem": "Nem",
  "Neru": "Neru",
  "Kikuo": "きくお",
  "Kanaria": "カナリア",
  "Omoi": "Omoi",
  "MARETU": "MARETU",
  "Mitchie M": "Mitchie M",
  "Junky": "Junky",
  "Scop": "scop",
  "scop": "scop",
  "tilt-six": "tilt-six",
  "Giga": "Giga",
  "otetsu": "otetsu",
  "Hitorie": "ヒトリエ",
  "JIN": "じん",
  "Kairiki bear": "カイリキーベア",
  "Chinozo": "チノゾ",
  "Yuuyu": "ゆうゆ",
  "Yuyoyuppe": "ゆよゆっぺ",
  "HoneyWorks": "HoneyWorks",
  "Toraboruta": "とらぼるた",
  "OSTER project": "OSTER project",
  "EasyPop": "EasyPop",
  "Machigerita": "まちゲリータ",
  "Suzumu": "鈴木",
  "Tsumiki": "ツミキ",
  "Teniwoha": "てにをは",
  "Hiiragi Kirai": "柊キライ",
  "Harumaki Gohan": "春巻飯",
  "Koronba": "コロンバ",
  "Nanou": "なのう",
  "nanou": "なのう",
  "balloon": "balloon",
  "niki": "niki",
  "keeno": "keeno",
  "Iyowa": "イヨワ",
  "iyowa": "イヨワ",
  "koyori": "こより",
  "Yurry Canon": "ゆるりかのん",
  "YurryCanon": "ゆるりかのん",
  "Mafumafu": "まふまふ",
  "Siinamota": "椎名もた",
  "siinamota": "椎名もた",
  "Owata P": "おわたP",
  "OwataP": "おわたP",
  "Polyphonicbranch": "ポリフォニックブランチ",
  "PolyphonicBranch": "ポリフォニックブランチ",
  "Rerulili": "れるりり",
  "rerulili": "れるりり",
  "Shikata Akiko": "志方あきこ",
  "Nasimoto Ui": "なしもとうい",
  "NashimotoUi": "なしもとうい",
  "Nashimoto Ui": "なしもとうい",
  "1640mP": "1640mP",
  "HACHI": "ハチ",
  "WADATAKEAKI": "WADATAKEAKI",
  "Daniwell": "daniwell",
  "daniwell": "daniwell",
  "Chouchou P": "ちょうちょP",
  "ChouchouP": "ちょうちょP",
  "CircusP": "サーカスP",
  "Circus P": "サーカスP",
  "Ginsaku": "銀咲",
  "Yukopi": "ゆこぴ",
  "Camellia": "かめりあ",
  "Toa": "toa",
  "Storyteller": "Storyteller",
  "Minato": "湊",
  "Minato Takahiro": "湊貴広",
  "n.k": "n.k",
  "Dios/SignalP": "DIOS/シグナルP",
  "Sasanomaly": "笹野末莉",
  "Neru": "Neru",
  "Yama": "yama",
  "yama△": "yama△",
  "Sohta": "そうた",
  "Noripy": "のりぴ",
  "noripy": "のりぴ",
};


function jpifyArtist(artistStr) {
  if (!artistStr) return artistStr;
  let result = artistStr;
  for (const [en, jp] of Object.entries(JP_NAME_MAP)) {
    result = result.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), jp);
  }
  return result;
}

function getSuggestionArtist(song) {
  const base = song.suggestionArtistString || song.displayArtist || song.artistString || song.artist || "";
  if (getLang() === "jp") return jpifyArtist(base);
  return base;
}

function getUniqueSongTitleCandidates(song) {
  const seen = new Set();
  return [song.title, song.vocadbName, ...(song.acceptedTitles || [])]
    .filter(Boolean)
    .filter((title) => {
      const normalized = normalizeGuess(title);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function getTitleMatchScore(title, query, isSingleCJK = false) {
  const normalizedTitle = normalizeGuess(title);

  if (isSingleCJK) {
    return normalizedTitle === query ? 100 : 0;
  }

  if (normalizedTitle === query) return 100;
  if (
    normalizedTitle.startsWith(`${query} `) ||
    normalizedTitle.startsWith(`${query}-`) ||
    normalizedTitle.startsWith(`${query}:`)
  ) return 80;
  if (normalizedTitle.startsWith(query)) return 70;
  if (wordBoundaryMatch(normalizedTitle, query)) return 50;
  if (normalizedTitle.includes(query)) return 30;

  return 0;
}

function getBestMatchedTitle(song, query, isSingleCJK = false) {
  return getUniqueSongTitleCandidates(song)
    .map((title, index) => ({
      title,
      index,
      score: getTitleMatchScore(title, query, isSingleCJK),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => (
      b.score - a.score ||
      a.title.length - b.title.length ||
      a.index - b.index
    ))[0] || null;
}

function getMatchingSongEntries(value) {
  const query = normalizeGuess(value);
  if (!query) return [];

  // For single CJK characters, only match if it's an exact title/acceptedTitle match
  // to prevent "ガ" from flooding results with everything containing that kana.
  const isSingleCJK = query.length === 1 && /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/.test(query);

  const scored = [];

  songs.forEach((song) => {
    const titleMatch = getBestMatchedTitle(song, query, isSingleCJK);
    const artistFields = [
      song.artist,
      song.artistString,
      song.displayArtist,
      song.suggestionArtistString,
      ...(song.producerNames || []),
      ...(song.singerNames || []),
      ...(song.artistSearchNames || []),
    ].filter(Boolean).map(normalizeGuess);

    if (isSingleCJK) {
      // Only surface if query is an exact match against a title or accepted title
      if (titleMatch) {
        scored.push({ song, score: titleMatch.score, matchedTitle: titleMatch.title, matchType: "title" });
      }
      return;
    }

    let score = titleMatch?.score || 0;
    let matchType = titleMatch ? "title" : "artist";

    // ── Artist scoring (lower ceiling so title matches always win) ──
    if (score === 0) {
      if (artistFields.some((a) => a === query)) {
        score = Math.max(score, 60);                         // exact artist name
      } else if (artistFields.some((a) => a.startsWith(query))) {
        score = Math.max(score, 45);                         // artist prefix
      } else if (artistFields.some((a) => wordBoundaryMatch(a, query))) {
        score = Math.max(score, 35);                         // word in artist
      } else if (artistFields.some((a) => a.includes(query))) {
        score = Math.max(score, 20);                         // substring in artist
      }
    } else {
      // Even when we already have a title match, boost if artist also matches
      // so "utsu-p moth" surfaces more precisely
      if (artistFields.some((a) => a.includes(query))) {
        score += 5;
      }
    }

    if (score > 0) scored.push({
      song,
      score,
      matchedTitle: titleMatch?.title || getDisplayTitle(song),
      matchType,
    });
  });

  scored.sort((a, b) => (
    b.score - a.score ||
    getDisplayTitle(a.song).localeCompare(getDisplayTitle(b.song), undefined, { sensitivity: "base" })
  ));
  return scored.slice(0, 12);
}

function getMatchingSongs(value) {
  return getMatchingSongEntries(value).map((entry) => entry.song);
}

function renderSuggestCheckResults() {
  if (!suggestCheckInput || !suggestCheckResults) return;

  const query = suggestCheckInput.value.trim();
  if (!query) {
    suggestCheckResults.innerHTML = `<p class="suggest-check-empty">${escapeHtml(t("modalSuggestCheckStart"))}</p>`;
    return;
  }

  const idMatch = query.match(/(?:vocadb\.net\/S\/|\b)(\d{2,})\b/i);
  const idSong = idMatch
    ? songs.find((song) => String(song.vocadbId) === String(idMatch[1]))
    : null;
  const matches = [
    ...(idSong ? [idSong] : []),
    ...getMatchingSongs(query).filter((song) => !idSong || String(song.vocadbId) !== String(idSong.vocadbId)),
  ].slice(0, 6);
  if (!matches.length) {
    suggestCheckResults.innerHTML = `<p class="suggest-check-empty">${escapeHtml(t("modalSuggestCheckNone"))}</p>`;
    return;
  }

  suggestCheckResults.innerHTML = matches.map((song) => {
    const year = song.publishYear || song.year || "";
    const artist = getSuggestionArtist(song);
    const meta = [artist, year].filter(Boolean).join(" - ");
    return `
      <div class="suggest-check-result">
        <span>
          <strong>${escapeHtml(getDisplayTitle(song))}</strong>
          ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
        </span>
        <span class="suggest-check-status">${escapeHtml(t("modalSuggestCheckStatus"))}</span>
      </div>
    `;
  }).join("");
}

// Returns true if `query` appears at a word boundary inside `text`
function wordBoundaryMatch(text, query) {
  if (!text.includes(query)) return false;
  const idx = text.indexOf(query);
  const before = idx === 0 || /[\s\-:(,]/.test(text[idx - 1]);
  const after = idx + query.length >= text.length || /[\s\-:),]/.test(text[idx + query.length]);
  return before && after;
}

function getDailyPuzzle() {
  return songs.find((song) => song.date === getDateKey()) || null;
}

function getArchivePuzzle() {
  if (!state.archiveDate) {
    return null;
  }

  return songs.find((song) => song.date === state.archiveDate) || null;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatArchiveDate(dateKey) {
  const date = parseDateKey(dateKey);
  return new Intl.DateTimeFormat(getDateLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function isArchiveDatePlayable(dateKey) {
  if (!dateKey || dateKey > getDateKey()) return false;
  return songs.some((song) => song.date === dateKey && song.audioClip);
}

function getArchiveDateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const queryDate = params.get("archive");
  const hashMatch = window.location.hash.match(/^#archive(?:=|\/)(\d{4}-\d{2}-\d{2})$/);
  const dateKey = queryDate || hashMatch?.[1] || "";
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : "";
}

function setArchiveUrl(dateKey, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("archive", dateKey);
  url.hash = "";
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", url);
}

function clearArchiveUrl(replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.delete("archive");
  url.hash = "";
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", url);
}

function loadArchiveDate(dateKey, replaceUrl = false) {
  if (!isArchiveDatePlayable(dateKey)) return false;
  // Save but don't forfeit the active unlimited round - player can return to it.
  saveActiveUnlimitedIfNeeded();
  state.mode = "archive";
  state.archiveDate = dateKey;
  state.archiveMonth = new Date(parseDateKey(dateKey).getFullYear(), parseDateKey(dateKey).getMonth(), 1);
  rememberCurrentMode();
  setArchiveUrl(dateKey, replaceUrl);
  document.title = `VOCALOID Heardle - ${formatArchiveDate(dateKey)}`;
  loadPuzzle();
  renderStats();
  renderArchiveCalendar();
  return true;
}

function getRandomIndex(length) {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % length;
  }

  return Math.floor(Math.random() * length);
}

function shuffleSongs(playableSongs) {
  const shuffledSongs = [...playableSongs];

  for (let index = shuffledSongs.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomIndex(index + 1);
    [shuffledSongs[index], shuffledSongs[swapIndex]] = [shuffledSongs[swapIndex], shuffledSongs[index]];
  }

  return shuffledSongs;
}

function loadUnlimitedHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(unlimitedHistoryKey)) || [];
    return Array.isArray(parsed) ? parsed.slice(0, unlimitedHistoryLimit) : [];
  } catch {
    return [];
  }
}

function saveUnlimitedHistory(history) {
  localStorage.setItem(unlimitedHistoryKey, JSON.stringify(history.slice(0, unlimitedHistoryLimit)));
}

function loadFilteredHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(filteredHistoryKey)) || [];
    return Array.isArray(parsed) ? parsed.slice(0, unlimitedHistoryLimit) : [];
  } catch {
    return [];
  }
}

function saveFilteredHistory(history) {
  localStorage.setItem(filteredHistoryKey, JSON.stringify(history.slice(0, unlimitedHistoryLimit)));
}

function loadUnlimitedDifficultyHistoryMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(unlimitedDifficultyHistoryKey)) || {};
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveUnlimitedDifficultyHistoryMap(map) {
  localStorage.setItem(unlimitedDifficultyHistoryKey, JSON.stringify(map));
}

function loadUnlimitedHistoryForDifficulty(difficulty = "all") {
  if (difficulty === "filtered") return loadFilteredHistory();
  if (difficulty === "all") return loadUnlimitedHistory();
  const map = loadUnlimitedDifficultyHistoryMap();
  const history = map[difficulty] || [];
  return Array.isArray(history) ? history.slice(0, unlimitedHistoryLimit) : [];
}

function saveUnlimitedHistoryForDifficulty(difficulty, history) {
  if (difficulty === "filtered") {
    saveFilteredHistory(history);
    return;
  }
  if (difficulty === "all") {
    saveUnlimitedHistory(history);
    return;
  }
  const map = loadUnlimitedDifficultyHistoryMap();
  map[difficulty] = history.slice(0, unlimitedHistoryLimit);
  saveUnlimitedDifficultyHistoryMap(map);
}

function loadActiveUnlimitedRound() {
  return loadActiveUnlimitedRoundForDifficulty(state.unlimitedDifficulty || "all");
}

function loadActiveUnlimitedRoundsMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(unlimitedActiveRoundKey)) || null;
    if (!parsed || typeof parsed !== "object") return {};

    if (parsed.songId) {
      const difficulty = parsed.difficulty || "all";
      return { [difficulty]: parsed };
    }

    const source = isPlainObject(parsed.rounds) ? parsed.rounds : parsed;
    return Object.fromEntries(
      Object.entries(source).filter(([difficulty, round]) => (
        UNLIMITED_DIFFICULTIES.includes(difficulty) && round?.songId
      ))
    );
  } catch {
    return {};
  }
}

function saveActiveUnlimitedRoundsMap(map) {
  const rounds = Object.fromEntries(
    Object.entries(map).filter(([difficulty, round]) => (
      UNLIMITED_DIFFICULTIES.includes(difficulty) && round?.songId
    ))
  );
  localStorage.setItem(unlimitedActiveRoundKey, JSON.stringify({ version: 2, rounds }));
}

function loadActiveUnlimitedRoundForDifficulty(difficulty = state.unlimitedDifficulty || "all") {
  const map = loadActiveUnlimitedRoundsMap();
  return map[difficulty] || null;
}

function loadMostRecentActiveUnlimitedRound() {
  const rounds = Object.values(loadActiveUnlimitedRoundsMap());
  return rounds.sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0))[0] || null;
}

function saveActiveUnlimitedRound(difficulty = state.unlimitedDifficulty || "all") {
  if (state.mode !== "unlimited" || state.isComplete || !state.puzzle?.vocadbId) {
    return;
  }

  const map = loadActiveUnlimitedRoundsMap();
  const existing = map[difficulty];
  map[difficulty] = {
    songId: String(state.puzzle.vocadbId),
    difficulty,
    filtered: hasActiveUnlimitedFilters(),
    attempt: state.attempt,
    clipStage: state.clipStage,
    guesses: state.guesses,
    startedAt: existing?.songId === String(state.puzzle.vocadbId) && existing?.difficulty === difficulty ? existing.startedAt : Date.now(),
    updatedAt: Date.now(),
  };
  saveActiveUnlimitedRoundsMap(map);
}

function clearActiveUnlimitedRound(difficulty = state.unlimitedDifficulty || "all") {
  const map = loadActiveUnlimitedRoundsMap();
  delete map[difficulty];
  if (Object.keys(map).length === 0) {
    localStorage.removeItem(unlimitedActiveRoundKey);
    return;
  }
  saveActiveUnlimitedRoundsMap(map);
}

function clearAllActiveUnlimitedRounds() {
  localStorage.removeItem(unlimitedActiveRoundKey);
}

function recordUnlimitedHistory(result) {
  const entry = {
    title: result.title,
    displayTitle: result.displayTitle,
    artist: result.artist,
    attempts: result.attempts,
    won: result.won,
    difficulty: result.filtered ? "filtered" : result.difficulty || "all",
    completedAt: result.completedAt || Date.now(),
  };
  const difficulty = entry.difficulty || "all";
  const history = loadUnlimitedHistoryForDifficulty(difficulty);
  history.unshift(entry);
  saveUnlimitedHistoryForDifficulty(difficulty, history);
}

function loadUnlimitedRecentIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(unlimitedRecentKey)) || [];
    return Array.isArray(parsed) ? parsed.map(String).slice(0, unlimitedRecentLimit) : [];
  } catch {
    return [];
  }
}

function saveUnlimitedRecentIds(ids) {
  localStorage.setItem(unlimitedRecentKey, JSON.stringify(ids.slice(0, unlimitedRecentLimit)));
}

function loadUnlimitedDifficultyRecentMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(unlimitedDifficultyRecentKey)) || {};
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function loadUnlimitedRecentIdsForDifficulty(difficulty = state.unlimitedDifficulty || "all") {
  if (difficulty === "all") return loadUnlimitedRecentIds();
  const map = loadUnlimitedDifficultyRecentMap();
  const ids = Array.isArray(map[difficulty]) ? map[difficulty] : [];
  return ids.map(String).slice(0, unlimitedRecentLimit);
}

function saveUnlimitedRecentIdsForDifficulty(difficulty, ids) {
  if (difficulty === "all") {
    saveUnlimitedRecentIds(ids);
    return;
  }
  const map = loadUnlimitedDifficultyRecentMap();
  map[difficulty] = ids.slice(0, unlimitedRecentLimit);
  localStorage.setItem(unlimitedDifficultyRecentKey, JSON.stringify(map));
}

function rememberUnlimitedSong(song) {
  if (!song?.vocadbId) return;
  const songId = String(song.vocadbId);
  const difficulty = state.unlimitedDifficulty || "all";
  const recentIds = loadUnlimitedRecentIdsForDifficulty(difficulty).filter((id) => id !== songId);
  saveUnlimitedRecentIdsForDifficulty(difficulty, [songId, ...recentIds]);
}

function shouldBoostNewSongs() {
  return state.mode === "unlimited"
    && (state.unlimitedDifficulty || "all") === "all"
    && !hasActiveUnlimitedFilters()
    && getRandomIndex(100) < Math.round(NEW_SONG_BOOST_RATE * 100);
}

function boostNewSongToFront(queueSongs) {
  if (!shouldBoostNewSongs()) return queueSongs;
  const candidates = queueSongs.filter((song) => isRecentlyAddedSong(song) && song.title !== state.lastUnlimitedTitle);
  if (candidates.length === 0) return queueSongs;
  const boostedSong = candidates[getRandomIndex(candidates.length)];
  return [boostedSong, ...queueSongs.filter((song) => song !== boostedSong)];
}

const difficultyPools = {
  status: "idle",
  counts: {},
  ids: {},
};

function getDifficultyKeyFromWinRate(winRate) {
  const rate = Number(winRate) * 100;
  if (!Number.isFinite(rate)) return null;
  if (rate >= 85) return "free";
  if (rate >= 70) return "easy";
  if (rate >= 40) return "medium";
  if (rate >= 15) return "hard";
  return "unknown";
}

function normalizeDifficultyPools(payload) {
  const source = payload?.pools || payload?.ids || payload || {};
  const normalized = { counts: {}, ids: {} };
  UNLIMITED_PRACTICE_DIFFICULTIES.forEach((key) => {
    const value = source[key] || {};
    const ids = Array.isArray(value) ? value : value.ids || [];
    normalized.ids[key] = ids.map(String);
    normalized.counts[key] = Number(value.count ?? payload?.counts?.[key] ?? ids.length) || 0;
  });
  return normalized;
}

async function fetchDifficultyPools() {
  if (difficultyPools.status === "loading") return difficultyPools;
  difficultyPools.status = "loading";
  renderDifficultyModeControls();
  try {
    const res = await fetch(`${WORKER_URL}/difficulty-pools`);
    if (!res.ok) throw new Error("difficulty pools unavailable");
    const normalized = normalizeDifficultyPools(await res.json());
    difficultyPools.ids = normalized.ids;
    difficultyPools.counts = normalized.counts;
    difficultyPools.status = "ready";
  } catch {
    try {
      const fallbackRes = await fetch(`${WORKER_URL}/leaderboard?sort=plays&limit=1000`);
      if (!fallbackRes.ok) throw new Error("difficulty fallback unavailable");
      const rows = await fallbackRes.json();
      const ids = Object.fromEntries(UNLIMITED_PRACTICE_DIFFICULTIES.map((key) => [key, []]));
      (rows || []).forEach((entry) => {
        if ((Number(entry?.plays) || 0) < DIFFICULTY_MIN_PLAYS || !entry?.songId) return;
        const key = getDifficultyKeyFromWinRate(entry.winRate);
        if (key && ids[key]) ids[key].push(String(entry.songId));
      });
      difficultyPools.ids = ids;
      difficultyPools.counts = Object.fromEntries(UNLIMITED_PRACTICE_DIFFICULTIES.map((key) => [key, ids[key].length]));
      difficultyPools.status = "fallback";
    } catch {
      difficultyPools.ids = {};
      difficultyPools.counts = {};
      difficultyPools.status = "error";
    }
  }
  renderDifficultyModeControls();
  return difficultyPools;
}

function getBaseSongsForUnlimitedDifficulty(difficulty = state.unlimitedDifficulty || "all") {
  if (difficulty === "all") return songs.filter((song) => song.audioClip);
  const ids = new Set((difficultyPools.ids[difficulty] || []).map(String));
  return songs.filter((song) => song.audioClip && ids.has(String(song.vocadbId)));
}

function getSongsForUnlimitedDifficulty(difficulty = state.unlimitedDifficulty || "all") {
  return applyUnlimitedFiltersToSongs(getBaseSongsForUnlimitedDifficulty(difficulty));
}

function getUnlimitedDifficultyCount(difficulty = "all") {
  return getSongsForUnlimitedDifficulty(difficulty).length;
}

function formatYearRanges(years = []) {
  const sorted = normalizeFilterList(years).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i += 1) {
    const year = sorted[i];
    if (year === prev + 1) {
      prev = year;
      continue;
    }
    ranges.push(start === prev ? String(start) : `${start}-${prev}`);
    start = year;
    prev = year;
  }
  return ranges.join(", ");
}

function buildFilterTags(filters = state.unlimitedFilters || getDefaultUnlimitedFilters()) {
  const tags = [];
  filters.producers.forEach((producer) => tags.push({ type: "producer", value: producer, label: t("filterTagProducer", producer) }));
  filters.voicebanks.forEach((voicebank) => tags.push({ type: "voicebank", value: voicebank, label: t("filterTagVoicebank", getVoicebankTagName(voicebank)) }));
  filters.programs.forEach((program) => tags.push({ type: "program", value: program, label: t("filterTagProgram", program) }));
  if (filters.years.length) tags.push({ type: "years", value: "", label: t("filterTagYears", formatYearRanges(filters.years)) });
  if (filters.community) tags.push({ type: "community", value: "", label: t("filterTagCommunity") });
  if (filters.newSongs) tags.push({ type: "newSongs", value: "", label: t("filterTagNewSongs") });
  return tags;
}

function removeUnlimitedFilterTag(type, value) {
  const filters = normalizeUnlimitedFilters(state.unlimitedFilters);
  if (type === "producer") filters.producers = filters.producers.filter((item) => item !== value);
  if (type === "voicebank") filters.voicebanks = filters.voicebanks.filter((item) => item !== value);
  if (type === "program") filters.programs = filters.programs.filter((item) => item !== value);
  if (type === "years") filters.years = [];
  if (type === "community") filters.community = false;
  if (type === "newSongs") filters.newSongs = false;
  applyUnlimitedFilters(filters);
}

function renderFilterTags() {
  if (!filterTagList) return;
  const tags = buildFilterTags();
  filterTagList.hidden = tags.length === 0;
  filterTagList.innerHTML = tags.map((tag) => `
    <span class="filter-tag">
      ${escapeHtml(tag.label)}
      <button type="button" data-remove-filter-type="${escapeHtml(tag.type)}" data-remove-filter-value="${escapeHtml(tag.value)}" aria-label="Remove filter">x</button>
    </span>
  `).join("");
}

let filterDraft = null;

function getAllFilterOptions(kind) {
  const values = new Set();
  songs.forEach((song) => {
    const names = kind === "producer" ? getFilterProducerNames(song) : getFilterVoicebankNames(song);
    names.forEach((name) => values.add(name));
  });
  return [...values].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

const producerFilterOptions = getAllFilterOptions("producer");
const voicebankFilterOptions = getAllFilterOptions("voicebank");

function getFilterOptionSongCount(option, type) {
  const normalizedOption = normalizeGuess(option);
  return songs.filter((song) => {
    if (!song.audioClip) return false;
    const names = type === "producer" ? getFilterProducerNames(song) : getFilterVoicebankNames(song);
    return names.some((name) => normalizeGuess(name) === normalizedOption);
  }).length;
}

function renderFilterSelected(container, items, type) {
  if (!container) return;
  container.hidden = items.length === 0;
  container.innerHTML = items.map((item) => `
    <span class="filter-selected-pill">
      ${escapeHtml(type === "voicebank" ? getVoicebankTagName(item) : item)}
      <button type="button" data-filter-remove="${escapeHtml(type)}" data-filter-value="${escapeHtml(item)}">x</button>
    </span>
  `).join("");
}

function renderFilterSuggestions(input, list, options, selected, type) {
  if (!input || !list) return;
  const query = normalizeGuess(input.value || "");
  if (!query) {
    list.hidden = true;
    list.innerHTML = "";
    return;
  }
  const selectedKeys = new Set(selected.map(normalizeGuess));
  const matches = options
    .filter((option) => normalizeGuess(option).includes(query) && !selectedKeys.has(normalizeGuess(option)))
    .slice(0, 24);
  list.hidden = matches.length === 0;
  list.innerHTML = matches.map((option) => `
    <li data-filter-select="${escapeHtml(type)}" data-filter-value="${escapeHtml(option)}">
      <span class="filter-suggestion-title">${highlightMatch(type === "voicebank" ? getVoicebankTagName(option) : option, query)}</span>
      <span class="filter-suggestion-meta">${escapeHtml(type === "voicebank" ? t("filterVoicebankLabel") : t("filterProducerLabel"))} · ${escapeHtml(t("filterSongsMatch", getFilterOptionSongCount(option, type)))}</span>
    </li>
  `).join("");
}

function addFilterValue(type, value) {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  const key = type === "producer" ? "producers" : "voicebanks";
  filterDraft[key] = normalizeFilterList([...filterDraft[key], value]);
  if (type === "producer" && filterProducerInput) filterProducerInput.value = "";
  if (type === "voicebank" && filterVoicebankInput) filterVoicebankInput.value = "";
  renderUnlimitedFilterModal();
}

function removeFilterValue(type, value) {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  const key = type === "producer" ? "producers" : "voicebanks";
  filterDraft[key] = filterDraft[key].filter((item) => item !== value);
  renderUnlimitedFilterModal();
}

function toggleFilterValue(listName, value) {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  const values = new Set(filterDraft[listName] || []);
  if (values.has(value)) values.delete(value);
  else values.add(value);
  filterDraft[listName] = [...values].sort();
  renderUnlimitedFilterModal();
}

function toggleYearRange(range) {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  const [start, end] = String(range).split("-").map(Number);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return;
  const years = FILTER_YEARS.filter((year) => Number(year) >= start && Number(year) <= end);
  const selected = new Set(filterDraft.years);
  const allSelected = years.every((year) => selected.has(year));
  years.forEach((year) => {
    if (allSelected) selected.delete(year);
    else selected.add(year);
  });
  filterDraft.years = [...selected].sort();
  renderUnlimitedFilterModal();
}

function renderUnlimitedFilterModal() {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  renderFilterSelected(filterProducerSelected, filterDraft.producers, "producer");
  renderFilterSelected(filterVoicebankSelected, filterDraft.voicebanks, "voicebank");
  renderFilterSuggestions(filterProducerInput, filterProducerSuggestions, producerFilterOptions, filterDraft.producers, "producer");
  renderFilterSuggestions(filterVoicebankInput, filterVoicebankSuggestions, voicebankFilterOptions, filterDraft.voicebanks, "voicebank");

  filterProgramList?.querySelectorAll("[data-filter-program]").forEach((button) => {
    button.classList.toggle("is-active", filterDraft.programs.includes(button.dataset.filterProgram));
  });
  if (filterYearList && filterYearList.children.length === 0) {
    filterYearList.innerHTML = FILTER_YEARS.map((year) => `<button type="button" data-filter-year="${year}">${year}</button>`).join("");
  }
  filterYearList?.querySelectorAll("[data-filter-year]").forEach((button) => {
    button.classList.toggle("is-active", filterDraft.years.includes(button.dataset.filterYear));
  });
  document.querySelectorAll("[data-filter-year-range]").forEach((button) => {
    const [start, end] = String(button.dataset.filterYearRange).split("-").map(Number);
    const years = FILTER_YEARS.filter((year) => Number(year) >= start && Number(year) <= end);
    button.classList.toggle("is-active", years.length > 0 && years.every((year) => filterDraft.years.includes(year)));
  });
  if (filterYearSummary) filterYearSummary.textContent = filterDraft.years.length ? formatYearRanges(filterDraft.years) : t("filterNoYears");
  if (filterCommunity) filterCommunity.checked = filterDraft.community;
  if (filterNewSongs) filterNewSongs.checked = filterDraft.newSongs;
  if (filterInclusive) filterInclusive.checked = filterDraft.inclusive;
  if (filterMatchCount) filterMatchCount.textContent = t("filterSongsMatch", applyUnlimitedFiltersToSongs(songs.filter((song) => song.audioClip), filterDraft).length);
}

function applyUnlimitedFilters(filters) {
  const nextFilters = saveUnlimitedFilters(filters);
  const changed = JSON.stringify(nextFilters) !== JSON.stringify(state.unlimitedFilters || getDefaultUnlimitedFilters());
  if (changed && state.mode === "unlimited" && !state.isComplete && state.puzzle) {
    saveActiveUnlimitedRound();
    recordAbandonedUnlimitedRound(loadActiveUnlimitedRound(), { force: true, filtered: hasActiveUnlimitedFilters(state.unlimitedFilters) });
  }
  state.unlimitedFilters = nextFilters;
  state.unlimitedQueue = [];
  clearAllActiveUnlimitedRounds();
  renderDifficultyModeControls();
  if (state.mode === "unlimited" && changed) loadPuzzle();
  renderStats();
}

function getActiveUnlimitedSong() {
  const activeRound = loadActiveUnlimitedRound();
  if (!activeRound?.songId) return null;

  const song = songs.find((candidate) => String(candidate.vocadbId) === String(activeRound.songId));
  if (!song?.audioClip) {
    clearActiveUnlimitedRound(activeRound.difficulty || "all");
    return null;
  }

  state.attempt = Math.max(1, Math.min(Number(activeRound.attempt) || 1, clipStages.length));
  state.clipStage = Math.max(0, Math.min(Number(activeRound.clipStage) || 0, clipStages.length - 1));
  state.guesses = Array.isArray(activeRound.guesses) ? activeRound.guesses : [];
  return song;
}

function refillUnlimitedQueue(playableSongs) {
  const recentIds = new Set(loadUnlimitedRecentIdsForDifficulty(state.unlimitedDifficulty || "all"));
  const freshSongs = playableSongs.filter((song) => !recentIds.has(String(song.vocadbId)));
  const queueSongs = freshSongs.length >= Math.min(10, playableSongs.length)
    ? freshSongs
    : playableSongs;

  state.unlimitedQueue = boostNewSongToFront(shuffleSongs(queueSongs));

  if (state.unlimitedQueue.length <= 1 || state.unlimitedQueue[0].title !== state.lastUnlimitedTitle) {
    return;
  }

  const swapIndex = 1 + getRandomIndex(state.unlimitedQueue.length - 1);
  [state.unlimitedQueue[0], state.unlimitedQueue[swapIndex]] = [
    state.unlimitedQueue[swapIndex],
    state.unlimitedQueue[0],
  ];
}

function getUnlimitedPuzzle() {
  const activeSong = getActiveUnlimitedSong();
  if (activeSong) {
    return activeSong;
  }

  const playableSongs = getSongsForUnlimitedDifficulty();

  if (playableSongs.length === 0) {
    return null;
  }

  if (state.unlimitedQueue.length === 0) {
    refillUnlimitedQueue(playableSongs);
  }

  const nextSong = state.unlimitedQueue.shift() || null;
  rememberUnlimitedSong(nextSong);
  return nextSong;
}

function getPuzzleForCurrentMode() {
  if (state.mode === "archive") return getArchivePuzzle();
  if (state.mode === "unlimited") return getUnlimitedPuzzle();
  return getDailyPuzzle();
}

function resetRound() {
  stopClip();
  state.attempt = 1;
  state.clipStage = 0;
  state.guesses = [];
  state.isComplete = false;
  state.hasPlayedPreview = false;
  state.lastResult = null;
  currentAudio = null;
  clipTimer = null;
  selectedSuggestionSongId = null;
  guessForm.reset();
  hideSuggestions();
  gamePanel.classList.remove("is-loss");
  coverPlaceholderMark.hidden = false;
  updateCoverPlaceholderState();
  coverImage.hidden = true;
  coverImage.removeAttribute("src");
  coverImage.alt = "";
  coverFallback.hidden = true;
  coverFallback.innerHTML = "";
  coverCaption.textContent = t("coverCaption");
  if (sourceTags) {
    sourceTags.hidden = true;
    sourceTags.innerHTML = "";
  }
  if (sourceLink) {
    sourceLink.href = "https://vocadb.net";
    sourceLink.textContent = "VocaDB";
  }
  if (globalStatsEl) {
    globalStatsEl.hidden = true;
    globalStatsEl.innerHTML = "";
  }
  lastGlobalStats = null;
  scheduleMessage.hidden = true;
  nextButton.hidden = true;
  shareButton.hidden = true;
  if (bookmarkButton) bookmarkButton.hidden = true;
  shareButton.innerHTML = `<span id="copy-result-button-text">${t("copyResult")}</span>`;
  shareOutput.hidden = true;
  shareOutput.value = "";
  playButton.disabled = false;
  skipButton.disabled = false;
  guessInput.disabled = false;
}

function loadPuzzle() {
  resetRound();
  state.puzzle = getPuzzleForCurrentMode();

  if (!state.puzzle) {
    scheduleMessage.hidden = false;
    scheduleMessage.textContent = state.mode === "unlimited" && (isUnlimitedPracticeMode() || hasActiveUnlimitedFilters())
      ? t("difficultyUnavailable")
      : t("noSchedule");
    playButton.disabled = true;
    skipButton.disabled = true;
    guessInput.disabled = true;
    suppressNextGuessAutofocus = false;
    return;
  }

  scheduleMessage.hidden = true;
  currentAudio = new Audio(state.puzzle.audioClip);
  currentAudio.preload = "auto";
  currentAudio.addEventListener("ended", resetPlayButton);

  if (state.mode === "unlimited" && state.unlimitedDifficulty === "all" && !hasActiveUnlimitedFilters()) {
    state.lastUnlimitedTitle = state.puzzle.title;
    saveActiveUnlimitedRound();
    render();
    focusGuessInputIfAllowed();
    pulsePlayButton();
    initDanmaku();
    return;
  }
  const savedDailyResults = loadStats().results || {};
  const savedArchiveResults = loadArchiveResults();
  const completedResult = state.mode === "daily"
    ? savedDailyResults[getDateKey()]
    : state.mode === "archive" && state.archiveDate
      ? savedArchiveResults[state.archiveDate] || savedDailyResults[state.archiveDate]
      : null;

  if (completedResult) {
    state.isComplete = true;
    state.lastResult = completedResult;
    state.clipStage = clipStages.length - 1;
    state.guesses = completedResult.guesses || [
      {
        label: state.puzzle.title,
        result: completedResult.won ? "Correct" : "Answer",
      },
    ];
    revealAnswer();
    playButton.disabled = false;
    playButton.setAttribute("aria-label", "Play full clip");
    skipButton.disabled = true;
    guessInput.disabled = true;
  }

  if (!completedResult) {
    focusGuessInputIfAllowed();
    pulsePlayButton();
  }

  render();
  initDanmaku();
}

function focusGuessInputIfAllowed() {
  if (suppressNextGuessAutofocus) {
    suppressNextGuessAutofocus = false;
    return;
  }
  guessInput.focus();
}

function initDanmaku() {
  const overlay = document.getElementById("danmaku-overlay");
  if (!overlay) return;
  overlay.innerHTML = "";
  if (document.body.classList.contains("no-danmaku")) return;
  const isSenbon = isSenbonzakura();
  const pool = isSenbon ? SENBONZAKURA_COMMENTS : DANMAKU_POOL;
  const count = document.body.classList.contains("danmaku-few")
    ? 3
    : document.body.classList.contains("danmaku-many")
      ? 12
      : 7;
  const topSlots = [6, 14, 22, 30, 38, 46, 54, 62, 70, 78, 86, 92];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "danmaku-comment";
    const duration = 6 + Math.random() * 6;
    const delay = -(Math.random() * duration);
    span.style.top = `${topSlots[i % topSlots.length]}%`;
    span.style.animationDuration = `${duration.toFixed(1)}s`;
    span.style.animationDelay = `${delay.toFixed(1)}s`;
    span.textContent = shuffled[i % shuffled.length];
    overlay.appendChild(span);
  }
}

function isSenbonzakura() {
  if (!state.puzzle) return false;
  const title = (state.puzzle.title || "").toLowerCase();
  return title.includes("senbonzakura") || title.includes("千本桜") || title.includes("thousand cherry");
}

function checkSenbonzakura() {
  if (!isSenbonzakura()) return;
  const density = localStorage.getItem("vh-danmaku-density") || "medium";
  if (density === "many" || document.body.classList.contains("danmaku-many")) {
    unlockAchievement("secret_senbonzakura");
    triggerSenbonzakuraFlood();
  }
}

function triggerSenbonzakuraFlood() {
  const overlay = document.getElementById("danmaku-overlay");
  if (!overlay) return;
  if (document.body.classList.contains("no-danmaku")) return;
  let spawned = 0;
  const maxExtra = 30;
  const interval = setInterval(() => {
    if (spawned >= maxExtra) { clearInterval(interval); return; }
    const span = document.createElement("span");
    span.className = "danmaku-comment danmaku-flood";
    const duration = 3 + Math.random() * 3;
    span.style.top = `${Math.random() * 90}%`;
    span.style.animationDuration = `${duration.toFixed(1)}s`;
    span.style.animationDelay = "0s";
    span.style.fontSize = `${12 + Math.floor(Math.random() * 8)}px`;
    span.style.color = ["#ffffff", "#ffcccc", "#ffaaaa", "#ff8888"][Math.floor(Math.random() * 4)];
    span.textContent = SENBONZAKURA_COMMENTS[Math.floor(Math.random() * SENBONZAKURA_COMMENTS.length)];
    overlay.appendChild(span);
    setTimeout(() => span.remove(), duration * 1000 + 500);
    spawned++;
  }, 120);
}

const CORRECT_COMMENTS = [
  "正解！", "すごい！", "やった！", "天才", "わかった！", "神", "さすが",
  "ｷﾀ━━━!!", "やばい", "さすがすぎる", "完璧", "神すぎ", "天才すぎ",
  "nice!", "got it!", "lets go!", "called it", "knew it", "goat", "easy",
  "no way", "W", "LETS GO", "first try!!", "too easy", "gg",
];

function triggerCorrectBurst() {
  const overlay = document.getElementById("danmaku-overlay");
  if (!overlay) return;
  if (document.body.classList.contains("no-danmaku")) return;
  const count = 14;
  const pool = [...CORRECT_COMMENTS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "danmaku-comment danmaku-correct";
    const duration = 2.5 + Math.random() * 2;
    const delay = i * 0.08;
    span.style.top = `${5 + Math.random() * 88}%`;
    span.style.animationDuration = `${duration.toFixed(1)}s`;
    span.style.animationDelay = `${delay.toFixed(2)}s`;
    span.style.fontSize = `${13 + Math.floor(Math.random() * 5)}px`;
    span.textContent = pool[i % pool.length];
    overlay.appendChild(span);
    setTimeout(() => span.remove(), (duration + delay) * 1000 + 200);
  }
}

function triggerCoverFlash() {
  const wrap = document.querySelector(".nnd-player-wrap");
  if (!wrap) return;
  wrap.classList.remove("cover-correct-flash");
  void wrap.offsetWidth;
  wrap.classList.add("cover-correct-flash");
  setTimeout(() => wrap.classList.remove("cover-correct-flash"), 1800);
}

function updateMylist() {
  mylistCount++;
  localStorage.setItem("vocaloid-heardle-mylist", mylistCount);
  const el = document.getElementById("nnd-mylist-count");
  if (el) {
    el.textContent = mylistCount.toLocaleString();
    el.classList.remove("mylist-bump");
    void el.offsetWidth;
    el.classList.add("mylist-bump");
  }
}

function getPublishYear(song) {
  const year = String(song?.publishDate || "").match(/\d{4}/)?.[0];
  return year || "";
}

function recordPublishYearStats(stats, song, won) {
  const year = getPublishYear(song);
  if (!year) return;
  stats.yearStats = normalizeYearStats(stats.yearStats);
  stats.yearStats[year] = stats.yearStats[year] || { played: 0, won: 0 };
  stats.yearStats[year].played += 1;
  if (won) stats.yearStats[year].won += 1;
}

function recordResult(won) {
  const isDaily = state.mode === "daily";
  const isUnlimited = state.mode === "unlimited";
  const unlimitedDifficulty = isUnlimited ? (state.unlimitedDifficulty || "all") : null;
  const isUnlimitedAll = isUnlimited && unlimitedDifficulty === "all";
  const isFilteredUnlimited = isUnlimited && hasActiveUnlimitedFilters();
  const isArchive = state.mode === "archive";
  const todayKey = getDateKey();
  const resultKey = isArchive ? state.archiveDate : todayKey;

  const result = {
    won,
    attempts: won ? state.attempt : null,
    title: state.puzzle.title,
    displayTitle: getDisplayTitle(state.puzzle),
    artist: getSuggestionArtist(state.puzzle),
    vocadbId: state.puzzle.vocadbId,
    date: resultKey,
    mode: state.mode,
    difficulty: unlimitedDifficulty,
    filtered: isFilteredUnlimited,
    completedAt: Date.now(),
    guesses: state.guesses,
    playedPreview: Boolean(state.hasPlayedPreview),
  };

  if (!isDaily && !isUnlimited) {
    if (isArchive && resultKey) {
      saveArchiveResult(resultKey, result);
      renderArchiveCalendar();
    }
    checkLocalAchievements(result, { mode: state.mode });
    renderStats();
    return result;
  }

  const stats = isDaily
    ? loadStats()
    : isFilteredUnlimited
      ? loadFilteredStats()
      : isUnlimitedAll
      ? loadUnlimitedStats()
      : loadUnlimitedDifficultyStats(unlimitedDifficulty);
  if (isDaily && stats.results[resultKey]) {
    renderStats();
    return stats.results[resultKey];
  }

  stats.played += 1;
  recordPublishYearStats(stats, state.puzzle, won);

  if (isDaily) {
    stats.results[resultKey] = result;
  }

  if (won) {
    stats.won += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.distribution[state.attempt] += 1;
    if (state.attempt === 1) {
      stats.firstTrySolves = (Number(stats.firstTrySolves) || 0) + 1;
    }
    if (isUnlimitedAll && !isFilteredUnlimited) {
      const achievements = loadAchievements();
      achievements.unlimitedFirstTryStreak = state.attempt === 1
        ? (Number(achievements.unlimitedFirstTryStreak) || 0) + 1
        : 0;
      saveAchievements(achievements);
    }
  } else {
    stats.currentStreak = 0;
    stats.distribution.fail += 1;
    if (isUnlimitedAll && !isFilteredUnlimited) {
      const achievements = loadAchievements();
      achievements.unlimitedFirstTryStreak = 0;
      saveAchievements(achievements);
    }
  }

  if (isFilteredUnlimited) saveFilteredStats(stats);
  else saveStatsForMode(state.mode, stats);

  if (isUnlimited) {
    recordUnlimitedHistory(result);
    clearActiveUnlimitedRound(unlimitedDifficulty);
  }

  checkLocalAchievements(result, { mode: isUnlimitedAll && !isFilteredUnlimited ? state.mode : "unlimited-practice" });
  renderStats();
  return result;
}

function recordAbandonedUnlimitedRound(activeRound = loadActiveUnlimitedRound(), options = {}) {
  if (!activeRound?.songId) return null;

  // Don't count as a forfeit if the player never made a guess - just switching
  // difficulty or reloading before attempting anything shouldn't hit the stats.
  const guesses = Array.isArray(activeRound.guesses) ? activeRound.guesses : [];
  if (guesses.length === 0 && !options.force) {
    clearActiveUnlimitedRound(activeRound.difficulty || "all");
    return null;
  }

  const puzzle = songs.find((song) => String(song.vocadbId) === String(activeRound.songId));
  if (!puzzle) {
    clearActiveUnlimitedRound(activeRound.difficulty || "all");
    return null;
  }

  const result = {
    won: false,
    attempts: null,
    title: puzzle.title,
    displayTitle: getDisplayTitle(puzzle),
    artist: getSuggestionArtist(puzzle),
    vocadbId: puzzle.vocadbId,
    date: null,
    mode: "unlimited",
    difficulty: activeRound.difficulty || "all",
    filtered: Boolean(activeRound.filtered || options.filtered),
    completedAt: Date.now(),
    guesses,
  };
  const difficulty = result.difficulty || "all";
  const stats = result.filtered ? loadFilteredStats() : difficulty === "all" ? loadUnlimitedStats() : loadUnlimitedDifficultyStats(difficulty);
  stats.played += 1;
  stats.currentStreak = 0;
  stats.distribution.fail += 1;
  recordPublishYearStats(stats, puzzle, false);
  if (result.filtered) saveFilteredStats(stats);
  else if (difficulty === "all") saveUnlimitedStats(stats);
  else saveUnlimitedDifficultyStats(difficulty, stats);
  recordUnlimitedHistory(result);

  if (!result.filtered && difficulty === "all") {
    const achievements = loadAchievements();
    achievements.unlimitedFirstTryStreak = 0;
    saveAchievements(achievements);
  } else if (difficulty === "unknown") {
    resetUnknownPracticeFirstTryStreak();
  }
  clearActiveUnlimitedRound(difficulty);
  renderStats();
  return result;
}

function revealAnswer(options = {}) {
  if (!state.puzzle) {
    return;
  }

  coverPlaceholderMark.hidden = true;
  coverCaption.textContent = `${truncateTitle(getDisplayTitle(state.puzzle), 60)} - ${getSuggestionArtist(state.puzzle)}`;
  if (sourceLink) {
    sourceLink.href = state.puzzle.vocadbUrl || "https://vocadb.net";
    sourceLink.textContent = "VocaDB";
  }
  renderSourceTags();

  loadGlobalStats(state.puzzle.vocadbId, {
    mode: state.mode,
    puzzle: state.puzzle,
    result: state.lastResult,
    showComparisonToast: Boolean(options.showComparisonToast),
  });

  const coverArts = getCoverArts(state.puzzle);

  if (coverArts.length > 0) {
    showCoverArt(0);
    coverImage.alt = `${state.puzzle.title} cover art`;
    coverImage.hidden = false;
    coverFallback.hidden = true;
    return;
  }

  coverImage.hidden = true;
  coverFallback.innerHTML = `
    <strong>${escapeHtml(state.puzzle.title)}</strong>
    <span>${escapeHtml(state.puzzle.artistString || state.puzzle.artist)}</span>
  `;
  coverFallback.hidden = false;
}

function hasSourceTag(song, tag) {
  return Array.isArray(song?.sourceTags) && song.sourceTags.includes(tag);
}

function renderSourceTags() {
  if (!sourceTags) return;
  const nndPoolTag = hasSourceTag(state.puzzle, "nnd-10m")
    ? "tagNnd10m"
    : hasSourceTag(state.puzzle, "nnd-1m")
      ? "tagNnd1m"
      : hasSourceTag(state.puzzle, "nnd-100k")
        ? "tagNnd100k"
        : "";
  const ytPoolTag = hasSourceTag(state.puzzle, "yt-100m")
    ? "tagYt100m"
    : hasSourceTag(state.puzzle, "yt-10m")
      ? "tagYt10m"
      : hasSourceTag(state.puzzle, "yt-1m")
        ? "tagYt1m"
        : "";
  const labels = [
    hasSourceTag(state.puzzle, "community") ? { label: t("tagCommunitySuggested"), className: "source-tag-community" } : null,
    hasSourceTag(state.puzzle, "new") ? { label: t("tagNewSong"), className: "source-tag-new" } : null,
    hasSourceTag(state.puzzle, "project-sekai") ? { label: t("tagProjectSekai"), className: "source-tag-pool" } : null,
    nndPoolTag ? { label: t(nndPoolTag), className: "source-tag-pool" } : null,
    ytPoolTag ? { label: t(ytPoolTag), className: "source-tag-pool" } : null,
    hasSourceTag(state.puzzle, "special-test") ? { label: t("tagSpecialTest"), className: "source-tag-special" } : null,
  ].filter(Boolean);

  if (!state.isComplete || labels.length === 0) {
    sourceTags.hidden = true;
    sourceTags.innerHTML = "";
    return;
  }

  sourceTags.innerHTML = labels
    .map((tag) => `<span class="${tag.className}">${escapeHtml(tag.label)}</span>`)
    .join("");
  sourceTags.hidden = false;
}

// Cached after a successful loadGlobalStats so we can re-render on language switch
// without making another KV read.
let lastGlobalStats = null;

// Bucket the global solve rate into a difficulty tier.
// Returns one of: "free" | "easy" | "medium" | "hard" | "unknown"
// Also exposes the threshold logic in one place so labels and color stay in sync.
function getDifficultyKey(rate) {
  if (rate >= 85) return "free";
  if (rate >= 70) return "easy";
  if (rate >= 40) return "medium";
  if (rate >= 15) return "hard";
  return "unknown";
}

// Fetch and render the global solve stats for the answered song.
// Hidden if the song has no plays or the request fails - failure is silent
// because this is a cosmetic addition, not core gameplay.
async function loadGlobalStats(songId, context = {}) {
  if (!globalStatsEl || !songId) return;
  globalStatsEl.hidden = true;
  globalStatsEl.innerHTML = "";
  lastGlobalStats = null;
  try {
    const res = await fetch(`${WORKER_URL}/stats?songId=${encodeURIComponent(songId)}`);
    if (!res.ok) return;
    const data = await res.json();
    const plays = data.plays || 0;
    if (plays < 1) return;
    const wins = data.wins || 0;
    const rate = Math.round((wins / plays) * 100);

    // Compute avg attempts from the per-attempt buckets recorded in /record.
    // The buckets only count successful solves, so this is "avg attempts among solvers".
    const buckets = data.attempts || {};
    let totalSolves = 0;
    let weightedSum = 0;
    for (const [k, v] of Object.entries(buckets)) {
      const n = parseInt(k, 10);
      const c = Number(v) || 0;
      if (Number.isFinite(n) && n >= 1 && n <= 6) {
        totalSolves += c;
        weightedSum += n * c;
      }
    }
    const avg = totalSolves > 0 ? (weightedSum / totalSolves) : null;

    lastGlobalStats = { rate, plays, avg };
    renderGlobalStats();
    if (context.showComparisonToast && avg !== null) {
      showGlobalComparisonToast(buildGlobalComparisonHtml(avg, context.result));
    }
    checkGlobalAchievements(rate, context);
    await maybeUnlockTop50HardestAchievement(context);
    maybeUpdateRarestSolvedStats(rate, context);
  } catch {
    // silent - stats backend hiccup shouldn't break the answer reveal
  }
}

// If the player just solved this song and its global solve rate is lower than
// their previous rarest records, update the per-mode local stats blob.
async function maybeUnlockTop50HardestAchievement(context = {}) {
  const result = context.result || state.lastResult;
  const puzzle = context.puzzle || state.puzzle;
  if (!result?.won || !puzzle?.vocadbId) return;
  const hardest = await fetchRankings("hardest");
  if (!Array.isArray(hardest)) return;
  const top50Ids = new Set(hardest.slice(0, 50).map((entry) => String(entry.songId)));
  if (top50Ids.has(String(puzzle.vocadbId))) {
    unlockAchievement("secret_top_50_hardest");
  }
}

function maybeUpdateRarestSolvedStats(globalRate, context = {}) {
  const mode = context.mode || state.mode;
  const puzzle = context.puzzle || state.puzzle;
  const result = context.result || state.lastResult;
  if (mode !== "daily" && mode !== "unlimited") return;
  if (!puzzle || !result || !result.won) return;
  const stats = mode === "unlimited"
    ? hasActiveUnlimitedFilters()
      ? loadFilteredStats()
      : state.unlimitedDifficulty === "all"
      ? loadUnlimitedStats()
      : loadUnlimitedDifficultyStats(state.unlimitedDifficulty)
    : loadStats();
  let changed = false;
  const record = {
    vocadbId: puzzle.vocadbId,
    title: result.displayTitle || getDisplayTitle(puzzle),
    artist: result.artist || getSuggestionArtist(puzzle),
    rate: globalRate,
    attempts: result.attempts,
    solvedAt: Date.now(),
  };

  const prevHardest = stats.hardestSolved;
  if (!prevHardest || typeof prevHardest.rate !== "number" || prevHardest.rate > globalRate) {
    stats.hardestSolved = record;
    changed = true;
  }

  const prevFirstTry = stats.rarestFirstTry;
  if (result.attempts === 1 && (!prevFirstTry || typeof prevFirstTry.rate !== "number" || prevFirstTry.rate > globalRate)) {
    stats.rarestFirstTry = record;
    changed = true;
  }

  if (!changed) return;
  if (mode === "unlimited" && hasActiveUnlimitedFilters()) saveFilteredStats(stats);
  else saveStatsForMode(mode, stats);
  // Refresh modal in case it's open right now.
  if (typeof renderStats === "function") renderStats();
}

function renderGlobalStats() {
  if (!globalStatsEl || !lastGlobalStats) return;
  const { rate, plays, avg } = lastGlobalStats;
  const statsLine = avg === null
    ? t("globalStatsNoWins", rate, plays)
    : t("globalStats", rate, avg.toFixed(1), plays);

  const diffKey = getDifficultyKey(rate);
  const diffLabel = t("difficulty" + diffKey.charAt(0).toUpperCase() + diffKey.slice(1));
  const diffLine = `<span class="gs-difficulty gs-diff-${diffKey}">${t("difficultyLabel", diffLabel)}</span>`;

  globalStatsEl.innerHTML = `${statsLine}<br>${diffLine}`;
  globalStatsEl.hidden = false;
}

function getGlobalComparisonVerdict(result, avg) {
  if (!result?.won) return t("globalComparisonRevealed");
  const attempts = result.attempts || 0;
  const diff = attempts - avg;
  const displayedAvg = Number(avg.toFixed(1));
  if (attempts === displayedAvg) return t("globalComparisonMatched");
  if (diff <= -0.5) return t("globalComparisonBeat");
  if (diff <= 0.75) return t("globalComparisonClose");
  return t("globalComparisonLate");
}

function buildGlobalComparisonHtml(avg, result = state.lastResult) {
  if (avg === null || avg === undefined || !result) return "";
  const avgText = Number(avg).toFixed(1);
  const verdict = getGlobalComparisonVerdict(result, Number(avg));
  return result.won
    ? t("globalComparisonLine", result.attempts, avgText, verdict)
    : t("globalComparisonRevealLine", avgText, verdict);
}

function getYouTubeImageVideoId(url) {
  const match = url.match(/(?:i\d?\.ytimg\.com\/vi\/|img\.youtube\.com\/vi\/)([^/]+)/);
  return match?.[1] || "";
}

function getExpandedCoverArtUrls(url) {
  const videoId = getYouTubeImageVideoId(url);

  if (!videoId) {
    return [url];
  }

  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/default.jpg`,
  ];
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

function getCoverArts(song) {
  const coverArts = [...(song.coverArts || []), song.coverArt].filter(Boolean);
  const expandedCoverArts = coverArts.flatMap(getExpandedCoverArtUrls);
  const uniqueCoverArts = [...new Set(expandedCoverArts)];

  return uniqueCoverArts.sort((firstUrl, secondUrl) => getCoverArtScore(secondUrl) - getCoverArtScore(firstUrl));
}

function showCoverArt(index) {
  const coverArts = getCoverArts(state.puzzle);
  coverImage.dataset.coverIndex = String(index);
  coverImage.src = coverArts[index];
}

function showNextCoverArt() {
  const nextIndex = Number(coverImage.dataset.coverIndex || 0) + 1;
  const coverArts = getCoverArts(state.puzzle || {});

  if (nextIndex < coverArts.length) {
    showCoverArt(nextIndex);
    return true;
  }

  coverImage.hidden = true;
  coverFallback.innerHTML = `
    <strong>${escapeHtml(state.puzzle.title)}</strong>
    <span>${escapeHtml(state.puzzle.artistString || state.puzzle.artist)}</span>
  `;
  coverFallback.hidden = false;
  return false;
}

function isLowQualityYouTubePlaceholder() {
  const imageUrl = coverImage.currentSrc || coverImage.src;

  if (!imageUrl.includes("ytimg.com")) {
    return false;
  }

  if (coverImage.naturalWidth <= 320 || coverImage.naturalHeight <= 180) {
    return true;
  }

  return imageUrl.includes("/maxresdefault.jpg") && coverImage.naturalWidth < 1000;
}

coverImage.addEventListener("load", () => {
  if (isLowQualityYouTubePlaceholder()) {
    showNextCoverArt();
  }
});

coverImage.addEventListener("error", () => {
  showNextCoverArt();
});

function completeRound(won) {
  state.isComplete = true;
  stopClip();
  state.lastResult = recordResult(won) || {
    won,
    attempts: won ? state.attempt : null,
    title: state.puzzle.title,
  };
  revealAnswer({ showComparisonToast: true });
  playButton.disabled = false;
  playButton.setAttribute("aria-label", "Play full clip");
  state.clipStage = clipStages.length - 1;
  skipButton.disabled = true;
  guessInput.disabled = true;
  nextButton.hidden = false;
  shareButton.hidden = false;
  renderBookmarkButton();
  if (giveUpButton) giveUpButton.hidden = true;
  if (state.mode === "daily") {
    localStorage.setItem("vh-last-played-date", getDateKey());
    const badge = document.querySelector("#new-badge");
    if (badge) badge.hidden = true;
  }
  if (won) {
    showToast(t("toastCorrect", getDisplayTitle(state.puzzle)));
    gamePanel.classList.remove("is-loss");
    updateMylist();
    triggerCorrectBurst();
    triggerCoverFlash();
    checkSenbonzakura();
  } else {
    showLossToast(t("toastAnswer", getDisplayTitle(state.puzzle)));
    gamePanel.classList.add("is-loss");
  }
  // Record global stats only for plain All Unlimited. Filtered and difficulty
  // practice runs are local-only so curated pools cannot skew rankings.
  if (state.mode === "unlimited" && state.unlimitedDifficulty === "all" && !hasActiveUnlimitedFilters()) {
    fetch("https://vocaloidle-stats.sodapines.workers.dev/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        songId: state.puzzle.vocadbId,
        won,
        attempts: won ? state.attempt : null,
      }),
    }).catch(() => {});
  }
}

function render() {
  gamePanel.classList.toggle("is-complete", state.isComplete);
  puzzleDate.textContent = state.mode === "daily"
    ? formatToday()
    : state.mode === "archive" && state.archiveDate
      ? formatArchiveDate(state.archiveDate)
      : t("unlimited");
  attemptCount.textContent = t("attempt", state.attempt, clipStages.length);
  clipLength.textContent = `${clipStages[state.clipStage]}s`;
  if (videoHeaderLength) {
    videoHeaderLength.textContent = state.mode === "unlimited"
      ? getUnlimitedModeStatusNote()
      : clipLength.textContent;
  }
  modeEyebrow.textContent = state.mode === "daily"
    ? t("dailyPuzzle")
    : state.mode === "archive"
      ? t("archivePuzzle")
      : state.unlimitedDifficulty === "all"
        ? t("unlimitedPuzzle")
        : t("unlimitedPracticePuzzle", getDifficultyPracticeLabel(state.unlimitedDifficulty));
  if (sourceLink) {
    sourceLink.href = state.isComplete && state.puzzle?.vocadbUrl ? state.puzzle.vocadbUrl : "https://vocadb.net";
    sourceLink.textContent = "VocaDB";
  }
  nextButton.hidden = !state.isComplete;
  shareButton.hidden = !state.isComplete;
  renderBookmarkButton();
  shareOutput.value = state.isComplete ? buildShareText() : "";
  if (resultTools) resultTools.hidden = !state.isComplete;
  if (kofiNudgeEl) kofiNudgeEl.hidden = !state.isComplete;
  if (reportIssueNudge) reportIssueNudge.hidden = !state.isComplete;
  dailyModeButton.classList.toggle("is-active", state.mode === "daily");
  unlimitedModeButton.classList.toggle("is-active", state.mode === "unlimited");
  if (archiveModeButton) archiveModeButton.classList.toggle("is-active", state.mode === "archive");
  renderDifficultyModeControls();
  updateProgress(0);
  updateGiveUpVisibility();
  updateAttemptDots();
  updateCoverPlaceholderState();
  renderGuesses();
  updateNextDailyCountdown();
}

function getResultIcon(result) {
  if (result === "Strong") return "*";
  if (result === "Artist") return "~";
  if (result === "Vocal") return "v";
  if (result === "Correct") return "✓";
  if (result === "Wrong") return "✗";
  if (result === "Skipped") return "→";
  if (result === "Answer") return "!";
  return "";
}

function getResultLabel(result) {
  if (result === "Strong") return t("strongMatch");
  if (result === "Artist") return t("artistMatch");
  if (result === "Vocal") return t("vocalMatch");
  if (result === "Correct") return t("correct");
  if (result === "Wrong") return t("wrong");
  if (result === "Skipped") return t("skipped");
  if (result === "Answer") return t("answer");
  return result;
}

function renderGuesses() {
  if (state.guesses.length === 0) {
    guessList.innerHTML = `<li class="empty-guess">${t("noGuesses")}</li>`;
    return;
  }

  const previousCount = guessList.querySelectorAll("li:not(.empty-guess)").length;

  guessList.innerHTML = state.guesses
    .map((guess, index) => {
      const resultClass = ` is-${normalizeGuess(guess.result).replace(/\s+/g, "-")}`;
      const guessSong = guess.songId ? getSongById(guess.songId) : null;
      const safeLabel = escapeHtml(guessSong ? getDisplayTitle(guessSong) : guess.label);
      const safeResult = escapeHtml(getResultLabel(guess.result));
      const icon = getResultIcon(guess.result);
      const isNew = index === state.guesses.length - 1 && state.guesses.length > previousCount;

      return `
        <li${isNew ? ' class="guess-flash"' : ""}>
          <span>${safeLabel}</span>
          <span class="guess-result${resultClass}"><span class="guess-icon">${icon}</span> ${safeResult}</span>
        </li>
      `;
    })
    .join("");
}

function updateCoverPlaceholderState() {
  if (!coverPlaceholderMark) return;
  coverPlaceholderMark.classList.remove("is-default", "is-wrong", "is-strong", "is-artist", "is-vocal", "is-skipped");

  if (state.isComplete) return;

  const lastGuess = [...state.guesses].reverse().find((guess) => (
    guess.result === "Wrong" ||
    guess.result === "Strong" ||
    guess.result === "Artist" ||
    guess.result === "Vocal" ||
    guess.result === "Skipped"
  ));

  const stateClass = lastGuess?.result === "Wrong"
    ? "is-wrong"
    : lastGuess?.result === "Strong"
      ? "is-strong"
      : lastGuess?.result === "Artist"
        ? "is-artist"
        : lastGuess?.result === "Vocal"
          ? "is-vocal"
          : lastGuess?.result === "Skipped"
            ? "is-skipped"
            : "is-default";

  coverPlaceholderMark.classList.add(stateClass);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${escapedQuery})`, "gi"), "<mark>$1</mark>");
}

// Tracks whether the current input value was explicitly chosen from the suggestion list
let suggestionWasSelected = false;

function renderSuggestions() {
  const query = guessInput.value;
  const matches = getMatchingSongEntries(query);
  const normalizedQuery = normalizeGuess(query);

  // Remember what title is currently highlighted so we can restore it after re-render
  const previousActiveSongId = activeSuggestionIndex >= 0
    ? suggestionList.querySelectorAll("li")[activeSuggestionIndex]?.dataset.songId
    : null;

  activeSuggestionIndex = -1;

  if (matches.length === 0) {
    hideSuggestions();
    return;
  }

  suggestionList.innerHTML = matches
    .map(
      ({ song, matchedTitle }, index) => {
        const displayTitle = getDisplayTitle(song);
        const title = matchedTitle || displayTitle;
        const artist = getSuggestionArtist(song);
        const subtitle = normalizeGuess(title) === normalizeGuess(displayTitle)
          ? artist
          : `${displayTitle} · ${artist}`;

        return `
        <li role="option" data-index="${index}" data-song-id="${escapeHtml(String(song.vocadbId))}" data-title="${escapeHtml(title)}">
          <span class="suggestion-title">${highlightMatch(title, normalizedQuery)}</span>
          <span class="suggestion-artist">${escapeHtml(subtitle)}</span>
        </li>
      `;
      },
    )
    .join("");
  suggestionList.hidden = false;
  guessInput.setAttribute("aria-expanded", "true");

  // Restore highlighted selection by title rather than by index so fast typing
  // doesn't silently shift what's highlighted when results reorder
  if (previousActiveSongId) {
    const items = Array.from(suggestionList.querySelectorAll("li"));
    const restored = items.findIndex((li) => li.dataset.songId === previousActiveSongId);
    if (restored >= 0) {
      activeSuggestionIndex = restored;
      items[restored].classList.add("is-active");
    }
  }
}

// Debounced wrapper - fires renderSuggestions after 80 ms of quiet typing.
// Short enough not to feel laggy; long enough to skip intermediate keystrokes.
let _suggestionDebounceTimer = null;
function renderSuggestionsDebounced() {
  suggestionWasSelected = false;
  selectedSuggestionSongId = null;
  clearTimeout(_suggestionDebounceTimer);
  _suggestionDebounceTimer = setTimeout(renderSuggestions, 80);
}

function hideSuggestions() {
  suggestionList.hidden = true;
  suggestionList.innerHTML = "";
  guessInput.setAttribute("aria-expanded", "false");
}

function selectSuggestion(title, songId = null) {
  guessInput.value = title;
  suggestionWasSelected = true;
  selectedSuggestionSongId = songId ? String(songId) : null;
  hideSuggestions();
  guessInput.focus();
}

function setActiveSuggestion(index) {
  const options = Array.from(suggestionList.querySelectorAll("li"));

  if (options.length === 0) {
    return;
  }

  activeSuggestionIndex = (index + options.length) % options.length;
  options.forEach((option, optionIndex) => {
    option.classList.toggle("is-active", optionIndex === activeSuggestionIndex);
  });
}

function addGuess(label, result, songId = null) {
  state.guesses.push({ label, result, songId });
}

function resetPlayButton() {
  playButton.classList.remove("is-playing");
  playButton.setAttribute("aria-label", "Play clip");
}

function updateProgress(seconds = currentAudio?.currentTime || 0) {
  const unlockedLength = clipStages[state.clipStage] || clipStages[0];
  const visibleSeconds = Math.min(seconds, unlockedLength);
  const markerNudge = visibleSeconds > 0 ? 0.09 : 0;
  const percent = Math.max(0, Math.min(((visibleSeconds + markerNudge) / maxClipLength) * 100, 100));
  document.documentElement.style.setProperty("--clip-progress", `${percent}%`);
}

function stopProgressLoop() {
  if (progressFrame) {
    cancelAnimationFrame(progressFrame);
    progressFrame = null;
  }
}

function startProgressLoop() {
  stopProgressLoop();
  const tick = () => {
    updateProgress();
    progressFrame = requestAnimationFrame(tick);
  };
  tick();
}

function stopClip() {
  if (clipTimer) {
    clearTimeout(clipTimer);
    clipTimer = null;
  }

  stopProgressLoop();

  if (currentAudio) {
    currentAudio.pause();
  }

  resetPlayButton();
}

function getVolume() {
  const v = parseFloat(localStorage.getItem("vh-volume"));
  return isNaN(v) ? 0.5 : v;
}

function playClip() {
  if (!state.puzzle || !currentAudio) {
    return;
  }

  stopClip();
  currentAudio.currentTime = 0;
  currentAudio.volume = getVolume();
  state.hasPlayedPreview = true;
  playButton.classList.add("is-playing");
  playButton.setAttribute("aria-label", "Pause clip");
  updateProgress(0);

  const clipLength = clipStages[state.clipStage] * 1000;
  currentAudio.play().catch(() => {
    resetPlayButton();
  });
  startProgressLoop();

  clipTimer = setTimeout(() => {
    stopClip();
    currentAudio.currentTime = 0;
    updateProgress(0);
  }, clipLength);
}

function toggleClipPlayback() {
  if (currentAudio && !currentAudio.paused) {
    stopClip();
    currentAudio.currentTime = 0;
    return;
  }

  playClip();
}

function extendActiveClipToUnlockedLength() {
  if (!currentAudio || currentAudio.paused) {
    return;
  }

  if (clipTimer) {
    clearTimeout(clipTimer);
    clipTimer = null;
  }

  const unlockedLength = clipStages[state.clipStage] || clipStages[0];
  const remainingMs = Math.max(0, (unlockedLength - currentAudio.currentTime) * 1000);

  if (remainingMs <= 0) {
    stopClip();
    currentAudio.currentTime = 0;
    updateProgress(0);
    return;
  }

  updateProgress();
  clipTimer = setTimeout(() => {
    stopClip();
    currentAudio.currentTime = 0;
    updateProgress(0);
  }, remainingMs);
}

function buildShareText() {
  if (!state.puzzle || !state.lastResult) {
    return "";
  }

  const heading = state.mode === "daily"
    ? t("heardleDaily")
    : state.mode === "archive"
      ? t("heardleArchive")
      : state.unlimitedDifficulty === "all"
        ? t("heardleUnlimited")
        : t("heardleUnlimitedDifficulty", getDifficultyLabel(state.unlimitedDifficulty));
  const score = state.lastResult.won ? `${state.lastResult.attempts}/${clipStages.length}` : `X/${clipStages.length}`;
  const context = state.mode === "daily"
    ? formatToday()
    : state.mode === "archive" && state.archiveDate
      ? formatArchiveDate(state.archiveDate)
      : getDisplayTitle(state.puzzle);

  let gaveUp = false;
  const squares = clipStages
    .map((_, index) => {
      if (gaveUp) return null;
      const guess = state.guesses[index];
      if (guess?.result === "Answer") { gaveUp = true; return "\u2B1B"; }
      if (guess?.result === "Wrong") return "\uD83D\uDFE5";
      if (guess?.result === "Strong") return "\uD83D\uDFEA";
      if (guess?.result === "Artist") return "\uD83D\uDFE8";
      if (guess?.result === "Vocal") return "\uD83D\uDFE6";
      if (guess?.result === "Skipped") return "\u2B1B";
      if (guess?.result === "Correct") return "\uD83D\uDFE9";
      if (!state.lastResult.won) return "\u2B1B";
      if (index + 1 < state.lastResult.attempts) return "\u2B1B";
      if (index + 1 === state.lastResult.attempts) return "\uD83D\uDFE9";
      return "\u2B1C";
    })
    .filter((s) => s !== null)
    .join(" ");

  // Stats line - only included if we have global data cached from loadGlobalStats.
  // Race-safe: if the player copies before the fetch resolves (or fetch failed),
  // we just omit the line rather than showing placeholder text.
  const lines = [
    heading,
    `${score} - ${context}`,
  ];
  if (lastGlobalStats) {
    const { rate, avg } = lastGlobalStats;
    lines.push(t("shareGlobalStats", rate, avg));
  }
  lines.push("");
  lines.push(`\uD83D\uDD0A ${squares}`);

  return lines.join("\n");
}

// ── GLOBAL RANKINGS ──
const WORKER_URL = "https://vocaloidle-stats.sodapines.workers.dev";
const rankingsCache = {};
let currentSbTab = "plays";
let currentModalTab = "plays";

function formatVisitorCounter(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return "------";
  return String(Math.floor(count)).padStart(6, "0");
}

function renderVisitorCounter(total) {
  const display = document.querySelector("#visitor-total");
  const text = document.querySelector("#visitor-total-text");
  const formatted = formatVisitorCounter(total);
  if (display) display.textContent = formatted;
  if (text) text.textContent = Number.isFinite(Number(total)) ? Number(total).toLocaleString() : "--";
}

async function loadVisitorCounter() {
  const display = document.querySelector("#visitor-total");
  if (!display) return;

  try {
    const hasCounted = localStorage.getItem(visitorCountedKey) === "1";
    const endpoint = hasCounted ? "visitors" : "visit";
    const res = await fetch(`${WORKER_URL}/${endpoint}`, {
      method: hasCounted ? "GET" : "POST",
    });
    if (!res.ok) throw new Error("visitor counter unavailable");
    const data = await res.json();
    if (!hasCounted) localStorage.setItem(visitorCountedKey, "1");
    renderVisitorCounter(data.total);
  } catch {
    renderVisitorCounter(null);
  }
}

function getSongById(vocadbId) {
  return songs.find(s => String(s.vocadbId) === String(vocadbId)) || null;
}

async function fetchRankings(sort) {
  if (rankingsCache[sort]) return rankingsCache[sort];
  try {
    const isAvgSort = sort === "avg-low" || sort === "avg-high";
    let data;
    if (isAvgSort) {
      const responses = await Promise.all([
        fetch(`${WORKER_URL}/leaderboard?sort=plays&limit=1000`),
        fetch(`${WORKER_URL}/leaderboard?sort=hardest&limit=1000`),
        fetch(`${WORKER_URL}/leaderboard?sort=easiest&limit=1000`),
      ]);
      const payloads = await Promise.all(responses.map((res) => res.json()));
      const merged = new Map();
      payloads.flat().forEach((entry) => {
        if (entry?.songId) merged.set(String(entry.songId), entry);
      });
      data = Array.from(merged.values());
    } else {
      const res = await fetch(`${WORKER_URL}/leaderboard?sort=${sort}&limit=50`);
      data = await res.json();
    }
    if (isAvgSort) {
      data = data
        .sort((a, b) => {
          const avgA = getAvgSortValue(a, sort);
          const avgB = getAvgSortValue(b, sort);
          const diff = avgA - avgB;
          if (diff !== 0) return sort === "avg-low" ? diff : -diff;
          const winDiff = (a.winRate || 0) - (b.winRate || 0);
          if (winDiff !== 0) return sort === "avg-low" ? winDiff : -winDiff;
          return (b.plays || 0) - (a.plays || 0);
        })
        .slice(0, 50);
    }
    rankingsCache[sort] = data;
    return data;
  } catch {
    return null;
  }
}

function getAvgSortValue(entry, sort) {
  const avg = Number(entry?.avgAttempts);
  if (Number.isFinite(avg)) return avg;
  return sort === "avg-low" ? 0 : -1;
}

function formatAvgAttempts(value) {
  const attempts = Number(value);
  return Number.isFinite(attempts) ? attempts.toFixed(1) : "--";
}

async function loadSidebarRankings(sort) {
  const list = document.querySelector("#sb-rankings-list");
  if (!list) return;
  if (localStorage.getItem("vh-sidebarextras") === "false") return;
  list.innerHTML = `<div class="sb-rankings-loading">${t("rankingsLoading")}</div>`;
  const data = await fetchRankings(sort);
  if (!data || data.length === 0) {
    list.innerHTML = `<div class="sb-rankings-loading">${t("rankingsNoData")}</div>`;
    return;
  }
  list.innerHTML = data.slice(0, 5).map((entry, index) => {
    const song = getSongById(entry.songId);
    const fullTitle = song ? getDisplayTitle(song) : `Song #${entry.songId}`;
    const title = truncateTitle(fullTitle, 28);
    const winRate = Math.round((entry.winRate || 0) * 100);
    const stat = t("rankingsWin", winRate);
    return `
      <div class="sb-rankings-row">
        <span class="sb-rankings-rank">${index + 1}</span>
        <span class="sb-rankings-song" title="${escapeHtml(fullTitle)}">${escapeHtml(title)}</span>
        <span class="sb-rankings-pct" title="${escapeHtml(stat)}">${escapeHtml(stat)}</span>
      </div>
    `;
  }).join("");
}

async function loadModalRankings(sort) {
  const content = document.querySelector("#rankings-content");
  if (!content) return;
  content.innerHTML = `<div class="rankings-loading">${t("rankingsLoading")}</div>`;
  const data = await fetchRankings(sort);
  if (!data || data.length === 0) {
    content.innerHTML = `<div class="rankings-loading">${t("rankingsNoDataModal")}</div>`;
    return;
  }
  content.innerHTML = data.map((entry, index) => {
    const song = getSongById(entry.songId);
    const title = song ? truncateTitle(getDisplayTitle(song), 40) : `Song #${entry.songId}`;
    const artist = song ? getSuggestionArtist(song) : "-";
    const winRate = Math.round((entry.winRate || 0) * 100);
    const plays = (entry.plays || 0).toLocaleString();
    const avgAttempts = formatAvgAttempts(entry.avgAttempts);
    return `
      <div class="rankings-row">
        <span class="rankings-rank">${index + 1}</span>
        <span class="rankings-title-col">
          <span class="rankings-song">${escapeHtml(title)}</span>
          <span class="rankings-artist">${escapeHtml(artist)}</span>
        </span>
        <span class="rankings-stats-col">
          <span class="rankings-plays" title="${escapeHtml(t("rankingsPlays", plays))}">${escapeHtml(plays)}</span>
          <span class="rankings-winrate" title="${escapeHtml(t("rankingsWin", winRate))}">${winRate}%</span>
          <span class="rankings-avg" title="${escapeHtml(t("rankingsAvgAttempts", avgAttempts))}">${escapeHtml(avgAttempts)}</span>
        </span>
      </div>
    `;
  }).join("");
}

document.querySelectorAll(".sb-rankings-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    currentSbTab = btn.dataset.rankingsTab;
    document.querySelectorAll(".sb-rankings-tab").forEach(b =>
      b.classList.toggle("is-active", b.dataset.rankingsTab === currentSbTab)
    );
    rankingsCache[currentSbTab] = null; // clear cache to refresh
    loadSidebarRankings(currentSbTab);
  });
});

document.querySelectorAll(".rankings-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    currentModalTab = btn.dataset.tab;
    document.querySelectorAll(".rankings-tab").forEach(b =>
      b.classList.toggle("is-active", b.dataset.tab === currentModalTab)
    );
    rankingsCache[currentModalTab] = null;
    loadModalRankings(currentModalTab);
  });
});

document.querySelectorAll("[data-modal-target='rankings']").forEach(el => {
  el.addEventListener("click", () => loadModalRankings(currentModalTab));
});

loadSidebarRankings(currentSbTab);

window.addEventListener("sidebar-extras-change", (event) => {
  if (event.detail?.enabled) loadSidebarRankings(currentSbTab);
});

function showToast(message) {
  const existing = document.querySelector("#nnd-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "nnd-toast";
  toast.innerHTML = `<span class="nnd-toast-label">[✓]</span><span class="nnd-toast-msg">${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("nnd-toast-fade"), 1800);
  setTimeout(() => toast.remove(), 2400);
}

function showLossToast(message) {
  const existing = document.querySelector("#nnd-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "nnd-toast";
  toast.classList.add("nnd-toast-loss");
  toast.innerHTML = `<span class="nnd-toast-label">[!]</span><span class="nnd-toast-msg">${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("nnd-toast-fade"), 2800);
  setTimeout(() => toast.remove(), 3400);
}

function showGlobalComparisonToast(messageHtml) {
  if (!messageHtml) return;
  const existing = document.querySelector("#global-comparison-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "global-comparison-toast";
  toast.innerHTML = `
    <span class="nnd-toast-label">[AVG]</span>
    <span class="nnd-toast-msg">${messageHtml}</span>
    <button class="comparison-toast-close" type="button" aria-label="Close comparison">x</button>
  `;
  document.body.appendChild(toast);

  const close = () => {
    toast.classList.add("nnd-toast-fade");
    setTimeout(() => toast.remove(), 500);
  };
  toast.querySelector(".comparison-toast-close")?.addEventListener("click", close);
  setTimeout(close, 5000);
}

function pulsePlayButton() {
  playButton.classList.remove("pulse");
  void playButton.offsetWidth;
  playButton.classList.add("pulse");
  setTimeout(() => playButton.classList.remove("pulse"), 600);
}

function copyText(value) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) {
    return Promise.reject(new Error("Copy failed"));
  }

  return Promise.resolve();
}

function isCorrectGuess(guess) {
  const acceptedTitles = state.puzzle.acceptedTitles || [state.puzzle.title];
  return acceptedTitles.some((title) => normalizeGuess(guess) === normalizeGuess(title));
}

function isCorrectSubmission(guess, guessedSong = null) {
  if (suggestionWasSelected && guessedSong?.vocadbId) {
    return String(guessedSong.vocadbId) === String(state.puzzle.vocadbId);
  }

  return isCorrectGuess(guess);
}

function songTitleMatchesGuess(song, guess) {
  const normalized = normalizeGuess(guess);
  const titles = [song.title, song.vocadbName, ...(song.acceptedTitles || [])].filter(Boolean);
  return titles.some((title) => normalizeGuess(title) === normalized);
}

function getSongMatchedByTitle(guess) {
  if (selectedSuggestionSongId) {
    const selectedSong = getSongById(selectedSuggestionSongId);
    if (selectedSong && songTitleMatchesGuess(selectedSong, guess)) {
      return selectedSong;
    }
  }

  return songs.find((song) => songTitleMatchesGuess(song, guess)) || null;
}

function isDuplicateGuess(guess, guessedSong = null) {
  const checkedResults = new Set(["Wrong", "Strong", "Artist", "Vocal"]);

  if (guessedSong?.vocadbId) {
    return state.guesses.some((entry) => (
      checkedResults.has(entry.result) &&
      entry.songId &&
      String(entry.songId) === String(guessedSong.vocadbId)
    ));
  }

  const normalizedGuess = normalizeGuess(guess);
  return state.guesses.some((entry) => (
    checkedResults.has(entry.result) &&
    !entry.songId &&
    normalizeGuess(entry.label) === normalizedGuess
  ));
}

function getArtistCreditKeys(song) {
  const singerKeys = new Set((song?.singerNames || []).map(normalizeGuess));
  const names = [
    song?.artist,
    ...(song?.producerNames || []),
    ...(song?.artistSearchNames || []).filter((name) => {
      const normalized = normalizeGuess(name);
      return !singerKeys.has(normalized) && !/\bfeat\b/i.test(String(name));
    }),
  ];
  return new Set(
    names
      .map(normalizeGuess)
      .filter((name) => name.length >= 3),
  );
}

function getProducerCreditKeys(song) {
  const names = (song?.producerNames?.length ? song.producerNames : [song?.artist]).filter(Boolean);
  return new Set(
    names
      .map(normalizeGuess)
      .filter((name) => name.length >= 3),
  );
}

function isArtistCreditGuess(guess) {
  const normalized = normalizeGuess(guess);
  return getArtistCreditKeys(state.puzzle).has(normalized);
}

function isArtistCreditMatch(song) {
  if (!song || !state.puzzle) return false;
  const puzzleCredits = getProducerCreditKeys(state.puzzle);
  return [...getProducerCreditKeys(song)].some((credit) => puzzleCredits.has(credit));
}

function isPartialArtistGuess(guess, guessedSong = null) {
  if (isCorrectGuess(guess)) return false;
  return isArtistCreditGuess(guess) || isArtistCreditMatch(guessedSong);
}

function getVocalCreditKeys(song) {
  return new Set(
    (song?.singerNames || [])
      .map(normalizeGuess)
      .filter((name) => name.length >= 2),
  );
}

function isVocalCreditGuess(guess) {
  const normalized = normalizeGuess(guess);
  return getVocalCreditKeys(state.puzzle).has(normalized);
}

function isVocalCreditMatch(song) {
  if (!song || !state.puzzle) return false;
  const puzzleVocals = getVocalCreditKeys(state.puzzle);
  return [...getVocalCreditKeys(song)].some((credit) => puzzleVocals.has(credit));
}

function isPartialVocalGuess(guess, guessedSong = null) {
  if (isCorrectGuess(guess)) return false;
  return isVocalCreditGuess(guess) || isVocalCreditMatch(guessedSong);
}

function isStrongCreditMatch(guessedSong = null) {
  return Boolean(guessedSong && isArtistCreditMatch(guessedSong) && isVocalCreditMatch(guessedSong));
}

function advanceAttempt() {
  if (state.isComplete || state.attempt >= clipStages.length) {
    state.isComplete = true;
    return;
  }

  state.attempt += 1;
  state.clipStage += 1;
  saveActiveUnlimitedRound();
  render();
}

playButton.addEventListener("click", toggleClipPlayback);

function skipCurrentAttempt() {
  if (!state.puzzle || state.isComplete) {
    return;
  }

  const shouldExtendClip = currentAudio && !currentAudio.paused;
  addGuess(`${t("skipped")} ${state.attempt}`, "Skipped");
  if (state.attempt >= clipStages.length) {
    completeRound(false);
  } else {
    advanceAttempt();
    if (shouldExtendClip) {
      extendActiveClipToUnlockedLength();
    }
  }
  render();
}

skipButton.addEventListener("click", skipCurrentAttempt);

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const guess = guessInput.value.trim();

  if (!state.puzzle || state.isComplete || !guess) {
    return;
  }

  // ── Duplicate guess protection ──
  // ── Producer-only guard ──
  // If what was typed doesn't match any song title (only artist fields), and the
  // user didn't explicitly pick from the suggestion list, block the submission.
  // This prevents a bare producer name like "maretu" from burning an attempt.
  const guessedSong = getSongMatchedByTitle(guess);
  if (isDuplicateGuess(guess, guessedSong)) {
    showLossToast(t("toastAlreadyGuessed"));
    return;
  }

  const matchesTitleDirectly = Boolean(guessedSong);
  const matchesPuzzleArtist = isPartialArtistGuess(guess, guessedSong);
  const matchesPuzzleVocal = isPartialVocalGuess(guess, guessedSong);
  const matchesPuzzleStrong = isStrongCreditMatch(guessedSong);

  if (!matchesTitleDirectly && !matchesPuzzleArtist && !matchesPuzzleVocal && !suggestionWasSelected) {
    // Show the suggestions (in case debounce hasn't fired yet) and warn
    clearTimeout(_suggestionDebounceTimer);
    renderSuggestions();
    showLossToast(t("toastSelectSong"));
    return;
  }

  const isCorrect = isCorrectSubmission(guess, guessedSong);

  if (isCorrect) {
    addGuess(state.puzzle.title, "Correct", state.puzzle.vocadbId);
    completeRound(true);
    guessForm.reset();
    hideSuggestions();
  } else if (matchesPuzzleStrong) {
    addGuess(guess, "Strong", guessedSong?.vocadbId || null);
    showLossToast(t("toastStrongMatch"));
    const clearOnWrong = localStorage.getItem("vh-clearwrong") !== "false";
    if (clearOnWrong) {
      guessInput.value = "";
      hideSuggestions();
    }
    if (state.attempt >= clipStages.length) {
      completeRound(false);
    } else {
      advanceAttempt();
    }
  } else if (matchesPuzzleArtist) {
    addGuess(guess, "Artist", guessedSong?.vocadbId || null);
    showLossToast(t("toastArtistMatch"));
    const clearOnWrong = localStorage.getItem("vh-clearwrong") !== "false";
    if (clearOnWrong) {
      guessInput.value = "";
      hideSuggestions();
    }
    if (state.attempt >= clipStages.length) {
      completeRound(false);
    } else {
      advanceAttempt();
    }
  } else if (matchesPuzzleVocal) {
    addGuess(guess, "Vocal", guessedSong?.vocadbId || null);
    showLossToast(t("toastVocalMatch"));
    const clearOnWrong = localStorage.getItem("vh-clearwrong") !== "false";
    if (clearOnWrong) {
      guessInput.value = "";
      hideSuggestions();
    }
    if (state.attempt >= clipStages.length) {
      completeRound(false);
    } else {
      advanceAttempt();
    }
  } else {
    addGuess(guess, "Wrong", guessedSong?.vocadbId || null);
    const clearOnWrong = localStorage.getItem("vh-clearwrong") !== "false";
    if (clearOnWrong) {
      guessInput.value = "";
      hideSuggestions();
    }
    if (state.attempt >= clipStages.length) {
      completeRound(false);
    } else {
      advanceAttempt();
    }
  }
  suggestionWasSelected = false;
  selectedSuggestionSongId = null;
  render();
});

guessInput.addEventListener("input", renderSuggestionsDebounced);

guessInput.addEventListener("keydown", (event) => {
  if (suggestionList.hidden) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveSuggestion(activeSuggestionIndex + 1);
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveSuggestion(activeSuggestionIndex - 1);
  }

  if (event.key === "Enter" && activeSuggestionIndex >= 0) {
    event.preventDefault();
    const option = suggestionList.querySelectorAll("li")[activeSuggestionIndex];
    selectSuggestion(option.dataset.title, option.dataset.songId);
  }

  if (event.key === "Escape") {
    hideSuggestions();
  }
});

const giveUpButton = document.querySelector("#give-up-button");
if (giveUpButton) {
  giveUpButton.addEventListener("click", () => {
    if (!state.puzzle || state.isComplete) return;
    addGuess(t("gaveUp"), "Answer");
    completeRound(false);
    render();
  });
}

function updateAttemptDots() {
  const container = document.querySelector("#sb-attempt-dots");
  if (!container) return;
  container.innerHTML = clipStages.map((_, i) => {
    const attemptNum = i + 1;
    const guess = state.guesses[i];
    let cls = "sb-attempt-dot";
    if (state.isComplete && state.lastResult?.won && attemptNum === state.lastResult.attempts) {
      cls += " is-correct";
    } else if (guess?.result === "Strong") {
      cls += " is-strong";
    } else if (guess?.result === "Artist") {
      cls += " is-artist";
    } else if (guess?.result === "Vocal") {
      cls += " is-vocal";
    } else if (guess?.result === "Wrong" || guess?.result === "Answer") {
      cls += " is-used";
    } else if (guess?.result === "Skipped") {
      cls += " is-skipped";
    } else if (attemptNum === state.attempt && !state.isComplete) {
      cls += " is-current";
    }
    return `<span class="${cls}"></span>`;
  }).join("");
}

function updateGiveUpVisibility() {
  if (giveUpButton) {
    giveUpButton.hidden = state.isComplete || state.attempt < 3;
  }
}

function checkNewBadge() {
  const badge = document.querySelector("#new-badge");
  if (!badge) return;
  const lastPlayed = localStorage.getItem("vh-last-played-date");
  badge.hidden = lastPlayed === getDateKey();
}

const resetStatsButton = document.querySelector("#reset-stats-button");
const resetStatsConfirm = document.querySelector("#reset-stats-confirm");
const resetStatsYes = document.querySelector("#reset-stats-yes");
const resetStatsNo = document.querySelector("#reset-stats-no");

if (exportStatsButton) {
  exportStatsButton.addEventListener("click", async () => {
    const backup = JSON.stringify(buildStatsBackup(), null, 2);
    try {
      await copyText(backup);
      showToast(t("toastStatsExported"));
    } catch {
      if (statsImportPanel && statsImportInput) {
        statsImportPanel.hidden = false;
        statsImportInput.value = backup;
        statsImportInput.focus();
        statsImportInput.select();
      }
    }
  });
}
if (importStatsButton) {
  importStatsButton.addEventListener("click", () => {
    if (!statsImportPanel || !statsImportInput) return;
    statsImportPanel.hidden = false;
    statsImportInput.value = "";
    statsImportInput.focus();
  });
}
if (statsImportConfirm) {
  statsImportConfirm.addEventListener("click", () => {
    try {
      const imported = parseStatsBackup(statsImportInput?.value || "");
      saveStats(imported.stats);
      saveUnlimitedStats(imported.unlimitedStats);
      saveFilteredStats(imported.filteredStats);
      state.unlimitedFilters = saveUnlimitedFilters(imported.unlimitedFilters);
      saveUnlimitedDifficultyStatsMap(imported.unlimitedDifficultyStats);
      saveArchiveResults(imported.archiveResults);
      saveAchievements(imported.achievements);
      saveBookmarks(imported.bookmarks);
      if (imported.unlimitedHistory) saveUnlimitedHistory(imported.unlimitedHistory);
      if (imported.filteredHistory) saveFilteredHistory(imported.filteredHistory);
      if (imported.unlimitedDifficultyHistory) saveUnlimitedDifficultyHistoryMap(imported.unlimitedDifficultyHistory);
      clearAllActiveUnlimitedRounds();
      if (statsImportPanel) statsImportPanel.hidden = true;
      if (statsImportInput) statsImportInput.value = "";
      refreshAfterStatsImport();
      showToast(t("toastStatsImported"));
    } catch {
      showLossToast(t("toastStatsImportFailed"));
    }
  });
}
if (statsImportCancel) {
  statsImportCancel.addEventListener("click", () => {
    if (statsImportPanel) statsImportPanel.hidden = true;
    if (statsImportInput) statsImportInput.value = "";
  });
}

unlimitedFilterButton?.addEventListener("click", () => {
  filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  renderUnlimitedFilterModal();
});

filterProducerInput?.addEventListener("input", () => renderUnlimitedFilterModal());
filterVoicebankInput?.addEventListener("input", () => renderUnlimitedFilterModal());
filterProducerInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const first = filterProducerSuggestions?.querySelector("[data-filter-value]");
  if (first) addFilterValue("producer", first.dataset.filterValue);
});
filterVoicebankInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const first = filterVoicebankSuggestions?.querySelector("[data-filter-value]");
  if (first) addFilterValue("voicebank", first.dataset.filterValue);
});

filterProducerSuggestions?.addEventListener("mousedown", (event) => {
  const item = event.target.closest("[data-filter-select]");
  if (!item) return;
  event.preventDefault();
  addFilterValue("producer", item.dataset.filterValue);
});

filterVoicebankSuggestions?.addEventListener("mousedown", (event) => {
  const item = event.target.closest("[data-filter-select]");
  if (!item) return;
  event.preventDefault();
  addFilterValue("voicebank", item.dataset.filterValue);
});

filterProducerSelected?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter-remove]");
  if (button) removeFilterValue(button.dataset.filterRemove, button.dataset.filterValue);
});

filterVoicebankSelected?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter-remove]");
  if (button) removeFilterValue(button.dataset.filterRemove, button.dataset.filterValue);
});

filterProgramList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter-program]");
  if (button) toggleFilterValue("programs", button.dataset.filterProgram);
});

filterYearList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter-year]");
  if (button) toggleFilterValue("years", button.dataset.filterYear);
});

document.querySelectorAll("[data-filter-year-range]").forEach((button) => {
  button.addEventListener("click", () => toggleYearRange(button.dataset.filterYearRange));
});

filterCommunity?.addEventListener("change", () => {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  filterDraft.community = filterCommunity.checked;
  renderUnlimitedFilterModal();
});

filterNewSongs?.addEventListener("change", () => {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  filterDraft.newSongs = filterNewSongs.checked;
  renderUnlimitedFilterModal();
});

filterInclusive?.addEventListener("change", () => {
  if (!filterDraft) filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
  filterDraft.inclusive = filterInclusive.checked;
  renderUnlimitedFilterModal();
});

filterClearButton?.addEventListener("click", () => {
  filterDraft = getDefaultUnlimitedFilters();
  if (filterProducerInput) filterProducerInput.value = "";
  if (filterVoicebankInput) filterVoicebankInput.value = "";
  renderUnlimitedFilterModal();
});

filterApplyButton?.addEventListener("click", () => {
  applyUnlimitedFilters(filterDraft || getDefaultUnlimitedFilters());
  closeModal();
});

filterTagList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-filter-type]");
  if (!button) return;
  removeUnlimitedFilterTag(button.dataset.removeFilterType, button.dataset.removeFilterValue);
});

if (resetStatsButton) {
  resetStatsButton.addEventListener("click", () => {
    if (resetStatsConfirm) resetStatsConfirm.hidden = false;
    resetStatsButton.hidden = true;
  });
}
if (resetStatsYes) {
  resetStatsYes.addEventListener("click", () => {
    localStorage.removeItem(statsKey);
    localStorage.removeItem(unlimitedStatsKey);
    localStorage.removeItem(filteredStatsKey);
    localStorage.removeItem(unlimitedDifficultyStatsKey);
    localStorage.removeItem(archiveResultsKey);
    localStorage.removeItem(achievementsKey);
    localStorage.removeItem(bookmarksKey);
    localStorage.removeItem(unlimitedRecentKey);
    localStorage.removeItem(unlimitedHistoryKey);
    localStorage.removeItem(filteredHistoryKey);
    localStorage.removeItem(unlimitedDifficultyHistoryKey);
    localStorage.removeItem(unlimitedDifficultyRecentKey);
    localStorage.removeItem(unlimitedFiltersKey);
    localStorage.removeItem(unlimitedActiveRoundKey);
    localStorage.removeItem("vocaloid-heardle-mylist");
    state.unlimitedFilters = getDefaultUnlimitedFilters();
    state.unlimitedQueue = [];
    mylistCount = 0;
    initMylist();
    renderStats();
    renderDifficultyModeControls();
    renderAchievements();
    renderBookmarkButton();
    renderBookmarks();
    renderArchiveCalendar();
    showToast(t("toastStatsReset"));
    if (resetStatsConfirm) resetStatsConfirm.hidden = true;
    if (resetStatsButton) resetStatsButton.hidden = false;
  });
}
if (resetStatsNo) {
  resetStatsNo.addEventListener("click", () => {
    if (resetStatsConfirm) resetStatsConfirm.hidden = true;
    if (resetStatsButton) resetStatsButton.hidden = false;
  });
}

suggestionList.addEventListener("mousedown", (event) => {
  const option = event.target.closest("li");
  if (!option) return;
  event.preventDefault();
  selectSuggestion(option.dataset.title, option.dataset.songId);
});

function abandonActiveUnlimitedIfNeeded() {
  if (state.mode === "unlimited" && !state.isComplete && state.puzzle) {
    saveActiveUnlimitedRound();
    recordAbandonedUnlimitedRound();
  }
}

function saveActiveUnlimitedIfNeeded() {
  if (state.mode === "unlimited" && !state.isComplete && state.puzzle) {
    saveActiveUnlimitedRound();
  }
}

dailyModeButton.addEventListener("click", () => {
  // Save the active unlimited round so it can be resumed later, but don't record it
  // as abandoned - the player is just switching modes, not forfeiting.
  if (state.mode === "unlimited" && !state.isComplete && state.puzzle) {
    saveActiveUnlimitedRound();
  }
  state.mode = "daily";
  state.statsMode = "daily";
  state.archiveDate = null;
  rememberCurrentMode();
  clearArchiveUrl();
  document.title = "VOCALOID Heardle - Daily";
  loadPuzzle();
  renderStats();
});

if (archiveModeButton) {
  archiveModeButton.addEventListener("click", () => {
    renderArchiveCalendar();
  });
}

unlimitedModeButton.addEventListener("click", () => {
  // Only abandon if already in unlimited mid-round and resetting difficulty to "all".
  // Coming from daily/archive: the active round was already saved on departure, don't wipe it.
  if (state.mode === "unlimited") {
    saveActiveUnlimitedIfNeeded();
    state.unlimitedDifficulty = "all";
    state.statsDifficulty = "all";
    state.unlimitedQueue = [];
  }
  state.mode = "unlimited";
  state.statsMode = "unlimited";
  state.archiveDate = null;
  rememberCurrentMode();
  clearArchiveUrl();
  document.title = "VOCALOID Heardle - Unlimited";
  loadPuzzle();
  renderStats();
});

function goToNextSong() {
  if (!state.isComplete || nextButton.hidden) return;
  state.mode = "unlimited";
  state.statsMode = "unlimited";
  state.statsDifficulty = state.unlimitedDifficulty;
  state.archiveDate = null;
  rememberCurrentMode();
  clearArchiveUrl();
  suppressNextGuessAutofocus = true;
  loadPuzzle();
  renderStats();
}

nextButton.addEventListener("click", goToNextSong);

difficultyModeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const difficulty = button.dataset.unlimitedDifficulty || "all";
    if (difficulty === state.unlimitedDifficulty && state.mode === "unlimited") return;
    if (difficulty !== "all" && difficultyPools.status !== "ready" && difficultyPools.status !== "fallback") {
      showToast(t("difficultyLoading"));
      await fetchDifficultyPools();
    }
    const count = getUnlimitedDifficultyCount(difficulty);
    if (difficulty !== "all" && count === 0) {
      showLossToast(t("difficultyUnavailable"));
      return;
    }
    saveActiveUnlimitedIfNeeded();
    state.mode = "unlimited";
    state.statsMode = "unlimited";
    state.unlimitedDifficulty = difficulty;
    state.statsDifficulty = difficulty;
    state.archiveDate = null;
    state.unlimitedQueue = [];
    rememberCurrentMode();
    clearArchiveUrl();
    document.title = `VOCALOID Heardle - ${difficulty === "all" ? "Unlimited" : `${getDifficultyLabel(difficulty)} Practice`}`;
    loadPuzzle();
    renderStats();
  });
});

if (archivePrevMonth) {
  archivePrevMonth.addEventListener("click", () => shiftArchiveMonth(-1));
}

if (archiveNextMonth) {
  archiveNextMonth.addEventListener("click", () => shiftArchiveMonth(1));
}

if (archiveRandomButton) {
  archiveRandomButton.addEventListener("click", () => {
    const song = getRandomArchiveSong();
    if (!song) {
      showToast(t("archiveRandomEmpty"));
      return;
    }
    loadArchiveDate(song.date);
    document.title = `VOCALOID Heardle - ${formatArchiveDate(state.archiveDate)}`;
    closeModal();
  });
}

if (archiveGrid) {
  archiveGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-archive-date]");
    if (!button || button.disabled) return;
    loadArchiveDate(button.dataset.archiveDate);
    document.title = `VOCALOID Heardle - ${formatArchiveDate(state.archiveDate)}`;
    closeModal();
  });
}

window.addEventListener("popstate", () => {
  const archiveDate = getArchiveDateFromUrl();
  if (archiveDate && loadArchiveDate(archiveDate, true)) return;
  state.mode = "daily";
  state.archiveDate = null;
  loadPuzzle();
  renderStats();
});

shareButton.addEventListener("click", async () => {
  const shareText = buildShareText();

  if (!shareText) {
    return;
  }

  try {
    await copyText(shareText);
    showToast(t("toastCopied"));
    shareOutput.hidden = true;
    unlockAchievement("secret_share_result");
  } catch {
    shareOutput.value = shareText;
    shareOutput.hidden = false;
    shareOutput.focus();
    shareOutput.select();
    shareButton.textContent = t("shareSelectResult");
  }
});

if (statsCopyProfileButton) {
  statsCopyProfileButton.addEventListener("click", async () => {
    const profileText = buildProfileText();
    try {
      await copyText(profileText);
      showToast(t("profileCopied"));
    } catch {
      showToast(profileText);
    }
  });
}

if (suggestSongForm) {
  suggestSongForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const body = [
      "Song suggestion for VOCALOID Heardle",
      "",
      `Song title: ${document.querySelector("#suggest-title")?.value || ""}`,
      `Producer: ${document.querySelector("#suggest-producer")?.value || ""}`,
      `Vocal synth: ${document.querySelector("#suggest-vocal")?.value || ""}`,
      `VocaDB link: ${document.querySelector("#suggest-vocadb")?.value || ""}`,
      `YouTube/NicoNico link: ${document.querySelector("#suggest-source")?.value || ""}`,
      "",
      "Why should this be included?",
      document.querySelector("#suggest-reason")?.value || "",
      "",
      "Note: suggestions are not guaranteed.",
    ].join("\n");
    window.location.href = makeMailto("VOCALOID Heardle song suggestion", body);
  });
}

suggestCheckInput?.addEventListener("input", renderSuggestCheckResults);

if (reportIssueForm) {
  reportIssueForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const reason = document.querySelector("#report-reason")?.value || "Issue report";
    const details = document.querySelector("#report-details")?.value || "";
    const body = [
      "VOCALOID Heardle issue report",
      "",
      `Reason: ${reason}`,
      "",
      "Puzzle context:",
      ...getPuzzleContextLines(),
      "",
      "Details:",
      details,
    ].join("\n");
    window.location.href = makeMailto(`VOCALOID Heardle issue: ${reason}`, body);
  });
}

statsDailyButton.addEventListener("click", () => {
  state.statsMode = "daily";
  renderStats();
});

statsUnlimitedButton.addEventListener("click", () => {
  state.statsMode = "unlimited";
  state.statsDifficulty = state.statsDifficulty || "all";
  renderStats();
});

if (statsFilteredButton) {
  statsFilteredButton.addEventListener("click", () => {
    state.statsMode = "filtered";
    renderStats();
    renderUnlimitedHistory();
  });
}

statsDifficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.statsMode = "unlimited";
    state.statsDifficulty = button.dataset.statsDifficulty || "all";
    renderStats();
    renderUnlimitedHistory();
  });
});

document.querySelectorAll(".release-tab").forEach((button) => {
  button.addEventListener("click", () => {
    currentReleaseVersion = button.dataset.releaseVersion || "v1.5";
    renderReleaseNotes();
  });
});

document.querySelectorAll("[data-achievement-category]").forEach((button) => {
  button.addEventListener("click", () => {
    state.achievementCategory = button.dataset.achievementCategory || "all";
    renderAchievements();
  });
});

achievementSearchInput?.addEventListener("input", () => {
  state.achievementSearch = achievementSearchInput.value;
  renderAchievements();
});

bookmarkButton?.addEventListener("click", () => {
  toggleBookmark();
});

bookmarksSearchInput?.addEventListener("input", () => {
  state.bookmarksSearch = bookmarksSearchInput.value;
  renderBookmarks();
});

bookmarksList?.addEventListener("click", (event) => {
  const playButtonEl = event.target.closest("[data-bookmark-play]");
  const removeButtonEl = event.target.closest("[data-bookmark-remove]");
  if (playButtonEl) {
    toggleBookmarkAudio(playButtonEl.dataset.bookmarkPlay);
  }
  if (removeButtonEl) {
    const id = String(removeButtonEl.dataset.bookmarkRemove || "");
    if (bookmarkAudioId === id) stopBookmarkAudio();
    saveBookmarks(loadBookmarks().filter((bookmarkId) => bookmarkId !== id));
    renderBookmarkButton();
    renderBookmarks();
  }
});

bookmarksList?.addEventListener("load", (event) => {
  if (event.target.matches(".bookmark-thumb img") && isLowQualityBookmarkThumb(event.target)) {
    showNextBookmarkThumb(event.target);
  }
}, true);

bookmarksList?.addEventListener("error", (event) => {
  if (event.target.matches(".bookmark-thumb img")) {
    showNextBookmarkThumb(event.target);
  }
}, true);

modalButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (button.tagName === "A") {
      event.preventDefault();
    }

    if (button.dataset.modalTarget === "stats") {
      renderStats();
    }
    if (button.dataset.modalTarget === "achievements") {
      renderAchievements();
      unlockAchievement("secret_open_achievements");
    }
    if (button.dataset.modalTarget === "unlimited-history") {
      renderUnlimitedHistory();
    }
    if (button.dataset.modalTarget === "bookmarks") {
      renderBookmarks();
    }
    if (button.dataset.modalTarget === "unlimited-filters") {
      filterDraft = normalizeUnlimitedFilters(state.unlimitedFilters);
      renderUnlimitedFilterModal();
    }

    openModal(button.dataset.modalTarget);
  });
});

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

modalBackdrop.addEventListener("click", closeModal);

function isKeyboardTextTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  const tag = target.tagName;
  return target.isContentEditable
    || tag === "TEXTAREA"
    || tag === "SELECT"
    || tag === "INPUT";
}

function isKeyboardInteractiveTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  return !!target.closest("button, a, [role='button']");
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    hideSuggestions();
    return;
  }

  if (event.defaultPrevented || activeModal) {
    return;
  }

  if ((event.ctrlKey || event.metaKey) && (event.key === " " || event.code === "Space")) {
    event.preventDefault();
    toggleClipPlayback();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    skipCurrentAttempt();
    return;
  }

  if (event.key === "Enter" && state.isComplete && !nextButton.hidden && !isKeyboardInteractiveTarget(event.target)) {
    event.preventDefault();
    goToNextSong();
    return;
  }

  if (event.key === "Enter" && !state.isComplete && state.puzzle && !isKeyboardTextTarget(event.target) && !isKeyboardInteractiveTarget(event.target)) {
    event.preventDefault();
    guessInput?.focus();
    return;
  }

  if ((event.key === " " || event.code === "Space") && !isKeyboardTextTarget(event.target) && !isKeyboardInteractiveTarget(event.target)) {
    event.preventDefault();
    toggleClipPlayback();
  }
});

document.addEventListener("click", (event) => {
  if (!guessForm.contains(event.target)) {
    hideSuggestions();
  }
});

// ── LANGUAGE TOGGLE ──
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const newLang = btn.dataset.lang;
    const prevLang = localStorage.getItem("vh-lang") || "en";
    localStorage.setItem("vh-lang", newLang);
    if (newLang === "jp") {
      localStorage.setItem("vh-title-mode", "jp");
    } else if (newLang === "ko") {
      localStorage.setItem("vh-title-mode", "kr");
    } else if (newLang === "es") {
      localStorage.setItem("vh-title-mode", "en");
    } else {
      localStorage.setItem("vh-title-mode", "en");
    }
    document.querySelectorAll("[data-title-mode]").forEach(b =>
      b.classList.toggle("is-active", b.dataset.titleMode === localStorage.getItem("vh-title-mode"))
    );
    if (newLang !== prevLang) unlockAchievement("secret_switch_language");
    applyLanguage();
    refreshTitleSurfaces();
  });
});

// ── TITLE MODE ──
document.querySelectorAll("[data-title-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.setItem("vh-title-mode", btn.dataset.titleMode);
    document.querySelectorAll("[data-title-mode]").forEach(b =>
      b.classList.toggle("is-active", b.dataset.titleMode === btn.dataset.titleMode)
    );
    refreshTitleSurfaces();
  });
});

function initTitleMode() {
  let mode = localStorage.getItem("vh-title-mode") || "en";
  if (mode === "romaji") {
    mode = "en";
    localStorage.setItem("vh-title-mode", mode);
  }
  document.querySelectorAll("[data-title-mode]").forEach(btn =>
    btn.classList.toggle("is-active", btn.dataset.titleMode === mode)
  );
}

const initialArchiveDate = getArchiveDateFromUrl();
const initialActiveUnlimitedRound = loadMostRecentActiveUnlimitedRound();
const initialSession = getRememberedSessionMode();
state.unlimitedFilters = loadUnlimitedFilters();
if (initialArchiveDate && loadArchiveDate(initialArchiveDate, true)) {
  // Archive URLs are explicit and should win over any saved unlimited round.
} else if (initialArchiveDate) {
  clearArchiveUrl(true);
  state.mode = "daily";
  state.statsMode = "daily";
  state.archiveDate = null;
  rememberCurrentMode();
  loadPuzzle();
} else if (initialSession.mode === "unlimited" && initialActiveUnlimitedRound?.songId) {
  state.mode = "unlimited";
  state.statsMode = "unlimited";
  state.unlimitedDifficulty = initialSession.difficulty || initialActiveUnlimitedRound.difficulty || "all";
  if (initialActiveUnlimitedRound.difficulty) {
    state.unlimitedDifficulty = initialActiveUnlimitedRound.difficulty;
  }
  state.statsDifficulty = state.unlimitedDifficulty;
  loadPuzzle();
} else {
  state.mode = "daily";
  state.statsMode = "daily";
  state.archiveDate = null;
  rememberCurrentMode();
  loadPuzzle();
}
renderStats();
checkNewBadge();
applyLanguage();
initTitleMode();
initMylist();
fetchDifficultyPools();
loadVisitorCounter();
