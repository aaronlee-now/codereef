// Shared account helpers for CodeReef (saved in this browser only).

function getUsers() {
  const raw = localStorage.getItem("codereef_users");
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

function saveUsers(users) {
  localStorage.setItem("codereef_users", JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem(
    "codereef_current_user",
    JSON.stringify({
      kidName: user.kidName,
      parentEmail: user.parentEmail,
    })
  );
}

function getCurrentUser() {
  const raw = localStorage.getItem("codereef_current_user");
  if (!raw) {
    return null;
  }
  return JSON.parse(raw);
}

// End the session only. Coins, fish, lessons, and projects stay saved under this kid's name.
function logOut() {
  if (window.CodeReefProgress && typeof CodeReefProgress.flush === "function") {
    CodeReefProgress.flush();
  }
  localStorage.removeItem("codereef_current_user");
  window.location.href = "index.html";
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function findUserByKidName(kidName) {
  const needle = normalizeName(kidName);
  return getUsers().find(function (user) {
    return normalizeName(user.kidName) === needle;
  });
}

// FormSubmit's ajax JSON puts these words in the email as plain text.
// It cannot set a real From address, so the name and subject say CodeReef.
// _replyto is only a Reply-To address. We do not invent one.
var CODEREEF_LOGO_URL = "https://aaronlee-now.github.io/codereef/assets/codereef-front-cover.png";

function parentEmailText(lines) {
  return lines.join("\n\n") + "\n\nCodeReef logo:\n" + CODEREEF_LOGO_URL;
}

// Emails the parent (Gmail works). FormSubmit may ask them to tap a link the first time.
// More than one kid can share the same parent email. The address does not have to be unique.
function notifyParent(user, subject, text) {
  if (!user || !user.parentEmail) {
    return Promise.reject(new Error("missing email"));
  }

  return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(user.parentEmail), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: "CodeReef",
      _subject: subject,
      _template: "box",
      message: text,
      _captcha: "false",
    }),
  }).then(function (response) {
    return response.text().then(function (raw) {
      var data = {};
      try {
        data = JSON.parse(raw);
      } catch (error) {
        data = {};
      }
      if (!response.ok || String(data.success) !== "true") {
        throw new Error("email failed");
      }
      return data;
    });
  });
}

function notifyParentOfSignup(user) {
  var kid = user.kidName;
  return notifyParent(
    user,
    "CodeReef: " + kid + " signed up",
    parentEmailText([
      "This message is from CodeReef.",
      "CodeReef is a coding website for kids. Your child practices coding there. This email is a note for you, the parent.",
      kid + " just signed up for CodeReef.",
      "That means a new kid account was created, and this email address was saved as the parent contact. Several kids can share this same parent email. You do not need to do anything. You do not need to reply.",
    ])
  );
}

function notifyParentOfLogin(user) {
  var kid = user.kidName;
  return notifyParent(
    user,
    "CodeReef: " + kid + " signed in",
    parentEmailText([
      "This message is from CodeReef.",
      "CodeReef is a coding website for kids. Your child practices coding there. This email is a note for you, the parent.",
      kid + " just signed in to CodeReef.",
      "Signing in means " +
        kid +
        " opened CodeReef with their name and password. They can practice coding on the site. You do not need to do anything. You do not need to reply.",
    ])
  );
}

// No server, so each computer keeps its own copy. A link code carries one kid
// to a second computer. Both can stay logged in. Nothing here limits devices.

var LINK_CODE_BAD = "That code did not work. Copy it again from the first computer.";
var LINK_CODE_TAKEN = "That name is already on this computer.";

function kidStorageId(kidName) {
  return normalizeName(kidName || "");
}

