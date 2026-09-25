// Coral trail — after every 3 tasks, swim up and earn coins.
// Each coding path has its own reef colors; every stop gives coins.

var TRAIL_THEMES = {
  blocks: {
    title: "Block Coral Trail",
    subtitle: "You finished 3 block tasks! Swim up to earn coins!",
    className: "trail--blocks",
    prizes: [
      { id: "block-coin", name: "Block Coin", shape: "coin" },
      { id: "block-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "block-gold", name: "Gold Coin", shape: "gold" },
    ],
  },
  htmlcss: {
    title: "Paintbrush Reef Trail",
    subtitle: "You finished 3 HTML/CSS tasks! Swim up to earn coins!",
    className: "trail--htmlcss",
    prizes: [
      { id: "css-coin", name: "Style Coin", shape: "coin" },
      { id: "css-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "css-gold", name: "Teal Coin", shape: "gold" },
    ],
  },
  python: {
    title: "Sea Grass Trail",
    subtitle: "You finished 3 Python tasks! Swim up to earn coins!",
    className: "trail--python",
    prizes: [
      { id: "py-coin", name: "Python Coin", shape: "coin" },
      { id: "py-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "py-gold", name: "Reef Coin", shape: "gold" },
    ],
  },
  javascript: {
    title: "Golden Coral Trail",
    subtitle: "You finished 3 JavaScript tasks! Swim up to earn coins!",
    className: "trail--javascript",
    prizes: [
      { id: "js-coin", name: "Spark Coin", shape: "coin" },
      { id: "js-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "js-gold", name: "Gold Coin", shape: "gold" },
    ],
  },
  go: {
    title: "Gopher Ocean Trail",
    subtitle: "You finished 3 Go tasks! Swim up to earn coins!",
    className: "trail--go",
    prizes: [
      { id: "go-coin", name: "Ocean Coin", shape: "coin" },
      { id: "go-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "go-gold", name: "Blue Coin", shape: "gold" },
    ],
  },
  java: {
    title: "Amber Coral Trail",
    subtitle: "You finished 3 Java tasks! Swim up to earn coins!",
    className: "trail--java",
    prizes: [
      { id: "java-coin", name: "Amber Coin", shape: "coin" },
      { id: "java-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "java-gold", name: "Honey Coin", shape: "gold" },
    ],
  },
  cpp: {
    title: "Deep Purple Trail",
    subtitle: "You finished 3 C++ tasks! Swim up to earn coins!",
    className: "trail--cpp",
    prizes: [
      { id: "cpp-coin", name: "Deep Coin", shape: "coin" },
      { id: "cpp-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "cpp-gold", name: "Indigo Coin", shape: "gold" },
    ],
  },
  assembly: {
    title: "Rocky Chip Reef",
    subtitle: "You finished 3 Assembly tasks! Swim up to earn coins!",
    className: "trail--assembly",
    prizes: [
      { id: "asm-coin", name: "Chip Coin", shape: "coin" },
      { id: "asm-pouch", name: "Coin Pouch", shape: "pouch" },
      { id: "asm-gold", name: "Circuit Coin", shape: "gold" },
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
  var coinsEach =
    typeof COINS_PER_PRIZE === "number" ? COINS_PER_PRIZE : 5;

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
      '<p class="trail-spot__label">+' +
      coinsEach +
      " coins</p>" +
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
    '<p class="trail-msg" id="trail-msg">Tap <strong>Swim up!</strong> to earn coins at the next stop.</p>' +
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
      bagEl.innerHTML =
        '<p class="trail-bag__empty">No coins yet — swim up to earn some!</p>';
      return;
    }
    var html = '<p class="trail-bag__title">Coins you earned</p><ul class="trail-bag__list">';
    var p;
    for (p = 0; p < progress.prizes.length; p += 1) {
      var saved = progress.prizes[p];
      html +=
        "<li class=\"trail-prize\">" +
        prizeShapeHtml(saved.shape) +
        "<span>" +
        saved.name +
        " <strong>+" +
        coinsEach +
        "</strong></span></li>";
    }
    html += "</ul>";
    bagEl.innerHTML = html;
  }

  function setDiverSpot(index) {
    // Spots go bottom → top visually (first coin stop at bottom).
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
      "You swam the whole trail and earned coins! Tap <strong>Continue</strong> when ready.";
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

      // Each stop adds coins for the Fish Shop.
      if (typeof addCoins === "function") {
        addCoins(coinsEach);
        if (typeof showCoinToast === "function") {
          showCoinToast(coinsEach);
        }
      }
    }
    if (spotEls[index]) {
      spotEls[index].classList.add("is-earned");
    }
    renderBag();
    msgEl.innerHTML =
      "You earned <strong>+" +
      coinsEach +
      " coins</strong> (" +
      prize.name +
      ")! Keep swimming!";
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

    // Earn coins at current stop, then swim to next (or finish).
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
