// Race friends — requests, online, chat, and a race popup result.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var askForm = document.getElementById("friend-ask");
var askMsg = document.getElementById("friend-ask-msg");
var incomingEl = document.getElementById("friend-incoming");
var outgoingEl = document.getElementById("friend-outgoing");
var listEl = document.getElementById("friend-list");
var chatEl = document.getElementById("friend-chat");
var chatNameEl = document.getElementById("friend-chat-name");
var chatLogEl = document.getElementById("friend-chat-log");
var chatForm = document.getElementById("friend-chat-form");
var raceEl = document.getElementById("friend-race");
var raceMsgEl = document.getElementById("friend-race-msg");
var raceTank = document.getElementById("friend-tank");
var pickerEl = document.getElementById("friend-picker");
var pickerGridEl = document.getElementById("friend-picker-grid");
var pickerMsgEl = document.getElementById("friend-picker-msg");
var pickerCountEl = document.getElementById("friend-picker-count");
var pickerGoBtn = document.getElementById("friend-picker-go");
var pickerBackBtn = document.getElementById("friend-picker-back");

var selectedKey = "";
var listStamp = "";
var chatStamp = "";
var shownRaces = {};
var pickMode = "";
var pickFriend = null;
var pickChallenge = null;
var pickedFishId = "";
var friendRaceFrame = 0;
var friendRaceOn = false;
var friendRaceToken = 0;

function setAsk(text) {
  askMsg.textContent = text || "";
}

function friendName(entry) {
  return entry && entry.name ? entry.name : "Friend";
}

function raceNoteKey(kind, challenge) {
  var kid = CodeReefCloud.sessionKid();
  if (!kid || !challenge || !challenge._id) {
    return "";
  }
  return "codereef_race_" + kind + "_" + kid.key + "_" + challenge._id;
}

function spendOnce(challenge) {
  var kid = CodeReefCloud.sessionKid();
  var fishId;
  var note;
  if (!kid || !challenge || !challenge._id) {
    return;
  }
  note = raceNoteKey("spent", challenge);
  try {
    if (note && localStorage.getItem(note)) {
      return;
    }
  } catch (err) {
    return;
  }
  fishId = kid.key === challenge.fromKey ? challenge.fromFishId : challenge.toFishId;
  if (fishId && typeof spendEnergy === "function") {
    spendEnergy(fishId, typeof RACE_ENERGY_COST === "number" ? RACE_ENERGY_COST : 2);
  }
  try {
    if (note) {
      localStorage.setItem(note, "1");
    }
  } catch (err2) {
    // The race can still play if this browser cannot save the note.
  }
}

function myRaceFishId(challenge) {
  var kid = CodeReefCloud.sessionKid();
  if (!kid || !challenge) {
    return "";
  }
  if (kid.key === challenge.fromKey) {
    return challenge.fromFishId || "";
  }
  return challenge.toFishId || "";
}

function showRace(challenge) {
  var mineId;
  var seen;
  if (!challenge || !challenge._id || shownRaces[challenge._id] || !raceEl) {
    return;
  }
  if (challenge.status !== "accepted" || !challenge.fromFishId || !challenge.toFishId) {
    return;
  }
  seen = raceNoteKey("watched", challenge);
  try {
    if (seen && localStorage.getItem(seen)) {
      return;
    }
  } catch (err) {
    // Keep going. A missing note should not hide the race.
  }
  mineId = myRaceFishId(challenge);
  if (mineId && typeof energyOf === "function" && energyOf(getWallet(), mineId) <= 0) {
    openRaceStage();
    setFriendRaceMsg("This fish is hungry. Sprinkle food first.");
    return;
  }
  shownRaces[challenge._id] = true;
  spendOnce(challenge);
  closeFriendPick();
  openRaceStage();
  startFriendSwim(challenge);
}

function paintOnline(key, lastSeen) {
  var box = document.querySelector('[data-online="' + key + '"]');
  var on = CodeReefCloud.isFresh(lastSeen);
  if (!box) {
    return;
  }
  box.textContent = on ? "Online" : "Offline";
  box.className = "online-box" + (on ? " online-box--on" : "");
}

