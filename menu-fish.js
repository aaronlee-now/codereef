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
    swimmer.className = "menu-fish";
    swimmer.style.top = 18 + i * 14 + "%";
    swimmer.style.setProperty("--drift", 16 + i * 4 + "s");
    swimmer.style.setProperty("--fish-scale", String(0.85 + (i % 3) * 0.1));
    swimmer.style.animationDelay = i * -3 + "s";
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
