// Aquarium — show owned fish swimming in the tank.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var tankEl = document.getElementById("aquarium-tank");
var coinsEl = document.getElementById("aquarium-coins");

function fishHtml(fish) {
  return (
    '<span class="reef-fish">' +
    '<img class="reef-fish__img" src="' +
    fish.image +
    '" alt="" />' +
    "</span>"
  );
}

function seaweedHtml() {
  return (
    '<div class="aquarium-decor" aria-hidden="true">' +
    '<span class="shop-decor-preview">' +
    '<span class="shop-decor-preview__leaf"></span>' +
    '<span class="shop-decor-preview__leaf"></span>' +
    '<span class="shop-decor-preview__leaf"></span>' +
    "</span></div>"
  );
}

function placeFish(fish, index) {
  var swimmer = document.createElement("div");
  swimmer.className = "aquarium-swimmer";
  swimmer.setAttribute("aria-label", fish.name);
  swimmer.innerHTML = fishHtml(fish);

  // Spread fish around so they don't stack.
  var topPct = 12 + (index % 4) * 16;
  var leftPct = 6 + (index % 3) * 18;
  var swimX = 8 + (index % 5) * 3.5;
  var swimTime = 12 + (index % 4) * 4;
  var scale = 0.95 + (index % 3) * 0.12;
  var bobTime = 2.4 + (index % 3) * 0.45;

  swimmer.style.top = topPct + "%";
  swimmer.style.left = leftPct + "%";
  swimmer.style.setProperty("--swim-x", swimX + "rem");
  swimmer.style.setProperty("--swim-time", swimTime + "s");
  swimmer.style.setProperty("--fish-scale", String(scale));
  swimmer.style.setProperty("--bob-time", bobTime + "s");
  swimmer.style.setProperty("--bob-delay", index * 0.4 + "s");
  swimmer.style.animationDelay = index * -1.8 + "s";

  tankEl.appendChild(swimmer);
}

function renderAquarium() {
  var wallet = getWallet();
  coinsEl.textContent = wallet.coins + " coins";

  // Keep sand; clear the rest.
  var kids = tankEl.querySelectorAll(".aquarium-swimmer, .aquarium-empty, .aquarium-decor");
  var k;
  for (k = 0; k < kids.length; k += 1) {
    kids[k].remove();
  }

  if (ownDecor("seaweed")) {
    tankEl.insertAdjacentHTML("beforeend", seaweedHtml());
  }

  var fishList = getOwnedFishList();
  if (fishList.length === 0) {
    var empty = document.createElement("p");
    empty.className = "aquarium-empty";
    empty.innerHTML =
      'Earn coins on the trail and buy fish in the <a href="shop.html?v=swim1">shop</a>!';
    tankEl.appendChild(empty);
    return;
  }

  var i;
  for (i = 0; i < fishList.length; i += 1) {
    placeFish(fishList[i], i);
  }
}

renderAquarium();
