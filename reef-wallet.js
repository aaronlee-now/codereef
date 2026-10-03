// Reef wallet — four coin types and fish for each kid (saved in this browser).
// Sand is common. Coral is uncommon. Pearl is rare. Treasure is very rare.

var MAX_FISH = 45;
var MAX_FISH_ON_SCREEN = 24;

// Every trail stop. Rare coins are extra luck, not a sure thing.
var TRAIL_SAND_COINS = 1;
var TRAIL_CORAL_CHANCE = 0.25;
var TRAIL_PEARL_CHANCE = 0.08;
var TRAIL_TREASURE_CHANCE = 0.02;

var COIN_ORDER = ["sand", "coral", "pearl", "treasure"];
var COIN_NAMES = {
  sand: "Sand",
  coral: "Coral",
  pearl: "Pearl",
  treasure: "Treasure",
};

// rarity: higher number is rarer and faster in the aquarium race.
// Cheaper fish are slower. A little Sand buys a common fish.
var FISH_FOR_SALE = [
  {
    id: "neon",
    name: "Neon Tetra",
    cost: { sand: 3 },
    image: "assets/fish/neon.svg?v=shopfair",
    kind: "fish",
    rarity: 1,
  },
  {
    id: "guppy",
    name: "Guppy",
    cost: { sand: 4 },
    image: "assets/fish/guppy.png?v=morefish",
    kind: "fish",
    rarity: 2,
  },
  {
    id: "chromis",
    name: "Blue Chromis",
    cost: { sand: 4 },
    image: "assets/fish/chromis.svg?v=more1",
    kind: "fish",
    rarity: 3,
  },
  {
    id: "damsel",
    name: "Damselfish",
    cost: { sand: 5 },
    image: "assets/fish/damselfish.png?v=morefish",
    kind: "fish",
    rarity: 4,
  },
  {
    id: "platy",
    name: "Platy",
    cost: { sand: 5 },
    image: "assets/fish/platy.svg?v=shopfair",
    kind: "fish",
    rarity: 5,
  },
  {
    id: "humbug",
    name: "Humbug Dascyllus",
    cost: { sand: 6 },
    image: "assets/fish/humbug.svg?v=more1",
    kind: "fish",
    rarity: 6,
  },
  {
    id: "goldie",
    name: "Goldfish",
    cost: { sand: 6 },
    image: "assets/fish/goldfish.png?v=morefish",
    kind: "fish",
    rarity: 7,
  },
  {
    id: "molly",
    name: "Molly",
    cost: { sand: 6 },
    image: "assets/fish/molly.svg?v=shopfair",
    kind: "fish",
    rarity: 8,
  },
  {
    id: "cory",
    name: "Corydoras",
    cost: { sand: 6 },
    image: "assets/fish/cory.svg?v=shopfair",
    kind: "fish",
    rarity: 9,
  },
  {
    id: "cardinal",
    name: "Cardinalfish",
    cost: { sand: 6, coral: 1 },
    image: "assets/fish/cardinalfish.png?v=morefish",
    kind: "fish",
    rarity: 10,
  },
  {
    id: "crab",
    name: "Hermit Crab",
    cost: { sand: 5 },
    image: "assets/fish/crab.svg?v=shopfair",
    kind: "fish",
    rarity: 11,
  },
  {
    id: "sunny",
    name: "Clownfish",
    cost: { sand: 8 },
    image: "assets/fish/clownfish.png?v=morefish",
    kind: "fish",
    rarity: 12,
  },
  {
    id: "betta",
    name: "Betta",
    cost: { sand: 8 },
    image: "assets/fish/betta.png?v=morefish",
    kind: "fish",
    rarity: 13,
  },
  {
    id: "gramma",
    name: "Royal Gramma",
    cost: { sand: 6, coral: 1 },
    image: "assets/fish/gramma.svg?v=more1",
    kind: "fish",
    rarity: 14,
  },
  {
    id: "blenny",
    name: "Blenny",
    cost: { sand: 6, coral: 1 },
    image: "assets/fish/blenny.svg?v=shopfair",
    kind: "fish",
    rarity: 15,
  },
  {
    id: "cleaner",
    name: "Cleaner Wrasse",
    cost: { sand: 6, coral: 1 },
    image: "assets/fish/cleaner-wrasse.svg?v=more1",
    kind: "fish",
    rarity: 16,
  },
  {
    id: "jelly",
    name: "Moon Jelly",
    cost: { sand: 4, coral: 1 },
    image: "assets/fish/jelly.svg?v=shopfair",
    kind: "fish",
    rarity: 17,
  },
  {
    id: "firefish",
    name: "Firefish",
    cost: { sand: 7, coral: 1 },
    image: "assets/fish/firefish.svg?v=more1",
    kind: "fish",
    rarity: 18,
  },
  {
    id: "goby",
    name: "Watchman Goby",
    cost: { sand: 8, coral: 1 },
    image: "assets/fish/goby.svg?v=shopfair",
    kind: "fish",
    rarity: 19,
  },
  {
    id: "bubbles",
    name: "Yellow Tang",
    cost: { sand: 8, coral: 1 },
    image: "assets/fish/yellow-tang.png?v=morefish",
    kind: "fish",
    rarity: 20,
  },
  {
    id: "banggai",
    name: "Banggai Cardinalfish",
    cost: { sand: 8, coral: 1 },
    image: "assets/fish/banggai.svg?v=more1",
    kind: "fish",
    rarity: 21,
  },
  {
    id: "bluey",
    name: "Blue Tang",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/blue-tang.png?v=morefish",
    kind: "fish",
    rarity: 22,
  },
  {
    id: "flutter",
    name: "Butterflyfish",
    cost: { sand: 6, coral: 2 },
    image: "assets/fish/butterflyfish.png?v=morefish",
    kind: "fish",
    rarity: 23,
  },
  {
    id: "sixline",
    name: "Six-line Wrasse",
    cost: { sand: 6, coral: 2 },
    image: "assets/fish/sixline.svg?v=shopfair",
    kind: "fish",
    rarity: 24,
  },
  {
    id: "snapper",
    name: "Snapper",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/snapper.png?v=morefish",
    kind: "fish",
    rarity: 25,
  },
  {
    id: "anthias",
    name: "Lyretail Anthias",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/anthias.svg?v=more1",
    kind: "fish",
    rarity: 26,
  },
  {
    id: "banner",
    name: "Bannerfish",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/bannerfish.png?v=morefish",
    kind: "fish",
    rarity: 27,
  },
  {
    id: "glow",
    name: "Fairy Wrasse",
    cost: { sand: 6, coral: 2 },
    image: "assets/fish/fairy-wrasse.png?v=morefish",
    kind: "fish",
    rarity: 28,
  },
  {
    id: "hawk",
    name: "Longnose Hawkfish",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/hawkfish.svg?v=more1",
    kind: "fish",
    rarity: 29,
  },
  {
    id: "grouper",
    name: "Grouper",
    cost: { sand: 10, coral: 2 },
    image: "assets/fish/grouper.png?v=morefish",
    kind: "fish",
    rarity: 30,
  },
  {
    id: "foxface",
    name: "Foxface",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/foxface.svg?v=more1",
    kind: "fish",
    rarity: 31,
  },
  {
    id: "koi",
    name: "Koi",
    cost: { sand: 10, coral: 3 },
    image: "assets/fish/koi.png?v=morefish",
    kind: "fish",
    rarity: 32,
  },
  {
    id: "discus",
    name: "Discus",
    cost: { sand: 8, coral: 3 },
    image: "assets/fish/discus.png?v=morefish",
    kind: "fish",
    rarity: 33,
  },
  {
    id: "flame",
    name: "Flame Angelfish",
    cost: { sand: 4, coral: 2, pearl: 1 },
    image: "assets/fish/flame-angel.svg?v=more1",
    kind: "fish",
    rarity: 34,
  },
  {
    id: "angel",
    name: "Queen Angelfish",
    cost: { sand: 6, coral: 2, pearl: 1 },
    image: "assets/fish/angelfish.png?v=morefish",
    kind: "fish",
    rarity: 35,
  },
  {
    id: "beauty",
    name: "Coral Beauty",
    cost: { sand: 6, coral: 2, pearl: 1 },
    image: "assets/fish/beauty.svg?v=shopfair",
    kind: "fish",
    rarity: 36,
  },
  {
    id: "powder",
    name: "Powder Blue Tang",
    cost: { sand: 6, coral: 3, pearl: 1 },
    image: "assets/fish/powder-blue-tang.svg?v=more1",
    kind: "fish",
    rarity: 37,
  },
  {
    id: "sailfin",
    name: "Sailfin Tang",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/sailfin-tang.svg?v=more1",
    kind: "fish",
    rarity: 38,
  },
  {
    id: "copperband",
    name: "Copperband Butterflyfish",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/copperband.svg?v=more1",
    kind: "fish",
    rarity: 39,
  },
  {
    id: "parrot",
    name: "Parrotfish",
    cost: { sand: 8, coral: 3, pearl: 1 },
    image: "assets/fish/parrotfish.png?v=morefish",
    kind: "fish",
    rarity: 40,
  },
  {
    id: "idol",
    name: "Moorish Idol",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/moorish-idol.png?v=morefish",
    kind: "fish",
    rarity: 41,
  },
  {
    id: "puffer",
    name: "Pufferfish",
    cost: { sand: 4, coral: 3, pearl: 1 },
    image: "assets/fish/pufferfish.png?v=morefish",
    kind: "fish",
    rarity: 42,
  },
  {
    id: "seahorse",
    name: "Seahorse",
    cost: { sand: 4, coral: 2, pearl: 1 },
    image: "assets/fish/seahorse.png?v=morefish",
    kind: "fish",
    rarity: 43,
  },
  {
    id: "mandarin",
    name: "Mandarin Dragonet",
    cost: { coral: 2, pearl: 2 },
    image: "assets/fish/mandarin-dragonet.png?v=morefish",
    kind: "fish",
    rarity: 44,
  },
  {
    id: "stingray",
    name: "Stingray",
    cost: { coral: 4, pearl: 2 },
    image: "assets/fish/stingray.png?v=morefish",
    kind: "fish",
    rarity: 45,
  },
  {
    id: "moray",
    name: "Moray Eel",
    cost: { coral: 2, pearl: 1 },
    image: "assets/fish/moray-eel.png?v=morefish",
    kind: "fish",
    rarity: 46,
  },
  {
    id: "porcupine",
    name: "Porcupinefish",
    cost: { coral: 3, pearl: 1 },
    image: "assets/fish/porcupine.svg?v=more1",
    kind: "fish",
    rarity: 47,
  },
  {
    id: "trigger",
    name: "Clown Triggerfish",
    cost: { coral: 2, pearl: 2 },
    image: "assets/fish/clown-triggerfish.png?v=morefish",
    kind: "fish",
    rarity: 48,
  },
  {
    id: "picasso",
    name: "Picasso Triggerfish",
    cost: { coral: 2, pearl: 2 },
    image: "assets/fish/picasso-trigger.svg?v=more1",
    kind: "fish",
    rarity: 49,
  },
  {
    id: "french",
    name: "French Angelfish",
    cost: { pearl: 2 },
    image: "assets/fish/french-angel.svg?v=more1",
    kind: "fish",
    rarity: 50,
  },
  {
    id: "turtle",
    name: "Sea Turtle",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/sea-turtle.png?v=morefish",
    kind: "turtle",
    rarity: 51,
  },
  {
    id: "octopus",
    name: "Octopus",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/octopus.png?v=morefish",
    kind: "octopus",
    rarity: 52,
  },
  {
    id: "emperor",
    name: "Emperor Angelfish",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/emperor-angel.svg?v=more1",
    kind: "fish",
    rarity: 53,
  },
  {
    id: "unicorn",
    name: "Unicorn Tang",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/unicorn-tang.svg?v=more1",
    kind: "fish",
    rarity: 54,
  },
  {
    id: "cuda",
    name: "Barracuda",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/barracuda.png?v=morefish",
    kind: "fish",
    rarity: 55,
  },
  {
    id: "lion",
    name: "Lionfish",
    cost: { coral: 2, pearl: 2, treasure: 1 },
    image: "assets/fish/lionfish.png?v=morefish",
    kind: "fish",
    rarity: 56,
  },
  {
    id: "dragon",
    name: "Leafy Seadragon",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/dragon.svg?v=shopfair",
    kind: "fish",
    rarity: 57,
  },
  {
    id: "shark",
    name: "Reef Shark",
    cost: { pearl: 2, treasure: 2 },
    image: "assets/fish/shark.png?v=morefish",
    kind: "shark",
    rarity: 58,
  },
  {
    id: "sword",
    name: "Swordfish",
    cost: { pearl: 1, treasure: 2 },
    image: "assets/fish/swordfish.png?v=morefish",
    kind: "fish",
    rarity: 59,
  },
  {
    id: "manta",
    name: "Manta Ray",
    cost: { pearl: 3, treasure: 2 },
    image: "assets/fish/manta-ray.png?v=morefish",
    kind: "fish",
    rarity: 60,
  },
  {
    id: "whale",
    name: "Whale Shark",
    cost: { pearl: 4, treasure: 2 },
    image: "assets/fish/whale.svg?v=shopfair",
    kind: "fish",
    rarity: 61,
  },
];

