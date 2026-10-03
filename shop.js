// Fish Shop — buy and sell fish, decorations, and outfits.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var gridEl = document.getElementById("shop-grid");
var coinsEl = document.getElementById("shop-coins");
var msgEl = document.getElementById("shop-msg");
var resumeEl = document.getElementById("shop-resume");

function lessonToResume() {
  if (typeof CodeReefProgress !== "undefined" && CodeReefProgress.getLastPath) {
    var last = CodeReefProgress.getLastPath();
    if (last && last.href) {
      return last.href;
    }
  }
  return "explore.html";
}

if (resumeEl) {
  resumeEl.href = lessonToResume();
}

function fishPreviewHtml(fish, outfitId) {
  if (typeof reefFishMarkup === "function") {
    return reefFishMarkup(fish, outfitId);
  }
  return (
    '<span class="reef-fish">' +
    '<img class="reef-fish__img" src="' +
    fish.image +
    '" alt="' +
    fish.name +
    '" />' +
    "</span>"
  );
}

function seaweedPreviewHtml() {
  return (
    '<span class="shop-decor-preview" aria-hidden="true">' +
    '<span class="shop-decor-preview__leaf"></span>' +
    '<span class="shop-decor-preview__leaf"></span>' +
    '<span class="shop-decor-preview__leaf"></span>' +
    "</span>"
  );
}

function showMsg(text, kind) {
  msgEl.textContent = text;
  msgEl.className = "shop-msg" + (kind ? " shop-msg--" + kind : "");
}

function refreshCoins() {
  var wallet = getWallet();
  coinsEl.textContent = formatCoinSummary(wallet.coins);
}

function makeBuyButton(label, disabled) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-card__btn";
  btn.textContent = label;
  btn.disabled = !!disabled;
  return btn;
}

function addSellButton(actions, item, kind) {
  var priceText = formatCoinCost(sellPriceFor(item));
  var sellBtn = makeBuyButton("Sell for " + priceText, false);
  sellBtn.classList.add("shop-card__btn--sell");
  sellBtn.addEventListener("click", function () {
    openSellCheck(item, kind);
  });
  actions.appendChild(sellBtn);
}

function addFishCard(fish) {
  var card = document.createElement("article");
  card.className = "shop-card";
  card.setAttribute("role", "listitem");

  var preview = document.createElement("div");
  preview.className = "shop-card__preview";
  preview.innerHTML = fishPreviewHtml(fish);

  var name = document.createElement("h2");
  name.className = "shop-card__name";
  name.textContent = fish.name;

  var price = document.createElement("p");
  price.className = "shop-card__price";
  price.textContent = formatCoinCost(fish.cost);

  var have = document.createElement("p");
  have.className = "shop-card__have";
  have.textContent = "You have " + fishCount(fish.id);

  var btn = makeBuyButton("Buy", false);
  var actions = document.createElement("div");
  actions.className = "shop-card__actions";

  btn.addEventListener("click", function () {
    if (totalFishCount() >= MAX_FISH) {
      openReplaceChooser(fish);
      return;
    }
    var result = buyFish(fish.id);
    if (result.ok) {
      if (totalFishCount() >= MAX_FISH) {
        showMsg(
          "Yay! " + fish.name + " is yours! Your aquarium is full (" + MAX_FISH + " fish).",
          "ok"
        );
      } else {
        showMsg("Yay! " + fish.name + " is yours! You have " + result.count + ".", "ok");
      }
      buildShop();
      return;
    }
    if (result.reason === "full") {
      openReplaceChooser(fish);
      return;
    }
    if (result.reason === "coins") {
      showMsg("Not enough yet. You need " + result.need + ".", "need");
      return;
    }
    showMsg("Hmm, that fish is not in the shop.", "need");
  });

  actions.appendChild(btn);
  if (fishCount(fish.id) > 0) {
    addSellButton(actions, fish, "fish");
  }

  card.appendChild(preview);
  card.appendChild(name);
  card.appendChild(price);
  card.appendChild(have);
  card.appendChild(actions);
  gridEl.appendChild(card);
}

function decorPreviewHtml(item) {
  if (typeof decorShapeHtml === "function") {
    return decorShapeHtml(item.id);
  }
  return seaweedPreviewHtml();
}

