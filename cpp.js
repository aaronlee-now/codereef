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

function numbered(lines) {
  const parts = [];
  for (let n = 0; n < lines.length; n += 1) {
    parts.push(n + 1 + ". " + lines[n]);
  }
  return parts.join(" ");
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

function explainCppLine(line) {
  const t = String(line || "").trim();
  let m = t.match(/^cout\s*<<\s*"([^"]*)"\s*<<\s*endl;$/);
  if (m) {
    return (
      'Type cout << "' +
      m[1] +
      '" << endl; cout prints. << means send this to the screen. Type cout, a space, <<, a space, a quote ", ' +
      m[1] +
      ', a quote ", a space, <<, a space, endl, then a semicolon ; . endl ends the line.'
    );
  }
  m = t.match(/^cout\s*<<\s*"([^"]*)"\s*<<\s*([A-Za-z_][A-Za-z0-9_]*)\s*<<\s*endl;$/);
  if (m) {
    return (
      'Type cout << "' +
      m[1] +
      '" << ' +
      m[2] +
      " << endl; First send the words in quotes, then <<, then " +
      m[2] +
      " with no quotes, then << endl; . A semicolon ; ends the line."
    );
  }
  m = t.match(/^cout\s*<<\s*([A-Za-z_][A-Za-z0-9_]*)\s*<<\s*endl;$/);
  if (m) {
    return (
      "Type cout << " +
      m[1] +
      " << endl; Type cout, a space, <<, a space, " +
      m[1] +
      " with no quotes, a space, <<, a space, endl, then a semicolon ; ."
    );
  }
  m = t.match(/^cout\s*<<\s*(.+)\s*<<\s*endl;$/);
  if (m) {
    return (
      "Type cout << " +
      m[1] +
      " << endl; That sends " +
      m[1] +
      " to the screen. End with a semicolon ; ."
    );
  }
  m = t.match(/^string\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)";$/);
  if (m) {
    return (
      'Type string ' +
      m[1] +
      ' = "' +
      m[2] +
      '"; string means words. A variable is a name that remembers a word. Type string, a space, ' +
      m[1] +
      ", a space, =, a space, a quote, " +
      m[2] +
      ", a quote, then a semicolon ; ."
    );
  }
  m = t.match(/^int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+);$/);
  if (m) {
    return (
      "Type int " +
      m[1] +
      " = " +
      m[2] +
      "; int means a whole number. Type int, a space, " +
      m[1] +
      ", a space, =, a space, " +
      m[2] +
      ", then a semicolon ; . No quotes."
    );
  }
  m = t.match(
    /^for\s*\(\s*int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\d+)\s*;\s*\1\s*(<=|<)\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{$/
  );
  if (m) {
    return (
      "Type " +
      t +
      " A loop repeats. Type for, a space, (, int, a space, " +
      m[1] +
      " = " +
      m[2] +
      ", a semicolon ;, a space, " +
      m[1] +
      " " +
      m[3] +
      " " +
      m[4] +
      ", a semicolon ;, a space, " +
      m[1] +
      "++, ), a space, then { . { opens the loop."
    );
  }
  m = t.match(/^if\s*\((.+)\)\s*\{$/);
  if (m) {
    return "Type " + t + " if picks a path. Type if, a space, (, " + m[1] + ", ), a space, then { .";
  }
  if (t === "else {") return "Type else { . else is the other path. { opens that path.";
  if (t === "}") return "Type } . This curly brace } closes the block that started with { .";
  m = t.match(/^void\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{$/);
  if (m) {
    return (
      "Type " +
      t +
      " void starts a function. A function is a named recipe. Type void, a space, " +
      m[1] +
      ", (, " +
      (m[2] || "nothing") +
      ", ), a space, then { ."
    );
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\("([^"]*)"\);$/);
  if (m) {
    return (
      "Type " +
      m[1] +
      '("' +
      m[2] +
      '"); This runs the recipe. Type ' +
      m[1] +
      ", (, a quote, " +
      m[2] +
      ", a quote, ), then a semicolon ; ."
    );
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\(\);$/);
  if (m) {
    return "Type " + m[1] + "(); This runs the recipe. Type " + m[1] + ", (, ), then a semicolon ; .";
  }
  return "Type this exactly: " + t;
}

function helpForLines(fresh, lines, see, note) {
  const steps = [];
  if ((fresh)) {
    steps.push("Start fresh. Click in the code box, highlight the old code, and press Delete.");
  } else {
    steps.push("Keep your old code. Do not erase it.");
  }
  steps.push(fresh ? "Click in the empty code box." : "Click in the code box at the end of the last line.");
  if (note) steps.push(note);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    let where = "";
    if (!fresh && i === 0) where = "Press the Enter key for a new line. ";
    else if (i > 0) where = "Press the Enter key. ";
    if (line.indent) where += "Press the space bar 2 times so this line sits inside the curly braces. ";
    else if (i > 0 && lines[i - 1].indent) where += "Press Backspace until this line starts at the left edge. ";
    steps.push(where + explainCppLine(line.text));
  }
  steps.push("Press the Run button." + (see ? " You should see " + see + ". Old lines can stay. That is OK." : ""));
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

const tasks = (function buildCppTasks() {
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

  add("Make C++ say Hello, ocean!", true, [L('cout << "Hello, ocean!" << endl;')], { contains: "hello, ocean!" }, "Hello, ocean!");
  list[0].help = numbered([
    "Keep the line you already have. Do not erase the whole line.",
    "Click in the code box on the word reef.",
    "Delete the letters r e e f. Type the word ocean in that same spot.",
    'The line should look like this: cout << "Hello, ocean!" << endl;',
    'That is cout, then <<, then (, then a quote ", then Hello, ocean!, then a quote ", then ), then a semicolon ; . A semicolon ends the line.',
    "Press the Run button. You should see Hello, ocean!",
  ]);

  add(
    "Print two lines — Hello, ocean! then I love C++!",
    false,
    [L('cout << "I love C++!" << endl;')],
    { contains: ["hello, ocean!", "i love c++!"] },
    "I love C++!",
    'cout << "Hello, ocean!" << endl;\ncout << "I love C++!" << endl;\n'
  );
  add(
    'Make a variable string fish = "clownfish"; and print it.',
    false,
    [L('string fish = "clownfish";'), L("cout << fish << endl;")],
    { code: /fish\s*=\s*["']clownfish["']/, line: "clownfish" },
    "clownfish"
  );
  add(
    "Use a for loop to print 1, then 2, then 3.",
    true,
    [L("for (int i = 1; i <= 3; i++) {"), L("cout << i << endl;", true), L("}")],
    { code: /for\s*\(\s*int/, line: ["1", "2", "3"] },
    "1 then 2 then 3"
  );
  add("Print the number 5.", true, [L("cout << 5 << endl;")], { line: "5" }, "5");
  add(
    'Make string coral = "reef"; and print it.',
    false,
    [L('string coral = "reef";'), L("cout << coral << endl;")],
    { code: /coral\s*=\s*["']reef["']/, line: "reef" },
    "reef"
  );
  add(
    "Loop to print splash three times.",
    true,
    [L("for (int i = 1; i <= 3; i++) {"), L('cout << "splash" << endl;', true), L("}")],
    { code: /for\s*\(\s*int/, minCount: { line: "splash", n: 3 } },
    "splash three times"
  );

  ["bubble", "wave", "crab", "dolphin", "turtle", "coral", "sand", "shell", "whale", "shark", "starfish", "eel"].forEach(function (word) {
    add("Print the word " + word + ".", false, [L('cout << "' + word + '" << endl;')], { contains: word }, word);
  });

  [
    ["pet", "crab"], ["boat", "blue"], ["hero", "Fin"], ["snack", "kelp"],
    ["home", "reef"], ["friend", "Nemo"], ["color", "teal"], ["toy", "shell"],
    ["pal", "otter"], ["ride", "wave"], ["team", "pods"], ["gem", "pearl"],
  ].forEach(function (pair) {
    add(
      'Make ' + pair[0] + ' = "' + pair[1] + '" and print it.',
      false,
      [L('string ' + pair[0] + ' = "' + pair[1] + '";'), L("cout << " + pair[0] + " << endl;")],
      { code: new RegExp(pair[0] + "\\s*=\\s*[\"']" + pair[1] + "[\"']", "i"), line: pair[1].toLowerCase() },
      pair[1]
    );
  });

  [["2 + 3", "5"], ["4 + 1", "5"], ["10 - 3", "7"], ["8 - 2", "6"], ["2 * 3", "6"], ["4 * 2", "8"], ["1 + 6", "7"], ["9 - 4", "5"], ["3 * 3", "9"], ["5 + 5", "10"]].forEach(function (row) {
    add("Print the math " + row[0] + ".", true, [L("cout << " + row[0] + " << endl;")], { line: row[1], code: /cout\s*<</ }, row[1]);
  });

  ["splash", "bubble", "yay", "hi", "wave", "go"].forEach(function (word) {
    add(
      'Use a loop to print "' + word + '" three times.',
      true,
      [L("for (int i = 1; i <= 3; i++) {"), L('cout << "' + word + '" << endl;', true), L("}")],
      { code: /for\s*\(\s*int/, minCount: { line: word, n: 3 } },
      word + " three times"
    );
  });
  [["1", "<=", "3", ["1", "2", "3"]], ["1", "<=", "4", ["1", "2", "3", "4"]], ["0", "<", "3", ["0", "1", "2"]], ["2", "<=", "4", ["2", "3", "4"]], ["1", "<=", "5", ["1", "2", "3", "4", "5"]], ["4", "<=", "6", ["4", "5", "6"]]].forEach(function (row) {
    add(
      "Use a loop to print " + row[3].join(", then ") + ".",
      true,
      [L("for (int i = " + row[0] + "; i " + row[1] + " " + row[2] + "; i++) {"), L("cout << i << endl;", true), L("}")],
      { code: /for\s*\(\s*int/, line: row[3] },
      row[3].join(" then ")
    );
  });

  [["9", ">", "5", "big", "small", "big"], ["1", ">", "5", "big", "small", "small"], ["8", ">", "3", "yes", "no", "yes"], ["2", "<", "4", "low", "high", "low"], ["10", ">", "7", "tall", "short", "tall"], ["0", ">", "2", "hot", "cold", "cold"], ["6", ">", "6", "same", "notyet", "notyet"], ["4", "<", "9", "ok", "nope", "ok"], ["3", ">", "1", "swim", "rest", "swim"], ["5", "<", "5", "up", "down", "down"], ["7", ">", "2", "pass", "try", "pass"], ["1", "<", "1", "a", "b", "b"]].forEach(function (row) {
    add(
      "Use if and else so the path prints " + row[5] + ".",
      true,
      [L("int score = " + row[0] + ";"), L("if (score " + row[1] + " " + row[2] + ") {"), L('cout << "' + row[3] + '" << endl;', true), L("}"), L("else {"), L('cout << "' + row[4] + '" << endl;', true), L("}")],
      { code: /\bif\b[\s\S]*\belse\b/, line: row[5] },
      row[5]
    );
  });

  ["wave", "splash", "hi", "yay", "wow", "go", "pop"].forEach(function (word) {
    add(
      "Make a function " + word + " that prints " + word + ", then run it.",
      true,
      [L("void " + word + "() {"), L('cout << "' + word + '" << endl;', true), L("}"), L(word + "();")],
      { code: new RegExp("void\\s+" + word + "\\s*\\("), line: word },
      word
    );
  });
  [["cheer", "reef"], ["greet", "sam"], ["shout", "go"], ["call", "fin"], ["hail", "nemo"], ["sayhi", "otter"]].forEach(function (pair) {
    add(
      "Make a function " + pair[0] + " that prints the name you give it.",
      true,
      [L("void " + pair[0] + "(name) {"), L("cout << name << endl;", true), L("}"), L(pair[0] + '("' + pair[1] + '");')],
      { code: new RegExp("void\\s+" + pair[0] + "\\s*\\("), line: pair[1] },
      pair[1]
    );
  });

  [
    ["Sam", "Hello "], ["Fin", "Go "], ["Nemo", "Hi "], ["Otter", "Meet "],
    ["Coral", "Hey "], ["Bubbles", "Yay "], ["Reef", "See "], ["Kelp", "Eat "],
    ["Pearl", "Find "], ["Tide", "Ride "], ["Cove", "Love "], ["Pier", "Near "],
  ].forEach(function (pair) {
    add(
      'Stick "' + pair[1] + '" onto the name ' + pair[0] + ".",
      true,
      [L('string name = "' + pair[0] + '";'), L('cout << "' + pair[1] + '" << name << endl;')],
      { contains: (pair[1] + pair[0]).toLowerCase() },
      pair[1] + pair[0]
    );
  });

  add("Save a hero name, then use if to print found.", true, [L('string hero = "Fin";'), L("cout << hero << endl;"), L('if (hero == "Fin") {'), L('cout << "found" << endl;', true), L("}")], { code: /\bif\b/, line: "found" }, "found");
  add("Add 1 to a number and print it.", true, [L("int waves = 3;"), L("cout << waves + 1 << endl;")], { code: /waves\s*\+\s*1/, line: "4" }, "4");
  add("Take 2 away from a score and print it.", true, [L("int score = 9;"), L("cout << score - 2 << endl;")], { code: /score\s*-\s*2/, line: "7" }, "7");
  add("Use a function and a variable together.", true, [L('string pet = "crab";'), L("void show() {"), L('cout << "ready" << endl;', true), L("}"), L("show();"), L("cout << pet << endl;")], { code: /void\s+show\s*\(/, line: ["ready", "crab"] }, "ready and crab");
  add("Loop 2 times and also print a title.", true, [L('cout << "Title" << endl;'), L("for (int i = 1; i <= 2; i++) {"), L('cout << "go" << endl;', true), L("}")], { code: /for\s*\(\s*int/, contains: "title", minCount: { line: "go", n: 2 } }, "Title and go go");
  add("If a score is big, print pass.", true, [L("int score = 10;"), L("if (score > 5) {"), L('cout << "pass" << endl;', true), L("}"), L("else {"), L('cout << "try" << endl;', true), L("}")], { code: /\bif\b/, line: "pass" }, "pass");
  add("Make two functions and run both.", true, [L("void ping() {"), L('cout << "ping" << endl;', true), L("}"), L("void pong() {"), L('cout << "pong" << endl;', true), L("}"), L("ping();"), L("pong();")], { code: /void\s+ping\s*\(/, line: ["ping", "pong"] }, "ping and pong");
  add("Print a name, then loop the word splash twice.", true, [L('cout << "Fin" << endl;'), L("for (int i = 1; i <= 2; i++) {"), L('cout << "splash" << endl;', true), L("}")], { code: /for\s*\(\s*int/, line: "fin", minCount: { line: "splash", n: 2 } }, "Fin and splash");
  add("Remember two names and print both.", true, [L('string one = "crab";'), L('string two = "eel";'), L("cout << one << endl;"), L("cout << two << endl;")], { line: ["crab", "eel"] }, "crab and eel");
  add("Count with a loop from 1 to 2, then print done.", true, [L("for (int i = 1; i <= 2; i++) {"), L("cout << i << endl;", true), L("}"), L('cout << "done" << endl;')], { code: /for\s*\(\s*int/, line: ["1", "2"], contains: "done" }, "1, 2, and done");

  const padWords = ["pearl", "kelp", "otter", "foam", "tide", "cove", "pier", "gull", "dune", "mist"];
  let pad = 0;
  while (list.length < 100) {
    const word = padWords[pad % padWords.length] + (pad >= padWords.length ? String(pad) : "");
    pad += 1;
    add("Print the extra word " + word + ".", false, [L('cout << "' + word + '" << endl;')], { contains: word }, word);
  }
  return list;
})();

function buildCppSteps(prefix, rows) {
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
    steps: buildCppSteps("Project step", [
      { goal: "Print a story title.", fresh: true, lines: [L('cout << "Ocean Story" << endl;')], spec: { contains: "ocean story" }, see: "Ocean Story" },
      { goal: "Add a story line.", lines: [L('cout << "A fish swam out." << endl;')], spec: { minLines: 2 }, see: "A fish swam out." },
      { goal: "Add a blue-water line.", lines: [L('cout << "The water was blue." << endl;')], spec: { minLines: 3 }, see: "The water was blue." },
      { goal: "Save the hero name Fin.", lines: [L('string hero = "Fin";')], spec: { code: /hero\s*=\s*["']Fin["']/ }, see: "your old story lines" },
      { goal: "Print the hero name.", lines: [L("cout << hero << endl;")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Say hello to the hero.", lines: [L('cout << "Hello " << hero << endl;')], spec: { contains: "hello fin" }, see: "Hello Fin" },
      { goal: "Save the number of waves.", lines: [L("int waves = 3;")], spec: { code: /waves\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print how many waves.", lines: [L("cout << waves << endl;")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than the waves.", lines: [L("cout << waves + 1 << endl;")], spec: { line: "4" }, see: "4" },
      { goal: "If waves are more than 2, print big.", lines: [L("if (waves > 2) {"), L('cout << "big" << endl;', true), L("}")], spec: { code: /\bif\b/, line: "big" }, see: "big" },
      { goal: "Add the other path, else.", lines: [L("else {"), L('cout << "calm" << endl;', true), L("}")], spec: { code: /\belse\b/ }, see: "big still, because 3 is more than 2", note: "Click after the } that closes the if." },
      { goal: "Save a friend name.", lines: [L('string friend = "Bubbles";')], spec: { code: /friend\s*=/ }, see: "your old lines" },
      { goal: "Print the friend.", lines: [L("cout << friend << endl;")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Loop to print 1, 2, 3.", lines: [L("for (int i = 1; i <= 3; i++) {"), L("cout << i << endl;", true), L("}")], spec: { code: /for\s*\(\s*int/, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "Make a cheer function.", lines: [L("void cheer() {"), L('cout << "yay" << endl;', true), L("}")], spec: { code: /void\s+cheer\s*\(/ }, see: "your old lines" },
      { goal: "Run the cheer function.", lines: [L("cheer();")], spec: { line: "yay" }, see: "yay" },
      { goal: "Print The end.", lines: [L('cout << "The end" << endl;')], spec: { contains: "the end" }, see: "The end" },
      { goal: "Print You did it!", lines: [L('cout << "You did it!" << endl;')], spec: { contains: "you did it" }, see: "You did it!" },
    ]),
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Name two fish, count them, and cheer.",
    plan: ["Print a title and save two names.", "Say hello to each name.", "Count, compare, loop, and cheer."],
    steps: buildCppSteps("Project step", [
      { goal: "Print a title.", fresh: true, lines: [L('cout << "Fish Names" << endl;')], spec: { contains: "fish names" }, see: "Fish Names" },
      { goal: "Save the name Bubbles.", lines: [L('string name = "Bubbles";')], spec: { code: /name\s*=\s*["']Bubbles["']/ }, see: "the title" },
      { goal: "Print the name.", lines: [L("cout << name << endl;")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Say hello to the name.", lines: [L('cout << "Hello " << name << endl;')], spec: { contains: "hello bubbles" }, see: "Hello Bubbles" },
      { goal: "Save a friend name.", lines: [L('string friend = "Coral";')], spec: { code: /friend\s*=\s*["']Coral["']/ }, see: "your old lines" },
      { goal: "Print the friend.", lines: [L("cout << friend << endl;")], spec: { line: "coral" }, see: "Coral" },
      { goal: "Say meet the friend.", lines: [L('cout << "Meet " << friend << endl;')], spec: { contains: "meet coral" }, see: "Meet Coral" },
      { goal: "Save the number 2.", lines: [L("int count = 2;")], spec: { code: /count\s*=\s*2/ }, see: "your old lines" },
      { goal: "Print the count.", lines: [L("cout << count << endl;")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than the count.", lines: [L("cout << count + 1 << endl;")], spec: { line: "3" }, see: "3" },
      { goal: "If count is more than 1, print many.", lines: [L("if (count > 1) {"), L('cout << "many" << endl;', true), L("}")], spec: { code: /\bif\b/, line: "many" }, see: "many" },
      { goal: "Add else.", lines: [L("else {"), L('cout << "one" << endl;', true), L("}")], spec: { code: /\belse\b/ }, see: "many still", note: "Click after the } that closes the if." },
      { goal: "Loop two times and print hi.", lines: [L("for (int i = 1; i <= 2; i++) {"), L('cout << "hi" << endl;', true), L("}")], spec: { code: /for\s*\(\s*int/, minCount: { line: "hi", n: 2 } }, see: "hi twice" },
      { goal: "Print both names again.", lines: [L("cout << name << endl;"), L("cout << friend << endl;")], spec: { minCount: { line: "bubbles", n: 1 } }, see: "Bubbles and Coral" },
      { goal: "Make a splash function.", lines: [L("void yay() {"), L('cout << "splash" << endl;', true), L("}")], spec: { code: /void\s+yay\s*\(/ }, see: "your old lines" },
      { goal: "Run yay.", lines: [L("yay();")], spec: { line: "splash" }, see: "splash" },
      { goal: "Print All named!", lines: [L('cout << "All named!" << endl;')], spec: { contains: "all named" }, see: "All named!" },
      { goal: "Print a goodbye line.", lines: [L('cout << "Bye fish!" << endl;')], spec: { contains: "bye fish" }, see: "Bye fish!" },
    ]),
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question, save the answer, and keep a score.",
    plan: ["Print a question and save the answer.", "Use a score and math.", "Use if, a loop, and a function to finish."],
    steps: buildCppSteps("Project step", [
      { goal: "Print Quiz Time.", fresh: true, lines: [L('cout << "Quiz Time" << endl;')], spec: { contains: "quiz time" }, see: "Quiz Time" },
      { goal: "Print a question.", lines: [L('cout << "How many arms does a starfish have?" << endl;')], spec: { contains: "?" }, see: "the question" },
      { goal: "Save the answer 5.", lines: [L('string answer = "5";')], spec: { code: /answer\s*=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("cout << answer << endl;")], spec: { line: "5" }, see: "5" },
      { goal: "Print The answer is plus the answer.", lines: [L('cout << "The answer is " << answer << endl;')], spec: { contains: "the answer is 5" }, see: "The answer is 5" },
      { goal: "Save int score = 10;.", lines: [L("int score = 10;")], spec: { code: /score\s*=\s*10/ }, see: "your old lines" },
      { goal: "Print the score.", lines: [L("cout << score << endl;")], spec: { line: "10" }, see: "10" },
      { goal: "Print score minus 2.", lines: [L("cout << score - 2 << endl;")], spec: { line: "8" }, see: "8" },
      { goal: "If score is more than 5, print pass.", lines: [L("if (score > 5) {"), L('cout << "pass" << endl;', true), L("}")], spec: { code: /\bif\b/, line: "pass" }, see: "pass" },
      { goal: "Add else.", lines: [L("else {"), L('cout << "try again" << endl;', true), L("}")], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the } that closes the if." },
      { goal: "Save int bonus = 1;.", lines: [L("int bonus = 1;")], spec: { code: /bonus\s*=\s*1/ }, see: "your old lines" },
      { goal: "Print the bonus.", lines: [L("cout << bonus << endl;")], spec: { line: "1" }, see: "1" },
      { goal: "Loop 1 and 2.", lines: [L("for (int i = 1; i <= 2; i++) {"), L("cout << i << endl;", true), L("}")], spec: { code: /for\s*\(\s*int/, line: ["1", "2"] }, see: "1 and 2" },
      { goal: "Print a fact.", lines: [L('cout << "five arms" << endl;')], spec: { contains: "five arms" }, see: "five arms" },
      { goal: "Print another fact.", lines: [L('cout << "lives in the sea" << endl;')], spec: { contains: "lives in the sea" }, see: "lives in the sea" },
      { goal: "Make a done function.", lines: [L("void done() {"), L('cout << "quiz done" << endl;', true), L("}")], spec: { code: /void\s+done\s*\(/ }, see: "your old lines" },
      { goal: "Run done.", lines: [L("done();")], spec: { contains: "quiz done" }, see: "quiz done" },
      { goal: "Print You finished the quiz!", lines: [L('cout << "You finished the quiz!" << endl;')], spec: { contains: "you finished the quiz" }, see: "You finished the quiz!" },
    ]),
  },
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ocean adventure",
    blurb: "A hero, a counting loop, and a victory function.",
    plan: ["Name the hero.", "Count and loop.", "Finish with a function."],
    steps: buildCppSteps("Advanced step", [
      { goal: "Print Ocean Adventure.", fresh: true, lines: [L('cout << "Ocean Adventure" << endl;')], spec: { contains: "ocean adventure" }, see: "Ocean Adventure" },
      { goal: "Save hero Fin.", lines: [L('string hero = "Fin";')], spec: { code: /hero\s*=/ }, see: "the title" },
      { goal: "Print the hero.", lines: [L("cout << hero << endl;")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Print Go plus the hero.", lines: [L('cout << "Go " << hero << endl;')], spec: { contains: "go fin" }, see: "Go Fin" },
      { goal: "Save int hearts = 3;.", lines: [L("int hearts = 3;")], spec: { code: /hearts\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print hearts.", lines: [L("cout << hearts << endl;")], spec: { line: "3" }, see: "3" },
      { goal: "Loop to print 1, 2, 3.", lines: [L("for (int i = 1; i <= 3; i++) {"), L("cout << i << endl;", true), L("}")], spec: { code: /for\s*\(\s*int/, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "If hearts are more than 2, print strong.", lines: [L("if (hearts > 2) {"), L('cout << "strong" << endl;', true), L("}")], spec: { code: /\bif\b/, line: "strong" }, see: "strong" },
      { goal: "Add else.", lines: [L("else {"), L('cout << "rest" << endl;', true), L("}")], spec: { code: /\belse\b/ }, see: "strong still", note: "Click after the } that closes the if." },
      { goal: "Save a pal name.", lines: [L('string pal = "Bubbles";')], spec: { code: /pal\s*=/ }, see: "your old lines" },
      { goal: "Print the pal.", lines: [L("cout << pal << endl;")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Make win and run it.", lines: [L("void win() {"), L('cout << "You win!" << endl;', true), L("}"), L("win();")], spec: { code: /void\s+win\s*\(/, contains: "you win" }, see: "You win!" },
    ]),
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "A harder question, a score, and a clap function.",
    plan: ["Ask and answer.", "Do score math.", "Clap at the end."],
    steps: buildCppSteps("Advanced step", [
      { goal: "Print Hard Quiz.", fresh: true, lines: [L('cout << "Hard Quiz" << endl;')], spec: { contains: "hard quiz" }, see: "Hard Quiz" },
      { goal: "Print a math question.", lines: [L('cout << "What is 2 + 3?" << endl;')], spec: { contains: "2 + 3" }, see: "What is 2 + 3?" },
      { goal: "Save answer 5.", lines: [L('string answer = "5";')], spec: { code: /answer\s*=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("cout << answer << endl;")], spec: { line: "5" }, see: "5" },
      { goal: "Save int points = 10;.", lines: [L("int points = 10;")], spec: { code: /points\s*=\s*10/ }, see: "your old lines" },
      { goal: "Print the points.", lines: [L("cout << points << endl;")], spec: { line: "10" }, see: "10" },
      { goal: "Print points minus 1.", lines: [L("cout << points - 1 << endl;")], spec: { line: "9" }, see: "9" },
      { goal: "If points are more than 8, print super.", lines: [L("if (points > 8) {"), L('cout << "super" << endl;', true), L("}")], spec: { code: /\bif\b/, line: "super" }, see: "super" },
      { goal: "Add else.", lines: [L("else {"), L('cout << "ok" << endl;', true), L("}")], spec: { code: /\belse\b/ }, see: "super still", note: "Click after the } that closes the if." },
      { goal: "Make a clap function.", lines: [L("void clap() {"), L('cout << "clap" << endl;', true), L("}")], spec: { code: /void\s+clap\s*\(/ }, see: "your old lines" },
      { goal: "Run clap.", lines: [L("clap();")], spec: { line: "clap" }, see: "clap" },
      { goal: "Print Quiz star!", lines: [L('cout << "Quiz star!" << endl;')], spec: { contains: "quiz star" }, see: "Quiz star!" },
    ]),
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "Three animals and a goodbye function.",
    plan: ["Print three animals.", "Save a name and a count.", "Finish the catalog."],
    steps: buildCppSteps("Advanced step", [
      { goal: "Print Sea Catalog.", fresh: true, lines: [L('cout << "Sea Catalog" << endl;')], spec: { contains: "sea catalog" }, see: "Sea Catalog" },
      { goal: "Print crab.", lines: [L('cout << "crab" << endl;')], spec: { line: "crab" }, see: "crab" },
      { goal: "Print eel.", lines: [L('cout << "eel" << endl;')], spec: { line: "eel" }, see: "eel" },
      { goal: "Print whale.", lines: [L('cout << "whale" << endl;')], spec: { line: "whale" }, see: "whale" },
      { goal: "Save first = crab.", lines: [L('string first = "crab";')], spec: { code: /first\s*=\s*["']crab["']/ }, see: "your old lines" },
      { goal: "Print first.", lines: [L("cout << first << endl;")], spec: { minCount: { line: "crab", n: 2 } }, see: "crab again" },
      { goal: "Save int count = 3;.", lines: [L("int count = 3;")], spec: { code: /count\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print the count.", lines: [L("cout << count << endl;")], spec: { line: "3" }, see: "3" },
      { goal: "Loop the word swim twice.", lines: [L("for (int i = 1; i <= 2; i++) {"), L('cout << "swim" << endl;', true), L("}")], spec: { code: /for\s*\(\s*int/, minCount: { line: "swim", n: 2 } }, see: "swim twice" },
      { goal: "If count is 3, print full tank.", lines: [L("if (count == 3) {"), L('cout << "full tank" << endl;', true), L("}")], spec: { code: /\bif\b/, contains: "full tank" }, see: "full tank" },
      { goal: "Add else.", lines: [L("else {"), L('cout << "more" << endl;', true), L("}")], spec: { code: /\belse\b/ }, see: "full tank still", note: "Click after the } that closes the if." },
      { goal: "Make bye and run it.", lines: [L("void bye() {"), L('cout << "catalog done" << endl;', true), L("}"), L("bye();")], spec: { code: /void\s+bye\s*\(/, contains: "catalog done" }, see: "catalog done" },
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

  const bin = splitTopOp(expr);
  if (bin && bin.left && bin.right) {
    const left = evalExpr(bin.left, vars);
    const right = evalExpr(bin.right, vars);
    if (bin.op === "+") return left + right;
    const ln = Number(left);
    const rn = Number(right);
    if (Number.isNaN(ln) || Number.isNaN(rn)) {
      throw new Error("Use + - or * with numbers, like int n = 2 + 3;");
    }
    if (bin.op === "-") return ln - rn;
    if (bin.op === "*") return ln * rn;
  }

  throw new Error("I don't understand: " + expr);
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
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if ((ch === "+" || ch === "*" || ch === "-") && c > 0) {
      const prev = expr[c - 1];
      if (ch === "-" && (prev === "+" || prev === "-" || prev === "*")) continue;
      return { left: expr.slice(0, c).trim(), op: ch, right: expr.slice(c + 1).trim() };
    }
  }
  return null;
}

function evalCond(cond, vars) {
  const text = String(cond || "").trim();
  const m = text.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!m) throw new Error("Try if (n > 5) { with a compare sign in the middle.");
  const left = evalExpr(m[1], vars);
  const right = evalExpr(m[3], vars);
  if (m[2] === "==") return left == right;
  if (m[2] === "!=") return left != right;
  if (m[2] === ">") return Number(left) > Number(right);
  if (m[2] === "<") return Number(left) < Number(right);
  if (m[2] === ">=") return Number(left) >= Number(right);
  if (m[2] === "<=") return Number(left) <= Number(right);
  return false;
}

function readBrace(lines, start) {
  const body = [];
  let i = start;
  let depth = 1;
  while (i < lines.length && depth > 0) {
    const bodyLine = stripComment(lines[i]).trim();
    i += 1;
    if (!bodyLine) continue;
    if (/\{\s*$/.test(bodyLine) && !/^\}/.test(bodyLine)) depth += 1;
    if (bodyLine === "}") {
      depth -= 1;
      if (depth === 0) break;
      continue;
    }
    if (depth === 1) body.push(bodyLine);
  }
  if (depth !== 0) throw new Error("This block needs a closing } brace.");
  return { body: body, next: i };
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
    if (/[+\-*]/.test(piece) && piece.indexOf('"') === -1 && piece.indexOf("'") === -1) {
      buf += String(evalExpr(piece, vars));
      return;
    }
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
  const funcs = Object.create(null);
  const output = [];
  let i = 0;

  function runBody(body, extra) {
    const local = Object.assign(Object.create(null), vars);
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        local[key] = extra[key];
      });
    }
    body.forEach(function (bodyLine) {
      runSimple(bodyLine, local, output);
    });
  }

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

    const funcMatch = line.match(
      /^void\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)?\s*\)\s*\{\s*$/
    );
    if (funcMatch && funcMatch[1] !== "main") {
      i += 1;
      const collected = readBrace(lines, i);
      i = collected.next;
      funcs[funcMatch[1]] = { param: funcMatch[2] || "", body: collected.body };
      continue;
    }

    const ifMatch = line.match(/^if\s*\((.+)\)\s*\{\s*$/);
    if (ifMatch) {
      const cond = evalCond(ifMatch[1], vars);
      i += 1;
      const collected = readBrace(lines, i);
      i = collected.next;
      let elseBody = [];
      if (i < lines.length && /^else\s*\{\s*$/.test(stripComment(lines[i]).trim())) {
        i += 1;
        const elseCollected = readBrace(lines, i);
        i = elseCollected.next;
        elseBody = elseCollected.body;
      }
      runBody(cond ? collected.body : elseBody, null);
      continue;
    }

    const callMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*(.*)\s*\)\s*;?\s*$/);
    if (callMatch && funcs[callMatch[1]]) {
      const fn = funcs[callMatch[1]];
      const extra = {};
      if (fn.param) {
        const arg = callMatch[2].trim();
        if (!arg) throw new Error(callMatch[1] + " needs a value inside the parentheses.");
        extra[fn.param] = evalExpr(arg, vars);
      }
      runBody(fn.body, extra);
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
  ensureStarterCode();

  if (projectApi && typeof projectApi.resumeIfNeeded === "function" && projectApi.resumeIfNeeded()) {
    return;
  }

  showTask();
  if (saved && saved.taskDone) {
    restoreDoneWaitingForNext();
  }
})();
