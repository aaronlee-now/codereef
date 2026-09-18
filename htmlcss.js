if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const htmlCode = document.getElementById("html-code");
const cssCode = document.getElementById("css-code");
const preview = document.getElementById("preview");
const tip = document.getElementById("tip");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;

const starterHtml = `<h1>Hello, reef!</h1>
<p>My name is Sam.</p>
<p class="fun">I like coding under the sea.</p>
`;

const starterCss = `body {
  font-family: Arial, sans-serif;
  background: #dff6ff;
  color: #123;
  padding: 20px;
}

h1 {
  color: #0b7285;
}

.fun {
  color: #e8590c;
  font-size: 20px;
}
`;

const tasks = [
  {
    goal: "Task 1: Change the big title to Hello, ocean!",
    help:
      "Tap the HTML tab. Look for the line that starts with <h1>. " +
      "It says Hello, reef! Change the word reef to ocean so it says Hello, ocean! " +
      "Keep the <h1> and </h1> tags. Then press Show.",
    check: function () {
      return /<h1>\s*Hello,\s*ocean!\s*<\/h1>/i.test(htmlCode.value);
    },
  },
  {
    goal: "Task 2: The fun text is orange (#e8590c). Change it to blue.",
    help:
      "Orange’s color code is #e8590c (that’s a hex color — a code computers use for colors). " +
      "Tap the CSS tab. Find .fun { ... }. Inside it you will see color: #e8590c; " +
      "Change that line to color: blue; then press Show. The fun sentence should turn blue.",
    check: function () {
      const css = cssCode.value.toLowerCase();
      return (
        css.indexOf(".fun") !== -1 &&
        (css.indexOf("color: blue") !== -1 ||
          css.indexOf("color:blue") !== -1 ||
          css.indexOf("#00f") !== -1 ||
          css.indexOf("#0000ff") !== -1 ||
          css.indexOf("#339af0") !== -1)
      );
    },
  },
  {
    goal: "Task 3: Add a new paragraph about your favorite fish.",
    help:
      "Tap the HTML tab. Under the other <p>…</p> lines, add a brand-new line. " +
      "Type something like <p>I love clownfish.</p> " +
      "You need the opening tag <p>, your words, then the closing tag </p>. Press Show when done.",
    check: function () {
      const matches = htmlCode.value.match(/<p[\s>]/gi);
      return matches && matches.length >= 3;
    },
  },
  {
    goal: "Task 4: Change the page background to light yellow (#fff3bf).",
    help:
      "Tap the CSS tab. Near the top, find body { ... }. " +
      "Look for background: #dff6ff; (that light blue). " +
      "Change it to background: #fff3bf; — that hex code means light yellow. Then press Show.",
    check: function () {
      const css = cssCode.value.toLowerCase().replace(/\s+/g, "");
      return (
        css.indexOf("background:#fff3bf") !== -1 ||
        css.indexOf("background:lightyellow") !== -1 ||
        css.indexOf("background:#fffee0") !== -1 ||
        css.indexOf("background:#ffffe0") !== -1
      );
    },
  },
];

function setTip(text) {
  if (helpLine) {
    helpLine.textContent = text;
  }
  if (tip) {
    tip.innerHTML = text;
  }
}

function showNextButton(show) {
  if (!nextBtn) {
    return;
  }
  if (show) {
    nextBtn.hidden = false;
    nextBtn.removeAttribute("hidden");
  } else {
    nextBtn.hidden = true;
    nextBtn.setAttribute("hidden", "");
  }
}

function showTask() {
  taskDone = false;
  taskBar.classList.remove("is-done", "is-help");
  showNextButton(false);
  taskGoal.textContent = tasks[taskIndex].goal;
  setTip("Do the task, then press Show. Tap Help if you get stuck.");
}

function markTaskDone() {
  taskDone = true;
  taskBar.classList.add("is-done");
  taskBar.classList.remove("is-help");
  taskGoal.textContent =
    "Nice job! " + tasks[taskIndex].goal.replace(/^Task \d+:\s*/, "");
  if (taskIndex < tasks.length - 1) {
    showNextButton(true);
    setTip("Task complete! Tap Next task when ready.");
  } else {
    showNextButton(false);
    setTip("You finished all the HTML / CSS tasks. Awesome!");
  }
}

function checkTask() {
  if (taskDone) {
    return;
  }
  if (tasks[taskIndex].check()) {
    markTaskDone();
  } else {
    setTip("Not quite yet. Tap <strong>Help</strong> for a little hint.");
  }
}

function showPreview() {
  const doc =
    "<!DOCTYPE html><html><head><style>" +
    cssCode.value +
    "</style></head><body>" +
    htmlCode.value +
    "</body></html>";

  preview.srcdoc = doc;
  checkTask();
}

function resetCode() {
  htmlCode.value = starterHtml;
  cssCode.value = starterCss;
  const doc =
    "<!DOCTYPE html><html><head><style>" +
    cssCode.value +
    "</style></head><body>" +
    htmlCode.value +
    "</body></html>";
  preview.srcdoc = doc;
  showTask();
}

document.querySelectorAll(".web-tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    const name = tab.getAttribute("data-tab");

    document.querySelectorAll(".web-tab").forEach(function (el) {
      el.classList.toggle("is-active", el === tab);
    });

    document.querySelectorAll(".web-code-wrap").forEach(function (panel) {
      const on = panel.getAttribute("data-panel") === name;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
  });
});

helpBtn.addEventListener("click", function () {
  taskBar.classList.add("is-help");
  setTip(tasks[taskIndex].help);
});

nextBtn.addEventListener("click", function () {
  if (taskIndex < tasks.length - 1) {
    taskIndex += 1;
    showTask();
  }
});

document.getElementById("run-btn").addEventListener("click", showPreview);
document.getElementById("reset-btn").addEventListener("click", resetCode);

htmlCode.value = starterHtml;
cssCode.value = starterCss;
preview.srcdoc =
  "<!DOCTYPE html><html><head><style>" +
  starterCss +
  "</style></head><body>" +
  starterHtml +
  "</body></html>";
showTask();
