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

const PATH_KEY = "htmlcss";
if (typeof CodeReefProgress !== "undefined") {
  CodeReefProgress.rememberLastPath(PATH_KEY);
}

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

const projectHtml = `<h1>My reef project</h1>
<p>Hello from the ocean!</p>
`;

const projectCss = `body {
  font-family: Arial, sans-serif;
  background: #dff6ff;
  color: #123;
  padding: 20px;
}

h1 {
  color: #0b7285;
}
`;

function snapshotProgress() {
  return {
    taskIndex: taskIndex,
    taskDone: taskDone,
    code: htmlCode.value + "\n" + cssCode.value,
    html: htmlCode.value,
    css: cssCode.value,
  };
}

function persistLesson() {
  if (typeof CodeReefProgress === "undefined") {
    return;
  }
  CodeReefProgress.save(PATH_KEY, snapshotProgress());
}

function persistLessonSoon() {
  if (typeof CodeReefProgress === "undefined") {
    return;
  }
  CodeReefProgress.saveDebounced(PATH_KEY, snapshotProgress(), 400);
}

function restoreDoneWaitingForNext() {
  taskDone = true;
  taskBar.classList.add("is-done");
  taskBar.classList.remove("is-help");
  taskGoal.textContent =
    "Nice job! " + tasks[taskIndex].goal.replace(/^Task \d+:\s*/, "");
  if (taskIndex < tasks.length - 1) {
    showNextButton(true);
    nextBtn.textContent = "Next task";
    setTip("Task complete! Tap Next task when ready.");
  }
}

function applyPreview(html, css) {
  preview.srcdoc =
    "<!DOCTYPE html><html><head><style>" +
    css +
    "</style></head><body>" +
    html +
    "</body></html>";
}

