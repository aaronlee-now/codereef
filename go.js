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

const starterCode = `fmt.Println("Hello, reef!")
`;

const tasks = [
  {
    goal: 'Task 1: Make Go say Hello, ocean!',
    help:
      'Find fmt.Println("Hello, reef!") in your code. ' +
      "Change the word reef to ocean. Keep the quotes and the parentheses. " +
      'It should look like fmt.Println("Hello, ocean!") Then press Run. ' +
      "(You can add package main and import \"fmt\" if you like — this playground is OK either way.)",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love Go!",
    help:
      "You need two fmt.Println lines, one under the other. " +
      'Line 1: fmt.Println("Hello, ocean!") ' +
      'Line 2: fmt.Println("I love Go!") ' +
      "Each Println goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love go!";
    },
  },
  {
    goal: 'Task 3: Make a variable fish := "clownfish" and print it.',
    help:
      "In Go, := makes a variable and gives it a value in one step. " +
      'Type fish := "clownfish" on one line (quotes around clownfish). ' +
      "On the next line type fmt.Println(fish) — no quotes around fish, " +
      "because you want the value inside the variable. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /fish\s*:=\s*["']clownfish["']/.test(code);
      return hasVar && normalizeOut(lastOutput) === "clownfish";
    },
  },
  {
    goal: "Task 4: Use a for loop to print 1, then 2, then 3.",
    help:
      "Go for loops use braces { }. Type exactly:\n" +
      "for i := 1; i <= 3; i++ {\n" +
      "  fmt.Println(i)\n" +
      "}\n" +
      "i := 1 starts at 1. i <= 3 means keep going while i is 1, 2, or 3. " +
      "i++ means add 1 each time. The Println line sits between the braces. Press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s+\w+\s*:=/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "1\n2\n3";
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
    openCoralTrail("go", {
      onComplete: function () {
        if (taskIndex < tasks.length - 1) {
          taskIndex += 1;
          showTask();
        } else {
          setTip("You finished all the Go tasks. Awesome!");
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
    setTip("You finished all the Go tasks. Awesome!");
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
    if (!taskDone) {
      setTip("Go got stuck. Read the red error, or tap Help.");
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