function refreshOnline(friends) {
  var i;
  for (i = 0; i < friends.length; i += 1) {
    CodeReefCloud.loadPresence(friends[i].key).then(
      (function (key) {
        return function (lastSeen) {
          paintOnline(key, lastSeen);
        };
      })(friends[i].key)
    ).catch(function () {});
  }
}

function renderLists(account) {
  var incoming = account && account.incoming ? account.incoming : [];
  var outgoing = account && account.outgoing ? account.outgoing : [];
  var friends = account && account.friends ? account.friends : [];
  var stamp = JSON.stringify({ incoming: incoming, outgoing: outgoing, friends: friends });
  var i;
  if (stamp === listStamp) {
    refreshOnline(friends);
    return;
  }
  listStamp = stamp;
  incomingEl.innerHTML = "";
  outgoingEl.innerHTML = "";
  listEl.innerHTML = "";
  if (!incoming.length) {
    incomingEl.textContent = "No requests yet.";
  }
  for (i = 0; i < incoming.length; i += 1) {
    incomingEl.appendChild(requestRow(incoming[i]));
  }
  if (!outgoing.length) {
    outgoingEl.textContent = "You have not asked anyone.";
  }
  for (i = 0; i < outgoing.length; i += 1) {
    var sent = document.createElement("p");
    sent.textContent = "Waiting for " + friendName(outgoing[i]) + " to say yes.";
    outgoingEl.appendChild(sent);
  }
  if (!friends.length) {
    listEl.textContent = "No friends yet.";
  }
  for (i = 0; i < friends.length; i += 1) {
    listEl.appendChild(friendRow(friends[i]));
  }
  refreshOnline(friends);
}

function requestRow(entry) {
  var row = document.createElement("p");
  row.className = "friend-row";
  row.textContent = friendName(entry) + " wants to be friends. ";
  var yes = document.createElement("button");
  yes.type = "button";
  yes.className = "friend-btn";
  yes.textContent = "Accept";
  yes.addEventListener("click", function () {
    CodeReefCloud.answerFriend(entry.key, true).then(function () {
      loadAccount();
    });
  });
  var no = document.createElement("button");
  no.type = "button";
  no.className = "friend-btn friend-btn--no";
  no.textContent = "Decline";
  no.addEventListener("click", function () {
    CodeReefCloud.answerFriend(entry.key, false).then(function () {
      loadAccount();
    });
  });
  row.appendChild(yes);
  row.appendChild(document.createTextNode(" "));
  row.appendChild(no);
  return row;
}

function friendRow(entry) {
  var row = document.createElement("div");
  row.className = "friend-row";
  var name = document.createElement("strong");
  name.textContent = friendName(entry);
  var online = document.createElement("span");
  online.className = "online-box";
  online.setAttribute("data-online", entry.key);
  online.textContent = "Offline";
  var chatBtn = document.createElement("button");
  chatBtn.type = "button";
  chatBtn.className = "friend-btn";
  chatBtn.textContent = "Chat";
  chatBtn.addEventListener("click", function () {
    openChat(entry);
  });
  var raceBtn = document.createElement("button");
  raceBtn.type = "button";
  raceBtn.className = "friend-btn";
  raceBtn.textContent = "Race";
  raceBtn.addEventListener("click", function () {
    openFriendPick({ mode: "ask", friend: entry });
  });
  row.appendChild(name);
  row.appendChild(online);
  row.appendChild(chatBtn);
  row.appendChild(raceBtn);
  return row;
}

function openChat(entry) {
  selectedKey = entry.key;
  chatEl.hidden = false;
  chatNameEl.textContent = "Chat with " + friendName(entry);
  chatStamp = "";
  loadChat();
}

function loadChat() {
  if (!selectedKey) {
    return;
  }
  CodeReefCloud.loadMessages(selectedKey).then(function (rows) {
    var lines = rows.slice().sort(function (a, b) {
      return (a.at || 0) - (b.at || 0);
    });
    var stamp = JSON.stringify(lines.map(function (row) {
      return row._id || row.at + row.text;
    }));
    var i;
    if (stamp === chatStamp) {
      return;
    }
    chatStamp = stamp;
    chatLogEl.innerHTML = "";
    for (i = 0; i < lines.length; i += 1) {
      var item = document.createElement("p");
      item.className = "friend-chat__line";
      item.textContent = (lines[i].fromName || "Friend") + ": " + (lines[i].text || "");
      chatLogEl.appendChild(item);
    }
    chatLogEl.scrollTop = chatLogEl.scrollHeight;
  }).catch(function () {});
}

