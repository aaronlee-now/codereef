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

const PATH_KEY = "cpp";
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

const starterCode = `cout << "Hello, reef!" << endl;\n`;
const projectStarter = `cout << "My reef project" << endl;\n`;

const tasks = [
  {
    goal: 'Task 1: Make C++ say Hello, ocean!',
    help:
      "Replace only the word reef with ocean; keep the rest of the line. " +
      'Find cout << "Hello, reef!" << endl; in your code. ' +
      'Change it to cout << "Hello, ocean!" << endl; — keep quotes, << arrows, and the semicolon. ' +
      "Then press Run. (#include lines are optional here.)",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love C++!",
    help:
      "Keep your old code. Add a new line under it. " +
      'Keep cout << "Hello, ocean!" << endl; on line 1. ' +
      'Under it, type cout << "I love C++!" << endl; ' +
      "endl means end the line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love c++!";
    },
  },
  {
    goal: 'Task 3: Make a variable string fish = "clownfish"; and print it.',
    help:
      "Keep your old code. Add new lines under it (old prints are OK). " +
      "A string variable remembers words. " +
      'Type string fish = "clownfish"; on one line. ' +
      "On the next line type cout << fish << endl; — no quotes around fish. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /string\s+fish\s*=\s*["']clownfish["']/.test(code);
      const lines = normalizeOut(lastOutput).split("\n");
      return hasVar && lines.indexOf("clownfish") !== -1;
    },
  },
  {
    goal: "Task 4: Use a for loop to print 1, then 2, then 3.",
    help:
      "You can delete the old code and start fresh for this task (loops are easier on a clean page). " +
      "Type exactly:\n" +
      "for (int i = 1; i <= 3; i++) {\n" +
      "  cout << i << endl;\n" +
      "}\n" +
      "Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s*\(\s*int\s+\w+/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "1\n2\n3";
    },
  },
  {
    goal: "Task 5: Print the number 5 with cout.",
    help:
      "You can delete the old code and start fresh for this task. " +
      "Type: cout << 5 << endl; " +
      "That prints the number five (no quotes around 5). Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "5";
    },
  },
  {
    goal: 'Task 6: Make string coral = "reef"; and print it.',
    help:
      "Keep your old code or start fresh — either is OK. " +
      'Type string coral = "reef"; then cout << coral << endl; ' +
      "No quotes around coral when you print it. Then press Run.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const hasVar = /string\s+coral\s*=\s*["']reef["']/.test(code);
      return hasVar && normalizeOut(lastOutput).split("\n").indexOf("reef") !== -1;
    },
  },
  {
    goal: "Task 7: Loop to print splash three times.",
    help:
      "You can delete the old code and start fresh for this task. " +
      "Type:\n" +
      "for (int i = 1; i <= 3; i++) {\n" +
      '  cout << "splash" << endl;\n' +
      "}\n" +
      "Then press Run. You should see splash three times.",
    check: function () {
      const code = codeBox.value.toLowerCase();
      const usedLoop = /for\s*\(\s*int\s+\w+/.test(code);
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
        help: 'You can delete the old code and start fresh for this project. Type cout << "Ocean Story" << endl; Then press Run.',
        check: function (ctx) {
          return /cout\s*<</.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 2: Add a second story line.",
        help: "Keep your old code. Add another cout line under it. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
      {
        goal: "Project step 3: Add a third story line.",
        help: "Keep your old code. Add one more cout line for the ending. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
    ],
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Store a fish name in a String and print it.",
    plan: ["Make a name variable.", "Print the name.", "Print a hello line."],
    steps: [
      {
        goal: "Project step 1: Make a name variable.",
        help: 'You can delete the old code and start fresh for this project. Type String name = "Bubbles"; Then press Run.',
        check: function (ctx) {
          return /string\s+\w+\s*=\s*["']/i.test(ctx.code);
        },
      },
      {
        goal: "Project step 2: Print the name.",
        help: "Keep your old code. Add cout << name << endl; Then press Run.",
        check: function (ctx) {
          return /cout\s*<<\s*\w+/.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 3: Print a hello line.",
        help: 'Keep your old code. Add cout << "Hello!" << endl; Then press Run.',
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
        help: 'You can delete the old code and start fresh for this project. Type cout << "What color is the ocean?" << endl; Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 2: Make an answer variable.",
        help: 'Keep your old code. Add String answer = "blue"; Then press Run.',
        check: function (ctx) {
          return /string\s+\w+\s*=/i.test(ctx.code);
        },
      },
      {
        goal: "Project step 3: Print the answer.",
        help: "Keep your old code. Add cout << answer << endl; Then press Run.",
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
        help: 'You can delete the old code and start fresh for this advanced project. Type cout << "Ocean Adventure" << endl; Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Make a hero variable and print it.",
        help: 'Keep your old code. Add string hero = "Fin"; and cout << hero << endl; Then press Run.',
        check: function (ctx) {
          return /string\s+\w+\s*=/i.test(ctx.code) && /cout\s*<<\s*\w+/.test(ctx.code);
        },
      },
      {
        goal: "Advanced step 3: Loop to print 1, 2, 3.",
        help: "Keep your title if you want. Add a for loop that prints 1, 2, 3. Then press Run.",
        check: function (ctx) {
          const lines = normalizeOut(ctx.output).split("\n" << endl;
          return /for\s*\(\s*int/.test(ctx.code.toLowerCase()) && lines.indexOf("1") !== -1 && lines.indexOf("3") !== -1;
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
        help: 'You can delete the old code and start fresh for this advanced project. Type cout << "How many legs?" << endl; Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Make answer and score variables.",
        help: 'Keep your old code. Add String answer = "8"; and String score = "10"; Then press Run.',
        check: function (ctx) {
          return (ctx.code.match(/string\s+\w+\s*=/gi) || []).length >= 2;
        },
      },
      {
        goal: "Advanced step 3: Print answer and score.",
        help: "Keep your old code. Use cout to print both variables. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "List sea creatures with println.",
    plan: ["Print a title.", "Print two creatures.", "Print one more."],
    steps: [
      {
        goal: "Advanced step 1: Print a catalog title.",
        help: 'You can delete the old code and start fresh for this advanced project. Type cout << "Sea Creatures" << endl; Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: Print two creature names.",
        help: "Keep your old code. Add two more cout lines. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
      {
        goal: "Advanced step 3: Print one more creature.",
        help: "Keep your old code. Add another cout line. Then press Run.",
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
  pathKey: "cpp",
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

function ensureStarterCode() {
  if (!String(codeBox.value || "").trim()) {
    codeBox.value = starterCode;
  }
}

function showTask() {
  taskDone = false;
  taskBar.classList.remove("is-done", "is-help", "is-project", "is-advanced");
  showNextButton(false);
  nextBtn.textContent = "Next task";
  ensureStarterCode();
  const task = tasks[taskIndex];
  taskGoal.textContent = task && task.goal ? task.goal : "Task " + (taskIndex + 1);
  setTip(
    task && task.help
      ? "Do the task, then press Run. Tap Help if you get stuck."
      : "Do the task, then press Run."
  );
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
    openCoralTrail("cpp", {
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
  const rest = (firstLineRest || "").trim();

  if (rest === "}") {
    return { body: body, nextIndex: i };
  }

  if (rest) {
    const closeIdx = rest.lastIndexOf("}");
    if (closeIdx !== -1 && rest.slice(closeIdx).trim() === "}") {
      const inner = rest.slice(0, closeIdx).trim();
      if (inner) {
        body.push(inner);
      }
      return { body: body, nextIndex: i };
    }
    body.push(rest);
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
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("C++ got stuck. Read the red error, or tap Help.");
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
  ensureStarterCode();

  if (projectApi && typeof projectApi.resumeIfNeeded === "function" && projectApi.resumeIfNeeded()) {
    return;
  }

  showTask();
  if (saved && saved.taskDone) {
    restoreDoneWaitingForNext();
  }
})();
