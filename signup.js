const form = document.querySelector(".auth__form");
const message = document.querySelector(".auth__message");
const codeHint = document.querySelector("#code-hint");
const codeField = document.querySelector("#code-field");
const codeInput = form.parent_code;
const submitButton = form.querySelector(".auth__submit");

// Kept in memory until the code matches. The account is not saved yet.
let pendingSignup = null;

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (pendingSignup) {
    finishSignup();
    return;
  }

  beginSignup();
});

function showError(text) {
  message.textContent = text;
  message.hidden = false;
  message.classList.remove("auth__message--ok");
}

function showNote(text) {
  message.textContent = text;
  message.hidden = false;
  message.classList.add("auth__message--ok");
}

function hideMessage() {
  message.hidden = true;
  message.textContent = "";
  message.classList.remove("auth__message--ok");
}

function setButton(text, busy) {
  submitButton.disabled = busy;
  submitButton.textContent = text;
}

// A normal email looks like name@place.com. Gmail and other real domains are ok.
function emailLooksReal(email) {
  if (!email || email.indexOf(" ") !== -1) {
    return false;
  }

  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) {
    return false;
  }

  const name = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();

  if (name.length > 64 || name.charAt(0) === "." || name.charAt(name.length - 1) === ".") {
    return false;
  }
  if (name.indexOf("..") !== -1) {
    return false;
  }
  if (!/^[A-Za-z0-9._%+-]+$/.test(name)) {
    return false;
  }
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)) {
    return false;
  }

  const ending = domain.slice(domain.lastIndexOf(".") + 1);
  if (!/^[a-z]{2,}$/.test(ending)) {
    return false;
  }

  return true;
}

// Ask Google's public lookup if this domain has a mail server (an MX record).
function domainCanGetMail(domain) {
  const url = "https://dns.google/resolve?name=" + encodeURIComponent(domain) + "&type=MX";

  return fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("lookup failed");
      }
      return response.json();
    })
    .then(function (data) {
      if (!data || data.Status !== 0 || !data.Answer || !data.Answer.length) {
        return false;
      }

      let can = false;
      data.Answer.forEach(function (record) {
        if (!record || record.type !== 15 || !record.data) {
          return;
        }
        const host = String(record.data).trim().split(/\s+/).pop();
        if (host && host !== ".") {
          can = true;
        }
      });
      return can;
    });
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function showCodeStep() {
  codeHint.hidden = false;
  codeField.hidden = false;
  codeInput.disabled = false;
  form.kid_name.disabled = true;
  form.parent_email.disabled = true;
  form.password.disabled = true;
  setButton("Finish sign up", false);
  codeInput.focus();
}

function beginSignup() {
  const kidName = form.kid_name.value.trim().replace(/\s+/g, " ");
  const parentEmail = form.parent_email.value.trim();
  const password = form.password.value;

  hideMessage();

  if (!kidName) {
    showError("Please enter a name.");
    return;
  }

  if (findUserByKidName(kidName)) {
    showError("That name is already taken.");
    return;
  }

  if (password.length < 6) {
    showError("Password needs at least 6 characters.");
    return;
  }

  if (!emailLooksReal(parentEmail)) {
    showError("That email does not look real. Check it with a parent.");
    return;
  }

  const domain = parentEmail.split("@")[1].toLowerCase();
  setButton("Checking email...", true);

  domainCanGetMail(domain)
    .catch(function () {
      return false;
    })
    .then(function (canGetMail) {
      if (!canGetMail) {
        showError("That email does not look real. Check it with a parent.");
        setButton("Sign up", false);
        return;
      }

      const code = makeCode();
      const user = {
        kidName: kidName,
        parentEmail: parentEmail,
        password: password,
      };
      const text =
        "Your CodeReef code is " +
        code +
        ". " +
        kidName +
        " signed up for CodeReef. If you did not sign up, ignore this.";

      setButton("Sending code...", true);

      return notifyParent(user, "CodeReef code", text).then(function (data) {
        const note = data && data.message ? String(data.message) : "";
        if (note.toLowerCase().indexOf("activat") !== -1) {
          showNote("A parent needs to open that email and tap the link. Then press Sign up again.");
          setButton("Sign up", false);
          return;
        }

        pendingSignup = {
          user: user,
          code: code,
        };
        hideMessage();
        showCodeStep();
      });
    })
    .catch(function () {
      showError("We could not email that address. It might not be real.");
      setButton("Sign up", false);
    });
}

function finishSignup() {
  const typed = codeInput.value.trim();

  if (typed !== pendingSignup.code) {
    showError("That code does not match. Ask a parent to check the email.");
    return;
  }

  // Many kids can share one parent email. Only the kid's name must be new.
  if (findUserByKidName(pendingSignup.user.kidName)) {
    showError("That name is already taken.");
    return;
  }

  const users = getUsers();
  users.push(pendingSignup.user);
  saveUsers(users);

  setButton("Signing up...", true);
  setCurrentUser(pendingSignup.user);
  pendingSignup = null;
  window.location.href = "home.html";
}