function loadAccount() {
  CodeReefCloud.loadMine().then(function (account) {
    renderLists(account || { incoming: [], outgoing: [], friends: [] });
  }).catch(function () {
    setAsk("We can't reach the reef. Try again.");
  });
}

function lookForRace() {
  var kid = CodeReefCloud.sessionKid();
  if (!kid) {
    return;
  }
  Promise.all([
    CodeReefCloud.loadChallenges("from", kid.key),
    CodeReefCloud.loadChallenges("to", kid.key),
  ]).then(function (parts) {
    var rows = parts[0].concat(parts[1]);
    var i;
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i] && rows[i].status === "accepted") {
        showRace(rows[i]);
      }
    }
  }).catch(function () {});
}

askForm.addEventListener("submit", function (event) {
  event.preventDefault();
  var name = askForm.friend_name.value;
  CodeReefCloud.sendFriendRequest(name).then(function (result) {
    setAsk(result.message || (result.ok ? "Asked!" : "Try again."));
    if (result.ok) {
      askForm.friend_name.value = "";
      loadAccount();
    }
  }).catch(function () {
    setAsk("We can't reach the reef. Try again.");
  });
});

chatForm.addEventListener("submit", function (event) {
  event.preventDefault();
  var text = chatForm.text.value;
  if (!selectedKey) {
    return;
  }
  CodeReefCloud.sendMessage(selectedKey, text).then(function (result) {
    if (!result.ok) {
      setAsk(result.message || "You can message friends.");
      return;
    }
    chatForm.text.value = "";
    chatStamp = "";
    loadChat();
  });
});

window.addEventListener("codereef-race", function (event) {
  if (event.detail) {
    showRace(event.detail);
  }
});

window.addEventListener("codereef-race-accept", function (event) {
  if (event.detail) {
    openFriendPick({ mode: "accept", challenge: event.detail });
  }
});

if (pickerGoBtn) {
  pickerGoBtn.addEventListener("click", startPickedRace);
}
if (pickerBackBtn) {
  pickerBackBtn.addEventListener("click", function () {
    closeFriendPick();
    setPickMsg("");
  });
}

loadAccount();
lookForRace();
window.setInterval(loadAccount, 5000);
window.setInterval(loadChat, 4000);
window.setInterval(lookForRace, 5000);

function setPickMsg(text) {
  if (pickerMsgEl) {
    pickerMsgEl.textContent = text || "";
  }
}

function setFriendRaceMsg(text, win) {
  if (!raceMsgEl) {
    return;
  }
  raceMsgEl.textContent = text || "";
  raceMsgEl.className = "aquarium-race-msg" + (win ? " aquarium-race-msg--win" : "");
}

function openRaceStage() {
  if (raceEl) {
    raceEl.hidden = false;
    if (raceEl.scrollIntoView) {
      raceEl.scrollIntoView({ block: "nearest" });
    }
  }
}

function closeFriendPick() {
  pickMode = "";
  pickFriend = null;
  pickChallenge = null;
  if (pickerEl) {
    pickerEl.hidden = true;
  }
}

function ownedFish() {
  var wallet = typeof getWallet === "function" ? getWallet() : { fishCounts: {} };
  var counts = wallet.fishCounts || {};
  var list = [];
  var i;
  if (typeof FISH_FOR_SALE === "undefined") {
    return list;
  }
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    if ((counts[FISH_FOR_SALE[i].id] || 0) > 0) {
      list.push(FISH_FOR_SALE[i]);
    }
  }
  return list;
}

function chooseFish(fish) {
  var energy = typeof energyOf === "function" ? energyOf(getWallet(), fish.id) : 1;
  if (energy <= 0) {
    setPickMsg("This fish is hungry. Sprinkle food first.");
    return;
  }
  pickedFishId = fish.id;
  setPickMsg(fish.name + " will race.");
  renderFriendPick();
}

function renderFriendPick() {
  var rows;
  var i;
  if (!pickerGridEl) {
    return;
  }
  rows = ownedFish();
  if (pickerCountEl) {
    pickerCountEl.textContent = pickedFishId ? "1 fish picked" : "Pick one fish";
  }
  pickerGridEl.innerHTML = "";
  if (!rows.length) {
    pickerGridEl.textContent = "Buy a fish in the shop first.";
    return;
  }
  for (i = 0; i < rows.length; i += 1) {
    pickerGridEl.appendChild(makeFishPick(rows[i]));
  }
}

