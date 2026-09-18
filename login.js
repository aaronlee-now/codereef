const form = document.querySelector(".auth__form");
const message = document.querySelector(".auth__message");
const submitButton = form.querySelector(".auth__submit");

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
