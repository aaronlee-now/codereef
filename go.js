if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("go-code");
const outputBox = document.getElementById("go-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "go";
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

const starterCode = `fmt.Println("Hello, reef!")
`;

const projectStarter = `fmt.Println("My reef project")
`;

const tasks = [
  {
    goal: 'Task 1: Make Go say Hello, ocean!',
    help:
      "Replace only the word reef with ocean; keep the rest of the line. " +
      'Find fmt.Println("Hello, reef!") in your code. ' +
      'Change it to fmt.Println("Hello, ocean!") — keep the quotes and parentheses. ' +
      "Then press Run. (package main and import \"fmt\" are optional here.)",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love Go!",
    help:
      "Keep your old code. Add a new line under it. " +
      'Keep fmt.Println("Hello, ocean!") on line 1. ' +
      'Under it, type fmt.Println("I love Go!") ' +
      "Each Println goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love go!";
    },
  },
  {
    goal: 'Task 3: Make a variable fish := "clownfish" and print it.',
    help:
      "Keep your old code. Add new lines under it (old prints are OK). " +
      "In Go, := makes a variable and gives it a value in one step. " +
      'Type fish := "clownfish" on one line. ' +
      "On the next line type fmt.Println(fish) — no quotes around fish. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /fish\s*:=\s*["']clownfish["']/.test(code);
      const lines = normalizeOut(lastOutput).split("\n");
      return hasVar && lines.indexOf("clownfish") !== -1;
    },
  },
  {
    goal: "Task 4: Use a for loop to print 1, then 2, then 3.",
    help:
      "You can delete the old code and start fresh for this task (loops are easier on a clean page). " +
      "Type exactly:\n" +
      "for i := 1; i <= 3; i++ {\n" +
      "  fmt.Println(i)\n" +
      "}\n" +
      "i := 1 starts at 1. i <= 3 keeps going for 1, 2, 3. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s+\w+\s*:=/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "1\n2\n3";
    },
  },
  {
    goal: "Task 5: Print the number 5.",
    help:
      "You can delete the old code and start fresh for this task. " +
      "Type: fmt.Println(5) — no quotes around 5. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "5";
    },
  },
  {
    goal: 'Task 6: Make coral := "reef" and print it.',
    help:
      "Keep your old code or start fresh — either is OK. " +
      'Type coral := "reef" then fmt.Println(coral). Then press Run.',
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /coral\s*:=\s*["']reef["']/.test(code);
      return hasVar && normalizeOut(lastOutput).split("\n").indexOf("reef") !== -1;
    },
  },
  {
    goal: "Task 7: Loop to print splash three times.",
    help:
      "You can delete the old code and start fresh for this task. " +
      "Type:\n" +
      "for i := 1; i <= 3; i++ {\n" +
      '  fmt.Println("splash")\n' +
      "}\n" +
      "Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s+\w+\s*:=/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "splash\nsplash\nsplash";
    },
  },
];

