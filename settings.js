// Shows the signed-in kid their own name, parent email, password, and lessons.

if (!getCurrentUser()) {
  window.location.href = "login.html";
}

var PATHS = [
  { key: "blocks", label: "Block Coding" },
  { key: "htmlcss", label: "HTML / CSS" },
  { key: "python", label: "Python" },
  { key: "javascript", label: "JavaScript" },
  { key: "go", label: "Go" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
  { key: "assembly", label: "Assembly" },
];

function projectWords(kidName, pathKey) {
  var key = "codereef_project_" + normalizeName(kidName) + "_" + pathKey;
  var raw = localStorage.getItem(key);
  if (!raw) {
    return "";
  }

  var data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    return "";
  }
  if (!data || typeof data !== "object") {
    return "";
  }

  var phase = data.phase || "";
  if (data.advancedDone || phase === "all-done" || phase === "celebrate-advanced") {
    return "advanced done";
  }
  if (data.advancedIdeaId || phase === "pick-advanced") {
    return "advanced";
  }
  if (data.finalDone || phase === "celebrate-final" || phase === "advanced-ready") {
    return "project done";
  }
  if (
    data.ideaId ||
    phase === "pick" ||
    phase === "plan" ||
    phase === "building" ||
    phase === "ready-final"
  ) {
    return "project";
  }
  return "";
}

function progressWords(pathKey) {
  var lesson = null;
  if (window.CodeReefProgress && typeof CodeReefProgress.load === "function") {
    lesson = CodeReefProgress.load(pathKey);
  }

  var words = [];
  if (!lesson) {
    words.push("not started");
  } else {
    var index = typeof lesson.taskIndex === "number" ? lesson.taskIndex : 0;
    words.push("Task " + (index + 1));
  }

  var session = getCurrentUser();
  var extra = session ? projectWords(session.kidName, pathKey) : "";
  if (extra) {
    words.push(extra);
  }
  return words.join(", ");
}

function showAccount() {
  var session = getCurrentUser();
  if (!session) {
    return;
  }

  var record = findUserByKidName(session.kidName);
  var nameEl = document.getElementById("settings-name");
  var emailEl = document.getElementById("settings-email");
  var passwordEl = document.getElementById("settings-password");
  var listEl = document.getElementById("settings-progress");

  nameEl.textContent = session.kidName;

  var email = session.parentEmail || "";
  if (record && record.parentEmail) {
    email = record.parentEmail;
  }
  emailEl.textContent = email || "No parent email saved";

  if (!record || typeof record.password !== "string") {
    passwordEl.textContent = "We cannot find the password.";
  } else {
    passwordEl.textContent = record.password;
  }

  listEl.textContent = "";
  PATHS.forEach(function (path) {
    var item = document.createElement("li");
    var name = document.createElement("span");
    var far = document.createElement("span");
    name.textContent = path.label;
    far.className = "settings-progress__far";
    far.textContent = progressWords(path.key);
    item.appendChild(name);
    item.appendChild(document.createTextNode(" "));
    item.appendChild(far);
    listEl.appendChild(item);
  });
}

function showLine(el, text, ok) {
  el.textContent = text;
  el.hidden = false;
  el.classList.toggle("auth__message--ok", !!ok);
}

function fillAccountCode() {
  var box = document.getElementById("account-code");
  var code = "";
  try {
    code = makeAccountCode();
  } catch (err) {
    code = "";
  }
  box.value = code;
  if (!code) {
    box.value = "";
  }
}

function copyAccountCode() {
  var box = document.getElementById("account-code");
  var note = document.getElementById("copy-message");
  var text = box.value;
  if (!text) {
    showLine(note, "We cannot make a code yet.", false);
    return;
  }
  box.focus();
  box.select();
  function copied() {
    showLine(note, "Copied. Paste it on the other computer.", true);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(copied).catch(function () {
      showLine(note, "The code is selected. Copy it with a parent.", true);
    });
    return;
  }
  showLine(note, "The code is selected. Copy it with a parent.", true);
}

function putCodeIn() {
  var box = document.getElementById("load-code");
  var note = document.getElementById("load-message");
  var result = loadAccountCodeForCurrentKid(box.value);
  if (!result.ok) {
    showLine(note, result.message, false);
    return;
  }
  showAccount();
  fillAccountCode();
  box.value = "";
  showLine(note, "This computer has the fish and lessons from that code. The other computer still has them too.", true);
}

showAccount();
fillAccountCode();
document.getElementById("copy-code").addEventListener("click", copyAccountCode);
document.getElementById("load-code-btn").addEventListener("click", putCodeIn);
