// Menu fish — owned fish swim slowly behind home and explore menus.
// pointer-events: none so buttons still work.

(function () {
  if (typeof getOwnedFishList !== "function") {
    return;
  }

  var fishList = getOwnedFishList();
  if (!fishList.length) {
    return;
  }

  var layer = document.createElement("div");
  layer.className = "menu-fish-layer";
  layer.setAttribute("aria-hidden", "true");

  var i;
  for (i = 0; i < fishList.length; i += 1) {
    var fish = fishList[i];
    var swimmer = document.createElement("div");
    // Even fish swim right (flipped); odd fish swim left (natural art facing).
    swimmer.className = i % 2 === 1 ? "menu-fish menu-fish--leftward" : "menu-fish";
    swimmer.style.top = 16 + i * 15 + "%";
    swimmer.style.setProperty("--drift", 14 + i * 5 + "s");
    swimmer.style.setProperty("--fish-scale", String(0.85 + (i % 3) * 0.1));
    swimmer.style.setProperty("--bob-time", 2.5 + (i % 3) * 0.5 + "s");
    swimmer.style.setProperty("--bob-delay", i * 0.5 + "s");
    swimmer.style.animationDelay = i * -4 + "s";
    swimmer.innerHTML =
      '<span class="reef-fish">' +
      '<img class="reef-fish__img" src="' +
      fish.image +
      '" alt="" />' +
      "</span>";
    layer.appendChild(swimmer);
  }

  // Put fish inside the cover so home buttons stay clickable and on top.
  var cover = document.querySelector(".cover");
  if (cover) {
    cover.appendChild(layer);
  } else {
    document.body.appendChild(layer);
  }
})();
