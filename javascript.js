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

const starterCode = `console.log("Hello, reef!");
`;

const projectStarter = `console.log("My reef project");
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

  add("Make JavaScript say Hello, ocean!", true, [L('console.log("Hello, ocean!");')], { contains: "hello, ocean!" }, "Hello, ocean!");
  list[0].help = numbered([
    "Keep your old code. Do not erase the whole line.",
    "Click in the code box.",
    "Click on the word reef.",
    "Delete the letters r e e f.",
    "Type the word ocean in that same spot.",
    'The line should look like this: console.log("Hello, ocean!");',
    "console.log means show these words on the screen.",
    "Type the word console.",
    "Then type a dot. A dot is this mark: .",
    "Then type the word log.",
    "Then type this mark: (",
    'A quote is this mark: "',
    "The words Hello, ocean! stay between the quotes.",
    "Then type this mark: )",
    "Then type a semicolon. A semicolon is this mark: ;",
    "The semicolon ends the line.",
    "Press the Run button. It is at the top.",
    "You should see Hello, ocean!",
  ]);

  add(
    "Print two lines — Hello, ocean! then I love JavaScript!",
    false,
    [L('console.log("I love JavaScript!");')],
    { contains: ["hello, ocean!", "i love javascript!"] },
    "I love JavaScript!",
    'console.log("Hello, ocean!");\nconsole.log("I love JavaScript!");\n'
  );
  add(
    'Make a variable let fish = "clownfish"; and print it.',
    false,
    [L('let fish = "clownfish";'), L("console.log(fish);")],
    { code: /fish\s*=\s*["']clownfish["']/, line: "clownfish" },
    "clownfish"
  );
  add(
    "Use a for loop to print 1, then 2, then 3.",
    true,
    [L("for (let i = 1; i <= 3; i++) {"), L("console.log(i);", true), L("}")],
    { code: /for\s*\(/, line: ["1", "2", "3"] },
    "1 then 2 then 3"
  );
  add("Print the number 5.", true, [L("console.log(5);")], { line: "5" }, "5");
  add(
    'Make let coral = "reef"; and print it.',
    false,
    [L('let coral = "reef";'), L("console.log(coral);")],
    { code: /coral\s*=\s*["']reef["']/, line: "reef" },
    "reef"
  );
  add(
    "Loop to print splash three times.",
    true,
    [L("for (let i = 1; i <= 3; i++) {"), L('console.log("splash");', true), L("}")],
    { code: /for\s*\(/, minCount: { line: "splash", n: 3 } },
    "splash three times"
  );

  ["bubble", "wave", "crab", "dolphin", "turtle", "coral", "sand", "shell", "whale", "shark", "starfish", "eel"].forEach(function (word) {
    add("Print the word " + word + ".", false, [L('console.log("' + word + '");')], { contains: word }, word);
  });

  [
    ["pet", "crab"], ["boat", "blue"], ["hero", "Fin"], ["snack", "kelp"],
    ["home", "reef"], ["friend", "Nemo"], ["color", "teal"], ["toy", "shell"],
    ["pal", "otter"], ["ride", "wave"], ["team", "pods"], ["gem", "pearl"],
  ].forEach(function (pair) {
    add(
      'Make ' + pair[0] + ' = "' + pair[1] + '" and print it.',
      false,
      [L('let ' + pair[0] + ' = "' + pair[1] + '";'), L("console.log(" + pair[0] + ");")],
      { code: new RegExp(pair[0] + "\\s*=\\s*[\"']" + pair[1] + "[\"']", "i"), line: pair[1].toLowerCase() },
      pair[1]
    );
  });

  [["2 + 3", "5"], ["4 + 1", "5"], ["10 - 3", "7"], ["8 - 2", "6"], ["2 * 3", "6"], ["4 * 2", "8"], ["1 + 6", "7"], ["9 - 4", "5"], ["3 * 3", "9"], ["5 + 5", "10"]].forEach(function (row) {
    add("Print the math " + row[0] + ".", true, [L("console.log(" + row[0] + ");")], { line: row[1], code: /console\.log\s*\(/ }, row[1]);
  });

  ["splash", "bubble", "yay", "hi", "wave", "go"].forEach(function (word) {
    add(
      'Use a loop to print "' + word + '" three times.',
      true,
      [L("for (let i = 1; i <= 3; i++) {"), L('console.log("' + word + '");', true), L("}")],
      { code: /for\s*\(/, minCount: { line: word, n: 3 } },
      word + " three times"
    );
  });
  [["1", "<=", "3", ["1", "2", "3"]], ["1", "<=", "4", ["1", "2", "3", "4"]], ["0", "<", "3", ["0", "1", "2"]], ["2", "<=", "4", ["2", "3", "4"]], ["1", "<=", "5", ["1", "2", "3", "4", "5"]], ["4", "<=", "6", ["4", "5", "6"]]].forEach(function (row) {
    add(
      "Use a loop to print " + row[3].join(", then ") + ".",
      true,
      [L("for (let i = " + row[0] + "; i " + row[1] + " " + row[2] + "; i++) {"), L("console.log(i);", true), L("}")],
      { code: /for\s*\(/, line: row[3] },
      row[3].join(" then ")
    );
  });

  [["9", ">", "5", "big", "small", "big"], ["1", ">", "5", "big", "small", "small"], ["8", ">", "3", "yes", "no", "yes"], ["2", "<", "4", "low", "high", "low"], ["10", ">", "7", "tall", "short", "tall"], ["0", ">", "2", "hot", "cold", "cold"], ["6", ">", "6", "same", "notyet", "notyet"], ["4", "<", "9", "ok", "nope", "ok"], ["3", ">", "1", "swim", "rest", "swim"], ["5", "<", "5", "up", "down", "down"], ["7", ">", "2", "pass", "try", "pass"], ["1", "<", "1", "a", "b", "b"]].forEach(function (row) {
    add(
      "Use if and else so the path prints " + row[5] + ".",
      true,
      [L("let score = " + row[0] + ";"), L("if (score " + row[1] + " " + row[2] + ") {"), L('console.log("' + row[3] + '");', true), L("}"), L("else {"), L('console.log("' + row[4] + '");', true), L("}")],
      { code: /\bif\b[\s\S]*\belse\b/, line: row[5] },
      row[5]
    );
  });

  ["wave", "splash", "hi", "yay", "wow", "go", "pop"].forEach(function (word) {
    add(
      "Make a function " + word + " that prints " + word + ", then run it.",
      true,
      [L("function " + word + "() {"), L('console.log("' + word + '");', true), L("}"), L(word + "();")],
      { code: new RegExp("function\\s+" + word + "\\s*\\("), line: word },
      word
    );
  });
  [["cheer", "reef"], ["greet", "sam"], ["shout", "go"], ["call", "fin"], ["hail", "nemo"], ["sayhi", "otter"]].forEach(function (pair) {
    add(
      "Make a function " + pair[0] + " that prints the name you give it.",
      true,
      [L("function " + pair[0] + "(name) {"), L("console.log(name);", true), L("}"), L(pair[0] + '("' + pair[1] + '");')],
      { code: new RegExp("function\\s+" + pair[0] + "\\s*\\("), line: pair[1] },
      pair[1]
    );
  });

  [
    ["crab", "eel"], ["whale", "shark"], ["sand", "shell"],
    ["blue", "teal"], ["fin", "bubbles"], ["kelp", "coral"],
  ].forEach(function (pair) {
    add(
      "Make a list pets and log the first word " + pair[0] + ".",
      true,
      [L('let pets = ["' + pair[0] + '", "' + pair[1] + '"];'), L("console.log(pets[0]);")],
      { code: /pets\s*\[\s*0\s*\]/, line: pair[0] },
      pair[0]
    );
    add(
      "Loop through the list and log " + pair[0] + " and " + pair[1] + ".",
      true,
      [L('let pets = ["' + pair[0] + '", "' + pair[1] + '"];'), L("for (let pet of pets) {"), L("console.log(pet);", true), L("}")],
      { code: /for\s*\(\s*let\s+\w+\s+of\s+pets/, line: [pair[0], pair[1]] },
      pair[0] + " and " + pair[1]
    );
  });

  add("Save a hero name, then use if to print found.", true, [L('let hero = "Fin";'), L("console.log(hero);"), L('if (hero == "Fin") {'), L('console.log("found");', true), L("}")], { code: /\bif\b/, line: "found" }, "found");
  add("Add 1 to a number and print it.", true, [L("let waves = 3;"), L("console.log(waves + 1);")], { code: /waves\s*\+\s*1/, line: "4" }, "4");
  add("Take 2 away from a score and print it.", true, [L("let score = 9;"), L("console.log(score - 2);")], { code: /score\s*-\s*2/, line: "7" }, "7");
  add("Use a function and a variable together.", true, [L('let pet = "crab";'), L("function show() {"), L('console.log("ready");', true), L("}"), L("show();"), L("console.log(pet);")], { code: /function\s+show\s*\(/, line: ["ready", "crab"] }, "ready and crab");
  add("Loop 2 times and also print a title.", true, [L('console.log("Title");'), L("for (let i = 1; i <= 2; i++) {"), L('console.log("go");', true), L("}")], { code: /for\s*\(/, contains: "title", minCount: { line: "go", n: 2 } }, "Title and go go");
  add("If a score is big, print pass.", true, [L("let score = 10;"), L("if (score > 5) {"), L('console.log("pass");', true), L("}"), L("else {"), L('console.log("try");', true), L("}")], { code: /\bif\b/, line: "pass" }, "pass");
  add("Make two functions and run both.", true, [L("function ping() {"), L('console.log("ping");', true), L("}"), L("function pong() {"), L('console.log("pong");', true), L("}"), L("ping();"), L("pong();")], { code: /function\s+ping\s*\(/, line: ["ping", "pong"] }, "ping and pong");
  add("Print a name, then loop the word splash twice.", true, [L('console.log("Fin");'), L("for (let i = 1; i <= 2; i++) {"), L('console.log("splash");', true), L("}")], { code: /for\s*\(/, line: "fin", minCount: { line: "splash", n: 2 } }, "Fin and splash");
  add("Remember two names and print both.", true, [L('let one = "crab";'), L('let two = "eel";'), L("console.log(one);"), L("console.log(two);")], { line: ["crab", "eel"] }, "crab and eel");
  add("Count with a loop from 1 to 2, then print done.", true, [L("for (let i = 1; i <= 2; i++) {"), L("console.log(i);", true), L("}"), L('console.log("done");')], { code: /for\s*\(/, line: ["1", "2"], contains: "done" }, "1, 2, and done");

  const padWords = ["pearl", "kelp", "otter", "foam", "tide", "cove", "pier", "gull", "dune", "mist"];
  let pad = 0;
  while (list.length < 100) {
    const word = padWords[pad % padWords.length] + (pad >= padWords.length ? String(pad) : "");
    pad += 1;
    add("Print the extra word " + word + ".", false, [L('console.log("' + word + '");')], { contains: word }, word);
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
    title: "Ocean story",
    blurb: "A long story with a name, math, if, a loop, and a function.",
    plan: ["Print a title and two story lines.", "Save a hero and say hello.", "Count waves, then use if, a loop, and a function."],
    steps: buildJsSteps("Project step", [
      { goal: "Print a story title.", fresh: true, lines: [L('console.log("Ocean Story");')], spec: { contains: "ocean story" }, see: "Ocean Story" },
      { goal: "Add a story line.", lines: [L('console.log("A fish swam out.");')], spec: { minLines: 2 }, see: "A fish swam out." },
      { goal: "Add a blue-water line.", lines: [L('console.log("The water was blue.");')], spec: { minLines: 3 }, see: "The water was blue." },
      { goal: "Save the hero name Fin.", lines: [L('let hero = "Fin";')], spec: { code: /hero\s*=\s*["']Fin["']/ }, see: "your old story lines" },
      { goal: "Print the hero name.", lines: [L("console.log(hero);")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Say hello to the hero.", lines: [L('console.log("Hello " + hero);')], spec: { contains: "hello fin" }, see: "Hello Fin" },
      { goal: "Save the number of waves.", lines: [L("let waves = 3;")], spec: { code: /waves\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print how many waves.", lines: [L("console.log(waves);")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than the waves.", lines: [L("console.log(waves + 1);")], spec: { line: "4" }, see: "4" },
      { goal: "If waves are more than 2, print big.", lines: [L("if (waves > 2) {"), L('console.log("big");', true), L("}")], spec: { code: /\bif\b/, line: "big" }, see: "big" },
      { goal: "Add the other path, else.", lines: [L("else {"), L('console.log("calm");', true), L("}")], spec: { code: /\belse\b/ }, see: "big still, because 3 is more than 2", note: "Click after the } that closes the if." },
      { goal: "Save a friend name.", lines: [L('let friend = "Bubbles";')], spec: { code: /friend\s*=/ }, see: "your old lines" },
      { goal: "Print the friend.", lines: [L("console.log(friend);")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Loop to print 1, 2, 3.", lines: [L("for (let i = 1; i <= 3; i++) {"), L("console.log(i);", true), L("}")], spec: { code: /for\s*\(/, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "Make a cheer function.", lines: [L("function cheer() {"), L('console.log("yay");', true), L("}")], spec: { code: /function\s+cheer\s*\(/ }, see: "your old lines" },
      { goal: "Run the cheer function.", lines: [L("cheer();")], spec: { line: "yay" }, see: "yay" },
      { goal: "Print The end.", lines: [L('console.log("The end");')], spec: { contains: "the end" }, see: "The end" },
      { goal: "Print You did it!", lines: [L('console.log("You did it!");')], spec: { contains: "you did it" }, see: "You did it!" },
    ]),
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Name two fish, count them, and cheer.",
    plan: ["Print a title and save two names.", "Say hello to each name.", "Count, compare, loop, and cheer."],
    steps: buildJsSteps("Project step", [
      { goal: "Print a title.", fresh: true, lines: [L('console.log("Fish Names");')], spec: { contains: "fish names" }, see: "Fish Names" },
      { goal: "Save the name Bubbles.", lines: [L('let name = "Bubbles";')], spec: { code: /name\s*=\s*["']Bubbles["']/ }, see: "the title" },
      { goal: "Print the name.", lines: [L("console.log(name);")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Say hello to the name.", lines: [L('console.log("Hello " + name);')], spec: { contains: "hello bubbles" }, see: "Hello Bubbles" },
      { goal: "Save a friend name.", lines: [L('let friend = "Coral";')], spec: { code: /friend\s*=\s*["']Coral["']/ }, see: "your old lines" },
      { goal: "Print the friend.", lines: [L("console.log(friend);")], spec: { line: "coral" }, see: "Coral" },
      { goal: "Say meet the friend.", lines: [L('console.log("Meet " + friend);')], spec: { contains: "meet coral" }, see: "Meet Coral" },
      { goal: "Save the number 2.", lines: [L("let count = 2;")], spec: { code: /count\s*=\s*2/ }, see: "your old lines" },
      { goal: "Print the count.", lines: [L("console.log(count);")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than the count.", lines: [L("console.log(count + 1);")], spec: { line: "3" }, see: "3" },
      { goal: "If count is more than 1, print many.", lines: [L("if (count > 1) {"), L('console.log("many");', true), L("}")], spec: { code: /\bif\b/, line: "many" }, see: "many" },
      { goal: "Add else.", lines: [L("else {"), L('console.log("one");', true), L("}")], spec: { code: /\belse\b/ }, see: "many still", note: "Click after the } that closes the if." },
      { goal: "Loop two times and print hi.", lines: [L("for (let i = 1; i <= 2; i++) {"), L('console.log("hi");', true), L("}")], spec: { code: /for\s*\(/, minCount: { line: "hi", n: 2 } }, see: "hi twice" },
      { goal: "Print both names again.", lines: [L("console.log(name);"), L("console.log(friend);")], spec: { minCount: { line: "bubbles", n: 1 } }, see: "Bubbles and Coral" },
      { goal: "Make a splash function.", lines: [L("function yay() {"), L('console.log("splash");', true), L("}")], spec: { code: /function\s+yay\s*\(/ }, see: "your old lines" },
      { goal: "Run yay.", lines: [L("yay();")], spec: { line: "splash" }, see: "splash" },
      { goal: "Print All named!", lines: [L('console.log("All named!");')], spec: { contains: "all named" }, see: "All named!" },
      { goal: "Print a goodbye line.", lines: [L('console.log("Bye fish!");')], spec: { contains: "bye fish" }, see: "Bye fish!" },
    ]),
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question, save the answer, and keep a score.",
    plan: ["Print a question and save the answer.", "Use a score and math.", "Use if, a loop, and a function to finish."],
    steps: buildJsSteps("Project step", [
      { goal: "Print Quiz Time.", fresh: true, lines: [L('console.log("Quiz Time");')], spec: { contains: "quiz time" }, see: "Quiz Time" },
      { goal: "Print a question.", lines: [L('console.log("How many arms does a starfish have?");')], spec: { contains: "?" }, see: "the question" },
      { goal: "Save the answer 5.", lines: [L('let answer = "5";')], spec: { code: /answer\s*=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("console.log(answer);")], spec: { line: "5" }, see: "5" },
      { goal: "Print The answer is plus the answer.", lines: [L('console.log("The answer is " + answer);')], spec: { contains: "the answer is 5" }, see: "The answer is 5" },
      { goal: "Save let score = 10;.", lines: [L("let score = 10;")], spec: { code: /score\s*=\s*10/ }, see: "your old lines" },
      { goal: "Print the score.", lines: [L("console.log(score);")], spec: { line: "10" }, see: "10" },
      { goal: "Print score minus 2.", lines: [L("console.log(score - 2);")], spec: { line: "8" }, see: "8" },
      { goal: "If score is more than 5, print pass.", lines: [L("if (score > 5) {"), L('console.log("pass");', true), L("}")], spec: { code: /\bif\b/, line: "pass" }, see: "pass" },
      { goal: "Add else.", lines: [L("else {"), L('console.log("try again");', true), L("}")], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the } that closes the if." },
      { goal: "Save let bonus = 1;.", lines: [L("let bonus = 1;")], spec: { code: /bonus\s*=\s*1/ }, see: "your old lines" },
      { goal: "Print the bonus.", lines: [L("console.log(bonus);")], spec: { line: "1" }, see: "1" },
      { goal: "Loop 1 and 2.", lines: [L("for (let i = 1; i <= 2; i++) {"), L("console.log(i);", true), L("}")], spec: { code: /for\s*\(/, line: ["1", "2"] }, see: "1 and 2" },
      { goal: "Print a fact.", lines: [L('console.log("five arms");')], spec: { contains: "five arms" }, see: "five arms" },
      { goal: "Print another fact.", lines: [L('console.log("lives in the sea");')], spec: { contains: "lives in the sea" }, see: "lives in the sea" },
      { goal: "Make a done function.", lines: [L("function done() {"), L('console.log("quiz done");', true), L("}")], spec: { code: /function\s+done\s*\(/ }, see: "your old lines" },
      { goal: "Run done.", lines: [L("done();")], spec: { contains: "quiz done" }, see: "quiz done" },
      { goal: "Print You finished the quiz!", lines: [L('console.log("You finished the quiz!");')], spec: { contains: "you finished the quiz" }, see: "You finished the quiz!" },
    ]),
  },
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ocean adventure",
    blurb: "A hero, a counting loop, and a victory function.",
    plan: ["Name the hero.", "Count and loop.", "Finish with a function."],
    steps: buildJsSteps("Advanced step", [
      { goal: "Print Ocean Adventure.", fresh: true, lines: [L('console.log("Ocean Adventure");')], spec: { contains: "ocean adventure" }, see: "Ocean Adventure" },
      { goal: "Save hero Fin.", lines: [L('let hero = "Fin";')], spec: { code: /hero\s*=/ }, see: "the title" },
      { goal: "Print the hero.", lines: [L("console.log(hero);")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Print Go plus the hero.", lines: [L('console.log("Go " + hero);')], spec: { contains: "go fin" }, see: "Go Fin" },
      { goal: "Save let hearts = 3;.", lines: [L("let hearts = 3;")], spec: { code: /hearts\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print hearts.", lines: [L("console.log(hearts);")], spec: { line: "3" }, see: "3" },
      { goal: "Loop to print 1, 2, 3.", lines: [L("for (let i = 1; i <= 3; i++) {"), L("console.log(i);", true), L("}")], spec: { code: /for\s*\(/, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "If hearts are more than 2, print strong.", lines: [L("if (hearts > 2) {"), L('console.log("strong");', true), L("}")], spec: { code: /\bif\b/, line: "strong" }, see: "strong" },
      { goal: "Add else.", lines: [L("else {"), L('console.log("rest");', true), L("}")], spec: { code: /\belse\b/ }, see: "strong still", note: "Click after the } that closes the if." },
      { goal: "Save a pal name.", lines: [L('let pal = "Bubbles";')], spec: { code: /pal\s*=/ }, see: "your old lines" },
      { goal: "Print the pal.", lines: [L("console.log(pal);")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Make win and run it.", lines: [L("function win() {"), L('console.log("You win!");', true), L("}"), L("win();")], spec: { code: /function\s+win\s*\(/, contains: "you win" }, see: "You win!" },
    ]),
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "A harder question, a score, and a clap function.",
    plan: ["Ask and answer.", "Do score math.", "Clap at the end."],
    steps: buildJsSteps("Advanced step", [
      { goal: "Print Hard Quiz.", fresh: true, lines: [L('console.log("Hard Quiz");')], spec: { contains: "hard quiz" }, see: "Hard Quiz" },
      { goal: "Print a math question.", lines: [L('console.log("What is 2 + 3?");')], spec: { contains: "2 + 3" }, see: "What is 2 + 3?" },
      { goal: "Save answer 5.", lines: [L('let answer = "5";')], spec: { code: /answer\s*=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("console.log(answer);")], spec: { line: "5" }, see: "5" },
      { goal: "Save let points = 10;.", lines: [L("let points = 10;")], spec: { code: /points\s*=\s*10/ }, see: "your old lines" },
      { goal: "Print the points.", lines: [L("console.log(points);")], spec: { line: "10" }, see: "10" },
      { goal: "Print points minus 1.", lines: [L("console.log(points - 1);")], spec: { line: "9" }, see: "9" },
      { goal: "If points are more than 8, print super.", lines: [L("if (points > 8) {"), L('console.log("super");', true), L("}")], spec: { code: /\bif\b/, line: "super" }, see: "super" },
      { goal: "Add else.", lines: [L("else {"), L('console.log("ok");', true), L("}")], spec: { code: /\belse\b/ }, see: "super still", note: "Click after the } that closes the if." },
      { goal: "Make a clap function.", lines: [L("function clap() {"), L('console.log("clap");', true), L("}")], spec: { code: /function\s+clap\s*\(/ }, see: "your old lines" },
      { goal: "Run clap.", lines: [L("clap();")], spec: { line: "clap" }, see: "clap" },
      { goal: "Print Quiz star!", lines: [L('console.log("Quiz star!");')], spec: { contains: "quiz star" }, see: "Quiz star!" },
    ]),
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "Three animals and a goodbye function.",
    plan: ["Print three animals.", "Save a name and a count.", "Finish the catalog."],
    steps: buildJsSteps("Advanced step", [
      { goal: "Print Sea Catalog.", fresh: true, lines: [L('console.log("Sea Catalog");')], spec: { contains: "sea catalog" }, see: "Sea Catalog" },
      { goal: "Print crab.", lines: [L('console.log("crab");')], spec: { line: "crab" }, see: "crab" },
      { goal: "Print eel.", lines: [L('console.log("eel");')], spec: { line: "eel" }, see: "eel" },
      { goal: "Print whale.", lines: [L('console.log("whale");')], spec: { line: "whale" }, see: "whale" },
      { goal: "Save first = crab.", lines: [L('let first = "crab";')], spec: { code: /first\s*=\s*["']crab["']/ }, see: "your old lines" },
      { goal: "Print first.", lines: [L("console.log(first);")], spec: { minCount: { line: "crab", n: 2 } }, see: "crab again" },
      { goal: "Save let count = 3;.", lines: [L("let count = 3;")], spec: { code: /count\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print the count.", lines: [L("console.log(count);")], spec: { line: "3" }, see: "3" },
      { goal: "Loop the word swim twice.", lines: [L("for (let i = 1; i <= 2; i++) {"), L('console.log("swim");', true), L("}")], spec: { code: /for\s*\(/, minCount: { line: "swim", n: 2 } }, see: "swim twice" },
      { goal: "If count is 3, print full tank.", lines: [L("if (count == 3) {"), L('console.log("full tank");', true), L("}")], spec: { code: /\bif\b/, contains: "full tank" }, see: "full tank" },
      { goal: "Add else.", lines: [L("else {"), L('console.log("more");', true), L("}")], spec: { code: /\belse\b/ }, see: "full tank still", note: "Click after the } that closes the if." },
      { goal: "Make bye and run it.", lines: [L("function bye() {"), L('console.log("catalog done");', true), L("}"), L("bye();")], spec: { code: /function\s+bye\s*\(/, contains: "catalog done" }, see: "catalog done" },
    ]),
  },
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
