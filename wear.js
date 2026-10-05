// Who wears this outfit? One page, one costume, every fish you own.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var listEl = document.getElementById("wear-list");
var titleEl = document.getElementById("wear-title");
var hintEl = document.getElementById("wear-hint");
var msgEl = document.getElementById("wear-msg");
var emptyEl = document.getElementById("wear-empty");

function outfitIdFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get("outfit");
  if (!id) {
    return "";
  }
  return id;
}

function showMsg(text, kind) {
  msgEl.textContent = text;
  msgEl.className = "shop-msg" + (kind ? " shop-msg--" + kind : "");
}

function fishFaceHtml(fish, outfitId) {
  if (typeof reefFishMarkup === "function") {
    return reefFishMarkup(fish, outfitId);
  }
  return (
    '<span class="reef-fish">' +
    '<img class="reef-fish__img" src="' +
    fish.image +
    '" alt="" />' +
    "</span>"
  );
}

function ownedFish() {
  var list = [];
  var i;
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    if (fishCount(FISH_FOR_SALE[i].id) > 0) {
      list.push(FISH_FOR_SALE[i]);
    }
  }
  return list;
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

function showNeedShop(title, hint) {
  titleEl.textContent = title;
  hintEl.textContent = hint;
  listEl.innerHTML = "";
  emptyEl.hidden = false;
}

function addFishRow(item, fish) {
  var wearing = typeof outfitIsOnFish === "function" && outfitIsOnFish(item.id, fish.id);
  var card = document.createElement("article");
  card.className = "shop-card wear-card";

  var preview = document.createElement("div");
  preview.className = "shop-card__preview";
  preview.innerHTML = fishFaceHtml(fish, item.id);

  var side = document.createElement("div");
  side.className = "wear-card__side";

  var name = document.createElement("h2");
  name.className = "wear-card__name";
  var n = fishCount(fish.id);
  name.textContent = n > 1 ? fish.name + " (" + n + ")" : fish.name;

  var other = "";
  if (!wearing && typeof wornOutfitForFish === "function") {
    other = wornOutfitForFish(fish.id);
  }
  var note = document.createElement("p");
  note.className = "wear-card__note";
  if (wearing) {
    note.textContent = "On this fish.";
  } else if (other) {
    note.textContent = "This fish already has a costume.";
  } else {
    note.textContent = "Not on this fish.";
  }

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-card__btn";
  btn.textContent = wearing ? "Take it off" : "Put it on";
  btn.addEventListener("click", function () {
    if (wearing) {
      var off = takeOutfitOff(item.id, fish.id);
      if (off.ok) {
        showMsg("The " + item.name + " came off your " + fish.name + ".", "ok");
        renderWear();
        return;
      }
      showMsg("That costume is not on your " + fish.name + ".", "need");
      return;
    }
    var result = putOutfitOn(item.id, fish.id);
    if (result.ok) {
      var line = "Your " + fish.name + " wears the " + item.name + ".";
      if (result.movedOff) {
        line += " It came off your " + result.movedOff.name + ".";
      }
      showMsg(line, "ok");
      renderWear();
      return;
    }
    if (result.reason === "wearing") {
      showMsg("This fish already has a costume. Take it off first.", "need");
      return;
    }
    if (result.reason === "nofish") {
      showMsg("You need that fish first.", "need");
      return;
    }
    showMsg("You need that costume first.", "need");
  });

  side.appendChild(name);
  side.appendChild(note);
  side.appendChild(btn);
  card.appendChild(preview);
  card.appendChild(side);
  listEl.appendChild(card);
}

function renderWear() {
  var outfitId = outfitIdFromUrl();
  if (!outfitId) {
    showNeedShop("Who wears this?", "Pick an outfit in the Fish Shop first.");
    return;
  }

  var item = typeof findOutfit === "function" ? findOutfit(outfitId) : null;
  if (!item) {
    showNeedShop("Who wears this?", "We cannot find that outfit.");
    return;
  }

  if (typeof outfitCount !== "function" || outfitCount(item.id) < 1) {
    showNeedShop(
      "Who wears the " + item.name + "?",
      "You do not have this outfit yet. Buy it in the Fish Shop."
    );
    return;
  }

  emptyEl.hidden = true;
  titleEl.textContent = "Who wears the " + item.name + "?";
  var owned = outfitCount(item.id);
  var countLine = owned === 1 ? "You have one." : "You have " + owned + ".";
  hintEl.textContent = wearStatusText(item) + " " + countLine;

  var choices = ownedFish();
  listEl.innerHTML = "";
  if (choices.length === 0) {
    hintEl.textContent = "Buy a fish first. Then you can pick who wears the " + item.name + ".";
    emptyEl.hidden = false;
    return;
  }

  var i;
  for (i = 0; i < choices.length; i += 1) {
    addFishRow(item, choices[i]);
  }
}

renderWear();
