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

const starterCode = `PRINT "Hello, reef!"
`;

const dialectTip =
  "This is reef assembly — training wheels that feel like real Assembly, " +
  "not a real CPU. Allowed lines: PRINT, MOV, ADD, REPEAT / END. ";

const tasks = [
  {
    goal: 'Task 1: Make Assembly say Hello, ocean!',
    help:
      dialectTip +
      'Find PRINT "Hello, reef!" in your code. ' +
      "Change the word reef to ocean. Keep the quotes. " +
      'It should look like PRINT "Hello, ocean!" Then press Run.',
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!";
    },
  },
  {
    goal: "Task 2: Print two lines — Hello, ocean! then I love Assembly!",
    help:
      dialectTip +
      "You need two PRINT lines, one under the other. " +
      'Line 1: PRINT "Hello, ocean!" ' +
      'Line 2: PRINT "I love Assembly!" ' +
      "Each PRINT goes on its own line. Then press Run.",
    check: function () {
      return normalizeOut(lastOutput) === "hello, ocean!\ni love assembly!";
    },
  },
  {
    goal: 'Task 3: MOV clownfish into a name, then PRINT it.',
    help:
      dialectTip +
      "A register (or name) is a tiny box that holds a value. " +
      'Type MOV fish, "clownfish" on one line (quotes around clownfish). ' +
      "On the next line type PRINT fish — no quotes around fish, " +
      "because you want the value inside the box. " +
      "You can use R1 instead of fish if you like. Then press Run.",
    check: function () {
      const code = codeBox.value;
      const hasMov = /MOV\s+(fish|R\d+)\s*,\s*["']clownfish["']/i.test(code);
      return hasMov && normalizeOut(lastOutput) === "clownfish";
    },
  },
  {
    goal: "Task 4: Use REPEAT to print 1, then 2, then 3.",
    help:
      dialectTip +
      "REPEAT runs the lines until END over and over. Type exactly:\n" +
      "MOV R1, 1\n" +
      "REPEAT 3\n" +
      "PRINT R1\n" +
      "ADD R1, 1\n" +
      "END\n" +
      "MOV puts 1 in R1. REPEAT 3 means do the middle lines 3 times. " +
      "ADD R1, 1 bumps the number up each time. Press Run.",
    check: function () {
      const code = codeBox.value.toUpperCase();
      const usedLoop = /REPEAT\s+\d+/.test(code);
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
    openCoralTrail("assembly", {
      onComplete: function () {
        if (taskIndex < tasks.length - 1) {
          taskIndex += 1;
          showTask();
        } else {
          setTip("You finished all the Assembly tasks. Awesome!");
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
    setTip("You finished all the Assembly tasks. Awesome!");
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
    if (!taskDone) {
      setTip("Assembly got stuck. Read the red error, or tap Help.");
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