function addDecorCard(item) {
  var card = document.createElement("article");
  card.className = "shop-card";
  card.setAttribute("role", "listitem");

  var preview = document.createElement("div");
  preview.className = "shop-card__preview";
  preview.innerHTML = decorPreviewHtml(item);

  var name = document.createElement("h2");
  name.className = "shop-card__name";
  name.textContent = item.name;

  var price = document.createElement("p");
  price.className = "shop-card__price";
  price.textContent = formatCoinCost(item.cost);

  var haveN = typeof decorCount === "function" ? decorCount(item.id) : 0;
  var cap = item.once ? 1 : 6;
  var full = haveN >= cap;

  var have = document.createElement("p");
  have.className = "shop-card__have";
  have.textContent = "You have " + haveN;

  var btn = makeBuyButton(full ? (item.once ? "You own this!" : "That's enough!") : "Buy", full);

  btn.addEventListener("click", function () {
    var result = buyDecor(item.id);
    if (result.ok) {
      showMsg("Nice! " + item.name + " is in your aquarium. You have " + result.count + ".", "ok");
      buildShop();
      return;
    }
    if (result.reason === "owned") {
      showMsg("You already have this decoration!", "ok");
      return;
    }
    if (result.reason === "max") {
      showMsg("You have enough of those!", "ok");
      return;
    }
    if (result.reason === "coins") {
      showMsg("Not enough yet. You need " + result.need + ".", "need");
      return;
    }
    showMsg("That decoration is not for sale.", "need");
  });

  var actions = document.createElement("div");
  actions.className = "shop-card__actions";
  actions.appendChild(btn);
  if (haveN > 0) {
    addSellButton(actions, item, "decor");
  }

  card.appendChild(preview);
  card.appendChild(name);
  card.appendChild(price);
  card.appendChild(have);
  card.appendChild(actions);
  gridEl.appendChild(card);
}

function outfitDemoHtml(outfitId) {
  return (
    '<span class="shop-outfit-demo">' +
    '<span class="shop-outfit-demo__body"></span>' +
    '<span class="reef-outfit reef-outfit--' +
    outfitId +
    '" aria-hidden="true"></span>' +
    "</span>"
  );
}

function ownedFishForShop() {
  var list = [];
  var i;
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    if (fishCount(FISH_FOR_SALE[i].id) > 0) {
      list.push(FISH_FOR_SALE[i]);
    }
  }
  return list;
}

function openOutfitPicks(item, preview, picks) {
  var choices = ownedFishForShop();
  if (choices.length === 0) {
    showMsg("You need a fish first.", "need");
    picks.innerHTML = "";
    return;
  }
  picks.innerHTML = "";
  var ask = document.createElement("p");
  ask.className = "shop-card__ask";
  ask.textContent = "Put it on which fish?";
  picks.appendChild(ask);
  preview.innerHTML = fishPreviewHtml(choices[0], item.id);
  var i;
  for (i = 0; i < choices.length; i += 1) {
    (function (fish) {
      var pick = document.createElement("button");
      pick.type = "button";
      pick.className = "shop-card__pick";
      var n = fishCount(fish.id);
      pick.textContent = n > 1 ? fish.name + " (" + n + ")" : fish.name;
      pick.addEventListener("click", function () {
        preview.innerHTML = fishPreviewHtml(fish, item.id);
        var result = buyOutfit(item.id, fish.id);
        if (result.ok) {
          showMsg(item.name + " is on your " + fish.name + "!", "ok");
          buildShop();
          return;
        }
        if (result.reason === "nofish") {
          showMsg("You need a fish first.", "need");
          return;
        }
        if (result.reason === "coins") {
          showMsg("Not enough yet. You need " + result.need + ".", "need");
          return;
        }
        if (result.reason === "none") {
          showMsg("You need that fish first.", "need");
          return;
        }
        showMsg("That outfit is not for sale.", "need");
      });
      picks.appendChild(pick);
    })(choices[i]);
  }
}

function wearStatusText(item) {
  var wearers = typeof fishWearingOutfit === "function" ? fishWearingOutfit(item.id) : [];
  if (wearers.length === 0) {
    return "Nobody wears it yet.";
  }
  if (wearers.length === 1) {
    return "Your " + wearers[0].name + " wears the " + item.name + ".";
  }
  var names = [];
  var i;
  for (i = 0; i < wearers.length; i += 1) {
    names.push(wearers[i].name);
  }
  var last = names.pop();
  return "Your " + names.join(", ") + " and " + last + " wear the " + item.name + ".";
}