var DECOR_FOR_SALE = [
  { id: "leaf-big", name: "Big Green Leaf", cost: { sand: 3 }, rest: true },
  { id: "leaf-little", name: "Little Leaf", cost: { sand: 2 }, rest: true },
  { id: "leaf-gold", name: "Golden Leaf", cost: { sand: 4 }, rest: true },
  { id: "lily", name: "Lily Pad", cost: { sand: 4 }, rest: true },
  { id: "lily-pink", name: "Pink Lily Pad", cost: { sand: 5 }, rest: true },
  { id: "lily-spot", name: "Spotted Lily Pad", cost: { sand: 3, coral: 1 }, rest: true },
  { id: "rock", name: "Round Rock", cost: { sand: 3 } },
  { id: "pebbles", name: "Pebble Pile", cost: { sand: 2 } },
  { id: "shell", name: "Spiral Shell", cost: { sand: 4 } },
  { id: "sand-dollar", name: "Sand Dollar", cost: { sand: 4 } },
  { id: "starfish", name: "Starfish", cost: { sand: 5 } },
  { id: "coral", name: "Soft Coral", cost: { sand: 6 } },
  { id: "seaweed", name: "Seaweed Patch", cost: { sand: 8 }, once: true },
  { id: "kelp", name: "Tall Kelp", cost: { sand: 5 } },
  { id: "cave", name: "Small Cave", cost: { sand: 4, coral: 1 } },
  { id: "chest", name: "Treasure Chest", cost: { coral: 2, pearl: 1 } },
  { id: "bubbles", name: "Bubble Cluster", cost: { sand: 2 } },
  { id: "castle", name: "Sand Castle", cost: { sand: 6 } },
  { id: "fan", name: "Fan Coral", cost: { sand: 3, coral: 1 } },
  { id: "anemone", name: "Friendly Anemone", cost: { sand: 5, coral: 1 } },
  { id: "driftwood", name: "Driftwood", cost: { sand: 4 } },
  { id: "anchor", name: "Little Anchor", cost: { sand: 4 } },
  { id: "buoy", name: "Striped Buoy", cost: { sand: 3 } },
  { id: "clam", name: "Open Clam", cost: { sand: 5 } },
  { id: "sponge", name: "Sea Sponge", cost: { sand: 3 } },
  { id: "bottle", name: "Message Bottle", cost: { sand: 2 } },
  { id: "conch", name: "Conch Shell", cost: { sand: 4, coral: 1 } },
  { id: "brain", name: "Brain Coral", cost: { sand: 6, coral: 1 } },
  { id: "oyster", name: "Pearl Oyster", cost: { coral: 2, pearl: 1 } },
];

