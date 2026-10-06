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

var selectedKey = "";
var listStamp = "";
var chatStamp = "";
var shownRaces = {};

function setAsk(text) {
  askMsg.textContent = text || "";
}

function friendName(entry) {
  return entry && entry.name ? entry.name : "Friend";
}

function raceSeconds(rarity) {
  var speed = 80 + Number(rarity || 0) * 46;
  if (speed < 1) {
    speed = 1;
  }
  return 7 * ((80 + 46) / speed);
}

function winnerLine(challenge) {
  var fromR = Number(challenge.fromRarity || 0);
  var toR = Number(challenge.toRarity || 0);
  if (fromR === toR) {
    return "It's a tie! You both swam the same.";
  }
  if (fromR > toR) {
    return challenge.fromName + "'s " + (challenge.fromFishName || "fish") + " won!";
  }
  return challenge.toName + "'s " + (challenge.toFishName || "fish") + " won!";
}

function fishImage(id) {
  var i;
  if (typeof FISH_FOR_SALE === "undefined") {
    return "";
  }
  for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
    if (FISH_FOR_SALE[i].id === id) {
      return FISH_FOR_SALE[i].image;
    }
  }
  return "";
}

function spendOnce(challenge) {
  var kid = CodeReefCloud.sessionKid();
  var fishId;
  if (!kid || !challenge || !challenge._id) {
    return;
  }
  if (sessionStorage.getItem("codereef_race_spent_" + challenge._id)) {
    return;
  }
  fishId = kid.key === challenge.fromKey ? challenge.fromFishId : challenge.toFishId;
  if (fishId && typeof spendEnergy === "function") {
    spendEnergy(fishId, typeof RACE_ENERGY_COST === "number" ? RACE_ENERGY_COST : 2);
  }
  sessionStorage.setItem("codereef_race_spent_" + challenge._id, "1");
}

function showRace(challenge) {
  var fromSec;
  var toSec;
  var fromImg;
  var toImg;
  if (!challenge || !challenge._id || shownRaces[challenge._id] || !raceEl) {
    return;
  }
  if (challenge.status !== "accepted") {
    return;
  }
  shownRaces[challenge._id] = true;
  spendOnce(challenge);
  fromSec = raceSeconds(challenge.fromRarity);
  toSec = raceSeconds(challenge.toRarity);
  fromImg = fishImage(challenge.fromFishId);
  toImg = fishImage(challenge.toFishId);
  raceEl.hidden = false;
  raceEl.innerHTML =
    '<h2 class="friend-heading">Race!</h2>' +
    '<div class="friend-lane"><span>' +
    (challenge.fromName || "Friend") +
    "</span>" +
    '<div class="friend-lane__track"><div class="friend-racer" id="racer-from">' +
    '<div class="friend-racer__face">' +
    (fromImg ? '<img src="' + fromImg + '" alt="">' : "") +
    "</div></div></div></div>" +
    '<div class="friend-lane"><span>' +
    (challenge.toName || "Friend") +
    "</span>" +
    '<div class="friend-lane__track"><div class="friend-racer" id="racer-to">' +
    '<div class="friend-racer__face">' +
    (toImg ? '<img src="' + toImg + '" alt="">' : "") +
    "</div></div></div></div>" +
    '<p class="friend-race__result" id="friend-race-result">Go!</p>';
  window.setTimeout(function () {
    var fromEl = document.getElementById("racer-from");
    var toEl = document.getElementById("racer-to");
    if (fromEl) {
      fromEl.style.transition = "left " + fromSec + "s linear";
      fromEl.style.left = "78%";
    }
    if (toEl) {
      toEl.style.transition = "left " + toSec + "s linear";
      toEl.style.left = "78%";
    }
  }, 40);
  window.setTimeout(function () {
    var result = document.getElementById("friend-race-result");
    if (result) {
      result.textContent = winnerLine(challenge);
    }
  }, Math.max(fromSec, toSec) * 1000 + 200);
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
  no.textContent = "No thanks";
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
    CodeReefCloud.sendChallenge(entry.key, friendName(entry)).then(function (result) {
      setAsk(result.message || "");
    });
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

loadAccount();
lookForRace();
window.setInterval(loadAccount, 5000);
window.setInterval(loadChat, 4000);
window.setInterval(lookForRace, 5000);
