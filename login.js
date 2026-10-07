const form = document.querySelector(".auth__form");
const message = form.querySelector(".auth__message");
const submitButton = form.querySelector(".auth__submit");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const kidName = form.kid_name.value.trim().replace(/\s+/g, " ");
  const password = form.password.value;

  message.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  CodeReefCloud.login(kidName, password)
    .then(function (result) {
      if (!result.ok) {
        message.textContent = result.message || "Name or password is wrong. Try again.";
        message.hidden = false;
        submitButton.disabled = false;
        submitButton.textContent = "Log in";
        return;
      }

      finishSoon(notifyParentOfLogin(result.user)).finally(function () {
        window.location.href = "home.html";
      });
    })
    .catch(function () {
      var local = findUserByKidName(kidName);
      if (local && local.password === password) {
        setCurrentUser({
          kidName: local.kidName,
          parentEmail: local.parentEmail || "",
        });
        finishSoon(notifyParentOfLogin(local)).finally(function () {
          window.location.href = "home.html";
        });
        return;
      }
      message.textContent = local
        ? "Name or password is wrong. Try again."
        : "This computer doesn't know that name yet. Try again.";
      message.hidden = false;
      submitButton.disabled = false;
      submitButton.textContent = "Log in";
    });
});
