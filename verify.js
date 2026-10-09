const form = document.querySelector(".auth__form");
const message = form.querySelector(".auth__message");
const submitButton = form.querySelector(".auth__submit");
const hint = document.getElementById("verify-hint");
const resendButton = document.getElementById("verify-resend");
const backLink = document.getElementById("verify-back");

const pending = readLoginCode();

if (!pending || !pending.code || !pending.expires || Date.now() > pending.expires) {
  clearLoginCode();
  window.location.href = "login.html";
} else {
  hint.textContent =
    "CodeReef emailed a code to " +
    pending.parentEmail +
    ". Ask a parent to read it to you. The code works for 10 minutes.";
}

if (backLink) {
  backLink.addEventListener("click", function () {
    clearLoginCode();
  });
}

if (form && pending && pending.code) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const typed = form.code.value.replace(/\D/g, "");
    const saved = readLoginCode();

    message.hidden = true;

    if (!saved || Date.now() > saved.expires) {
      clearLoginCode();
      showProblem("That code expired. Go back and log in again.");
      return;
    }

    if (typed !== saved.code) {
      showProblem("That code does not match. Check the email and try again.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

    CodeReefCloud.login(saved.kidName, saved.password)
      .then(function (result) {
        if (!result.ok) {
          showProblem(result.message || "Name or password is wrong. Try again.");
          return;
        }
        clearLoginCode();
        window.location.href = "home.html";
      })
      .catch(function () {
        showProblem("The reef is busy. Try again.");
      });
  });
}

if (resendButton && pending && pending.parentEmail) {
  resendButton.addEventListener("click", function () {
    const saved = readLoginCode();
    if (!saved) {
      window.location.href = "login.html";
      return;
    }

    const code = makeLoginCode();
    resendButton.disabled = true;
    message.hidden = true;

    notifyParentOfLoginCode(
      { kidName: saved.kidName, parentEmail: saved.parentEmail },
      code
    )
      .then(function () {
        saved.code = code;
        saved.expires = Date.now() + 10 * 60 * 1000;
        saveLoginCode(saved);
        message.textContent = "A new code is on the way. Check the parent email.";
        message.classList.add("auth__message--ok");
        message.hidden = false;
        resendButton.disabled = false;
      })
      .catch(function () {
        message.classList.remove("auth__message--ok");
        showProblem("We could not email a new code. Try again.");
        resendButton.disabled = false;
      });
  });
}

function showProblem(text) {
  message.classList.remove("auth__message--ok");
  message.textContent = text;
  message.hidden = false;
  submitButton.disabled = false;
  submitButton.textContent = "Sign in";
}