function makeFishPick(fish) {
  var energy = typeof energyOf === "function" ? energyOf(getWallet(), fish.id) : 1;
  var hungry = energy <= 0;
  var on = pickedFishId === fish.id;
  var card = document.createElement("div");
  var picBtn = document.createElement("button");
  var img = document.createElement("img");
  var name = document.createElement("span");
  var energyLine = document.createElement("span");
  var bar = document.createElement("span");
  var pickBtn = document.createElement("button");
  card.className = "aquarium-pick" + (on ? " aquarium-pick--on" : "");
  picBtn.type = "button";
  picBtn.className = "aquarium-pick__fish";
  img.src = fish.image || "";
  img.alt = "";
  picBtn.appendChild(img);
  name.className = "aquarium-pick__name";
  name.textContent = fish.name;
  picBtn.appendChild(name);
  energyLine.className = "aquarium-pick__energy";
  energyLine.textContent = typeof energyWord === "function" ? energyWord(energy) : "";
  bar.className = "energy-bar";
  bar.innerHTML = '<span style="width:' + Math.round((energy / (typeof ENERGY_MAX === "number" ? ENERGY_MAX : 6)) * 100) + '%"></span>';
  energyLine.appendChild(bar);
  picBtn.appendChild(energyLine);
  picBtn.addEventListener("click", function () {
    chooseFish(fish);
  });
  card.appendChild(picBtn);
  pickBtn.type = "button";
  pickBtn.className = "aquarium-pick__btn";
  pickBtn.textContent = hungry ? "Hungry" : on ? "Picked" : "Pick";
  pickBtn.setAttribute("aria-label", (on ? "Picked " : "Pick ") + fish.name);
  pickBtn.addEventListener("click", function () {
    chooseFish(fish);
  });
  card.appendChild(pickBtn);
  return card;
}

function openFriendPick(job) {
  pickMode = job && job.mode ? job.mode : "ask";
  pickFriend = job && job.friend ? job.friend : null;
  pickChallenge = job && job.challenge ? job.challenge : null;
  pickedFishId = "";
  if (!pickerEl) {
    return;
  }
  pickerEl.hidden = false;
  setPickMsg(pickMode === "accept" ? "Pick your fish. Then start the race." : "Pick one fish with energy.");
  renderFriendPick();
  if (pickerEl.scrollIntoView) {
    pickerEl.scrollIntoView({ block: "nearest" });
  }
}

function startPickedRace() {
  var fish = typeof findFish === "function" ? findFish(pickedFishId) : null;
  var friend;
  var challenge;
  if (!fish) {
    setPickMsg("Pick one fish first.");
    return;
  }
  if (typeof energyOf === "function" && energyOf(getWallet(), fish.id) <= 0) {
    setPickMsg("This fish is hungry. Sprinkle food first.");
    return;
  }
  if (pickMode === "ask" && pickFriend) {
    friend = pickFriend;
    setPickMsg("Asking " + friendName(friend) + " to race...");
    CodeReefCloud.sendChallenge(friend.key, friendName(friend), fish).then(function (result) {
      setAsk(result.message || "");
      setPickMsg(result.message || "");
      if (result.ok) {
        closeFriendPick();
      }
    }).catch(function () {
      setPickMsg("We can't reach the reef. Try again.");
    });
    return;
  }
  if (pickMode === "accept" && pickChallenge) {
    challenge = pickChallenge;
    setPickMsg("Starting the race...");
    CodeReefCloud.answerChallenge(true, fish, challenge).then(function (result) {
      if (!result || !result.ok) {
        setPickMsg((result && result.message) || "This fish is hungry. Sprinkle food first.");
        return;
      }
      closeFriendPick();
      if (result.challenge) {
        showRace(result.challenge);
      }
    }).catch(function () {
      setPickMsg("We can't reach the reef. Try again.");
    });
  }
}

// Same swim, speed, and obstacles as the aquarium race.
// The camera follows your fish. A shared seed keeps both kids on one course.
var FRIEND_COURSE_TANKS = 4.2;
var FRIEND_OBSTACLE_KINDS = ["rock", "coral", "weed", "castle", "bubbles", "starfish", "shell"];

