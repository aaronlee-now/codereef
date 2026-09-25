if (!getCurrentUser()) {
  window.location.href = "login.html";
} else if (typeof getWallet === "function") {
  var coinChip = document.getElementById("explore-coins");
  if (coinChip) {
    coinChip.hidden = false;
    coinChip.textContent = getWallet().coins + " coins";
  }
}
