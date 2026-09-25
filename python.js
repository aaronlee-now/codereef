if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("py-code");
const outputBox = document.getElementById("py-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "python";
if (typeof CodeReefProgress !== "undefined") {
  CodeReefProgress.rememberLastPath(PATH_KEY);
}

const starterCode = `print("Hello, reef!")
`;

const projectStarter = `print("My reef project")
`;

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

function outHas(line) {
  const lines = normalizeOut(lastOutput).split("\n");
  return lines.indexOf(String(line).toLowerCase()) !== -1;
}

function outContains(bit) {
  return normalizeOut(lastOutput).indexOf(String(bit).toLowerCase()) !== -1;
}

const tasks = [
  {
    goal: 'Task 1: Make Python say Hello, ocean!',
    help:
      "Replace only the word reef with ocean; keep the rest of the line. " +
      'Find print("Hello, reef!") in your code. ' +
      'Change it to print("Hello, ocean!") — keep the quotes and parentheses. ' +
      "Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love Python!",
    help:
      "Keep your old code. Add a new line under it. " +
      'Keep print("Hello, ocean!") on line 1. ' +
      'Under it, type print("I love Python!") on line 2. ' +
      "Each print goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love python!";
    },
  },
  {
    goal: 'Task 3: Make a variable fish = "clownfish" and print it.',
    help:
      "Keep your old code. Add new lines under it (old prints are OK). " +
      "A variable is a name that remembers a value. " +
      'Type fish = "clownfish" on one line (quotes around clownfish). ' +
      "On the next line type print(fish) — no quotes around fish this time. " +
      "Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /fish\s*=\s*["']clownfish["']/.test(code);
      const printsFish = /print\s*\(\s*fish\s*\)/.test(code);
      return hasVar && printsFish && outHas("clownfish");
    },
  },
  {
    goal: "Task 4: Use a for loop to print 1, then 2, then 3.",
    help:
      "You can delete the old code and start fresh for this task (loops are easier on a clean page). " +
      "Type exactly:\n" +
      "for i in range(1, 4):\n" +
      "    print(i)\n" +
      "The second line must be indented (press Tab or Space a few times). " +
      "range(1, 4) means start at 1 and stop before 4. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s+\w+\s+in\s+range\s*\(/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "1\n2\n3";
    },
  },
];

