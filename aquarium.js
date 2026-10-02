// Aquarium — owned fish glide one way (always facing forward).
// Fish race: rarer fish are faster, and they steer around obstacles.
// Each race builds a new course with about 14 to 16 obstacles.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var tankEl = document.getElementById("aquarium-tank");
var coinsEl = document.getElementById("aquarium-coins");
var raceBtn = document.getElementById("fish-race-btn");
var againBtn = document.getElementById("race-again-btn");
var swimBtn = document.getElementById("swim-again-btn");
var raceMsgEl = document.getElementById("aquarium-race-msg");
var pickerEl = document.getElementById("aquarium-picker");
var pickerCountEl = document.getElementById("aquarium-picker-count");
var pickerGridEl = document.getElementById("aquarium-picker-grid");
var pickerStartBtn = document.getElementById("picker-start-btn");
var pickerBackBtn = document.getElementById("picker-back-btn");

var raceFrame = 0;
var raceOn = false;
var raceToken = 0;
var tipTimer = 0;
var RACE_LIMIT = 10;
var COURSE_TANKS = 4.2;
var lastLineup = null;
var pickRows = [];
var lastCourseKey = "";
var lastKindKey = "";

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

function fishFaceHtml(fish, outfitId) {
  if (typeof reefFishMarkup === "function") {
    return reefFishMarkup(fish, outfitId);
  }
  return (
    '<span class="reef-fish"><img class="reef-fish__img" src="' +
    fish.image +
    '" alt="" /></span>'
  );
}

function isHeavyFish(fish) {
  return fish.kind === "shark" || fish.kind === "octopus" || fish.kind === "turtle";
}

function ensureTip() {
  var tip = document.getElementById("aquarium-tip");
  if (!tip) {
    tip = document.createElement("p");
    tip.id = "aquarium-tip";
    tip.className = "aquarium-tip";
    tip.hidden = true;
    tankEl.appendChild(tip);
  }
  return tip;
}

function showTip(name, clientX, clientY) {
  var tip = ensureTip();
  var box = tankEl.getBoundingClientRect();
  var x = clientX - box.left;
  var y = clientY - box.top - 36;
  if (y < 6) {
    y = clientY - box.top + 14;
  }
  if (x < 40) {
    x = 40;
  }
  if (x > box.width - 40) {
    x = box.width - 40;
  }
  tip.hidden = false;
  tip.textContent = name;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
  window.clearTimeout(tipTimer);
  tipTimer = window.setTimeout(function () {
    tip.hidden = true;
  }, 1600);
}

function bindFishClick(swimmer, name) {
  swimmer.addEventListener("click", function (event) {
    event.stopPropagation();
    showTip(name, event.clientX, event.clientY);
  });
}

function placeFish(fish, index, outfitId) {
  var swimmer = document.createElement("div");
  // Even = swim right (face right). Odd = swim left (face left). Never reverse.
  var goRight = index % 2 === 0;
  swimmer.className =
    "aquarium-swimmer" + (goRight ? " aquarium-swimmer--right" : " aquarium-swimmer--left");
  swimmer.setAttribute("aria-label", fish.name);
  swimmer.innerHTML = '<div class="aquarium-swimmer__face">' + fishFaceHtml(fish, outfitId) + "</div>";

  var heavy = isHeavyFish(fish);
  var topPct = 10 + (index % 5) * 14;
  var startPct = goRight ? -8 - (index % 3) * 4 : 88 + (index % 3) * 3;
  var swimTime = (22 + (index % 5) * 4) * (heavy ? 1.4 : 1);
  var scale = 0.9 + (index % 3) * 0.14;
  if (heavy) {
    scale *= 1.25;
  }

  swimmer.style.top = topPct + "%";
  swimmer.style.left = startPct + "%";
  swimmer.style.setProperty("--swim-time", swimTime + "s");
  swimmer.style.setProperty("--fish-scale", String(scale));
  swimmer.style.setProperty("--stroke", heavy ? "2.4s" : 1.05 + (index % 4) * 0.12 + "s");
  swimmer.style.setProperty("--stroke-delay", -(index * 0.37) + "s");
  swimmer.style.animationDelay = -(index * 3.1) + "s";
  bindFishClick(swimmer, fish.name);
  tankEl.appendChild(swimmer);
}

