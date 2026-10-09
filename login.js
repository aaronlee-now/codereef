const form = document.querySelector(".auth__form");
const message = form.querySelector(".auth__message");
const submitButton = form.querySelector(".auth__submit");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const kidName = form.kid_name.value.trim().replace(/\s+/g, " ");
  const parentEmail = form.parent_email.value.trim();
  const password = form.password.value;

  message.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Checking...";

  if (!emailLooksOk(parentEmail)) {
    showProblem("That email does not look real. Use the one from sign up.");
    return;
  }

  CodeReefCloud.checkLogin(kidName, password, parentEmail)
    .then(function (result) {
      if (!result.ok) {
        showProblem(result.message || "Name or password is wrong. Try again.");
        return;
      }

      const code = makeLoginCode();
      submitButton.textContent = "Sending code...";
      return notifyParentOfLoginCode(result.user, code).then(function () {
        saveLoginCode({
          kidName: result.user.kidName,
          parentEmail: result.user.parentEmail,
          password: password,
          code: code,
          expires: Date.now() + 10 * 60 * 1000,
        });
        window.location.href = "verify.html";
      });
    })
    .catch(function () {
      showProblem("We could not email the code. Try again.");
    });
});

function emailLooksOk(email) {
  if (!email || email.indexOf(" ") !== -1) {
    return false;
  }
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) {
    return false;
  }
  const domain = email.slice(at + 1);
  return domain.indexOf(".") > 0;
}

function showProblem(text) {
  message.textContent = text;
  message.hidden = false;
  submitButton.disabled = false;
  submitButton.textContent = "Log in";
}