function fillWearChoices(item, preview, picks) {
  picks.innerHTML = "";
  var ask = document.createElement("p");
  ask.className = "shop-card__ask";
  ask.textContent = "Who wears this?";
  picks.appendChild(ask);

  var status = document.createElement("p");
  status.className = "shop-card__have";
  var choices = ownedFishForShop();
  if (choices.length === 0) {
    status.textContent = "Buy a fish first.";
    picks.appendChild(status);
    return;
  }
  status.textContent = wearStatusText(item);
  picks.appendChild(status);

  var wearers = typeof fishWearingOutfit === "function" ? fishWearingOutfit(item.id) : [];
  if (wearers.length > 0) {
    preview.innerHTML = fishPreviewHtml(wearers[0], item.id);
  }

  var i;
  for (i = 0; i < choices.length; i += 1) {
    (function (fish) {
      var wearing = typeof outfitIsOnFish === "function" && outfitIsOnFish(item.id, fish.id);
      var row = document.createElement("div");
      row.className = "shop-card__wear-row";
      var who = document.createElement("span");
      who.className = "shop-card__ask";
      who.textContent = fish.name;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-card__pick";
      btn.textContent = wearing ? "Take it off" : "Put it on";
      btn.addEventListener("click", function () {
        if (wearing) {
          var off = takeOutfitOff(item.id, fish.id);
          if (off.ok) {
            showMsg("The " + item.name + " came off your " + fish.name + ".", "ok");
            buildShop();
            return;
          }
          showMsg("That costume is not on your " + fish.name + ".", "need");
          return;
        }
        preview.innerHTML = fishPreviewHtml(fish, item.id);
        var result = putOutfitOn(item.id, fish.id);
        if (result.ok) {
          var line = "Your " + fish.name + " wears the " + item.name + ".";
          if (result.removed) {
            line += " The " + result.removed.name + " came off.";
          }
          showMsg(line, "ok");
          buildShop();
          return;
        }
        if (result.reason === "nofish") {
          showMsg("You need that fish first.", "need");
          return;
        }
        showMsg("You need that costume first.", "need");
      });
      row.appendChild(who);
      row.appendChild(btn);
      picks.appendChild(row);
    })(choices[i]);
  }
}

function addOutfitCard(item) {
  var card = document.createElement("article");
  card.className = "shop-card";
  card.setAttribute("role", "listitem");

  var ownedN = typeof outfitCount === "function" ? outfitCount(item.id) : 0;
  var preview = document.createElement("div");
  preview.className = "shop-card__preview";
  preview.innerHTML = outfitDemoHtml(item.id);

  var name = document.createElement("h2");
  name.className = "shop-card__name";
  name.textContent = item.name;

  var price = document.createElement("p");
  price.className = "shop-card__price";
  price.textContent = formatCoinCost(item.cost);

  var have = document.createElement("p");
  have.className = "shop-card__have";
  have.textContent = "You have " + ownedN;

  var picks = document.createElement("div");
  picks.className = "shop-card__picks";

  var wear = document.createElement("div");
  wear.className = "shop-card__wear";

  var btn = makeBuyButton("Buy", false);
  btn.addEventListener("click", function () {
    openOutfitPicks(item, preview, picks);
  });

  var actions = document.createElement("div");
  actions.className = "shop-card__actions";
  actions.appendChild(btn);
  if (ownedN > 0) {
    addSellButton(actions, item, "outfit");
    fillWearChoices(item, preview, wear);
  }

  card.appendChild(preview);
  card.appendChild(name);
  card.appendChild(price);
  card.appendChild(have);
  card.appendChild(actions);
  card.appendChild(picks);
  card.appendChild(wear);
  gridEl.appendChild(card);
}

var sureEl = document.getElementById("shop-sure");
var sureTextEl = document.getElementById("shop-sure-text");
var sureYesEl = document.getElementById("shop-sure-yes");
var sureNoEl = document.getElementById("shop-sure-no");
var replaceEl = document.getElementById("shop-replace");
var replaceTextEl = document.getElementById("shop-replace-text");
var replaceWantEl = document.getElementById("shop-replace-want");
var replaceListEl = document.getElementById("shop-replace-list");
var replaceNeedEl = document.getElementById("shop-replace-need");
var replaceNoEl = document.getElementById("shop-replace-no");
var pendingSellId = null;
var pendingSellKind = "fish";
var pendingBuyId = null;
var pendingGiveUpId = null;

function shopOwnedCount(kind, id) {
  if (kind === "decor") {
    return typeof decorCount === "function" ? decorCount(id) : 0;
  }
  if (kind === "outfit") {
    return typeof outfitCount === "function" ? outfitCount(id) : 0;
  }
  return fishCount(id);
}

function closeSellCheck() {
  pendingSellId = null;
  pendingSellKind = "fish";
  pendingGiveUpId = null;
  if (sureYesEl) {
    sureYesEl.textContent = "Yes, sell";
  }
  if (sureEl) {
    sureEl.hidden = true;
  }
}