function clearTankMovers() {
  var kids = tankEl.querySelectorAll(
    ".aquarium-swimmer, .aquarium-empty, .aquarium-decor, .aquarium-obstacle, .aquarium-finish, .aquarium-race-world"
  );
  var k;
  for (k = 0; k < kids.length; k += 1) {
    kids[k].remove();
  }
  tankEl.classList.remove("aquarium-tank--racing");
}

function stopRaceLoop() {
  raceOn = false;
  raceToken += 1;
  if (raceFrame) {
    window.cancelAnimationFrame(raceFrame);
    raceFrame = 0;
  }
  stopDecorRest();
}

function setRaceMsg(text, win) {
  if (!raceMsgEl) {
    return;
  }
  raceMsgEl.textContent = text;
  raceMsgEl.className = "aquarium-race-msg" + (win ? " aquarium-race-msg--win" : "");
}

function showSwimButtons() {
  if (raceBtn) {
    raceBtn.hidden = false;
  }
  if (againBtn) {
    againBtn.hidden = true;
  }
  if (swimBtn) {
    swimBtn.hidden = true;
  }
}

function showRacingButtons() {
  if (raceBtn) {
    raceBtn.hidden = true;
  }
  if (againBtn) {
    againBtn.hidden = true;
  }
  if (swimBtn) {
    swimBtn.hidden = false;
  }
}

function showFinishButtons() {
  if (raceBtn) {
    raceBtn.hidden = true;
  }
  if (againBtn) {
    againBtn.hidden = false;
  }
  if (swimBtn) {
    swimBtn.hidden = false;
  }
}

function renderAquarium() {
  stopRaceLoop();
  closePicker();
  showSwimButtons();
  setRaceMsg("");
  var wallet = getWallet();
  coinsEl.textContent = formatCoinSummary(wallet.coins);

  clearTankMovers();

  placeBoughtDecor();

  var total = typeof totalFishCount === "function" ? totalFishCount() : 0;
  var fishList =
    typeof getSwimmingFishList === "function" ? getSwimmingFishList() : getOwnedFishList();
  var noteEl = document.getElementById("aquarium-count");
  if (noteEl) {
    if (total > fishList.length) {
      noteEl.textContent =
        "You have " +
        total +
        " fish. Showing " +
        fishList.length +
        " so the page stays fast. The rest are saved!";
    } else if (total > 0) {
      noteEl.textContent = "You have " + total + " fish.";
    } else {
      noteEl.textContent = "";
    }
  }

  if (fishList.length === 0) {
    var empty = document.createElement("p");
    empty.className = "aquarium-empty";
    empty.innerHTML =
      'Earn coins on the trail and buy fish in the <a href="shop.html?v=swim2">shop</a>!';
    tankEl.appendChild(empty);
    return;
  }

  var outfitCursor = {};
  var i;
  for (i = 0; i < fishList.length; i += 1) {
    var worn = "";
    if (typeof nextWornOutfit === "function") {
      worn = nextWornOutfit(fishList[i].id, outfitCursor);
    }
    placeFish(fishList[i], i, worn);
  }
  startDecorRest();
}

// Higher rarity is a faster racer. Uses fish.rarity from the shop list.
function fishRarity(fish) {
  if (fish && typeof fish.rarity === "number") {
    return fish.rarity;
  }
  var i;
  if (typeof FISH_FOR_SALE === "undefined") {
    return 0;
  }
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    if (FISH_FOR_SALE[i].id === fish.id) {
      return i;
    }
  }
  return 0;
}

// One racer for each copy you own. Same rule the race already used.
function ownedRaceCopies() {
  var wallet = getWallet();
  var counts = wallet.fishCounts || {};
  var copies = [];
  var i;
  var n;
  if (typeof FISH_FOR_SALE === "undefined") {
    return copies;
  }
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    var fish = FISH_FOR_SALE[i];
    var count = counts[fish.id] || 0;
    for (n = 0; n < count; n += 1) {
      copies.push(fish);
    }
  }
  return copies;
}

