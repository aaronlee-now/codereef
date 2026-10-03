if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("go-code");
const outputBox = document.getElementById("go-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "go";
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

const starterCode = `fmt.Println("Hello, reef!")
`;

const projectStarter = `fmt.Println("My reef project")
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

function explainGoLine(line) {
  const t = String(line || "").trim();
  const quote = 'A quote is this mark: "';
  let m = t.match(/^fmt\.Println\("([^"]*)"\)$/);
  if (m) {
    return [
      'Type this exactly: fmt.Println("' + m[1] + '")',
      "fmt.Println means show these words on the screen.",
      "Type the letters fmt.",
      "Then type a dot. A dot is this mark: .",
      "Then type Println.",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^fmt\.Println\("([^"]*)"\s*\+\s*([A-Za-z_][A-Za-z0-9_]*)\)$/);
  if (m) {
    return [
      'Type this exactly: fmt.Println("' + m[1] + '" + ' + m[2] + ")",
      "A plus sign + sticks words together.",
      "Type fmt.Println",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type a space, then +, then a space.",
      "Then type " + m[2] + " with no quotes.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^fmt\.Println\(([A-Za-z_][A-Za-z0-9_]*)\)$/);
  if (m) {
    return [
      "Type this exactly: fmt.Println(" + m[1] + ")",
      "fmt.Println means show what " + m[1] + " remembers.",
      "Type fmt.Println",
      "Then type this mark: (",
      "Then type " + m[1] + " with no quotes.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^fmt\.Println\(([A-Za-z_][A-Za-z0-9_]*)\s*\+\s*(\d+)\)$/);
  if (m) {
    return [
      "Type this exactly: fmt.Println(" + m[1] + " + " + m[2] + ")",
      "Plus + adds numbers.",
      "Type fmt.Println",
      "Then type this mark: (",
      "Then type " + m[1] + ", a space, +, a space, " + m[2],
      "Then type this mark: )",
      "Do not put quotes around the number.",
    ];
  }
  m = t.match(/^fmt\.Println\(([A-Za-z_][A-Za-z0-9_]*)\s*-\s*(\d+)\)$/);
  if (m) {
    return [
      "Type this exactly: fmt.Println(" + m[1] + " - " + m[2] + ")",
      "Minus - takes away.",
      "Type fmt.Println",
      "Then type this mark: (",
      "Then type " + m[1] + ", a space, -, a space, " + m[2],
      "Then type this mark: )",
    ];
  }
  m = t.match(/^fmt\.Println\((\d+)\s*([+\-*])\s*(\d+)\)$/);
  if (m) {
    const word = m[2] === "+" ? "Plus + adds." : m[2] === "-" ? "Minus - takes away." : "The star * means times.";
    return [
      "Type this exactly: fmt.Println(" + m[1] + " " + m[2] + " " + m[3] + ")",
      word,
      "Type fmt.Println",
      "Then type this mark: (",
      "Then type " + m[1] + ", a space, " + m[2] + ", a space, " + m[3],
      "Then type this mark: )",
      "Do not put quotes around the numbers.",
    ];
  }
  m = t.match(/^fmt\.Println\((.+)\)$/);
  if (m) {
    return [
      "Type this exactly: fmt.Println(" + m[1] + ")",
      "fmt.Println means show this on the screen.",
      "Type fmt.Println",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: )",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*"([^"]*)"$/);
  if (m) {
    return [
      'Type this exactly: ' + m[1] + ' := "' + m[2] + '"',
      "A variable is a name that remembers a word.",
      ":= means make the name and remember the word.",
      "Type " + m[1],
      "Then type a space.",
      "Then type a colon and an equals sign together: :=",
      "A colon is this mark: :",
      "Then type a space.",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(-?\d+)$/);
  if (m) {
    return [
      "Type this exactly: " + m[1] + " := " + m[2],
      "A variable is a name that remembers a number.",
      "Type " + m[1],
      "Then type a space, then :=, then a space.",
      "Then type " + m[2],
      "Do not put quotes around a number.",
    ];
  }
  m = t.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(\d+)\s*;\s*\1\s*(<=|<)\s*(\d+)\s*;\s*\1\+\+\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means do the next lines again and again.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type a space, then " + m[1] + " := " + m[2],
      "Then type a semicolon. A semicolon is this mark: ;",
      "Then type a space, then " + m[1] + " " + m[3] + " " + m[4],
      "Then type a semicolon again.",
      "Then type a space, then " + m[1] + "++",
      m[1] + "++ means add 1 each time.",
      "Then type a space, then this mark: {",
      "{ opens the loop. The next line belongs inside.",
    ];
  }
  m = t.match(/^if\s+(.+)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "if means pick a path. Do this only when it is true.",
      "Type the word if.",
      "Then type a space, then " + m[1],
      "Then type a space, then this mark: {",
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
  m = t.match(/^func\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "func makes a function. A function is a recipe you can run later.",
      "Type the word func.",
      "Then type a space, then " + m[1],
      "Then type this mark: (",
      "Then type " + (m[2] || "nothing"),
      "Then type this mark: )",
      "Then type a space, then this mark: {",
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
    pushBits(steps, explainGoLine(line.text));
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
      if (output.indexOf(String(bits[b]).toLowerCase()) === -1) return false;
    }
  }
  if (spec.line) {
    const lines = output.split("\n");
    const bits = Array.isArray(spec.line) ? spec.line : [spec.line];
    for (let b = 0; b < bits.length; b += 1) {
      if (lines.indexOf(String(bits[b]).toLowerCase()) === -1) return false;
    }
  }
  if (spec.minCount) {
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

const tasks = (function buildGoTasks() {
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

  add("Make Go say Hello, ocean!", true, [L('fmt.Println("Hello, ocean!")')], { contains: "hello, ocean!" }, "Hello, ocean!");
  list[0].help = numbered([
    "Keep your old code. Do not erase the whole line.",
    "Click in the code box.",
    "Click on the word reef.",
    "Delete the letters r e e f.",
    "Type the word ocean in that same spot.",
    'The line should look like this: fmt.Println("Hello, ocean!")',
    "fmt.Println means show these words on the screen.",
    "Type the letters fmt.",
    "Then type a dot. A dot is this mark: .",
    "Then type Println.",
    "Then type this mark: (",
    'A quote is this mark: "',
    "The words Hello, ocean! stay between the quotes.",
    "Then type this mark: )",
    "Press the Run button. It is at the top.",
    "You should see Hello, ocean!",
  ]);

  add(
    "Print two lines — Hello, ocean! then I love Go!",
    false,
    [L('fmt.Println("I love Go!")')],
    { contains: ["hello, ocean!", "i love go!"] },
    "I love Go!",
    'fmt.Println("Hello, ocean!")\nfmt.Println("I love Go!")\n'
  );
  add(
    'Make a variable fish := "clownfish" and print it.',
    false,
    [L('fish := "clownfish"'), L("fmt.Println(fish)")],
    { code: /fish\s*:=\s*["']clownfish["']/, line: "clownfish" },
    "clownfish"
  );
  add(
    "Use a for loop to print 1, then 2, then 3.",
    true,
    [L("for i := 1; i <= 3; i++ {"), L("fmt.Println(i)", true), L("}")],
    { code: /for\s+\w+\s*:=/, line: ["1", "2", "3"] },
    "1 then 2 then 3"
  );
  add("Print the number 5.", true, [L("fmt.Println(5)")], { line: "5" }, "5");
  add(
    'Make coral := "reef" and print it.',
    false,
    [L('coral := "reef"'), L("fmt.Println(coral)")],
    { code: /coral\s*:=\s*["']reef["']/, line: "reef" },
    "reef"
  );
  add(
    "Loop to print splash three times.",
    true,
    [L("for i := 1; i <= 3; i++ {"), L('fmt.Println("splash")', true), L("}")],
    { code: /for\s+\w+\s*:=/, minCount: { line: "splash", n: 3 } },
    "splash three times"
  );

  ["bubble", "wave", "crab", "dolphin", "turtle", "coral", "sand", "shell", "whale", "shark", "starfish", "eel"].forEach(function (word) {
    add("Print the word " + word + ".", false, [L('fmt.Println("' + word + '")')], { contains: word }, word);
  });

  [
    ["pet", "crab"], ["boat", "blue"], ["hero", "Fin"], ["snack", "kelp"],
    ["home", "reef"], ["friend", "Nemo"], ["color", "teal"], ["toy", "shell"],
    ["pal", "otter"], ["ride", "wave"], ["team", "pods"], ["gem", "pearl"],
  ].forEach(function (pair) {
    add(
      'Make ' + pair[0] + ' := "' + pair[1] + '" and print it.',
      false,
      [L(pair[0] + ' := "' + pair[1] + '"'), L("fmt.Println(" + pair[0] + ")")],
      { code: new RegExp(pair[0] + "\\s*:=\\s*[\"']" + pair[1] + "[\"']", "i"), line: pair[1].toLowerCase() },
      pair[1]
    );
  });

  [["2 + 3", "5"], ["4 + 1", "5"], ["10 - 3", "7"], ["8 - 2", "6"], ["2 * 3", "6"], ["4 * 2", "8"], ["1 + 6", "7"], ["9 - 4", "5"], ["3 * 3", "9"], ["5 + 5", "10"]].forEach(function (row) {
    add("Print the math " + row[0] + ".", true, [L("fmt.Println(" + row[0] + ")")], { line: row[1], code: /fmt\.Println\s*\(/ }, row[1]);
  });

  ["splash", "bubble", "yay", "hi", "wave", "go"].forEach(function (word) {
    add(
      'Use a loop to print "' + word + '" three times.',
      true,
      [L("for i := 1; i <= 3; i++ {"), L('fmt.Println("' + word + '")', true), L("}")],
      { code: /for\s+\w+\s*:=/, minCount: { line: word, n: 3 } },
      word + " three times"
    );
  });
  [["1", "<=", "3", ["1", "2", "3"]], ["1", "<=", "4", ["1", "2", "3", "4"]], ["0", "<", "3", ["0", "1", "2"]], ["2", "<=", "4", ["2", "3", "4"]], ["1", "<=", "5", ["1", "2", "3", "4", "5"]], ["4", "<=", "6", ["4", "5", "6"]]].forEach(function (row) {
    add(
      "Use a loop to print " + row[3].join(", then ") + ".",
      true,
      [L("for i := " + row[0] + "; i " + row[1] + " " + row[2] + "; i++ {"), L("fmt.Println(i)", true), L("}")],
      { code: /for\s+\w+\s*:=/, line: row[3] },
      row[3].join(" then ")
    );
  });

  [["9", ">", "5", "big", "small", "big"], ["1", ">", "5", "big", "small", "small"], ["8", ">", "3", "yes", "no", "yes"], ["2", "<", "4", "low", "high", "low"], ["10", ">", "7", "tall", "short", "tall"], ["0", ">", "2", "hot", "cold", "cold"], ["6", ">", "6", "same", "notyet", "notyet"], ["4", "<", "9", "ok", "nope", "ok"], ["3", ">", "1", "swim", "rest", "swim"], ["5", "<", "5", "up", "down", "down"], ["7", ">", "2", "pass", "try", "pass"], ["1", "<", "1", "a", "b", "b"]].forEach(function (row) {
    add(
      "Use if and else so the path prints " + row[5] + ".",
      true,
      [L("score := " + row[0]), L("if score " + row[1] + " " + row[2] + " {"), L('fmt.Println("' + row[3] + '")', true), L("}"), L("else {"), L('fmt.Println("' + row[4] + '")', true), L("}")],
      { code: /\bif\b[\s\S]*\belse\b/, line: row[5] },
      row[5]
    );
  });

  ["wave", "splash", "hi", "yay", "wow", "go", "pop"].forEach(function (word) {
    add(
      "Make a function " + word + " that prints " + word + ", then run it.",
      true,
      [L("func " + word + "() {"), L('fmt.Println("' + word + '")', true), L("}"), L(word + "()")],
      { code: new RegExp("func\\s+" + word + "\\s*\\("), line: word },
      word
    );
  });
  [["cheer", "reef"], ["greet", "sam"], ["shout", "go"], ["call", "fin"], ["hail", "nemo"], ["sayhi", "otter"]].forEach(function (pair) {
    add(
      "Make a function " + pair[0] + " that prints the name you give it.",
      true,
      [L("func " + pair[0] + "(name) {"), L("fmt.Println(name)", true), L("}"), L(pair[0] + '("' + pair[1] + '")')],
      { code: new RegExp("func\\s+" + pair[0] + "\\s*\\("), line: pair[1] },
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
      [L('name := "' + pair[0] + '"'), L('fmt.Println("' + pair[1] + '" + name)')],
      { contains: (pair[1] + pair[0]).toLowerCase() },
      pair[1] + pair[0]
    );
  });

  add("Save a hero name, then use if to print found.", true, [L('hero := "Fin"'), L("fmt.Println(hero)"), L('if hero == "Fin" {'), L('fmt.Println("found")', true), L("}")], { code: /\bif\b/, line: "found" }, "found");
  add("Add 1 to a number and print it.", true, [L("waves := 3"), L("fmt.Println(waves + 1)")], { code: /waves\s*\+\s*1/, line: "4" }, "4");
  add("Take 2 away from a score and print it.", true, [L("score := 9"), L("fmt.Println(score - 2)")], { code: /score\s*-\s*2/, line: "7" }, "7");
  add("Use a function and a variable together.", true, [L('pet := "crab"'), L("func show() {"), L('fmt.Println("ready")', true), L("}"), L("show()"), L("fmt.Println(pet)")], { code: /func\s+show\s*\(/, line: ["ready", "crab"] }, "ready and crab");
  add("Loop 2 times and also print a title.", true, [L('fmt.Println("Title")'), L("for i := 1; i <= 2; i++ {"), L('fmt.Println("go")', true), L("}")], { code: /for\s+\w+\s*:=/, contains: "title", minCount: { line: "go", n: 2 } }, "Title and go go");
  add("If a score is big, print pass.", true, [L("score := 10"), L("if score > 5 {"), L('fmt.Println("pass")', true), L("}"), L("else {"), L('fmt.Println("try")', true), L("}")], { code: /\bif\b/, line: "pass" }, "pass");
  add("Make two functions and run both.", true, [L("func ping() {"), L('fmt.Println("ping")', true), L("}"), L("func pong() {"), L('fmt.Println("pong")', true), L("}"), L("ping()"), L("pong()")], { code: /func\s+ping\s*\(/, line: ["ping", "pong"] }, "ping and pong");
  add("Print a name, then loop the word splash twice.", true, [L('fmt.Println("Fin")'), L("for i := 1; i <= 2; i++ {"), L('fmt.Println("splash")', true), L("}")], { code: /for\s+\w+\s*:=/, line: "fin", minCount: { line: "splash", n: 2 } }, "Fin and splash");
  add("Remember two names and print both.", true, [L('one := "crab"'), L('two := "eel"'), L("fmt.Println(one)"), L("fmt.Println(two)")], { line: ["crab", "eel"] }, "crab and eel");
  add("Count with a loop from 1 to 2, then print done.", true, [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(i)", true), L("}"), L('fmt.Println("done")')], { code: /for\s+\w+\s*:=/, line: ["1", "2"], contains: "done" }, "1, 2, and done");

  const padWords = ["pearl", "kelp", "otter", "foam", "tide", "cove", "pier", "gull", "dune", "mist"];
  let pad = 0;
  while (list.length < 100) {
    const word = padWords[pad % padWords.length] + (pad >= padWords.length ? String(pad) : "");
    pad += 1;
    add("Print the extra word " + word + ".", false, [L('fmt.Println("' + word + '")')], { contains: word }, word);
  }
  return list;
})();

function buildGoSteps(prefix, rows) {
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
    steps: buildGoSteps("Project step", [
      { goal: "Print a story title.", fresh: true, lines: [L('fmt.Println("Ocean Story")')], spec: { contains: "ocean story" }, see: "Ocean Story" },
      { goal: "Add a story line.", lines: [L('fmt.Println("A fish swam out.")')], spec: { minLines: 2 }, see: "A fish swam out." },
      { goal: "Add a blue-water line.", lines: [L('fmt.Println("The water was blue.")')], spec: { minLines: 3 }, see: "The water was blue." },
      { goal: "Save the hero name Fin.", lines: [L('hero := "Fin"')], spec: { code: /hero\s*:=\s*["']Fin["']/ }, see: "your old story lines" },
      { goal: "Print the hero name.", lines: [L("fmt.Println(hero)")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Say hello to the hero.", lines: [L('fmt.Println("Hello " + hero)')], spec: { contains: "hello fin" }, see: "Hello Fin" },
      { goal: "Save the number of waves.", lines: [L("waves := 3")], spec: { code: /waves\s*:=\s*3/ }, see: "your old lines" },
      { goal: "Print how many waves.", lines: [L("fmt.Println(waves)")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than the waves.", lines: [L("fmt.Println(waves + 1)")], spec: { line: "4" }, see: "4" },
      { goal: "If waves are more than 2, print big.", lines: [L("if waves > 2 {"), L('fmt.Println("big")', true), L("}")], spec: { code: /\bif\b/, line: "big" }, see: "big" },
      { goal: "Add the other path, else.", lines: [L("else {"), L('fmt.Println("calm")', true), L("}")], spec: { code: /\belse\b/ }, see: "big still, because 3 is more than 2", note: "Click after the } that closes the if." },
      { goal: "Save a friend name.", lines: [L('friend := "Bubbles"')], spec: { code: /friend\s*:=/ }, see: "your old lines" },
      { goal: "Print the friend.", lines: [L("fmt.Println(friend)")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Loop to print 1, 2, 3.", lines: [L("for i := 1; i <= 3; i++ {"), L("fmt.Println(i)", true), L("}")], spec: { code: /for\s+\w+\s*:=/, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "Make a cheer function.", lines: [L("func cheer() {"), L('fmt.Println("yay")', true), L("}")], spec: { code: /func\s+cheer\s*\(/ }, see: "your old lines" },
      { goal: "Run the cheer function.", lines: [L("cheer()")], spec: { line: "yay" }, see: "yay" },
      { goal: "Print The end.", lines: [L('fmt.Println("The end")')], spec: { contains: "the end" }, see: "The end" },
      { goal: "Print You did it!", lines: [L('fmt.Println("You did it!")')], spec: { contains: "you did it" }, see: "You did it!" },
    ]),
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Name two fish, count them, and cheer.",
    plan: ["Print a title and save two names.", "Say hello to each name.", "Count, compare, loop, and cheer."],
    steps: buildGoSteps("Project step", [
      { goal: "Print a title.", fresh: true, lines: [L('fmt.Println("Fish Names")')], spec: { contains: "fish names" }, see: "Fish Names" },
      { goal: "Save the name Bubbles.", lines: [L('name := "Bubbles"')], spec: { code: /name\s*:=\s*["']Bubbles["']/ }, see: "the title" },
      { goal: "Print the name.", lines: [L("fmt.Println(name)")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Say hello to the name.", lines: [L('fmt.Println("Hello " + name)')], spec: { contains: "hello bubbles" }, see: "Hello Bubbles" },
      { goal: "Save a friend name.", lines: [L('friend := "Coral"')], spec: { code: /friend\s*:=\s*["']Coral["']/ }, see: "your old lines" },
      { goal: "Print the friend.", lines: [L("fmt.Println(friend)")], spec: { line: "coral" }, see: "Coral" },
      { goal: "Say meet the friend.", lines: [L('fmt.Println("Meet " + friend)')], spec: { contains: "meet coral" }, see: "Meet Coral" },
      { goal: "Save the number 2.", lines: [L("count := 2")], spec: { code: /count\s*:=\s*2/ }, see: "your old lines" },
      { goal: "Print the count.", lines: [L("fmt.Println(count)")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than the count.", lines: [L("fmt.Println(count + 1)")], spec: { line: "3" }, see: "3" },
      { goal: "If count is more than 1, print many.", lines: [L("if count > 1 {"), L('fmt.Println("many")', true), L("}")], spec: { code: /\bif\b/, line: "many" }, see: "many" },
      { goal: "Add else.", lines: [L("else {"), L('fmt.Println("one")', true), L("}")], spec: { code: /\belse\b/ }, see: "many still", note: "Click after the } that closes the if." },
      { goal: "Loop two times and print hi.", lines: [L("for i := 1; i <= 2; i++ {"), L('fmt.Println("hi")', true), L("}")], spec: { code: /for\s+\w+\s*:=/, minCount: { line: "hi", n: 2 } }, see: "hi twice" },
      { goal: "Print both names again.", lines: [L("fmt.Println(name)"), L("fmt.Println(friend)")], spec: { minCount: { line: "bubbles", n: 1 } }, see: "Bubbles and Coral" },
      { goal: "Make a splash function.", lines: [L("func yay() {"), L('fmt.Println("splash")', true), L("}")], spec: { code: /func\s+yay\s*\(/ }, see: "your old lines" },
      { goal: "Run yay.", lines: [L("yay()")], spec: { line: "splash" }, see: "splash" },
      { goal: "Print All named!", lines: [L('fmt.Println("All named!")')], spec: { contains: "all named" }, see: "All named!" },
      { goal: "Print a goodbye line.", lines: [L('fmt.Println("Bye fish!")')], spec: { contains: "bye fish" }, see: "Bye fish!" },
    ]),
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question, save the answer, and keep a score.",
    plan: ["Print a question and save the answer.", "Use a score and math.", "Use if, a loop, and a function to finish."],
    steps: buildGoSteps("Project step", [
      { goal: "Print Quiz Time.", fresh: true, lines: [L('fmt.Println("Quiz Time")')], spec: { contains: "quiz time" }, see: "Quiz Time" },
      { goal: "Print a question.", lines: [L('fmt.Println("How many arms does a starfish have?")')], spec: { contains: "?" }, see: "the question" },
      { goal: "Save the answer 5.", lines: [L('answer := "5"')], spec: { code: /answer\s*:=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("fmt.Println(answer)")], spec: { line: "5" }, see: "5" },
      { goal: "Print The answer is plus the answer.", lines: [L('fmt.Println("The answer is " + answer)')], spec: { contains: "the answer is 5" }, see: "The answer is 5" },
      { goal: "Save score := 10.", lines: [L("score := 10")], spec: { code: /score\s*:=\s*10/ }, see: "your old lines" },
      { goal: "Print the score.", lines: [L("fmt.Println(score)")], spec: { line: "10" }, see: "10" },
      { goal: "Print score minus 2.", lines: [L("fmt.Println(score - 2)")], spec: { line: "8" }, see: "8" },
      { goal: "If score is more than 5, print pass.", lines: [L("if score > 5 {"), L('fmt.Println("pass")', true), L("}")], spec: { code: /\bif\b/, line: "pass" }, see: "pass" },
      { goal: "Add else.", lines: [L("else {"), L('fmt.Println("try again")', true), L("}")], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the } that closes the if." },
      { goal: "Save bonus := 1.", lines: [L("bonus := 1")], spec: { code: /bonus\s*:=\s*1/ }, see: "your old lines" },
      { goal: "Print the bonus.", lines: [L("fmt.Println(bonus)")], spec: { line: "1" }, see: "1" },
      { goal: "Loop 1 and 2.", lines: [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(i)", true), L("}")], spec: { code: /for\s+\w+\s*:=/, line: ["1", "2"] }, see: "1 and 2" },
      { goal: "Print a fact.", lines: [L('fmt.Println("five arms")')], spec: { contains: "five arms" }, see: "five arms" },
      { goal: "Print another fact.", lines: [L('fmt.Println("lives in the sea")')], spec: { contains: "lives in the sea" }, see: "lives in the sea" },
      { goal: "Make a done function.", lines: [L("func done() {"), L('fmt.Println("quiz done")', true), L("}")], spec: { code: /func\s+done\s*\(/ }, see: "your old lines" },
      { goal: "Run done.", lines: [L("done()")], spec: { contains: "quiz done" }, see: "quiz done" },
      { goal: "Print You finished the quiz!", lines: [L('fmt.Println("You finished the quiz!")')], spec: { contains: "you finished the quiz" }, see: "You finished the quiz!" },
    ]),
  },
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ocean adventure",
    blurb: "A hero, a counting loop, and a victory function.",
    plan: ["Name the hero.", "Count and loop.", "Finish with a function."],
    steps: buildGoSteps("Advanced step", [
      { goal: "Print Ocean Adventure.", fresh: true, lines: [L('fmt.Println("Ocean Adventure")')], spec: { contains: "ocean adventure" }, see: "Ocean Adventure" },
      { goal: "Save hero Fin.", lines: [L('hero := "Fin"')], spec: { code: /hero\s*:=/ }, see: "the title" },
      { goal: "Print the hero.", lines: [L("fmt.Println(hero)")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Print Go plus the hero.", lines: [L('fmt.Println("Go " + hero)')], spec: { contains: "go fin" }, see: "Go Fin" },
      { goal: "Save hearts := 3.", lines: [L("hearts := 3")], spec: { code: /hearts\s*:=\s*3/ }, see: "your old lines" },
      { goal: "Print hearts.", lines: [L("fmt.Println(hearts)")], spec: { line: "3" }, see: "3" },
      { goal: "Loop to print 1, 2, 3.", lines: [L("for i := 1; i <= 3; i++ {"), L("fmt.Println(i)", true), L("}")], spec: { code: /for\s+\w+\s*:=/, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "If hearts are more than 2, print strong.", lines: [L("if hearts > 2 {"), L('fmt.Println("strong")', true), L("}")], spec: { code: /\bif\b/, line: "strong" }, see: "strong" },
      { goal: "Add else.", lines: [L("else {"), L('fmt.Println("rest")', true), L("}")], spec: { code: /\belse\b/ }, see: "strong still", note: "Click after the } that closes the if." },
      { goal: "Save a pal name.", lines: [L('pal := "Bubbles"')], spec: { code: /pal\s*:=/ }, see: "your old lines" },
      { goal: "Print the pal.", lines: [L("fmt.Println(pal)")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Make win and run it.", lines: [L("func win() {"), L('fmt.Println("You win!")', true), L("}"), L("win()")], spec: { code: /func\s+win\s*\(/, contains: "you win" }, see: "You win!" },
    ]),
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "A harder question, a score, and a clap function.",
    plan: ["Ask and answer.", "Do score math.", "Clap at the end."],
    steps: buildGoSteps("Advanced step", [
      { goal: "Print Hard Quiz.", fresh: true, lines: [L('fmt.Println("Hard Quiz")')], spec: { contains: "hard quiz" }, see: "Hard Quiz" },
      { goal: "Print a math question.", lines: [L('fmt.Println("What is 2 + 3?")')], spec: { contains: "2 + 3" }, see: "What is 2 + 3?" },
      { goal: "Save answer 5.", lines: [L('answer := "5"')], spec: { code: /answer\s*:=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("fmt.Println(answer)")], spec: { line: "5" }, see: "5" },
      { goal: "Save points := 10.", lines: [L("points := 10")], spec: { code: /points\s*:=\s*10/ }, see: "your old lines" },
      { goal: "Print the points.", lines: [L("fmt.Println(points)")], spec: { line: "10" }, see: "10" },
      { goal: "Print points minus 1.", lines: [L("fmt.Println(points - 1)")], spec: { line: "9" }, see: "9" },
      { goal: "If points are more than 8, print super.", lines: [L("if points > 8 {"), L('fmt.Println("super")', true), L("}")], spec: { code: /\bif\b/, line: "super" }, see: "super" },
      { goal: "Add else.", lines: [L("else {"), L('fmt.Println("ok")', true), L("}")], spec: { code: /\belse\b/ }, see: "super still", note: "Click after the } that closes the if." },
      { goal: "Make a clap function.", lines: [L("func clap() {"), L('fmt.Println("clap")', true), L("}")], spec: { code: /func\s+clap\s*\(/ }, see: "your old lines" },
      { goal: "Run clap.", lines: [L("clap()")], spec: { line: "clap" }, see: "clap" },
      { goal: "Print Quiz star!", lines: [L('fmt.Println("Quiz star!")')], spec: { contains: "quiz star" }, see: "Quiz star!" },
    ]),
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "Three animals and a goodbye function.",
    plan: ["Print three animals.", "Save a name and a count.", "Finish the catalog."],
    steps: buildGoSteps("Advanced step", [
      { goal: "Print Sea Catalog.", fresh: true, lines: [L('fmt.Println("Sea Catalog")')], spec: { contains: "sea catalog" }, see: "Sea Catalog" },
      { goal: "Print crab.", lines: [L('fmt.Println("crab")')], spec: { line: "crab" }, see: "crab" },
      { goal: "Print eel.", lines: [L('fmt.Println("eel")')], spec: { line: "eel" }, see: "eel" },
      { goal: "Print whale.", lines: [L('fmt.Println("whale")')], spec: { line: "whale" }, see: "whale" },
      { goal: "Save first := crab.", lines: [L('first := "crab"')], spec: { code: /first\s*:=\s*["']crab["']/ }, see: "your old lines" },
      { goal: "Print first.", lines: [L("fmt.Println(first)")], spec: { minCount: { line: "crab", n: 2 } }, see: "crab again" },
      { goal: "Save count := 3.", lines: [L("count := 3")], spec: { code: /count\s*:=\s*3/ }, see: "your old lines" },
      { goal: "Print the count.", lines: [L("fmt.Println(count)")], spec: { line: "3" }, see: "3" },
      { goal: "Loop the word swim twice.", lines: [L("for i := 1; i <= 2; i++ {"), L('fmt.Println("swim")', true), L("}")], spec: { code: /for\s+\w+\s*:=/, minCount: { line: "swim", n: 2 } }, see: "swim twice" },
      { goal: "If count is 3, print full tank.", lines: [L("if count == 3 {"), L('fmt.Println("full tank")', true), L("}")], spec: { code: /\bif\b/, contains: "full tank" }, see: "full tank" },
      { goal: "Add else.", lines: [L("else {"), L('fmt.Println("more")', true), L("}")], spec: { code: /\belse\b/ }, see: "full tank still", note: "Click after the } that closes the if." },
      { goal: "Make bye and run it.", lines: [L("func bye() {"), L('fmt.Println("catalog done")', true), L("}"), L("bye()")], spec: { code: /func\s+bye\s*\(/, contains: "catalog done" }, see: "catalog done" },
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
  pathKey: "go",
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
    openCoralTrail("go", {
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
    throw new Error("Empty value inside Println() or :=");
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
        expr + " is not defined yet. Make it with name := value first."
      );
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
      throw new Error("Use + - or * with numbers, like fmt.Println(2 + 3).");
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

function evalCond(cond, vars) {
  const text = String(cond || "").trim();
  const m = text.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!m) {
    throw new Error("Try if n > 5 { with a compare sign in the middle.");
  }
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
    if (!bodyLine) {
      continue;
    }
    if (/\{\s*$/.test(bodyLine) && bodyLine !== "}" && !/^\}/.test(bodyLine)) {
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
    throw new Error("This block needs a closing } brace.");
  }
  return { body: body, next: i };
}

function isIgnorableLine(line) {
  if (/^package\s+main\s*$/.test(line)) {
    return true;
  }
  if (/^import\s+"fmt"\s*$/.test(line)) {
    return true;
  }
  if (/^func\s+main\s*\(\s*\)\s*\{\s*$/.test(line)) {
    return true;
  }
  if (line === "}") {
    return true;
  }
  return false;
}

function runSimple(line, vars, output) {
  const shortDecl = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(.+)$/);
  if (shortDecl) {
    vars[shortDecl[1]] = evalExpr(shortDecl[2], vars);
    return;
  }

  const varDecl = line.match(/^var\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
  if (varDecl) {
    vars[varDecl[1]] = evalExpr(varDecl[2], vars);
    return;
  }

  const printlnMatch = line.match(/^fmt\.Println\s*\((.*)\)\s*$/);
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
    'Try fmt.Println(...), name := value, or var name = value. Got: ' + line
  );
}

function runTinyGo(source) {
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
      /^func\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)?\s*\)\s*\{\s*$/
    );
    if (funcMatch && funcMatch[1] !== "main") {
      i += 1;
      const collected = readBrace(lines, i);
      i = collected.next;
      funcs[funcMatch[1]] = { param: funcMatch[2] || "", body: collected.body };
      continue;
    }

    const ifMatch = line.match(/^if\s+(.+)\s*\{\s*$/);
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

    const callMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*(.*)\s*\)\s*$/);
    if (callMatch && funcs[callMatch[1]]) {
      const fn = funcs[callMatch[1]];
      const extra = {};
      if (fn.param) {
        const arg = callMatch[2].trim();
        if (!arg) {
          throw new Error(callMatch[1] + " needs a value inside the parentheses.");
        }
        extra[fn.param] = evalExpr(arg, vars);
      }
      runBody(fn.body, extra);
      i += 1;
      continue;
    }

    const forMatch = line.match(
      /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(-?\d+)\s*;\s*\1\s*(<=|<)\s*(-?\d+)\s*;\s*\1\+\+\s*\{\s*$/
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
          "Your for loop needs a line inside the braces, like fmt.Println(i)."
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

    if (/^for\s+/.test(line)) {
      throw new Error(
        "Use a Go for loop like: for i := 1; i <= 3; i++ { ... }"
      );
    }

    runSimple(line, vars, output);
    i += 1;
  }

  return output.join("\n");
}

function runCode() {
  try {
    lastOutput = runTinyGo(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("Go got stuck. Read the red error, or tap Help.");
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