function bytesToBase64(bytes) {
  var bin = "";
  var size = 0x8000;
  var i;
  for (i = 0; i < bytes.length; i += size) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + size));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBytes(text) {
  var b64 = String(text || "").replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) {
    b64 += "=";
  }
  var bin = atob(b64);
  var bytes = new Uint8Array(bin.length);
  var i;
  for (i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function compressLinkText(text) {
  if (typeof CompressionStream !== "function" || typeof TextEncoder !== "function") {
    return Promise.resolve("CR0." + bytesToBase64(new TextEncoder().encode(text)));
  }
  var stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Response(stream).arrayBuffer().then(function (buf) {
    return "CR1." + bytesToBase64(new Uint8Array(buf));
  });
}

function decodeLinkText(raw) {
  var text = String(raw || "").replace(/\s+/g, "");
  if (!text || text.length > 500000 || text.length < 5) {
    return Promise.resolve(null);
  }
  var kind = text.slice(0, 4);
  var body = text.slice(4);
  var bytes;
  try {
    bytes = base64ToBytes(body);
  } catch (err) {
    return Promise.resolve(null);
  }
  if (kind === "CR0.") {
    try {
      return Promise.resolve(JSON.parse(new TextDecoder().decode(bytes)));
    } catch (err2) {
      return Promise.resolve(null);
    }
  }
  if (kind !== "CR1." || typeof DecompressionStream !== "function") {
    return Promise.resolve(null);
  }
  try {
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream)
      .arrayBuffer()
      .then(function (buf) {
        return JSON.parse(new TextDecoder().decode(new Uint8Array(buf)));
      })
      .catch(function () {
        return null;
      });
  } catch (err3) {
    return Promise.resolve(null);
  }
}

function collectLessonSaves(kid) {
  var saves = {};
  var i;
  var key;
  for (i = 0; i < localStorage.length; i += 1) {
    key = localStorage.key(i);
    if (!key) {
      continue;
    }
    if (key === "codereef_last_path_" + kid) {
      saves.last = localStorage.getItem(key);
      continue;
    }
    if (key.indexOf("codereef_progress_" + kid + "_") === 0) {
      saves["progress:" + key.slice(("codereef_progress_" + kid + "_").length)] = localStorage.getItem(key);
    } else if (key.indexOf("codereef_project_" + kid + "_") === 0) {
      saves["project:" + key.slice(("codereef_project_" + kid + "_").length)] = localStorage.getItem(key);
    } else if (key.indexOf("codereef_trail_" + kid + "_") === 0) {
      saves["trail:" + key.slice(("codereef_trail_" + kid + "_").length)] = localStorage.getItem(key);
    }
  }
  return saves;
}

function lessonStorageKey(kid, saveId) {
  if (saveId === "last") {
    return "codereef_last_path_" + kid;
  }
  var split = String(saveId || "").indexOf(":");
  if (split <= 0) {
    return "";
  }
  var kind = saveId.slice(0, split);
  var rest = saveId.slice(split + 1);
  if (kind !== "progress" && kind !== "project" && kind !== "trail") {
    return "";
  }
  if (!/^[A-Za-z0-9_-]+$/.test(rest)) {
    return "";
  }
  return "codereef_" + kind + "_" + kid + "_" + rest;
}

function linkPayloadFromCurrentKid() {
  var session = getCurrentUser();
  if (!session || !session.kidName) {
    return null;
  }
  var record = findUserByKidName(session.kidName);
  if (!record || typeof record.password !== "string" || !record.password) {
    return null;
  }
  var kid = kidStorageId(record.kidName);
  if (!kid) {
    return null;
  }
  return {
    v: 1,
    kidName: record.kidName,
    parentEmail: record.parentEmail || "",
    password: record.password,
    wallet: localStorage.getItem("codereef_wallet_" + kid),
    saves: collectLessonSaves(kid),
  };
}

function makeLinkCode() {
  if (window.CodeReefProgress && typeof CodeReefProgress.flush === "function") {
    CodeReefProgress.flush();
  }
  var payload = linkPayloadFromCurrentKid();
  if (!payload || !payload.parentEmail) {
    return Promise.reject(new Error("no account"));
  }
  return compressLinkText(JSON.stringify(payload)).catch(function () {
    return "CR0." + bytesToBase64(new TextEncoder().encode(JSON.stringify(payload)));
  });
}