const tasks = [
  {
    goal: "Task 1: Change the big title to Hello, ocean!",
    help:
      "Replace only the word reef with ocean; keep the rest. " +
      "Tap the HTML tab. Look for the line that starts with <h1>. " +
      "It says Hello, reef! Change reef to ocean so it says Hello, ocean! " +
      "Keep the <h1> and </h1> tags. Then press Show.",
    check: function () {
      return /<h1>\s*Hello,\s*ocean!\s*<\/h1>/i.test(htmlCode.value);
    },
  },
  {
    goal: "Task 2: The fun text is orange (#e8590c). Change it to blue.",
    help:
      "Replace only the color inside .fun; keep the rest of your CSS. " +
      "Tap the CSS tab. Find .fun { ... }. Inside it you will see color: #e8590c; " +
      "Change that line to color: blue; then press Show.",
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
      "Keep your old HTML. Add a new line under the other <p>…</p> lines. " +
      "Type something like <p>I love clownfish.</p> " +
      "You need <p>, your words, then </p>. Press Show when done.",
    check: function () {
      const matches = htmlCode.value.match(/<p[\s>]/gi);
      return matches && matches.length >= 3;
    },
  },
  {
    goal: "Task 4: Change the page background to light yellow (#fff3bf).",
    help:
      "Replace only the background color in body; keep the rest. " +
      "Tap the CSS tab. Near the top, find body { ... }. " +
      "Look for background: #dff6ff; Change it to background: #fff3bf; Then press Show.",
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
  {
    goal: "Task 5: Make the big title green.",
    help:
      "Keep your old CSS. Tap the CSS tab. Find h1 { ... }. " +
      "Change color: #0b7285; to color: green; (or color: #2f9e44;). Then press Show.",
    check: function () {
      const css = cssCode.value.toLowerCase();
      return (
        css.indexOf("h1") !== -1 &&
        (css.indexOf("color: green") !== -1 ||
          css.indexOf("color:green") !== -1 ||
          css.indexOf("#2f9e44") !== -1 ||
          css.indexOf("#40c057") !== -1)
      );
    },
  },
  {
    goal: "Task 6: Make .fun text bigger (font-size: 28px).",
    help:
      "Keep your old CSS. Tap the CSS tab. Find .fun { ... }. " +
      "Change font-size: 20px; to font-size: 28px; Then press Show.",
    check: function () {
      const css = cssCode.value.toLowerCase().replace(/\s+/g, "");
      return css.indexOf(".fun") !== -1 && css.indexOf("font-size:28px") !== -1;
    },
  },
  {
    goal: "Task 7: Add a new heading that says Coral friends.",
    help:
      "Keep your old HTML. Tap the HTML tab. Under your other lines, add: " +
      "<h2>Coral friends</h2> Then press Show.",
    check: function () {
      return /<h2>\s*Coral friends\s*<\/h2>/i.test(htmlCode.value);
    },
  },
];

const finalIdeas = [
  {
    id: "profile",
    title: "Mini profile card",
    blurb: "A title, your name, and a fun fact.",
    plan: [
      "Make an <h1> title for your profile.",
      "Add a paragraph with your name.",
      "Add a fun fact paragraph.",
    ],
    steps: [
      {
        goal: "Project step 1: Make a profile title.",
        help:
          "You can delete the old code and start fresh for this project. " +
          "Tap HTML. Put <h1>My Profile</h1> (or any title). Then press Show.",
        check: function (ctx) {
          return /<h1>[\s\S]*<\/h1>/i.test(ctx.html);
        },
      },
      {
        goal: "Project step 2: Add a name paragraph.",
        help:
          "Keep your old HTML. Add <p>My name is Sam.</p> under the title. Then press Show.",
        check: function (ctx) {
          return (ctx.html.match(/<p[\s>]/gi) || []).length >= 1;
        },
      },
      {
        goal: "Project step 3: Add a fun fact paragraph.",
        help:
          "Keep your old HTML. Add another <p>…</p> fun fact. Then press Show.",
        check: function (ctx) {
          return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2;
        },
      },
    ],
  },
  {
    id: "poster",
    title: "Colorful poster",
    blurb: "A big title and a bright background.",
    plan: [
      "Write a poster title in HTML.",
      "Add a short poster sentence.",
      "Change the background color in CSS.",
    ],
    steps: [
      {
        goal: "Project step 1: Make a poster title.",
        help:
          "You can delete the old code and start fresh for this project. " +
          "Tap HTML. Type <h1>Ocean Poster</h1> Then press Show.",
        check: function (ctx) {
          return /<h1>[\s\S]*<\/h1>/i.test(ctx.html);
        },
      },
      {
        goal: "Project step 2: Add a poster sentence.",
        help:
          "Keep your old HTML. Add <p>Swim into coding!</p> Then press Show.",
        check: function (ctx) {
          return (ctx.html.match(/<p[\s>]/gi) || []).length >= 1;
        },
      },
      {
        goal: "Project step 3: Change the background color.",
        help:
          "Keep your HTML. Tap CSS. In body, set background to a fun color like #ffe8cc or lightyellow. Then press Show.",
        check: function (ctx) {
          const css = String(ctx.css || "").toLowerCase().replace(/\s+/g, "");
          return /background:/.test(css);
        },
      },
    ],
  },
  {
    id: "invite",
    title: "Party invite",
    blurb: "Invite friends to a reef party.",
    plan: [
      "Make an invite title.",
      "Add when/where text.",
      "Make the title a fun color in CSS.",
    ],
    steps: [
      {
        goal: "Project step 1: Make an invite title.",
        help:
          "You can delete the old code and start fresh for this project. " +
          "Tap HTML. Type <h1>Reef Party!</h1> Then press Show.",
        check: function (ctx) {
          return /<h1>[\s\S]*<\/h1>/i.test(ctx.html);
        },
      },
      {
        goal: "Project step 2: Add party details.",
        help:
          "Keep your old HTML. Add <p>Saturday at the coral reef.</p> Then press Show.",
        check: function (ctx) {
          return (ctx.html.match(/<p[\s>]/gi) || []).length >= 1;
        },
      },
      {
        goal: "Project step 3: Color the title.",
        help:
          "Keep your HTML. Tap CSS. In h1 { }, set color: tomato; (or any color). Then press Show.",
        check: function (ctx) {
          const css = String(ctx.css || "").toLowerCase();
          return /h1\s*\{[\s\S]*color\s*:/.test(css) || /h1[\s\S]*color\s*:/.test(css);
        },
      },
    ],
  },
];

const advancedIdeas = [
  {
    id: "cardstyle",
    title: "Styled profile",
    blurb: "Profile HTML plus class styling.",
    plan: [
      "Build a title and two paragraphs.",
      "Add a class on one paragraph.",
      "Style that class with a color and bigger text.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Title + two paragraphs.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          "In HTML make <h1>…</h1> and two <p> lines. Then press Show.",
        check: function (ctx) {
          return /<h1>/i.test(ctx.html) && (ctx.html.match(/<p[\s>]/gi) || []).length >= 2;
        },
      },
      {
        goal: "Advanced step 2: Add a class to a paragraph.",
        help:
          'Keep your old HTML. Change one paragraph to <p class="fun">…</p> Then press Show.',
        check: function (ctx) {
          return /<p[^>]*class\s*=\s*["'][^"']+["']/i.test(ctx.html);
        },
      },
      {
        goal: "Advanced step 3: Style the class in CSS.",
        help:
          "Keep your HTML. Tap CSS. Add .fun { color: blue; font-size: 22px; } Then press Show.",
        check: function (ctx) {
          const css = String(ctx.css || "").toLowerCase();
          return /\.\w+\s*\{/.test(css) && /color\s*:/.test(css);
        },
      },
    ],
  },
  {
    id: "neonposter",
    title: "Neon poster",
    blurb: "Bold title, sentence, and bright page colors.",
    plan: [
      "Make a bold poster title.",
      "Add two sentences.",
      "Set background and title color.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Make a neon title.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          "Type <h1>Neon Reef</h1> Then press Show.",
        check: function (ctx) {
          return /<h1>/i.test(ctx.html);
        },
      },
      {
        goal: "Advanced step 2: Add two sentences.",
        help:
          "Keep your old HTML. Add two <p> lines. Then press Show.",
        check: function (ctx) {
          return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2;
        },
      },
      {
        goal: "Advanced step 3: Bright CSS colors.",
        help:
          "Keep your HTML. In CSS set body background and h1 color to bright values. Then press Show.",
        check: function (ctx) {
          const css = String(ctx.css || "").toLowerCase();
          return /background\s*:/.test(css) && /color\s*:/.test(css);
        },
      },
    ],
  },
  {
    id: "zoo",
    title: "Sea zoo list",
    blurb: "A title and three animal paragraphs.",
    plan: [
      "Make a zoo title.",
      "Add two animal paragraphs.",
      "Add a third animal paragraph.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Make a zoo title.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          "Type <h1>Sea Zoo</h1> Then press Show.",
        check: function (ctx) {
          return /<h1>/i.test(ctx.html);
        },
      },
      {
        goal: "Advanced step 2: Add two animals.",
        help:
          "Keep your old HTML. Add two <p> animal lines. Then press Show.",
        check: function (ctx) {
          return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2;
        },
      },
      {
        goal: "Advanced step 3: Add a third animal.",
        help:
          "Keep your old HTML. Add one more <p> animal. Then press Show.",
        check: function (ctx) {
          return (ctx.html.match(/<p[\s>]/gi) || []).length >= 3;
        },
      },
    ],
  },
];