var OUTFITS_FOR_SALE = [
  { id: "crown", name: "Tiny Crown", cost: { sand: 6, coral: 1 } },
  { id: "bow", name: "Pretty Bow", cost: { sand: 4 } },
  { id: "scarf", name: "Striped Scarf", cost: { sand: 5 } },
  { id: "star", name: "Shiny Star", cost: { sand: 3 } },
  { id: "sunglasses", name: "Sunglasses", cost: { sand: 4, coral: 1 } },
  { id: "party", name: "Party Hat", cost: { sand: 5 } },
  { id: "flower", name: "Flower", cost: { sand: 3 } },
  { id: "necklace", name: "Pearl Necklace", cost: { coral: 2, pearl: 1 } },
  { id: "captain", name: "Captain Hat", cost: { sand: 6, coral: 1 } },
  { id: "snorkel", name: "Snorkel", cost: { sand: 4 } },
  { id: "bowtie", name: "Bow Tie", cost: { sand: 4 } },
  { id: "halo", name: "Tiny Halo", cost: { sand: 2, coral: 1 } },
  { id: "backpack", name: "Tiny Backpack", cost: { sand: 5 } },
  { id: "heart", name: "Heart Pin", cost: { sand: 3 } },
  { id: "pirate", name: "Pirate Hat", cost: { sand: 6 } },
  { id: "vest", name: "Life Vest", cost: { sand: 4 } },
  { id: "medal", name: "Gold Medal", cost: { sand: 5, coral: 1 } },
  { id: "beanie", name: "Cozy Beanie", cost: { sand: 3 } },
  { id: "mask", name: "Eye Mask", cost: { sand: 4 } },
  { id: "wand", name: "Bubble Wand", cost: { sand: 5 } },
];

