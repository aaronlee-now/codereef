if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("java-code");
const outputBox = document.getElementById("java-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const starterCode = `System.out.println("Hello, reef!");
`;

const tasks = [
  {
    goal: 'Task 1: Make Java say Hello, ocean!',
    help:
      'Find System.out.println("Hello, reef!"); in your code. ' +
      "Change the word reef to ocean. Keep the quotes, parentheses, and semicolon. " +
      'It should look like System.out.println("Hello, ocean!"); Then press Run. ' +
      "(In real Java this lives inside public class Main and public static void main — " +
      "this playground is OK with or without that wrapper.)",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love Java!",
    help:
      "You need two System.out.println lines, one under the other. " +
      'Line 1: System.out.println("Hello, ocean!"); ' +
      'Line 2: System.out.println("I love Java!"); ' +
      "Each println goes on its own line and ends with a semicolon. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love java!";
    },
  },
  {
    goal: 'Task 3: Make a variable String fish = "clownfish"; and print it.',
    help:
      "In Java, String means text. " +
      'Type String fish = "clownfish"; on one line (quotes around clownfish, semicolon at the end). ' +
      "On the next line type System.out.println(fish); — no quotes around fish, " +
      "because you want the value inside the variable. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /string\s+fish\s*=\s*["']clownfish["']/.test(code);
      return hasVar && normalizeOut(lastOutput) === "clownfish";
    },
  },
  {
    goal: "Task 4: Use a for loop to print 1, then 2, then 3.",
    help:
      "Java for loops use int (a whole number) and braces { }. Type exactly:\n" +
      "for (int i = 1; i <= 3; i++) {\n" +
      "  System.out.println(i);\n" +
      "}\n" +
      "int i = 1 starts at 1. i <= 3 means keep going while i is 1, 2, or 3. " +
      "i++ means add 1 each time. The println line sits between the braces. Press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s*\(\s*int\s+\w+\s*=/.test(code);
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
    openCoralTrail("java", {
      onComplete: function () {
        if (taskIndex < tasks.length - 1) {
          taskIndex += 1;
          showTask();
        } else {
          setTip("You finished all the Java tasks. Awesome!");
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
    setTip("You finished all the Java tasks. Awesome!");
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
    throw new Error("Empty value inside println() or =");
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
        expr + " is not defined yet. Make it with String name = value; first."
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
  if (/^public\s+class\s+[A-Za-z_][A-Za-z0-9_]*\s*\{\s*$/.test(line)) {
    return true;
  }
  if (
    /^public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*[A-Za-z_][A-Za-z0-9_]*\s*\)\s*\{\s*$/.test(
      line
    )
  ) {
    return true;
  }
  if (line === "}") {
    return true;
  }
  return false;
}

function runSimple(line, vars, output) {
  const stringDecl = line.match(
    /^String\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*;$/
  );
  if (stringDecl) {
    vars[stringDecl[1]] = evalExpr(stringDecl[2], vars);
    return;
  }

  const intDecl = line.match(
    /^int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*;$/
  );
  if (intDecl) {
    vars[intDecl[1]] = Number(evalExpr(intDecl[2], vars));
    return;
  }

  const printlnMatch = line.match(/^System\.out\.println\s*\((.*)\)\s*;$/);
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
    'Try System.out.println(...); or String name = value;. Got: ' + line
  );
}

function runTinyJava(source) {
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
      /^for\s*\(\s*int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|<)\s*(-?\d+)\s*;\s*\1\+\+\s*\)\s*\{\s*$/
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
          "Your for loop needs a line inside the braces, like System.out.println(i);"
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

    if (/^for\s*\(/.test(line)) {
      throw new Error(
        "Use a Java for loop like: for (int i = 1; i <= 3; i++) { ... }"
      );
    }

    runSimple(line, vars, output);
    i += 1;
  }

  return output.join("\n");
}

function runCode() {
  try {
    lastOutput = runTinyJava(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone) {
      setTip("Java got stuck. Read the red error, or tap Help.");
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
