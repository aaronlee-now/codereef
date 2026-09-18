const form = document.querySelector(".auth__form");
const message = document.querySelector(".auth__message");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const kidName = form.kid_name.value.trim().replace(/\s+/g, " ");
  const parentEmail = form.parent_email.value.trim();
  const password = form.password.value;

  if (!kidName) {
    message.textContent = "Please enter a name.";
    message.hidden = false;
    return;
  }

  if (findUserByKidName(kidName)) {
    message.textContent = "That name is already taken.";
    message.hidden = false;
    return;
  }

  if (findUserByEmail(parentEmail)) {
    message.textContent = "That parent email already has an account. Try Log in.";
    message.hidden = false;
    return;
  }

  const users = getUsers();
  const newUser = {
    kidName: kidName,
    parentEmail: parentEmail,
    password: password,
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  window.location.href = "home.html";
});
