if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("js-code");
const outputBox = document.getElementById("js-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "javascript";
if (typeof CodeReefProgress !== "undefined") {
  CodeReefProgress.rememberLastPath(PATH_KEY);
}

function snapshotProgress() {
  return {
    taskIndex: taskIndex,
    taskDone: taskDone,
    code: codeBox.value,
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

const starterCode = `console.log("Hello, reef!");
`;

const projectStarter = `console.log("My reef project");
`;

const tasks = [
  {
    goal: 'Task 1: Make JavaScript say Hello, ocean!',
    help:
      "Replace only the word reef with ocean; keep the rest of the line. " +
      'Find console.log("Hello, reef!"); in your code. ' +
      'Change it to console.log("Hello, ocean!"); — keep quotes, parentheses, and the semicolon. ' +
      "Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Log two lines — Hello, ocean! then I love JavaScript!",
    help:
      "Keep your old code. Add a new line under it. " +
      'Keep console.log("Hello, ocean!"); on line 1. ' +
      'Under it, type console.log("I love JavaScript!"); ' +
      "Each log goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love javascript!";
    },
  },
  {
    goal: 'Task 3: Make a variable let fish = "clownfish"; and log it.',
    help:
      "Keep your old code. Add new lines under it (old logs are OK). " +
      "In JavaScript we often start variables with let. " +
      'Type let fish = "clownfish"; on one line. ' +
      "On the next line type console.log(fish); — no quotes around fish. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /let\s+fish\s*=\s*["']clownfish["']/.test(code);
      const lines = normalizeOut(lastOutput).split("\n");
      return hasVar && lines.indexOf("clownfish") !== -1;
    },
  },
  {
    goal: "Task 4: Make a function double that returns n * 2, then log double(5).",
    help:
      "You can delete the old code and start fresh for this task (functions are easier on a clean page). " +
      "Type:\n" +
      "function double(n) {\n" +
      "  return n * 2;\n" +
      "}\n" +
      "console.log(double(5));\n" +
      "The curly braces { } wrap the function body. double(5) should print 10. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasFn = /function\s+double\s*\(/.test(code);
      return hasFn && normalizeOut(lastOutput) === "10";
    },
  },
  {
    goal: "Task 5: Log the number 5.",
    help:
      "You can delete the old code and start fresh for this task. " +
      "Type: console.log(5); — no quotes around 5. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "5";
    },
  },
  {
    goal: 'Task 6: Make let coral = "reef"; and log it.',
    help:
      "Keep your old code or start fresh — either is OK. " +
      'Type let coral = "reef"; then console.log(coral); ' +
      "Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /let\s+coral\s*=\s*["']reef["']/.test(code);
      return hasVar && normalizeOut(lastOutput).split("\n").indexOf("reef") !== -1;
    },
  },
  {
    goal: "Task 7: Use a for loop to log 1, then 2, then 3.",
    help:
      "You can delete the old code and start fresh for this task. " +
      "Type:\n" +
      "for (let i = 1; i <= 3; i++) {\n" +
      "  console.log(i);\n" +
      "}\n" +
      "Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s*\(/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "1\n2\n3";
    },
  },
];