function raceSeed(id) {
  var text = String(id || "race");
  var h = 2166136261;
  var i;
  for (i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRaceRand(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    var t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function friendRaceSpeed(rarity, rand) {
  var wobble = (rand() - 0.5) * 8;
  return 80 + Number(rarity || 0) * 46 + wobble;
}

function friendClamp(n, lo, hi) {
  if (n < lo) {
    return lo;
  }
  if (n > hi) {
    return hi;
  }
  return n;
}

function friendObstacleMarkup(kind) {
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

function friendPlanObstacles(rand) {
  var count = 14 + Math.floor(rand() * 3);
  var spots = [];
  var i;
  var lastKind = "";
  var edge = 0.06;
  var end = 0.94;
  var slot = (end - edge) / count;
  for (i = 0; i < count; i += 1) {
    var kind = FRIEND_OBSTACLE_KINDS[Math.floor(rand() * FRIEND_OBSTACLE_KINDS.length)];
    var guard = 0;
    while (kind === lastKind && guard < 8) {
      kind = FRIEND_OBSTACLE_KINDS[Math.floor(rand() * FRIEND_OBSTACLE_KINDS.length)];
      guard += 1;
    }
    lastKind = kind;
    spots.push({
      kind: kind,
      along: friendClamp(edge + slot * i + slot * (0.35 + rand() * 0.3), edge, end),
      band: friendClamp(0.08 + rand() * 0.76, 0.05, 0.88),
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
        spots[i].band = friendClamp(spots[i].band + 0.34, 0.05, 0.88);
      } else {
        spots[i].band = friendClamp(spots[i].band - 0.34, 0.05, 0.88);
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

function friendShuffleLanes(count, rand) {
  var lanes = [];
  var i;
  for (i = 0; i < count; i += 1) {
    lanes.push(i);
  }
  for (i = lanes.length - 1; i > 0; i -= 1) {
    var j = Math.floor(rand() * (i + 1));
    var swap = lanes[i];
    lanes[i] = lanes[j];
    lanes[j] = swap;
  }
  return lanes;
}

function friendFishFace(fish, cursor) {
  var worn = "";
  if (typeof nextWornOutfit === "function") {
    worn = nextWornOutfit(fish.id, cursor);
  }
  if (typeof reefFishMarkup === "function") {
    return reefFishMarkup(fish, worn);
  }
  return '<span class="reef-fish"><img class="reef-fish__img" src="' + (fish.image || "") + '" alt=""></span>';
}

function friendHeavy(fish) {
  return fish.kind === "shark" || fish.kind === "octopus" || fish.kind === "turtle";
}

function fishForRace(id, name, rarity) {
  var found = typeof findFish === "function" ? findFish(id) : null;
  if (found) {
    return found;
  }
  return { id: id || "fish", name: name || "Fish", image: "", kind: "fish", rarity: Number(rarity) || 0 };
}

function storedRarity(fish, stored) {
  var n = Number(stored);
  if (stored !== null && stored !== undefined && stored !== "" && !isNaN(n)) {
    return n;
  }
  if (fish && typeof fish.rarity === "number") {
    return fish.rarity;
  }
  return 0;
}

function friendMeasureObstacles() {
  var nodes = raceTank.querySelectorAll(".aquarium-obstacle");
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

function friendSteerY(racer, obstacles) {
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

function friendLayoutObstacles(tankH, sandH, finishX, leadX) {
  var nodes = raceTank.querySelectorAll(".aquarium-obstacle");
  var waterTop = 8;
  var waterBot = tankH - sandH - 8;
  var lastX = finishX - 64;
  var span = lastX - leadX;
  var i;
  if (span < 80) {
    span = 80;
  }
  for (i = 0; i < nodes.length; i += 1) {
    var along = parseFloat(nodes[i].getAttribute("data-along"));
    var band = parseFloat(nodes[i].getAttribute("data-band"));
    var nodeH;
    var room;
    var y;
    var x;
    if (isNaN(along)) {
      along = (i + 1) / (nodes.length + 1);
    }
    if (isNaN(band)) {
      band = 0.4;
    }
    nodeH = nodes[i].offsetHeight || 70;
    room = waterBot - waterTop - nodeH;
    if (room < 0) {
      room = 0;
    }
    y = waterTop + room * band;
    x = leadX + span * along;
    nodes[i].style.left = Math.round(x) + "px";
    nodes[i].style.top = Math.round(y) + "px";
  }
}

function friendWinLine(winner, racers) {
  var other = null;
  var i;
  for (i = 0; i < racers.length; i += 1) {
    if (racers[i] !== winner) {
      other = racers[i];
    }
  }
  if (other && Number(winner.rarity) === Number(other.rarity)) {
    return "It's a tie! You both swam the same.";
  }
  if (winner.mine) {
    return "Your " + winner.fish.name + " won!";
  }
  return (winner.kidName || "Your friend") + "'s " + winner.fish.name + " won!";
}

function stopFriendRace() {
  friendRaceOn = false;
  friendRaceToken += 1;
  if (friendRaceFrame) {
    window.cancelAnimationFrame(friendRaceFrame);
    friendRaceFrame = 0;
  }
}

function startFriendSwim(challenge) {
  var kid = CodeReefCloud.sessionKid();
  var rand = makeRaceRand(raceSeed(challenge._id));
  var spots;
  var world;
  var worldSand;
  var lanes;
  var specs;
  var racers = [];
  var cursor = {};
  var i;
  if (!raceTank || !kid) {
    return;
  }
  stopFriendRace();
  friendRaceToken += 1;
  var token = friendRaceToken;
  var old = raceTank.querySelectorAll(".aquarium-race-world");
  for (i = 0; i < old.length; i += 1) {
    old[i].remove();
  }
  spots = friendPlanObstacles(rand);
  world = document.createElement("div");
  world.className = "aquarium-race-world";
  world.style.visibility = "hidden";
  world.style.position = "absolute";
  world.style.top = "0";
  world.style.left = "0";
  world.style.height = "100%";
  worldSand = document.createElement("div");
  worldSand.className = "aquarium-race-world__sand";
  worldSand.setAttribute("aria-hidden", "true");
  world.appendChild(worldSand);
  raceTank.appendChild(world);
  raceTank.classList.add("aquarium-tank--racing");
  for (i = 0; i < spots.length; i += 1) {
    var node = document.createElement("div");
    node.className = "aquarium-obstacle aquarium-obstacle--" + spots[i].kind;
    node.setAttribute("data-along", String(spots[i].along));
    node.setAttribute("data-band", String(spots[i].band));
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = friendObstacleMarkup(spots[i].kind);
    world.appendChild(node);
  }
  var finish = document.createElement("div");
  finish.className = "aquarium-finish";
  finish.setAttribute("aria-hidden", "true");
  finish.innerHTML = "<span>Finish</span>";
  world.appendChild(finish);
  setFriendRaceMsg("Watch them dodge the reef!");
  lanes = friendShuffleLanes(2, rand);
  specs = [
    {
      fish: fishForRace(challenge.fromFishId, challenge.fromFishName, challenge.fromRarity),
      rarity: storedRarity(null, challenge.fromRarity),
      kidName: challenge.fromName || "Friend",
      mine: kid.key === challenge.fromKey,
    },
    {
      fish: fishForRace(challenge.toFishId, challenge.toFishName, challenge.toRarity),
      rarity: storedRarity(null, challenge.toRarity),
      kidName: challenge.toName || "Friend",
      mine: kid.key === challenge.toKey,
    },
  ];
  for (i = 0; i < specs.length; i += 1) {
    var spec = specs[i];
    var swimmer = document.createElement("div");
    var scale = 0.94 + (i % 3) * 0.03;
    swimmer.className = "aquarium-swimmer aquarium-swimmer--right aquarium-swimmer--race";
    swimmer.setAttribute("aria-label", spec.fish.name);
    swimmer.setAttribute("data-mine", spec.mine ? "1" : "0");
    swimmer.innerHTML = '<div class="aquarium-swimmer__face">' + friendFishFace(spec.fish, cursor) + "</div>";
    swimmer.style.setProperty("--fish-scale", String(scale));
    swimmer.style.setProperty("--stroke", friendHeavy(spec.fish) ? "2.4s" : "1.05s");
    swimmer.style.setProperty("--stroke-delay", -(i * 0.37) + "s");
    world.appendChild(swimmer);
    racers.push({
      el: swimmer,
      fish: spec.fish,
      rarity: spec.rarity,
      kidName: spec.kidName,
      mine: spec.mine,
      lane: lanes[i],
      speed: friendRaceSpeed(spec.rarity, rand),
      phase: rand() * 6.28,
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
  window.requestAnimationFrame(function () {
    if (token !== friendRaceToken) {
      return;
    }
    var tankW = raceTank.clientWidth;
    var tankH = raceTank.clientHeight;
    var courseW = Math.round(tankW * FRIEND_COURSE_TANKS);
    var sand;
    var sandH;
    var finishEl;
    var finishX;
    var widest = 1;
    var fastest = 1;
    var n;
    world.style.width = courseW + "px";
    sand = raceTank.querySelector(".aquarium-tank__sand");
    sandH = sand ? sand.offsetHeight : 40;
    finishEl = world.querySelector(".aquarium-finish");
    finishX = finishEl ? finishEl.offsetLeft : courseW - 16;
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
    friendLayoutObstacles(tankH, sandH, finishX, leadX);
    world.style.visibility = "visible";
    var obstacles = friendMeasureObstacles();
    for (n = 0; n < racers.length; n += 1) {
      var placed = racers[n];
      var spanY = racers.length === 1 ? 0 : 0;
      var step = 0;
      placed.minY = 4;
      placed.maxY = tankH - sandH - placed.h - 6;
      if (placed.maxY < placed.minY) {
        placed.maxY = placed.minY;
      }
      spanY = racers.length === 1 ? 0 : placed.maxY - placed.minY;
      step = racers.length === 1 ? 0 : spanY / (racers.length - 1);
      placed.laneY = placed.minY + placed.lane * step;
      placed.x = 2;
      placed.y = placed.laneY;
      placed.el.style.left = placed.x + "px";
      placed.el.style.top = placed.y + "px";
    }
    var last = 0;
    var elapsed = 0;
    var winner = null;
    var cameraX = 0;
    friendRaceOn = true;
    function frame(now) {
      if (!friendRaceOn || token !== friendRaceToken) {
        return;
      }
      if (!last) {
        last = now;
      }
      var dt = Math.min(0.05, (now - last) / 1000);
      var burst;
      var allDone = true;
      var r;
      last = now;
      elapsed += dt;
      burst = elapsed < 0.5 ? elapsed / 0.5 : 1;
      for (r = 0; r < racers.length; r += 1) {
        var fishR = racers[r];
        if (!fishR.done) {
          var flutter;
          var goal;
          var park;
          allDone = false;
          flutter = 1 + 0.02 * Math.sin(elapsed * 2.4 + fishR.phase);
          fishR.x += fishR.speed * burst * flutter * dt;
          goal = friendSteerY(fishR, obstacles);
          fishR.y += (goal - fishR.y) * Math.min(1, dt * 12);
          if (fishR.y < fishR.minY) {
            fishR.y = fishR.minY;
          }
          if (fishR.y > fishR.maxY) {
            fishR.y = fishR.maxY;
          }
          park = courseW - fishR.w - 8;
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
      var follow = racers[0];
      var look;
      for (look = 0; look < racers.length; look += 1) {
        if (racers[look].mine) {
          follow = racers[look];
        }
      }
      var nose = follow.x + follow.w;
      var viewMax = courseW - tankW;
      var viewGoal;
      if (viewMax < 0) {
        viewMax = 0;
      }
      viewGoal = nose - tankW * 0.36;
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
          if (!leader || maybe.rarity > leader.rarity || (maybe.rarity === leader.rarity && maybe.x > leader.x)) {
            leader = maybe;
          }
        }
        if (leader) {
          winner = leader;
          leader.el.classList.add("aquarium-swimmer--winner");
          setFriendRaceMsg(friendWinLine(leader, racers), true);
        }
      }
      if (allDone || elapsed > 40) {
        try {
          var doneNote = raceNoteKey("watched", challenge);
          if (doneNote) {
            localStorage.setItem(doneNote, "1");
          }
        } catch (err) {
          // The next visit can show the race again.
        }
        stopFriendRace();
        return;
      }
      friendRaceFrame = window.requestAnimationFrame(frame);
    }
    friendRaceFrame = window.requestAnimationFrame(frame);
  });
}
