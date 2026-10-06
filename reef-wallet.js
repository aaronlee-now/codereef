// Reef wallet — four coin types and fish for each kid (saved in this browser).
// Sand is common. Coral is uncommon. Pearl is rare. Treasure is very rare.

// Room for the bigger shop. Raising this never removes fish a kid already owns.
var MAX_FISH = 280;
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
// The number stays the race speed. The shop section word comes from fishRarityName.
var RARITY_SECTIONS = [
  "Ultra",
  "Mythic",
  "Legendary",
  "Epic",
  "Special",
  "Super Rare",
  "Rare",
  "Uncommon",
  "Common",
];

function fishRarityName(fish) {
  if (fish && fish.rarityName) {
    return fish.rarityName;
  }
  var n = fish && typeof fish.rarity === "number" ? fish.rarity : 1;
  if (n >= 122) {
    return "Ultra";
  }
  if (n >= 115) {
    return "Mythic";
  }
  if (n >= 105) {
    return "Legendary";
  }
  if (n >= 89) {
    return "Epic";
  }
  if (n >= 71) {
    return "Special";
  }
  if (n >= 53) {
    return "Super Rare";
  }
  if (n >= 35) {
    return "Rare";
  }
  if (n >= 17) {
    return "Uncommon";
  }
  return "Common";
}

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
  {
    id: "squirrel",
    name: "Squirrelfish",
    cost: { sand: 6 },
    image: "assets/fish/squirrelfish.svg?v=morefish2",
    kind: "fish",
    rarity: 8,
  },
  {
    id: "soldier",
    name: "Soldierfish",
    cost: { sand: 7 },
    image: "assets/fish/soldierfish.svg?v=morefish2",
    kind: "fish",
    rarity: 10,
  },
  {
    id: "convict",
    name: "Convict Tang",
    cost: { sand: 8 },
    image: "assets/fish/convict-tang.svg?v=morefish2",
    kind: "fish",
    rarity: 13,
  },
  {
    id: "shrimp",
    name: "Coral Shrimp",
    cost: { sand: 6, coral: 1 },
    image: "assets/fish/coral-shrimp.svg?v=morefish2",
    kind: "fish",
    rarity: 15,
  },
  {
    id: "pipe",
    name: "Pipefish",
    cost: { sand: 5, coral: 1 },
    image: "assets/fish/pipefish.svg?v=morefish2",
    kind: "fish",
    rarity: 16,
  },
  {
    id: "flashlight",
    name: "Flashlight Fish",
    cost: { sand: 8, coral: 1 },
    image: "assets/fish/flashlight-fish.svg?v=morefish2",
    kind: "fish",
    rarity: 20,
  },
  {
    id: "garden",
    name: "Garden Eel",
    cost: { sand: 6, coral: 2 },
    image: "assets/fish/garden-eel.svg?v=morefish2",
    kind: "fish",
    rarity: 22,
  },
  {
    id: "kole",
    name: "Kole Tang",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/kole-tang.svg?v=morefish2",
    kind: "fish",
    rarity: 24,
  },
  {
    id: "robin",
    name: "Sea Robin",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/sea-robin.svg?v=morefish2",
    kind: "fish",
    rarity: 26,
  },
  {
    id: "longnose",
    name: "Longnose Butterfly",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/longnose-butterfly.svg?v=morefish2",
    kind: "fish",
    rarity: 28,
  },
  {
    id: "bird",
    name: "Bird Wrasse",
    cost: { sand: 6, coral: 2 },
    image: "assets/fish/bird-wrasse.svg?v=morefish2",
    kind: "fish",
    rarity: 29,
  },
  {
    id: "frogfish",
    name: "Frogfish",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/frogfish.svg?v=morefish2",
    kind: "fish",
    rarity: 31,
  },
  {
    id: "flying",
    name: "Flying Fish",
    cost: { sand: 8, coral: 3 },
    image: "assets/fish/flying-fish.svg?v=morefish2",
    kind: "fish",
    rarity: 32,
  },
  {
    id: "boxfish",
    name: "Yellow Boxfish",
    cost: { sand: 8, coral: 3 },
    image: "assets/fish/yellow-boxfish.svg?v=morefish2",
    kind: "fish",
    rarity: 33,
  },
  {
    id: "batfish",
    name: "Orb Batfish",
    cost: { sand: 6, coral: 3, pearl: 1 },
    image: "assets/fish/orb-batfish.svg?v=morefish2",
    kind: "fish",
    rarity: 35,
  },
  {
    id: "bunny",
    name: "Sea Bunny",
    cost: { coral: 3, pearl: 1 },
    image: "assets/fish/sea-bunny.svg?v=morefish2",
    kind: "fish",
    rarity: 36,
  },
  {
    id: "purple",
    name: "Purple Tang",
    cost: { sand: 6, coral: 3, pearl: 1 },
    image: "assets/fish/purple-tang.svg?v=morefish2",
    kind: "fish",
    rarity: 38,
  },
  {
    id: "dancer",
    name: "Spanish Dancer",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/spanish-dancer.svg?v=morefish2",
    kind: "fish",
    rarity: 39,
  },
  {
    id: "gurnard",
    name: "Flying Gurnard",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/flying-gurnard.svg?v=morefish2",
    kind: "fish",
    rarity: 41,
  },
  {
    id: "achilles",
    name: "Achilles Tang",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/achilles-tang.svg?v=morefish2",
    kind: "fish",
    rarity: 42,
  },
  {
    id: "cowfish",
    name: "Cowfish",
    cost: { sand: 4, coral: 3, pearl: 1 },
    image: "assets/fish/cowfish.svg?v=morefish2",
    kind: "fish",
    rarity: 43,
  },
  {
    id: "tusk",
    name: "Harlequin Tusk",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/harlequin-tusk.svg?v=morefish2",
    kind: "fish",
    rarity: 44,
  },
  {
    id: "humuhumu",
    name: "Humuhumu",
    cost: { coral: 3, pearl: 2 },
    image: "assets/fish/humuhumu.svg?v=morefish2",
    kind: "fish",
    rarity: 45,
  },
  {
    id: "ribbon",
    name: "Ribbon Eel",
    cost: { coral: 3, pearl: 1 },
    image: "assets/fish/ribbon-eel.svg?v=morefish2",
    kind: "fish",
    rarity: 46,
  },
  {
    id: "regal",
    name: "Regal Angel",
    cost: { sand: 6, coral: 3, pearl: 1 },
    image: "assets/fish/regal-angel.svg?v=morefish2",
    kind: "fish",
    rarity: 47,
  },
  {
    id: "bluespot",
    name: "Bluespotted Ray",
    cost: { coral: 4, pearl: 2 },
    image: "assets/fish/bluespotted-ray.svg?v=morefish2",
    kind: "fish",
    rarity: 48,
  },
  {
    id: "pygmy",
    name: "Pygmy Seahorse",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/pygmy-seahorse.svg?v=morefish2",
    kind: "fish",
    rarity: 52,
  },
  {
    id: "weedy",
    name: "Weedy Seadragon",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/weedy-seadragon.svg?v=morefish2",
    kind: "fish",
    rarity: 54,
  },
  {
    id: "cuttle",
    name: "Cuttlefish",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/cuttlefish.svg?v=morefish2",
    kind: "fish",
    rarity: 55,
  },
  {
    id: "nautilus",
    name: "Nautilus",
    cost: { pearl: 2, treasure: 1 },
    image: "assets/fish/nautilus.svg?v=morefish2",
    kind: "fish",
    rarity: 56,
  },
  {
    id: "mantis",
    name: "Mantis Shrimp",
    cost: { coral: 2, pearl: 2, treasure: 1 },
    image: "assets/fish/mantis-shrimp.svg?v=morefish2",
    kind: "fish",
    rarity: 57,
  },
  {
    id: "eagle",
    name: "Eagle Ray",
    cost: { pearl: 3, treasure: 2 },
    image: "assets/fish/eagle-ray.svg?v=morefish2",
    kind: "fish",
    rarity: 60,
  },
  {
    id: "hammer",
    name: "Hammerhead",
    cost: { pearl: 2, treasure: 2 },
    image: "assets/fish/hammerhead.svg?v=morefish2",
    kind: "fish",
    rarity: 62,
  },
  {
    id: "sunfish",
    name: "Ocean Sunfish",
    cost: { pearl: 3, treasure: 2 },
    image: "assets/fish/ocean-sunfish.svg?v=morefish2",
    kind: "fish",
    rarity: 63,
  },
  {
    id: "oar",
    name: "Oarfish",
    cost: { pearl: 2, treasure: 2 },
    image: "assets/fish/oarfish.svg?v=morefish2",
    kind: "fish",
    rarity: 64,
  },
  {
    id: "coela",
    name: "Coelacanth",
    cost: { pearl: 3, treasure: 2 },
    image: "assets/fish/coelacanth.svg?v=morefish2",
    kind: "fish",
    rarity: 66,
  },
  {
    id: "pompano",
    name: "Pompano",
    cost: { pearl: 4, treasure: 2 },
    image: "assets/fish/pompano.svg?v=rare50",
    kind: "fish",
    rarity: 67,
  },
  {
    id: "lookdown",
    name: "Lookdown",
    cost: { pearl: 4, treasure: 2 },
    image: "assets/fish/lookdown.svg?v=rare50",
    kind: "fish",
    rarity: 68,
  },
  {
    id: "wahoo",
    name: "Wahoo",
    cost: { pearl: 5, treasure: 2 },
    image: "assets/fish/wahoo.svg?v=rare50",
    kind: "fish",
    rarity: 69,
  },
  {
    id: "mahi",
    name: "Mahi-Mahi",
    cost: { pearl: 5, treasure: 2 },
    image: "assets/fish/mahi-mahi.svg?v=rare50",
    kind: "fish",
    rarity: 70,
  },
  {
    id: "threadfin",
    name: "Threadfin Butterflyfish",
    cost: { pearl: 3, treasure: 3 },
    image: "assets/fish/threadfin-butterfly.svg?v=rare50",
    kind: "fish",
    rarity: 71,
  },
  {
    id: "masked",
    name: "Masked Bannerfish",
    cost: { pearl: 3, treasure: 3 },
    image: "assets/fish/masked-banner.svg?v=rare50",
    kind: "fish",
    rarity: 72,
  },
  {
    id: "clarion",
    name: "Clarion Angelfish",
    cost: { pearl: 6, treasure: 2 },
    image: "assets/fish/clarion-angel.svg?v=rare50",
    kind: "fish",
    rarity: 73,
  },
  {
    id: "peppermint",
    name: "Peppermint Angelfish",
    cost: { pearl: 6, treasure: 2 },
    image: "assets/fish/peppermint-angel.svg?v=rare50",
    kind: "fish",
    rarity: 74,
  },
  {
    id: "dory",
    name: "John Dory",
    cost: { pearl: 4, treasure: 3 },
    image: "assets/fish/john-dory.svg?v=rare50",
    kind: "fish",
    rarity: 75,
  },
  {
    id: "opah",
    name: "Opah",
    cost: { pearl: 4, treasure: 3 },
    image: "assets/fish/opah.svg?v=rare50",
    kind: "fish",
    rarity: 76,
  },
  {
    id: "pinecone",
    name: "Pinecone Fish",
    cost: { pearl: 7, treasure: 2 },
    image: "assets/fish/pinecone-fish.svg?v=rare50",
    kind: "fish",
    rarity: 77,
  },
  {
    id: "stargaze",
    name: "Stargazer",
    cost: { pearl: 7, treasure: 2 },
    image: "assets/fish/stargazer.svg?v=rare50",
    kind: "fish",
    rarity: 78,
  },
  {
    id: "scorpion",
    name: "Scorpionfish",
    cost: { pearl: 5, treasure: 3 },
    image: "assets/fish/scorpionfish.svg?v=rare50",
    kind: "fish",
    rarity: 79,
  },
  {
    id: "stone",
    name: "Stonefish",
    cost: { pearl: 5, treasure: 3 },
    image: "assets/fish/stonefish.svg?v=rare50",
    kind: "fish",
    rarity: 80,
  },
  {
    id: "leafscorp",
    name: "Leaf Scorpionfish",
    cost: { pearl: 8, treasure: 2 },
    image: "assets/fish/leaf-scorpion.svg?v=rare50",
    kind: "fish",
    rarity: 81,
  },
  {
    id: "sargassum",
    name: "Sargassum Fish",
    cost: { pearl: 8, treasure: 2 },
    image: "assets/fish/sargassum-fish.svg?v=rare50",
    kind: "fish",
    rarity: 82,
  },
  {
    id: "psyche",
    name: "Psychedelic Frogfish",
    cost: { pearl: 3, treasure: 4 },
    image: "assets/fish/psychedelic-frog.svg?v=rare50",
    kind: "fish",
    rarity: 83,
  },
  {
    id: "decorator",
    name: "Decorator Crab",
    cost: { pearl: 3, treasure: 4 },
    image: "assets/fish/decorator-crab.svg?v=rare50",
    kind: "fish",
    rarity: 84,
  },
  {
    id: "leopard",
    name: "Leopard Shark",
    cost: { pearl: 6, treasure: 3 },
    image: "assets/fish/leopard-shark.svg?v=rare50",
    kind: "fish",
    rarity: 85,
  },
  {
    id: "zebra",
    name: "Zebra Shark",
    cost: { pearl: 6, treasure: 3 },
    image: "assets/fish/zebra-shark.svg?v=rare50",
    kind: "fish",
    rarity: 86,
  },
  {
    id: "epaulette",
    name: "Epaulette Shark",
    cost: { pearl: 4, treasure: 4 },
    image: "assets/fish/epaulette-shark.svg?v=rare50",
    kind: "fish",
    rarity: 87,
  },
  {
    id: "blueshark",
    name: "Blue Shark",
    cost: { pearl: 4, treasure: 4 },
    image: "assets/fish/blue-shark.svg?v=rare50",
    kind: "fish",
    rarity: 88,
  },
  {
    id: "mako",
    name: "Mako Shark",
    cost: { pearl: 7, treasure: 3 },
    image: "assets/fish/mako-shark.svg?v=rare50",
    kind: "fish",
    rarity: 89,
  },
  {
    id: "basking",
    name: "Basking Shark",
    cost: { pearl: 7, treasure: 3 },
    image: "assets/fish/basking-shark.svg?v=rare50",
    kind: "fish",
    rarity: 90,
  },
  {
    id: "cookie",
    name: "Cookiecutter Shark",
    cost: { pearl: 5, treasure: 4 },
    image: "assets/fish/cookiecutter.svg?v=rare50",
    kind: "fish",
    rarity: 91,
  },
  {
    id: "wobbe",
    name: "Wobbegong",
    cost: { pearl: 5, treasure: 4 },
    image: "assets/fish/wobbegong.svg?v=rare50",
    kind: "fish",
    rarity: 92,
  },
  {
    id: "lantern",
    name: "Lanternfish",
    cost: { pearl: 8, treasure: 3 },
    image: "assets/fish/lanternfish.svg?v=rare50",
    kind: "fish",
    rarity: 93,
  },
  {
    id: "hatchet",
    name: "Hatchetfish",
    cost: { pearl: 8, treasure: 3 },
    image: "assets/fish/hatchetfish.svg?v=rare50",
    kind: "fish",
    rarity: 94,
  },
  {
    id: "viper",
    name: "Viperfish",
    cost: { pearl: 3, treasure: 5 },
    image: "assets/fish/viperfish.svg?v=rare50",
    kind: "fish",
    rarity: 95,
  },
  {
    id: "deepdragon",
    name: "Dragonfish",
    cost: { pearl: 3, treasure: 5 },
    image: "assets/fish/dragonfish.svg?v=rare50",
    kind: "fish",
    rarity: 96,
  },
  {
    id: "frilled",
    name: "Frilled Shark",
    cost: { pearl: 6, treasure: 4 },
    image: "assets/fish/frilled-shark.svg?v=rare50",
    kind: "fish",
    rarity: 97,
  },
  {
    id: "saw",
    name: "Sawfish",
    cost: { pearl: 6, treasure: 4 },
    image: "assets/fish/sawfish.svg?v=rare50",
    kind: "fish",
    rarity: 98,
  },
  {
    id: "thresher",
    name: "Thresher Shark",
    cost: { pearl: 4, treasure: 5 },
    image: "assets/fish/thresher-shark.svg?v=rare50",
    kind: "fish",
    rarity: 99,
  },
  {
    id: "goblin",
    name: "Goblin Shark",
    cost: { pearl: 4, treasure: 5 },
    image: "assets/fish/goblin-shark.svg?v=rare50",
    kind: "fish",
    rarity: 100,
  },
  {
    id: "mega",
    name: "Megamouth Shark",
    cost: { pearl: 7, treasure: 4 },
    image: "assets/fish/megamouth.svg?v=rare50",
    kind: "fish",
    rarity: 101,
  },
  {
    id: "angler",
    name: "Anglerfish",
    cost: { pearl: 7, treasure: 4 },
    image: "assets/fish/anglerfish.svg?v=rare50",
    kind: "fish",
    rarity: 102,
  },
  {
    id: "gulper",
    name: "Gulper Eel",
    cost: { pearl: 5, treasure: 5 },
    image: "assets/fish/gulper-eel.svg?v=rare50",
    kind: "fish",
    rarity: 103,
  },
  {
    id: "pelican",
    name: "Pelican Eel",
    cost: { pearl: 5, treasure: 5 },
    image: "assets/fish/pelican-eel.svg?v=rare50",
    kind: "fish",
    rarity: 104,
  },
  {
    id: "snipe",
    name: "Snipe Eel",
    cost: { pearl: 8, treasure: 4 },
    image: "assets/fish/snipe-eel.svg?v=rare50",
    kind: "fish",
    rarity: 105,
  },
  {
    id: "barrel",
    name: "Barreleye",
    cost: { pearl: 8, treasure: 4 },
    image: "assets/fish/barreleye.svg?v=rare50",
    kind: "fish",
    rarity: 106,
  },
  {
    id: "dumbo",
    name: "Dumbo Octopus",
    cost: { pearl: 3, treasure: 6 },
    image: "assets/fish/dumbo-octopus.svg?v=rare50",
    kind: "fish",
    rarity: 107,
  },
  {
    id: "vampire",
    name: "Vampire Squid",
    cost: { pearl: 3, treasure: 6 },
    image: "assets/fish/vampire-squid.svg?v=rare50",
    kind: "fish",
    rarity: 108,
  },
  {
    id: "bluering",
    name: "Blue-Ring Octopus",
    cost: { pearl: 6, treasure: 5 },
    image: "assets/fish/blue-ring-octopus.svg?v=rare50",
    kind: "fish",
    rarity: 109,
  },
  {
    id: "mimic",
    name: "Mimic Octopus",
    cost: { pearl: 4, treasure: 6 },
    image: "assets/fish/mimic-octopus.svg?v=rare50",
    kind: "fish",
    rarity: 110,
  },
  {
    id: "flamboyant",
    name: "Flamboyant Cuttlefish",
    cost: { pearl: 7, treasure: 5 },
    image: "assets/fish/flamboyant-cuttle.svg?v=rare50",
    kind: "fish",
    rarity: 111,
  },
  {
    id: "paper",
    name: "Paper Nautilus",
    cost: { pearl: 5, treasure: 6 },
    image: "assets/fish/paper-nautilus.svg?v=rare50",
    kind: "fish",
    rarity: 112,
  },
  {
    id: "sail",
    name: "Sailfish",
    cost: { pearl: 8, treasure: 5 },
    image: "assets/fish/sailfish.svg?v=rare50",
    kind: "fish",
    rarity: 113,
  },
  {
    id: "marlin",
    name: "Blue Marlin",
    cost: { pearl: 6, treasure: 6 },
    image: "assets/fish/blue-marlin.svg?v=rare50",
    kind: "fish",
    rarity: 114,
  },
  {
    id: "giant",
    name: "Giant Squid",
    cost: { pearl: 7, treasure: 6 },
    image: "assets/fish/giant-squid.svg?v=rare50",
    kind: "fish",
    rarity: 115,
  },
  {
    id: "colossal",
    name: "Colossal Squid",
    cost: { pearl: 8, treasure: 6 },
    image: "assets/fish/colossal-squid.svg?v=rare50",
    kind: "fish",
    rarity: 116,
  },
  {
    id: "emerald",
    name: "Emerald Crab",
    cost: { sand: 5 },
    image: "assets/fish/emerald-crab.svg?v=more50b",
    kind: "fish",
    rarity: 9,
  },
  {
    id: "cleanershrimp",
    name: "Cleaner Shrimp",
    cost: { sand: 6 },
    image: "assets/fish/cleaner-shrimp.svg?v=more50b",
    kind: "fish",
    rarity: 11,
  },
  {
    id: "tomini",
    name: "Tomini Tang",
    cost: { sand: 7 },
    image: "assets/fish/tomini-tang.svg?v=more50b",
    kind: "fish",
    rarity: 12,
  },
  {
    id: "pajama",
    name: "Pajama Cardinal",
    cost: { sand: 6, coral: 1 },
    image: "assets/fish/pajama-cardinal.svg?v=more50b",
    kind: "fish",
    rarity: 14,
  },
  {
    id: "neongoby",
    name: "Neon Goby",
    cost: { sand: 5, coral: 1 },
    image: "assets/fish/neon-goby.svg?v=more50b",
    kind: "fish",
    rarity: 16,
  },
  {
    id: "clowngoby",
    name: "Yellow Clown Goby",
    cost: { sand: 6, coral: 1 },
    image: "assets/fish/clown-goby.svg?v=more50b",
    kind: "fish",
    rarity: 18,
  },
  {
    id: "bandedshrimp",
    name: "Banded Shrimp",
    cost: { sand: 8, coral: 1 },
    image: "assets/fish/banded-shrimp.svg?v=more50b",
    kind: "fish",
    rarity: 19,
  },
  {
    id: "fireshrimp",
    name: "Fire Shrimp",
    cost: { sand: 7, coral: 1 },
    image: "assets/fish/fire-shrimp.svg?v=more50b",
    kind: "fish",
    rarity: 21,
  },
  {
    id: "purpfire",
    name: "Purple Firefish",
    cost: { sand: 8, coral: 1 },
    image: "assets/fish/purple-firefish.svg?v=more50b",
    kind: "fish",
    rarity: 23,
  },
  {
    id: "blackcap",
    name: "Blackcap Basslet",
    cost: { sand: 6, coral: 2 },
    image: "assets/fish/blackcap-basslet.svg?v=more50b",
    kind: "fish",
    rarity: 25,
  },
  {
    id: "swissguard",
    name: "Swissguard Basslet",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/swissguard.svg?v=more50b",
    kind: "fish",
    rarity: 27,
  },
  {
    id: "orchid",
    name: "Orchid Dottyback",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/orchid-dottyback.svg?v=more50b",
    kind: "fish",
    rarity: 28,
  },
  {
    id: "chevron",
    name: "Chevron Tang",
    cost: { sand: 8, coral: 2 },
    image: "assets/fish/chevron-tang.svg?v=more50b",
    kind: "fish",
    rarity: 30,
  },
  {
    id: "arrowcrab",
    name: "Arrow Crab",
    cost: { sand: 6, coral: 2 },
    image: "assets/fish/arrow-crab.svg?v=more50b",
    kind: "fish",
    rarity: 32,
  },
  {
    id: "sunrise",
    name: "Sunrise Dottyback",
    cost: { coral: 3 },
    image: "assets/fish/sunrise-dottyback.svg?v=more50b",
    kind: "fish",
    rarity: 33,
  },
  {
    id: "horseshoe",
    name: "Horseshoe Crab",
    cost: { sand: 8, coral: 3 },
    image: "assets/fish/horseshoe-crab.svg?v=more50b",
    kind: "fish",
    rarity: 34,
  },
  {
    id: "bifox",
    name: "Bicolor Foxface",
    cost: { sand: 8, coral: 3 },
    image: "assets/fish/bicolor-foxface.svg?v=more50b",
    kind: "fish",
    rarity: 35,
  },
  {
    id: "melanurus",
    name: "Tailspot Wrasse",
    cost: { sand: 8, coral: 3 },
    image: "assets/fish/melanurus-wrasse.svg?v=more50b",
    kind: "fish",
    rarity: 36,
  },
  {
    id: "magfox",
    name: "Magnificent Foxface",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/magnificent-foxface.svg?v=more50b",
    kind: "fish",
    rarity: 37,
  },
  {
    id: "sohal",
    name: "Sohal Tang",
    cost: { sand: 6, coral: 3, pearl: 1 },
    image: "assets/fish/sohal-tang.svg?v=more50b",
    kind: "fish",
    rarity: 38,
  },
  {
    id: "naso",
    name: "Naso Tang",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/naso-tang.svg?v=more50b",
    kind: "fish",
    rarity: 40,
  },
  {
    id: "lipstick",
    name: "Lipstick Tang",
    cost: { coral: 3, pearl: 1 },
    image: "assets/fish/lipstick-tang.svg?v=more50b",
    kind: "fish",
    rarity: 41,
  },
  {
    id: "scopas",
    name: "Scopas Tang",
    cost: { sand: 4, coral: 3, pearl: 1 },
    image: "assets/fish/scopas-tang.svg?v=more50b",
    kind: "fish",
    rarity: 42,
  },
  {
    id: "rockbeauty",
    name: "Rock Beauty",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/rock-beauty.svg?v=more50b",
    kind: "fish",
    rarity: 43,
  },
  {
    id: "lemonpeel",
    name: "Lemonpeel Angel",
    cost: { sand: 6, coral: 3, pearl: 1 },
    image: "assets/fish/lemonpeel-angel.svg?v=more50b",
    kind: "fish",
    rarity: 44,
  },
  {
    id: "biangel",
    name: "Bicolor Angel",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/bicolor-angel.svg?v=more50b",
    kind: "fish",
    rarity: 46,
  },
  {
    id: "christmas",
    name: "Christmas Wrasse",
    cost: { coral: 3, pearl: 1 },
    image: "assets/fish/christmas-wrasse.svg?v=more50b",
    kind: "fish",
    rarity: 47,
  },
  {
    id: "potter",
    name: "Potter's Angel",
    cost: { coral: 3, pearl: 2 },
    image: "assets/fish/potter-angel.svg?v=more50b",
    kind: "fish",
    rarity: 48,
  },
  {
    id: "semicircle",
    name: "Semicircle Angel",
    cost: { pearl: 2 },
    image: "assets/fish/semicircle-angel.svg?v=more50b",
    kind: "fish",
    rarity: 49,
  },
  {
    id: "kingangel",
    name: "King Angelfish",
    cost: { coral: 4, pearl: 2 },
    image: "assets/fish/king-angel.svg?v=more50b",
    kind: "fish",
    rarity: 50,
  },
  {
    id: "flamehawk",
    name: "Flame Hawkfish",
    cost: { coral: 4, pearl: 1 },
    image: "assets/fish/flame-hawkfish.svg?v=more50b",
    kind: "fish",
    rarity: 51,
  },
  {
    id: "arceye",
    name: "Arc-eye Hawkfish",
    cost: { pearl: 2 },
    image: "assets/fish/arceye-hawkfish.svg?v=more50b",
    kind: "fish",
    rarity: 52,
  },
  {
    id: "lagoon",
    name: "Lagoon Trigger",
    cost: { coral: 3, pearl: 2 },
    image: "assets/fish/lagoon-trigger.svg?v=more50b",
    kind: "fish",
    rarity: 53,
  },
  {
    id: "harlequin",
    name: "Harlequin Shrimp",
    cost: { pearl: 3 },
    image: "assets/fish/harlequin-shrimp.svg?v=more50b",
    kind: "fish",
    rarity: 54,
  },
  {
    id: "niger",
    name: "Niger Trigger",
    cost: { pearl: 2 },
    image: "assets/fish/niger-trigger.svg?v=more50b",
    kind: "fish",
    rarity: 55,
  },
  {
    id: "pompom",
    name: "Pom-Pom Crab",
    cost: { pearl: 2 },
    image: "assets/fish/pompom-crab.svg?v=more50b",
    kind: "fish",
    rarity: 56,
  },
  {
    id: "starry",
    name: "Starry Trigger",
    cost: { pearl: 2 },
    image: "assets/fish/starry-trigger.svg?v=more50b",
    kind: "fish",
    rarity: 58,
  },
  {
    id: "pinktail",
    name: "Pinktail Trigger",
    cost: { coral: 2, pearl: 2 },
    image: "assets/fish/pinktail-trigger.svg?v=more50b",
    kind: "fish",
    rarity: 59,
  },
  {
    id: "undulate",
    name: "Undulate Trigger",
    cost: { pearl: 3 },
    image: "assets/fish/undulate-trigger.svg?v=more50b",
    kind: "fish",
    rarity: 61,
  },
  {
    id: "crosshatch",
    name: "Crosshatch Trigger",
    cost: { pearl: 3 },
    image: "assets/fish/crosshatch-trigger.svg?v=more50b",
    kind: "fish",
    rarity: 63,
  },
  {
    id: "queentrig",
    name: "Queen Trigger",
    cost: { pearl: 3 },
    image: "assets/fish/queen-trigger.svg?v=more50b",
    kind: "fish",
    rarity: 65,
  },
  {
    id: "dragonwrasse",
    name: "Dragon Wrasse",
    cost: { pearl: 3 },
    image: "assets/fish/dragon-wrasse.svg?v=more50b",
    kind: "fish",
    rarity: 66,
  },
  {
    id: "flasher",
    name: "Carpenter Flasher",
    cost: { pearl: 3 },
    image: "assets/fish/carpenter-flasher.svg?v=more50b",
    kind: "fish",
    rarity: 68,
  },
  {
    id: "snowflake",
    name: "Snowflake Moray",
    cost: { pearl: 3 },
    image: "assets/fish/snowflake-moray.svg?v=more50b",
    kind: "fish",
    rarity: 70,
  },
  {
    id: "geometric",
    name: "Geometric Moray",
    cost: { pearl: 3 },
    image: "assets/fish/geometric-moray.svg?v=more50b",
    kind: "fish",
    rarity: 72,
  },
  {
    id: "dragonmoray",
    name: "Dragon Moray",
    cost: { pearl: 5, treasure: 3 },
    image: "assets/fish/dragon-moray.svg?v=more50b",
    kind: "fish",
    rarity: 117,
  },
  {
    id: "blackribbon",
    name: "Black Ribbon Eel",
    cost: { pearl: 6, treasure: 3 },
    image: "assets/fish/black-ribbon-eel.svg?v=more50b",
    kind: "fish",
    rarity: 118,
  },
  {
    id: "bandit",
    name: "Bandit Angelfish",
    cost: { pearl: 6, treasure: 4 },
    image: "assets/fish/bandit-angel.svg?v=more50b",
    kind: "fish",
    rarity: 119,
  },
  {
    id: "mccosker",
    name: "McCosker Flasher",
    cost: { pearl: 7, treasure: 4 },
    image: "assets/fish/mccosker-flasher.svg?v=more50b",
    kind: "fish",
    rarity: 120,
  },
  {
    id: "wunderpus",
    name: "Wunderpus",
    cost: { pearl: 8, treasure: 5 },
    image: "assets/fish/wunderpus.svg?v=more50b",
    kind: "fish",
    rarity: 121,
  },
  {
    id: "crystal",
    name: "Crystal Shrimp",
    cost: { pearl: 8, treasure: 6 },
    image: "assets/fish/crystal-shrimp.svg?v=ultra1",
    kind: "fish",
    rarity: 122,
    rarityName: "Ultra",
  },
  {
    id: "candywrasse",
    name: "Candy Wrasse",
    cost: { pearl: 8, treasure: 7 },
    image: "assets/fish/candy-wrasse.svg?v=ultra1",
    kind: "fish",
    rarity: 123,
    rarityName: "Ultra",
  },
  {
    id: "rubyanth",
    name: "Ruby Anthias",
    cost: { pearl: 9, treasure: 6 },
    image: "assets/fish/ruby-anthias.svg?v=ultra1",
    kind: "fish",
    rarity: 124,
    rarityName: "Ultra",
  },
  {
    id: "opal",
    name: "Opal Butterfly",
    cost: { pearl: 9, treasure: 7 },
    image: "assets/fish/opal-butterfly.svg?v=ultra1",
    kind: "fish",
    rarity: 125,
    rarityName: "Ultra",
  },
  {
    id: "prism",
    name: "Prism Tang",
    cost: { pearl: 9, treasure: 8 },
    image: "assets/fish/prism-tang.svg?v=ultra1",
    kind: "fish",
    rarity: 126,
    rarityName: "Ultra",
  },
  {
    id: "rainbowfin",
    name: "Rainbow Fin",
    cost: { pearl: 10, treasure: 7 },
    image: "assets/fish/rainbow-fin.svg?v=ultra1",
    kind: "fish",
    rarity: 127,
    rarityName: "Ultra",
  },
  {
    id: "embercrab",
    name: "Ember Crab",
    cost: { pearl: 10, treasure: 8 },
    image: "assets/fish/ember-crab.svg?v=ultra1",
    kind: "fish",
    rarity: 128,
    rarityName: "Ultra",
  },
  {
    id: "cloudray",
    name: "Cloud Ray",
    cost: { pearl: 10, treasure: 8 },
    image: "assets/fish/cloud-ray.svg?v=ultra1",
    kind: "fish",
    rarity: 129,
    rarityName: "Ultra",
  },
  {
    id: "moonlantern",
    name: "Moon Lantern",
    cost: { pearl: 11, treasure: 7 },
    image: "assets/fish/moon-lantern.svg?v=ultra1",
    kind: "fish",
    rarity: 130,
    rarityName: "Ultra",
  },
  {
    id: "starlight",
    name: "Starlight Seahorse",
    cost: { pearl: 11, treasure: 8 },
    image: "assets/fish/starlight-seahorse.svg?v=ultra1",
    kind: "fish",
    rarity: 131,
    rarityName: "Ultra",
  },
  {
    id: "velvet",
    name: "Velvet Angel",
    cost: { pearl: 11, treasure: 9 },
    image: "assets/fish/velvet-angel.svg?v=ultra1",
    kind: "fish",
    rarity: 132,
    rarityName: "Ultra",
  },
  {
    id: "sparknaut",
    name: "Spark Nautilus",
    cost: { pearl: 12, treasure: 8 },
    image: "assets/fish/spark-nautilus.svg?v=ultra1",
    kind: "fish",
    rarity: 133,
    rarityName: "Ultra",
  },
  {
    id: "sunburst",
    name: "Sunburst Puffer",
    cost: { pearl: 12, treasure: 9 },
    image: "assets/fish/sunburst-puffer.svg?v=ultra1",
    kind: "fish",
    rarity: 134,
    rarityName: "Ultra",
  },
  {
    id: "glacier",
    name: "Glacier Shark",
    cost: { pearl: 12, treasure: 9 },
    image: "assets/fish/glacier-shark.svg?v=ultra1",
    kind: "fish",
    rarity: 135,
    rarityName: "Ultra",
  },
  {
    id: "thundereel",
    name: "Thunder Eel",
    cost: { pearl: 13, treasure: 8 },
    image: "assets/fish/thunder-eel.svg?v=ultra1",
    kind: "fish",
    rarity: 136,
    rarityName: "Ultra",
  },
  {
    id: "pearlsea",
    name: "Pearl Seadragon",
    cost: { pearl: 13, treasure: 9 },
    image: "assets/fish/pearl-seadragon.svg?v=ultra1",
    kind: "fish",
    rarity: 137,
    rarityName: "Ultra",
  },
  {
    id: "galaxyeel",
    name: "Galaxy Eel",
    cost: { pearl: 13, treasure: 10 },
    image: "assets/fish/galaxy-eel.svg?v=ultra1",
    kind: "fish",
    rarity: 138,
    rarityName: "Ultra",
  },
  {
    id: "comet",
    name: "Comet Jelly",
    cost: { pearl: 14, treasure: 9 },
    image: "assets/fish/comet-jelly.svg?v=ultra1",
    kind: "fish",
    rarity: 139,
    rarityName: "Ultra",
  },
  {
    id: "aurora",
    name: "Aurora Ray",
    cost: { pearl: 14, treasure: 10 },
    image: "assets/fish/aurora-ray.svg?v=ultra1",
    kind: "fish",
    rarity: 140,
    rarityName: "Ultra",
  },
  {
    id: "nebula",
    name: "Nebula Octopus",
    cost: { pearl: 15, treasure: 10 },
    image: "assets/fish/nebula-octopus.svg?v=ultra1",
    kind: "fish",
    rarity: 141,
    rarityName: "Ultra",
  }
];

