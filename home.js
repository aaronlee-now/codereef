const nameEl = document.getElementById("home-name");
const screenEl = document.getElementById("cover-screen");
const screenTextEl = document.getElementById("cover-screen-text");
const user = getCurrentUser();

if (!user) {
  window.location.href = "login.html";
} else {
  nameEl.textContent = "Hi, " + user.kidName + "!";

  // Show the last language path on the laptop screen (or a friendly default).
  var last =
    typeof CodeReefProgress !== "undefined" && CodeReefProgress.getLastPath
      ? CodeReefProgress.getLastPath()
      : null;

  if (last && screenEl && screenTextEl) {
    screenTextEl.textContent = last.label;
    screenEl.href = last.href;
    screenEl.setAttribute("aria-label", "Open " + last.label);
  } else if (screenEl && screenTextEl) {
    screenTextEl.textContent = "Start exploring";
    screenEl.href = "explore.html";
    screenEl.setAttribute("aria-label", "Start exploring");
  }
}