function setTip(text) {
  if (helpLine) {
    helpLine.textContent = text;
  }
  if (tip) {
    tip.textContent = text;
  }
}

const projectApi = CodeReefProject.attach({
  pathKey: "htmlcss",
  actionLabel: "Show",
  ideas: finalIdeas,
  advancedIdeas: advancedIdeas,
  setTip: setTip,
  taskBar: taskBar,
  taskGoal: taskGoal,
  nextBtn: nextBtn,
  onProjectStart: function () {
    htmlCode.value = projectHtml;
    cssCode.value = projectCss;
    applyPreview(projectHtml, projectCss);
    persistLesson();
  },
});

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

function projectContext() {
  return {
    code: htmlCode.value + "\n" + cssCode.value,
    html: htmlCode.value,
    css: cssCode.value,
    output: htmlCode.value,
  };
}

function showTask() {
  taskDone = false;
  taskBar.classList.remove("is-done", "is-help", "is-project", "is-advanced");
  showNextButton(false);
  nextBtn.textContent = "Next task";
  taskGoal.textContent = tasks[taskIndex].goal;
  setTip("Do the task, then press Show. Tap Help if you get stuck.");
}

function afterSkillsComplete() {
  projectApi.beginFinal();
}

function markTaskDone() {
  taskDone = true;
  taskBar.classList.add("is-done");
  taskBar.classList.remove("is-help");
  taskGoal.textContent =
    "Nice job! " + tasks[taskIndex].goal.replace(/^Task \d+:\s*/, "");
  persistLesson();

  if (shouldShowCoralTrail(taskIndex)) {
    showNextButton(false);
    setTip("Coral trail time! Swim up to earn coins!");
    openCoralTrail("htmlcss", {
      onComplete: function () {
        if (taskIndex < tasks.length - 1) {
          taskIndex += 1;
          showTask();
          persistLesson();
        } else {
          afterSkillsComplete();
        }
      },
    });
    return;
  }

  if (taskIndex < tasks.length - 1) {
    showNextButton(true);
    nextBtn.textContent = "Next task";
    setTip("Task complete! Tap Next task when ready.");
  } else {
    afterSkillsComplete();
  }
}

