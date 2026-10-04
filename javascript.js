if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("js-code");
const outputBox = document.getElementById("js-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "javascript";
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

const starterCode = `console.log("Beacon dim!");
`;

const projectStarter = `console.log("Lighthouse project");
`;

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
        return (line.indent ? "  " : "") + line.text;
      })
      .join("\n") + "\n"
  );
}

function explainJsLine(line) {
  const t = String(line || "").trim();
  const quote = 'A quote is this mark: "';
  const semi = "Then type a semicolon. A semicolon is this mark: ;";
  let m = t.match(/^console\.log\("([^"]*)"\);$/);
  if (m) {
    return [
      'Type this exactly: console.log("' + m[1] + '");',
      "console.log means show these words on the screen.",
      "Type the word console.",
      "Then type a dot. A dot is this mark: .",
      "Then type the word log.",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type this mark: )",
      semi,
      "The semicolon ends the line.",
    ];
  }
  m = t.match(/^console\.log\("([^"]*)"\s*\+\s*([A-Za-z_][A-Za-z0-9_]*)\);$/);
  if (m) {
    return [
      'Type this exactly: console.log("' + m[1] + '" + ' + m[2] + ");",
      "console.log means show words on the screen.",
      "A plus sign + sticks words together.",
      "Type console.log",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type a space, then +, then a space.",
      "Then type " + m[2] + " with no quotes.",
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^console\.log\(([A-Za-z_][A-Za-z0-9_]*)\[(\d+)\]\);$/);
  if (m) {
    return [
      "Type this exactly: console.log(" + m[1] + "[" + m[2] + "]);",
      "console.log means show this on the screen.",
      "[" + m[2] + "] means spot " + m[2] + " in the list.",
      "Lists start at 0. So 0 is the first word.",
      "Type console.log",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: [",
      "Then type " + m[2],
      "Then type this mark: ]",
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^console\.log\(([A-Za-z_][A-Za-z0-9_]*)\);$/);
  if (m) {
    return [
      "Type this exactly: console.log(" + m[1] + ");",
      "console.log means show what " + m[1] + " remembers.",
      "Type console.log",
      "Then type this mark: (",
      "Then type " + m[1] + " with no quotes.",
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^console\.log\(([A-Za-z_][A-Za-z0-9_]*)\s*\+\s*(\d+)\);$/);
  if (m) {
    return [
      "Type this exactly: console.log(" + m[1] + " + " + m[2] + ");",
      "Plus + adds numbers.",
      "Type console.log",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then +, then a space.",
      "Then type " + m[2],
      "Then type this mark: )",
      semi,
      "Do not put quotes around the number.",
    ];
  }
  m = t.match(/^console\.log\(([A-Za-z_][A-Za-z0-9_]*)\s*-\s*(\d+)\);$/);
  if (m) {
    return [
      "Type this exactly: console.log(" + m[1] + " - " + m[2] + ");",
      "Minus - takes away.",
      "Type console.log",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then -, then a space.",
      "Then type " + m[2],
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^console\.log\((\d+)\s*([+\-*])\s*(\d+)\);$/);
  if (m) {
    const word = m[2] === "+" ? "Plus + adds." : m[2] === "-" ? "Minus - takes away." : "The star * means times.";
    return [
      "Type this exactly: console.log(" + m[1] + " " + m[2] + " " + m[3] + ");",
      word,
      "Type console.log",
      "Then type this mark: (",
      "Then type " + m[1] + ", a space, " + m[2] + ", a space, " + m[3],
      "Then type this mark: )",
      semi,
      "Do not put quotes around the numbers.",
    ];
  }
  m = t.match(/^console\.log\((.+)\);$/);
  if (m) {
    return [
      "Type this exactly: console.log(" + m[1] + ");",
      "console.log means show this on the screen.",
      "Type console.log",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\[.*\]);$/);
  if (m) {
    return [
      "Type this exactly: let " + m[1] + " = " + m[2] + ";",
      "let makes a variable. A variable is a name that remembers something.",
      "A list is a box of words.",
      "Type the word let.",
      "Then type a space, then " + m[1],
      "Then type a space, then =, then a space.",
      "= means remember this.",
      "Then type " + m[2],
      semi,
    ];
  }
  m = t.match(/^let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)";$/);
  if (m) {
    return [
      'Type this exactly: let ' + m[1] + ' = "' + m[2] + '";',
      "let makes a variable. A variable is a name that remembers a word.",
      "Type the word let.",
      "Then type a space, then " + m[1],
      "Then type a space, then =, then a space.",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
      semi,
    ];
  }
  m = t.match(/^let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+);$/);
  if (m) {
    return [
      "Type this exactly: let " + m[1] + " = " + m[2] + ";",
      "let makes a variable. This one remembers a number.",
      "Type the word let.",
      "Then type a space, then " + m[1],
      "Then type a space, then =, then a space.",
      "Then type " + m[2],
      semi,
      "Do not put quotes around a number.",
    ];
  }
  m = t.match(/^for\s*\(\s*let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\d+)\s*;\s*\1\s*(<=|<)\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means do the next lines again and again.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type a space, then this mark: (",
      "Then type let, a space, " + m[1] + " = " + m[2],
      semi,
      "Then type a space, then " + m[1] + " " + m[3] + " " + m[4],
      semi,
      "Then type a space, then " + m[1] + "++",
      m[1] + "++ means add 1 to " + m[1] + " each time.",
      "Then type this mark: )",
      "Then type a space, then this mark: {",
      "{ opens the loop. The next line belongs inside.",
    ];
  }
  m = t.match(/^for\s*\(\s*let\s+([A-Za-z_][A-Za-z0-9_]*)\s+of\s+([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means walk through the list, one word at a time.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type this mark: (",
      "Then type let, a space, " + m[1],
      "Then type a space, the word of, a space, then " + m[2],
      "Then type this mark: )",
      "Then type a space, then this mark: {",
    ];
  }
  m = t.match(/^if\s*\((.+)\)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "if means pick a path. Do this only when it is true.",
      "Type the word if.",
      "Then type a space, then this mark: (",
      "Then type " + m[1],
      "Then type this mark: )",
      "Then type a space, then this mark: {",
      "{ opens that path.",
    ];
  }
  if (t === "else {") {
    return [
      "Type this exactly: else {",
      "else means the other path.",
      "Type the word else.",
      "Then type a space, then this mark: {",
    ];
  }
  if (t === "}") {
    return [
      "Type this exactly: }",
      "This curly brace } closes the block that started with {.",
    ];
  }
  m = t.match(/^function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "function makes a recipe you can run later.",
      "Type the word function.",
      "Then type a space, then " + m[1],
      "Then type this mark: (",
      "Then type " + (m[2] || "nothing"),
      "Then type this mark: )",
      "Then type a space, then this mark: {",
      "The next line belongs inside the recipe.",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\("([^"]*)"\);$/);
  if (m) {
    return [
      'Type this exactly: ' + m[1] + '("' + m[2] + '");',
      "This runs the recipe named " + m[1] + ".",
      "Type " + m[1],
      "Then type this mark: (",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\(\);$/);
  if (m) {
    return [
      "Type this exactly: " + m[1] + "();",
      "This runs the recipe named " + m[1] + ".",
      "Type " + m[1],
      "Then type this mark: (",
      "Then type this mark: )",
      semi,
    ];
  }
  return ["Type this exactly: " + t];
}

function pushBits(steps, bits) {
  if (!bits) return;
  if (Array.isArray(bits)) {
    for (let i = 0; i < bits.length; i += 1) {
      if (bits[i]) steps.push(bits[i]);
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
      if (bit) steps.push(bit);
    }
  }
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if ((!fresh && i === 0) || i > 0) {
      steps.push("Press the Enter key. That starts a new line.");
    }
    if (line.indent) {
      steps.push("Press the space bar 2 times.");
      steps.push("This line sits inside the curly braces.");
      steps.push("A curly brace looks like { or }.");
    } else if (i > 0 && lines[i - 1].indent) {
      steps.push("Press Backspace until this line starts at the left edge.");
    }
    pushBits(steps, explainJsLine(line.text));
  }
  steps.push("Press the Run button. It is at the top.");
  if (see) {
    steps.push("You should see " + see + ".");
    steps.push("Old lines can stay. That is OK.");
  }
  return numbered(steps);
}

function specOk(spec, code, output) {
  if ((spec.contains)) {
    const bits = Array.isArray(spec.contains) ? spec.contains : [spec.contains];
    for (let b = 0; b < bits.length; b += 1) {
      if (output.indexOf(String(bits[b]).toLowerCase()) === -1) return false;
    }
  }
  if ((spec.line)) {
    const lines = output.split("\n");
    const bits = Array.isArray(spec.line) ? spec.line : [spec.line];
    for (let b = 0; b < bits.length; b += 1) {
      if (lines.indexOf(String(bits[b]).toLowerCase()) === -1) return false;
    }
  }
  if ((spec.minCount)) {
    const want = String(spec.minCount.line).toLowerCase();
    const n = output.split("\n").filter(function (item) { return item === want; }).length;
    if (n < spec.minCount.n) return false;
  }
  if (spec.code && !spec.code.test(code)) return false;
  if (spec.minLines && output.split("\n").filter(Boolean).length < spec.minLines) return false;
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

const tasks = (function buildJsTasks() {
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

  add("Change dim to bright.", false, [L("console.log(\"Beacon bright!\");")], { contains: "beacon bright!" }, "Beacon bright!", "console.log(\"Beacon bright!\");\n");
  list[0].help = numbered(["Keep your old code. Do not erase the whole line.","Click in the code box.","Click on the word dim.","Delete those letters.","Type the new word in that same spot.","The line should look like this: console.log(\"Beacon bright!\");","console.log means show these words on the screen.","A quote is this mark: \"","The words Beacon bright! stay between the quotes.","Then type a semicolon. A semicolon is this mark: ;","Press the Run button. It is at the top.","You should see Beacon bright!"]);
  add("Print lantern.", false, [L("console.log(\"lantern\");")], { contains: "lantern" }, "lantern");
  add("Print foghorn.", false, [L("console.log(\"foghorn\");")], { contains: "foghorn" }, "foghorn");
  add("Print keeper.", false, [L("console.log(\"keeper\");")], { contains: "keeper" }, "keeper");
  add("Print lens.", false, [L("console.log(\"lens\");")], { contains: "lens" }, "lens");
  add("Print the number 3.", true, [L("console.log(3);")], { line: "3" }, "3");
  add("Print the number 6.", true, [L("console.log(6);")], { line: "6" }, "6");
  add("Print the number 9.", true, [L("console.log(9);")], { line: "9" }, "9");
  add("Print two lines about the lighthouse.", true, [L("console.log(\"The lamp is lit.\");"), L("console.log(\"Fog rolls in.\");")], { contains: ["the lamp is lit.","fog rolls in."] }, "Fog rolls in.");
  add("Print two lines about the lighthouse.", true, [L("console.log(\"Gale climbs the stairs.\");"), L("console.log(\"The lens turns.\");")], { contains: ["gale climbs the stairs.","the lens turns."] }, "The lens turns.");
  add("Print two lines about the lighthouse.", true, [L("console.log(\"Ships see the beam.\");"), L("console.log(\"The keeper waves.\");")], { contains: ["ships see the beam.","the keeper waves."] }, "The keeper waves.");
  add("Remember Luma in lamp.", true, [L("let lamp = \"Luma\";"), L("console.log(lamp);")], { line: "luma", code: /lamp\s*:?=\s*["']Luma["']/ }, "Luma");
  add("Remember Gale in wind.", true, [L("let wind = \"Gale\";"), L("console.log(wind);")], { line: "gale", code: /wind\s*:?=\s*["']Gale["']/ }, "Gale");
  add("Remember Wick in glass.", true, [L("let glass = \"Wick\";"), L("console.log(glass);")], { line: "wick", code: /glass\s*:?=\s*["']Wick["']/ }, "Wick");
  add("Remember North in boat.", true, [L("let boat = \"North\";"), L("console.log(boat);")], { line: "north", code: /boat\s*:?=\s*["']North["']/ }, "North");
  add("Remember Foggy in bell.", true, [L("let bell = \"Foggy\";"), L("console.log(bell);")], { line: "foggy", code: /bell\s*:?=\s*["']Foggy["']/ }, "Foggy");
  add("Remember Stair in step.", true, [L("let step = \"Stair\";"), L("console.log(step);")], { line: "stair", code: /step\s*:?=\s*["']Stair["']/ }, "Stair");
  add("Remember the number 4 in beams.", true, [L("let beams = 4;"), L("console.log(beams);")], { line: "4", code: /beams\s*:?=\s*4\b/ }, "4");
  add("Remember the number 6 in steps.", true, [L("let steps = 6;"), L("console.log(steps);")], { line: "6", code: /steps\s*:?=\s*6\b/ }, "6");
  add("Remember the number 3 in ships.", true, [L("let ships = 3;"), L("console.log(ships);")], { line: "3", code: /ships\s*:?=\s*3\b/ }, "3");
  add("Remember the number 8 in hours.", true, [L("let hours = 8;"), L("console.log(hours);")], { line: "8", code: /hours\s*:?=\s*8\b/ }, "8");
  add("Say Hey to Luma.", true, [L("let who = \"Luma\";"), L("console.log(\"Hey \" + who);")], { contains: "hey luma" }, "Hey Luma");
  add("Say Hello to Gale.", true, [L("let who = \"Gale\";"), L("console.log(\"Hello \" + who);")], { contains: "hello gale" }, "Hello Gale");
  add("Say Hi to Wick.", true, [L("let who = \"Wick\";"), L("console.log(\"Hi \" + who);")], { contains: "hi wick" }, "Hi Wick");
  add("Say Ahoy to North.", true, [L("let who = \"North\";"), L("console.log(\"Ahoy \" + who);")], { contains: "ahoy north" }, "Ahoy North");
  add("Say Yo to Foggy.", true, [L("let who = \"Foggy\";"), L("console.log(\"Yo \" + who);")], { contains: "yo foggy" }, "Yo Foggy");
  add("Print the answer to 3 + 1.", true, [L("console.log(3 + 1);")], { line: "4", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "4");
  add("Print the answer to 7 - 1.", true, [L("console.log(7 - 1);")], { line: "6", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "6");
  add("Print the answer to 2 * 4.", true, [L("console.log(2 * 4);")], { line: "8", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "8");
  add("Print the answer to 9 - 6.", true, [L("console.log(9 - 6);")], { line: "3", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "3");
  add("Print the answer to 5 + 2.", true, [L("console.log(5 + 2);")], { line: "7", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "7");
  add("Print the answer to 3 * 3.", true, [L("console.log(3 * 3);")], { line: "9", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "9");
  add("Start beams at 4, then print beams + 1.", true, [L("let beams = 4;"), L("console.log(beams + 1);")], { line: "5", code: /beams\s*\+\s*1/ }, "5");
  add("Start steps at 6, then print steps - 3.", true, [L("let steps = 6;"), L("console.log(steps - 3);")], { line: "3", code: /steps\s*\-\s*3/ }, "3");
  add("Start ships at 3, then print ships * 2.", true, [L("let ships = 3;"), L("console.log(ships * 2);")], { line: "6", code: /ships\s*\*\s*2/ }, "6");
  add("Start hours at 8, then print hours - 1.", true, [L("let hours = 8;"), L("console.log(hours - 1);")], { line: "7", code: /hours\s*\-\s*1/ }, "7");
  add("Start beams at 2, then print beams + 5.", true, [L("let beams = 2;"), L("console.log(beams + 5);")], { line: "7", code: /beams\s*\+\s*5/ }, "7");
  add("Remember Luma and Gale.", true, [L("let one = \"Luma\";"), L("let two = \"Gale\";"), L("console.log(one);"), L("console.log(two);")], { line: ["luma","gale"] }, "Luma and Gale");
  add("Remember Wick and Foggy.", true, [L("let lamp = \"Wick\";"), L("let bell = \"Foggy\";"), L("console.log(lamp);"), L("console.log(bell);")], { line: ["wick","foggy"] }, "Wick and Foggy");
  add("Remember North and Beam.", true, [L("let east = \"North\";"), L("let west = \"Beam\";"), L("console.log(east);"), L("console.log(west);")], { line: ["north","beam"] }, "North and Beam");
  add("Remember Lens and Wick.", true, [L("let top = \"Lens\";"), L("let low = \"Wick\";"), L("console.log(top);"), L("console.log(low);")], { line: ["lens","wick"] }, "Lens and Wick");
  add("If the number is > 3, print bright.", true, [L("let score = 8;"), L("if (score > 3) {"), L("console.log(\"bright\");", true), L("}")], { line: "bright", code: /\bif\b/ }, "bright");
  add("If the number is > 1, print lit.", true, [L("let score = 5;"), L("if (score > 1) {"), L("console.log(\"lit\");", true), L("}")], { line: "lit", code: /\bif\b/ }, "lit");
  add("If the number is < 4, print dim.", true, [L("let score = 2;"), L("if (score < 4) {"), L("console.log(\"dim\");", true), L("}")], { line: "dim", code: /\bif\b/ }, "dim");
  add("If the number is > 6, print far.", true, [L("let score = 9;"), L("if (score > 6) {"), L("console.log(\"far\");", true), L("}")], { line: "far", code: /\bif\b/ }, "far");
  add("If the number is < 5, print near.", true, [L("let score = 1;"), L("if (score < 5) {"), L("console.log(\"near\");", true), L("}")], { line: "near", code: /\bif\b/ }, "near");
  add("If the number is > 2, print clear.", true, [L("let score = 7;"), L("if (score > 2) {"), L("console.log(\"clear\");", true), L("}")], { line: "clear", code: /\bif\b/ }, "clear");
  add("Use if and else so you print foggy.", true, [L("let score = 2;"), L("if (score > 6) {"), L("console.log(\"bright\");", true), L("}"), L("else {"), L("console.log(\"foggy\");", true), L("}")], { line: "foggy", code: /\bif\b[\s\S]*\belse\b/ }, "foggy");
  add("Use if and else so you print beam.", true, [L("let score = 9;"), L("if (score > 4) {"), L("console.log(\"beam\");", true), L("}"), L("else {"), L("console.log(\"dark\");", true), L("}")], { line: "beam", code: /\bif\b[\s\S]*\belse\b/ }, "beam");
  add("Use if and else so you print steep.", true, [L("let score = 3;"), L("if (score < 3) {"), L("console.log(\"low\");", true), L("}"), L("else {"), L("console.log(\"steep\");", true), L("}")], { line: "steep", code: /\bif\b[\s\S]*\belse\b/ }, "steep");
  add("Use if and else so you print soft.", true, [L("let score = 1;"), L("if (score < 4) {"), L("console.log(\"soft\");", true), L("}"), L("else {"), L("console.log(\"hard\");", true), L("}")], { line: "soft", code: /\bif\b[\s\S]*\belse\b/ }, "soft");
  add("Use if and else so you print unlit.", true, [L("let score = 0;"), L("if (score > 1) {"), L("console.log(\"on\");", true), L("}"), L("else {"), L("console.log(\"unlit\");", true), L("}")], { line: "unlit", code: /\bif\b[\s\S]*\belse\b/ }, "unlit");
  add("Use if and else so you print dimmer.", true, [L("let score = 6;"), L("if (score > 6) {"), L("console.log(\"max\");", true), L("}"), L("else {"), L("console.log(\"dimmer\");", true), L("}")], { line: "dimmer", code: /\bif\b[\s\S]*\belse\b/ }, "dimmer");
  add("Use if and else so you print clear.", true, [L("let score = 4;"), L("if (score < 9) {"), L("console.log(\"clear\");", true), L("}"), L("else {"), L("console.log(\"no\");", true), L("}")], { line: "clear", code: /\bif\b[\s\S]*\belse\b/ }, "clear");
  add("Use if and else so you print shine.", true, [L("let score = 8;"), L("if (score > 2) {"), L("console.log(\"shine\");", true), L("}"), L("else {"), L("console.log(\"rest\");", true), L("}")], { line: "shine", code: /\bif\b[\s\S]*\belse\b/ }, "shine");
  add("Use a loop to print flash 2 times.", true, [L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"flash\");", true), L("}")], { minCount: { line: "flash", n: 2 }, code: /for\s*\(/ }, "flash 2 times");
  add("Use a loop to print flash 3 times.", true, [L("for (let i = 1; i <= 3; i++) {"), L("console.log(\"flash\");", true), L("}")], { minCount: { line: "flash", n: 3 }, code: /for\s*\(/ }, "flash 3 times");
  add("Use a loop to print beam 2 times.", true, [L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"beam\");", true), L("}")], { minCount: { line: "beam", n: 2 }, code: /for\s*\(/ }, "beam 2 times");
  add("Use a loop to print ring 3 times.", true, [L("for (let i = 1; i <= 3; i++) {"), L("console.log(\"ring\");", true), L("}")], { minCount: { line: "ring", n: 3 }, code: /for\s*\(/ }, "ring 3 times");
  add("Use a loop to print glow 2 times.", true, [L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"glow\");", true), L("}")], { minCount: { line: "glow", n: 2 }, code: /for\s*\(/ }, "glow 2 times");
  add("Use a loop to print sweep 4 times.", true, [L("for (let i = 1; i <= 4; i++) {"), L("console.log(\"sweep\");", true), L("}")], { minCount: { line: "sweep", n: 4 }, code: /for\s*\(/ }, "sweep 4 times");
  add("Use a loop to print 2, then 3, then 4, then 5.", true, [L("for (let i = 2; i <= 5; i++) {"), L("console.log(i);", true), L("}")], { line: ["2","3","4","5"], code: /for\s*\(/ }, "2 then 3 then 4 then 5");
  add("Use a loop to print 4, then 5, then 6.", true, [L("for (let i = 4; i <= 6; i++) {"), L("console.log(i);", true), L("}")], { line: ["4","5","6"], code: /for\s*\(/ }, "4 then 5 then 6");
  add("Use a loop to print 7, then 8, then 9.", true, [L("for (let i = 7; i <= 9; i++) {"), L("console.log(i);", true), L("}")], { line: ["7","8","9"], code: /for\s*\(/ }, "7 then 8 then 9");
  add("Use a loop to print 0, then 1.", true, [L("for (let i = 0; i <= 1; i++) {"), L("console.log(i);", true), L("}")], { line: ["0","1"], code: /for\s*\(/ }, "0 then 1");
  add("Use a loop to print 3.", true, [L("for (let i = 3; i <= 3; i++) {"), L("console.log(i);", true), L("}")], { line: ["3"], code: /for\s*\(/ }, "3");
  add("Use a loop to print 6, then 7, then 8.", true, [L("for (let i = 6; i <= 8; i++) {"), L("console.log(i);", true), L("}")], { line: ["6","7","8"], code: /for\s*\(/ }, "6 then 7 then 8");
  add("Make a list and print the first word lantern.", true, [L("let pets = [\"lantern\", \"lens\"];"), L("console.log(pets[0]);")], { line: "lantern", code: /\[\s*["']/ }, "lantern");
  add("Print both fog and beam from a list.", true, [L("let pets = [\"fog\", \"beam\"];"), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")], { line: ["fog","beam"], code: /for\s*\(\s*let\s+\w+\s+of\s+pets\s*\)/ }, "fog and beam");
  add("Make a list and print the first word stairs.", true, [L("let pets = [\"stairs\", \"wick\"];"), L("console.log(pets[0]);")], { line: "stairs", code: /\[\s*["']/ }, "stairs");
  add("Print both ship and bell from a list.", true, [L("let pets = [\"ship\", \"bell\"];"), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")], { line: ["ship","bell"], code: /for\s*\(\s*let\s+\w+\s+of\s+pets\s*\)/ }, "ship and bell");
  add("Make a list and print the first word gale.", true, [L("let pets = [\"gale\", \"luma\"];"), L("console.log(pets[0]);")], { line: "gale", code: /\[\s*["']/ }, "gale");
  add("Print both night and lamp from a list.", true, [L("let pets = [\"night\", \"lamp\"];"), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")], { line: ["night","lamp"], code: /for\s*\(\s*let\s+\w+\s+of\s+pets\s*\)/ }, "night and lamp");
  add("Make a recipe flash that prints flash.", true, [L("function flash() {"), L("console.log(\"flash\");", true), L("}"), L("flash();")], { line: "flash", code: /function\s+flash\s*\(/ }, "flash");
  add("Make a recipe beam that prints beam.", true, [L("function beam() {"), L("console.log(\"beam\");", true), L("}"), L("beam();")], { line: "beam", code: /function\s+beam\s*\(/ }, "beam");
  add("Make a recipe ring that prints ring.", true, [L("function ring() {"), L("console.log(\"ring\");", true), L("}"), L("ring();")], { line: "ring", code: /function\s+ring\s*\(/ }, "ring");
  add("Make a recipe blink that prints blink.", true, [L("function blink() {"), L("console.log(\"blink\");", true), L("}"), L("blink();")], { line: "blink", code: /function\s+blink\s*\(/ }, "blink");
  add("Make a recipe shine that prints shine.", true, [L("function shine() {"), L("console.log(\"shine\");", true), L("}"), L("shine();")], { line: "shine", code: /function\s+shine\s*\(/ }, "shine");
  add("Make a recipe sweep that prints sweep.", true, [L("function sweep() {"), L("console.log(\"sweep\");", true), L("}"), L("sweep();")], { line: "sweep", code: /function\s+sweep\s*\(/ }, "sweep");
  add("Make callluma print the name you give it.", true, [L("function callluma(who) {"), L("console.log(who);", true), L("}"), L("callluma(\"Luma\");")], { line: "luma", code: /function\s+callluma\s*\(/ }, "Luma");
  add("Make callgale print the name you give it.", true, [L("function callgale(who) {"), L("console.log(who);", true), L("}"), L("callgale(\"Gale\");")], { line: "gale", code: /function\s+callgale\s*\(/ }, "Gale");
  add("Make callwick print the name you give it.", true, [L("function callwick(who) {"), L("console.log(who);", true), L("}"), L("callwick(\"Wick\");")], { line: "wick", code: /function\s+callwick\s*\(/ }, "Wick");
  add("Make callnorth print the name you give it.", true, [L("function callnorth(who) {"), L("console.log(who);", true), L("}"), L("callnorth(\"North\");")], { line: "north", code: /function\s+callnorth\s*\(/ }, "North");
  add("Make callfoggy print the name you give it.", true, [L("function callfoggy(who) {"), L("console.log(who);", true), L("}"), L("callfoggy(\"Foggy\");")], { line: "foggy", code: /function\s+callfoggy\s*\(/ }, "Foggy");
  add("Save a score, then print bright when it is big.", true, [L("let score = 8;"), L("if (score > 3) {"), L("console.log(\"bright\");", true), L("}"), L("else {"), L("console.log(\"foggy\");", true), L("}")], { line: "bright", code: /\bif\b/ }, "bright");
  add("Print Light log, then loop flash twice.", true, [L("console.log(\"Light log\");"), L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"flash\");", true), L("}")], { contains: "light log", minCount: { line: "flash", n: 2 }, code: /for\s*\(/ }, "Light log and flash");
  add("Remember two names, Luma and Gale.", true, [L("let one = \"Luma\";"), L("let two = \"Gale\";"), L("console.log(one);"), L("console.log(two);")], { line: ["luma","gale"] }, "Luma and Gale");
  add("Print the second list word, lens.", true, [L("let pets = [\"lantern\", \"lens\"];"), L("console.log(pets[1]);")], { line: "lens", code: /pets\s*\[\s*1\s*\]/ }, "lens");
  add("Run a recipe, then print lantern.", true, [L("let pet = \"lantern\";"), L("function flash() {"), L("console.log(\"flashed\");", true), L("}"), L("flash();"), L("console.log(pet);")], { line: ["flashed","lantern"], code: /function\s+flash\s*\(/ }, "flashed and lantern");
  add("Count 1 then 2, then print light done.", true, [L("for (let i = 1; i <= 2; i++) {"), L("console.log(i);", true), L("}"), L("console.log(\"light done\");")], { contains: "light done", line: ["1","2"], code: /for\s*\(/ }, "1, 2, and light done");
  add("Use else so a tiny score prints foggy.", true, [L("let score = 1;"), L("if (score > 5) {"), L("console.log(\"bright\");", true), L("}"), L("else {"), L("console.log(\"foggy\");", true), L("}")], { line: "foggy", code: /\belse\b/ }, "foggy");
  add("Make two recipes, flash and blink.", true, [L("function flash() {"), L("console.log(\"flashed\");", true), L("}"), L("flash();"), L("function blink() {"), L("console.log(\"blinked\");", true), L("}"), L("blink();")], { line: ["flashed","blinked"], code: /function\s+flash\s*\(/ }, "flashed and blinked");
  add("Loop the list lantern and lens.", true, [L("let pets = [\"lantern\", \"lens\"];"), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")], { line: ["lantern","lens"], code: /for\s*\(\s*let\s+\w+\s+of\s+pets\s*\)/ }, "lantern and lens");
  add("Add 2 to beams, then loop flash.", true, [L("let beams = 4;"), L("console.log(beams + 2);"), L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"flash\");", true), L("}")], { line: "6", minCount: { line: "flash", n: 2 }, code: /for\s*\(/ }, "6");
  add("Give callluma the name Luma.", true, [L("function callluma(who) {"), L("console.log(who);", true), L("}"), L("callluma(\"Luma\");")], { line: "luma", code: /function\s+callluma\s*\(/ }, "Luma");
  add("Print every light: lantern, lens, beam.", true, [L("let lights = [\"lantern\", \"lens\", \"beam\"];"), L("for (let item of lights) {"), L("console.log(item);", true), L("}")], { line: ["lantern","lens","beam"], code: /for\s*\(\s*let\s+\w+\s+of\s+lights\s*\)/ }, "lantern, lens, beam");
  add("If Luma is the hero, print spotted.", true, [L("let hero = \"Luma\";"), L("console.log(hero);"), L("if (hero == \"Luma\") {"), L("console.log(\"spotted\");", true), L("}")], { line: "spotted", code: /\bif\b/ }, "spotted");
  add("Mix a name, if, a loop, and a recipe.", true, [L("console.log(\"Light log\");"), L("let hero = \"Luma\";"), L("console.log(hero);"), L("if (hero == \"Luma\") {"), L("console.log(\"spotted\");", true), L("}"), L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"flash\");", true), L("}"), L("function blink() {"), L("console.log(\"blinked\");", true), L("}"), L("blink();")], { line: ["luma","spotted","blinked"], minCount: { line: "flash", n: 2 }, code: /function\s+blink\s*\(/ }, "spotted and blinked");
  add("Take 1 from 8, then print bright.", true, [L("let bag = 8;"), L("console.log(bag - 1);"), L("if (bag > 1) {"), L("console.log(\"bright\");", true), L("}")], { line: ["7","bright"], code: /\bif\b/ }, "bright");
  add("Print Luma, then loop flash three times.", true, [L("console.log(\"Luma\");"), L("for (let i = 1; i <= 3; i++) {"), L("console.log(\"flash\");", true), L("}")], { line: "luma", minCount: { line: "flash", n: 3 }, code: /for\s*\(/ }, "Luma and flash");
  if (list.length !== 100) {
    throw new Error("expected 100 tasks, got " + list.length);
  }
  return list;
})();

function buildJsSteps(prefix, rows) {
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
    title: "Light Tale",
    blurb: "A lighthouse story with a name, a number, and if.",
    plan: ["Print the tale.","Remember Luma.","Choose a path."],
    steps: buildJsSteps("Project step", [
      { goal: "Print Light Tale.", fresh: true, lines: [L("console.log(\"Light Tale\");")], spec: { contains: "light tale" }, see: "Light Tale" },
      { goal: "Add the line The lamp clicks on..", fresh: false, lines: [L("console.log(\"The lamp clicks on.\");")], spec: { contains: "the lamp clicks on." }, see: "The lamp clicks on." },
      { goal: "Add one more line.", fresh: false, lines: [L("console.log(\"Fog hides the rocks.\");")], spec: { contains: "fog hides the rocks." }, see: "Fog hides the rocks." },
      { goal: "Remember the name Luma.", fresh: false, lines: [L("let hero = \"Luma\";")], spec: { code: /hero\s*:?=\s*["']Luma["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("console.log(hero);")], spec: { line: "luma" }, see: "Luma" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("console.log(\"Hey \" + hero);")], spec: { contains: "hey luma" }, see: "Hey Luma" },
      { goal: "Remember the number 4.", fresh: false, lines: [L("let beams = 4;")], spec: { code: /beams\s*:?=\s*4\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("console.log(beams);")], spec: { line: "4" }, see: "4" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("console.log(beams + 1);")], spec: { line: "5" }, see: "5" },
      { goal: "If the number is big, print bright.", fresh: false, lines: [L("if (beams > 3) {"), L("console.log(\"bright\");", true), L("}")], spec: { line: "bright", code: /\bif\b/ }, see: "bright" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("console.log(\"foggy\");", true), L("}")], spec: { code: /\belse\b/ }, see: "bright still", note: "Click after the line that prints bright." },
      { goal: "Make a list and print both words.", fresh: false, lines: [L("let pets = [\"lantern\", \"lens\"];"), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")], spec: { line: "lens", code: /for\s*\(\s*let\s+\w+\s+of\s+pets\s*\)/ }, see: "lens" }
    ]),
  },
  {
    id: "names",
    title: "Keeper Names",
    blurb: "Name the keepers and count the steps.",
    plan: ["Print a title.","Save a name.","Add else."],
    steps: buildJsSteps("Project step", [
      { goal: "Print Keeper Names.", fresh: true, lines: [L("console.log(\"Keeper Names\");")], spec: { contains: "keeper names" }, see: "Keeper Names" },
      { goal: "Add the line Gale climbs fast..", fresh: false, lines: [L("console.log(\"Gale climbs fast.\");")], spec: { contains: "gale climbs fast." }, see: "Gale climbs fast." },
      { goal: "Add one more line.", fresh: false, lines: [L("console.log(\"Wick cleans the lens.\");")], spec: { contains: "wick cleans the lens." }, see: "Wick cleans the lens." },
      { goal: "Remember the name Gale.", fresh: false, lines: [L("let hero = \"Gale\";")], spec: { code: /hero\s*:?=\s*["']Gale["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("console.log(hero);")], spec: { line: "gale" }, see: "Gale" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("console.log(\"Hello \" + hero);")], spec: { contains: "hello gale" }, see: "Hello Gale" },
      { goal: "Remember the number 6.", fresh: false, lines: [L("let steps = 6;")], spec: { code: /steps\s*:?=\s*6\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("console.log(steps);")], spec: { line: "6" }, see: "6" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("console.log(steps + 1);")], spec: { line: "7" }, see: "7" },
      { goal: "If the number is big, print high.", fresh: false, lines: [L("if (steps > 5) {"), L("console.log(\"high\");", true), L("}")], spec: { line: "high", code: /\bif\b/ }, see: "high" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("console.log(\"low\");", true), L("}")], spec: { code: /\belse\b/ }, see: "high still", note: "Click after the line that prints high." },
      { goal: "Make a list and print both words.", fresh: false, lines: [L("let pets = [\"fog\", \"bell\"];"), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")], spec: { line: "bell", code: /for\s*\(\s*let\s+\w+\s+of\s+pets\s*\)/ }, see: "bell" }
    ]),
  },
  {
    id: "quiz",
    title: "Fog Quiz",
    blurb: "A lighthouse quiz with a score.",
    plan: ["Ask a question.","Save a score.","Print the path."],
    steps: buildJsSteps("Project step", [
      { goal: "Print Fog Quiz.", fresh: true, lines: [L("console.log(\"Fog Quiz\");")], spec: { contains: "fog quiz" }, see: "Fog Quiz" },
      { goal: "Add the line What turns the lens?.", fresh: false, lines: [L("console.log(\"What turns the lens?\");")], spec: { contains: "what turns the lens?" }, see: "What turns the lens?" },
      { goal: "Add one more line.", fresh: false, lines: [L("console.log(\"The keeper does.\");")], spec: { contains: "the keeper does." }, see: "The keeper does." },
      { goal: "Remember the name Wick.", fresh: false, lines: [L("let hero = \"Wick\";")], spec: { code: /hero\s*:?=\s*["']Wick["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("console.log(hero);")], spec: { line: "wick" }, see: "Wick" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("console.log(\"Hi \" + hero);")], spec: { contains: "hi wick" }, see: "Hi Wick" },
      { goal: "Remember the number 7.", fresh: false, lines: [L("let score = 7;")], spec: { code: /score\s*:?=\s*7\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("console.log(score);")], spec: { line: "7" }, see: "7" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("console.log(score + 1);")], spec: { line: "8" }, see: "8" },
      { goal: "If the number is big, print lit.", fresh: false, lines: [L("if (score > 6) {"), L("console.log(\"lit\");", true), L("}")], spec: { line: "lit", code: /\bif\b/ }, see: "lit" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("console.log(\"dark\");", true), L("}")], spec: { code: /\belse\b/ }, see: "lit still", note: "Click after the line that prints lit." },
      { goal: "Make a list and print both words.", fresh: false, lines: [L("let pets = [\"stairs\", \"ship\"];"), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")], spec: { line: "ship", code: /for\s*\(\s*let\s+\w+\s+of\s+pets\s*\)/ }, see: "ship" }
    ]),
  }
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Beacon Adventure",
    blurb: "A harder night shift with a loop and a recipe.",
    plan: ["Name the beacon.","Test the score.","Loop and flash."],
    steps: buildJsSteps("Advanced step", [
      { goal: "Print Beacon Adventure.", fresh: true, lines: [L("console.log(\"Beacon Adventure\");")], spec: { contains: "beacon adventure" }, see: "Beacon Adventure" },
      { goal: "Add the line Ships look for the beam..", fresh: false, lines: [L("console.log(\"Ships look for the beam.\");")], spec: { contains: "ships look for the beam." }, see: "Ships look for the beam." },
      { goal: "Add one more line.", fresh: false, lines: [L("console.log(\"The stairs are steep.\");")], spec: { contains: "the stairs are steep." }, see: "The stairs are steep." },
      { goal: "Remember the name North.", fresh: false, lines: [L("let hero = \"North\";")], spec: { code: /hero\s*:?=\s*["']North["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("console.log(hero);")], spec: { line: "north" }, see: "North" },
      { goal: "Say Ahoy to the name.", fresh: false, lines: [L("console.log(\"Ahoy \" + hero);")], spec: { contains: "ahoy north" }, see: "Ahoy North" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("let ships = 3;")], spec: { code: /ships\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("console.log(ships);")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("console.log(ships + 1);")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print safe.", fresh: false, lines: [L("if (ships > 2) {"), L("console.log(\"safe\");", true), L("}")], spec: { line: "safe", code: /\bif\b/ }, see: "safe" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("console.log(\"lost\");", true), L("}")], spec: { code: /\belse\b/ }, see: "safe still", note: "Click after the line that prints safe." },
      { goal: "Loop flash twice, then run a recipe.", fresh: false, lines: [L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"flash\");", true), L("}"), L("function blink() {"), L("console.log(\"blinked\");", true), L("}"), L("blink();")], spec: { line: "blinked", minCount: { line: "flash", n: 2 }, code: /function\s+blink\s*\(/ }, see: "blinked" }
    ]),
  },
  {
    id: "scorequiz",
    title: "Lamp Quiz",
    blurb: "A harder lamp quiz with a recipe.",
    plan: ["Print the quiz.","Add a score.","Blink at the end."],
    steps: buildJsSteps("Advanced step", [
      { goal: "Print Lamp Quiz.", fresh: true, lines: [L("console.log(\"Lamp Quiz\");")], spec: { contains: "lamp quiz" }, see: "Lamp Quiz" },
      { goal: "Add the line How many stairs?.", fresh: false, lines: [L("console.log(\"How many stairs?\");")], spec: { contains: "how many stairs?" }, see: "How many stairs?" },
      { goal: "Add one more line.", fresh: false, lines: [L("console.log(\"Count them twice.\");")], spec: { contains: "count them twice." }, see: "Count them twice." },
      { goal: "Remember the name Stair.", fresh: false, lines: [L("let hero = \"Stair\";")], spec: { code: /hero\s*:?=\s*["']Stair["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("console.log(hero);")], spec: { line: "stair" }, see: "Stair" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("console.log(\"Hey \" + hero);")], spec: { contains: "hey stair" }, see: "Hey Stair" },
      { goal: "Remember the number 8.", fresh: false, lines: [L("let points = 8;")], spec: { code: /points\s*:?=\s*8\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("console.log(points);")], spec: { line: "8" }, see: "8" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("console.log(points + 1);")], spec: { line: "9" }, see: "9" },
      { goal: "If the number is big, print pass.", fresh: false, lines: [L("if (points > 7) {"), L("console.log(\"pass\");", true), L("}")], spec: { line: "pass", code: /\bif\b/ }, see: "pass" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("console.log(\"miss\");", true), L("}")], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the line that prints pass." },
      { goal: "Loop sweep twice, then run a recipe.", fresh: false, lines: [L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"sweep\");", true), L("}"), L("function shine() {"), L("console.log(\"shone\");", true), L("}"), L("shine();")], spec: { line: "shone", minCount: { line: "sweep", n: 2 }, code: /function\s+shine\s*\(/ }, see: "shone" }
    ]),
  },
  {
    id: "catalog",
    title: "Lens Catalog",
    blurb: "Catalog the lamp parts, then loop.",
    plan: ["Name the parts.","Count them.","Run a recipe."],
    steps: buildJsSteps("Advanced step", [
      { goal: "Print Lens Catalog.", fresh: true, lines: [L("console.log(\"Lens Catalog\");")], spec: { contains: "lens catalog" }, see: "Lens Catalog" },
      { goal: "Add the line Glass..", fresh: false, lines: [L("console.log(\"Glass.\");")], spec: { contains: "glass." }, see: "Glass." },
      { goal: "Add one more line.", fresh: false, lines: [L("console.log(\"Wick.\");")], spec: { contains: "wick." }, see: "Wick." },
      { goal: "Remember the name Lens.", fresh: false, lines: [L("let hero = \"Lens\";")], spec: { code: /hero\s*:?=\s*["']Lens["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("console.log(hero);")], spec: { line: "lens" }, see: "Lens" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("console.log(\"Hello \" + hero);")], spec: { contains: "hello lens" }, see: "Hello Lens" },
      { goal: "Remember the number 2.", fresh: false, lines: [L("let count = 2;")], spec: { code: /count\s*:?=\s*2\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("console.log(count);")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("console.log(count + 1);")], spec: { line: "3" }, see: "3" },
      { goal: "If the number is big, print ready.", fresh: false, lines: [L("if (count > 1) {"), L("console.log(\"ready\");", true), L("}")], spec: { line: "ready", code: /\bif\b/ }, see: "ready" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("console.log(\"wait\");", true), L("}")], spec: { code: /\belse\b/ }, see: "ready still", note: "Click after the line that prints ready." },
      { goal: "Loop glow twice, then run a recipe.", fresh: false, lines: [L("for (let i = 1; i <= 2; i++) {"), L("console.log(\"glow\");", true), L("}"), L("function sweep() {"), L("console.log(\"swept\");", true), L("}"), L("sweep();")], spec: { line: "swept", minCount: { line: "glow", n: 2 }, code: /function\s+sweep\s*\(/ }, see: "swept" }
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
  pathKey: "javascript",
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
    openCoralTrail("javascript", {
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

function runKidJs(source) {
  const lines = [];
  const kidConsole = {
    log: function () {
      const parts = [];
      for (let i = 0; i < arguments.length; i += 1) {
        parts.push(String(arguments[i]));
      }
      lines.push(parts.join(" "));
    },
  };

  const runner = new Function(
    "console",
    '"use strict";\n' + String(source || "")
  );
  runner(kidConsole);
  return lines.join("\n");
}

function runCode() {
  try {
    lastOutput = runKidJs(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing logged yet — try console.log)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + (err && err.message ? err.message : String(err));
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("JavaScript got stuck. Read the red error, or tap Help.");
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
