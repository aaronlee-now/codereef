// Coral trail — after every 3 tasks, swim up and earn prizes.
// Each coding path has its own reef colors and prize names.

var TRAIL_THEMES = {
  blocks: {
    title: "Block Coral Trail",
    subtitle: "You finished 3 block tasks! Swim up the warm reef.",
    className: "trail--blocks",
    prizes: [
      { id: "block-shell", name: "Blocky Shell", shape: "shell" },
      { id: "block-pearl", name: "Pixel Pearl", shape: "pearl" },
      { id: "block-chest", name: "Brick Treasure", shape: "chest" },
    ],
  },
  htmlcss: {
    title: "Paintbrush Reef Trail",
    subtitle: "You finished 3 HTML/CSS tasks! Swim the teal reef.",
    className: "trail--htmlcss",
    prizes: [
      { id: "css-brush", name: "Sea Paintbrush", shape: "brush" },
      { id: "css-pearl", name: "Style Pearl", shape: "pearl" },
      { id: "css-star", name: "Color Starfish", shape: "star" },
    ],
  },
  python: {
    title: "Sea Grass Trail",
    subtitle: "You finished 3 Python tasks! Swim through the green grass.",
    className: "trail--python",
    prizes: [
      { id: "py-fish", name: "Friendly Fish", shape: "fish" },
      { id: "py-coil", name: "Sea Coil", shape: "coil" },
      { id: "py-pearl", name: "Python Pearl", shape: "pearl" },
    ],
  },
  javascript: {
    title: "Golden Coral Trail",
    subtitle: "You finished 3 JavaScript tasks! Swim the golden reef.",
    className: "trail--javascript",
    prizes: [
      { id: "js-shell", name: "Gold Shell", shape: "shell" },
      { id: "js-spark", name: "Spark Pearl", shape: "pearl" },
      { id: "js-chest", name: "Sunken Chest", shape: "chest" },
    ],
  },
  go: {
    title: "Gopher Ocean Trail",
    subtitle: "You finished 3 Go tasks! Swim the blue gopher reef.",
    className: "trail--go",
    prizes: [
      { id: "go-shell", name: "Blue Shell", shape: "shell" },
      { id: "go-star", name: "Ocean Starfish", shape: "star" },
      { id: "go-chest", name: "Gopher Chest", shape: "chest" },
    ],
  },
  java: {
    title: "Amber Coral Trail",
    subtitle: "You finished 3 Java tasks! Swim the amber reef.",
    className: "trail--java",
    prizes: [
      { id: "java-shell", name: "Amber Shell", shape: "shell" },
      { id: "java-pearl", name: "Warm Pearl", shape: "pearl" },
      { id: "java-star", name: "Honey Starfish", shape: "star" },
    ],
  },
  cpp: {
    title: "Deep Purple Trail",
    subtitle: "You finished 3 C++ tasks! Swim the purple-blue reef.",
    className: "trail--cpp",
    prizes: [
      { id: "cpp-shell", name: "Deep Shell", shape: "shell" },
      { id: "cpp-pearl", name: "Indigo Pearl", shape: "pearl" },
      { id: "cpp-chest", name: "Depths Chest", shape: "chest" },
    ],
  },
  assembly: {
    title: "Rocky Chip Reef",
    subtitle: "You finished 3 Assembly tasks! Swim the rocky dark reef.",
    className: "trail--assembly",
    prizes: [
      { id: "asm-chip", name: "Microchip Shell", shape: "chip" },
      { id: "asm-pearl", name: "Bit Pearl", shape: "pearl" },
      { id: "asm-chest", name: "Circuit Chest", shape: "chest" },
    ],
  },
};

function shouldShowCoralTrail(taskIndex) {
  return (taskIndex + 1) % 3 === 0;
}

function trailStorageKey(trailId) {
  var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  var kid = user && user.kidName ? String(user.kidName).toLowerCase() : "guest";
  return "codereef_trail_" + kid + "_" + trailId;
}

function loadTrailProgress(trailId) {
  var raw = localStorage.getItem(trailStorageKey(trailId));
  if (!raw) {
    return { prizes: [], batchesDone: 0 };
  }
  try {
    var data = JSON.parse(raw);
    return {
      prizes: Array.isArray(data.prizes) ? data.prizes : [],
      batchesDone: typeof data.batchesDone === "number" ? data.batchesDone : 0,
    };
  } catch (err) {
    return { prizes: [], batchesDone: 0 };
  }
}

function saveTrailProgress(trailId, progress) {
  localStorage.setItem(trailStorageKey(trailId), JSON.stringify(progress));
}

function prizeShapeHtml(shape) {
  // Simple CSS shapes — no emoji spam.
  return '<span class="trail-prize__art trail-prize__art--' + shape + '" aria-hidden="true"></span>';
}

