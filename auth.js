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

// End the session on this computer only. The shared account stays saved.
function logOut() {
  if (window.CodeReefProgress && typeof CodeReefProgress.flush === "function") {
    CodeReefProgress.flush();
  }
  var finish = function () {
    localStorage.removeItem("codereef_current_user");
    window.location.href = "index.html";
  };
  if (window.CodeReefCloud && typeof CodeReefCloud.onLogout === "function") {
    CodeReefCloud.onLogout().then(finish, finish);
    return;
  }
  finish();
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

// One kid name is one shared account. Any computer can log in with that name
// and password and stay logged in. Login never kicks another computer off.
// A wrong password does not change the saved account. Log out only clears
// this computer. The eye button shows or hides a password while it is typed.

function bindPasswordEyes() {
  var buttons = document.querySelectorAll(".field__eye");
  var i;
  for (i = 0; i < buttons.length; i += 1) {
    buttons[i].addEventListener("click", function () {
      var wrap = this.parentNode;
      var input = wrap ? wrap.querySelector("input") : null;
      var openIcon = this.querySelector(".field__eye-open");
      var shutIcon = this.querySelector(".field__eye-shut");
      var show;
      if (!input) {
        return;
      }
      show = input.type === "password";
      input.type = show ? "text" : "password";
      this.setAttribute("aria-label", show ? "Hide password" : "Show password");
      this.setAttribute("aria-pressed", show ? "true" : "false");
      if (openIcon) {
        openIcon.hidden = show;
      }
      if (shutIcon) {
        shutIcon.hidden = !show;
      }
      input.focus();
    });
  }
}

bindPasswordEyes();

// Don't wait forever on the parent email. The kid should still get in.
function finishSoon(promise) {
  return new Promise(function (resolve) {
    var timer = setTimeout(function () {
      resolve();
    }, 2500);
    Promise.resolve(promise).then(
      function () {
        clearTimeout(timer);
        resolve();
      },
      function () {
        clearTimeout(timer);
        resolve();
      }
    );
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