const finalIdeas = [
  {
    id: "messages",
    title: "Button page messages",
    blurb: "Log friendly messages like a button was pressed.",
    plan: [
      "Start with a welcome message.",
      "Add a second “button clicked” message.",
      "Add a third cheer message.",
    ],
    steps: [
      {
        goal: "Project step 1: Log a welcome message.",
        help:
          "You can delete the old code and start fresh for this project. " +
          'Type console.log("Welcome!"); Then press Run.',
        check: function (ctx) {
          return /console\.log\s*\(/i.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 2: Log a second message.",
        help:
          'Keep your old code. Add console.log("Button clicked!"); Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
      {
        goal: "Project step 3: Log a cheer message.",
        help:
          'Keep your old code. Add console.log("You did it!"); Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
    ],
  },
  {
    id: "score",
    title: "Score counter",
    blurb: "Keep a score in a variable and log it.",
    plan: [
      "Make a score variable.",
      "Log the score.",
      "Log a “new high score” line.",
    ],
    steps: [
      {
        goal: "Project step 1: Make a score variable.",
        help:
          "You can delete the old code and start fresh for this project. " +
          "Type let score = 0; Then press Run.",
        check: function (ctx) {
          return /let\s+score\s*=/.test(ctx.code.toLowerCase());
        },
      },
      {
        goal: "Project step 2: Log the score.",
        help:
          "Keep your old code. Add console.log(score); Then press Run.",
        check: function (ctx) {
          return /console\.log\s*\(\s*score\s*\)/.test(ctx.code.toLowerCase()) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 3: Log a high-score message.",
        help:
          'Keep your old code. Add console.log("New high score!"); Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
  {
    id: "greeting",
    title: "Greeting machine",
    blurb: "Store a name and say hello.",
    plan: [
      "Make a name variable.",
      "Log the name.",
      "Log a hello line.",
    ],
    steps: [
      {
        goal: "Project step 1: Make a name variable.",
        help:
          "You can delete the old code and start fresh for this project. " +
          'Type let name = "Sam"; Then press Run.',
        check: function (ctx) {
          return /let\s+name\s*=\s*["'][^"']+["']/.test(ctx.code.toLowerCase());
        },
      },
      {
        goal: "Project step 2: Log the name.",
        help:
          "Keep your old code. Add console.log(name); Then press Run.",
        check: function (ctx) {
          return /console\.log\s*\(\s*name\s*\)/.test(ctx.code.toLowerCase()) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 3: Log a greeting.",
        help:
          'Keep your old code. Add console.log("Hello!"); Then press Run.',
        check: function (ctx) {
          return /hello|hi|hey/.test(normalizeOut(ctx.output)) || normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
];

const advancedIdeas = [
  {
    id: "doubleplus",
    title: "Double machine",
    blurb: "Build double() and log a few answers.",
    plan: [
      "Write a double function.",
      "Log double(5).",
      "Log double(8) too.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Make function double.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          "Type:\nfunction double(n) {\n  return n * 2;\n}\nThen press Run.",
        check: function (ctx) {
          return /function\s+double\s*\(/.test(ctx.code.toLowerCase());
        },
      },
      {
        goal: "Advanced step 2: Log double(5).",
        help:
          "Keep your old code. Add console.log(double(5)); Then press Run.",
        check: function (ctx) {
          return /double\s*\(\s*5\s*\)/.test(ctx.code) && normalizeOut(ctx.output).indexOf("10") !== -1;
        },
      },
      {
        goal: "Advanced step 3: Also log double(8).",
        help:
          "Keep your old code. Add console.log(double(8)); Then press Run.",
        check: function (ctx) {
          const out = normalizeOut(ctx.output);
          return out.indexOf("10") !== -1 && out.indexOf("16") !== -1;
        },
      },
    ],
  },
  {
    id: "chatty",
    title: "Chatty page",
    blurb: "Four friendly console messages.",
    plan: [
      "Log a title.",
      "Log two more lines.",
      "Log a goodbye.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Log a title.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          'Type console.log("Chatty Page"); Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Log two more lines.",
        help:
          "Keep your old code. Add two more console.log lines. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
      {
        goal: "Advanced step 3: Log goodbye.",
        help:
          'Keep your old code. Add console.log("Goodbye!"); Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 4;
        },
      },
    ],
  },
  {
    id: "nametag",
    title: "Name tag printer",
    blurb: "Variable name + hello + fun fact.",
    plan: [
      "Make a name variable.",
      "Log hello and the name.",
      "Log a fun fact line.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Make a name variable.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          'Type let name = "Reefy"; Then press Run.',
        check: function (ctx) {
          return /let\s+\w+\s*=\s*["']/.test(ctx.code.toLowerCase());
        },
      },
      {
        goal: "Advanced step 2: Log the name.",
        help:
          "Keep your old code. Add console.log(name); Then press Run.",
        check: function (ctx) {
          return /console\.log\s*\(\s*\w+\s*\)/.test(ctx.code.toLowerCase()) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 3: Log a fun fact.",
        help:
          'Keep your old code. Add console.log("I love coding!"); Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
];

function normalizeOut(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .trim()
    .toLowerCase();
}

function setTip(text) {
  if (helpLine) {
    helpLine.textContent = text;
  }
}

const projectApi = CodeReefProject.attach({
  pathKey: "javascript",
  actionLabel: "Run",
  ideas: finalIdeas,
  advancedIdeas: advancedIdeas,
  setTip: setTip,
  taskBar: taskBar,
  taskGoal: taskGoal,
  nextBtn: nextBtn,
  onProjectStart: function () {
    codeBox.value = projectStarter;
    lastOutput = "";
    outputBox.textContent = "Press Run to see output here.";
    outputBox.classList.remove("is-error");
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
  return { code: codeBox.value, output: lastOutput };
}

function showTask() {
  taskDone = false;
  taskBar.classList.remove("is-done", "is-help", "is-project", "is-advanced");
  showNextButton(false);
  nextBtn.textContent = "Next task";
  taskGoal.textContent = tasks[taskIndex].goal;
  setTip("Do the task, then press Run. Tap Help if you get stuck.");
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
    openCoralTrail("javascript", {
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
    setTip("Not quite yet. Tap Help for a bigger hint, then try Run again.");
  }
}

function runKidJs(source) {
  const lines = [];
  const kidConsole = {
    log: function () {
      const parts = [];
      for (let i = 0; i < arguments.length; i += 1) {
        parts.push(String(arguments[i]));
      }
      lines.push(parts.join(" "));
    },
  };

  const runner = new Function(
    "console",
    '"use strict";\n' + String(source || "")
  );
  runner(kidConsole);
  return lines.join("\n");
}

function runCode() {
  try {
    lastOutput = runKidJs(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing logged yet — try console.log)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + (err && err.message ? err.message : String(err));
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("JavaScript got stuck. Read the red error, or tap Help.");
    }
  }
}

function resetCode() {
  if (typeof CodeReefProgress !== "undefined") {
    CodeReefProgress.clear(PATH_KEY);
  }
  if (projectApi.isHandlingTasks() && projectApi.getPhase() === "building") {
    codeBox.value = projectStarter;
    lastOutput = "";
    outputBox.textContent = "Press Run to see output here.";
    outputBox.classList.remove("is-error");
    setTip("Code reset for your project. Press Run when ready.");
    persistLesson();
    return;
  }
  codeBox.value = starterCode;
  lastOutput = "";
  outputBox.textContent = "Press Run to see output here.";
  outputBox.classList.remove("is-error");
  showTask();
  persistLesson();
}

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

document.getElementById("run-btn").addEventListener("click", runCode);
document.getElementById("reset-btn").addEventListener("click", resetCode);

codeBox.addEventListener("input", persistLessonSoon);

outputBox.textContent = "Press Run to see output here.";

(function bootLesson() {
  var saved =
    typeof CodeReefProgress !== "undefined" ? CodeReefProgress.load(PATH_KEY) : null;
  if (saved) {
    taskIndex = CodeReefProgress.clampTaskIndex(saved.taskIndex, tasks.length);
    if (typeof saved.code === "string" && saved.code.trim().length > 0) {
      codeBox.value = saved.code;
    } else {
      codeBox.value = starterCode;
    }
  } else {
    codeBox.value = starterCode;
  }

  if (projectApi.resumeIfNeeded()) {
    return;
  }

  showTask();
  if (saved && saved.taskDone) {
    restoreDoneWaitingForNext();
  }
})();