function walletKidKey() {
  var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  var kid = "guest";
  if (user && user.kidName) {
    kid =
      typeof normalizeName === "function"
        ? normalizeName(user.kidName)
        : String(user.kidName).trim().toLowerCase();
  }
  return "codereef_wallet_" + kid;
}

function emptyCoins() {
  return { sand: 0, coral: 0, pearl: 0, treasure: 0 };
}

function emptyWallet() {
  return { coins: emptyCoins(), fishCounts: {}, decor: [], outfits: [] };
}

function coinAmount(value) {
  var n = Number(value);
  if (!isFinite(n) || n < 0) {
    return 0;
  }
  return Math.floor(n);
}

function countsFromList(list) {
  var counts = {};
  var i;
  for (i = 0; i < list.length; i += 1) {
    var fishId = list[i];
    if (typeof fishId === "string" && fishId) {
      counts[fishId] = (counts[fishId] || 0) + 1;
    }
  }
  return counts;
}

function countsFromObject(obj) {
  var counts = {};
  var id;
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return counts;
  }
  for (id in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, id)) {
      var count = coinAmount(obj[id]);
      if (count > 0) {
        counts[id] = count;
      }
    }
  }
  return counts;
}

function hasAnyCount(counts) {
  var id;
  for (id in counts) {
    if (Object.prototype.hasOwnProperty.call(counts, id)) {
      return true;
    }
  }
  return false;
}

// Old saves used one coin number and a list of fish ids. Turn those into the new wallet.
function walletFromSaved(data) {
  var coins = emptyCoins();
  var migrated = false;

  if (typeof data.coins === "number") {
    coins.sand = coinAmount(data.coins);
    migrated = true;
  } else if (data.coins && typeof data.coins === "object") {
    coins.sand = coinAmount(data.coins.sand);
    coins.coral = coinAmount(data.coins.coral);
    coins.pearl = coinAmount(data.coins.pearl);
    coins.treasure = coinAmount(data.coins.treasure);
  } else {
    migrated = true;
  }

  var fishCounts = {};
  if (data.fishCounts && typeof data.fishCounts === "object" && !Array.isArray(data.fishCounts)) {
    fishCounts = countsFromObject(data.fishCounts);
  }
  if (!hasAnyCount(fishCounts) && Array.isArray(data.fish)) {
    fishCounts = countsFromList(data.fish);
    migrated = true;
  } else if (!data.fishCounts) {
    migrated = true;
  }

  if (Array.isArray(data.fish)) {
    migrated = true;
  }

  return {
    wallet: {
      coins: coins,
      fishCounts: fishCounts,
      decor: Array.isArray(data.decor) ? data.decor : [],
      outfits: cleanOutfits(data.outfits),
    },
    migrated: migrated,
  };
}

var ANDREW_MANTA_REMOVE_FLAG = "codereef_remove_manta_andrew";

function signedInKidName() {
  var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!user || !user.kidName) {
    return "";
  }
  if (typeof normalizeName === "function") {
    return normalizeName(user.kidName);
  }
  return String(user.kidName).trim().toLowerCase();
}

