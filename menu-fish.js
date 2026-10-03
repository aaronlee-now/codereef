// Menu fish — owned fish swim slowly behind home and explore menus.
// Each fish swims ONE direction only so they never look backwards.

(function () {
  if (typeof getOwnedFishList !== "function") {
    return;
  }

  var fishList =
    typeof getSwimmingFishList === "function" ? getSwimmingFishList() : getOwnedFishList();
  if (!fishList.length) {
    return;
  }

  var layer = document.createElement("div");
  layer.className = "menu-fish-layer";
  layer.setAttribute("aria-hidden", "true");

  var i;
  for (i = 0; i < fishList.length; i += 1) {
    var fish = fishList[i];
    var goRight = i % 2 === 0;
    var swimmer = document.createElement("div");
    swimmer.className =
      "menu-fish" + (goRight ? " menu-fish--right" : " menu-fish--left");
    swimmer.style.top = 14 + (i % 5) * 14 + "%";
    var heavy = fish.kind === "shark" || fish.kind === "octopus" || fish.kind === "turtle";
    var drift = (26 + i * 5) * (heavy ? 1.3 : 1);
    swimmer.style.setProperty("--drift", drift + "s");
    var scale = 0.8 + (i % 3) * 0.1;
    if (heavy) {
      scale *= 1.2;
    }
    swimmer.style.setProperty("--fish-scale", String(scale));
    swimmer.style.setProperty("--stroke", heavy ? "2.6s" : 1.4 + (i % 3) * 0.16 + "s");
    swimmer.style.setProperty("--stroke-delay", -(i * 0.41) + "s");
    swimmer.style.animationDelay = i * -6 + "s";
    var worn = "";
    if (typeof wornOutfitForFish === "function") {
      worn = wornOutfitForFish(fish.id);
    }
    swimmer.innerHTML =
      '<div class="menu-fish__face">' +
      (typeof reefFishMarkup === "function"
        ? reefFishMarkup(fish, worn)
        : '<span class="reef-fish"><img class="reef-fish__img" src="' +
          fish.image +
          '" alt="" /></span>') +
      "</div>";
    layer.appendChild(swimmer);
  }

  var cover = document.querySelector(".cover");
  if (cover) {
    cover.appendChild(layer);
  } else {
    document.body.appendChild(layer);
  }
})();