const finalIdeas = [
  {
    id: "story",
    title: "Story printer",
    blurb: "Print a tiny ocean story, one line at a time.",
    plan: [
      "Start fresh with a story title line.",
      "Add a second story line.",
      "Add a third line that ends the story.",
    ],
    steps: [
      {
        goal: "Project step 1: Print a story title.",
        help:
          "You can delete the old code and start fresh for this project. " +
          'Type print("Ocean Story") (or any title you like with the word Story or Ocean). Then press Run.',
        check: function (ctx) {
          return (
            /print\s*\(/i.test(ctx.code) &&
            (/(story|ocean|reef|wave)/i.test(ctx.output) ||
              normalizeOut(ctx.output).length > 0)
          );
        },
      },
      {
        goal: "Project step 2: Add a second story line.",
        help:
          "Keep your old code. Add a new print under it with the next sentence. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
      {
        goal: "Project step 3: Add a third story line.",
        help:
          "Keep your old code. Add one more print for the ending. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
    ],
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Store a fish name in a variable and print it.",
    plan: [
      "Clear or keep a clean page.",
      "Make a variable with a fish name.",
      "Print a hello line that uses that name.",
    ],
    steps: [
      {
        goal: "Project step 1: Make a fish name variable.",
        help:
          "You can delete the old code and start fresh for this project. " +
          'Type name = "Bubbles" (any fishy name in quotes). Then press Run — it is OK if nothing prints yet, or add print(name).',
        check: function (ctx) {
          return /\w+\s*=\s*["'][^"']+["']/.test(ctx.code);
        },
      },
      {
        goal: "Project step 2: Print the fish name.",
        help:
          "Keep your old code. Add print(name) (use your variable’s name). Then press Run.",
        check: function (ctx) {
          return /print\s*\(\s*\w+\s*\)/.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 3: Print a hello line with words + the name.",
        help:
          'Keep your old code. Add something like print("Hello, " + name) then press Run.',
        check: function (ctx) {
          const lines = normalizeOut(ctx.output).split("\n").filter(Boolean);
          return lines.length >= 2 || /hello|hi|meet|named/.test(normalizeOut(ctx.output));
        },
      },
    ],
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question and print the answer.",
    plan: [
      "Print a quiz question.",
      "Store the answer in a variable.",
      "Print the answer.",
    ],
    steps: [
      {
        goal: "Project step 1: Print a question.",
        help:
          "You can delete the old code and start fresh for this project. " +
          'Type print("What color is the ocean?") Then press Run.',
        check: function (ctx) {
          return /print\s*\(/i.test(ctx.code) && /\?|what|which|who|color/.test(normalizeOut(ctx.output) + ctx.code.toLowerCase());
        },
      },
      {
        goal: "Project step 2: Make an answer variable.",
        help:
          'Keep your old code. Add answer = "blue" (or your answer in quotes). Then press Run.',
        check: function (ctx) {
          return /answer\s*=\s*["'][^"']+["']/i.test(ctx.code) || /\w+\s*=\s*["'][^"']+["']/.test(ctx.code);
        },
      },
      {
        goal: "Project step 3: Print the answer.",
        help:
          "Keep your old code. Add print(answer) (or print your variable). Then press Run.",
        check: function (ctx) {
          return /print\s*\(\s*\w+\s*\)/.test(ctx.code) && normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ocean adventure",
    blurb: "Title + variable + a loop that counts waves.",
    plan: [
      "Print an adventure title.",
      "Make a variable for your hero fish.",
      "Use a for loop to print wave numbers.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Print an adventure title.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          'Type print("Ocean Adventure") Then press Run.',
        check: function (ctx) {
          return /print\s*\(/i.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Make a hero variable and print it.",
        help:
          'Keep your old code. Add hero = "Fin" and print(hero). Then press Run.',
        check: function (ctx) {
          return /\w+\s*=\s*["'][^"']+["']/.test(ctx.code) && /print\s*\(\s*\w+\s*\)/.test(ctx.code);
        },
      },
      {
        goal: "Advanced step 3: Loop to print 1, 2, 3 (waves).",
        help:
          "Keep your title and hero if you want. Add:\n" +
          "for i in range(1, 4):\n" +
          "    print(i)\n" +
          "Then press Run. (Seeing 1 2 3 in the output is the goal.)",
        check: function (ctx) {
          const code = ctx.code.toLowerCase();
          const usedLoop = /for\s+\w+\s+in\s+range\s*\(/.test(code);
          const lines = normalizeOut(ctx.output).split("\n");
          return usedLoop && lines.indexOf("1") !== -1 && lines.indexOf("2") !== -1 && lines.indexOf("3") !== -1;
        },
      },
    ],
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "Question, answer, and a score number.",
    plan: [
      "Print a hard question.",
      "Store answer and score variables.",
      "Print both answer and score.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Print a quiz question.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          'Type print("How many legs does an octopus have?") Then press Run.',
        check: function (ctx) {
          return /print\s*\(/i.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Make answer and score variables.",
        help:
          'Keep your old code. Add answer = "8" and score = "10" (quotes are OK). Then press Run.',
        check: function (ctx) {
          const assigns = ctx.code.match(/\w+\s*=\s*["']?[^"'\n]+["']?/g);
          return assigns && assigns.length >= 2;
        },
      },
      {
        goal: "Advanced step 3: Print answer and score.",
        help:
          "Keep your old code. Add print(answer) and print(score). Then press Run.",
        check: function (ctx) {
          return (ctx.code.match(/print\s*\(/gi) || []).length >= 2 && normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "List three sea creatures with prints.",
    plan: [
      "Print a catalog title.",
      "Print two creature names.",
      "Print a third creature name.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Print a catalog title.",
        help:
          "You can delete the old code and start fresh for this advanced project. " +
          'Type print("Sea Creatures") Then press Run.',
        check: function (ctx) {
          return /print\s*\(/i.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Print two creature names.",
        help:
          'Keep your old code. Add print("clownfish") and print("turtle"). Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
      {
        goal: "Advanced step 3: Print one more creature.",
        help:
          'Keep your old code. Add another print("dolphin") (or any creature). Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 4;
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
  pathKey: "python",
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
    openCoralTrail("python", {
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

function stripComment(line) {
  let inStr = null;
  for (let c = 0; c < line.length; c += 1) {
    const ch = line[c];
    if (inStr) {
      if (ch === "\\" && c + 1 < line.length) {
        c += 1;
        continue;
      }
      if (ch === inStr) {
        inStr = null;
      }
    } else if (ch === '"' || ch === "'") {
      inStr = ch;
    } else if (ch === "#") {
      return line.slice(0, c);
    }
  }
  return line;
}

function evalExpr(expr, vars) {
  expr = expr.trim();
  if (!expr) {
    throw new Error("Empty value inside print() or =");
  }

  const strMatch = expr.match(/^(["'])([\s\S]*)\1$/);
  if (strMatch) {
    return strMatch[2];
  }

  if (/^-?\d+$/.test(expr)) {
    return Number(expr);
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(expr)) {
    if (!(expr in vars)) {
      throw new Error(expr + " is not defined yet. Make it with name = value first.");
    }
    return vars[expr];
  }

  const plus = expr.match(/^(.+?)\s*\+\s*(.+)$/);
  if (plus) {
    return evalExpr(plus[1], vars) + evalExpr(plus[2], vars);
  }

  throw new Error("I don't understand: " + expr);
}

function runTinyPython(source) {
  const lines = String(source || "").replace(/\r/g, "").split("\n");
  const vars = Object.create(null);
  const output = [];
  let i = 0;

  function runSimple(line) {
    const assign = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (assign) {
      vars[assign[1]] = evalExpr(assign[2], vars);
      return;
    }

    const printMatch = line.match(/^print\s*\((.*)\)\s*$/);
    if (printMatch) {
      const inner = printMatch[1].trim();
      if (!inner) {
        output.push("");
        return;
      }
      output.push(String(evalExpr(inner, vars)));
      return;
    }

    throw new Error("Try print(...) or name = value. Got: " + line);
  }

  while (i < lines.length) {
    const raw = lines[i];
    const noComment = stripComment(raw);
    const indent = (noComment.match(/^\s*/) || [""])[0].length;
    const line = noComment.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (indent > 0) {
      throw new Error(
        "Line " +
          (i + 1) +
          " is indented, but it is not inside a loop. Remove the spaces at the start."
      );
    }

    const forMatch = line.match(
      /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+range\s*\(([^)]+)\)\s*:$/
    );
    if (forMatch) {
      const loopVar = forMatch[1];
      const argParts = forMatch[2].split(",").map(function (part) {
        return Number(evalExpr(part.trim(), vars));
      });

      let start = 0;
      let end = 0;
      if (argParts.length === 1) {
        end = argParts[0];
      } else if (argParts.length === 2) {
        start = argParts[0];
        end = argParts[1];
      } else {
        throw new Error("Use range(n) or range(start, stop).");
      }

      i += 1;
      const body = [];
      while (i < lines.length) {
        const bodyRaw = lines[i];
        const bodyNoComment = stripComment(bodyRaw);
        if (!bodyNoComment.trim()) {
          i += 1;
          continue;
        }
        const bodyIndent = (bodyNoComment.match(/^\s*/) || [""])[0].length;
        if (bodyIndent === 0) {
          break;
        }
        body.push(bodyNoComment.trim());
        i += 1;
      }

      if (body.length === 0) {
        throw new Error("Your for loop needs an indented line under it, like print(i).");
      }

      for (let n = start; n < end; n += 1) {
        vars[loopVar] = n;
        body.forEach(function (bodyLine) {
          runSimple(bodyLine);
        });
      }
      continue;
    }

    runSimple(line);
    i += 1;
  }

  return output.join("\n");
}

function runCode() {
  try {
    lastOutput = runTinyPython(codeBox.value);
    outputBox.textContent = lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("Python got stuck. Read the red error, or tap Help.");
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
    if (typeof saved.code === "string" && saved.code.length > 0) {
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