function closeReplaceChooser() {
  pendingBuyId = null;
  closeSellCheck();
  if (replaceNeedEl) {
    replaceNeedEl.textContent = "";
  }
  if (replaceEl) {
    replaceEl.hidden = true;
  }
}

function openReplaceChooser(fish) {
  if (!replaceEl || !fish) {
    return;
  }
  closeSellCheck();
  pendingBuyId = fish.id;
  replaceTextEl.textContent =
    "Your aquarium is full (" +
    MAX_FISH +
    " fish). Replace one fish, or don't buy. If you replace a fish, you get the coins that fish costs, then you pay for the new fish.";
  replaceWantEl.innerHTML = "";
  var wantPreview = document.createElement("div");
  wantPreview.className = "shop-replace__preview";
  wantPreview.innerHTML = fishPreviewHtml(fish);
  var wantName = document.createElement("p");
  wantName.className = "shop-replace__want-name";
  wantName.textContent =
    "You want the " + fish.name + ". It costs " + formatCoinCost(fish.cost) + ".";
  replaceWantEl.appendChild(wantPreview);
  replaceWantEl.appendChild(wantName);

  replaceListEl.innerHTML = "";
  var i;
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    var owned = FISH_FOR_SALE[i];
    var count = fishCount(owned.id);
    if (count < 1) {
      continue;
    }
    replaceListEl.appendChild(makeReplaceRow(owned, count));
  }
  replaceNeedEl.textContent = "";
  replaceEl.hidden = false;
  replaceNoEl.focus();
}

function makeReplaceRow(owned, count) {
  var row = document.createElement("button");
  row.type = "button";
  row.className = "shop-replace__fish";
  var pic = document.createElement("span");
  pic.className = "shop-replace__pic";
  pic.innerHTML = fishPreviewHtml(owned);
  var info = document.createElement("span");
  info.className = "shop-replace__info";
  var title = document.createElement("span");
  title.className = "shop-replace__name";
  title.textContent = owned.name;
  var have = document.createElement("span");
  have.className = "shop-replace__have";
  have.textContent = "You have " + count;
  var back = document.createElement("span");
  back.className = "shop-replace__back";
  back.textContent =
    "If you replace the " + owned.name + ", you get " + formatCoinCost(owned.cost) + " back";
  info.appendChild(title);
  info.appendChild(have);
  info.appendChild(back);
  row.appendChild(pic);
  row.appendChild(info);
  row.addEventListener("click", function () {
    askReplace(owned);
  });
  return row;
}

function askReplace(giveUp) {
  var incoming = findFish(pendingBuyId);
  if (!incoming || !giveUp || !sureEl) {
    return;
  }
  if (replaceNeedEl) {
    replaceNeedEl.textContent = "";
  }
  pendingGiveUpId = giveUp.id;
  sureYesEl.textContent = "Yes, replace";
  sureTextEl.textContent =
    "Are you sure? If you replace the " +
    giveUp.name +
    ", you get " +
    formatCoinCost(giveUp.cost) +
    " back, then you pay " +
    formatCoinCost(incoming.cost) +
    " for the " +
    incoming.name +
    ".";
  sureEl.hidden = false;
  sureNoEl.focus();
}

function confirmReplace() {
  var buyId = pendingBuyId;
  var giveUpId = pendingGiveUpId;
  pendingGiveUpId = null;
  if (sureEl) {
    sureEl.hidden = true;
  }
  if (sureYesEl) {
    sureYesEl.textContent = "Yes, sell";
  }
  if (!buyId || !giveUpId) {
    return;
  }
  var result = replaceFish(giveUpId, buyId);
  if (result.ok) {
    closeReplaceChooser();
    showMsg(
      "You replaced the " +
        result.gaveUp.name +
        "! You got " +
        result.refundText +
        " back, then paid " +
        result.priceText +
        " for the " +
        result.fish.name +
        ".",
      "ok"
    );
    buildShop();
    return;
  }
  if (result.reason === "coins") {
    var needText =
      "Not enough yet. You still need " + result.need + ". Your fish stay the same.";
    if (replaceNeedEl) {
      replaceNeedEl.textContent = needText;
    }
    showMsg(needText, "need");
    return;
  }
  if (result.reason === "none") {
    showMsg("You do not have that fish to replace.", "need");
    openReplaceChooser(findFish(buyId));
    return;
  }
  showMsg("Hmm, that fish is not in the shop.", "need");
}