function ownedSpeciesForRace() {
  var wallet = getWallet();
  var counts = wallet.fishCounts || {};
  var list = [];
  var i;
  if (typeof FISH_FOR_SALE === "undefined") {
    return list;
  }
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    var fish = FISH_FOR_SALE[i];
    var count = counts[fish.id] || 0;
    if (count > 0) {
      list.push({ fish: fish, owned: count, picked: 0 });
    }
  }
  return list;
}

function closePicker() {
  pickRows = [];
  if (pickerEl) {
    pickerEl.hidden = true;
  }
  if (tankEl) {
    tankEl.hidden = false;
  }
}

function pickedTotal() {
  var total = 0;
  var i;
  for (i = 0; i < pickRows.length; i += 1) {
    total += pickRows[i].picked;
  }
  return total;
}

function lineupFromPicker() {
  var lineup = [];
  var i;
  var n;
  for (i = 0; i < pickRows.length; i += 1) {
    for (n = 0; n < pickRows[i].picked; n += 1) {
      lineup.push(pickRows[i].fish);
    }
  }
  return lineup;
}

function addPick(index) {
  var row = pickRows[index];
  if (!row || row.picked >= row.owned) {
    return;
  }
  if (pickedTotal() >= RACE_LIMIT) {
    setRaceMsg("You already picked " + RACE_LIMIT + "!");
    return;
  }
  row.picked += 1;
  setRaceMsg("");
  renderPicker();
}

function subPick(index) {
  var row = pickRows[index];
  if (!row || row.picked <= 0) {
    return;
  }
  row.picked -= 1;
  setRaceMsg("");
  renderPicker();
}

function makePickCard(row, index, total) {
  var card = document.createElement("div");
  card.className = "aquarium-pick" + (row.picked > 0 ? " aquarium-pick--on" : "");

  var picBtn = document.createElement("button");
  picBtn.type = "button";
  picBtn.className = "aquarium-pick__fish";
  var img = document.createElement("img");
  img.src = row.fish.image;
  img.alt = "";
  picBtn.appendChild(img);
  var name = document.createElement("span");
  name.className = "aquarium-pick__name";
  name.textContent = row.fish.name;
  picBtn.appendChild(name);
  var have = document.createElement("span");
  have.className = "aquarium-pick__have";
  have.textContent = "You have " + row.owned;
  picBtn.appendChild(have);
  picBtn.addEventListener("click", function () {
    if (row.owned === 1 && row.picked === 1) {
      subPick(index);
      return;
    }
    addPick(index);
  });
  card.appendChild(picBtn);

  var step = document.createElement("div");
  step.className = "aquarium-pick__step";

  var minus = document.createElement("button");
  minus.type = "button";
  minus.className = "aquarium-pick__btn";
  minus.textContent = "Take off";
  minus.setAttribute("aria-label", "Take off " + row.fish.name);
  minus.disabled = row.picked === 0;
  minus.addEventListener("click", function () {
    subPick(index);
  });

  var num = document.createElement("span");
  num.className = "aquarium-pick__num";
  num.textContent = String(row.picked);
  num.setAttribute("aria-label", row.picked + " will race");

  var plus = document.createElement("button");
  plus.type = "button";
  plus.className = "aquarium-pick__btn";
  plus.textContent = "Add";
  plus.setAttribute("aria-label", "Add " + row.fish.name);
  plus.disabled = row.picked >= row.owned || total >= RACE_LIMIT;
  plus.addEventListener("click", function () {
    addPick(index);
  });

  step.appendChild(minus);
  step.appendChild(num);
  step.appendChild(plus);
  card.appendChild(step);
  return card;
}

function renderPicker() {
  if (!pickerGridEl) {
    return;
  }
  var total = pickedTotal();
  if (pickerCountEl) {
    pickerCountEl.textContent = total + " of " + RACE_LIMIT + " picked";
  }
  if (pickerStartBtn) {
    pickerStartBtn.disabled = total !== RACE_LIMIT;
  }
  pickerGridEl.innerHTML = "";
  var i;
  for (i = 0; i < pickRows.length; i += 1) {
    pickerGridEl.appendChild(makePickCard(pickRows[i], i, total));
  }
}

