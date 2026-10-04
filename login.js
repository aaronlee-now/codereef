const form = document.querySelector(".auth__form");
const message = form.querySelector(".auth__message");
const submitButton = form.querySelector(".auth__submit");
const pastePanel = document.getElementById("paste-code-panel");
const pasteBox = document.getElementById("paste-link-code");
const pasteMessage = document.getElementById("paste-message");
const pasteButton = document.getElementById("use-link-code");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const kidName = form.kid_name.value.trim().replace(/\s+/g, " ");
  const password = form.password.value;
  const user = findUserByKidName(kidName);

  if (!user || user.password !== password) {
    message.textContent = "Name or password is wrong. Try again.";
    message.hidden = false;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  notifyParentOfLogin(user)
    .catch(function () {
      // Still log in even if the email did not send.
    })
    .finally(function () {
      setCurrentUser(user);
      window.location.href = "home.html";
    });
});

document.getElementById("show-paste-code").addEventListener("click", function () {
  pastePanel.hidden = false;
  pasteBox.focus();
});

pasteButton.addEventListener("click", function () {
  pasteMessage.hidden = true;
  pasteButton.disabled = true;
  applyLinkCode(pasteBox.value).then(function (result) {
    if (!result.ok) {
      pasteMessage.textContent = result.message;
      pasteMessage.hidden = false;
      pasteButton.disabled = false;
      return;
    }

    var user = getCurrentUser();
    pasteButton.textContent = "Logging in...";
    notifyParentOfLogin(user)
      .catch(function () {
        // Still log in even if the email did not send.
      })
      .finally(function () {
        window.location.href = "home.html";
      });
  });
});