var DECOR_FOR_SALE = [
  { id: "leaf-big", name: "Big Green Leaf", cost: { sand: 3 }, rest: true, rarityName: "Uncommon" },
  { id: "leaf-little", name: "Little Leaf", cost: { sand: 2 }, rest: true, rarityName: "Common" },
  { id: "leaf-gold", name: "Golden Leaf", cost: { sand: 4 }, rest: true, rarityName: "Rare" },
  { id: "lily", name: "Lily Pad", cost: { sand: 4 }, rest: true, rarityName: "Rare" },
  { id: "lily-pink", name: "Pink Lily Pad", cost: { sand: 5 }, rest: true, rarityName: "Super Rare" },
  { id: "lily-spot", name: "Spotted Lily Pad", cost: { sand: 3, coral: 1 }, rest: true, rarityName: "Special" },
  { id: "rock", name: "Round Rock", cost: { sand: 3 }, rarityName: "Uncommon" },
  { id: "pebbles", name: "Pebble Pile", cost: { sand: 2 }, rarityName: "Common" },
  { id: "shell", name: "Spiral Shell", cost: { sand: 4 }, rarityName: "Rare" },
  { id: "sand-dollar", name: "Sand Dollar", cost: { sand: 4 }, rarityName: "Rare" },
  { id: "starfish", name: "Starfish", cost: { sand: 5 }, rarityName: "Super Rare" },
  { id: "coral", name: "Soft Coral", cost: { sand: 6 }, rarityName: "Epic" },
  { id: "seaweed", name: "Seaweed Patch", cost: { sand: 8 }, once: true, rarityName: "Legendary" },
  { id: "kelp", name: "Tall Kelp", cost: { sand: 5 }, rarityName: "Super Rare" },
  { id: "cave", name: "Small Cave", cost: { sand: 4, coral: 1 }, rarityName: "Special" },
  { id: "chest", name: "Treasure Chest", cost: { coral: 2, pearl: 1 }, rarityName: "Mythic" },
  { id: "bubbles", name: "Bubble Cluster", cost: { sand: 2 }, rarityName: "Common" },
  { id: "castle", name: "Sand Castle", cost: { sand: 6 }, rarityName: "Epic" },
  { id: "fan", name: "Fan Coral", cost: { sand: 3, coral: 1 }, rarityName: "Special" },
  { id: "anemone", name: "Friendly Anemone", cost: { sand: 5, coral: 1 }, rarityName: "Epic" },
  { id: "driftwood", name: "Driftwood", cost: { sand: 4 }, rarityName: "Rare" },
  { id: "anchor", name: "Little Anchor", cost: { sand: 4 }, rarityName: "Rare" },
  { id: "buoy", name: "Striped Buoy", cost: { sand: 3 }, rarityName: "Uncommon" },
  { id: "clam", name: "Open Clam", cost: { sand: 5 }, rarityName: "Super Rare" },
  { id: "sponge", name: "Sea Sponge", cost: { sand: 3 }, rarityName: "Uncommon" },
  { id: "bottle", name: "Message Bottle", cost: { sand: 2 }, rarityName: "Common" },
  { id: "conch", name: "Conch Shell", cost: { sand: 4, coral: 1 }, rarityName: "Special" },
  { id: "brain", name: "Brain Coral", cost: { sand: 6, coral: 1 }, rarityName: "Legendary" },
  { id: "oyster", name: "Pearl Oyster", cost: { coral: 2, pearl: 1 }, rarityName: "Mythic" },
];