function openPicker() {
  stopRaceLoop();
  setRaceMsg("Tap Add to choose a fish.");
  showSwimButtons();
  if (raceBtn) {
    raceBtn.hidden = true;
  }
  if (tankEl) {
    tankEl.hidden = true;
  }
  pickRows = ownedSpeciesForRace();
  renderPicker();
  if (pickerEl) {
    pickerEl.hidden = false;
  }
}

function askToRace() {
  var copies = ownedRaceCopies();
  if (copies.length === 0) {
    setRaceMsg("Buy a fish in the shop, then come race!");
    return;
  }
  if (copies.length <= RACE_LIMIT) {
    startRace(copies);
    return;
  }
  openPicker();
}

function raceSpeed(rarity) {
  var wobble = (Math.random() - 0.5) * 8;
  return 80 + rarity * 46 + wobble;
}

function shuffleLanes(count) {
  var lanes = [];
  var i;
  for (i = 0; i < count; i += 1) {
    lanes.push(i);
  }
  for (i = lanes.length - 1; i > 0; i -= 1) {
    var j = Math.floor(Math.random() * (i + 1));
    var swap = lanes[i];
    lanes[i] = lanes[j];
    lanes[j] = swap;
  }
  return lanes;
}

var OBSTACLE_KINDS = ["rock", "coral", "weed", "castle", "bubbles", "starfish", "shell"];

function clampNum(n, lo, hi) {
  if (n < lo) {
    return lo;
  }
  if (n > hi) {
    return hi;
  }
  return n;
}

function obstacleMarkup(kind) {
  if (kind === "coral") {
    return "<i></i><i></i><i></i>";
  }
  if (kind === "weed") {
    return (
      '<span class="shop-decor-preview">' +
      '<span class="shop-decor-preview__leaf"></span>' +
      '<span class="shop-decor-preview__leaf"></span>' +
      '<span class="shop-decor-preview__leaf"></span>' +
      "</span>"
    );
  }
  if (kind === "castle") {
    return '<span class="aquarium-castle"><b></b><b></b><b></b><i></i></span>';
  }
  if (kind === "bubbles") {
    return "<i></i><i></i><i></i><i></i>";
  }
  if (kind === "starfish" || kind === "shell") {
    return "<span></span>";
  }
  return "";
}

function planObstacles() {
  var count = 14 + Math.floor(Math.random() * 3);
  var spots = [];
  var i;
  var lastKind = "";
  var edge = 0.06;
  var end = 0.94;
  var slot = (end - edge) / count;
  for (i = 0; i < count; i += 1) {
    var kind = OBSTACLE_KINDS[Math.floor(Math.random() * OBSTACLE_KINDS.length)];
    var guard = 0;
    while (kind === lastKind && guard < 8) {
      kind = OBSTACLE_KINDS[Math.floor(Math.random() * OBSTACLE_KINDS.length)];
      guard += 1;
    }
    lastKind = kind;
    var along = edge + slot * i + slot * (0.35 + Math.random() * 0.3);
    var band = 0.08 + Math.random() * 0.76;
    spots.push({
      kind: kind,
      along: clampNum(along, edge, end),
      band: clampNum(band, 0.05, 0.88),
    });
  }
  spots.sort(function (a, b) {
    return a.along - b.along;
  });
  var minGap = slot * 0.72;
  for (i = 1; i < spots.length; i += 1) {
    if (spots[i].along - spots[i - 1].along < minGap) {
      spots[i].along = spots[i - 1].along + minGap;
    }
    if (Math.abs(spots[i].band - spots[i - 1].band) < 0.24) {
      if (spots[i].band < 0.5) {
        spots[i].band = clampNum(spots[i].band + 0.34, 0.05, 0.88);
      } else {
        spots[i].band = clampNum(spots[i].band - 0.34, 0.05, 0.88);
      }
    }
  }
  var last = spots[spots.length - 1].along;
  if (last > end) {
    var first = spots[0].along;
    var span = last - first;
    var fit = (end - edge) / span;
    for (i = 0; i < spots.length; i += 1) {
      spots[i].along = edge + (spots[i].along - first) * fit;
    }
  }
  return spots;
}

