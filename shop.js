// Fish Shop — buy fish (and one seaweed) with coins.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var gridEl = document.getElementById("shop-grid");
var coinsEl = document.getElementById("shop-coins");
var msgEl = document.getElementById("shop-msg");

function fishPreviewHtml(fish) {
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
  coinsEl.textContent = wallet.coins + " coins";
}

function makeBuyButton(label, disabled) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-card__btn";
  btn.textContent = label;
  btn.disabled = !!disabled;
  return btn;
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
  price.textContent = fish.price + " coins";

  var owned = ownFish(fish.id);
  var btn = makeBuyButton(owned ? "You own this!" : "Buy", owned);

  btn.addEventListener("click", function () {
    var result = buyFish(fish.id);
    if (result.ok) {
      showMsg("Yay! " + fish.name + " is yours!", "ok");
      btn.textContent = "You own this!";
      btn.disabled = true;
      refreshCoins();
      return;
    }
    if (result.reason === "owned") {
      showMsg("You already have this fish!", "ok");
      return;
    }
    if (result.reason === "coins") {
      showMsg("Need more coins — finish tasks and earn coins on the trail!", "need");
      return;
    }
    showMsg("Hmm, that fish is not in the shop.", "need");
  });

  card.appendChild(preview);
  card.appendChild(name);
  card.appendChild(price);
  card.appendChild(btn);
  gridEl.appendChild(card);
}

function addDecorCard(item) {
  var card = document.createElement("article");
  card.className = "shop-card";
  card.setAttribute("role", "listitem");

  var preview = document.createElement("div");
  preview.className = "shop-card__preview";
  preview.innerHTML = seaweedPreviewHtml();

  var name = document.createElement("h2");
  name.className = "shop-card__name";
  name.textContent = item.name;

  var price = document.createElement("p");
  price.className = "shop-card__price";
  price.textContent = item.price + " coins";

  var owned = ownDecor(item.id);
  var btn = makeBuyButton(owned ? "You own this!" : "Buy", owned);

  btn.addEventListener("click", function () {
    var result = buyDecor(item.id);
    if (result.ok) {
      showMsg("Nice! Seaweed is in your aquarium.", "ok");
      btn.textContent = "You own this!";
      btn.disabled = true;
      refreshCoins();
      return;
    }
    if (result.reason === "owned") {
      showMsg("You already have this decoration!", "ok");
      return;
    }
    if (result.reason === "coins") {
      showMsg("Need more coins — finish tasks and earn coins on the trail!", "need");
      return;
    }
    showMsg("That decoration is not for sale.", "need");
  });

  card.appendChild(preview);
  card.appendChild(name);
  card.appendChild(price);
  card.appendChild(btn);
  gridEl.appendChild(card);
}

function buildShop() {
  gridEl.innerHTML = "";
  var i;
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    addFishCard(FISH_FOR_SALE[i]);
  }
  for (i = 0; i < DECOR_FOR_SALE.length; i += 1) {
    addDecorCard(DECOR_FOR_SALE[i]);
  }
  refreshCoins();
}

buildShop();