var OUTFITS_FOR_SALE = [
  { id: "crown", name: "Tiny Crown", cost: { sand: 6, coral: 1 }, rarityName: "Legendary" },
  { id: "bow", name: "Pretty Bow", cost: { sand: 4 }, rarityName: "Uncommon" },
  { id: "scarf", name: "Striped Scarf", cost: { sand: 5 }, rarityName: "Rare" },
  { id: "star", name: "Shiny Star", cost: { sand: 3 }, rarityName: "Common" },
  { id: "sunglasses", name: "Sunglasses", cost: { sand: 4, coral: 1 }, rarityName: "Epic" },
  { id: "party", name: "Party Hat", cost: { sand: 5 }, rarityName: "Rare" },
  { id: "flower", name: "Flower", cost: { sand: 3 }, rarityName: "Common" },
  { id: "necklace", name: "Pearl Necklace", cost: { coral: 2, pearl: 1 }, rarityName: "Mythic" },
  { id: "captain", name: "Captain Hat", cost: { sand: 6, coral: 1 }, rarityName: "Legendary" },
  { id: "snorkel", name: "Snorkel", cost: { sand: 4 }, rarityName: "Uncommon" },
  { id: "bowtie", name: "Bow Tie", cost: { sand: 4 }, rarityName: "Uncommon" },
  { id: "halo", name: "Tiny Halo", cost: { sand: 2, coral: 1 }, rarityName: "Special" },
  { id: "backpack", name: "Tiny Backpack", cost: { sand: 5 }, rarityName: "Rare" },
  { id: "heart", name: "Heart Pin", cost: { sand: 3 }, rarityName: "Common" },
  { id: "pirate", name: "Pirate Hat", cost: { sand: 6 }, rarityName: "Super Rare" },
  { id: "vest", name: "Life Vest", cost: { sand: 4 }, rarityName: "Uncommon" },
  { id: "medal", name: "Gold Medal", cost: { sand: 5, coral: 1 }, rarityName: "Epic" },
  { id: "beanie", name: "Cozy Beanie", cost: { sand: 3 }, rarityName: "Common" },
  { id: "mask", name: "Eye Mask", cost: { sand: 4 }, rarityName: "Uncommon" },
  { id: "wand", name: "Bubble Wand", cost: { sand: 5 }, rarityName: "Rare" },
];