function openSellCheck(item, kind) {
  var sellKind = kind || "fish";
  if (!sureEl || !item || shopOwnedCount(sellKind, item.id) < 1) {
    return;
  }
  var priceText = formatCoinCost(sellPriceFor(item));
  pendingGiveUpId = null;
  pendingSellKind = sellKind;
  pendingSellId = item.id;
  if (sureYesEl) {
    sureYesEl.textContent = "Yes, sell";
  }
  sureTextEl.textContent =
    "Are you sure you want to sell the " + item.name + " for " + priceText + "?";
  sureEl.hidden = false;
  sureNoEl.focus();
}

function confirmSell() {
  var itemId = pendingSellId;
  var kind = pendingSellKind || "fish";
  closeSellCheck();
  if (!itemId) {
    return;
  }
  var result;
  if (kind === "decor") {
    result = sellDecor(itemId);
  } else if (kind === "outfit") {
    result = sellOutfit(itemId);
  } else {
    result = sellFish(itemId);
  }
  if (result.ok) {
    if (kind === "outfit" && result.fish) {
      showMsg(
        "Sold! The " +
          result.outfit.name +
          " came off your " +
          result.fish.name +
          ". You got " +
          result.priceText +
          " back. You have " +
          result.count +
          ".",
        "ok"
      );
    } else {
      showMsg(
        "Sold! You got " + result.priceText + " back. You have " + result.count + ".",
        "ok"
      );
    }
    buildShop();
    return;
  }
  if (result.reason === "none") {
    if (kind === "decor") {
      showMsg("You do not have that decoration to sell.", "need");
    } else if (kind === "outfit") {
      showMsg("You do not have that outfit to sell.", "need");
    } else {
      showMsg("You do not have that fish to sell.", "need");
    }
    buildShop();
    return;
  }
  if (kind === "decor") {
    showMsg("That decoration is not for sale.", "need");
  } else if (kind === "outfit") {
    showMsg("That outfit is not for sale.", "need");
  } else {
    showMsg("Hmm, that fish is not in the shop.", "need");
  }
}

function onSureYes() {
  if (pendingGiveUpId) {
    confirmReplace();
    return;
  }
  confirmSell();
}

if (sureYesEl) {
  sureYesEl.addEventListener("click", onSureYes);
}
if (sureNoEl) {
  sureNoEl.addEventListener("click", closeSellCheck);
}
if (sureEl) {
  sureEl.addEventListener("click", function (event) {
    if (event.target === sureEl) {
      closeSellCheck();
    }
  });
}
if (replaceNoEl) {
  replaceNoEl.addEventListener("click", closeReplaceChooser);
}
if (replaceEl) {
  replaceEl.addEventListener("click", function (event) {
    if (event.target === replaceEl) {
      closeReplaceChooser();
    }
  });
}
document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") {
    return;
  }
  if (sureEl && !sureEl.hidden) {
    closeSellCheck();
    return;
  }
  if (replaceEl && !replaceEl.hidden) {
    closeReplaceChooser();
  }
});

var shopTab = "all";
var tabsEl = document.getElementById("shop-tabs");

function buildShop() {
  gridEl.innerHTML = "";
  var showFish = shopTab === "all" || shopTab === "fish";
  var showDecor = shopTab === "all" || shopTab === "decor";
  var showOutfit = shopTab === "all" || shopTab === "outfit";
  var i;
  if (showFish) {
    for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
      addFishCard(FISH_FOR_SALE[i]);
    }
  }
  if (showDecor) {
    for (i = 0; i < DECOR_FOR_SALE.length; i += 1) {
      addDecorCard(DECOR_FOR_SALE[i]);
    }
  }
  if (showOutfit && typeof OUTFITS_FOR_SALE !== "undefined") {
    for (i = 0; i < OUTFITS_FOR_SALE.length; i += 1) {
      addOutfitCard(OUTFITS_FOR_SALE[i]);
    }
  }
  refreshCoins();
}

if (tabsEl) {
  tabsEl.addEventListener("click", function (event) {
    var btn = event.target.closest ? event.target.closest(".shop-tab") : null;
    if (!btn || !tabsEl.contains(btn)) {
      return;
    }
    var name = btn.getAttribute("data-shop-tab");
    if (!name || name === shopTab) {
      return;
    }
    shopTab = name;
    var buttons = tabsEl.querySelectorAll(".shop-tab");
    var b;
    for (b = 0; b < buttons.length; b += 1) {
      var on = buttons[b] === btn;
      buttons[b].classList.toggle("is-on", on);
      buttons[b].setAttribute("aria-selected", on ? "true" : "false");
    }
    buildShop();
  });
}

buildShop();
