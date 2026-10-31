(function (root, factory) {
  var words = factory();
  if (typeof module === "object" && module.exports) module.exports = words;
  root.MIKUDLE_WORDS = words;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Base gameplay dictionary: four-letter entries found in both the Google
  // 10,000 US English frequency list (no-swears edition) and the public-domain
  // Webster system dictionary, minus proper names and web artifacts.
  var frequencyWords = [
  "able", "acid", "acne", "acre", "aged", "also", "alto", "anti", "aqua", "arch", "area", "arms", "army", "atom",
  "auto", "away", "axis", "babe", "baby", "back", "bald", "ball", "band", "bang", "bank", "bare", "barn", "base",
  "bass", "bath", "beam", "bean", "bear", "beat", "beef", "been", "beer", "bell", "belt", "bend", "bent", "best",
  "beta", "bias", "bike", "bill", "bind", "bios", "bird", "bite", "blah", "blow", "blue", "boat", "body", "bold",
  "bolt", "bomb", "bond", "bone", "book", "boom", "boot", "born", "boss", "both", "bowl", "buck", "bulk",
  "bull", "burn", "bush", "busy", "buzz", "cage", "cake", "call", "calm", "came", "camp", "cant", "cape", "card",
  "care", "cart", "case", "cash", "cast", "cave", "cell", "cent", "char", "chat", "chef", "chip", "cite", "city",
  "clan", "clay", "clip", "club", "coal", "coat", "code", "coin", "cold", "cole", "come", "cook", "cool", "cope",
  "copy", "cord", "core", "cork", "corn", "cost", "cove", "crew", "crop", "cube", "cult", "cure", "cute",
  "dale", "dame", "dare", "dark", "dash", "data", "date", "dawn", "days", "dead", "deaf", "deal", "dean", "dear",
  "debt", "deck", "deep", "deer", "dell", "deny", "desk", "dial", "dice", "diet", "dirt", "disc", "dish", "disk",
  "dive", "dock", "does", "dogs", "doll", "dome", "done", "doom", "door", "dose", "down", "drag", "draw",
  "drew", "drop", "drug", "drum", "dual", "duck", "dude", "duke", "dumb", "dump", "dust", "duty", "each", "earl",
  "earn", "ease", "east", "easy", "echo", "edge", "edit", "else", "epic", "even", "ever", "evil", "exam", "exit",
  "eyed", "face", "fact", "fail", "fair", "fake", "fall", "fame", "fare", "farm", "fast", "fate", "fear", "feat",
  "feed", "feel", "fell", "felt", "file", "fill", "film", "find", "fine", "fire", "firm", "fish", "fist", "five",
  "flag", "flat", "flex", "flip", "flow", "flux", "foam", "fold", "folk", "font", "food", "fool", "foot", "ford",
  "fork", "form", "fort", "foul", "four", "free", "frog", "from", "fuel", "full", "fund", "funk", "gage", "gain",
  "gale", "game", "gang", "gate", "gave", "gear", "geek", "gene", "gift", "girl", "give", "glad", "glen", "glow",
  "goal", "goat", "goes", "gold", "golf", "gone", "good", "gore", "grab", "grad", "gray", "grew", "grey", "grid",
  "grip", "grow", "gulf", "guru", "hack", "hair", "half", "hall", "halo", "hand", "hard", "harm", "hart", "hash",
  "hate", "have", "hawk", "head", "hear", "heat", "heel", "help", "herb", "here", "hero", "hide", "high", "hill",
  "hint", "hire", "hold", "hole", "holy", "home", "hood", "hook", "hope", "horn", "hose", "host", "hour",
  "huge", "hull", "hung", "hunt", "hurt", "icon", "idea", "idle", "idol", "inch", "into", "iron", "isle", "item",
  "jack", "jade", "jail", "jazz", "jean", "jeep", "join", "joke", "jump", "june", "junk", "jury", "just", "keen",
  "keep", "keno", "kent", "kept", "kick", "kids", "kill", "kind", "king", "kirk", "kiss", "knee", "knew", "knit",
  "know", "lace", "lack", "lady", "laid", "lake", "lamb", "lame", "lamp", "land", "lane", "last", "late", "lawn",
  "lazy", "lead", "leaf", "lean", "left", "lens", "less", "levy", "life", "lift", "like", "lime", "line", "link",
  "lion", "list", "lite", "live", "load", "loan", "lock", "logo", "lone", "long", "look", "loop", "lord", "lose",
  "loss", "lost", "lots", "loud", "love", "luck", "lung", "mack", "made", "mail", "main", "make", "male", "mall",
  "many", "mark", "mart", "mask", "mass", "mate", "math", "meal", "mean", "meat", "meet", "memo", "menu", "mere",
  "mesa", "mesh", "mess", "meta", "mice", "mike", "miku", "mild", "mile", "milk", "mill", "mime", "mind", "mine",
  "mink", "mint", "mire", "miss", "mite", "mode", "mold", "mono", "mood", "moon", "more", "moss", "most", "move",
  "much", "must", "mute", "myth", "nail", "name", "navy", "near", "neck", "need", "neon", "nest", "news", "next",
  "nice", "nick", "nine", "node", "none", "noon", "norm", "nose", "note", "nova", "nuke", "null", "odds", "once",
  "only", "onto", "open", "oral", "ours", "oval", "oven", "over", "pace", "pack", "page", "pain", "pair", "pale",
  "palm", "para", "park", "part", "pass", "past", "path", "peak", "peer", "pest", "pick", "pike", "pill", "pine",
  "ping", "pink", "pipe", "plan", "play", "plot", "plug", "plus", "poem", "poet", "pole", "poll", "polo", "poly",
  "pond", "pool", "poor", "pope", "pork", "port", "pose", "post", "pour", "pray", "prep", "pull", "pump", "punk",
  "pure", "push", "quad", "quit", "quiz", "race", "rack", "rage", "raid", "rail", "rain", "rand", "rank", "rare",
  "rate", "read", "real", "rear", "reed", "reef", "reel", "rely", "rent", "rest", "rice", "rich", "ride", "ring",
  "ripe", "rise", "risk", "road", "rock", "role", "roll", "roof", "room", "root", "rope", "rose", "ruby", "rule",
  "rush", "safe", "sage", "said", "sail", "sake", "sale", "salt", "same", "sand", "sans", "save", "scan", "seal",
  "seat", "seed", "seek", "seem", "seen", "self", "sell", "semi", "send", "sent", "sept", "shaw", "shed", "ship",
  "shoe", "shop", "shot", "show", "shut", "sick", "side", "sign", "silk", "sing", "sink", "site", "size", "skin",
  "skip", "slim", "slip", "slot", "slow", "snap", "snow", "soap", "sofa", "soft", "soil", "sold", "sole", "solo",
  "soma", "some", "song", "sons", "soon", "sort", "soul", "soup", "spam", "span", "spec", "spin", "spot", "star",
  "stay", "stem", "step", "stop", "stud", "such", "suit", "sure", "surf", "swap", "swim", "sync", "tail", "take",
  "tale", "talk", "tall", "tank", "tape", "task", "taxi", "team", "tear", "tech", "teen", "tell", "temp", "tend",
  "tent", "term", "test", "text", "than", "that", "thee", "them", "then", "they", "thin", "this", "thou", "thus",
  "tide", "tied", "tier", "tile", "till", "time", "tiny", "tire", "told", "toll", "tone", "took", "tool", "tops",
  "tour", "town", "trap", "tray", "tree", "trek", "trim", "trio", "trip", "true", "tube", "tune", "turn", "twin",
  "type", "ugly", "undo", "unit", "unto", "upon", "urge", "used", "user", "vary", "vast", "very", "vice", "view",
  "visa", "void", "volt", "vote", "wage", "wait", "wake", "walk", "wall", "want", "ward", "ware", "warm", "wash",
  "watt", "wave", "ways", "weak", "wear", "weed", "week", "well", "went", "were", "west", "what", "when", "whom",
  "wide", "wife", "wild", "will", "wind", "wine", "wing", "wire", "wise", "wish", "with", "wolf", "wood", "wool",
  "word", "work", "worm", "worn", "wrap", "yard", "yarn", "yeah", "year", "yoga", "your", "zero", "zinc", "zone",
  "zoom"
  ];

  // Reviewed common-word supplement. These ordinary omissions were checked
  // against a second frequency corpus and Webster, then manually screened for
  // names, artifacts, and obscure filler. Every addition joins the playable
  // component that leads to MIKU; RINK is intentionally included here.
  var reviewedCommonWords = [
    "aunt", "bail", "bait", "bake", "bark", "bash", "bats", "bees", "bled", "blur", "boar", "boil", "bore", "bout", "brag", "brat", "brew", "bulb", "bump", "bunk",
    "bury", "bust", "calf", "cane", "chap", "chew", "chin", "chop", "chow", "clam", "clap", "claw", "clue", "colt", "coma", "comb", "cone", "cozy", "crab", "crib",
    "crow", "curb", "daft", "damp", "darn", "dart", "deed", "defy", "dent", "dime", "dine", "ding", "dorm", "dove", "drip", "duct", "duel", "dull", "eats", "fade",
    "fang", "flaw", "flea", "fled", "flee", "flew", "fond", "fury", "gaze", "glee", "glue", "gown", "grim", "hail", "hare", "haul", "heal", "heap", "heed", "heir",
    "herd", "hers", "hike", "honk", "hump", "hunk", "hush", "kilo", "kite", "knot", "lair", "leak", "leap", "lend", "lent", "lice", "lick", "lied", "limb", "limo",
    "limp", "loaf", "loft", "loot", "lump", "lure", "maid", "mare", "maze", "melt", "mend", "mist", "mock", "mole", "mule", "mutt", "neat", "nude", "numb", "oath",
    "pact", "pawn", "peck", "peek", "peel", "peep", "pier", "pile", "pint", "pity", "plea", "poke", "pony", "poop", "posh", "prey", "prop", "puke", "raft", "ramp",
    "rang", "rash", "rink", "riot", "roam", "roar", "robe", "rode", "rook", "rude", "ruin", "sack", "sane", "sang", "sank", "scam", "scar", "shin", "shoo", "slam",
    "slap", "slay", "slit", "soak", "sock", "soda", "sore", "sour", "spit", "stab", "stew", "stir", "sung", "sunk", "swan", "swat", "sway", "tame", "tang", "tart",
    "teal", "thud", "thug", "tick", "tidy", "toad", "tomb", "tore", "torn", "toss", "tuck", "tuna", "turf", "vain", "vase", "veil", "vein", "vent", "vest", "vile",
    "wand", "warn", "warp", "weep", "whip", "wimp", "wink", "wipe", "woke", "womb", "woof", "wore", "yell"
  ];

  // Broader familiar-word tier. This catches useful word-game vocabulary that
  // frequency lists underrate (MOPE, LOPE, NOPE, and similar words) without
  // opening gameplay to the full unfiltered system dictionary.
  var expandedCommonWords = [
    "aeon", "ahem", "aide", "airy", "akin", "alum", "amid", "anew", "aria", "arid", "avid", "awry", "axon", "bale", "balk", "balm", "bane", "barb", "bard", "bask",
    "bawl", "bead", "beak", "beet", "berg", "berm", "bide", "bile", "blab", "blip", "blob", "bloc", "blot", "bode", "bonk", "bony", "boon", "boxy", "bran",
    "bray", "brig", "brim", "brow", "buff", "bunt", "buoy", "burl", "burp", "burr", "carp", "cask", "cede", "chai", "chia", "chic", "chit", "chub", "chug", "chum",
    "clad", "clef", "clod", "clog", "clot", "coax", "coda", "coil", "cola", "coop", "cosy", "cowl", "crag", "cram", "cull", "curd", "curl", "curt", "cyan", "cyst",
    "dank", "daze", "deem", "deft", "dewy", "dibs", "digs", "dike", "dill", "dire", "diva", "doer", "dole", "dolt", "dope", "dory", "dour", "doze", "drab", "dubs",
    "duet", "duly", "dune", "dunk", "dupe", "dusk", "faun", "fawn", "fend", "fern", "feud", "flak", "flan", "flap", "flax", "flay", "flit", "flog", "flop", "flue",
    "foal", "foil", "fore", "fowl", "foxy", "fray", "fret", "fume", "gaff", "gait", "gall", "gape", "garb", "gash", "gawk", "germ", "ghee", "gild", "gilt", "gist",
    "glam", "glum", "glut", "gnat", "gnaw", "goad", "goer", "goof", "goon", "gory", "gosh", "gout", "gram", "grin", "grit", "grog", "grub", "guff", "gull", "gulp",
    "gunk", "gush", "gust", "hale", "hark", "harp", "haze", "hazy", "heft", "helm", "hemp", "hewn", "hick", "hilt", "hind", "hiss", "hive", "hoax", "hock",
    "hone", "hoof", "hoop", "hoot", "howl", "hued", "huff", "hula", "husk", "jamb", "jell", "jest", "jinx", "jive", "jolt", "juke", "kale", "keel", "kelp", "kiln",
    "kith", "knob", "lacy", "lain", "lard", "lark", "lash", "lass", "leek", "leer", "lest", "lien", "lieu", "lint", "lisp", "loam", "lobe", "loch", "lode", "loin",
    "loll", "loom", "loon", "lope", "lore", "luge", "lull", "lurk", "lush", "lute", "lyre", "mace", "mage", "maim", "malt", "mana", "mane", "mash", "mast", "maul",
    "mead", "meek", "meld", "mete", "mica", "minx", "mitt", "moan", "moat", "molt", "moor", "moot", "mope", "morn", "mote", "moth", "muck", "muff", "mull", "muse",
    "mush", "musk", "nape", "nave", "newt", "nook", "nope", "nori", "nosy", "noun", "oily", "ooze", "ouch", "oust", "pail", "pall", "pane", "pang", "pant", "pare",
    "pate", "pave", "peal", "pear", "peat", "pelt", "peon", "perk", "perm", "pert", "peso", "phew", "pied", "pita", "pith", "pled", "plod", "plop", "plow", "ploy",
    "poof", "pore", "pout", "pram", "prat", "prim", "prod", "prow", "pulp", "puma", "punt", "puny", "purr", "putt", "pyre", "quip", "racy", "rake", "rant", "rapt",
    "rasp", "rave", "raze", "ream", "reap", "reek", "rein", "rend", "rife", "riff", "rift", "rile", "rind", "roan", "romp", "rosy", "rote", "rout", "rove", "ruff",
    "rump", "rune", "rung", "runt", "ruse", "rust", "saga", "sash", "sass", "scab", "scat", "seam", "sear", "seep", "seer", "serf", "sewn", "sham", "shim", "shod",
    "shun", "sift", "sill", "silo", "silt", "sine", "skew", "skid", "skim", "skit", "slab", "slag", "slaw", "sled", "slew", "slid", "slob", "slog", "slop", "slum",
    "smog", "smug", "snag", "snip", "snob", "snot", "snub", "snug", "soar", "soot", "soya", "spar", "spat", "spay", "sped", "spew", "spry", "spud", "spun", "spur",
    "stag", "stow", "stub", "stun", "suet", "sulk", "sumo", "sump", "swab", "swag", "swam", "swig", "swum", "tack", "tact", "talc", "tamp", "tarn", "taro", "tarp",
    "taut", "teak", "teat", "tern", "thaw", "tilt", "tine", "tint", "tock", "toed", "toil", "tome", "toot", "tote", "tout", "tram", "trig", "trod", "trot", "tuba",
    "tusk", "twee", "twig", "twit", "typo", "urea", "vamp", "vane", "veal", "veer", "verb", "vial", "vine", "vino", "vise", "vole", "waft", "waif", "wail", "wane",
    "wart", "wary", "wasp", "wavy", "waxy", "wean", "ween", "weld", "welt", "wept", "wham", "whet", "whey", "whim", "whiz", "wick", "wile", "wilt", "wily", "wisp",
    "wove", "wren", "yank", "yawn", "yelp", "yoke", "yolk", "yore", "yuck", "yule", "yurt", "zany", "zeal", "zest", "zing"
  ];

  // Scrabble-list audit tier. WordFind is used only as a candidate source:
  // these entries were manually kept from its much broader 3,997-word list
  // and verified to join the MIKU component. Scrabble-only filler stays out.
  var wordFindReviewedWords = [
    "atop", "boor", "bred", "busk", "coed", "conk", "coup", "cuff", "cuss", "dang", "dote", "drat", "dung", "eave", "fest", "fiat", "floe", "flub", "fuse", "fuss", "gasp",
    "gibe", "gong", "halt", "hasp", "jeer", "jiff", "kilt", "kink", "lank", "laze", "lout", "lube", "lust", "miff", "monk", "mown", "nosh", "pock", "poky", "pong", "posy",
    "puck", "puff", "pupa", "quid", "rite", "roil", "scum", "sect", "sext", "sloe", "teem", "toon", "tyke", "tyre", "vale", "vend", "whew", "whir", "whoa", "wiry", "yawl"
  ];

  var allReviewedWords = reviewedCommonWords.concat(expandedCommonWords, wordFindReviewedWords);
  var words = frequencyWords.concat(allReviewedWords).sort();
  Object.defineProperty(words, "reviewedCommonWords", {
    value: allReviewedWords.slice(),
    enumerable: false
  });
  return words;
});
