// Reef rooms — join up to 6 kids, peek fish, and race together.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var msgEl = document.getElementById("server-msg");
var lobbyEl = document.getElementById("server-lobby");
var listEl = document.getElementById("server-list");
var createForm = document.getElementById("server-create");
var roomEl = document.getElementById("server-room");
var roomTitleEl = document.getElementById("server-room-title");
var roomCountEl = document.getElementById("server-room-count");
var membersEl = document.getElementById("server-members");
var leaveBtn = document.getElementById("server-leave");
var peekEl = document.getElementById("server-peek");
var peekTitleEl = document.getElementById("server-peek-title");
var peekGridEl = document.getElementById("server-peek-grid");
var peekBackBtn = document.getElementById("server-peek-back");
var pickerEl = document.getElementById("friend-picker");
var pickerGridEl = document.getElementById("friend-picker-grid");
var pickerMsgEl = document.getElementById("friend-picker-msg");
var pickerCountEl = document.getElementById("friend-picker-count");
var pickerGoBtn = document.getElementById("friend-picker-go");
var pickerBackBtn = document.getElementById("friend-picker-back");

var me = CodeReefCloud.sessionKid();
var currentServer = null;
var raceTarget = null;
var pendingChallenge = null;
var pickMode = "";
var pickedFishId = "";

function setMsg(text) {
  if (msgEl) {
    msgEl.textContent = text || "";
  }
}

function showLobby() {
  if (lobbyEl) {
    lobbyEl.hidden = false;
  }
  if (roomEl) {
    roomEl.hidden = true;
  }
  if (peekEl) {
    peekEl.hidden = true;
  }
  closePicker();
}

function showRoom() {
  if (lobbyEl) {
    lobbyEl.hidden = true;
  }
  if (roomEl) {
    roomEl.hidden = false;
  }
}

function closePicker() {
  raceTarget = null;
  pendingChallenge = null;
  pickMode = "";
  pickedFishId = "";
  if (pickerEl) {
    pickerEl.hidden = true;
  }
}

function setPickMsg(text) {
  if (pickerMsgEl) {
    pickerMsgEl.textContent = text || "";
  }
}

function refresh() {
  return CodeReefCloud.loadMyServer()
    .then(function (server) {
      currentServer = server;
      if (server) {
        showRoom();
        renderRoom(server);
        return;
      }
      showLobby();
      return CodeReefCloud.listServers().then(renderList);
    })
    .catch(function () {
      setMsg("The reef store is sleepy. Try again.");
    });
}

function renderList(rows) {
  var i;
  listEl.innerHTML = "";
  if (!rows || !rows.length) {
    listEl.textContent = "No open rooms yet. Open one, then friends can join.";
    return;
  }
  for (i = 0; i < rows.length; i += 1) {
    listEl.appendChild(makeServerCard(rows[i]));
  }
}

function makeServerCard(row) {
  var card = document.createElement("div");
  var name = document.createElement("span");
  var meta = document.createElement("span");
  var btn = document.createElement("button");
  card.className = "server-card";
  name.className = "server-card__name";
  name.textContent = row.name || "Reef room";
  meta.className = "server-card__meta";
  meta.textContent = (row.count || 0) + " / " + (row.max || 6);
  btn.type = "button";
  btn.className = "friend-btn";
  btn.textContent = "Join";
  btn.addEventListener("click", function () {
    setMsg("Joining...");
    CodeReefCloud.joinServer(row._id).then(function (result) {
      setMsg(result.message || "");
      if (result.ok) {
        currentServer = result.server;
        showRoom();
        renderRoom(result.server);
      }
    });
  });
  card.appendChild(name);
  card.appendChild(meta);
  card.appendChild(btn);
  return card;
}

function renderRoom(server) {
  var members = (server && server.members) || [];
  var i;
  roomTitleEl.textContent = server.name || "Your room";
  roomCountEl.textContent = members.length + " / 6 kids";
  membersEl.innerHTML = "";
  for (i = 0; i < members.length; i += 1) {
    membersEl.appendChild(makeMemberRow(members[i]));
  }
}

function makeMemberRow(entry) {
  var row = document.createElement("div");
  var name = document.createElement("span");
  var peekBtn = document.createElement("button");
  var raceBtn = document.createElement("button");
  var isMe = me && entry.key === me.key;
  row.className = "server-member";
  name.className = "server-member__name";
  name.textContent = entry.name || entry.key;
  row.appendChild(name);
  if (isMe) {
    var you = document.createElement("span");
    you.className = "server-member__you";
    you.textContent = "you";
    row.appendChild(you);
    return row;
  }
  peekBtn.type = "button";
  peekBtn.className = "friend-btn";
  peekBtn.textContent = "See fish";
  peekBtn.addEventListener("click", function () {
    openPeek(entry);
  });
  raceBtn.type = "button";
  raceBtn.className = "friend-btn";
  raceBtn.textContent = "Race";
  raceBtn.addEventListener("click", function () {
    openRacePick("ask", entry, null);
  });
  row.appendChild(peekBtn);
  row.appendChild(raceBtn);
  return row;
}

