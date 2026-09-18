if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("cpp-code");
const outputBox = document.getElementById("cpp-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const starterCode = `cout << "Hello, reef!" << endl;
`;

const tasks = [
  {
    goal: 'Task 1: Make C++ say Hello, ocean!',
    help:
      'Find cout << "Hello, reef!" << endl; in your code. ' +
      "Change the word reef to ocean. Keep the quotes, the << arrows, and the semicolon. " +
      'It should look like cout << "Hello, ocean!" << endl; Then press Run. ' +
      "(Real C++ often starts with #include <iostream> and using namespace std; — " +
      "this playground is OK with or without them.)",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love C++!",
    help:
      "You need two cout lines, one under the other. " +
      'Line 1: cout << "Hello, ocean!" << endl; ' +
      'Line 2: cout << "I love C++!" << endl; ' +
      "endl means “end the line” so the next cout starts on a new line. " +
      "Each cout goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love c++!";
    },
  },
  {
    goal: 'Task 3: Make a variable string fish = "clownfish"; and print it.',
    help:
      "A string variable remembers words. " +
      'Type string fish = "clownfish"; on one line (quotes around clownfish, semicolon at the end). ' +
      "On the next line type cout << fish << endl; — no quotes around fish, " +
      "because you want the value inside the variable. Then press Run. " +
      "(You can add #include <string> in real C++; here it is optional.)",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /string\s+fish\s*=\s*["']clownfish["']/.test(code);
      return hasVar && normalizeOut(lastOutput) === "clownfish";
    },
  },
  {
    goal: "Task 4: Use a for loop to print 1, then 2, then 3.",
    help:
      "A for loop repeats code. Type exactly:\n" +
      "for (int i = 1; i <= 3; i++) {\n" +
      "  cout << i << endl;\n" +
      "}\n" +
      "int i = 1 starts at 1. i <= 3 means keep going while i is 1, 2, or 3. " +
      "i++ means add 1 each time. The cout line sits between the braces { }. Press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s*\(\s*int\s+\w+/.test(code);
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
  if (taskIndex < tasks.length - 1) {
    showNextButton(true);
    setTip("Task complete! Tap Next task when ready.");
  } else {
    showNextButton(false);
    setTip("You finished all the C++ tasks. Awesome!");
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
    throw new Error("Empty value after << or =");
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
        expr + " is not defined yet. Make it with string name = value; first."
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
  if (/^#\s*include\s*<iostream>\s*$/.test(line)) {
    return true;
  }
  if (/^#\s*include\s*<string>\s*$/.test(line)) {
    return true;
  }
  if (/^using\s+namespace\s+std\s*;\s*$/.test(line)) {
    return true;
  }
  if (/^int\s+main\s*\(\s*\)\s*\{\s*$/.test(line)) {
    return true;
  }
  if (/^return\s+0\s*;\s*$/.test(line)) {
    return true;
  }
  if (line === "}") {
    return true;
  }
  return false;
}

function splitCoutParts(afterCout) {
  const parts = [];
  let i = 0;
  const s = afterCout.trim();

  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) {
      i += 1;
    }
    if (i >= s.length) {
      break;
    }

    if (s[i] === '"' || s[i] === "'") {
      const quote = s[i];
      let j = i + 1;
      let out = "";
      while (j < s.length) {
        if (s[j] === "\\" && j + 1 < s.length) {
          out += s[j + 1];
          j += 2;
          continue;
        }
        if (s[j] === quote) {
          break;
        }
        out += s[j];
        j += 1;
      }
      if (j >= s.length) {
        throw new Error("Missing closing quote in cout.");
      }
      parts.push({ type: "str", value: out });
      i = j + 1;
      continue;
    }

    if (/[A-Za-z_]/.test(s[i])) {
      let j = i + 1;
      while (j < s.length && /[A-Za-z0-9_:]/.test(s[j])) {
        j += 1;
      }
      const name = s.slice(i, j);
      if (name === "endl" || name === "std::endl") {
        parts.push({ type: "endl" });
      } else {
        parts.push({ type: "id", value: name });
      }
      i = j;
      continue;
    }

    if (/[0-9-]/.test(s[i])) {
      let j = i;
      if (s[j] === "-") {
        j += 1;
      }
      while (j < s.length && /[0-9]/.test(s[j])) {
        j += 1;
      }
      parts.push({ type: "num", value: Number(s.slice(i, j)) });
      i = j;
      continue;
    }

    throw new Error("I don't understand this cout piece: " + s.slice(i));
  }

  return parts;
}

function runCout(line, vars, output) {
  const match = line.match(/^cout\s*(<<[\s\S]*);?\s*$/);
  if (!match) {
    return false;
  }

  const chain = match[1];
  const chunks = [];
  let rest = chain;
  while (rest.length > 0) {
    const arrow = rest.match(/^\s*<<\s*([\s\S]*)$/);
    if (!arrow) {
      throw new Error('After cout, use << like: cout << "hi" << endl;');
    }
    rest = arrow[1];

    let nextArrow = -1;
    let inStr = null;
    for (let c = 0; c < rest.length; c += 1) {
      const ch = rest[c];
      if (inStr) {
        if (ch === "\\" && c + 1 < rest.length) {
          c += 1;
          continue;
        }
        if (ch === inStr) {
          inStr = null;
        }
      } else if (ch === '"' || ch === "'") {
        inStr = ch;
      } else if (ch === "<" && rest[c + 1] === "<") {
        nextArrow = c;
        break;
      }
    }

    let piece;
    if (nextArrow === -1) {
      piece = rest.replace(/;?\s*$/, "").trim();
      rest = "";
    } else {
      piece = rest.slice(0, nextArrow).trim();
      rest = rest.slice(nextArrow);
    }

    if (!piece) {
      throw new Error("Missing something after <<.");
    }
    chunks.push(piece);
  }

  if (chunks.length === 0) {
    throw new Error('Try cout << "Hello, reef!" << endl;');
  }

  let buf = "";
  chunks.forEach(function (piece) {
    const parts = splitCoutParts(piece);
    if (parts.length !== 1) {
      throw new Error("I don't understand: " + piece);
    }
    const part = parts[0];
    if (part.type === "endl") {
      output.push(buf);
      buf = "";
    } else if (part.type === "str") {
      buf += part.value;
    } else if (part.type === "num") {
      buf += String(part.value);
    } else if (part.type === "id") {
      buf += String(evalExpr(part.value, vars));
    }
  });

  if (buf !== "") {
    output.push(buf);
  }
  return true;
}

function runSimple(line, vars, output) {
  const strDecl = line.match(
    /^(?:std::)?string\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?);?\s*$/
  );
  if (strDecl) {
    vars[strDecl[1]] = evalExpr(strDecl[2].replace(/;?\s*$/, ""), vars);
    return;
  }

  const intDecl = line.match(
    /^int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?);?\s*$/
  );
  if (intDecl) {
    vars[intDecl[1]] = evalExpr(intDecl[2].replace(/;?\s*$/, ""), vars);
    return;
  }

  if (runCout(line, vars, output)) {
    return;
  }

  throw new Error(
    'Try cout << ...;, string name = value;, or a for loop. Got: ' + line
  );
}

function collectBraceBody(lines, startIndex, firstLineRest) {
  const body = [];
  let i = startIndex;
  let depth = 1;

  if (firstLineRest) {
    const rest = firstLineRest.trim();
    if (rest === "}") {
      return { body: body, nextIndex: i };
    }
    if (rest) {
      const closeIdx = rest.lastIndexOf("}");
      if (closeIdx !== -1 && rest.slice(closeIdx).trim() === "}") {
        const inner = rest.slice(0, closeIdx).trim();
        if (inner) {
          body.push(inner.replace(/;?\s*$/, "") + (inner.endsWith(";") ? "" : ""));
          const cleaned = inner.replace(/;?\s*$/, "");
          if (cleaned) {
            body.length = 0;
            body.push(cleaned.endsWith(";") ? cleaned : cleaned);
          }
        }
        return { body: body.filter(Boolean), nextIndex: i };
      }
      body.push(rest);
    }
  }

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

  return { body: body, nextIndex: i };
}

function runTinyCpp(source) {
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
      /^for\s*\(\s*int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|<)\s*(-?\d+)\s*;\s*\1\+\+\s*\)\s*\{\s*(.*)$/
    );
    if (forMatch) {
      const loopVar = forMatch[1];
      const start = Number(forMatch[2]);
      const op = forMatch[3];
      const end = Number(forMatch[4]);
      const rest = forMatch[5];
      i += 1;

      const collected = collectBraceBody(lines, i, rest);
      i = collected.nextIndex;
      const body = collected.body;

      if (body.length === 0) {
        throw new Error(
          "Your for loop needs a line inside the braces, like cout << i << endl;"
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
        "Use a C++ for loop like: for (int i = 1; i <= 3; i++) { ... }"
      );
    }

    runSimple(line, vars, output);
    i += 1;
  }

  return output.join("\n");
}

function runCode() {
  try {
    lastOutput = runTinyCpp(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone) {
      setTip("C++ got stuck. Read the red error, or tap Help.");
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