// Take back one gifted Manta Ray the first time Andrew's wallet loads.
// Other fish, coins, outfits, and decorations stay. This never adds a fish.
function removeAndrewMantaOnce(wallet) {
  if (signedInKidName() !== "andrew") {
    return wallet;
  }
  if (localStorage.getItem(ANDREW_MANTA_REMOVE_FLAG)) {
    return wallet;
  }
  var have = wallet.fishCounts.manta || 0;
  if (have > 0) {
    have -= 1;
    if (have > 0) {
      wallet.fishCounts.manta = have;
    } else {
      delete wallet.fishCounts.manta;
    }
    saveWallet(wallet);
  }
  localStorage.setItem(ANDREW_MANTA_REMOVE_FLAG, "1");
  return wallet;
}

var ANDREW_STINGRAY_GIFT_FLAG = "codereef_gift_stingray_andrew";

// Give Andrew one Stingray the first time his wallet loads. It does not cost coins.
function giftAndrewStingrayOnce(wallet) {
  if (signedInKidName() !== "andrew") {
    return wallet;
  }
  if (localStorage.getItem(ANDREW_STINGRAY_GIFT_FLAG)) {
    return wallet;
  }
  wallet.fishCounts.stingray = (wallet.fishCounts.stingray || 0) + 1;
  saveWallet(wallet);
  localStorage.setItem(ANDREW_STINGRAY_GIFT_FLAG, "1");
  return wallet;
}

function getWallet() {
  var raw = localStorage.getItem(walletKidKey());
  if (!raw) {
    return rememberWallet(giftAndrewStingrayOnce(removeAndrewMantaOnce(emptyWallet())));
  }
  try {
    var data = JSON.parse(raw);
    var loaded = walletFromSaved(data);
    if (loaded.migrated) {
      saveWallet(loaded.wallet);
    }
    return rememberWallet(giftAndrewStingrayOnce(removeAndrewMantaOnce(loaded.wallet)));
  } catch (err) {
    return rememberWallet(emptyWallet());
  }
}

var memoryWallet = null;

function rememberWallet(wallet) {
  memoryWallet = wallet;
  return wallet;
}

function peekWallet() {
  return memoryWallet;
}

function saveWallet(wallet) {
  memoryWallet = wallet;
  try {
    localStorage.setItem(walletKidKey(), JSON.stringify(wallet));
  } catch (err) {
    // Quota or private mode — keep the copy in memory for the next try.
  }
}

window.addEventListener("pagehide", function () {
  if (memoryWallet) {
    saveWallet(memoryWallet);
  }
});

function formatCoinCost(cost) {
  var parts = [];
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var amount = cost && cost[id] ? cost[id] : 0;
    if (amount > 0) {
      parts.push(amount + " " + COIN_NAMES[id]);
    }
  }
  if (parts.length === 0) {
    return "Free";
  }
  return parts.join(", ");
}

function formatEarnedCoins(drop) {
  var parts = [];
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var amount = drop && drop[id] ? drop[id] : 0;
    if (amount > 0) {
      parts.push(amount + " " + COIN_NAMES[id]);
    }
  }
  if (parts.length === 0) {
    return "0 Sand";
  }
  return parts.join(", ");
}

function formatCoinSummary(coins) {
  var parts = [];
  var i;
  var safe = coins || emptyCoins();
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    parts.push((safe[id] || 0) + " " + COIN_NAMES[id]);
  }
  return parts.join(", ");
}

function rollTrailCoins() {
  var drop = { sand: TRAIL_SAND_COINS };
  if (Math.random() < TRAIL_CORAL_CHANCE) {
    drop.coral = 1;
  }
  if (Math.random() < TRAIL_PEARL_CHANCE) {
    drop.pearl = 1;
  }
  if (Math.random() < TRAIL_TREASURE_CHANCE) {
    drop.treasure = 1;
  }
  return drop;
}

function addCoinDrop(drop) {
  var wallet = getWallet();
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var amount = drop && drop[id] ? drop[id] : 0;
    if (amount > 0) {
      wallet.coins[id] += amount;
    }
  }
  saveWallet(wallet);
  return wallet.coins;
}

// Older pages may still call this. Extra coins become Sand.
function addCoins(amount) {
  addCoinDrop({ sand: amount });
  return getWallet().coins.sand;
}

function hasCoins(wallet, cost) {
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var need = cost && cost[id] ? cost[id] : 0;
    var have = wallet.coins[id] || 0;
    if (have < need) {
      return false;
    }
  }
  return true;
}

function takeCoins(wallet, cost) {
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var need = cost && cost[id] ? cost[id] : 0;
    if (need > 0) {
      wallet.coins[id] -= need;
    }
  }
}

function coinsShortText(wallet, cost) {
  var parts = [];
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var need = cost && cost[id] ? cost[id] : 0;
    var have = wallet.coins[id] || 0;
    if (have < need) {
      parts.push(need - have + " more " + COIN_NAMES[id]);
    }
  }
  if (parts.length === 0) {
    return "more coins";
  }
  return parts.join(" and ");
}

function spendCoins(amount) {
  var wallet = getWallet();
  if ((wallet.coins.sand || 0) < amount) {
    return false;
  }
  wallet.coins.sand -= amount;
  saveWallet(wallet);
  return true;
}

function totalFishIn(wallet) {
  var total = 0;
  var id;
  for (id in wallet.fishCounts) {
    if (Object.prototype.hasOwnProperty.call(wallet.fishCounts, id)) {
      total += wallet.fishCounts[id];
    }
  }
  return total;
}

function totalFishCount() {
  return totalFishIn(getWallet());
}