function courseKey(spots) {
  var parts = [];
  var i;
  for (i = 0; i < spots.length; i += 1) {
    var spot = spots[i];
    parts.push(spot.kind + ":" + Math.round(spot.along * 20) + ":" + Math.round(spot.band * 10));
  }
  return parts.join("|");
}

function kindKey(spots) {
  var names = [];
  var i;
  for (i = 0; i < spots.length; i += 1) {
    names.push(spots[i].kind);
  }
  names.sort();
  return names.join(",");
}

function pickCourseSpots() {
  var spots = planObstacles();
  var key = courseKey(spots);
  var kinds = kindKey(spots);
  var tries = 0;
  while (tries < 12 && (key === lastCourseKey || kinds === lastKindKey)) {
    spots = planObstacles();
    key = courseKey(spots);
    kinds = kindKey(spots);
    tries += 1;
  }
  lastCourseKey = key;
  lastKindKey = kinds;
  return spots;
}

function addRaceCourse(world) {
  var spots = pickCourseSpots();
  world.setAttribute("data-course", lastCourseKey);
  var i;
  for (i = 0; i < spots.length; i += 1) {
    var spot = spots[i];
    var node = document.createElement("div");
    node.className = "aquarium-obstacle aquarium-obstacle--" + spot.kind;
    node.setAttribute("data-along", String(spot.along));
    node.setAttribute("data-band", String(spot.band));
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = obstacleMarkup(spot.kind);
    world.appendChild(node);
  }
  var finish = document.createElement("div");
  finish.className = "aquarium-finish";
  finish.setAttribute("aria-hidden", "true");
  finish.innerHTML = "<span>Finish</span>";
  world.appendChild(finish);
}

function measureObstacles() {
  var nodes = tankEl.querySelectorAll(".aquarium-obstacle");
  var list = [];
  var i;
  for (i = 0; i < nodes.length; i += 1) {
    list.push({
      x: nodes[i].offsetLeft,
      y: nodes[i].offsetTop,
      w: nodes[i].offsetWidth,
      h: nodes[i].offsetHeight,
    });
  }
  return list;
}

function steerY(racer, obstacles) {
  var goal = racer.laneY;
  var lookahead = racer.speed * 0.85 + racer.w * 0.2;
  var best = null;
  var i;
  for (i = 0; i < obstacles.length; i += 1) {
    var obs = obstacles[i];
    if (racer.x > obs.x + obs.w + 8) {
      continue;
    }
    var dist = obs.x - (racer.x + racer.w * 0.9);
    if (dist > lookahead) {
      continue;
    }
    var padY = 16;
    var laneHits = racer.laneY < obs.y + obs.h + padY && racer.laneY + racer.h > obs.y - padY;
    var nowHits = racer.y < obs.y + obs.h + padY && racer.y + racer.h > obs.y - padY;
    if (!laneHits && !nowHits) {
      continue;
    }
    if (best !== null && dist > best.dist) {
      continue;
    }
    var above = obs.y - padY - racer.h;
    var below = obs.y + obs.h + padY;
    var preferAbove = Math.abs(racer.laneY - above) <= Math.abs(racer.laneY - below);
    var pick = preferAbove ? above : below;
    if (pick < racer.minY || pick > racer.maxY) {
      pick = preferAbove ? below : above;
    }
    if (pick < racer.minY) {
      pick = racer.minY;
    }
    if (pick > racer.maxY) {
      pick = racer.maxY;
    }
    best = { dist: dist, y: pick };
  }
  if (best) {
    goal = best.y;
  }
  return goal;
}

function layoutRaceObstacles(tankH, sandH, finishX, leadX) {
  var nodes = tankEl.querySelectorAll(".aquarium-obstacle");
  var waterTop = 8;
  var waterBot = tankH - sandH - 8;
  var lastX = finishX - 64;
  var span = lastX - leadX;
  if (span < 80) {
    span = 80;
  }
  var i;
  for (i = 0; i < nodes.length; i += 1) {
    var along = parseFloat(nodes[i].getAttribute("data-along"));
    var band = parseFloat(nodes[i].getAttribute("data-band"));
    if (isNaN(along)) {
      along = (i + 1) / (nodes.length + 1);
    }
    if (isNaN(band)) {
      band = 0.4;
    }
    var nodeH = nodes[i].offsetHeight || 70;
    var room = waterBot - waterTop - nodeH;
    if (room < 0) {
      room = 0;
    }
    var y = waterTop + room * band;
    var x = leadX + span * along;
    nodes[i].style.left = Math.round(x) + "px";
    nodes[i].style.top = Math.round(y) + "px";
  }
}