// Fish food. Higher energy fills more hunger. Full is ENERGY_MAX.
var ENERGY_MAX = 6;
var RACE_ENERGY_COST = 2;

var FOOD_FOR_SALE = [
  {
    id: "crumbs",
    name: "Tiny Crumbs",
    cost: { sand: 2 },
    kind: "food",
    rarity: 1,
    rarityName: "Common",
    energy: 1,
    help: "Fills a little",
  },
  {
    id: "flakes",
    name: "Yummy Flakes",
    cost: { sand: 5 },
    kind: "food",
    rarity: 18,
    rarityName: "Uncommon",
    energy: 2,
    help: "Fills some",
  },
  {
    id: "salad",
    name: "Sea Salad",
    cost: { sand: 4, coral: 1 },
    kind: "food",
    rarity: 36,
    rarityName: "Rare",
    energy: 4,
    help: "Fills a lot",
  },
  {
    id: "feast",
    name: "Reef Feast",
    cost: { coral: 2, pearl: 1 },
    kind: "food",
    rarity: 90,
    rarityName: "Epic",
    energy: 6,
    help: "Fills all the way",
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
  return { coins: emptyCoins(), fishCounts: {}, decor: [], outfits: [], foods: {}, fishEnergy: {} };
}

function ensureExtras(wallet) {
  if (!wallet.foods || typeof wallet.foods !== "object" || Array.isArray(wallet.foods)) {
    wallet.foods = {};
  }
  if (!wallet.fishEnergy || typeof wallet.fishEnergy !== "object" || Array.isArray(wallet.fishEnergy)) {
    wallet.fishEnergy = {};
  }
  return wallet;
}

function energyMapFromSaved(obj) {
  var map = {};
  var id;
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return map;
  }
  for (id in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, id)) {
      var n = coinAmount(obj[id]);
      if (n > ENERGY_MAX) {
        n = ENERGY_MAX;
      }
      map[id] = n;
    }
  }
  return map;
}