function openPeek(entry) {
  var fish = entry.fish || [];
  var i;
  peekEl.hidden = false;
  peekTitleEl.textContent = (entry.name || "Kid") + "'s fish";
  peekGridEl.innerHTML = "";
  if (!fish.length) {
    peekGridEl.textContent = "They have not shown any fish yet.";
    return;
  }
  for (i = 0; i < fish.length; i += 1) {
    peekGridEl.appendChild(makePeekCard(fish[i]));
  }
}

function makePeekCard(fish) {
  var card = document.createElement("div");
  var img = document.createElement("img");
  var label = document.createElement("span");
  card.className = "server-peek__card";
  img.src = fish.image || "";
  img.alt = "";
  label.textContent = fish.name || "Fish";
  card.appendChild(img);
  card.appendChild(label);
  return card;
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

function openRacePick(mode, entry, challenge) {
  pickMode = mode;
  raceTarget = entry;
  pendingChallenge = challenge;
  pickedFishId = "";
  peekEl.hidden = true;
  pickerEl.hidden = false;
  setPickMsg(
    mode === "accept"
      ? "Pick your fish. Then start the race."
      : "Pick one fish to race " + ((entry && entry.name) || "them") + "."
  );
  renderPick();
}

function renderPick() {
  var rows = ownedFish();
  var i;
  pickerGridEl.innerHTML = "";
  if (pickerCountEl) {
    pickerCountEl.textContent = pickedFishId ? "1 fish picked" : "Pick one fish";
  }
  if (!rows.length) {
    pickerGridEl.textContent = "Buy a fish in the shop first.";
    return;
  }
  for (i = 0; i < rows.length; i += 1) {
    pickerGridEl.appendChild(makeFishPick(rows[i]));
  }
}

function makeFishPick(fish) {
  var on = pickedFishId === fish.id;
  var card = document.createElement("div");
  var picBtn = document.createElement("button");
  var img = document.createElement("img");
  var name = document.createElement("span");
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
  picBtn.addEventListener("click", function () {
    pickedFishId = fish.id;
    setPickMsg(fish.name + " will race.");
    renderPick();
  });
  card.appendChild(picBtn);
  pickBtn.type = "button";
  pickBtn.className = "aquarium-pick__btn";
  pickBtn.textContent = on ? "Picked" : "Pick";
  pickBtn.addEventListener("click", function () {
    pickedFishId = fish.id;
    setPickMsg(fish.name + " will race.");
    renderPick();
  });
  card.appendChild(pickBtn);
  return card;
}

createForm.addEventListener("submit", function (event) {
  event.preventDefault();
  var name = createForm.room_name.value;
  setMsg("Opening room...");
  CodeReefCloud.createServer(name).then(function (result) {
    setMsg(result.message || "");
    createForm.room_name.value = "";
    if (result.ok) {
      currentServer = result.server;
      showRoom();
      renderRoom(result.server);
    }
  });
});

leaveBtn.addEventListener("click", function () {
  setMsg("Leaving...");
  CodeReefCloud.leaveServer().then(function () {
    currentServer = null;
    setMsg("You left the room.");
    showLobby();
    refresh();
  });
});

peekBackBtn.addEventListener("click", function () {
  peekEl.hidden = true;
});

pickerGoBtn.addEventListener("click", function () {
  var fish = typeof findFish === "function" ? findFish(pickedFishId) : null;
  if (!fish) {
    setPickMsg("Pick one fish first.");
    return;
  }
  if (pickMode === "ask" && raceTarget) {
    setPickMsg("Asking " + (raceTarget.name || "them") + " to race...");
    CodeReefCloud.sendChallenge(raceTarget.key, raceTarget.name, fish).then(function (result) {
      setPickMsg(result.message || "");
      setMsg(result.message || "");
      if (result.ok) {
        closePicker();
      }
    });
    return;
  }
  if (pickMode === "accept" && pendingChallenge) {
    setPickMsg("Starting the race...");
    CodeReefCloud.answerChallenge(true, fish, pendingChallenge).then(function (result) {
      if (!result || !result.ok) {
        setPickMsg((result && result.message) || "Pick one fish first.");
        return;
      }
      closePicker();
      setMsg("Race starting...");
      window.location.href = "friends.html?v=servers1";
    });
  }
});

pickerBackBtn.addEventListener("click", function () {
  closePicker();
});

window.addEventListener("codereef-race-accept", function (event) {
  if (event.detail) {
    openRacePick(
      "accept",
      { key: event.detail.fromKey, name: event.detail.fromName },
      event.detail
    );
  }
});

window.addEventListener("codereef-race", function () {
  window.location.href = "friends.html?v=servers1";
});

refresh();
window.setInterval(refresh, 5000);
