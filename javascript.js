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

const starterCode = `console.log("Hello, reef!");
`;

const tasks = [
  {
    goal: 'Task 1: Make JavaScript say Hello, ocean!',
    help:
      'Find console.log("Hello, reef!"); in your code. ' +
      "Change the word reef to ocean. Keep the quotes, parentheses, and semicolon. " +
      'It should look like console.log("Hello, ocean!"); Then press Run.',
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Log two lines — Hello, ocean! then I love JavaScript!",
    help:
      "You need two console.log lines, one under the other. " +
      'Line 1: console.log("Hello, ocean!"); ' +
      'Line 2: console.log("I love JavaScript!"); ' +
      "Each log goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love javascript!";
    },
  },
  {
    goal: 'Task 3: Make a variable let fish = "clownfish"; and log it.',
    help:
      "In JavaScript we often start variables with let. " +
      'Type let fish = "clownfish"; on one line (quotes around clownfish, semicolon at the end). ' +
      "On the next line type console.log(fish); — no quotes around fish, " +
      "so it prints the value inside the variable. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /let\s+fish\s*=\s*["']clownfish["']/.test(code);
      return hasVar && normalizeOut(lastOutput) === "clownfish";
    },
  },
  {
    goal: "Task 4: Make a function double that returns n * 2, then log double(5).",
    help:
      "A function is a mini-machine you can reuse. Type:\n" +
      "function double(n) {\n" +
      "  return n * 2;\n" +
      "}\n" +
      "console.log(double(5));\n" +
      "The curly braces { } wrap the function body. return sends the answer back. " +
      "double(5) should print 10. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasFn = /function\s+double\s*\(/.test(code);
      return hasFn && normalizeOut(lastOutput) === "10";
    },
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
  setTip("Do the task, then press Run. Tap Help if you get stuck.");
}

function markTaskDone() {
  taskDone = true;
  taskBar.classList.add("is-done");
  taskBar.classList.remove("is-help");
  taskGoal.textContent =
    "Nice job! " + tasks[taskIndex].goal.replace(/^Task \d+:\s*/, "");

  // After every 3 tasks, open the coral trail for prizes.
  if (shouldShowCoralTrail(taskIndex)) {
    showNextButton(false);
    setTip("Coral trail time! Swim up for prizes.");
    openCoralTrail("javascript", {
      onComplete: function () {
        if (taskIndex < tasks.length - 1) {
          taskIndex += 1;
          showTask();
        } else {
          setTip("You finished all the JavaScript tasks. Awesome!");
        }
      },
    });
    return;
  }

  if (taskIndex < tasks.length - 1) {
    showNextButton(true);
    setTip("Task complete! Tap Next task when ready.");
  } else {
    showNextButton(false);
    setTip("You finished all the JavaScript tasks. Awesome!");
  }
}

function checkTask() {
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
    if (!taskDone) {
      setTip("JavaScript got stuck. Read the red error, or tap Help.");
    }
  }
}

function resetCode() {
  codeBox.value = starterCode;
  lastOutput = "";
  outputBox.textContent = "Press Run to see output here.";
  outputBox.classList.remove("is-error");
  showTask();
}

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

document.getElementById("run-btn").addEventListener("click", runCode);
document.getElementById("reset-btn").addEventListener("click", resetCode);

codeBox.value = starterCode;
outputBox.textContent = "Press Run to see output here.";
showTask();