function startRace(lineup) {
  stopRaceLoop();
  if (!lineup || lineup.length === 0) {
    setRaceMsg("Buy a fish in the shop, then come race!");
    return;
  }
  if (lineup.length > RACE_LIMIT) {
    openPicker();
    return;
  }
  lastLineup = lineup;
  closePicker();

  clearTankMovers();
  var tip = document.getElementById("aquarium-tip");
  if (tip) {
    tip.hidden = true;
  }
  var world = document.createElement("div");
  world.className = "aquarium-race-world";
  world.style.visibility = "hidden";
  world.style.position = "absolute";
  world.style.top = "0";
  world.style.left = "0";
  world.style.height = "100%";
  var worldSand = document.createElement("div");
  worldSand.className = "aquarium-race-world__sand";
  worldSand.setAttribute("aria-hidden", "true");
  world.appendChild(worldSand);
  tankEl.appendChild(world);
  tankEl.classList.add("aquarium-tank--racing");
  addRaceCourse(world);
  showRacingButtons();
  setRaceMsg("Watch them dodge the reef!");

  var lanes = shuffleLanes(lineup.length);
  var racers = [];
  var i;
  var raceOutfitCursor = {};
  for (i = 0; i < lineup.length; i += 1) {
    var fish = lineup[i];
    var swimmer = document.createElement("div");
    swimmer.className = "aquarium-swimmer aquarium-swimmer--right aquarium-swimmer--race";
    swimmer.setAttribute("aria-label", fish.name);
    var raceWorn = "";
    if (typeof nextWornOutfit === "function") {
      raceWorn = nextWornOutfit(fish.id, raceOutfitCursor);
    }
    swimmer.innerHTML = '<div class="aquarium-swimmer__face">' + fishFaceHtml(fish, raceWorn) + "</div>";
    var scale = 0.94 + (i % 3) * 0.03;
    swimmer.style.setProperty("--fish-scale", String(scale));
    swimmer.style.setProperty("--stroke", isHeavyFish(fish) ? "2.4s" : "1.05s");
    swimmer.style.setProperty("--stroke-delay", -(i * 0.37) + "s");
    bindFishClick(swimmer, fish.name);
    world.appendChild(swimmer);
    racers.push({
      el: swimmer,
      fish: fish,
      rarity: fishRarity(fish),
      lane: lanes[i],
      speed: raceSpeed(fishRarity(fish)),
      phase: Math.random() * 6.28,
      scale: scale,
      x: 0,
      y: 0,
      w: 80,
      h: 48,
      laneY: 0,
      minY: 4,
      maxY: 40,
      crossed: false,
      done: false,
    });
  }

  var token = raceToken;
  window.requestAnimationFrame(function () {
    if (token !== raceToken) {
      return;
    }
    var tankW = tankEl.clientWidth;
    var tankH = tankEl.clientHeight;
    var courseW = Math.round(tankW * COURSE_TANKS);
    world.style.width = courseW + "px";
    var sand = tankEl.querySelector(".aquarium-tank__sand");
    var sandH = sand ? sand.offsetHeight : 40;
    var finish = world.querySelector(".aquarium-finish");
    var finishX = finish ? finish.offsetLeft : courseW - 16;
    var widest = 1;
    var fastest = 1;
    var n;
    for (n = 0; n < racers.length; n += 1) {
      var racer = racers[n];
      racer.w = racer.el.offsetWidth * racer.scale;
      racer.h = racer.el.offsetHeight * racer.scale;
      if (racer.w > widest) {
        widest = racer.w;
      }
      if (racer.speed > fastest) {
        fastest = racer.speed;
      }
    }
    var distance = Math.max(120, finishX - 8);
    var speedScale = distance / 24 / fastest;
    for (n = 0; n < racers.length; n += 1) {
      racers[n].speed *= speedScale;
    }
    fastest *= speedScale;
    var noseAtStart = 4 + widest * 0.82;
    var leadX = noseAtStart + fastest * 0.75;
    var maxLead = finishX * 0.4;
    if (leadX > maxLead) {
      leadX = maxLead;
    }
    layoutRaceObstacles(tankH, sandH, finishX, leadX);
    world.style.visibility = "visible";
    var obstacles = measureObstacles();
    for (n = 0; n < racers.length; n += 1) {
      var racer = racers[n];
      racer.minY = 4;
      racer.maxY = tankH - sandH - racer.h - 6;
      if (racer.maxY < racer.minY) {
        racer.maxY = racer.minY;
      }
      var span = racers.length === 1 ? 0 : racer.maxY - racer.minY;
      var step = racers.length === 1 ? 0 : span / (racers.length - 1);
      racer.laneY = racer.minY + racer.lane * step;
      racer.x = 2;
      racer.y = racer.laneY;
      racer.el.style.left = racer.x + "px";
      racer.el.style.top = racer.y + "px";
    }

    var last = 0;
    var elapsed = 0;
    var winner = null;
    var cameraX = 0;
    raceOn = true;

    function frame(now) {
      if (!raceOn || token !== raceToken) {
        return;
      }
      if (!last) {
        last = now;
      }
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      var burst = elapsed < 0.5 ? elapsed / 0.5 : 1;
      var allDone = true;
      var r;
      for (r = 0; r < racers.length; r += 1) {
        var fishR = racers[r];
        if (!fishR.done) {
          allDone = false;
          var flutter = 1 + 0.02 * Math.sin(elapsed * 2.4 + fishR.phase);
          fishR.x += fishR.speed * burst * flutter * dt;
          var goal = steerY(fishR, obstacles);
          var turn = 12;
          fishR.y += (goal - fishR.y) * Math.min(1, dt * turn);
          if (fishR.y < fishR.minY) {
            fishR.y = fishR.minY;
          }
          if (fishR.y > fishR.maxY) {
            fishR.y = fishR.maxY;
          }
          var park = courseW - fishR.w - 8;
          if (fishR.x + fishR.w >= finishX) {
            fishR.crossed = true;
          }
          if (fishR.x >= park) {
            fishR.x = park;
            fishR.done = true;
          }
          fishR.el.style.left = fishR.x + "px";
          fishR.el.style.top = fishR.y + "px";
        }
      }

      var leadNose = 0;
      var look;
      for (look = 0; look < racers.length; look += 1) {
        var nose = racers[look].x + racers[look].w;
        if (nose > leadNose) {
          leadNose = nose;
        }
      }
      var viewMax = courseW - tankW;
      if (viewMax < 0) {
        viewMax = 0;
      }
      var viewGoal = leadNose - tankW * 0.36;
      if (viewGoal < 0) {
        viewGoal = 0;
      }
      if (viewGoal > viewMax) {
        viewGoal = viewMax;
      }
      cameraX += (viewGoal - cameraX) * Math.min(1, dt * 2.6);
      world.style.transform = "translate3d(" + -cameraX + "px,0,0)";

      if (!winner) {
        var leader = null;
        for (r = 0; r < racers.length; r += 1) {
          var maybe = racers[r];
          if (!maybe.crossed) {
            continue;
          }
          if (
            !leader ||
            maybe.rarity > leader.rarity ||
            (maybe.rarity === leader.rarity && maybe.x > leader.x)
          ) {
            leader = maybe;
          }
        }
        if (leader) {
          winner = leader;
          leader.el.classList.add("aquarium-swimmer--winner");
          setRaceMsg("The " + leader.fish.name + " wins!", true);
          showFinishButtons();
        }
      }

      if (allDone || elapsed > 40) {
        stopRaceLoop();
        if (!winner && racers.length) {
          showFinishButtons();
        }
        return;
      }
      raceFrame = window.requestAnimationFrame(frame);
    }

    raceFrame = window.requestAnimationFrame(frame);
  });
}