function energyOf(wallet, fishId) {
  ensureExtras(wallet);
  if (typeof wallet.fishEnergy[fishId] !== "number") {
    return ENERGY_MAX;
  }
  var n = wallet.fishEnergy[fishId];
  if (n < 0) {
    return 0;
  }
  if (n > ENERGY_MAX) {
    return ENERGY_MAX;
  }
  return n;
}

function energyWord(amount) {
  if (amount <= 0) {
    return "Hungry";
  }
  if (amount >= ENERGY_MAX) {
    return "Full";
  }
  if (amount >= 3) {
    return "OK";
  }
  return "A little hungry";
}

function findFood(foodId) {
  var i;
  for (i = 0; i < FOOD_FOR_SALE.length; i += 1) {
    if (FOOD_FOR_SALE[i].id === foodId) {
      return FOOD_FOR_SALE[i];
    }
  }
  return null;
}

function foodCount(foodId) {
  var wallet = getWallet();
  ensureExtras(wallet);
  return wallet.foods[foodId] || 0;
}

function buyFood(foodId) {
  var food = findFood(foodId);
  if (!food) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  ensureExtras(wallet);
  var cost = food.cost || {};
  if (!hasCoins(wallet, cost)) {
    return { ok: false, reason: "coins", need: coinsShortText(wallet, cost) };
  }
  takeCoins(wallet, cost);
  wallet.foods[foodId] = (wallet.foods[foodId] || 0) + 1;
  saveWallet(wallet);
  return { ok: true, food: food, count: wallet.foods[foodId] };
}

function sellFood(foodId) {
  var food = findFood(foodId);
  if (!food) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  ensureExtras(wallet);
  var owned = wallet.foods[foodId] || 0;
  if (owned < 1) {
    return { ok: false, reason: "none" };
  }
  var refund = sellPriceFor(food);
  addSellCoins(wallet, refund);
  owned -= 1;
  if (owned > 0) {
    wallet.foods[foodId] = owned;
  } else {
    delete wallet.foods[foodId];
  }
  saveWallet(wallet);
  return { ok: true, food: food, count: owned, priceText: formatCoinCost(refund) };
}

function sprinkleFood(foodId, fishId) {
  var food = findFood(foodId);
  var fish = findFish(fishId);
  if (!food || !fish) {
    return { ok: false, reason: "missing", message: "Pick a food and a fish." };
  }
  var wallet = getWallet();
  ensureExtras(wallet);
  if ((wallet.fishCounts[fishId] || 0) < 1) {
    return { ok: false, reason: "nofish", message: "You do not have that fish." };
  }
  if ((wallet.foods[foodId] || 0) < 1) {
    return { ok: false, reason: "nofood", message: "You need to buy that food." };
  }
  var before = energyOf(wallet, fishId);
  if (before >= ENERGY_MAX) {
    return { ok: false, reason: "full", message: fish.name + " is already full!" };
  }
  var gained = food.energy;
  var after = before + gained;
  if (after > ENERGY_MAX) {
    gained = ENERGY_MAX - before;
    after = ENERGY_MAX;
  }
  wallet.foods[foodId] -= 1;
  if (wallet.foods[foodId] <= 0) {
    delete wallet.foods[foodId];
  }
  wallet.fishEnergy[fishId] = after;
  saveWallet(wallet);
  var message;
  if (before <= 0 && after > 0) {
    message = fish.name + " can swim again!";
  } else if (after >= ENERGY_MAX) {
    message = fish.name + " is full!";
  } else {
    message = fish.name + " got " + gained + " more energy.";
  }
  return { ok: true, before: before, after: after, gained: gained, message: message };
}

function spendEnergy(fishId, amount) {
  var wallet = getWallet();
  if ((wallet.fishCounts[fishId] || 0) < 1) {
    return energyOf(wallet, fishId);
  }
  var next = energyOf(wallet, fishId) - amount;
  if (next < 0) {
    next = 0;
  }
  ensureExtras(wallet);
  wallet.fishEnergy[fishId] = next;
  saveWallet(wallet);
  return next;
}

