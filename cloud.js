// Shared CodeReef accounts. The same kid name and password work on any computer.
// The remote record stores a password hash and salt, never the password itself.
// This computer keeps the password only after a successful login so Settings can show it.

(function (global) {
  // Public app key. This store echoes the page origin, so both
  // http://127.0.0.1:5173 and https://aaronlee-now.github.io can read and write.
  // Values travel in the URL, so each piece stays short. Passwords are a hash only.
  var APP_KEY = "1hfmrg1w";
  var API = "https://keyvalue.immanuel.co/api/KeyVal";
  var CHUNK = 160;
  var chain = Promise.resolve();
  var pushTimer = 0;
  var pushWaiters = [];
  var heartTimer = 0;
  var raceTimer = 0;
  var presenceId = "";
  var pendingChallenge = null;
  var popupEl = null;

  var GIFT_FLAGS = {
    andrew: [
      "codereef_remove_manta_andrew",
      "codereef_gift_stingray_andrew",
      "codereef_gift_treasure2_andrew",
    ],
    aaron: ["codereef_gift_ultra4_aaron"],
  };

  function enqueue(job) {
    var run = chain.then(job, job);
    chain = run.then(
      function () {},
      function () {}
    );
    return run;
  }

  function slot(name) {
    var clean = String(name).replace(/[^A-Za-z0-9._~-]/g, "~");
    if (clean.length > 36) {
      clean = clean.slice(0, 36);
    }
    return clean;
  }

  function textToB64Url(text) {
    var bytes = new TextEncoder().encode(text);
    var bin = "";
    var i;
    for (i = 0; i < bytes.length; i += 1) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function b64UrlToText(value) {
    var pad = value.length % 4;
    var b64 = String(value).replace(/-/g, "+").replace(/_/g, "/");
    var bin;
    var bytes;
    var i;
    if (pad) {
      b64 += "====".slice(pad);
    }
    bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (i = 0; i < bin.length; i += 1) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function timedFetch(url, options) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var opts = {};
    var key;
    var timer;
    if (options) {
      for (key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          opts[key] = options[key];
        }
      }
    }
    opts.cache = "no-store";
    if (controller) {
      opts.signal = controller.signal;
    }
    timer = setTimeout(function () {
      if (controller) {
        controller.abort();
      }
    }, 8000);
    return fetch(url, opts).then(function (response) {
      clearTimeout(timer);
      return response;
    }, function (error) {
      clearTimeout(timer);
      throw error;
    });
  }

  function readSlot(slotName) {
    return timedFetch(API + "/GetValue/" + APP_KEY + "/" + encodeURIComponent(slotName)).then(function (response) {
      if (!response.ok) {
        throw new Error("load failed " + response.status);
      }
      return response.json().then(function (value) {
        if (value == null || value === "") {
          return "";
        }
        return String(value);
      });
    });
  }

  function writeSlot(slotName, text) {
    if (!text || text.length > CHUNK) {
      throw new Error("save failed");
    }
    return timedFetch(
      API + "/UpdateValue/" + APP_KEY + "/" + encodeURIComponent(slotName) + "/" + encodeURIComponent(text),
      { method: "POST", body: "" }
    ).then(function (response) {
      if (!response.ok) {
        throw new Error("save failed " + response.status);
      }
    });
  }

  function getJson(key) {
    var id = slot(key);
    return readSlot(id + "~n").then(function (countText) {
      var count = parseInt(countText, 10);
      var reads = [];
      var i;
      if (!count || count < 1) {
        return null;
      }
      for (i = 0; i < count; i += 1) {
        reads.push(readSlot(id + "~" + i));
      }
      return Promise.all(reads).then(function (parts) {
        var joined = "";
        for (i = 0; i < parts.length; i += 1) {
          if (!parts[i]) {
            throw new Error("load failed");
          }
          joined += parts[i];
        }
        return JSON.parse(b64UrlToText(joined));
      });
    });
  }

  function putJson(key, value) {
    var id = slot(key);
    var packed = textToB64Url(JSON.stringify(value));
    var parts = [];
    var writes = [];
    var i;
    for (i = 0; i < packed.length; i += CHUNK) {
      parts.push(packed.slice(i, i + CHUNK));
    }
    if (!parts.length) {
      throw new Error("save failed");
    }
    for (i = 0; i < parts.length; i += 1) {
      writes.push(writeSlot(id + "~" + i, parts[i]));
    }
    return Promise.all(writes).then(function () {
      return writeSlot(id + "~n", String(parts.length));
    });
  }

  function queryMap(path) {
    var mark = path.indexOf("?");
    var out = {};
    var route = path;
    var bits;
    var i;
    if (mark !== -1) {
      route = path.slice(0, mark);
      bits = path.slice(mark + 1).split("&");
      for (i = 0; i < bits.length; i += 1) {
        var pair = bits[i].split("=");
        out[decodeURIComponent(pair[0] || "")] = decodeURIComponent((pair[1] || "").replace(/\+/g, " "));
      }
    }
    return { route: route, query: out };
  }

  function asRows(value) {
    return Array.isArray(value) ? value : [];
  }

  function upsertRow(key, item) {
    return getJson(key).then(function (rows) {
      var list = asRows(rows);
      var i;
      var found = false;
      for (i = 0; i < list.length; i += 1) {
        if (list[i] && list[i]._id === item._id) {
          list[i] = item;
          found = true;
        }
      }
      if (!found) {
        list.push(item);
      }
      return putJson(key, list).then(function () {
        return item;
      });
    });
  }

  function newId(prefix) {
    return String(prefix || "id") + "-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  }

  function cloudGet(path) {
    var parsed = queryMap(path);
    var route = parsed.route;
    var query = parsed.query;
    if (route === "/accounts") {
      return getJson("account/" + (query.kidKey || "")).then(function (row) {
        return row ? [row] : [];
      });
    }
    if (route === "/messages") {
      return getJson("messages/" + (query.pair || "")).then(function (rows) {
        return asRows(rows);
      });
    }
    if (route === "/challenges") {
      var who = query.toKey ? "chto/" + query.toKey : "chfrom/" + (query.fromKey || "");
      return getJson(who).then(function (rows) {
        return asRows(rows);
      });
    }
    if (route === "/presence") {
      return getJson("presence/" + (query.kidKey || "")).then(function (row) {
        return row ? [row] : [];
      });
    }
    return Promise.reject(new Error("load failed"));
  }

  function cloudSend(method, path, body) {
    var bits = path.split("?")[0].split("/");
    var kind = bits[1] || "";
    var id = bits[2] ? decodeURIComponent(bits[2]) : "";
    var saved = body || {};
    if (saved.password) {
      delete saved.password;
    }
    if (kind === "accounts" && method === "POST") {
      saved._id = saved.kidKey;
      return putJson("account/" + saved.kidKey, saved).then(function () {
        return saved;
      });
    }
    if (kind === "accounts" && method === "PUT") {
      saved._id = saved.kidKey || id;
      return putJson("account/" + (saved.kidKey || id), saved).then(function () {
        return saved;
      });
    }
    if (kind === "messages" && method === "POST") {
      saved._id = newId(saved.fromKey || "msg");
      return upsertRow("messages/" + saved.pair, saved);
    }
    if (kind === "challenges" && method === "POST") {
      saved._id = newId(saved.fromKey || "race");
      return upsertRow("chto/" + saved.toKey, saved).then(function () {
        return upsertRow("chfrom/" + saved.fromKey, saved);
      });
    }
    if (kind === "challenges" && method === "PUT") {
      saved._id = id;
      return upsertRow("chto/" + saved.toKey, saved).then(function () {
        return upsertRow("chfrom/" + saved.fromKey, saved);
      });
    }
    if (kind === "presence" && method === "POST") {
      saved._id = saved.kidKey;
      return putJson("presence/" + saved.kidKey, saved).then(function () {
        return saved;
      });
    }
    if (kind === "presence" && method === "PUT") {
      saved._id = id || saved.kidKey;
      return putJson("presence/" + saved._id, saved).then(function () {
        return saved;
      });
    }
    return Promise.reject(new Error("save failed"));
  }

  function bytesToHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = "";
    var i;
    for (i = 0; i < bytes.length; i += 1) {
      var piece = bytes[i].toString(16);
      if (piece.length < 2) {
        piece = "0" + piece;
      }
      hex += piece;
    }
    return hex;
  }

  function makeSalt() {
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  }

  function hashPassword(password, salt) {
    var data = new TextEncoder().encode(String(salt) + "\n" + String(password));
    return crypto.subtle.digest("SHA-256", data).then(bytesToHex);
  }

  function sessionKid() {
    var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user || !user.kidName || typeof normalizeName !== "function") {
      return null;
    }
    return {
      key: normalizeName(user.kidName),
      name: user.kidName,
      email: user.parentEmail || "",
    };
  }

  function asList(value) {
    return Array.isArray(value) ? value.slice() : [];
  }

  function editable(row) {
    var copy = {};
    var key;
    if (!row) {
      return copy;
    }
    for (key in row) {
      if (Object.prototype.hasOwnProperty.call(row, key) && key !== "_id") {
        copy[key] = row[key];
      }
    }
    copy.friends = asList(copy.friends);
    copy.incoming = asList(copy.incoming);
    copy.outgoing = asList(copy.outgoing);
    if (!copy.bag || typeof copy.bag !== "object" || Array.isArray(copy.bag)) {
      copy.bag = {};
    }
    if (!copy.giftFlags || typeof copy.giftFlags !== "object" || Array.isArray(copy.giftFlags)) {
      copy.giftFlags = {};
    }
    return copy;
  }

  function hasKey(list, key) {
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i] && list[i].key === key) {
        return true;
      }
    }
    return false;
  }

  function withoutKey(list, key) {
    var out = [];
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (!list[i] || list[i].key !== key) {
        out.push(list[i]);
      }
    }
    return out;
  }

  function matching(rows, field, value) {
    var out = [];
    var i;
    if (!Array.isArray(rows)) {
      return out;
    }
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i] && rows[i][field] === value) {
        out.push(rows[i]);
      }
    }
    return out;
  }

  function findAccount(kidKey) {
    return cloudGet("/accounts?kidKey=" + encodeURIComponent(kidKey)).then(function (rows) {
      var found = matching(rows, "kidKey", kidKey);
      return found.length ? found[0] : null;
    });
  }

  function keyBelongs(storageKey, kidKey) {
    if (!storageKey || !kidKey) {
      return false;
    }
    if (storageKey === "codereef_wallet_" + kidKey) {
      return true;
    }
    if (storageKey === "codereef_last_path_" + kidKey) {
      return true;
    }
    if (storageKey.indexOf("codereef_progress_" + kidKey + "_") === 0) {
      return true;
    }
    if (storageKey.indexOf("codereef_project_" + kidKey + "_") === 0) {
      return true;
    }
    if (storageKey.indexOf("codereef_trail_" + kidKey + "_") === 0) {
      return true;
    }
    return false;
  }

  function collectBag(kidKey) {
    var bag = {};
    var i;
    for (i = 0; i < localStorage.length; i += 1) {
      var storageKey = localStorage.key(i);
      if (keyBelongs(storageKey, kidKey)) {
        bag[storageKey] = localStorage.getItem(storageKey);
      }
    }
    return bag;
  }

  function restoreBag(kidKey, bag) {
    var oldKeys = [];
    var i;
    var storageKey;
    for (i = 0; i < localStorage.length; i += 1) {
      storageKey = localStorage.key(i);
      if (keyBelongs(storageKey, kidKey)) {
        oldKeys.push(storageKey);
      }
    }
    for (i = 0; i < oldKeys.length; i += 1) {
      localStorage.removeItem(oldKeys[i]);
    }
    if (!bag) {
      return;
    }
    for (storageKey in bag) {
      if (Object.prototype.hasOwnProperty.call(bag, storageKey) && keyBelongs(storageKey, kidKey)) {
        if (typeof bag[storageKey] === "string") {
          localStorage.setItem(storageKey, bag[storageKey]);
        }
      }
    }
  }

  function collectFlags(kidKey) {
    var names = GIFT_FLAGS[kidKey] || [];
    var flags = {};
    var i;
    for (i = 0; i < names.length; i += 1) {
      if (localStorage.getItem(names[i])) {
        flags[names[i]] = "1";
      }
    }
    return flags;
  }

  function mergeFlags(remote, local) {
    var out = {};
    var key;
    remote = remote || {};
    local = local || {};
    for (key in remote) {
      if (Object.prototype.hasOwnProperty.call(remote, key) && remote[key]) {
        out[key] = remote[key];
      }
    }
    for (key in local) {
      if (Object.prototype.hasOwnProperty.call(local, key) && local[key]) {
        out[key] = local[key];
      }
    }
    return out;
  }

  function applyFlags(flags) {
    var key;
    if (!flags) {
      return;
    }
    for (key in flags) {
      if (Object.prototype.hasOwnProperty.call(flags, key) && flags[key]) {
        localStorage.setItem(key, String(flags[key]));
      }
    }
  }

  function rememberUser(user) {
    var users = getUsers();
    var needle = normalizeName(user.kidName);
    var i;
    var found = false;
    var saved = {
      kidName: user.kidName,
      parentEmail: user.parentEmail || "",
      password: user.password,
    };
    for (i = 0; i < users.length; i += 1) {
      if (normalizeName(users[i].kidName) === needle) {
        users[i] = saved;
        found = true;
      }
    }
    if (!found) {
      users.push(saved);
    }
    saveUsers(users);
    setCurrentUser(saved);
  }

  function blankAccount(user, kidKey, hash, salt, bag, flags) {
    return {
      kidKey: kidKey,
      kidName: user.kidName,
      parentEmail: user.parentEmail || "",
      passwordHash: hash,
      passwordSalt: salt,
      friends: [],
      incoming: [],
      outgoing: [],
      bag: bag || {},
      giftFlags: flags || {},
      updatedAt: Date.now(),
    };
  }

  function bagHasKeys(bag) {
    var key;
    if (!bag || typeof bag !== "object" || Array.isArray(bag)) {
      return false;
    }
    for (key in bag) {
      if (Object.prototype.hasOwnProperty.call(bag, key)) {
        return true;
      }
    }
    return false;
  }

  var BUSY = "The reef is busy. Try again.";

  function postAccount(body) {
    return cloudSend("POST", "/accounts", body);
  }

  // The button must not spin forever. The shared store also aborts each request.
  function finishWithin(start) {
    return new Promise(function (resolve) {
      var gate = { open: true };
      var timer = setTimeout(function () {
        if (!gate.open) {
          return;
        }
        gate.open = false;
        resolve({ ok: false, message: BUSY });
      }, 8000);
      Promise.resolve(start(gate)).then(function (result) {
        if (!gate.open) {
          return;
        }
        gate.open = false;
        clearTimeout(timer);
        resolve(result);
      }, function () {
        if (!gate.open) {
          return;
        }
        gate.open = false;
        clearTimeout(timer);
        resolve({ ok: false, message: BUSY });
      });
    });
  }

  function enterAccount(user, row, kidKey, gate) {
    if (gate && !gate.open) {
      return { ok: false, message: BUSY };
    }
    rememberUser(user);
    applyFlags(row && row.giftFlags);
    if (row && bagHasKeys(row.bag)) {
      restoreBag(kidKey, row.bag);
    }
    startLive();
    return { ok: true, user: user };
  }

  function signUp(user) {
    var kidKey = normalizeName(user.kidName);
    var salt = makeSalt();
    if (typeof findUserByKidName === "function" && findUserByKidName(user.kidName)) {
      return Promise.resolve({ ok: false, message: "That name is already taken." });
    }
    return finishWithin(function (gate) {
      return findAccount(kidKey).then(function (existing) {
        if (existing) {
          return hashPassword(user.password, existing.passwordSalt).then(function (hash) {
            if (hash !== existing.passwordHash) {
              return { ok: false, message: "That name is already taken." };
            }
            return enterAccount(user, existing, kidKey, gate);
          });
        }
        return hashPassword(user.password, salt).then(function (hash) {
          var body = blankAccount(user, kidKey, hash, salt, {}, {});
          return postAccount(body).then(function () {
            return enterAccount(user, body, kidKey, gate);
          });
        });
      });
    });
  }

  function login(kidName, password) {
    var typed = String(kidName || "").trim().replace(/\s+/g, " ");
    var kidKey = normalizeName(typed);
    if (!typed || !password) {
      return Promise.resolve({ ok: false, message: "Name or password is wrong. Try again." });
    }
    return finishWithin(function (gate) {
      return findAccount(kidKey).then(function (row) {
        if (!row || !row.passwordSalt || !row.passwordHash) {
          // This computer already has the kid, and the shared store does not yet.
          // Save the account there. Log in only after that save works.
          var local = typeof findUserByKidName === "function" ? findUserByKidName(typed) : null;
          if (!local || local.password !== password) {
            return { ok: false, message: "Name or password is wrong. Try again." };
          }
          var salt = makeSalt();
          return hashPassword(password, salt).then(function (hash) {
            var saved = {
              kidName: local.kidName,
              parentEmail: local.parentEmail || "",
              password: password,
            };
            var body = blankAccount(
              local,
              kidKey,
              hash,
              salt,
              collectBag(kidKey),
              mergeFlags({}, collectFlags(kidKey))
            );
            return postAccount(body).then(function () {
              return enterAccount(saved, body, kidKey, gate);
            });
          });
        }
        return hashPassword(password, row.passwordSalt).then(function (hash) {
          if (hash !== row.passwordHash) {
            return { ok: false, message: "Name or password is wrong. Try again." };
          }
          var user = {
            kidName: row.kidName || typed,
            parentEmail: row.parentEmail || "",
            password: password,
          };
          return enterAccount(user, row, kidKey, gate);
        });
      });
    });
  }

  function pushBagNow() {
    var kid = sessionKid();
    if (!kid) {
      return Promise.resolve();
    }
    return enqueue(function () {
      return findAccount(kid.key).then(function (row) {
        if (!row || !row._id) {
          return;
        }
        var body = editable(row);
        body.bag = collectBag(kid.key);
        body.giftFlags = mergeFlags(body.giftFlags, collectFlags(kid.key));
        body.updatedAt = Date.now();
        return cloudSend("PUT", "/accounts/" + row._id, body);
      });
    });
  }

  function pushBag() {
    return new Promise(function (resolve) {
      pushWaiters.push(resolve);
      global.clearTimeout(pushTimer);
      pushTimer = global.setTimeout(function () {
        var waiters = pushWaiters;
        pushWaiters = [];
        pushBagNow().then(
          function () {
            var i;
            for (i = 0; i < waiters.length; i += 1) {
              waiters[i]();
            }
          },
          function () {
            var n;
            for (n = 0; n < waiters.length; n += 1) {
              waiters[n]();
            }
          }
        );
      }, 350);
    });
  }

  function loadMine() {
    var kid = sessionKid();
    if (!kid) {
      return Promise.resolve(null);
    }
    return findAccount(kid.key);
  }

  function saveBoth(mine, mineBody, other, otherBody) {
    return cloudSend("PUT", "/accounts/" + mine._id, mineBody).then(function () {
      return cloudSend("PUT", "/accounts/" + other._id, otherBody);
    });
  }

  function sendFriendRequest(rawName) {
    var kid = sessionKid();
    var typed = String(rawName || "").trim().replace(/\s+/g, " ");
    var themKey;
    if (!kid) {
      return Promise.resolve({ ok: false, message: "Log in first." });
    }
    if (!typed) {
      return Promise.resolve({ ok: false, message: "Type a friend's name." });
    }
    themKey = normalizeName(typed);
    if (themKey === kid.key) {
      return Promise.resolve({ ok: false, message: "That's you!" });
    }
    return enqueue(function () {
      return Promise.all([findAccount(kid.key), findAccount(themKey)]).then(function (rows) {
        var mine = rows[0];
        var theirs = rows[1];
        var mineBody;
        var theirBody;
        if (!mine) {
          return { ok: false, message: "We can't reach your account." };
        }
        if (!theirs) {
          return { ok: false, message: "We can't find that name." };
        }
        mineBody = editable(mine);
        theirBody = editable(theirs);
        if (hasKey(mineBody.friends, themKey) || hasKey(theirBody.friends, kid.key)) {
          return { ok: false, message: "You are already friends." };
        }
        if (hasKey(theirBody.incoming, kid.key) || hasKey(mineBody.outgoing, themKey)) {
          return { ok: false, message: "You already asked." };
        }
        if (hasKey(mineBody.incoming, themKey)) {
          return { ok: false, message: "They already asked you. Tap Accept." };
        }
        mineBody.outgoing.push({ key: themKey, name: theirs.kidName || typed });
        theirBody.incoming.push({ key: kid.key, name: mine.kidName || kid.name });
        return saveBoth(mine, mineBody, theirs, theirBody).then(function () {
          return { ok: true, message: "Asked " + (theirs.kidName || typed) + "!" };
        });
      });
    });
  }

  function answerFriend(theirKey, accept) {
    var kid = sessionKid();
    if (!kid) {
      return Promise.resolve({ ok: false, message: "Log in first." });
    }
    return enqueue(function () {
      return Promise.all([findAccount(kid.key), findAccount(theirKey)]).then(function (rows) {
        var mine = rows[0];
        var theirs = rows[1];
        var mineBody;
        var theirBody;
        var theirName = theirKey;
        if (!mine || !theirs) {
          return { ok: false, message: "We can't find that friend." };
        }
        mineBody = editable(mine);
        theirBody = editable(theirs);
        theirName = theirs.kidName || theirKey;
        mineBody.incoming = withoutKey(mineBody.incoming, theirKey);
        mineBody.outgoing = withoutKey(mineBody.outgoing, theirKey);
        theirBody.incoming = withoutKey(theirBody.incoming, kid.key);
        theirBody.outgoing = withoutKey(theirBody.outgoing, kid.key);
        if (accept) {
          if (!hasKey(mineBody.friends, theirKey)) {
            mineBody.friends.push({ key: theirKey, name: theirName });
          }
          if (!hasKey(theirBody.friends, kid.key)) {
            theirBody.friends.push({ key: kid.key, name: mine.kidName || kid.name });
          }
        }
        return saveBoth(mine, mineBody, theirs, theirBody).then(function () {
          return { ok: true };
        });
      });
    });
  }

  function pairKey(a, b) {
    return a < b ? a + "__" + b : b + "__" + a;
  }

  function sendMessage(toKey, text) {
    var kid = sessionKid();
    var clean = String(text || "").trim();
    if (!kid) {
      return Promise.resolve({ ok: false, message: "Log in first." });
    }
    if (!clean) {
      return Promise.resolve({ ok: false, message: "Type a message." });
    }
    if (clean.length > 80) {
      clean = clean.slice(0, 80);
    }
    return findAccount(kid.key).then(function (mine) {
      var friends = mine ? asList(mine.friends) : [];
      if (!hasKey(friends, toKey)) {
        return { ok: false, message: "You can message friends." };
      }
      return cloudSend("POST", "/messages", {
        pair: pairKey(kid.key, toKey),
        fromKey: kid.key,
        fromName: mine.kidName || kid.name,
        text: clean,
        at: Date.now(),
      }).then(function () {
        return { ok: true };
      });
    });
  }

  function loadMessages(toKey) {
    var kid = sessionKid();
    if (!kid) {
      return Promise.resolve([]);
    }
    return cloudGet("/messages?pair=" + encodeURIComponent(pairKey(kid.key, toKey))).then(function (rows) {
      return matching(rows, "pair", pairKey(kid.key, toKey));
    });
  }

  function bestEnergeticFish() {
    var wallet;
    var best = null;
    var i;
    if (typeof FISH_FOR_SALE === "undefined" || typeof getWallet !== "function") {
      return null;
    }
    wallet = getWallet();
    for (i = 0; i < FISH_FOR_SALE.length; i += 1) {
      var fish = FISH_FOR_SALE[i];
      var count = wallet.fishCounts && wallet.fishCounts[fish.id] ? wallet.fishCounts[fish.id] : 0;
      var energy = typeof energyOf === "function" ? energyOf(wallet, fish.id) : 1;
      if (count > 0 && energy > 0 && (!best || fish.rarity > best.rarity)) {
        best = fish;
      }
    }
    return best;
  }

  function sendChallenge(toKey, toName) {
    var kid = sessionKid();
    var fish;
    if (!kid) {
      return Promise.resolve({ ok: false, message: "Log in first." });
    }
    fish = bestEnergeticFish();
    if (!fish) {
      return Promise.resolve({ ok: false, message: "This fish is hungry. Sprinkle food first." });
    }
    return findAccount(kid.key).then(function (mine) {
      if (!mine || !hasKey(asList(mine.friends), toKey)) {
        return { ok: false, message: "You can race friends." };
      }
      return cloudSend("POST", "/challenges", {
        toKey: toKey,
        toName: toName || toKey,
        fromKey: kid.key,
        fromName: mine.kidName || kid.name,
        fromFishId: fish.id,
        fromFishName: fish.name,
        fromRarity: fish.rarity,
        status: "pending",
        at: Date.now(),
      }).then(function () {
        return { ok: true, message: "You asked " + (toName || "your friend") + " to race!" };
      });
    });
  }

  function ensurePopup() {
    if (popupEl) {
      return popupEl;
    }
    popupEl = document.createElement("div");
    popupEl.id = "race-popup";
    popupEl.hidden = true;
    popupEl.innerHTML =
      '<div class="race-popup__box" role="dialog" aria-modal="true" aria-labelledby="race-popup-text">' +
      '<p class="race-popup__text" id="race-popup-text"></p>' +
      '<div class="race-popup__actions">' +
      '<button type="button" class="race-popup__yes" id="race-popup-yes">Accept</button>' +
      '<button type="button" class="race-popup__no" id="race-popup-no">Decline</button>' +
      "</div></div>";
    document.body.appendChild(popupEl);
    if (!document.getElementById("race-popup-style")) {
      var style = document.createElement("style");
      style.id = "race-popup-style";
      style.textContent =
        "#race-popup{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:rgba(4,24,34,.55);padding:1rem}" +
        "#race-popup[hidden]{display:none}" +
        ".race-popup__box{width:min(24rem,100%);padding:1.1rem 1.2rem;border-radius:1.2rem;background:#0d3b4c;color:#f4fffc;text-align:center}" +
        ".race-popup__text{margin:0 0 .8rem;font-size:1.2rem;font-weight:800}" +
        ".race-popup__actions{display:flex;gap:.6rem;justify-content:center}" +
        ".race-popup__yes,.race-popup__no{border:0;border-radius:999px;padding:.7rem 1rem;font:inherit;font-weight:800;color:#fff;cursor:pointer}" +
        ".race-popup__yes{background:#2a9d8f}.race-popup__no{background:#c46b5a}";
      document.head.appendChild(style);
    }
    popupEl.querySelector("#race-popup-yes").addEventListener("click", function () {
      answerChallenge(true);
    });
    popupEl.querySelector("#race-popup-no").addEventListener("click", function () {
      answerChallenge(false);
    });
    return popupEl;
  }

  function showPopup(challenge) {
    var box = ensurePopup();
    var text = box.querySelector("#race-popup-text");
    pendingChallenge = challenge;
    text.textContent =
      (challenge.fromName || "A friend") +
      " wants to race" +
      (challenge.fromFishName ? " their " + challenge.fromFishName : "") +
      "! Accept or decline?";
    box.hidden = false;
  }

  function hidePopup() {
    pendingChallenge = null;
    if (popupEl) {
      popupEl.hidden = true;
    }
  }

  function answerChallenge(accept) {
    var pending = pendingChallenge;
    var kid = sessionKid();
    var body;
    var fish;
    if (!pending || !pending._id || !kid) {
      return Promise.resolve({ ok: false });
    }
    body = editable(pending);
    if (!accept) {
      body.status = "declined";
      return cloudSend("PUT", "/challenges/" + pending._id, body).then(function () {
        hidePopup();
        return { ok: true };
      });
    }
    fish = bestEnergeticFish();
    if (!fish) {
      var note = ensurePopup().querySelector("#race-popup-text");
      note.textContent = "Your fish are hungry. Sprinkle food first.";
      return Promise.resolve({ ok: false, message: "Your fish are hungry. Sprinkle food first." });
    }
    body.status = "accepted";
    body.toFishId = fish.id;
    body.toFishName = fish.name;
    body.toRarity = fish.rarity;
    body.toName = kid.name;
    return cloudSend("PUT", "/challenges/" + pending._id, body).then(function () {
      body._id = pending._id;
      hidePopup();
      global.dispatchEvent(new CustomEvent("codereef-race", { detail: body }));
      if (!document.getElementById("friend-race")) {
        global.location.href = "friends.html?v=eye1";
      }
      return { ok: true, challenge: body };
    });
  }

  function pollChallenges() {
    var kid = sessionKid();
    if (!kid) {
      return;
    }
    cloudGet("/challenges?toKey=" + encodeURIComponent(kid.key))
      .then(function (rows) {
        var i;
        var newest = null;
        rows = matching(rows, "toKey", kid.key);
        for (i = 0; i < rows.length; i += 1) {
          if (rows[i] && rows[i].status === "pending") {
            if (!newest || (rows[i].at || 0) > (newest.at || 0)) {
              newest = rows[i];
            }
          }
        }
        if (!newest) {
          if (pendingChallenge) {
            hidePopup();
          }
          return;
        }
        if (!pendingChallenge || pendingChallenge._id !== newest._id) {
          showPopup(newest);
        }
      })
      .catch(function () {});
  }

  function beat() {
    var kid = sessionKid();
    if (!kid) {
      return;
    }
    var body = { kidKey: kid.key, lastSeen: Date.now() };
    var write = presenceId
      ? cloudSend("PUT", "/presence/" + presenceId, body)
      : cloudGet("/presence?kidKey=" + encodeURIComponent(kid.key)).then(function (rows) {
          rows = matching(rows, "kidKey", kid.key);
          if (rows.length && rows[0]._id) {
            presenceId = rows[0]._id;
            try {
              localStorage.setItem("codereef_presence_" + kid.key, presenceId);
            } catch (err) {
              // ignore
            }
            return cloudSend("PUT", "/presence/" + presenceId, body);
          }
          return cloudSend("POST", "/presence", body).then(function (created) {
            if (created && created._id) {
              presenceId = created._id;
              try {
                localStorage.setItem("codereef_presence_" + kid.key, presenceId);
              } catch (err2) {
                // ignore
              }
            }
          });
        });
    write.catch(function () {});
  }

  function loadPresence(kidKey) {
    return cloudGet("/presence?kidKey=" + encodeURIComponent(kidKey)).then(function (rows) {
      var best = 0;
      var i;
      rows = matching(rows, "kidKey", kidKey);
      for (i = 0; i < rows.length; i += 1) {
        if (rows[i] && typeof rows[i].lastSeen === "number" && rows[i].lastSeen > best) {
          best = rows[i].lastSeen;
        }
      }
      return best;
    });
  }

  function isFresh(lastSeen) {
    return typeof lastSeen === "number" && Date.now() - lastSeen < 20000;
  }

  function onFriendsPage() {
    return String(global.location.pathname || "").indexOf("friends.html") !== -1;
  }

  function startLive() {
    var kid = sessionKid();
    // Presence and race checks run only on the friends page, so a busy
    // aquarium does not use up the shared store's small request limit.
    if (!kid || heartTimer || !onFriendsPage()) {
      return;
    }
    try {
      presenceId = localStorage.getItem("codereef_presence_" + kid.key) || "";
    } catch (err) {
      presenceId = "";
    }
    beat();
    pollChallenges();
    heartTimer = global.setInterval(beat, 12000);
    raceTimer = global.setInterval(pollChallenges, 5000);
  }

  function onLogout() {
    var kid = sessionKid();
    global.clearInterval(heartTimer);
    global.clearInterval(raceTimer);
    heartTimer = 0;
    raceTimer = 0;
    return pushBagNow().then(function () {
      if (!kid || !presenceId) {
        return;
      }
      return cloudSend("PUT", "/presence/" + presenceId, { kidKey: kid.key, lastSeen: 0 });
    });
  }

  function loadChallenges(which, key) {
    var field = which === "from" ? "fromKey" : "toKey";
    var path = which === "from" ? "/challenges?fromKey=" : "/challenges?toKey=";
    return cloudGet(path + encodeURIComponent(key)).then(function (rows) {
      return matching(rows, field, key);
    });
  }

  global.addEventListener("pagehide", function () {
    if (global.CodeReefProgress && typeof global.CodeReefProgress.flush === "function") {
      global.CodeReefProgress.flush();
    }
    pushBagNow();
  });

  global.CodeReefCloud = {
    signUp: signUp,
    login: login,
    pushBag: pushBag,
    pushBagNow: pushBagNow,
    onLogout: onLogout,
    loadMine: loadMine,
    sendFriendRequest: sendFriendRequest,
    answerFriend: answerFriend,
    sendMessage: sendMessage,
    loadMessages: loadMessages,
    sendChallenge: sendChallenge,
    loadPresence: loadPresence,
    isFresh: isFresh,
    loadChallenges: loadChallenges,
    pairKey: pairKey,
    sessionKid: sessionKid,
  };

  if (sessionKid() && onFriendsPage()) {
    startLive();
  }
})(window);
