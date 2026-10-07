const form = document.querySelector(".auth__form");
const message = document.querySelector(".auth__message");
const submitButton = form.querySelector(".auth__submit");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  beginSignup();
});

function showError(text) {
  message.textContent = text;
  message.hidden = false;
}

function hideMessage() {
  message.hidden = true;
  message.textContent = "";
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
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = setTimeout(function () {
    if (controller) {
      controller.abort();
    }
  }, 4000);
  const options = controller ? { signal: controller.signal } : undefined;

  return fetch(url, options)
    .then(function (response) {
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error("lookup failed");
      }
      return response.json();
    }, function (error) {
      clearTimeout(timer);
      throw error;
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

function saveAndEnter(user) {
  // Many kids can share one parent email. Only the kid's name must be new.
  setButton("Signing up...", true);

  CodeReefCloud.signUp(user)
    .then(function (result) {
      if (!result.ok) {
        showError(result.message || "That name is already taken.");
        setButton("Sign up", false);
        return;
      }

      finishSoon(notifyParentOfSignup(user)).finally(function () {
        window.location.href = "home.html";
      });
    })
    .catch(function () {
      showError("The reef is busy. Try again.");
      setButton("Sign up", false);
    });
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

  const user = {
    kidName: kidName,
    parentEmail: parentEmail,
    password: password,
  };
  const domain = parentEmail.split("@")[1].toLowerCase();
  setButton("Checking email...", true);

  domainCanGetMail(domain)
    .then(function (canGetMail) {
      if (!canGetMail) {
        showError("That email does not look real. Check it with a parent.");
        setButton("Sign up", false);
        return;
      }

      saveAndEnter(user);
    })
    .catch(function () {
      // The mail-server lookup did not answer. The email already looks real enough.
      saveAndEnter(user);
    });
}