renderAquarium();

if (raceBtn) {
  raceBtn.addEventListener("click", askToRace);
}
if (againBtn) {
  againBtn.addEventListener("click", function () {
    if (lastLineup && lastLineup.length > 0 && lastLineup.length <= RACE_LIMIT) {
      startRace(lastLineup);
      return;
    }
    askToRace();
  });
}
if (swimBtn) {
  swimBtn.addEventListener("click", renderAquarium);
}
if (pickerStartBtn) {
  pickerStartBtn.addEventListener("click", function () {
    if (pickedTotal() !== RACE_LIMIT) {
      return;
    }
    startRace(lineupFromPicker());
  });
}
if (pickerBackBtn) {
  pickerBackBtn.addEventListener("click", renderAquarium);
}


// --- Decorations and resting fish. Does not change the race. ---
var decorRestTimer = 0;

function placeBoughtDecor() {
  var copies = typeof getDecorCopies === "function" ? getDecorCopies() : [];
  if (copies.length === 0) {
    if (typeof ownDecor === "function" && ownDecor("seaweed")) {
      tankEl.insertAdjacentHTML("beforeend", seaweedHtml());
    }
    return;
  }
  var restN = 0;
  var floorN = 0;
  var i;
  var restLeft = [12, 36, 60, 78, 24, 50];
  var restTop = [16, 30, 46, 22, 58, 40];
  for (i = 0; i < copies.length; i += 1) {
    var item = copies[i];
    var node = document.createElement("div");
    node.className = "aquarium-decor";
    node.setAttribute("aria-hidden", "true");
    if (typeof decorShapeHtml === "function") {
      node.innerHTML = decorShapeHtml(item.id);
    } else {
      node.innerHTML = seaweedHtml();
    }
    if (item.rest) {
      node.classList.add("aquarium-decor--rest");
      var spot = restN % 6;
      var row = Math.floor(restN / 6);
      node.style.left = restLeft[spot] + row * 4 + "%";
      node.style.top = restTop[spot] + row * 3 + "%";
      node.style.bottom = "auto";
      restN += 1;
    } else {
      var col = floorN % 8;
      var layer = Math.floor(floorN / 8);
      node.style.left = 4 + col * 11 + (layer % 2) * 3 + "%";
      node.style.bottom = 1.7 + (layer % 4) * 0.4 + "rem";
      floorN += 1;
    }
    tankEl.appendChild(node);
  }
}