function fishCount(fishId) {
  var wallet = getWallet();
  return wallet.fishCounts[fishId] || 0;
}

function ownFish(fishId) {
  return fishCount(fishId) > 0;
}

function findFish(fishId) {
  var i;
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    if (FISH_FOR_SALE[i].id === fishId) {
      return FISH_FOR_SALE[i];
    }
  }
  return null;
}

function buyFish(fishId) {
  var fish = findFish(fishId);
  if (!fish) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (totalFishIn(wallet) >= MAX_FISH) {
    return { ok: false, reason: "full" };
  }
  var cost = fish.cost || {};
  if (!hasCoins(wallet, cost)) {
    return { ok: false, reason: "coins", need: coinsShortText(wallet, cost) };
  }
  takeCoins(wallet, cost);
  wallet.fishCounts[fishId] = (wallet.fishCounts[fishId] || 0) + 1;
  saveWallet(wallet);
  return { ok: true, fish: fish, count: wallet.fishCounts[fishId] };
}

// Half of each buy coin, rounded down. A sale always gives at least 1 Sand.
// Works for fish, decorations, and outfits. Same coin types as the buy price.
function sellPriceFor(fish) {
  var refund = {};
  var any = false;
  var i;
  var cost = fish && fish.cost ? fish.cost : {};
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var half = Math.floor((cost[id] || 0) / 2);
    if (half > 0) {
      refund[id] = half;
      any = true;
    }
  }
  if (!any) {
    refund.sand = 1;
  }
  return refund;
}

function addSellCoins(wallet, refund) {
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var amount = refund[id] || 0;
    if (amount > 0) {
      wallet.coins[id] = (wallet.coins[id] || 0) + amount;
    }
  }
}

function sellFish(fishId) {
  var fish = findFish(fishId);
  if (!fish) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  var owned = wallet.fishCounts[fishId] || 0;
  if (owned < 1) {
    return { ok: false, reason: "none" };
  }
  var refund = sellPriceFor(fish);
  addSellCoins(wallet, refund);
  owned -= 1;
  if (owned > 0) {
    wallet.fishCounts[fishId] = owned;
  } else {
    delete wallet.fishCounts[fishId];
  }
  dropOneOutfit(wallet, fishId);
  saveWallet(wallet);
  return {
    ok: true,
    fish: fish,
    count: owned,
    priceText: formatCoinCost(refund),
  };
}

function addCoinCost(coins, cost) {
  var i;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var amount = cost && cost[id] ? cost[id] : 0;
    if (amount > 0) {
      coins[id] = (coins[id] || 0) + amount;
    }
  }
}

// Full tank: give back the old fish's full buy price, then pay for the new one.
// If the refund is not enough, the wallet stays the same.
function replaceFish(giveUpId, newFishId) {
  var giveUp = findFish(giveUpId);
  var incoming = findFish(newFishId);
  if (!giveUp || !incoming) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  var owned = wallet.fishCounts[giveUpId] || 0;
  if (owned < 1) {
    return { ok: false, reason: "none" };
  }
  if (totalFishIn(wallet) < MAX_FISH) {
    return { ok: false, reason: "notfull" };
  }

  var refund = giveUp.cost || {};
  var price = incoming.cost || {};
  var previewCoins = {
    sand: wallet.coins.sand || 0,
    coral: wallet.coins.coral || 0,
    pearl: wallet.coins.pearl || 0,
    treasure: wallet.coins.treasure || 0,
  };
  addCoinCost(previewCoins, refund);
  var preview = { coins: previewCoins };
  if (!hasCoins(preview, price)) {
    return {
      ok: false,
      reason: "coins",
      need: coinsShortText(preview, price),
    };
  }

  addCoinCost(wallet.coins, refund);
  takeCoins(wallet, price);
  owned -= 1;
  if (owned > 0) {
    wallet.fishCounts[giveUpId] = owned;
  } else {
    delete wallet.fishCounts[giveUpId];
  }
  dropOneOutfit(wallet, giveUpId);
  wallet.fishCounts[newFishId] = (wallet.fishCounts[newFishId] || 0) + 1;
  saveWallet(wallet);
  return {
    ok: true,
    fish: incoming,
    gaveUp: giveUp,
    count: wallet.fishCounts[newFishId],
    refundText: formatCoinCost(refund),
    priceText: formatCoinCost(price),
  };
}

// Free fish (trail rare prize) — does not spend coins. Copies of the same fish are OK.
function grantFish(fishId) {
  var fish = findFish(fishId);
  if (!fish) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (totalFishIn(wallet) >= MAX_FISH) {
    return { ok: false, reason: "full" };
  }
  wallet.fishCounts[fishId] = (wallet.fishCounts[fishId] || 0) + 1;
  saveWallet(wallet);
  return { ok: true, fish: fish, count: wallet.fishCounts[fishId] };
}

function pickRandomFish() {
  if (FISH_FOR_SALE.length === 0) {
    return null;
  }
  var index = Math.floor(Math.random() * FISH_FOR_SALE.length);
  return FISH_FOR_SALE[index];
}

function cleanOutfits(list) {
  var out = [];
  var i;
  if (!Array.isArray(list)) {
    return out;
  }
  for (i = 0; i < list.length; i += 1) {
    var row = list[i];
    if (row && typeof row.fishId === "string" && typeof row.outfitId === "string") {
      out.push({ fishId: row.fishId, outfitId: row.outfitId });
    }
  }
  return out;
}