function openCoralTrail(trailId, options) {
  var theme = TRAIL_THEMES[trailId];
  if (!theme) {
    if (options && typeof options.onComplete === "function") {
      options.onComplete();
    }
    return;
  }

  var progress = loadTrailProgress(trailId);
  var batchNumber = progress.batchesDone + 1;
  var spotIndex = 0;
  var onComplete = options && options.onComplete ? options.onComplete : function () {};

  // Remove any old overlay first.
  var old = document.getElementById("coral-trail");
  if (old) {
    old.remove();
  }

  var overlay = document.createElement("div");
  overlay.id = "coral-trail";
  overlay.className = "trail-overlay " + theme.className;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", theme.title);

  var spotsHtml = "";
  var i;
  for (i = 0; i < theme.prizes.length; i += 1) {
    spotsHtml +=
      '<div class="trail-spot" data-spot="' +
      i +
      '">' +
      '<div class="trail-spot__pad"></div>' +
      '<p class="trail-spot__label">Stop ' +
      (i + 1) +
      "</p>" +
      "</div>";
  }

  overlay.innerHTML =
    '<div class="trail-panel">' +
    '<div class="trail-bubbles" aria-hidden="true"></div>' +
    "<h2 class=\"trail-title\">" +
    theme.title +
    "</h2>" +
    '<p class="trail-subtitle">' +
    theme.subtitle +
    "</p>" +
    '<div class="trail-reef">' +
    '<div class="trail-path" aria-hidden="true"></div>' +
    '<div class="trail-coral trail-coral--left" aria-hidden="true"></div>' +
    '<div class="trail-coral trail-coral--right" aria-hidden="true"></div>' +
    '<div class="trail-spots">' +
    spotsHtml +
    "</div>" +
    '<div class="trail-diver" id="trail-diver" aria-hidden="true"></div>' +
    "</div>" +
    '<p class="trail-msg" id="trail-msg">Tap <strong>Swim up!</strong> to move to the next coral stop.</p>' +
    '<div class="trail-bag" id="trail-bag"></div>' +
    '<div class="trail-actions">' +
    '<button type="button" class="trail-btn trail-btn--swim" id="trail-swim">Swim up!</button>' +
    '<button type="button" class="trail-btn trail-btn--continue" id="trail-continue" hidden>Continue</button>' +
    "</div>" +
    "</div>";

  document.body.appendChild(overlay);

  var msgEl = document.getElementById("trail-msg");
  var bagEl = document.getElementById("trail-bag");
  var swimBtn = document.getElementById("trail-swim");
  var continueBtn = document.getElementById("trail-continue");
  var diver = document.getElementById("trail-diver");
  var spotEls = overlay.querySelectorAll(".trail-spot");

  function renderBag() {
    if (progress.prizes.length === 0) {
      bagEl.innerHTML = '<p class="trail-bag__empty">Your prize bag is empty — swim up!</p>';
      return;
    }
    var html = '<p class="trail-bag__title">Your prizes</p><ul class="trail-bag__list">';
    var p;
    for (p = 0; p < progress.prizes.length; p += 1) {
      var saved = progress.prizes[p];
      html +=
        "<li class=\"trail-prize\">" +
        prizeShapeHtml(saved.shape) +
        "<span>" +
        saved.name +
        "</span></li>";
    }
    html += "</ul>";
    bagEl.innerHTML = html;
  }

  function setDiverSpot(index) {
    // Spots go bottom → top visually (first prize at bottom).
    var total = theme.prizes.length;
    var fromBottom = index;
    var pct = total <= 1 ? 12 : 12 + (fromBottom / (total - 1)) * 70;
    diver.style.bottom = pct + "%";
  }

  function finishTrail() {
    swimBtn.hidden = true;
    continueBtn.hidden = false;
    continueBtn.removeAttribute("hidden");
    msgEl.innerHTML =
      "You swam the whole trail! Awesome diving. Tap <strong>Continue</strong> when ready.";
    progress.batchesDone = batchNumber;
    saveTrailProgress(trailId, progress);
  }

  function earnPrizeAt(index) {
    var prize = theme.prizes[index];
    var already = progress.prizes.some(function (p) {
      return p.id === prize.id + "-b" + batchNumber;
    });
    if (!already) {
      progress.prizes.push({
        id: prize.id + "-b" + batchNumber,
        name: prize.name,
        shape: prize.shape,
      });
      saveTrailProgress(trailId, progress);
    }
    if (spotEls[index]) {
      spotEls[index].classList.add("is-earned");
    }
    renderBag();
    msgEl.innerHTML =
      "You found a <strong>" + prize.name + "</strong>! Keep swimming!";
  }

  setDiverSpot(0);
  renderBag();

  // Highlight starting pad.
  if (spotEls[0]) {
    spotEls[0].classList.add("is-here");
  }

  swimBtn.addEventListener("click", function () {
    if (spotIndex >= theme.prizes.length) {
      return;
    }

    // Earn prize at current stop, then swim to next (or finish).
    earnPrizeAt(spotIndex);
    if (spotEls[spotIndex]) {
      spotEls[spotIndex].classList.remove("is-here");
    }

    spotIndex += 1;
    if (spotIndex >= theme.prizes.length) {
      setDiverSpot(theme.prizes.length - 1);
      diver.classList.add("is-top");
      finishTrail();
      return;
    }

    setDiverSpot(spotIndex);
    if (spotEls[spotIndex]) {
      spotEls[spotIndex].classList.add("is-here");
    }
  });

  continueBtn.addEventListener("click", function () {
    overlay.remove();
    onComplete();
  });
}