function checkTask() {
  if (projectApi.isHandlingTasks() && projectApi.getPhase() === "building") {
    projectApi.tryCheck(projectContext());
    return;
  }
  if (taskDone) {
    return;
  }
  if (tasks[taskIndex].check()) {
    markTaskDone();
  } else {
    setTip("Not quite yet. Tap Help for a little hint.");
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
  if (typeof CodeReefProgress !== "undefined") {
    CodeReefProgress.clear(PATH_KEY);
  }
  if (projectApi.isHandlingTasks() && projectApi.getPhase() === "building") {
    htmlCode.value = projectHtml;
    cssCode.value = projectCss;
    applyPreview(projectHtml, projectCss);
    setTip("Code reset for your project. Press Show when ready.");
    persistLesson();
    return;
  }
  htmlCode.value = starterHtml;
  cssCode.value = starterCss;
  applyPreview(htmlCode.value, cssCode.value);
  showTask();
  persistLesson();
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
  if (projectApi.showHelp()) {
    return;
  }
  taskBar.classList.add("is-help");
  setTip(tasks[taskIndex].help);
});

nextBtn.addEventListener("click", function () {
  if (projectApi.handleNext()) {
    persistLesson();
    return;
  }
  if (taskIndex < tasks.length - 1) {
    taskIndex += 1;
    showTask();
    persistLesson();
  }
});

document.getElementById("run-btn").addEventListener("click", showPreview);
document.getElementById("reset-btn").addEventListener("click", resetCode);

htmlCode.addEventListener("input", persistLessonSoon);
cssCode.addEventListener("input", persistLessonSoon);

(function bootLesson() {
  var saved =
    typeof CodeReefProgress !== "undefined" ? CodeReefProgress.load(PATH_KEY) : null;
  if (saved) {
    taskIndex = CodeReefProgress.clampTaskIndex(saved.taskIndex, tasks.length);
    htmlCode.value =
      typeof saved.html === "string" && saved.html.length > 0
        ? saved.html
        : starterHtml;
    cssCode.value =
      typeof saved.css === "string" && saved.css.length > 0 ? saved.css : starterCss;
  } else {
    htmlCode.value = starterHtml;
    cssCode.value = starterCss;
  }
  applyPreview(htmlCode.value, cssCode.value);

  if (projectApi.resumeIfNeeded()) {
    return;
  }

  showTask();
  if (saved && saved.taskDone) {
    restoreDoneWaitingForNext();
  }
})();
