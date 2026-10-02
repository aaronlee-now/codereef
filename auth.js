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
  return notifyParent(
    user,
    "CodeReef signup",
    user.kidName +
      " just signed up for CodeReef. Several kids can share this same parent email."
  );
}

function notifyParentOfLogin(user) {
  return notifyParent(
    user,
    "CodeReef login",
    user.kidName +
      " just logged into CodeReef. If that was not your diver, change the password."
  );
}

function notifyParentOfLanguageComplete(user, languageName) {
  var language = languageName || "a coding path";
  return notifyParent(
    user,
    "CodeReef: " + language + " complete",
    user.kidName +
      " finished the " +
      language +
      " path on CodeReef (skills, final project, and advanced project)."
  );
}
