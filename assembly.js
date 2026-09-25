if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("asm-code");
const outputBox = document.getElementById("asm-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "assembly";
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

const starterCode = `PRINT "Hello, reef!"\n`;
const projectStarter = `PRINT "My reef project"\n`;

const dialectTip =
  "This is reef assembly — training wheels that feel like real Assembly, " +
  "not a real CPU. Allowed lines: PRINT, MOV, ADD, REPEAT / END. ";

const tasks = [
  {
    goal: 'Task 1: Make Assembly say Hello, ocean!',
    help:
      dialectTip +
      "Replace only the word reef with ocean; keep the rest of the line. " +
      'Find PRINT "Hello, reef!" in your code. ' +
      'Change it to PRINT "Hello, ocean!" — keep the quotes. Then press Run.',
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love Assembly!",
    help:
      dialectTip +
      "Keep your old code. Add a new line under it. " +
      'Keep PRINT "Hello, ocean!" on line 1. ' +
      'Under it, type PRINT "I love Assembly!" Then press Run.',
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love assembly!";
    },
  },
  {
    goal: 'Task 3: MOV clownfish into a name, then PRINT it.',
    help:
      dialectTip +
      "Keep your old code. Add new lines under it (old PRINT lines are OK). " +
      'Type MOV fish, "clownfish" on one line. ' +
      "On the next line type PRINT fish — no quotes around fish. Then press Run.",
    check: function () {
      const code = codeBox.value;
      const hasMov = /MOV\s+(fish|R\d+)\s*,\s*["']clownfish["']/i.test(code);
      const lines = normalizeOut(lastOutput).split("\n");
      return hasMov && lines.indexOf("clownfish") !== -1;
    },
  },
  {
    goal: "Task 4: Use REPEAT to print 1, then 2, then 3.",
    help:
      dialectTip +
      "You can delete the old code and start fresh for this task. Type exactly:\n" +
      "MOV R1, 1\n" +
      "REPEAT 3\n" +
      "PRINT R1\n" +
      "ADD R1, 1\n" +
      "END\n" +
      "Then press Run.",
    check: function () {
      const code = codeBox.value.toUpperCase();
      const usedLoop = /REPEAT\s+\d+/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "1\n2\n3";
    },
  },
  {
    goal: "Task 5: PRINT the number 5.",
    help:
      dialectTip +
      "You can delete the old code and start fresh for this task. " +
      "Type: MOV R1, 5 then PRINT R1 — or PRINT 5 if your Help shows that. " +
      "Easiest: MOV R1, 5 then PRINT R1. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "5";
    },
  },
  {
    goal: 'Task 6: MOV coral to "reef", then PRINT it.',
    help:
      dialectTip +
      "Keep your old code or start fresh — either is OK. " +
      'Type MOV coral, "reef" then PRINT coral. Then press Run.',
    check: function () {
      const code = codeBox.value;
      const hasMov = /MOV\s+coral\s*,\s*["']reef["']/i.test(code);
      return hasMov && normalizeOut(lastOutput).split("\n").indexOf("reef") !== -1;
    },
  },
  {
    goal: "Task 7: REPEAT to PRINT splash three times.",
    help:
      dialectTip +
      "You can delete the old code and start fresh for this task. Type:\n" +
      "REPEAT 3\n" +
      'PRINT "splash"\n' +
      "END\n" +
      "Then press Run.",
    check: function () {
      const code = codeBox.value.toUpperCase();
      const usedLoop = /REPEAT\s+\d+/.test(code);
      return usedLoop && normalizeOut(lastOutput) === "splash\nsplash\nsplash";
    },
  },
];

const finalIdeas = [
  {
    id: "story",
    title: "Story printer",
    blurb: "PRINT a tiny ocean story, one line at a time.",
    plan: ["PRINT a story title.", "Add a second PRINT.", "Add a third ending PRINT."],
    steps: [
      {
        goal: "Project step 1: PRINT a story title.",
        help: 'You can delete the old code and start fresh for this project. Type PRINT "Ocean Story" Then press Run.',
        check: function (ctx) {
          return /PRINT/i.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 2: Add a second story line.",
        help: "Keep your old code. Add another PRINT under it. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
      {
        goal: "Project step 3: Add a third story line.",
        help: "Keep your old code. Add one more PRINT for the ending. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
    ],
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "MOV a fish name, then PRINT it.",
    plan: ["MOV a name.", "PRINT the name.", "PRINT a hello line."],
    steps: [
      {
        goal: "Project step 1: MOV a name.",
        help: 'You can delete the old code and start fresh for this project. Type MOV name, "Bubbles" Then press Run.',
        check: function (ctx) {
          return /MOV\s+\w+\s*,\s*["']/i.test(ctx.code);
        },
      },
      {
        goal: "Project step 2: PRINT the name.",
        help: "Keep your old code. Add PRINT name Then press Run.",
        check: function (ctx) {
          return /PRINT\s+\w+/i.test(ctx.code) && normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 3: PRINT a hello line.",
        help: 'Keep your old code. Add PRINT "Hello!" Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question and PRINT an answer.",
    plan: ["PRINT a question.", "MOV an answer.", "PRINT the answer."],
    steps: [
      {
        goal: "Project step 1: PRINT a question.",
        help: 'You can delete the old code and start fresh for this project. Type PRINT "What color is the ocean?" Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Project step 2: MOV an answer.",
        help: 'Keep your old code. Add MOV answer, "blue" Then press Run.',
        check: function (ctx) {
          return /MOV\s+\w+\s*,/i.test(ctx.code);
        },
      },
      {
        goal: "Project step 3: PRINT the answer.",
        help: "Keep your old code. Add PRINT answer Then press Run.",
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
    blurb: "Title, MOV hero, and REPEAT counting.",
    plan: ["PRINT a title.", "MOV a hero and PRINT it.", "REPEAT to print 1, 2, 3."],
    steps: [
      {
        goal: "Advanced step 1: PRINT an adventure title.",
        help: 'You can delete the old code and start fresh for this advanced project. Type PRINT "Ocean Adventure" Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: MOV a hero and PRINT it.",
        help: 'Keep your old code. Add MOV hero, "Fin" and PRINT hero Then press Run.',
        check: function (ctx) {
          return /MOV\s+\w+\s*,/i.test(ctx.code) && /PRINT\s+\w+/i.test(ctx.code);
        },
      },
      {
        goal: "Advanced step 3: REPEAT to print 1, 2, 3.",
        help: "Keep your title if you want. Use MOV/REPEAT/ADD/END to print 1, 2, 3. Then press Run.",
        check: function (ctx) {
          const lines = normalizeOut(ctx.output).split("\n");
          return /REPEAT\s+\d+/i.test(ctx.code) && lines.indexOf("1") !== -1 && lines.indexOf("3") !== -1;
        },
      },
    ],
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "Question, answer, and score.",
    plan: ["PRINT a question.", "MOV answer and score.", "PRINT both."],
    steps: [
      {
        goal: "Advanced step 1: PRINT a quiz question.",
        help: 'You can delete the old code and start fresh for this advanced project. Type PRINT "How many legs?" Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: MOV answer and score.",
        help: 'Keep your old code. Add MOV answer, "8" and MOV score, "10" Then press Run.',
        check: function (ctx) {
          return (ctx.code.match(/MOV\s+/gi) || []).length >= 2;
        },
      },
      {
        goal: "Advanced step 3: PRINT answer and score.",
        help: "Keep your old code. Add PRINT answer and PRINT score Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 2;
        },
      },
    ],
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "List sea creatures with PRINT.",
    plan: ["PRINT a title.", "PRINT two creatures.", "PRINT one more."],
    steps: [
      {
        goal: "Advanced step 1: PRINT a catalog title.",
        help: 'You can delete the old code and start fresh for this advanced project. Type PRINT "Sea Creatures" Then press Run.',
        check: function (ctx) {
          return normalizeOut(ctx.output).length > 0;
        },
      },
      {
        goal: "Advanced step 2: PRINT two creature names.",
        help: "Keep your old code. Add two more PRINT lines. Then press Run.",
        check: function (ctx) {
          return normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3;
        },
      },
      {
        goal: "Advanced step 3: PRINT one more creature.",
        help: "Keep your old code. Add another PRINT. Then press Run.",
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
  pathKey: "assembly",
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
    openCoralTrail("assembly", {
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
    } else if (ch === ";") {
      return line.slice(0, c);
    }
  }
  return line;
}

function isName(token) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(token);
}

function parseValue(token, regs) {
  token = String(token || "").trim();
  if (!token) {
    throw new Error("Missing a value after the comma or after PRINT.");
  }

  const strMatch = token.match(/^(["'])([\s\S]*)\1$/);
  if (strMatch) {
    return strMatch[2];
  }

  if (/^-?\d+$/.test(token)) {
    return Number(token);
  }

  if (isName(token)) {
    const key = token.toUpperCase();
    if (!(key in regs)) {
      throw new Error(
        token + " is empty. Use MOV " + token + ", value first."
      );
    }
    return regs[key];
  }

  throw new Error('I need a number, a name like R1, or "text in quotes". Got: ' + token);
}

function splitOperand(rest) {
  rest = rest.trim();
  const strMatch = rest.match(/^(["'])([\s\S]*)\1$/);
  if (strMatch) {
    return rest;
  }
  return rest;
}

function runSimple(line, regs, output) {
  const printMatch = line.match(/^PRINT\s+(.+)$/i);
  if (printMatch) {
    const value = parseValue(splitOperand(printMatch[1]), regs);
    output.push(String(value));
    return;
  }

  const movMatch = line.match(/^MOV\s+([A-Za-z_][A-Za-z0-9_]*)\s*,\s*(.+)$/i);
  if (movMatch) {
    const dest = movMatch[1].toUpperCase();
    regs[dest] = parseValue(movMatch[2].trim(), regs);
    return;
  }

  const addMatch = line.match(/^ADD\s+([A-Za-z_][A-Za-z0-9_]*)\s*,\s*(.+)$/i);
  if (addMatch) {
    const dest = addMatch[1].toUpperCase();
    if (!(dest in regs)) {
      throw new Error(addMatch[1] + " is empty. MOV a number into it first.");
    }
    const left = regs[dest];
    const right = parseValue(addMatch[2].trim(), regs);
    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error("ADD only works with numbers.");
    }
    regs[dest] = left + right;
    return;
  }

  throw new Error(
    'Try PRINT, MOV name, value, or ADD name, number. Got: ' + line
  );
}

function runTinyAsm(source) {
  const lines = String(source || "").replace(/\r/g, "").split("\n");
  const regs = Object.create(null);
  const output = [];
  let i = 0;
  let repeatDepth = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const noComment = stripComment(raw);
    const line = noComment.trim();

    if (!line) {
      i += 1;
      continue;
    }

    const repeatMatch = line.match(/^REPEAT\s+(-?\d+)\s*$/i);
    if (repeatMatch) {
      const times = Number(repeatMatch[1]);
      if (times < 0 || times > 20) {
        throw new Error("REPEAT needs a number from 0 to 20.");
      }
      if (repeatDepth > 0) {
        throw new Error("Nesting REPEAT inside REPEAT is too fancy for reef assembly.");
      }

      i += 1;
      const body = [];
      let foundEnd = false;
      while (i < lines.length) {
        const bodyRaw = lines[i];
        const bodyNoComment = stripComment(bodyRaw);
        const bodyLine = bodyNoComment.trim();
        i += 1;

        if (!bodyLine) {
          continue;
        }

        if (/^END\s*$/i.test(bodyLine)) {
          foundEnd = true;
          break;
        }

        if (/^REPEAT\s+/i.test(bodyLine)) {
          throw new Error("Nesting REPEAT inside REPEAT is too fancy for reef assembly.");
        }

        body.push(bodyLine);
      }

      if (!foundEnd) {
        throw new Error("Your REPEAT needs an END line when it is finished.");
      }

      if (body.length === 0) {
        throw new Error("Your REPEAT needs lines before END, like PRINT R1.");
      }

      repeatDepth += 1;
      for (let n = 0; n < times; n += 1) {
        body.forEach(function (bodyLine) {
          runSimple(bodyLine, regs, output);
        });
      }
      repeatDepth -= 1;
      continue;
    }

    if (/^END\s*$/i.test(line)) {
      throw new Error("END only belongs after a REPEAT.");
    }

    runSimple(line, regs, output);
    i += 1;
  }

  return output.join("\n");
}

function runCode() {
  try {
    lastOutput = runTinyAsm(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("Assembly got stuck. Read the red error, or tap Help.");
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
