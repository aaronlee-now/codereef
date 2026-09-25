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

const starterCode = `print("Hello, reef!")
`;

const tasks = [
  {
    goal: 'Task 1: Make Python say Hello, ocean!',
    help:
      'Find print("Hello, reef!") in your code. ' +
      "Change the word reef to ocean. Keep the quotes and the parentheses. " +
      'It should look like print("Hello, ocean!") Then press Run.',
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love Python!",
    help:
      "You need two print lines, one under the other. " +
      'Line 1: print("Hello, ocean!") ' +
      'Line 2: print("I love Python!") ' +
      "Each print goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love python!";
    },
  },
  {
    goal: 'Task 3: Make a variable fish = "clownfish" and print it.',
    help:
      "A variable is a name that remembers a value. " +
      'Type fish = "clownfish" on one line (quotes around clownfish). ' +
      "On the next line type print(fish) — no quotes around fish this time, " +
      "because you want the value inside the variable. " +
      "Old print lines from earlier tasks are OK to keep. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /fish\s*=\s*["']clownfish["']/.test(code);
      const printsFish = /print\s*\(\s*fish\s*\)/.test(code);
      // Allow leftover prints from earlier tasks — just need a clownfish line.
      const lines = normalizeOut(lastOutput).split("\n");
      const showedClownfish = lines.indexOf("clownfish") !== -1;
      return hasVar && printsFish && showedClownfish;
    },
  },
  {
    goal: "Task 4: Use a for loop to print 1, then 2, then 3.",
    help:
      "A for loop repeats code. Type exactly:\n" +
      "for i in range(1, 4):\n" +
      "    print(i)\n" +
      "The second line must be indented (press Tab or Space a few times). " +
      "range(1, 4) means start at 1 and stop before 4, so you get 1, 2, 3. Press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s+\w+\s+in\s+range\s*\(/.test(code);
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
    openCoralTrail("python", {
      onComplete: function () {
        if (taskIndex < tasks.length - 1) {
          taskIndex += 1;
          showTask();
        } else {
          setTip("You finished all the Python tasks. Awesome!");
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
    setTip("You finished all the Python tasks. Awesome!");
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
    if (!taskDone) {
      setTip("Python got stuck. Read the red error, or tap Help.");
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