function decorCount(decorId) {
  var wallet = getWallet();
  var list = wallet.decor || [];
  var n = 0;
  var i;
  for (i = 0; i < list.length; i += 1) {
    if (list[i] === decorId) {
      n += 1;
    }
  }
  return n;
}

function findDecor(decorId) {
  var i;
  for (i = 0; i < DECOR_FOR_SALE.length; i += 1) {
    if (DECOR_FOR_SALE[i].id === decorId) {
      return DECOR_FOR_SALE[i];
    }
  }
  return null;
}

function decorCap(item) {
  if (!item) {
    return 1;
  }
  if (item.once) {
    return 1;
  }
  if (item.max) {
    return item.max;
  }
  return 6;
}

function ownDecor(decorId) {
  return decorCount(decorId) > 0;
}

function buyDecor(decorId) {
  var item = findDecor(decorId);
  if (!item) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (!Array.isArray(wallet.decor)) {
    wallet.decor = [];
  }
  var have = 0;
  var i;
  for (i = 0; i < wallet.decor.length; i += 1) {
    if (wallet.decor[i] === decorId) {
      have += 1;
    }
  }
  var cap = decorCap(item);
  if (have >= cap) {
    return { ok: false, reason: item.once ? "owned" : "max", cap: cap };
  }
  var cost = item.cost || {};
  if (!hasCoins(wallet, cost)) {
    return { ok: false, reason: "coins", need: coinsShortText(wallet, cost) };
  }
  takeCoins(wallet, cost);
  wallet.decor.push(decorId);
  saveWallet(wallet);
  return { ok: true, decor: item, count: have + 1 };
}

// Sell one decoration. It leaves the aquarium, and the kid gets half the buy price.
function sellDecor(decorId) {
  var item = findDecor(decorId);
  if (!item) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (!Array.isArray(wallet.decor)) {
    wallet.decor = [];
  }
  var index = -1;
  var i;
  for (i = 0; i < wallet.decor.length; i += 1) {
    if (wallet.decor[i] === decorId) {
      index = i;
      break;
    }
  }
  if (index < 0) {
    return { ok: false, reason: "none" };
  }
  var refund = sellPriceFor(item);
  addSellCoins(wallet, refund);
  wallet.decor.splice(index, 1);
  saveWallet(wallet);
  var left = 0;
  for (i = 0; i < wallet.decor.length; i += 1) {
    if (wallet.decor[i] === decorId) {
      left += 1;
    }
  }
  return {
    ok: true,
    decor: item,
    count: left,
    priceText: formatCoinCost(refund),
  };
}

function getDecorCopies() {
  var copies = [];
  var i;
  var c;
  var n;
  for (i = 0; i < DECOR_FOR_SALE.length; i += 1) {
    var item = DECOR_FOR_SALE[i];
    n = decorCount(item.id);
    for (c = 0; c < n; c += 1) {
      copies.push(item);
    }
  }
  return copies;
}

function weedShapeHtml(extraClass) {
  return (
    '<span class="shop-decor-preview' +
    (extraClass ? " " + extraClass : "") +
    '" aria-hidden="true">' +
    '<span class="shop-decor-preview__leaf"></span>' +
    '<span class="shop-decor-preview__leaf"></span>' +
    '<span class="shop-decor-preview__leaf"></span>' +
    "</span>"
  );
}

function decorShapeHtml(decorId) {
  if (decorId === "seaweed") {
    return weedShapeHtml("");
  }
  if (decorId === "kelp") {
    return weedShapeHtml("shop-decor-preview--kelp");
  }
  return '<span class="decor-shape decor-shape--' + decorId + '" aria-hidden="true"></span>';
}

function findOutfit(outfitId) {
  var i;
  if (typeof OUTFITS_FOR_SALE === "undefined") {
    return null;
  }
  for (i = 0; i < OUTFITS_FOR_SALE.length; i += 1) {
    if (OUTFITS_FOR_SALE[i].id === outfitId) {
      return OUTFITS_FOR_SALE[i];
    }
  }
  return null;
}

function outfitCount(outfitId) {
  var wallet = getWallet();
  var worn = wallet.outfits || [];
  var n = 0;
  var i;
  for (i = 0; i < worn.length; i += 1) {
    if (worn[i] && worn[i].outfitId === outfitId) {
      n += 1;
    }
  }
  return n;
}

function dropOneOutfit(wallet, fishId) {
  var worn = wallet.outfits || [];
  var i;
  for (i = worn.length - 1; i >= 0; i -= 1) {
    if (worn[i] && worn[i].fishId === fishId) {
      worn.splice(i, 1);
      wallet.outfits = worn;
      return;
    }
  }
}

