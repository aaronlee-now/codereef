// Reef wallet — coins and fish for each kid (saved in this browser).
// Clear names so kids can follow the code.

var COINS_PER_PRIZE = 5;

var FISH_FOR_SALE = [
  {
    id: "sunny",
    name: "Clownfish",
    price: 10,
    image: "assets/fish/clownfish.png?v=shop3",
  },
  {
    id: "bluey",
    name: "Blue Tang",
    price: 15,
    image: "assets/fish/blue-tang.png?v=shop3",
  },
  {
    id: "bubbles",
    name: "Yellow Tang",
    price: 12,
    image: "assets/fish/yellow-tang.png?v=shop3",
  },
  {
    id: "glow",
    name: "Fairy Wrasse",
    price: 20,
    image: "assets/fish/fairy-wrasse.png?v=shop3",
  },
];

var DECOR_FOR_SALE = [
  {
    id: "seaweed",
    name: "Seaweed Patch",
    price: 8,
  },
];

function walletKidKey() {
  var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  var kid = user && user.kidName ? String(user.kidName).toLowerCase() : "guest";
  return "codereef_wallet_" + kid;
}

function emptyWallet() {
  return { coins: 0, fish: [], decor: [] };
}

function getWallet() {
  var raw = localStorage.getItem(walletKidKey());
  if (!raw) {
    return emptyWallet();
  }
  try {
    var data = JSON.parse(raw);
    return {
      coins: typeof data.coins === "number" ? data.coins : 0,
      fish: Array.isArray(data.fish) ? data.fish : [],
      decor: Array.isArray(data.decor) ? data.decor : [],
    };
  } catch (err) {
    return emptyWallet();
  }
}

function saveWallet(wallet) {
  localStorage.setItem(walletKidKey(), JSON.stringify(wallet));
}

function addCoins(amount) {
  var wallet = getWallet();
  wallet.coins += amount;
  saveWallet(wallet);
  return wallet.coins;
}

function spendCoins(amount) {
  var wallet = getWallet();
  if (wallet.coins < amount) {
    return false;
  }
  wallet.coins -= amount;
  saveWallet(wallet);
  return true;
}

function ownFish(fishId) {
  var wallet = getWallet();
  return wallet.fish.indexOf(fishId) !== -1;
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
  if (ownFish(fishId)) {
    return { ok: false, reason: "owned" };
  }
  if (!spendCoins(fish.price)) {
    return { ok: false, reason: "coins" };
  }
  var wallet = getWallet();
  wallet.fish.push(fishId);
  saveWallet(wallet);
  return { ok: true, fish: fish };
}

// Free fish (trail rare prize) — does not spend coins. Shop still uses buyFish.
function grantFish(fishId) {
  var fish = findFish(fishId);
  if (!fish) {
    return { ok: false, reason: "missing" };
  }
  if (ownFish(fishId)) {
    return { ok: false, reason: "owned" };
  }
  var wallet = getWallet();
  wallet.fish.push(fishId);
  saveWallet(wallet);
  return { ok: true, fish: fish };
}

function listUnownedFish() {
  var list = [];
  var i;
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    if (!ownFish(FISH_FOR_SALE[i].id)) {
      list.push(FISH_FOR_SALE[i]);
    }
  }
  return list;
}

function pickRandomUnownedFish() {
  var list = listUnownedFish();
  if (list.length === 0) {
    return null;
  }
  var index = Math.floor(Math.random() * list.length);
  return list[index];
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
  if (!spendCoins(item.price)) {
    return { ok: false, reason: "coins" };
  }
  var wallet = getWallet();
  wallet.decor.push(decorId);
  saveWallet(wallet);
  return { ok: true, decor: item };
}

function getOwnedFishList() {
  var wallet = getWallet();
  var list = [];
  var i;
  for (i = 0; i < wallet.fish.length; i += 1) {
    var fish = findFish(wallet.fish[i]);
    if (fish) {
      list.push(fish);
    }
  }
  return list;
}

// Friendly pop-up when you earn coins on the trail.
function showCoinToast(amount) {
  var old = document.getElementById("coin-toast");
  if (old) {
    old.remove();
  }
  var toast = document.createElement("div");
  toast.id = "coin-toast";
  toast.className = "coin-toast";
  toast.setAttribute("role", "status");
  toast.textContent = "You earned " + amount + " coins!";
  document.body.appendChild(toast);
  window.setTimeout(function () {
    toast.classList.add("is-gone");
    window.setTimeout(function () {
      toast.remove();
    }, 400);
  }, 2200);
}

// Big celebration when a rare trail fish is found.
function showRareFishToast(fishName) {
  var old = document.getElementById("coin-toast");
  if (old) {
    old.remove();
  }
  var toast = document.createElement("div");
  toast.id = "coin-toast";
  toast.className = "coin-toast coin-toast--rare";
  toast.setAttribute("role", "status");
  toast.textContent = "Rare! You found a " + fishName + "!";
  document.body.appendChild(toast);
  window.setTimeout(function () {
    toast.classList.add("is-gone");
    window.setTimeout(function () {
      toast.remove();
    }, 400);
  }, 3200);
}
