// Reef wallet — four coin types and fish for each kid (saved in this browser).
// Sand is common. Coral is uncommon. Pearl is rare. Treasure is very rare.

var MAX_FISH = 1000;
var MAX_FISH_ON_SCREEN = 24;

// Every trail stop. Rare coins are extra luck, not a sure thing.
var TRAIL_SAND_COINS = 5;
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
// This list stays common → rare, so a higher index matches rarity.
var FISH_FOR_SALE = [
  {
    id: "guppy",
    name: "Guppy",
    cost: { sand: 3 },
    image: "assets/fish/guppy.png?v=morefish",
    kind: "fish",
    rarity: 1,
  },
  {
    id: "damsel",
    name: "Damselfish",
    cost: { sand: 5 },
    image: "assets/fish/damselfish.png?v=morefish",
    kind: "fish",
    rarity: 2,
  },
  {
    id: "goldie",
    name: "Goldfish",
    cost: { sand: 6 },
    image: "assets/fish/goldfish.png?v=morefish",
    kind: "fish",
    rarity: 3,
  },
  {
    id: "sunny",
    name: "Clownfish",
    cost: { sand: 8 },
    image: "assets/fish/clownfish.png?v=morefish",
    kind: "fish",
    rarity: 4,
  },
  {
    id: "cardinal",
    name: "Cardinalfish",
    cost: { sand: 7, coral: 2 },
    image: "assets/fish/cardinalfish.png?v=morefish",
    kind: "fish",
    rarity: 5,
  },
  {
    id: "betta",
    name: "Betta",
    cost: { sand: 9 },
    image: "assets/fish/betta.png?v=morefish",
    kind: "fish",
    rarity: 6,
  },
  {
    id: "bubbles",
    name: "Yellow Tang",
    cost: { sand: 10, coral: 1 },
    image: "assets/fish/yellow-tang.png?v=morefish",
    kind: "fish",
    rarity: 7,
  },
  {
    id: "snapper",
    name: "Snapper",
    cost: { sand: 11, coral: 2 },
    image: "assets/fish/snapper.png?v=morefish",
    kind: "fish",
    rarity: 8,
  },
  {
    id: "bluey",
    name: "Blue Tang",
    cost: { sand: 12, coral: 2 },
    image: "assets/fish/blue-tang.png?v=morefish",
    kind: "fish",
    rarity: 9,
  },
  {
    id: "grouper",
    name: "Grouper",
    cost: { sand: 18, coral: 3 },
    image: "assets/fish/grouper.png?v=morefish",
    kind: "fish",
    rarity: 10,
  },
  {
    id: "flutter",
    name: "Butterflyfish",
    cost: { sand: 8, coral: 3 },
    image: "assets/fish/butterflyfish.png?v=morefish",
    kind: "fish",
    rarity: 11,
  },
  {
    id: "banner",
    name: "Bannerfish",
    cost: { sand: 12, coral: 4 },
    image: "assets/fish/bannerfish.png?v=morefish",
    kind: "fish",
    rarity: 12,
  },
  {
    id: "angel",
    name: "Queen Angelfish",
    cost: { sand: 10, coral: 2, pearl: 1 },
    image: "assets/fish/angelfish.png?v=morefish",
    kind: "fish",
    rarity: 13,
  },
  {
    id: "discus",
    name: "Discus",
    cost: { sand: 8, coral: 5, pearl: 2 },
    image: "assets/fish/discus.png?v=morefish",
    kind: "fish",
    rarity: 14,
  },
  {
    id: "glow",
    name: "Fairy Wrasse",
    cost: { sand: 6, coral: 4, pearl: 1 },
    image: "assets/fish/fairy-wrasse.png?v=morefish",
    kind: "fish",
    rarity: 15,
  },
  {
    id: "koi",
    name: "Koi",
    cost: { sand: 15, coral: 7 },
    image: "assets/fish/koi.png?v=morefish",
    kind: "fish",
    rarity: 16,
  },
  {
    id: "parrot",
    name: "Parrotfish",
    cost: { sand: 20, coral: 8, pearl: 1 },
    image: "assets/fish/parrotfish.png?v=morefish",
    kind: "fish",
    rarity: 17,
  },
  {
    id: "idol",
    name: "Moorish Idol",
    cost: { coral: 8, pearl: 2 },
    image: "assets/fish/moorish-idol.png?v=morefish",
    kind: "fish",
    rarity: 18,
  },
  {
    id: "puffer",
    name: "Pufferfish",
    cost: { sand: 2, coral: 7, pearl: 3 },
    image: "assets/fish/pufferfish.png?v=morefish",
    kind: "fish",
    rarity: 19,
  },
  {
    id: "mandarin",
    name: "Mandarin Dragonet",
    cost: { coral: 4, pearl: 3 },
    image: "assets/fish/mandarin-dragonet.png?v=morefish",
    kind: "fish",
    rarity: 20,
  },
  {
    id: "seahorse",
    name: "Seahorse",
    cost: { sand: 6, coral: 2, pearl: 4 },
    image: "assets/fish/seahorse.png?v=morefish",
    kind: "fish",
    rarity: 21,
  },
  {
    id: "stingray",
    name: "Stingray",
    cost: { coral: 8, pearl: 5 },
    image: "assets/fish/stingray.png?v=morefish",
    kind: "fish",
    rarity: 22,
  },
  {
    id: "turtle",
    name: "Sea Turtle",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/sea-turtle.png?v=morefish",
    kind: "turtle",
    rarity: 23,
  },
  {
    id: "moray",
    name: "Moray Eel",
    cost: { sand: 1, coral: 9, pearl: 2, treasure: 1 },
    image: "assets/fish/moray-eel.png?v=morefish",
    kind: "fish",
    rarity: 24,
  },
  {
    id: "trigger",
    name: "Clown Triggerfish",
    cost: { coral: 1, pearl: 6, treasure: 1 },
    image: "assets/fish/clown-triggerfish.png?v=morefish",
    kind: "fish",
    rarity: 25,
  },
  {
    id: "octopus",
    name: "Octopus",
    cost: { pearl: 3, treasure: 2 },
    image: "assets/fish/octopus.png?v=morefish",
    kind: "octopus",
    rarity: 26,
  },
  {
    id: "cuda",
    name: "Barracuda",
    cost: { pearl: 5, treasure: 2 },
    image: "assets/fish/barracuda.png?v=morefish",
    kind: "fish",
    rarity: 27,
  },
  {
    id: "lion",
    name: "Lionfish",
    cost: { coral: 2, pearl: 5, treasure: 3 },
    image: "assets/fish/lionfish.png?v=morefish",
    kind: "fish",
    rarity: 28,
  },
  {
    id: "shark",
    name: "Reef Shark",
    cost: { pearl: 2, treasure: 3 },
    image: "assets/fish/shark.png?v=morefish",
    kind: "shark",
    rarity: 29,
  },
  {
    id: "sword",
    name: "Swordfish",
    cost: { sand: 4, pearl: 2, treasure: 5 },
    image: "assets/fish/swordfish.png?v=morefish",
    kind: "fish",
    rarity: 30,
  },
  {
    id: "manta",
    name: "Manta Ray",
    cost: { pearl: 6, treasure: 4 },
    image: "assets/fish/manta-ray.png?v=morefish",
    kind: "fish",
    rarity: 31,
  },
];

