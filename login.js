const form = document.querySelector(".auth__form");
const message = form.querySelector(".auth__message");
const submitButton = form.querySelector(".auth__submit");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const kidName = form.kid_name.value.trim().replace(/\s+/g, " ");
  const password = form.password.value;

  message.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Checking...";

  CodeReefCloud.login(kidName, password)
    .then(function (result) {
      if (!result.ok) {
        showProblem(result.message || "Name or password is wrong. Try again.");
        return;
      }
      window.location.href = "home.html";
    })
    .catch(function () {
      showProblem("The reef is busy. Try again.");
    });
});

function showProblem(text) {
  message.textContent = text;
  message.hidden = false;
  submitButton.disabled = false;
  submitButton.textContent = "Log in";
}