function stopDecorRest() {
  if (decorRestTimer) {
    window.clearInterval(decorRestTimer);
    decorRestTimer = 0;
  }
}

function startDecorRest() {
  stopDecorRest();
  if (!tankEl || !tankEl.querySelector(".aquarium-decor--rest")) {
    return;
  }
  decorRestTimer = window.setInterval(checkFishRest, 400);
}

function beginFishRest(swimmer, leaf) {
  swimmer.classList.add("aquarium-swimmer--rest");
  leaf._restBusy = true;
  window.setTimeout(function () {
    if (swimmer.isConnected) {
      swimmer.classList.remove("aquarium-swimmer--rest");
      swimmer._restCool = Date.now() + 2200;
    }
    leaf._restBusy = false;
  }, 1500);
}

function checkFishRest() {
  if (raceOn || !tankEl) {
    return;
  }
  var rests = tankEl.querySelectorAll(".aquarium-decor--rest");
  var fish = tankEl.querySelectorAll(".aquarium-swimmer:not(.aquarium-swimmer--race)");
  var now = Date.now();
  var f;
  var r;
  for (f = 0; f < fish.length; f += 1) {
    var swimmer = fish[f];
    if (swimmer.classList.contains("aquarium-swimmer--rest")) {
      continue;
    }
    if (swimmer._restCool && now < swimmer._restCool) {
      continue;
    }
    var box = swimmer.getBoundingClientRect();
    var fx = box.left + box.width * 0.5;
    var fy = box.top + box.height * 0.55;
    for (r = 0; r < rests.length; r += 1) {
      var leaf = rests[r];
      if (leaf._restBusy) {
        continue;
      }
      var lb = leaf.getBoundingClientRect();
      var lx = lb.left + lb.width * 0.5;
      var ly = lb.top + lb.height * 0.35;
      if (Math.abs(fx - lx) < 52 && Math.abs(fy - ly) < 46) {
        beginFishRest(swimmer, leaf);
        break;
      }
    }
  }
}
