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

const starterCode = `print("Hello, puddle!")
`;

const projectStarter = `print("Tide pool project")
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

if (typeof CodeReefProgress !== "undefined" && CodeReefProgress.registerSnapshot) {
  CodeReefProgress.registerSnapshot(function () {
    return { path: PATH_KEY, data: snapshotProgress() };
  });
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

function numbered(lines) {
  const parts = [];
  for (let n = 0; n < lines.length; n += 1) {
    parts.push(n + 1 + ". " + lines[n]);
  }
  return parts.join("\n\n");
}

function L(text, indent) {
  return { text: text, indent: !!indent };
}

function codeFrom(lines) {
  return (
    lines
      .map(function (line) {
        return (line.indent ? "    " : "") + line.text;
      })
      .join("\n") + "\n"
  );
}

function explainPyLine(line) {
  const t = String(line || "").trim();
  const quote = 'A quote is this mark: "';
  let m = t.match(/^print\("([^"]*)"\)$/);
  if (m) {
    return [
      'Type this exactly: print("' + m[1] + '")',
      "print means show these words on the screen.",
      "Type the word print.",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\("([^"]*)"\s*\+\s*([A-Za-z_][A-Za-z0-9_]*)\)$/);
  if (m) {
    return [
      'Type this exactly: print("' + m[1] + '" + ' + m[2] + ")",
      "print means show words on the screen.",
      "A plus sign + sticks words together.",
      "Type the word print.",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type a space, then +, then a space.",
      "Then type " + m[2] + " with no quotes.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\[(\d+)\]\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + "[" + m[2] + "])",
      "print means show this on the screen.",
      "[" + m[2] + "] means spot " + m[2] + " in the list.",
      "Lists start at 0. So 0 is the first word.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: [",
      "Then type " + m[2],
      "Then type this mark: ]",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + ")",
      "print means show what " + m[1] + " remembers.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1] + " with no quotes.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\s*\+\s*(\d+)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + " + " + m[2] + ")",
      "print means show the answer on the screen.",
      "Plus + adds numbers.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then +, then a space.",
      "Then type " + m[2],
      "Then type this mark: )",
      "Do not put quotes around the number.",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\s*-\s*(\d+)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + " - " + m[2] + ")",
      "print means show the answer on the screen.",
      "Minus - takes away.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then -, then a space.",
      "Then type " + m[2],
      "Then type this mark: )",
      "Do not put quotes around the number.",
    ];
  }
  m = t.match(/^print\((\d+)\s*([+\-*])\s*(\d+)\)$/);
  if (m) {
    const word = m[2] === "+" ? "Plus + adds." : m[2] === "-" ? "Minus - takes away." : "The star * means times.";
    return [
      "Type this exactly: print(" + m[1] + " " + m[2] + " " + m[3] + ")",
      "print means show the answer on the screen.",
      word,
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then " + m[2] + ", then a space.",
      "Then type " + m[3],
      "Then type this mark: )",
      "Do not put quotes around the numbers.",
    ];
  }
  m = t.match(/^print\((.+)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + ")",
      "print means show this on the screen.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: )",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\[.*\])$/);
  if (m) {
    return [
      "Type this exactly: " + m[1] + " = " + m[2],
      "A list is a box that holds words.",
      "Type " + m[1],
      "Then type a space, then =, then a space.",
      "= means remember this.",
      "Then type " + m[2],
      "The [ starts the list. The ] ends the list.",
      quote,
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)"$/);
  if (m) {
    return [
      'Type this exactly: ' + m[1] + ' = "' + m[2] + '"',
      "A variable is a name that remembers a word.",
      "Type " + m[1],
      "Then type a space, then =, then a space.",
      "= means remember this.",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+)$/);
  if (m) {
    return [
      "Type this exactly: " + m[1] + " = " + m[2],
      "A variable is a name that remembers a number.",
      "Type " + m[1],
      "Then type a space, then =, then a space.",
      "Then type " + m[2],
      "Do not put quotes around a number.",
    ];
  }
  m = t.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+range\(([^)]+)\):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means do the next lines again and again.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type a space, then " + m[1] + ", then a space.",
      "Then type the word in, then a space.",
      "Then type range.",
      "Then type this mark: (",
      "Then type " + m[2],
      "Then type this mark: )",
      "Then type a colon. A colon is this mark: :",
      "The colon means the next line belongs inside.",
    ];
  }
  m = t.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+([A-Za-z_][A-Za-z0-9_]*):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means walk through the list, one word at a time.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type a space, then " + m[1] + ", then a space.",
      "Then type the word in, then a space.",
      "Then type " + m[2],
      "Then type a colon. A colon is this mark: :",
    ];
  }
  m = t.match(/^if\s+(.+):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "if means pick a path. Do this only when it is true.",
      "Type the word if.",
      "Then type a space.",
      "Then type " + m[1],
      "Then type a colon. A colon is this mark: :",
      "The next line belongs inside this if.",
    ];
  }
  if (t === "else:") {
    return [
      "Type this exactly: else:",
      "else means the other path.",
      "Type the word else.",
      "Then type a colon. A colon is this mark: :",
    ];
  }
  m = t.match(/^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "def makes a function. A function is a recipe you can run later.",
      "Type the word def.",
      "Then type a space, then " + m[1],
      "Then type this mark: (",
      "Then type " + (m[2] || "nothing"),
      "Then type this mark: )",
      "Then type a colon. A colon is this mark: :",
      "The next line belongs inside the recipe.",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\("([^"]*)"\)$/);
  if (m) {
    return [
      'Type this exactly: ' + m[1] + '("' + m[2] + '")',
      "This runs the recipe named " + m[1] + ".",
      "Type " + m[1],
      "Then type this mark: (",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\(\)$/);
  if (m) {
    return [
      "Type this exactly: " + m[1] + "()",
      "This runs the recipe named " + m[1] + ".",
      "Type " + m[1],
      "Then type this mark: (",
      "Then type this mark: )",
    ];
  }
  return ["Type this exactly: " + t];
}

function pushBits(steps, bits) {
  if (!bits) {
    return;
  }
  if (Array.isArray(bits)) {
    for (let i = 0; i < bits.length; i += 1) {
      if (bits[i]) {
        steps.push(bits[i]);
      }
    }
    return;
  }
  steps.push(bits);
}

function helpForLines(fresh, lines, see, note) {
  const steps = [];
  if (fresh) {
    steps.push("Start fresh. That means erase the old code.");
    steps.push("Click in the code box.");
    steps.push("Highlight all the old code.");
    steps.push("Press the Delete key.");
    steps.push("The code box should be empty.");
    steps.push("Click in the empty code box.");
  } else {
    steps.push("Keep your old code. Do not erase it.");
    steps.push("Click in the code box.");
    steps.push("Click at the end of the last line.");
  }
  if (note) {
    const bits = String(note).split(/(?<=[.!])\s+/);
    for (let n = 0; n < bits.length; n += 1) {
      const bit = bits[n].trim();
      if (bit) {
        steps.push(bit);
      }
    }
  }
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if ((!fresh && i === 0) || i > 0) {
      steps.push("Press the Enter key. That starts a new line.");
    }
    if (line.indent) {
      steps.push("Press the space bar 4 times.");
      steps.push("This line sits inside the line above.");
    } else if (i > 0 && lines[i - 1].indent) {
      steps.push("Press Backspace until this line starts at the left edge.");
    }
    pushBits(steps, explainPyLine(line.text));
  }
  steps.push("Press the Run button. It is at the top.");
  if (see) {
    steps.push("You should see " + see + ".");
    steps.push("Old lines can stay. That is OK.");
  }
  return numbered(steps);
}

function specOk(spec, code, output) {
  if (spec.contains) {
    const bits = Array.isArray(spec.contains) ? spec.contains : [spec.contains];
    for (let b = 0; b < bits.length; b += 1) {
      if (output.indexOf(String(bits[b]).toLowerCase()) === -1) {
        return false;
      }
    }
  }
  if (spec.line) {
    const lines = output.split("\n");
    const bits = Array.isArray(spec.line) ? spec.line : [spec.line];
    for (let b = 0; b < bits.length; b += 1) {
      if (lines.indexOf(String(bits[b]).toLowerCase()) === -1) {
        return false;
      }
    }
  }
  if (spec.minCount) {
    const want = String(spec.minCount.line).toLowerCase();
    const n = output.split("\n").filter(function (item) {
      return item === want;
    }).length;
    if (n < spec.minCount.n) {
      return false;
    }
  }
  if (spec.code && !spec.code.test(code)) {
    return false;
  }
  if (spec.minLines && output.split("\n").filter(Boolean).length < spec.minLines) {
    return false;
  }
  return true;
}

function skillOk(spec) {
  return function () {
    return specOk(spec, codeBox.value, normalizeOut(lastOutput));
  };
}

function stepCheck(spec) {
  return function (ctx) {
    return specOk(spec, ctx.code || "", normalizeOut(ctx.output || ""));
  };
}

const tasks = (function buildPythonTasks() {
  const list = [];
  function add(goal, fresh, lines, spec, see, sample, note) {
    list.push({
      goal: "Task " + (list.length + 1) + ": " + goal,
      help: helpForLines(fresh, lines, see, note),
      check: skillOk(spec),
      sample: sample || codeFrom(lines),
      fresh: fresh,
      lines: lines,
    });
  }

  add("Change puddle to pool.", false, [L("print(\"Hello, pool!\")")], { contains: "hello, pool!" }, "Hello, pool!", "print(\"Hello, pool!\")\n");
  list[0].help = numbered(["Keep your old code. Do not erase the whole line.","Click in the code box.","Click on the word puddle.","Delete those letters.","Type the new word in that same spot.","The line should look like this: print(\"Hello, pool!\")","print means show these words on the screen.","A quote is this mark: \"","The words Hello, pool! stay between the quotes.","Press the Run button. It is at the top.","You should see Hello, pool!"]);
  add("Print anemone.", false, [L("print(\"anemone\")")], { contains: "anemone" }, "anemone");
  add("Print hermit.", false, [L("print(\"hermit\")")], { contains: "hermit" }, "hermit");
  add("Print limpet.", false, [L("print(\"limpet\")")], { contains: "limpet" }, "limpet");
  add("Print barnacle.", false, [L("print(\"barnacle\")")], { contains: "barnacle" }, "barnacle");
  add("Print the number 2.", true, [L("print(2)")], { line: "2" }, "2");
  add("Print the number 4.", true, [L("print(4)")], { line: "4" }, "4");
  add("Print the number 8.", true, [L("print(8)")], { line: "8" }, "8");
  add("Print two lines about the pool.", true, [L("print(\"Pip sat still.\")"), L("print(\"A snail slid by.\")")], { contains: ["pip sat still.","a snail slid by."] }, "A snail slid by.");
  add("Print two lines about the pool.", true, [L("print(\"The pool is warm.\")"), L("print(\"Moss likes shade.\")")], { contains: ["the pool is warm.","moss likes shade."] }, "Moss likes shade.");
  add("Print two lines about the pool.", true, [L("print(\"Barnacles hold on.\")"), L("print(\"The tide returns.\")")], { contains: ["barnacles hold on.","the tide returns."] }, "The tide returns.");
  add("Remember Pip in pet.", true, [L("pet = \"Pip\""), L("print(pet)")], { line: "pip", code: /pet\s*:?=\s*["']Pip["']/ }, "Pip");
  add("Remember Moss in pal.", true, [L("pal = \"Moss\""), L("print(pal)")], { line: "moss", code: /pal\s*:?=\s*["']Moss["']/ }, "Moss");
  add("Remember Pebble in rock.", true, [L("rock = \"Pebble\""), L("print(rock)")], { line: "pebble", code: /rock\s*:?=\s*["']Pebble["']/ }, "Pebble");
  add("Remember Barni in buddy.", true, [L("buddy = \"Barni\""), L("print(buddy)")], { line: "barni", code: /buddy\s*:?=\s*["']Barni["']/ }, "Barni");
  add("Remember Snail in snail.", true, [L("snail = \"Snail\""), L("print(snail)")], { line: "snail", code: /snail\s*:?=\s*["']Snail["']/ }, "Snail");
  add("Remember Limpet in home.", true, [L("home = \"Limpet\""), L("print(home)")], { line: "limpet", code: /home\s*:?=\s*["']Limpet["']/ }, "Limpet");
  add("Remember the number 3 in shells.", true, [L("shells = 3"), L("print(shells)")], { line: "3", code: /shells\s*:?=\s*3\b/ }, "3");
  add("Remember the number 2 in crabs.", true, [L("crabs = 2"), L("print(crabs)")], { line: "2", code: /crabs\s*:?=\s*2\b/ }, "2");
  add("Remember the number 5 in steps.", true, [L("steps = 5"), L("print(steps)")], { line: "5", code: /steps\s*:?=\s*5\b/ }, "5");
  add("Remember the number 4 in drops.", true, [L("drops = 4"), L("print(drops)")], { line: "4", code: /drops\s*:?=\s*4\b/ }, "4");
  add("Say Hi to Pip.", true, [L("who = \"Pip\""), L("print(\"Hi \" + who)")], { contains: "hi pip" }, "Hi Pip");
  add("Say Hey to Moss.", true, [L("who = \"Moss\""), L("print(\"Hey \" + who)")], { contains: "hey moss" }, "Hey Moss");
  add("Say Hello to Pebble.", true, [L("who = \"Pebble\""), L("print(\"Hello \" + who)")], { contains: "hello pebble" }, "Hello Pebble");
  add("Say Yo to Barni.", true, [L("who = \"Barni\""), L("print(\"Yo \" + who)")], { contains: "yo barni" }, "Yo Barni");
  add("Say Hiya to Snail.", true, [L("who = \"Snail\""), L("print(\"Hiya \" + who)")], { contains: "hiya snail" }, "Hiya Snail");
  add("Print the answer to 1 + 1.", true, [L("print(1 + 1)")], { line: "2", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "2");
  add("Print the answer to 2 + 2.", true, [L("print(2 + 2)")], { line: "4", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "4");
  add("Print the answer to 5 - 1.", true, [L("print(5 - 1)")], { line: "4", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "4");
  add("Print the answer to 3 * 2.", true, [L("print(3 * 2)")], { line: "6", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "6");
  add("Print the answer to 8 - 3.", true, [L("print(8 - 3)")], { line: "5", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "5");
  add("Print the answer to 4 + 4.", true, [L("print(4 + 4)")], { line: "8", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "8");
  add("Start shells at 3, then print shells + 1.", true, [L("shells = 3"), L("print(shells + 1)")], { line: "4", code: /shells\s*\+\s*1/ }, "4");
  add("Start crabs at 2, then print crabs + 2.", true, [L("crabs = 2"), L("print(crabs + 2)")], { line: "4", code: /crabs\s*\+\s*2/ }, "4");
  add("Start steps at 5, then print steps - 1.", true, [L("steps = 5"), L("print(steps - 1)")], { line: "4", code: /steps\s*\-\s*1/ }, "4");
  add("Start drops at 4, then print drops * 2.", true, [L("drops = 4"), L("print(drops * 2)")], { line: "8", code: /drops\s*\*\s*2/ }, "8");
  add("Start shells at 6, then print shells - 2.", true, [L("shells = 6"), L("print(shells - 2)")], { line: "4", code: /shells\s*\-\s*2/ }, "4");
  add("Remember Pip and Moss.", true, [L("one = \"Pip\""), L("two = \"Moss\""), L("print(one)"), L("print(two)")], { line: ["pip","moss"] }, "Pip and Moss");
  add("Remember Pebble and Barni.", true, [L("left = \"Pebble\""), L("right = \"Barni\""), L("print(left)"), L("print(right)")], { line: ["pebble","barni"] }, "Pebble and Barni");
  add("Remember Snail and Limpet.", true, [L("a = \"Snail\""), L("b = \"Limpet\""), L("print(a)"), L("print(b)")], { line: ["snail","limpet"] }, "Snail and Limpet");
  add("Remember Anemone and Urchin.", true, [L("top = \"Anemone\""), L("low = \"Urchin\""), L("print(top)"), L("print(low)")], { line: ["anemone","urchin"] }, "Anemone and Urchin");
  add("If the number is > 4, print deep.", true, [L("score = 9"), L("if score > 4:"), L("print(\"deep\")", true)], { line: "deep", code: /\bif\b/ }, "deep");
  add("If the number is > 2, print warm.", true, [L("score = 6"), L("if score > 2:"), L("print(\"warm\")", true)], { line: "warm", code: /\bif\b/ }, "warm");
  add("If the number is < 3, print tiny.", true, [L("score = 1"), L("if score < 3:"), L("print(\"tiny\")", true)], { line: "tiny", code: /\bif\b/ }, "tiny");
  add("If the number is > 7, print full.", true, [L("score = 8"), L("if score > 7:"), L("print(\"full\")", true)], { line: "full", code: /\bif\b/ }, "full");
  add("If the number is < 9, print low.", true, [L("score = 3"), L("if score < 9:"), L("print(\"low\")", true)], { line: "low", code: /\bif\b/ }, "low");
  add("If the number is > 1, print high.", true, [L("score = 10"), L("if score > 1:"), L("print(\"high\")", true)], { line: "high", code: /\bif\b/ }, "high");
  add("Use if and else so you print shallow.", true, [L("score = 1"), L("if score > 5:"), L("print(\"deep\")", true), L("else:"), L("print(\"shallow\")", true)], { line: "shallow", code: /\bif\b[\s\S]*\belse\b/ }, "shallow");
  add("Use if and else so you print splashy.", true, [L("score = 8"), L("if score > 3:"), L("print(\"splashy\")", true), L("else:"), L("print(\"calm\")", true)], { line: "splashy", code: /\bif\b[\s\S]*\belse\b/ }, "splashy");
  add("Use if and else so you print over.", true, [L("score = 2"), L("if score < 2:"), L("print(\"under\")", true), L("else:"), L("print(\"over\")", true)], { line: "over", code: /\bif\b[\s\S]*\belse\b/ }, "over");
  add("Use if and else so you print little.", true, [L("score = 4"), L("if score < 6:"), L("print(\"little\")", true), L("else:"), L("print(\"big\")", true)], { line: "little", code: /\bif\b[\s\S]*\belse\b/ }, "little");
  add("Use if and else so you print nope.", true, [L("score = 0"), L("if score > 0:"), L("print(\"yes\")", true), L("else:"), L("print(\"nope\")", true)], { line: "nope", code: /\bif\b[\s\S]*\belse\b/ }, "nope");
  add("Use if and else so you print notyet.", true, [L("score = 7"), L("if score > 7:"), L("print(\"same\")", true), L("else:"), L("print(\"notyet\")", true)], { line: "notyet", code: /\bif\b[\s\S]*\belse\b/ }, "notyet");
  add("Use if and else so you print ok.", true, [L("score = 5"), L("if score < 8:"), L("print(\"ok\")", true), L("else:"), L("print(\"no\")", true)], { line: "ok", code: /\bif\b[\s\S]*\belse\b/ }, "ok");
  add("Use if and else so you print swim.", true, [L("score = 3"), L("if score > 1:"), L("print(\"swim\")", true), L("else:"), L("print(\"rest\")", true)], { line: "swim", code: /\bif\b[\s\S]*\belse\b/ }, "swim");
  add("Use a loop to print drip 2 times.", true, [L("for i in range(2):"), L("print(\"drip\")", true)], { minCount: { line: "drip", n: 2 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "drip 2 times");
  add("Use a loop to print drip 3 times.", true, [L("for i in range(3):"), L("print(\"drip\")", true)], { minCount: { line: "drip", n: 3 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "drip 3 times");
  add("Use a loop to print bubble 2 times.", true, [L("for i in range(2):"), L("print(\"bubble\")", true)], { minCount: { line: "bubble", n: 2 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "bubble 2 times");
  add("Use a loop to print peek 3 times.", true, [L("for i in range(3):"), L("print(\"peek\")", true)], { minCount: { line: "peek", n: 3 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "peek 3 times");
  add("Use a loop to print tide 2 times.", true, [L("for i in range(2):"), L("print(\"tide\")", true)], { minCount: { line: "tide", n: 2 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "tide 2 times");
  add("Use a loop to print pool 4 times.", true, [L("for i in range(4):"), L("print(\"pool\")", true)], { minCount: { line: "pool", n: 4 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "pool 4 times");
  add("Use a loop to print 1, then 2.", true, [L("for i in range(1, 3):"), L("print(i)", true)], { line: ["1","2"], code: /for\s+\w+\s+in\s+range\s*\(/ }, "1 then 2");
  add("Use a loop to print 1, then 2, then 3.", true, [L("for i in range(1, 4):"), L("print(i)", true)], { line: ["1","2","3"], code: /for\s+\w+\s+in\s+range\s*\(/ }, "1 then 2 then 3");
  add("Use a loop to print 0, then 1, then 2.", true, [L("for i in range(0, 3):"), L("print(i)", true)], { line: ["0","1","2"], code: /for\s+\w+\s+in\s+range\s*\(/ }, "0 then 1 then 2");
  add("Use a loop to print 2, then 3, then 4.", true, [L("for i in range(2, 5):"), L("print(i)", true)], { line: ["2","3","4"], code: /for\s+\w+\s+in\s+range\s*\(/ }, "2 then 3 then 4");
  add("Use a loop to print 4, then 5, then 6.", true, [L("for i in range(4, 7):"), L("print(i)", true)], { line: ["4","5","6"], code: /for\s+\w+\s+in\s+range\s*\(/ }, "4 then 5 then 6");
  add("Use a loop to print 1, then 2, then 3, then 4.", true, [L("for i in range(1, 5):"), L("print(i)", true)], { line: ["1","2","3","4"], code: /for\s+\w+\s+in\s+range\s*\(/ }, "1 then 2 then 3 then 4");
  add("Make a list and print the first word anemone.", true, [L("pets = [\"anemone\", \"limpet\"]"), L("print(pets[0])")], { line: "anemone", code: /\[\s*["']/ }, "anemone");
  add("Print both hermit and barnacle from a list.", true, [L("pets = [\"hermit\", \"barnacle\"]"), L("for pet in pets:"), L("print(pet)", true)], { line: ["hermit","barnacle"], code: /for\s+\w+\s+in\s+pets\s*:/ }, "hermit and barnacle");
  add("Make a list and print the first word pebble.", true, [L("pets = [\"pebble\", \"snail\"]"), L("print(pets[0])")], { line: "pebble", code: /\[\s*["']/ }, "pebble");
  add("Print both urchin and sponge from a list.", true, [L("pets = [\"urchin\", \"sponge\"]"), L("for pet in pets:"), L("print(pet)", true)], { line: ["urchin","sponge"], code: /for\s+\w+\s+in\s+pets\s*:/ }, "urchin and sponge");
  add("Make a list and print the first word moss.", true, [L("pets = [\"moss\", \"pip\"]"), L("print(pets[0])")], { line: "moss", code: /\[\s*["']/ }, "moss");
  add("Print both tide and pool from a list.", true, [L("pets = [\"tide\", \"pool\"]"), L("for pet in pets:"), L("print(pet)", true)], { line: ["tide","pool"], code: /for\s+\w+\s+in\s+pets\s*:/ }, "tide and pool");
  add("Make a recipe drip that prints drip.", true, [L("def drip():"), L("print(\"drip\")", true), L("drip()")], { line: "drip", code: /def\s+drip\s*\(/ }, "drip");
  add("Make a recipe peek that prints peek.", true, [L("def peek():"), L("print(\"peek\")", true), L("peek()")], { line: "peek", code: /def\s+peek\s*\(/ }, "peek");
  add("Make a recipe nest that prints nest.", true, [L("def nest():"), L("print(\"nest\")", true), L("nest()")], { line: "nest", code: /def\s+nest\s*\(/ }, "nest");
  add("Make a recipe hide that prints hide.", true, [L("def hide():"), L("print(\"hide\")", true), L("hide()")], { line: "hide", code: /def\s+hide\s*\(/ }, "hide");
  add("Make a recipe glow that prints glow.", true, [L("def glow():"), L("print(\"glow\")", true), L("glow()")], { line: "glow", code: /def\s+glow\s*\(/ }, "glow");
  add("Make a recipe rest that prints rest.", true, [L("def rest():"), L("print(\"rest\")", true), L("rest()")], { line: "rest", code: /def\s+rest\s*\(/ }, "rest");
  add("Make callpip print the name you give it.", true, [L("def callpip(who):"), L("print(who)", true), L("callpip(\"Pip\")")], { line: "pip", code: /def\s+callpip\s*\(/ }, "Pip");
  add("Make callmoss print the name you give it.", true, [L("def callmoss(who):"), L("print(who)", true), L("callmoss(\"Moss\")")], { line: "moss", code: /def\s+callmoss\s*\(/ }, "Moss");
  add("Make callpebble print the name you give it.", true, [L("def callpebble(who):"), L("print(who)", true), L("callpebble(\"Pebble\")")], { line: "pebble", code: /def\s+callpebble\s*\(/ }, "Pebble");
  add("Make callbarni print the name you give it.", true, [L("def callbarni(who):"), L("print(who)", true), L("callbarni(\"Barni\")")], { line: "barni", code: /def\s+callbarni\s*\(/ }, "Barni");
  add("Make callsail print the name you give it.", true, [L("def callsail(who):"), L("print(who)", true), L("callsail(\"Snail\")")], { line: "snail", code: /def\s+callsail\s*\(/ }, "Snail");
  add("Save a score, then print deep when it is big.", true, [L("score = 9"), L("if score > 4:"), L("print(\"deep\")", true), L("else:"), L("print(\"shallow\")", true)], { line: "deep", code: /\bif\b/ }, "deep");
  add("Print Pool log, then loop drip twice.", true, [L("print(\"Pool log\")"), L("for i in range(2):"), L("print(\"drip\")", true)], { contains: "pool log", minCount: { line: "drip", n: 2 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "Pool log and drip");
  add("Remember two names, Pip and Moss.", true, [L("one = \"Pip\""), L("two = \"Moss\""), L("print(one)"), L("print(two)")], { line: ["pip","moss"] }, "Pip and Moss");
  add("Print the second list word, limpet.", true, [L("pets = [\"anemone\", \"limpet\"]"), L("print(pets[1])")], { line: "limpet", code: /pets\s*\[\s*1\s*\]/ }, "limpet");
  add("Run a recipe, then print anemone.", true, [L("pet = \"anemone\""), L("def peek():"), L("print(\"peeked\")", true), L("peek()"), L("print(pet)")], { line: ["peeked","anemone"], code: /def\s+peek\s*\(/ }, "peeked and anemone");
  add("Count 1 then 2, then print pool done.", true, [L("for i in range(1, 3):"), L("print(i)", true), L("print(\"pool done\")")], { contains: "pool done", line: ["1","2"], code: /for\s+\w+\s+in\s+range\s*\(/ }, "1, 2, and pool done");
  add("Use else so a tiny score prints shallow.", true, [L("score = 1"), L("if score > 5:"), L("print(\"deep\")", true), L("else:"), L("print(\"shallow\")", true)], { line: "shallow", code: /\belse\b/ }, "shallow");
  add("Make two recipes, peek and hide.", true, [L("def peek():"), L("print(\"peeked\")", true), L("peek()"), L("def hide():"), L("print(\"hidden\")", true), L("hide()")], { line: ["peeked","hidden"], code: /def\s+peek\s*\(/ }, "peeked and hidden");
  add("Loop the list anemone and limpet.", true, [L("pets = [\"anemone\", \"limpet\"]"), L("for pet in pets:"), L("print(pet)", true)], { line: ["anemone","limpet"], code: /for\s+\w+\s+in\s+pets\s*:/ }, "anemone and limpet");
  add("Add 2 to shells, then loop drip.", true, [L("shells = 3"), L("print(shells + 2)"), L("for i in range(2):"), L("print(\"drip\")", true)], { line: "5", minCount: { line: "drip", n: 2 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "5");
  add("Give callpip the name Pip.", true, [L("def callpip(who):"), L("print(who)", true), L("callpip(\"Pip\")")], { line: "pip", code: /def\s+callpip\s*\(/ }, "Pip");
  add("Print every animal: anemone, limpet, urchin.", true, [L("animals = [\"anemone\", \"limpet\", \"urchin\"]"), L("for animal in animals:"), L("print(animal)", true)], { line: ["anemone","limpet","urchin"], code: /for\s+\w+\s+in\s+animals\s*:/ }, "anemone, limpet, urchin");
  add("If Pip is the hero, print found.", true, [L("hero = \"Pip\""), L("print(hero)"), L("if hero == \"Pip\":"), L("print(\"found\")", true)], { line: "found", code: /\bif\b/ }, "found");
  add("Mix a name, if, a loop, and a recipe.", true, [L("print(\"Pool log\")"), L("hero = \"Pip\""), L("print(hero)"), L("if hero == \"Pip\":"), L("print(\"found\")", true), L("for i in range(2):"), L("print(\"drip\")", true), L("def hide():"), L("print(\"hidden\")", true), L("hide()")], { line: ["pip","found","hidden"], minCount: { line: "drip", n: 2 }, code: /def\s+hide\s*\(/ }, "found and hidden");
  add("Take 2 from 9, then print deep.", true, [L("bag = 9"), L("print(bag - 2)"), L("if bag > 2:"), L("print(\"deep\")", true)], { line: ["7","deep"], code: /\bif\b/ }, "deep");
  add("Print Pip, then loop drip three times.", true, [L("print(\"Pip\")"), L("for i in range(3):"), L("print(\"drip\")", true)], { line: "pip", minCount: { line: "drip", n: 3 }, code: /for\s+\w+\s+in\s+range\s*\(/ }, "Pip and drip");
  if (list.length !== 100) {
    throw new Error("expected 100 tasks, got " + list.length);
  }
  return list;
})();

function buildPySteps(prefix, rows) {
  return rows.map(function (row, idx) {
    return {
      goal: prefix + " " + (idx + 1) + ": " + row.goal,
      help: helpForLines(!!row.fresh, row.lines, row.see, row.note),
      check: stepCheck(row.spec),
      fresh: !!row.fresh,
      lines: row.lines,
    };
  });
}

const finalIdeas = [
  {
    id: "story",
    title: "Pool Tale",
    blurb: "A tide-pool story with a name, a number, and if.",
    plan: ["Print the tale.","Remember Pip.","Choose a path."],
    steps: buildPySteps("Project step", [
      { goal: "Print Pool Tale.", fresh: true, lines: [L("print(\"Pool Tale\")")], spec: { contains: "pool tale" }, see: "Pool Tale" },
      { goal: "Add the line Pip sat in the pool..", fresh: false, lines: [L("print(\"Pip sat in the pool.\")")], spec: { contains: "pip sat in the pool." }, see: "Pip sat in the pool." },
      { goal: "Add one more line.", fresh: false, lines: [L("print(\"A snail slid past.\")")], spec: { contains: "a snail slid past." }, see: "A snail slid past." },
      { goal: "Remember the name Pip.", fresh: false, lines: [L("hero = \"Pip\"")], spec: { code: /hero\s*:?=\s*["']Pip["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("print(hero)")], spec: { line: "pip" }, see: "Pip" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("print(\"Hi \" + hero)")], spec: { contains: "hi pip" }, see: "Hi Pip" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("shells = 3")], spec: { code: /shells\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("print(shells)")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("print(shells + 1)")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print deep.", fresh: false, lines: [L("if shells > 2:"), L("print(\"deep\")", true)], spec: { line: "deep", code: /\bif\b/ }, see: "deep" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else:"), L("print(\"shallow\")", true)], spec: { code: /\belse\b/ }, see: "deep still", note: "Click after the line that prints deep." },
      { goal: "Make a list and print both words.", fresh: false, lines: [L("pets = [\"anemone\", \"limpet\"]"), L("for pet in pets:"), L("print(pet)", true)], spec: { line: "limpet", code: /for\s+\w+\s+in\s+pets\s*:/ }, see: "limpet" }
    ]),
  },
  {
    id: "names",
    title: "Shell Names",
    blurb: "Name two pool friends and count shells.",
    plan: ["Print a title.","Save a name.","Add else."],
    steps: buildPySteps("Project step", [
      { goal: "Print Shell Names.", fresh: true, lines: [L("print(\"Shell Names\")")], spec: { contains: "shell names" }, see: "Shell Names" },
      { goal: "Add the line Moss likes shade..", fresh: false, lines: [L("print(\"Moss likes shade.\")")], spec: { contains: "moss likes shade." }, see: "Moss likes shade." },
      { goal: "Add one more line.", fresh: false, lines: [L("print(\"Barni sticks tight.\")")], spec: { contains: "barni sticks tight." }, see: "Barni sticks tight." },
      { goal: "Remember the name Moss.", fresh: false, lines: [L("hero = \"Moss\"")], spec: { code: /hero\s*:?=\s*["']Moss["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("print(hero)")], spec: { line: "moss" }, see: "Moss" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("print(\"Hey \" + hero)")], spec: { contains: "hey moss" }, see: "Hey Moss" },
      { goal: "Remember the number 2.", fresh: false, lines: [L("crabs = 2")], spec: { code: /crabs\s*:?=\s*2\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("print(crabs)")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("print(crabs + 1)")], spec: { line: "3" }, see: "3" },
      { goal: "If the number is big, print many.", fresh: false, lines: [L("if crabs > 1:"), L("print(\"many\")", true)], spec: { line: "many", code: /\bif\b/ }, see: "many" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else:"), L("print(\"few\")", true)], spec: { code: /\belse\b/ }, see: "many still", note: "Click after the line that prints many." },
      { goal: "Make a list and print both words.", fresh: false, lines: [L("pets = [\"pebble\", \"snail\"]"), L("for pet in pets:"), L("print(pet)", true)], spec: { line: "snail", code: /for\s+\w+\s+in\s+pets\s*:/ }, see: "snail" }
    ]),
  },
  {
    id: "quiz",
    title: "Pool Quiz",
    blurb: "A tiny pool quiz with a score.",
    plan: ["Ask a question.","Save a score.","Print the path."],
    steps: buildPySteps("Project step", [
      { goal: "Print Pool Quiz.", fresh: true, lines: [L("print(\"Pool Quiz\")")], spec: { contains: "pool quiz" }, see: "Pool Quiz" },
      { goal: "Add the line How many arms on a star?.", fresh: false, lines: [L("print(\"How many arms on a star?\")")], spec: { contains: "how many arms on a star?" }, see: "How many arms on a star?" },
      { goal: "Add one more line.", fresh: false, lines: [L("print(\"Five is the answer.\")")], spec: { contains: "five is the answer." }, see: "Five is the answer." },
      { goal: "Remember the name Star.", fresh: false, lines: [L("hero = \"Star\"")], spec: { code: /hero\s*:?=\s*["']Star["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("print(hero)")], spec: { line: "star" }, see: "Star" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("print(\"Hello \" + hero)")], spec: { contains: "hello star" }, see: "Hello Star" },
      { goal: "Remember the number 5.", fresh: false, lines: [L("score = 5")], spec: { code: /score\s*:?=\s*5\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("print(score)")], spec: { line: "5" }, see: "5" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("print(score + 1)")], spec: { line: "6" }, see: "6" },
      { goal: "If the number is big, print right.", fresh: false, lines: [L("if score > 4:"), L("print(\"right\")", true)], spec: { line: "right", code: /\bif\b/ }, see: "right" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else:"), L("print(\"try\")", true)], spec: { code: /\belse\b/ }, see: "right still", note: "Click after the line that prints right." },
      { goal: "Make a list and print both words.", fresh: false, lines: [L("pets = [\"urchin\", \"sponge\"]"), L("for pet in pets:"), L("print(pet)", true)], spec: { line: "sponge", code: /for\s+\w+\s+in\s+pets\s*:/ }, see: "sponge" }
    ]),
  }
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Hermit Adventure",
    blurb: "A harder pool adventure with a loop and a recipe.",
    plan: ["Name the hermit.","Test the score.","Loop and cheer."],
    steps: buildPySteps("Advanced step", [
      { goal: "Print Hermit Adventure.", fresh: true, lines: [L("print(\"Hermit Adventure\")")], spec: { contains: "hermit adventure" }, see: "Hermit Adventure" },
      { goal: "Add the line The shell is too small..", fresh: false, lines: [L("print(\"The shell is too small.\")")], spec: { contains: "the shell is too small." }, see: "The shell is too small." },
      { goal: "Add one more line.", fresh: false, lines: [L("print(\"Pip finds a new one.\")")], spec: { contains: "pip finds a new one." }, see: "Pip finds a new one." },
      { goal: "Remember the name Hermit.", fresh: false, lines: [L("hero = \"Hermit\"")], spec: { code: /hero\s*:?=\s*["']Hermit["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("print(hero)")], spec: { line: "hermit" }, see: "Hermit" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("print(\"Hi \" + hero)")], spec: { contains: "hi hermit" }, see: "Hi Hermit" },
      { goal: "Remember the number 4.", fresh: false, lines: [L("steps = 4")], spec: { code: /steps\s*:?=\s*4\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("print(steps)")], spec: { line: "4" }, see: "4" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("print(steps + 1)")], spec: { line: "5" }, see: "5" },
      { goal: "If the number is big, print go.", fresh: false, lines: [L("if steps > 3:"), L("print(\"go\")", true)], spec: { line: "go", code: /\bif\b/ }, see: "go" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else:"), L("print(\"stay\")", true)], spec: { code: /\belse\b/ }, see: "go still", note: "Click after the line that prints go." },
      { goal: "Loop drip twice, then run a recipe.", fresh: false, lines: [L("for i in range(2):"), L("print(\"drip\")", true), L("def peek():"), L("print(\"peeked\")", true), L("peek()")], spec: { line: "peeked", minCount: { line: "drip", n: 2 }, code: /def\s+peek\s*\(/ }, see: "peeked" }
    ]),
  },
  {
    id: "scorequiz",
    title: "Urchin Quiz",
    blurb: "A harder quiz that loops and runs a recipe.",
    plan: ["Print the quiz.","Add a score.","Finish with a recipe."],
    steps: buildPySteps("Advanced step", [
      { goal: "Print Urchin Quiz.", fresh: true, lines: [L("print(\"Urchin Quiz\")")], spec: { contains: "urchin quiz" }, see: "Urchin Quiz" },
      { goal: "Add the line Urchins wear spines..", fresh: false, lines: [L("print(\"Urchins wear spines.\")")], spec: { contains: "urchins wear spines." }, see: "Urchins wear spines." },
      { goal: "Add one more line.", fresh: false, lines: [L("print(\"Do not step on one.\")")], spec: { contains: "do not step on one." }, see: "Do not step on one." },
      { goal: "Remember the name Urchin.", fresh: false, lines: [L("hero = \"Urchin\"")], spec: { code: /hero\s*:?=\s*["']Urchin["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("print(hero)")], spec: { line: "urchin" }, see: "Urchin" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("print(\"Hey \" + hero)")], spec: { contains: "hey urchin" }, see: "Hey Urchin" },
      { goal: "Remember the number 6.", fresh: false, lines: [L("points = 6")], spec: { code: /points\s*:?=\s*6\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("print(points)")], spec: { line: "6" }, see: "6" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("print(points + 1)")], spec: { line: "7" }, see: "7" },
      { goal: "If the number is big, print pass.", fresh: false, lines: [L("if points > 5:"), L("print(\"pass\")", true)], spec: { line: "pass", code: /\bif\b/ }, see: "pass" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else:"), L("print(\"miss\")", true)], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the line that prints pass." },
      { goal: "Loop pool twice, then run a recipe.", fresh: false, lines: [L("for i in range(2):"), L("print(\"pool\")", true), L("def hide():"), L("print(\"hidden\")", true), L("hide()")], spec: { line: "hidden", minCount: { line: "pool", n: 2 }, code: /def\s+hide\s*\(/ }, see: "hidden" }
    ]),
  },
  {
    id: "catalog",
    title: "Pool Catalog",
    blurb: "Catalog pool animals, then loop and cheer.",
    plan: ["List animals.","Count them.","Run a recipe."],
    steps: buildPySteps("Advanced step", [
      { goal: "Print Pool Catalog.", fresh: true, lines: [L("print(\"Pool Catalog\")")], spec: { contains: "pool catalog" }, see: "Pool Catalog" },
      { goal: "Add the line Anemone..", fresh: false, lines: [L("print(\"Anemone.\")")], spec: { contains: "anemone." }, see: "Anemone." },
      { goal: "Add one more line.", fresh: false, lines: [L("print(\"Limpet.\")")], spec: { contains: "limpet." }, see: "Limpet." },
      { goal: "Remember the name Sponge.", fresh: false, lines: [L("hero = \"Sponge\"")], spec: { code: /hero\s*:?=\s*["']Sponge["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("print(hero)")], spec: { line: "sponge" }, see: "Sponge" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("print(\"Hello \" + hero)")], spec: { contains: "hello sponge" }, see: "Hello Sponge" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("count = 3")], spec: { code: /count\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("print(count)")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("print(count + 1)")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print full.", fresh: false, lines: [L("if count > 2:"), L("print(\"full\")", true)], spec: { line: "full", code: /\bif\b/ }, see: "full" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else:"), L("print(\"more\")", true)], spec: { code: /\belse\b/ }, see: "full still", note: "Click after the line that prints full." },
      { goal: "Loop glow twice, then run a recipe.", fresh: false, lines: [L("for i in range(2):"), L("print(\"glow\")", true), L("def rest():"), L("print(\"rested\")", true), L("rest()")], spec: { line: "rested", minCount: { line: "glow", n: 2 }, code: /def\s+rest\s*\(/ }, see: "rested" }
    ]),
  }
];

function normalizeOut(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .trim()
    .toLowerCase();
}

function setTip(text) {
  if (helpLine && window.CodeReefHelp) {
    CodeReefHelp.show(helpLine, text);
    return;
  }
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
  getParts: function () {
    return { code: codeBox.value };
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
  taskGoal.textContent = window.CodeReefGuide
    ? CodeReefGuide.instruction(tasks[taskIndex].goal, tasks[taskIndex].help)
    : tasks[taskIndex].goal;
  setTip(
    window.CodeReefGuide
      ? CodeReefGuide.startHint(tasks[taskIndex].goal, tasks[taskIndex].help, "Run")
      : "Do the task, then press Run. Tap Help if you get stuck."
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

function splitCommaArgs(inner) {
  const parts = [];
  let buf = "";
  let inStr = null;
  for (let c = 0; c < inner.length; c += 1) {
    const ch = inner[c];
    if (inStr) {
      buf += ch;
      if (ch === "\\" && c + 1 < inner.length) {
        buf += inner[c + 1];
        c += 1;
        continue;
      }
      if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      buf += ch;
      continue;
    }
    if (ch === ",") {
      parts.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) {
    parts.push(buf.trim());
  }
  return parts;
}

function splitTopOp(expr) {
  let inStr = null;
  for (let c = 0; c < expr.length; c += 1) {
    const ch = expr[c];
    if (inStr) {
      if (ch === "\\" && c + 1 < expr.length) {
        c += 1;
        continue;
      }
      if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if ((ch === "+" || ch === "*" || ch === "-") && c > 0) {
      const prev = expr[c - 1];
      if (ch === "-" && (prev === "+" || prev === "-" || prev === "*")) {
        continue;
      }
      return {
        left: expr.slice(0, c).trim(),
        op: ch,
        right: expr.slice(c + 1).trim(),
      };
    }
  }
  return null;
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

  if (expr[0] === "[") {
    if (expr[expr.length - 1] !== "]") {
      throw new Error("A list starts with [ and ends with ].");
    }
    const inner = expr.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return splitCommaArgs(inner).map(function (part) {
      return evalExpr(part, vars);
    });
  }

  const indexMatch = expr.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*(\d+)\s*\]$/);
  if (indexMatch) {
    const arr = evalExpr(indexMatch[1], vars);
    const idx = Number(indexMatch[2]);
    if (!Array.isArray(arr)) {
      throw new Error(indexMatch[1] + ' is not a list. Try name = ["a", "b"].');
    }
    if (idx >= arr.length) {
      throw new Error("That list spot is empty. The first spot is 0.");
    }
    return arr[idx];
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(expr)) {
    if (!(expr in vars)) {
      throw new Error(expr + " is not defined yet. Make it with name = value first.");
    }
    return vars[expr];
  }

  const bin = splitTopOp(expr);
  if (bin && bin.left && bin.right) {
    const left = evalExpr(bin.left, vars);
    const right = evalExpr(bin.right, vars);
    if (bin.op === "+") {
      return left + right;
    }
    const ln = Number(left);
    const rn = Number(right);
    if (Number.isNaN(ln) || Number.isNaN(rn)) {
      throw new Error("Use + - or * with numbers, like print(2 + 3).");
    }
    if (bin.op === "-") {
      return ln - rn;
    }
    if (bin.op === "*") {
      return ln * rn;
    }
  }

  throw new Error("I don't understand: " + expr);
}

function evalCond(cond, vars) {
  const text = String(cond || "").trim();
  const m = text.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!m) {
    throw new Error("Try if score > 5: with a compare sign in the middle.");
  }
  const left = evalExpr(m[1], vars);
  const right = evalExpr(m[3], vars);
  if (m[2] === "==") {
    return left == right;
  }
  if (m[2] === "!=") {
    return left != right;
  }
  if (m[2] === ">") {
    return Number(left) > Number(right);
  }
  if (m[2] === "<") {
    return Number(left) < Number(right);
  }
  if (m[2] === ">=") {
    return Number(left) >= Number(right);
  }
  if (m[2] === "<=") {
    return Number(left) <= Number(right);
  }
  return false;
}

function runTinyPython(source) {
  const lines = String(source || "").replace(/\r/g, "").split("\n");
  const vars = Object.create(null);
  const funcs = Object.create(null);
  const output = [];
  let i = 0;

  function runSimple(line, scope) {
    const box = scope || vars;
    const assign = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (assign) {
      box[assign[1]] = evalExpr(assign[2], box);
      return;
    }

    const printMatch = line.match(/^print\s*\((.*)\)\s*$/);
    if (printMatch) {
      const inner = printMatch[1].trim();
      if (!inner) {
        output.push("");
        return;
      }
      output.push(String(evalExpr(inner, box)));
      return;
    }

    const callMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*(.*)\s*\)\s*$/);
    if (callMatch && funcs[callMatch[1]]) {
      runFunc(callMatch[1], callMatch[2], box);
      return;
    }

    throw new Error("Try print(...), name = value, if, or def. Got: " + line);
  }

  function runFunc(name, argSrc, scope) {
    const fn = funcs[name];
    const local = Object.assign(Object.create(null), vars);
    if (fn.param) {
      const arg = String(argSrc || "").trim();
      if (!arg) {
        throw new Error(name + " needs a value inside the parentheses.");
      }
      local[fn.param] = evalExpr(arg, scope || vars);
    }
    fn.body.forEach(function (bodyLine) {
      runSimple(bodyLine, local);
    });
  }

  function readIndented() {
    const body = [];
    while (i < lines.length) {
      const bodyNoComment = stripComment(lines[i]);
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
    return body;
  }

  while (i < lines.length) {
    const noComment = stripComment(lines[i]);
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
          " is pushed in, but it is not inside a loop, if, or function. Press Backspace."
      );
    }

    const defMatch = line.match(
      /^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)?\s*\)\s*:\s*$/
    );
    if (defMatch) {
      i += 1;
      const body = readIndented();
      if (body.length === 0) {
        throw new Error('Your def needs a pushed-in line under it, like print("hi").');
      }
      funcs[defMatch[1]] = { param: defMatch[2] || "", body: body };
      continue;
    }

    const ifMatch = line.match(/^if\s+(.+):\s*$/);
    if (ifMatch) {
      const cond = evalCond(ifMatch[1], vars);
      i += 1;
      const body = readIndented();
      if (body.length === 0) {
        throw new Error('Your if needs a pushed-in line under it, like print("yes").');
      }
      let elseBody = [];
      if (i < lines.length && /^else\s*:\s*$/.test(stripComment(lines[i]).trim())) {
        i += 1;
        elseBody = readIndented();
      }
      const chosen = cond ? body : elseBody;
      chosen.forEach(function (bodyLine) {
        runSimple(bodyLine);
      });
      continue;
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
      const body = readIndented();
      if (body.length === 0) {
        throw new Error("Your for loop needs a pushed-in line under it, like print(i).");
      }
      for (let n = start; n < end; n += 1) {
        vars[loopVar] = n;
        body.forEach(function (bodyLine) {
          runSimple(bodyLine);
        });
      }
      continue;
    }

    const forIn = line.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+):\s*$/);
    if (forIn) {
      const seq = evalExpr(forIn[2], vars);
      if (!Array.isArray(seq)) {
        throw new Error('for ... in needs a list, like pets = ["crab", "eel"].');
      }
      i += 1;
      const body = readIndented();
      if (body.length === 0) {
        throw new Error("Your for loop needs a pushed-in line under it, like print(pet).");
      }
      seq.forEach(function (item) {
        vars[forIn[1]] = item;
        body.forEach(function (bodyLine) {
          runSimple(bodyLine);
        });
      });
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

codeBox.addEventListener("input", function () {
  projectApi.guardElement(codeBox, "code");
  persistLessonSoon();
});

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
