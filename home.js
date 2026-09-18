const nameEl = document.getElementById("home-name");
const user = getCurrentUser();

if (!user) {
  window.location.href = "login.html";
} else {
  nameEl.textContent = "Hi, " + user.kidName + "!";
}