function walletCopyIsOk(wallet) {
  if (wallet == null) {
    return true;
  }
  if (typeof wallet !== "string") {
    return false;
  }
  try {
    var data = JSON.parse(wallet);
    return !!data && typeof data === "object" && !Array.isArray(data);
  } catch (err) {
    return false;
  }
}

function writeWalletCopy(kid, wallet) {
  var key = "codereef_wallet_" + kid;
  if (wallet == null) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, wallet);
}

function writeLessonCopy(kid, saves) {
  var oldKeys = [];
  var i;
  var key;
  for (i = 0; i < localStorage.length; i += 1) {
    key = localStorage.key(i);
    if (!key) {
      continue;
    }
    if (
      key === "codereef_last_path_" + kid ||
      key.indexOf("codereef_progress_" + kid + "_") === 0 ||
      key.indexOf("codereef_project_" + kid + "_") === 0 ||
      key.indexOf("codereef_trail_" + kid + "_") === 0
    ) {
      oldKeys.push(key);
    }
  }
  oldKeys.forEach(function (oldKey) {
    localStorage.removeItem(oldKey);
  });
  if (!saves || typeof saves !== "object") {
    return;
  }
  Object.keys(saves).forEach(function (saveId) {
    var storageKey = lessonStorageKey(kid, saveId);
    var value = saves[saveId];
    if (!storageKey || typeof value !== "string") {
      return;
    }
    localStorage.setItem(storageKey, value);
  });
}

// Puts this kid on the computer that pastes the code. Other kids stay as they are.
function applyLinkCode(raw) {
  return decodeLinkText(raw).then(function (payload) {
    if (!payload || typeof payload !== "object" || payload.v !== 1) {
      return { ok: false, message: LINK_CODE_BAD };
    }

    var kidName = String(payload.kidName || "").trim().replace(/\s+/g, " ");
    var parentEmail = String(payload.parentEmail || "").trim();
    var password = typeof payload.password === "string" ? payload.password : "";
    var kid = kidStorageId(kidName);
    if (!kid || !parentEmail || !password || !walletCopyIsOk(payload.wallet)) {
      return { ok: false, message: LINK_CODE_BAD };
    }
    if (payload.saves != null && typeof payload.saves !== "object") {
      return { ok: false, message: LINK_CODE_BAD };
    }

    var users = getUsers();
    var index = -1;
    var i;
    for (i = 0; i < users.length; i += 1) {
      if (users[i] && kidStorageId(users[i].kidName) === kid) {
        index = i;
        break;
      }
    }

    if (index >= 0 && users[index].password !== password) {
      return { ok: false, message: LINK_CODE_TAKEN };
    }

    if (index === -1) {
      users.push({
        kidName: kidName,
        parentEmail: parentEmail,
        password: password,
      });
    } else {
      users[index].kidName = kidName;
      users[index].parentEmail = parentEmail;
      users[index].password = password;
    }

    try {
      saveUsers(users);
      writeWalletCopy(kid, payload.wallet);
      writeLessonCopy(kid, payload.saves || {});
      setCurrentUser({
        kidName: kidName,
        parentEmail: parentEmail,
      });
    } catch (err) {
      return { ok: false, message: LINK_CODE_BAD };
    }

    return { ok: true };
  });
}

function notifyParentOfLanguageComplete(user, languageName) {
  var kid = user.kidName;
  var language = languageName || "a coding path";
  return notifyParent(
    user,
    "CodeReef: " + kid + " finished " + language,
    parentEmailText([
      "This message is from CodeReef.",
      "CodeReef is a coding website for kids. Your child practices coding there. This email is a note for you, the parent.",
      kid + " finished " + language + " on CodeReef.",
      "That means " +
        kid +
        " finished the skill tasks and the projects for " +
        language +
        ". They practiced on CodeReef until that whole language was done.",
      "You can feel proud of them. A kind word from you will mean a lot. They can keep exploring and try another language on CodeReef when they are ready. You do not need to reply.",
    ])
  );
}