const finalIdeas = [
  {
    id: "story",
    title: "Story printer",
    blurb: "Print a tiny ocean story, one line at a time.",
    plan: ["Print a story title.", "Add a second line.", "Add a third ending line."],
    steps: [
      {
        goal: "Project step 1: Print a story title.",
        help: 'You can delete the old code and start fresh for this project. Type fmt.Println("Ocean Story") Then press Run.',
        check: function (ctx) {
          return /fmt\.Println\s*\(/i.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 2: Add a second story line.",
        help: "Keep your old code. Add another fmt.Println under it. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
      {
        goal: "Project step 3: Add a third story line.",
        help: "Keep your old code. Add one more fmt.Println for the ending. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
    ],
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Store a fish name with := and print it.",
    plan: ["Make a name variable.", "Print the name.", "Print a hello line."],
    steps: [
      {
        goal: "Project step 1: Make a name variable.",
        help: 'You can delete the old code and start fresh for this project. Type name := "Bubbles" Then press Run.',
        check: function (ctx) {
          return /\w+\s*:=\s*["'][^"']+["']/.test(ctx.code);
        },
      },
      {
        goal: "Project step 2: Print the name.",
        help: "Keep your old code. Add fmt.Println(name) Then press Run.",
        check: function (ctx) {
          return /fmt\.Println\s*\(\s*\w+\s*\)/.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 3: Print a hello line.",
        help: 'Keep your old code. Add fmt.Println("Hello!") Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question and print an answer.",
    plan: ["Print a question.", "Make an answer variable.", "Print the answer."],
    steps: [
      {
        goal: "Project step 1: Print a question.",
        help: 'You can delete the old code and start fresh for this project. Type fmt.Println("What color is the ocean?") Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 2: Make an answer variable.",
        help: 'Keep your old code. Add answer := "blue" Then press Run.',
        check: function (ctx) {
          return /\w+\s*:=\s*["'][^"']+["']/.test(ctx.code);
        },
      },
      {
        goal: "Project step 3: Print the answer.",
        help: "Keep your old code. Add fmt.Println(answer) Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ocean adventure",
    blurb: "Title, hero variable, and a counting loop.",
    plan: ["Print a title.", "Make a hero variable.", "Loop to print 1, 2, 3."],
    steps: [
      {
        goal: "Advanced step 1: Print an adventure title.",
        help: 'You can delete the old code and start fresh for this advanced project. Type fmt.Println("Ocean Adventure") Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Make a hero variable and print it.",
        help: 'Keep your old code. Add hero := "Fin" and fmt.Println(hero) Then press Run.',
        check: function (ctx) {
          return /\w+\s*:=/.test(ctx.code) && /fmt\.Println\s*\(\s*\w+\s*\)/.test(ctx.code);
        },
      },
      {
        goal: "Advanced step 3: Loop to print 1, 2, 3.",
        help: "Keep your title if you want. Add a for loop that prints 1, 2, 3. Then press Run.",
        check: function (ctx) {
          const lines = normalizeOut(ctx.output).split("\n");
          return /for\s+\w+\s*:=/.test(ctx.code.toLowerCase()) && lines.indexOf("1") !== -1 && lines.indexOf("3") !== -1;
        },
      },
    ],
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "Question, answer, and score prints.",
    plan: ["Print a question.", "Make two variables.", "Print both values."],
    steps: [
      {
        goal: "Advanced step 1: Print a quiz question.",
        help: 'You can delete the old code and start fresh for this advanced project. Type fmt.Println("How many legs?") Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Make answer and score variables.",
        help: 'Keep your old code. Add answer := "8" and score := "10" Then press Run.',
        check: function (ctx) {
          return (ctx.code.match(/:=/g) || []).length >= 2;
        },
      },
      {
        goal: "Advanced step 3: Print answer and score.",
        help: "Keep your old code. Add fmt.Println(answer) and fmt.Println(score) Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "List sea creatures with Println.",
    plan: ["Print a title.", "Print two creatures.", "Print one more."],
    steps: [
      {
        goal: "Advanced step 1: Print a catalog title.",
        help: 'You can delete the old code and start fresh for this advanced project. Type fmt.Println("Sea Creatures") Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Print two creature names.",
        help: 'Keep your old code. Add two more fmt.Println lines. Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
      {
        goal: "Advanced step 3: Print one more creature.",
        help: "Keep your old code. Add another fmt.Println. Then press Run.",
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
  pathKey: "go",
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
    openCoralTrail("go", {
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
    } else if (ch === "/" && line[c + 1] === "/") {
      return line.slice(0, c);
    }
  }
  return line;
}

function evalExpr(expr, vars) {
  expr = expr.trim();
  if (!expr) {
    throw new Error("Empty value inside Println() or :=");
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
      throw new Error(
        expr + " is not defined yet. Make it with name := value first."
      );
    }
    return vars[expr];
  }

  const plus = expr.match(/^(.+?)\s*\+\s*(.+)$/);
  if (plus) {
    return evalExpr(plus[1], vars) + evalExpr(plus[2], vars);
  }

  throw new Error("I don't understand: " + expr);
}

function isIgnorableLine(line) {
  if (/^package\s+main\s*$/.test(line)) {
    return true;
  }
  if (/^import\s+"fmt"\s*$/.test(line)) {
    return true;
  }
  if (/^func\s+main\s*\(\s*\)\s*\{\s*$/.test(line)) {
    return true;
  }
  if (line === "}") {
    return true;
  }
  return false;
}

function runSimple(line, vars, output) {
  const shortDecl = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(.+)$/);
  if (shortDecl) {
    vars[shortDecl[1]] = evalExpr(shortDecl[2], vars);
    return;
  }

  const varDecl = line.match(/^var\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
  if (varDecl) {
    vars[varDecl[1]] = evalExpr(varDecl[2], vars);
    return;
  }

  const printlnMatch = line.match(/^fmt\.Println\s*\((.*)\)\s*$/);
  if (printlnMatch) {
    const inner = printlnMatch[1].trim();
    if (!inner) {
      output.push("");
      return;
    }
    output.push(String(evalExpr(inner, vars)));
    return;
  }

  throw new Error(
    'Try fmt.Println(...), name := value, or var name = value. Got: ' + line
  );
}

function runTinyGo(source) {
  const lines = String(source || "").replace(/\r/g, "").split("\n");
  const vars = Object.create(null);
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const noComment = stripComment(raw);
    const line = noComment.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (isIgnorableLine(line)) {
      i += 1;
      continue;
    }

    const forMatch = line.match(
      /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(-?\d+)\s*;\s*\1\s*(<=|<)\s*(-?\d+)\s*;\s*\1\+\+\s*\{\s*$/
    );
    if (forMatch) {
      const loopVar = forMatch[1];
      const start = Number(forMatch[2]);
      const op = forMatch[3];
      const end = Number(forMatch[4]);
      i += 1;

      const body = [];
      let depth = 1;
      while (i < lines.length && depth > 0) {
        const bodyRaw = lines[i];
        const bodyNoComment = stripComment(bodyRaw);
        const bodyLine = bodyNoComment.trim();
        i += 1;

        if (!bodyLine) {
          continue;
        }

        if (/\{\s*$/.test(bodyLine) && !/^\}/.test(bodyLine)) {
          depth += 1;
        }

        if (bodyLine === "}") {
          depth -= 1;
          if (depth === 0) {
            break;
          }
          continue;
        }

        if (depth === 1) {
          body.push(bodyLine);
        }
      }

      if (depth !== 0) {
        throw new Error("Your for loop needs a closing } brace.");
      }

      if (body.length === 0) {
        throw new Error(
          "Your for loop needs a line inside the braces, like fmt.Println(i)."
        );
      }

      for (let n = start; op === "<=" ? n <= end : n < end; n += 1) {
        vars[loopVar] = n;
        body.forEach(function (bodyLine) {
          runSimple(bodyLine, vars, output);
        });
      }
      continue;
    }

    if (/^for\s+/.test(line)) {
      throw new Error(
        "Use a Go for loop like: for i := 1; i <= 3; i++ { ... }"
      );
    }

    runSimple(line, vars, output);
    i += 1;
  }

  return output.join("\n");
}

function runCode() {
  try {
    lastOutput = runTinyGo(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("Go got stuck. Read the red error, or tap Help.");
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