function buyOutfit(outfitId, fishId) {
  var outfit = findOutfit(outfitId);
  var fish = findFish(fishId);
  if (!outfit || !fish) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (totalFishIn(wallet) < 1) {
    return { ok: false, reason: "nofish" };
  }
  var owned = wallet.fishCounts[fishId] || 0;
  if (owned < 1) {
    return { ok: false, reason: "none" };
  }
  var cost = outfit.cost || {};
  if (!hasCoins(wallet, cost)) {
    return { ok: false, reason: "coins", need: coinsShortText(wallet, cost) };
  }
  if (!Array.isArray(wallet.outfits)) {
    wallet.outfits = [];
  }
  var onFish = [];
  var i;
  for (i = 0; i < wallet.outfits.length; i += 1) {
    if (wallet.outfits[i] && wallet.outfits[i].fishId === fishId) {
      onFish.push(i);
    }
  }
  takeCoins(wallet, cost);
  if (onFish.length < owned) {
    wallet.outfits.push({ fishId: fishId, outfitId: outfitId });
  } else {
    wallet.outfits[onFish[0]] = { fishId: fishId, outfitId: outfitId };
  }
  saveWallet(wallet);
  return {
    ok: true,
    outfit: outfit,
    fish: fish,
    count: outfitCount(outfitId),
  };
}

// Sell one outfit. If a fish is wearing it, that costume comes off one fish.
// If several fish wear the same outfit, only one of them loses it.
function sellOutfit(outfitId) {
  var outfit = findOutfit(outfitId);
  if (!outfit) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (!Array.isArray(wallet.outfits)) {
    wallet.outfits = [];
  }
  var index = -1;
  var i;
  for (i = 0; i < wallet.outfits.length; i += 1) {
    if (wallet.outfits[i] && wallet.outfits[i].outfitId === outfitId) {
      index = i;
      break;
    }
  }
  if (index < 0) {
    return { ok: false, reason: "none" };
  }
  var worn = wallet.outfits[index];
  var fromFish = worn && worn.fishId ? findFish(worn.fishId) : null;
  var refund = sellPriceFor(outfit);
  addSellCoins(wallet, refund);
  wallet.outfits.splice(index, 1);
  saveWallet(wallet);
  return {
    ok: true,
    outfit: outfit,
    fish: fromFish,
    count: outfitCount(outfitId),
    priceText: formatCoinCost(refund),
  };
}

function nextWornOutfit(fishId, cursor) {
  var worn = getWallet().outfits || [];
  var want = cursor[fishId] || 0;
  var seen = 0;
  var i;
  for (i = 0; i < worn.length; i += 1) {
    if (worn[i] && worn[i].fishId === fishId) {
      if (seen === want) {
        cursor[fishId] = want + 1;
        return worn[i].outfitId;
      }
      seen += 1;
    }
  }
  cursor[fishId] = want + 1;
  return "";
}

// Fish to draw. Stops at MAX_FISH_ON_SCREEN so a full tank does not freeze the page.
function getSwimmingFishList() {
  var wallet = getWallet();
  var buckets = [];
  var i;
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    var fish = FISH_FOR_SALE[i];
    var count = wallet.fishCounts[fish.id] || 0;
    if (count > 0) {
      buckets.push({ fish: fish, left: count });
    }
  }

  var list = [];
  var keepGoing = true;
  while (list.length < MAX_FISH_ON_SCREEN && keepGoing) {
    keepGoing = false;
    for (i = 0; i < buckets.length; i += 1) {
      if (list.length >= MAX_FISH_ON_SCREEN) {
        break;
      }
      if (buckets[i].left > 0) {
        list.push(buckets[i].fish);
        buckets[i].left -= 1;
        keepGoing = true;
      }
    }
  }
  return list;
}

function getOwnedFishList() {
  return getSwimmingFishList();
}

// HTML for a swimming fish. The picture is the whole fish.
function reefFishMarkup(fish, outfitId) {
  var kind = fish.kind || "fish";
  var outfit = "";
  if (outfitId) {
    outfit =
      '<span class="reef-outfit reef-outfit--' + outfitId + '" aria-hidden="true"></span>';
  }
  return (
    '<span class="reef-fish reef-fish--' +
    kind +
    '">' +
    '<span class="reef-fish__wiggle">' +
    '<img class="reef-fish__img" src="' +
    fish.image +
    '" alt="" />' +
    outfit +
    "</span></span>"
  );
}

// Friendly pop-up when you earn coins on the trail.
function showCoinToast(earnedText) {
  var old = document.getElementById("coin-toast");
  if (old) {
    old.remove();
  }
  var phrase = earnedText;
  if (typeof earnedText === "number") {
    phrase = "+" + earnedText + " Sand";
  }
  var toast = document.createElement("div");
  toast.id = "coin-toast";
  toast.className = "coin-toast";
  toast.setAttribute("role", "status");
  toast.textContent = "You earned " + phrase + "!";
  document.body.appendChild(toast);
  window.setTimeout(function () {
    toast.classList.add("is-gone");
    window.setTimeout(function () {
      toast.remove();
    }, 400);
  }, 2200);
}

// Big celebration when a rare trail fish is found.
function showRareFishToast(fishName, earnedText) {
  var old = document.getElementById("coin-toast");
  if (old) {
    old.remove();
  }
  var toast = document.createElement("div");
  toast.id = "coin-toast";
  toast.className = "coin-toast coin-toast--rare";
  toast.setAttribute("role", "status");
  var line = "Rare! You found a " + fishName + "!";
  if (earnedText) {
    line += " You earned " + earnedText + ".";
  }
  toast.textContent = line;
  document.body.appendChild(toast);
  window.setTimeout(function () {
    toast.classList.add("is-gone");
    window.setTimeout(function () {
      toast.remove();
    }, 400);
  }, 3200);
}
