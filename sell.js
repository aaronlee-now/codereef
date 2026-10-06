// Sell items — one copy at a time, for about half the shop price.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var gridEl = document.getElementById("sell-grid");
var coinsEl = document.getElementById("sell-coins");
var msgEl = document.getElementById("sell-msg");
var emptyEl = document.getElementById("sell-empty");
var sureEl = document.getElementById("sell-sure");
var surePayEl = document.getElementById("sell-sure-pay");
var sureYesEl = document.getElementById("sell-sure-yes");
var sureNoEl = document.getElementById("sell-sure-no");
var pending = null;

function showMsg(text, kind) {
  msgEl.textContent = text;
  msgEl.className = "shop-msg" + (kind ? " shop-msg--" + kind : "");
}

function refreshCoins() {
  coinsEl.textContent = formatCoinSummary(getWallet().coins);
}

function youGetText(item) {
  return "You get " + formatCoinCost(sellPriceFor(item));
}

function fishPreview(fish) {
  var worn = typeof wornOutfitForFish === "function" ? wornOutfitForFish(fish.id) : "";
  if (typeof reefFishMarkup === "function") {
    return reefFishMarkup(fish, worn);
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

function outfitPreview(outfitId) {
  return (
    '<span class="shop-outfit-demo">' +
    '<span class="shop-outfit-demo__body"></span>' +
    '<span class="reef-outfit reef-outfit--' +
    outfitId +
    '" aria-hidden="true"></span>' +
    "</span>"
  );
}

function addSellCard(item, kind, count, previewHtml) {
  var card = document.createElement("article");
  card.className = "shop-card";
  card.setAttribute("role", "listitem");

  var preview = document.createElement("div");
  preview.className = "shop-card__preview";
  preview.innerHTML = previewHtml;

  var name = document.createElement("h2");
  name.className = "shop-card__name";
  name.textContent = item.name;

  var pay = document.createElement("p");
  pay.className = "shop-card__price";
  pay.textContent = youGetText(item);

  var have = document.createElement("p");
  have.className = "shop-card__have";
  have.textContent = "You have " + count;

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-card__btn shop-card__btn--sell";
  btn.textContent = "Sell";
  btn.addEventListener("click", function () {
    openSure(item, kind);
  });

  card.appendChild(preview);
  card.appendChild(name);
  card.appendChild(pay);
  card.appendChild(have);
  card.appendChild(btn);
  gridEl.appendChild(card);
}

function closeSure() {
  pending = null;
  if (sureEl) {
    sureEl.hidden = true;
  }
}

function openSure(item, kind) {
  if (!sureEl || !item) {
    return;
  }
  pending = { id: item.id, kind: kind };
  surePayEl.textContent = youGetText(item) + ".";
  sureEl.hidden = false;
  sureNoEl.focus();
}

function confirmSell() {
  var item = pending;
  closeSure();
  if (!item) {
    return;
  }
  var result;
  if (item.kind === "decor") {
    result = sellDecor(item.id);
  } else if (item.kind === "outfit") {
    result = sellOutfit(item.id);
  } else if (item.kind === "food") {
    result = sellFood(item.id);
  } else {
    result = sellFish(item.id);
  }
  if (result.ok) {
    if (item.kind === "outfit" && result.fish) {
      showMsg(
        "Sold! It came off your " + result.fish.name + ". You got " + result.priceText + ".",
        "ok"
      );
    } else {
      showMsg("Sold! You got " + result.priceText + ".", "ok");
    }
    buildSell();
    return;
  }
  showMsg("You do not have that to sell.", "need");
  buildSell();
}

function buildSell() {
  gridEl.innerHTML = "";
  var any = false;
  var i;

  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    var fish = FISH_FOR_SALE[i];
    var fishN = fishCount(fish.id);
    if (fishN > 0) {
      any = true;
      addSellCard(fish, "fish", fishN, fishPreview(fish));
    }
  }

  if (typeof DECOR_FOR_SALE !== "undefined") {
    for (i = 0; i < DECOR_FOR_SALE.length; i += 1) {
      var decor = DECOR_FOR_SALE[i];
      var decorN = typeof decorCount === "function" ? decorCount(decor.id) : 0;
      if (decorN > 0) {
        any = true;
        var decorHtml =
          typeof decorShapeHtml === "function" ? decorShapeHtml(decor.id) : "";
        addSellCard(decor, "decor", decorN, decorHtml);
      }
    }
  }

  if (typeof OUTFITS_FOR_SALE !== "undefined") {
    for (i = 0; i < OUTFITS_FOR_SALE.length; i += 1) {
      var outfit = OUTFITS_FOR_SALE[i];
      var outfitN = typeof outfitCount === "function" ? outfitCount(outfit.id) : 0;
      if (outfitN > 0) {
        any = true;
        addSellCard(outfit, "outfit", outfitN, outfitPreview(outfit.id));
      }
    }
  }

  if (typeof FOOD_FOR_SALE !== "undefined") {
    for (i = 0; i < FOOD_FOR_SALE.length; i += 1) {
      var food = FOOD_FOR_SALE[i];
      var foodN = typeof foodCount === "function" ? foodCount(food.id) : 0;
      if (foodN > 0) {
        any = true;
        addSellCard(
          food,
          "food",
          foodN,
          '<span class="shop-food-dot shop-food-dot--' + food.id + '" aria-hidden="true"></span>'
        );
      }
    }
  }

  emptyEl.hidden = any;
  refreshCoins();
}

if (sureYesEl) {
  sureYesEl.addEventListener("click", confirmSell);
}
if (sureNoEl) {
  sureNoEl.addEventListener("click", closeSure);
}
if (sureEl) {
  sureEl.addEventListener("click", function (event) {
    if (event.target === sureEl) {
      closeSure();
    }
  });
}
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && sureEl && !sureEl.hidden) {
    closeSure();
  }
});

buildSell();