var DECOR_FOR_SALE = [
  {
    id: "seaweed",
    name: "Seaweed Patch",
    cost: { sand: 8 },
  },
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
  return { coins: emptyCoins(), fishCounts: {}, decor: [] };
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
    },
    migrated: migrated,
  };
}

function getWallet() {
  var raw = localStorage.getItem(walletKidKey());
  if (!raw) {
    return emptyWallet();
  }
  try {
    var data = JSON.parse(raw);
    var loaded = walletFromSaved(data);
    if (loaded.migrated) {
      saveWallet(loaded.wallet);
    }
    return loaded.wallet;
  } catch (err) {
    return emptyWallet();
  }
}

function saveWallet(wallet) {
  localStorage.setItem(walletKidKey(), JSON.stringify(wallet));
}

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
      parts.push("+" + amount + " " + COIN_NAMES[id]);
    }
  }
  if (parts.length === 0) {
    return "+0 Sand";
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

function ownDecor(decorId) {
  var wallet = getWallet();
  return wallet.decor.indexOf(decorId) !== -1;
}

function buyDecor(decorId) {
  var item = null;
  var i;
  for (i = 0; i < DECOR_FOR_SALE.length; i += 1) {
    if (DECOR_FOR_SALE[i].id === decorId) {
      item = DECOR_FOR_SALE[i];
      break;
    }
  }
  if (!item) {
    return { ok: false, reason: "missing" };
  }
  if (ownDecor(decorId)) {
    return { ok: false, reason: "owned" };
  }
  var wallet = getWallet();
  var cost = item.cost || {};
  if (!hasCoins(wallet, cost)) {
    return { ok: false, reason: "coins", need: coinsShortText(wallet, cost) };
  }
  takeCoins(wallet, cost);
  wallet.decor.push(decorId);
  saveWallet(wallet);
  return { ok: true, decor: item };
}

// Fish to draw. Stops at MAX_FISH_ON_SCREEN so 1,000 copies do not freeze the page.
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

// One piece of a limb. Same viewBox on every piece so the joints line up.
function limbSvg(viewBox, align, paths) {
  return (
    '<svg class="limb-svg" viewBox="' +
    viewBox +
    '" preserveAspectRatio="' +
    align +
    '" overflow="visible">' +
    paths +
    "</svg>"
  );
}

// Forked tail. Three pieces so the tip can lag behind the base.
function forkedTail() {
  return (
    '<span class="reef-limb reef-limb--tail" aria-hidden="true">' +
    '<span class="seg seg--base">' +
    limbSvg(
      "0 0 152 100",
      "none",
      '<path class="limb-shape" d="M4 40 C22 32 38 36 50 50 C38 64 22 68 4 60 Z"/>'
    ) +
    '<span class="seg seg--mid">' +
    limbSvg(
      "0 0 152 100",
      "none",
      '<path class="limb-shape" d="M40 42 C58 34 74 38 84 50 C74 62 58 66 40 58 Z"/>'
    ) +
    '<span class="seg seg--tip">' +
    limbSvg(
      "0 0 152 100",
      "none",
      '<path class="limb-shape" d="M74 36 C98 14 126 2 148 12 C126 26 102 40 80 50 C102 60 126 74 148 88 C126 98 98 86 74 64 C70 56 70 44 74 36 Z"/>' +
        '<path class="limb-ray" d="M80 50 L140 16"/>' +
        '<path class="limb-ray" d="M80 50 L146 50"/>' +
        '<path class="limb-ray" d="M80 50 L140 84"/>'
    ) +
    "</span></span></span></span>"
  );
}

// Shark tail: a tall crescent, upper lobe longer than the lower one.
function crescentTail() {
  return (
    '<span class="reef-limb reef-limb--tail reef-limb--crescent" aria-hidden="true">' +
    '<span class="seg seg--base">' +
    limbSvg(
      "0 0 100 150",
      "none",
      '<path class="limb-shape" d="M0 78 L34 72 L34 90 L0 96 Z"/>'
    ) +
    '<span class="seg seg--mid">' +
    limbSvg(
      "0 0 100 150",
      "none",
      '<path class="limb-shape" d="M22 74 L46 68 L46 92 L22 98 Z"/>'
    ) +
    '<span class="seg seg--tip">' +
    limbSvg(
      "0 0 100 150",
      "none",
      '<path class="limb-shape" d="M38 84 C48 52 58 24 74 8 C86 2 96 18 86 34 C74 52 56 74 46 86 C54 92 56 104 46 108 C36 112 30 100 34 92 C30 88 34 84 38 84 Z"/>'
    ) +
    "</span></span></span></span>"
  );
}

// Triangle on the back.
function dorsalFin() {
  return (
    '<span class="reef-limb reef-limb--dorsal" aria-hidden="true">' +
    limbSvg(
      "0 0 74 100",
      "none",
      '<path class="limb-shape" d="M6 96 C22 88 30 58 37 4 C44 58 54 88 68 96 C50 86 22 86 6 96 Z"/>' +
        '<path class="limb-ray" d="M37 90 L37 14"/>' +
        '<path class="limb-ray" d="M37 88 L24 70"/>' +
        '<path class="limb-ray" d="M37 88 L52 70"/>'
    ) +
    "</span>"
  );
}

// Flat side fin. Narrow where it meets the body, wide at the end.
function paddleFin(extraClass) {
  var classes = "reef-limb reef-limb--fin";
  if (extraClass) {
    classes = classes + " " + extraClass;
  }
  return (
    '<span class="' +
    classes +
    '" aria-hidden="true">' +
    limbSvg(
      "0 0 64 100",
      "none",
      '<path class="limb-shape" d="M32 2 C42 6 46 16 44 28 L58 62 C62 78 50 96 36 98 C18 100 4 84 8 66 L20 28 C18 14 20 4 32 2 Z"/>' +
        '<path class="limb-ray" d="M32 10 L34 90"/>' +
        '<path class="limb-ray" d="M32 16 L48 78"/>' +
        '<path class="limb-ray" d="M30 16 L16 74"/>'
    ) +
    "</span>"
  );
}

// Turtle flipper: long paddle, skinny at the shoulder.
function flipperLimb(extraClass) {
  return (
    '<span class="reef-limb reef-limb--flipper ' +
    extraClass +
    '" aria-hidden="true">' +
    limbSvg(
      "0 0 66 100",
      "none",
      '<path class="limb-shape" d="M30 2 C40 4 44 16 42 28 L58 68 C62 86 48 99 32 98 C14 97 4 84 10 66 L22 28 C20 14 22 4 30 2 Z"/>' +
        '<path class="limb-ray" d="M33 8 L33 94"/>'
    ) +
    "</span>"
  );
}

// Octopus arm: thick at the body, thin at the curling tip.
function tentacleLimb(which) {
  return (
    '<span class="reef-limb reef-limb--tentacle ' +
    which +
    '" aria-hidden="true">' +
    '<span class="seg seg--base">' +
    limbSvg(
      "0 0 28 100",
      "none",
      '<path class="limb-shape" d="M5 0 L23 0 L20 34 L8 34 Z"/>'
    ) +
    '<span class="seg seg--mid">' +
    limbSvg(
      "0 0 28 100",
      "none",
      '<path class="limb-shape" d="M8 34 L20 34 L17 68 L11 68 Z"/>'
    ) +
    '<span class="seg seg--tip">' +
    limbSvg(
      "0 0 28 100",
      "none",
      '<path class="limb-shape limb-shape--tip" d="M11 68 L17 68 L16 88 Q14 100 8 90 Z"/>'
    ) +
    "</span></span></span></span>"
  );
}

// HTML for a swimming fish. CSS bends the tail, fins, flippers, and arms.
function reefFishMarkup(fish) {
  var kind = fish.kind || "fish";
  var limbs = "";
  if (kind === "octopus") {
    limbs =
      tentacleLimb("t1") +
      tentacleLimb("t2") +
      tentacleLimb("t3") +
      tentacleLimb("t4") +
      tentacleLimb("t5");
  } else if (kind === "turtle") {
    limbs =
      flipperLimb("front") +
      flipperLimb("front far") +
      flipperLimb("back") +
      flipperLimb("back far");
  } else if (kind === "shark") {
    limbs = dorsalFin() + paddleFin("") + crescentTail();
  } else {
    limbs = dorsalFin() + paddleFin("") + paddleFin("reef-limb--fin-small") + forkedTail();
  }
  return (
    '<span class="reef-fish reef-fish--' +
    kind +
    '">' +
    '<span class="reef-fish__wiggle">' +
    limbs +
    '<img class="reef-fish__img" src="' +
    fish.image +
    '" alt="" />' +
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
