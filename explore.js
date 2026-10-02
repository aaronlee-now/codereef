if (!getCurrentUser()) {
  window.location.href = "login.html";
} else if (typeof getWallet === "function") {
  var coinChip = document.getElementById("explore-coins");
  if (coinChip) {
    coinChip.hidden = false;
    coinChip.textContent = formatCoinSummary(getWallet().coins);
  }
}

var logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    logOut();
  });
}