function tickSwimEnergy() {
  var wallet = getWallet();
  var id;
  var changed = false;
  ensureExtras(wallet);
  for (id in wallet.fishCounts) {
    if (!Object.prototype.hasOwnProperty.call(wallet.fishCounts, id)) {
      continue;
    }
    if ((wallet.fishCounts[id] || 0) > 0 && energyOf(wallet, id) > 0) {
      wallet.fishEnergy[id] = energyOf(wallet, id) - 1;
      changed = true;
    }
  }
  if (changed) {
    saveWallet(wallet);
  }
  return changed;
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
      foods: countsFromObject(data.foods),
      fishEnergy: energyMapFromSaved(data.fishEnergy),
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

var ANDREW_TREASURE2_GIFT_FLAG = "codereef_gift_treasure2_andrew";

// Give Andrew 2 Treasure coins the first time his wallet loads. It does not cost coins.
function giftAndrewTreasure2Once(wallet) {
  if (signedInKidName() !== "andrew") {
    return wallet;
  }
  if (localStorage.getItem(ANDREW_TREASURE2_GIFT_FLAG)) {
    return wallet;
  }
  if (!wallet.coins) {
    wallet.coins = emptyCoins();
  }
  wallet.coins.treasure = (wallet.coins.treasure || 0) + 2;
  saveWallet(wallet);
  localStorage.setItem(ANDREW_TREASURE2_GIFT_FLAG, "1");
  return wallet;
}

var AARON_ULTRA4_GIFT_FLAG = "codereef_gift_ultra4_aaron";

// Give Aaron four Ultra fish the first time his wallet loads. They do not cost coins.
function giftAaronUltra4Once(wallet) {
  if (signedInKidName() !== "aaron") {
    return wallet;
  }
  if (localStorage.getItem(AARON_ULTRA4_GIFT_FLAG)) {
    return wallet;
  }
  var gifts = ["crystal", "candywrasse", "rubyanth", "opal"];
  var i;
  for (i = 0; i < gifts.length; i += 1) {
    var fishId = gifts[i];
    wallet.fishCounts[fishId] = (wallet.fishCounts[fishId] || 0) + 1;
  }
  saveWallet(wallet);
  localStorage.setItem(AARON_ULTRA4_GIFT_FLAG, "1");
  return wallet;
}

function getWallet() {
  var raw = localStorage.getItem(walletKidKey());
  if (!raw) {
    return rememberWallet(
      giftAaronUltra4Once(giftAndrewTreasure2Once(giftAndrewStingrayOnce(removeAndrewMantaOnce(emptyWallet()))))
    );
  }
  try {
    var data = JSON.parse(raw);
    var loaded = walletFromSaved(data);
    if (loaded.migrated) {
      saveWallet(loaded.wallet);
    }
    return rememberWallet(
      giftAaronUltra4Once(giftAndrewTreasure2Once(giftAndrewStingrayOnce(removeAndrewMantaOnce(loaded.wallet))))
    );
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
  if (window.CodeReefCloud && typeof CodeReefCloud.pushBag === "function") {
    CodeReefCloud.pushBag();
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
  ensureExtras(wallet);
  if (!wallet.fishCounts[fishId]) {
    wallet.fishEnergy[fishId] = ENERGY_MAX;
  }
  wallet.fishCounts[fishId] = (wallet.fishCounts[fishId] || 0) + 1;
  saveWallet(wallet);
  return { ok: true, fish: fish, count: wallet.fishCounts[fishId] };
}

// About half of each buy coin, rounded down.
// 1 Pearl or 1 Treasure still gives that coin back, because half of 1 is 0.
// If that would pay the whole price, one rare coin is left out.
// If nothing is left, they get 1 Sand. Buying and selling does not make free coins.
function sellPriceFor(fish) {
  var refund = {};
  var any = false;
  var i;
  var cost = fish && fish.cost ? fish.cost : {};
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var id = COIN_ORDER[i];
    var paid = cost[id] || 0;
    var half = Math.floor(paid / 2);
    if (half < 1 && paid > 0 && (id === "pearl" || id === "treasure")) {
      half = 1;
    }
    if (half > 0) {
      refund[id] = half;
      any = true;
    }
  }
  if (!any) {
    refund.sand = 1;
    return refund;
  }
  var same = true;
  for (i = 0; i < COIN_ORDER.length; i += 1) {
    var coinId = COIN_ORDER[i];
    if ((refund[coinId] || 0) !== (cost[coinId] || 0)) {
      same = false;
    }
  }
  if (same) {
    for (i = COIN_ORDER.length - 1; i >= 0; i -= 1) {
      var cutId = COIN_ORDER[i];
      if ((refund[cutId] || 0) > 0) {
        refund[cutId] -= 1;
        if (refund[cutId] < 1) {
          delete refund[cutId];
        }
        break;
      }
    }
    any = false;
    for (i = 0; i < COIN_ORDER.length; i += 1) {
      if ((refund[COIN_ORDER[i]] || 0) > 0) {
        any = true;
      }
    }
    if (!any) {
      refund.sand = 1;
    }
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

function ownDecor(decorId) {
  return decorCount(decorId) > 0;
}

// Another copy is fine. Old decorations stay.
function buyDecor(decorId) {
  var item = findDecor(decorId);
  if (!item) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (!Array.isArray(wallet.decor)) {
    wallet.decor = [];
  }
  var cost = item.cost || {};
  if (!hasCoins(wallet, cost)) {
    return { ok: false, reason: "coins", need: coinsShortText(wallet, cost) };
  }
  takeCoins(wallet, cost);
  wallet.decor.push(decorId);
  saveWallet(wallet);
  return { ok: true, decor: item, count: decorCount(decorId) };
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

// Take costumes off a fish type, but keep them owned.
// fishId becomes "" when nobody is wearing that copy.
function unwearFish(wallet, fishId) {
  var worn = wallet.outfits || [];
  var removedId = "";
  var i;
  for (i = 0; i < worn.length; i += 1) {
    if (worn[i] && worn[i].fishId === fishId) {
      if (!removedId && worn[i].outfitId) {
        removedId = worn[i].outfitId;
      }
      worn[i].fishId = "";
    }
  }
  wallet.outfits = worn;
  return removedId;
}

// Selling a fish does not throw the costume away.
// If that kind of fish is all gone, the costume comes off and stays owned.
function dropOneOutfit(wallet, fishId) {
  var still = wallet.fishCounts[fishId] || 0;
  if (still > 0) {
    return;
  }
  unwearFish(wallet, fishId);
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
  takeCoins(wallet, cost);
  // A fish wears one costume. A new copy stays in the wallet if this fish is busy.
  var busy = costumeOnFish(wallet, fishId);
  wallet.outfits.push({ fishId: busy ? "" : fishId, outfitId: outfitId });
  saveWallet(wallet);
  return {
    ok: true,
    outfit: outfit,
    fish: fish,
    count: outfitCount(outfitId),
    onFish: !busy,
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

// The costume this kind of fish is wearing, or "" if none.
// Copies of the same fish share it. One costume stays on one kind of fish.
function wornOutfitForFish(fishId) {
  var worn = getWallet().outfits || [];
  var i;
  for (i = 0; i < worn.length; i += 1) {
    if (worn[i] && worn[i].fishId === fishId && worn[i].outfitId) {
      return worn[i].outfitId;
    }
  }
  return "";
}

function outfitIsOnFish(outfitId, fishId) {
  var worn = getWallet().outfits || [];
  var i;
  for (i = 0; i < worn.length; i += 1) {
    if (worn[i] && worn[i].outfitId === outfitId && worn[i].fishId === fishId) {
      return true;
    }
  }
  return false;
}

function fishWearingOutfit(outfitId) {
  var worn = getWallet().outfits || [];
  var list = [];
  var seen = {};
  var i;
  for (i = 0; i < worn.length; i += 1) {
    if (worn[i] && worn[i].outfitId === outfitId && worn[i].fishId && !seen[worn[i].fishId]) {
      seen[worn[i].fishId] = true;
      var fish = findFish(worn[i].fishId);
      if (fish) {
        list.push(fish);
      }
    }
  }
  return list;
}

// The costume already on this kind of fish, or "" if none.
function costumeOnFish(wallet, fishId) {
  var worn = (wallet && wallet.outfits) || [];
  var i;
  for (i = 0; i < worn.length; i += 1) {
    if (worn[i] && worn[i].fishId === fishId && worn[i].outfitId) {
      return worn[i].outfitId;
    }
  }
  return "";
}

// Put one owned copy on this kind of fish.
// A fish can wear only one costume. Take the old one off before a new one goes on.
// A free copy can go on a different fish. If every copy is worn, one moves to the new fish.
function putOutfitOn(outfitId, fishId) {
  var outfit = findOutfit(outfitId);
  var fish = findFish(fishId);
  if (!outfit || !fish) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if ((wallet.fishCounts[fishId] || 0) < 1) {
    return { ok: false, reason: "nofish" };
  }
  if (!Array.isArray(wallet.outfits)) {
    wallet.outfits = [];
  }
  var copies = [];
  var i;
  for (i = 0; i < wallet.outfits.length; i += 1) {
    if (wallet.outfits[i] && wallet.outfits[i].outfitId === outfitId) {
      copies.push(i);
    }
  }
  if (copies.length < 1) {
    return { ok: false, reason: "none" };
  }
  for (i = 0; i < copies.length; i += 1) {
    if (wallet.outfits[copies[i]].fishId === fishId) {
      return { ok: true, outfit: outfit, fish: fish, already: true };
    }
  }
  if (costumeOnFish(wallet, fishId)) {
    return { ok: false, reason: "wearing" };
  }
  var pick = -1;
  for (i = 0; i < copies.length; i += 1) {
    if (!wallet.outfits[copies[i]].fishId) {
      pick = copies[i];
      break;
    }
  }
  if (pick < 0) {
    pick = copies[0];
  }
  var fromId = wallet.outfits[pick].fishId;
  wallet.outfits[pick].fishId = fishId;
  saveWallet(wallet);
  var movedOff = fromId ? findFish(fromId) : null;
  return { ok: true, outfit: outfit, fish: fish, movedOff: movedOff };
}

// Costume stays owned. It just is not on a fish.
function takeOutfitOff(outfitId, fishId) {
  var outfit = findOutfit(outfitId);
  if (!outfit) {
    return { ok: false, reason: "missing" };
  }
  var wallet = getWallet();
  if (!Array.isArray(wallet.outfits)) {
    return { ok: false, reason: "none" };
  }
  var i;
  for (i = 0; i < wallet.outfits.length; i += 1) {
    var row = wallet.outfits[i];
    if (!row || row.outfitId !== outfitId || !row.fishId) {
      continue;
    }
    if (fishId && row.fishId !== fishId) {
      continue;
    }
    var fromFish = findFish(row.fishId);
    row.fishId = "";
    saveWallet(wallet);
    return { ok: true, outfit: outfit, fish: fromFish };
  }
  return { ok: false, reason: "none" };
}

function nextWornOutfit(fishId, cursor) {
  if (cursor && typeof cursor === "object") {
    cursor[fishId] = (cursor[fishId] || 0) + 1;
  }
  return wornOutfitForFish(fishId);
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

// Where outfits sit on each fish picture.
// Numbers are percents of the picture. 0 is the left edge or the top.
// hx hy = hat, ex ey = eyes, nx ny = neck, bx by = body, kx ky = back.
// hs and bs are how big the hat and the body clothes are.
function wearPct(n) {
  return Math.round(n) + "%";
}

function wearFit(o) {
  return {
    shape: o.shape || "side",
    pic: o.pic || "1",
    hx: wearPct(o.hx),
    hy: wearPct(o.hy),
    ex: wearPct(o.ex),
    ey: wearPct(o.ey),
    nx: wearPct(o.nx),
    ny: wearPct(o.ny),
    bx: wearPct(o.bx),
    by: wearPct(o.by),
    kx: wearPct(o.kx),
    ky: wearPct(o.ky),
    hs: o.hs || "1",
    bs: o.bs || "1",
    ew: o.ew || "1",
  };
}

// Most fish face left. headX is the front of the head. eyeY is the eyes.
function wearSide(headX, eyeY, shape, hs, bs) {
  return wearFit({
    shape: shape || "side",
    hx: headX + 4,
    hy: eyeY - 14,
    ex: headX + 5,
    ey: eyeY,
    nx: headX + 14,
    ny: eyeY + 7,
    bx: 48,
    by: eyeY + 2,
    kx: 66,
    ky: eyeY - 2,
    hs: hs,
    bs: bs,
  });
}

// Drawn fish (SVG) use a wide picture, not a square.
function wearSvg(eyeX, eyeY, shape, hs, bs) {
  return wearFit({
    shape: shape || "side",
    pic: "1.8182",
    hx: eyeX - 3,
    hy: eyeY - 14,
    ex: eyeX,
    ey: eyeY,
    nx: eyeX + 9,
    ny: eyeY + 9,
    bx: 46,
    by: 52,
    kx: 64,
    ky: eyeY,
    hs: hs,
    bs: bs,
    ew: "0.85",
  });
}

var FISH_WEAR = {
  neon: wearSvg(25, 46),
  guppy: wearSide(19, 47),
  chromis: wearSvg(27, 45),
  damsel: wearSide(18, 50),
  platy: wearSvg(26, 45),
  humbug: wearSvg(27, 45),
  goldie: wearSide(20, 50),
  molly: wearSvg(25, 45),
  cory: wearSvg(27, 51),
  cardinal: wearSide(26, 48),
  crab: wearFit({
    shape: "crab",
    pic: "1.8182",
    hx: 50,
    hy: 34,
    ex: 50,
    ey: 54,
    nx: 50,
    ny: 64,
    bx: 50,
    by: 60,
    kx: 70,
    ky: 56,
    hs: "0.9",
    bs: "1",
  }),
  sunny: wearSide(18, 49),
  betta: wearSide(20, 49),
  gramma: wearSvg(27, 45),
  blenny: wearSvg(20, 49),
  cleaner: wearSvg(27, 45),
  jelly: wearFit({
    shape: "bell",
    pic: "1.8182",
    hx: 50,
    hy: 14,
    ex: 49,
    ey: 44,
    nx: 50,
    ny: 56,
    bx: 50,
    by: 50,
    kx: 70,
    ky: 38,
    hs: "1",
    bs: "0.9",
  }),
  firefish: wearSvg(27, 45),
  goby: wearSvg(25, 47),
  bubbles: wearSide(21, 54),
  banggai: wearSvg(27, 45),
  bluey: wearSide(21, 51),
  flutter: wearSide(22, 53),
  sixline: wearSvg(24, 45),
  snapper: wearSide(19, 50),
  anthias: wearSvg(27, 45),
  banner: wearSide(16, 57),
  glow: wearSide(16, 50),
  hawk: wearSvg(27, 45),
  grouper: wearSide(18, 50, "round", "1", "1.1"),
  foxface: wearSvg(27, 45),
  koi: wearSide(20, 50),
  discus: wearSide(21, 50, "round", "1", "1.2"),
  flame: wearSvg(27, 45),
  angel: wearSide(18, 53),
  beauty: wearSvg(27, 47),
  powder: wearSvg(27, 45),
  sailfin: wearSvg(27, 45),
  copperband: wearSvg(27, 45),
  parrot: wearSide(19, 49),
  idol: wearSide(15, 57),
  puffer: wearFit({
    shape: "round",
    hx: 28,
    hy: 32,
    ex: 26,
    ey: 48,
    nx: 36,
    ny: 56,
    bx: 46,
    by: 52,
    kx: 68,
    ky: 46,
    hs: "0.95",
    bs: "1.2",
  }),
  seahorse: wearFit({
    shape: "tall",
    hx: 48,
    hy: 18,
    ex: 40,
    ey: 30,
    nx: 50,
    ny: 40,
    bx: 52,
    by: 58,
    kx: 66,
    ky: 46,
    hs: "0.85",
    bs: "0.9",
  }),
  mandarin: wearSide(16, 51),
  stingray: wearFit({
    shape: "flat",
    hx: 22,
    hy: 40,
    ex: 24,
    ey: 56,
    nx: 34,
    ny: 60,
    bx: 48,
    by: 56,
    kx: 66,
    ky: 44,
    hs: "0.75",
    bs: "1.2",
  }),
  moray: wearFit({
    shape: "long",
    hx: 18,
    hy: 38,
    ex: 22,
    ey: 48,
    nx: 30,
    ny: 54,
    bx: 48,
    by: 50,
    kx: 72,
    ky: 48,
    hs: "0.85",
    bs: "0.75",
  }),
  porcupine: wearSvg(27, 45, "round", "0.95", "1.15"),
  trigger: wearSide(19, 50),
  picasso: wearSvg(27, 45),
  french: wearSvg(27, 45),
  turtle: wearFit({
    shape: "shell",
    hx: 17,
    hy: 28,
    ex: 20,
    ey: 40,
    nx: 30,
    ny: 48,
    bx: 56,
    by: 42,
    kx: 70,
    ky: 36,
    hs: "0.7",
    bs: "1.15",
  }),
  octopus: wearFit({
    shape: "bell",
    hx: 40,
    hy: 16,
    ex: 32,
    ey: 34,
    nx: 40,
    ny: 52,
    bx: 42,
    by: 56,
    kx: 56,
    ky: 28,
    hs: "1.05",
    bs: "1",
    ew: "0.62",
  }),
  emperor: wearSvg(27, 45),
  unicorn: wearFit({
    shape: "side",
    pic: "1.8182",
    hx: 42,
    hy: 40,
    ex: 27,
    ey: 45,
    nx: 36,
    ny: 54,
    bx: 46,
    by: 52,
    kx: 64,
    ky: 46,
    hs: "0.7",
    bs: "1",
  }),
  cuda: wearFit({
    shape: "long",
    hx: 24,
    hy: 40,
    ex: 26,
    ey: 48,
    nx: 34,
    ny: 52,
    bx: 48,
    by: 50,
    kx: 62,
    ky: 48,
    hs: "0.75",
    bs: "0.65",
  }),
  lion: wearSide(20, 52, "side", "0.85", "0.85"),
  dragon: wearSvg(27, 49),
  shark: wearFit({
    shape: "long",
    hx: 20,
    hy: 38,
    ex: 22,
    ey: 50,
    nx: 30,
    ny: 56,
    bx: 48,
    by: 50,
    kx: 64,
    ky: 46,
    hs: "0.85",
    bs: "0.7",
  }),
  sword: wearFit({
    shape: "long",
    hx: 26,
    hy: 38,
    ex: 28,
    ey: 48,
    nx: 36,
    ny: 54,
    bx: 50,
    by: 50,
    kx: 68,
    ky: 48,
    hs: "0.8",
    bs: "0.65",
  }),
  manta: wearFit({
    shape: "flat",
    hx: 36,
    hy: 32,
    ex: 34,
    ey: 42,
    nx: 42,
    ny: 50,
    bx: 50,
    by: 54,
    kx: 62,
    ky: 46,
    hs: "0.8",
    bs: "1.15",
  }),
  whale: wearFit({
    shape: "long",
    pic: "1.8182",
    hx: 22,
    hy: 32,
    ex: 24,
    ey: 45,
    nx: 34,
    ny: 54,
    bx: 42,
    by: 52,
    kx: 58,
    ky: 46,
    hs: "0.9",
    bs: "0.8",
  }),
  squirrel: wearSvg(27, 45),
  soldier: wearSvg(28, 45),
  convict: wearSvg(27, 47),
  shrimp: wearSvg(31, 47),
  pipe: wearSvg(23, 50, "long", "0.85", "0.7"),
  flashlight: wearSvg(28, 44),
  garden: wearFit({
    shape: "tall",
    pic: "1.8182",
    hx: 16,
    hy: 16,
    ex: 19,
    ey: 32,
    nx: 28,
    ny: 44,
    bx: 42,
    by: 58,
    kx: 64,
    ky: 40,
    hs: "0.8",
    bs: "0.85",
  }),
  kole: wearSvg(27, 47),
  robin: wearSvg(27, 45),
  longnose: wearSvg(39, 45),
  bird: wearSvg(28, 45),
  frogfish: wearSvg(30, 49, "round", "0.95", "1.15"),
  flying: wearSvg(27, 49),
  boxfish: wearSvg(31, 51, "round", "0.95", "1.15"),
  batfish: wearSvg(32, 49, "round", "1", "1.1"),
  bunny: wearSvg(39, 54, "round", "0.9", "1.1"),
  purple: wearSvg(27, 47),
  dancer: wearSvg(25, 49, "flat", "0.8", "1.1"),
  gurnard: wearSvg(28, 49),
  achilles: wearSvg(28, 47),
  cowfish: wearSvg(33, 51, "round", "0.9", "1.15"),
  tusk: wearSvg(27, 45),
  humuhumu: wearSvg(30, 45),
  ribbon: wearSvg(22, 53, "long", "0.85", "0.7"),
  regal: wearSvg(28, 47),
  bluespot: wearSvg(30, 49, "flat", "0.75", "1.15"),
  pygmy: wearSvg(31, 44, "tall", "0.85", "0.9"),
  weedy: wearSvg(24, 49, "long", "0.85", "0.75"),
  cuttle: wearSvg(42, 49),
  nautilus: wearSvg(30, 49, "round", "0.9", "1"),
  mantis: wearSvg(33, 44, "side", "0.85", "0.9"),
  eagle: wearSvg(28, 47, "flat", "0.75", "1.15"),
  hammer: wearSvg(16, 35, "long", "0.8", "0.7"),
  sunfish: wearSvg(27, 47, "round", "0.95", "1.2"),
  oar: wearSvg(19, 56, "long", "0.8", "0.65"),
  coela: wearSvg(27, 47),
  pompano: wearSvg(27, 45),
  lookdown: wearSvg(30, 42),
  wahoo: wearSvg(24, 47, "long", "0.8", "0.7"),
  mahi: wearSvg(25, 44),
  threadfin: wearSvg(27, 45),
  masked: wearSvg(28, 45),
  clarion: wearSvg(28, 46, "round", "0.95", "1.1"),
  peppermint: wearSvg(28, 46, "round", "0.95", "1.1"),
  dory: wearSvg(30, 47, "round", "0.95", "1.15"),
  opah: wearSvg(30, 47, "round", "0.95", "1.2"),
  pinecone: wearSvg(28, 47, "round", "0.9", "1.1"),
  stargaze: wearSvg(32, 35, "flat", "0.8", "1.1"),
  scorpion: wearSvg(27, 47),
  stone: wearSvg(28, 49, "round", "0.9", "1.15"),
  leafscorp: wearSvg(30, 47),
  sargassum: wearSvg(28, 47, "round", "0.9", "1.1"),
  psyche: wearSvg(31, 49, "round", "0.95", "1.15"),
  decorator: wearSvg(38, 44, "round", "0.9", "1.05"),
  leopard: wearSvg(31, 46, "long", "0.85", "0.7"),
  zebra: wearSvg(31, 47, "long", "0.85", "0.7"),
  epaulette: wearSvg(32, 47, "long", "0.85", "0.75"),
  blueshark: wearSvg(30, 45, "long", "0.8", "0.65"),
  mako: wearSvg(29, 45, "long", "0.85", "0.7"),
  basking: wearSvg(35, 44, "long", "0.85", "0.7"),
  cookie: wearSvg(30, 49, "round", "0.9", "1"),
  wobbe: wearSvg(38, 49, "flat", "0.75", "1.15"),
  lantern: wearSvg(25, 47),
  hatchet: wearSvg(30, 44, "round", "0.9", "1.15"),
  viper: wearSvg(27, 45, "long", "0.8", "0.7"),
  deepdragon: wearSvg(25, 46, "long", "0.8", "0.7"),
  frilled: wearSvg(25, 47, "long", "0.8", "0.65"),
  saw: wearSvg(42, 49, "flat", "0.75", "1.1"),
  thresher: wearSvg(32, 45, "long", "0.8", "0.7"),
  goblin: wearSvg(39, 45, "long", "0.85", "0.7"),
  mega: wearSvg(42, 35, "round", "0.95", "1.15"),
  angler: wearSvg(32, 49, "round", "0.95", "1.15"),
  gulper: wearSvg(22, 41, "long", "0.8", "0.65"),
  pelican: wearSvg(18, 45, "long", "0.75", "0.6"),
  snipe: wearSvg(18, 49, "long", "0.75", "0.55"),
  barrel: wearSvg(38, 44, "round", "0.9", "1.1"),
  dumbo: wearSvg(42, 49, "bell", "1", "0.95"),
  vampire: wearSvg(38, 44, "bell", "0.95", "1"),
  bluering: wearSvg(40, 41, "bell", "1", "1"),
  mimic: wearSvg(40, 42, "bell", "1", "1"),
  flamboyant: wearSvg(38, 47),
  paper: wearSvg(30, 49, "round", "0.9", "1"),
  sail: wearSvg(32, 49, "long", "0.75", "0.65"),
  marlin: wearSvg(35, 47, "long", "0.75", "0.65"),
  giant: wearSvg(42, 41, "bell", "0.9", "0.9"),
  colossal: wearSvg(40, 44, "round", "0.95", "1.1"),

  emerald: wearSvg(39, 35, "round", "0.9", "1.1"),
  cleanershrimp: wearSvg(31, 47),
  tomini: wearSvg(27, 45),
  pajama: wearSvg(24, 47),
  neongoby: wearSvg(24, 47),
  clowngoby: wearSvg(24, 47),
  bandedshrimp: wearSvg(31, 47),
  fireshrimp: wearSvg(31, 47),
  purpfire: wearSvg(24, 47),
  blackcap: wearSvg(24, 49),
  swissguard: wearSvg(24, 47),
  orchid: wearSvg(24, 47),
  chevron: wearSvg(27, 45),
  arrowcrab: wearSvg(42, 46, "side", "0.75", "0.9"),
  sunrise: wearSvg(24, 47),
  horseshoe: wearSvg(28, 45, "flat", "0.8", "1.15"),
  bifox: wearSvg(30, 47),
  melanurus: wearSvg(26, 47),
  magfox: wearSvg(30, 47),
  sohal: wearSvg(27, 45),
  naso: wearSvg(27, 45),
  lipstick: wearSvg(27, 45),
  scopas: wearSvg(27, 45),
  rockbeauty: wearSvg(27, 45, "round", "0.95", "1.1"),
  lemonpeel: wearSvg(28, 45, "round", "0.95", "1.1"),
  biangel: wearSvg(27, 45, "round", "0.95", "1.1"),
  christmas: wearSvg(26, 47),
  potter: wearSvg(27, 45, "round", "0.95", "1.1"),
  semicircle: wearSvg(27, 45, "round", "0.95", "1.1"),
  kingangel: wearSvg(28, 46, "round", "0.95", "1.1"),
  flamehawk: wearSvg(25, 45),
  arceye: wearSvg(25, 47),
  lagoon: wearSvg(27, 47),
  harlequin: wearSvg(31, 45),
  niger: wearSvg(27, 47),
  pompom: wearSvg(39, 35, "round", "0.9", "1.1"),
  starry: wearSvg(27, 47),
  pinktail: wearSvg(27, 47),
  undulate: wearSvg(27, 47),
  crosshatch: wearSvg(27, 47),
  queentrig: wearSvg(27, 45),
  dragonwrasse: wearSvg(26, 47),
  flasher: wearSvg(26, 47),
  snowflake: wearSvg(22, 53, "long", "0.85", "0.7"),
  geometric: wearSvg(22, 53, "long", "0.85", "0.7"),
  dragonmoray: wearSvg(22, 53, "long", "0.85", "0.7"),
  blackribbon: wearSvg(22, 53, "long", "0.85", "0.7"),
  bandit: wearSvg(27, 45, "round", "0.95", "1.1"),
  mccosker: wearSvg(26, 47),
  wunderpus: wearSvg(44, 49, "bell", "1", "0.95"),

  crystal: wearSvg(31, 47),
  candywrasse: wearSvg(26, 47),
  rubyanth: wearSvg(24, 47),
  opal: wearSvg(27, 45),
  prism: wearSvg(27, 45),
  rainbowfin: wearSvg(24, 45),
  embercrab: wearSvg(39, 35, "round", "0.9", "1.1"),
  cloudray: wearSvg(28, 47, "flat", "0.75", "1.15"),
  moonlantern: wearSvg(25, 47),
  starlight: wearSvg(31, 36, "tall", "0.85", "0.9"),
  velvet: wearSvg(28, 46, "round", "0.95", "1.1"),
  sparknaut: wearSvg(30, 49, "round", "0.9", "1"),
  sunburst: wearSvg(30, 47, "round", "0.95", "1.2"),
  glacier: wearSvg(27, 47, "long", "0.85", "0.7"),
  thundereel: wearSvg(16, 48, "long", "0.8", "0.65"),
  pearlsea: wearSvg(24, 36, "long", "0.85", "0.75"),
  galaxyeel: wearSvg(16, 47, "long", "0.8", "0.65"),
  comet: wearSvg(28, 49, "bell", "0.95", "1"),
  aurora: wearSvg(30, 49, "flat", "0.75", "1.15"),
  nebula: wearSvg(33, 45, "bell", "1", "0.95"),
};

function reefFishWear(fish) {
  if (FISH_WEAR[fish.id]) {
    return FISH_WEAR[fish.id];
  }
  if (fish.image && fish.image.indexOf(".svg") !== -1) {
    return wearSvg(27, 45);
  }
  return wearSide(18, 49);
}

// HTML for a swimming fish. The picture is the whole fish.
// The frame matches the picture, so outfits land on the fish, not the empty margin.
function reefFishMarkup(fish, outfitId) {
  var kind = fish.kind || "fish";
  var wear = reefFishWear(fish);
  var outfit = "";
  if (outfitId) {
    outfit =
      '<span class="reef-outfit reef-outfit--' + outfitId + '" aria-hidden="true"></span>';
  }
  var style =
    "--pic:" +
    wear.pic +
    ";--hx:" +
    wear.hx +
    ";--hy:" +
    wear.hy +
    ";--ex:" +
    wear.ex +
    ";--ey:" +
    wear.ey +
    ";--nx:" +
    wear.nx +
    ";--ny:" +
    wear.ny +
    ";--bx:" +
    wear.bx +
    ";--by:" +
    wear.by +
    ";--kx:" +
    wear.kx +
    ";--ky:" +
    wear.ky +
    ";--hs:" +
    wear.hs +
    ";--bs:" +
    wear.bs +
    ";--ew:" +
    wear.ew;
  return (
    '<span class="reef-fish reef-fish--' +
    kind +
    " reef-wear--" +
    wear.shape +
    '">' +
    '<span class="reef-fish__wiggle">' +
    '<span class="reef-fish__frame" style="' +
    style +
    '">' +
    '<img class="reef-fish__img" src="' +
    fish.image +
    '" alt="" />' +
    outfit +
    "</span></span></span>"
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
