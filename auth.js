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

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function findUserByEmail(email) {
  const needle = email.trim().toLowerCase();
  return getUsers().find(function (user) {
    return user.parentEmail.toLowerCase() === needle;
  });
}

function findUserByKidName(kidName) {
  const needle = normalizeName(kidName);
  return getUsers().find(function (user) {
    return normalizeName(user.kidName) === needle;
  });
}

// Tries to email the parent (works with Gmail addresses).
// Uses FormSubmit — the parent may need to confirm the first email once.
function notifyParentOfLogin(user) {
  const subject = "CodeReef login";
  const text =
    user.kidName +
    " just logged into CodeReef. If that was not your diver, change the password.";

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
    }),
  });
}
