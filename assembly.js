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

const starterCode = `PRINT "Hello, reef!"\n`;
const projectStarter = `PRINT "My reef project"\n`;

const dialectTip =
  "This is reef assembly — training wheels that feel like real Assembly, " +
  "not a real CPU. Allowed lines: PRINT, MOV, ADD, REPEAT / END. ";

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
  return lines.map(function (line) { return (line.indent ? "  " : "") + line.text; }).join("\n") + "\n";
}

function explainAsmLine(line) {
  const t = String(line || "").trim();
  const quote = 'A quote is this mark: "';
  let m = t.match(/^PRINT\s+"([^"]*)"$/i);
  if (m) {
    return [
      'Type this exactly: PRINT "' + m[1] + '"',
      "PRINT means show these words on the screen.",
      "Type the word PRINT.",
      "Then type a space.",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
    ];
  }
  m = t.match(/^PRINT\s+([A-Za-z_][A-Za-z0-9_]*)$/i);
  if (m) {
    return [
      "Type this exactly: PRINT " + m[1],
      "PRINT means show what " + m[1] + " remembers.",
      "Do not use quotes this time.",
      m[1] + " is a name that already remembers something.",
      "Type the word PRINT.",
      "Then type a space.",
      "Then type " + m[1],
    ];
  }
  m = t.match(/^MOV\s+([A-Za-z_][A-Za-z0-9_]*)\s*,\s*"([^"]*)"$/i);
  if (m) {
    return [
      'Type this exactly: MOV ' + m[1] + ', "' + m[2] + '"',
      "MOV puts a word into a name.",
      "A name here is a box that remembers.",
      "Type the word MOV.",
      "Then type a space, then " + m[1],
      "Then type a comma. A comma is this mark: ,",
      "Then type a space.",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
    ];
  }
  m = t.match(/^MOV\s+([A-Za-z_][A-Za-z0-9_]*)\s*,\s*(-?\d+)$/i);
  if (m) {
    return [
      "Type this exactly: MOV " + m[1] + ", " + m[2],
      "MOV puts a number into a box.",
      "Type the word MOV.",
      "Then type a space, then " + m[1],
      "Then type a comma. A comma is this mark: ,",
      "Then type a space, then " + m[2],
      "Do not put quotes around a number.",
    ];
  }
  m = t.match(/^ADD\s+([A-Za-z_][A-Za-z0-9_]*)\s*,\s*(-?\d+)$/i);
  if (m) {
    return [
      "Type this exactly: ADD " + m[1] + ", " + m[2],
      "ADD adds a number into the box named " + m[1] + ".",
      "Type the word ADD.",
      "Then type a space, then " + m[1],
      "Then type a comma. A comma is this mark: ,",
      "Then type a space, then " + m[2],
    ];
  }
  m = t.match(/^REPEAT\s+(\d+)$/i);
  if (m) {
    return [
      "Type this exactly: REPEAT " + m[1],
      "REPEAT means do the next lines that many times.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word REPEAT.",
      "Then type a space.",
      "Then type " + m[1],
    ];
  }
  if (/^END$/i.test(t)) {
    return [
      "Type this exactly: END",
      "END means the REPEAT is finished.",
      "Type the letters E N D.",
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
    if ((!fresh && i === 0) || i > 0) {
      steps.push("Press the Enter key. That starts a new line.");
    }
    if (lines[i].indent) {
      steps.push("This line is inside REPEAT.");
      steps.push("Press the space bar 2 times before you type it.");
    }
    pushBits(steps, explainAsmLine(lines[i].text));
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
    const outLines = output.split("\n");
    const bits = Array.isArray(spec.line) ? spec.line : [spec.line];
    for (let b = 0; b < bits.length; b += 1) {
      if (outLines.indexOf(String(bits[b]).toLowerCase()) === -1) return false;
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
  return function () { return specOk(spec, codeBox.value, normalizeOut(lastOutput)); };
}
function stepCheck(spec) {
  return function (ctx) { return specOk(spec, ctx.code || "", normalizeOut(ctx.output || "")); };
}

const tasks = (function buildAsmTasks() {
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

  add('Make Assembly say Hello, ocean!', true, [L('PRINT "Hello, ocean!"')], { contains: "hello, ocean!" }, "Hello, ocean!");
  list[0].help = numbered([
    "Keep your old code. Do not erase the whole line.",
    "Click in the code box.",
    "Click on the word reef.",
    "Delete the letters r e e f.",
    "Type the word ocean in that same spot.",
    'The line should look like this: PRINT "Hello, ocean!"',
    "PRINT means show these words on the screen.",
    "Type the word PRINT.",
    "Then type a space.",
    'A quote is this mark: "',
    "Type a quote, then Hello, ocean!, then a quote.",
    "Press the Run button. It is at the top.",
    "You should see Hello, ocean!",
  ]);
  add("Print two lines — Hello, ocean! then I love Assembly!", false, [L('PRINT "I love Assembly!"')], { contains: ["hello, ocean!", "i love assembly!"] }, "I love Assembly!", 'PRINT "Hello, ocean!"\nPRINT "I love Assembly!"\n');
  add('MOV clownfish into a name, then PRINT it.', false, [L('MOV fish, "clownfish"'), L("PRINT fish")], { code: /MOV\s+fish\s*,\s*["']clownfish["']/i, line: "clownfish" }, "clownfish");
  add("Use REPEAT to print 1, then 2, then 3.", true, [L("MOV R1, 1"), L("REPEAT 3"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { code: /REPEAT\s+3/i, line: ["1", "2", "3"] }, "1 then 2 then 3");
  add("PRINT the number 5.", true, [L("MOV R1, 5"), L("PRINT R1")], { line: "5", code: /MOV\s+R1\s*,\s*5/i }, "5");
  add('MOV coral to "reef", then PRINT it.', false, [L('MOV coral, "reef"'), L("PRINT coral")], { code: /MOV\s+coral\s*,\s*["']reef["']/i, line: "reef" }, "reef");
  add("REPEAT to PRINT splash three times.", true, [L("REPEAT 3"), L('PRINT "splash"', true), L("END")], { code: /REPEAT\s+3/i, minCount: { line: "splash", n: 3 } }, "splash three times");

  ["bubble", "wave", "crab", "dolphin", "turtle", "coral", "sand", "shell", "whale", "shark", "starfish", "eel"].forEach(function (word) {
    add("PRINT the word " + word + ".", false, [L('PRINT "' + word + '"')], { contains: word }, word);
  });
  [["pet", "crab"], ["boat", "blue"], ["hero", "Fin"], ["snack", "kelp"], ["home", "reef"], ["friend", "Nemo"], ["color", "teal"], ["toy", "shell"], ["pal", "otter"], ["ride", "wave"], ["team", "pods"], ["gem", "pearl"]].forEach(function (pair) {
    add('MOV ' + pair[1] + " into " + pair[0] + " and PRINT it.", false, [L('MOV ' + pair[0] + ', "' + pair[1] + '"'), L("PRINT " + pair[0])], { code: new RegExp("MOV\\s+" + pair[0] + "\\s*,\\s*[\"']" + pair[1] + "[\"']", "i"), line: pair[1].toLowerCase() }, pair[1]);
  });
  [[2, 3, "5"], [4, 1, "5"], [1, 6, "7"], [3, 3, "6"], [5, 5, "10"], [8, 2, "10"], [6, 2, "8"], [9, 1, "10"], [2, 2, "4"], [7, 2, "9"]].forEach(function (row) {
    add("ADD " + row[1] + " onto " + row[0] + " and PRINT the box.", true, [L("MOV R1, " + row[0]), L("ADD R1, " + row[1]), L("PRINT R1")], { code: /ADD\s+R1/i, line: row[2] }, row[2]);
  });
  ["splash", "bubble", "yay", "hi", "wave", "go"].forEach(function (word) {
    add('REPEAT to PRINT "' + word + '" three times.', true, [L("REPEAT 3"), L('PRINT "' + word + '"', true), L("END")], { code: /REPEAT\s+3/i, minCount: { line: word, n: 3 } }, word + " three times");
  });
  [[1, 3], [2, 3], [0, 4], [4, 3], [5, 2], [8, 3]].forEach(function (row) {
    const expect = [];
    for (let n = row[0]; n < row[0] + row[1]; n += 1) expect.push(String(n));
    add("REPEAT to count " + expect.join(", then ") + ".", true, [L("MOV R1, " + row[0]), L("REPEAT " + row[1]), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { code: new RegExp("REPEAT\\s+" + row[1], "i"), line: expect }, expect.join(" then "));
  });
  for (let n = 1; n <= 8; n += 1) {
    add("Start at " + n + ", ADD 2, and PRINT the box.", true, [L("MOV R1, " + n), L("ADD R1, 2"), L("PRINT R1")], { code: /ADD\s+R1\s*,\s*2/i, line: String(n + 2) }, String(n + 2));
  }
  for (let n = 2; n <= 6; n += 1) {
    add("REPEAT the word pop " + n + " times.", true, [L("REPEAT " + n), L('PRINT "pop"', true), L("END")], { code: new RegExp("REPEAT\\s+" + n, "i"), minCount: { line: "pop", n: n } }, "pop " + n + " times");
  }
  add("Save two names and PRINT both.", true, [L('MOV one, "crab"'), L('MOV two, "eel"'), L("PRINT one"), L("PRINT two")], { line: ["crab", "eel"] }, "crab and eel");
  add("ADD twice, then PRINT.", true, [L("MOV R1, 1"), L("ADD R1, 2"), L("ADD R1, 3"), L("PRINT R1")], { code: /ADD\s+R1\s*,\s*3/i, line: "6" }, "6");
  add("PRINT a title, then REPEAT hi twice.", true, [L('PRINT "Title"'), L("REPEAT 2"), L('PRINT "hi"', true), L("END")], { code: /REPEAT\s+2/i, contains: "title", minCount: { line: "hi", n: 2 } }, "Title and hi hi");
  add("Count 1 and 2, then PRINT done.", true, [L("MOV R1, 1"), L("REPEAT 2"), L("PRINT R1", true), L("ADD R1, 1", true), L("END"), L('PRINT "done"')], { code: /REPEAT/i, line: ["1", "2"], contains: "done" }, "1, 2, and done");
  add("Use two boxes, R1 and R2.", true, [L("MOV R1, 4"), L("MOV R2, 6"), L("PRINT R1"), L("PRINT R2")], { line: ["4", "6"] }, "4 and 6");
  add("ADD 1 three times with REPEAT.", true, [L("MOV R1, 0"), L("REPEAT 3"), L("ADD R1, 1", true), L("PRINT R1", true), L("END")], { code: /REPEAT\s+3/i, line: ["1", "2", "3"] }, "1 then 2 then 3");

  const padWords = ["pearl", "kelp", "otter", "foam", "tide", "cove", "pier", "gull", "dune", "mist"];
  let pad = 0;
  while (list.length < 100) {
    const word = padWords[pad % padWords.length] + (pad >= padWords.length ? String(pad) : "");
    pad += 1;
    add("PRINT the extra word " + word + ".", false, [L('PRINT "' + word + '"')], { contains: word }, word);
  }
  return list;
})();

function buildAsmSteps(prefix, rows) {
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
    blurb: "A long story using PRINT, MOV, ADD, and REPEAT.",
    plan: ["Print a title and two lines.", "Save a hero name.", "Count with ADD and REPEAT."],
    steps: buildAsmSteps("Project step", [
      { goal: "PRINT a story title.", fresh: true, lines: [L('PRINT "Ocean Story"')], spec: { contains: "ocean story" }, see: "Ocean Story" },
      { goal: "Add a story line.", lines: [L('PRINT "A fish swam out."')], spec: { minLines: 2 }, see: "A fish swam out." },
      { goal: "Add a blue-water line.", lines: [L('PRINT "The water was blue."')], spec: { minLines: 3 }, see: "The water was blue." },
      { goal: "MOV the hero name Fin.", lines: [L('MOV hero, "Fin"')], spec: { code: /MOV\s+hero/i }, see: "your old lines" },
      { goal: "PRINT the hero.", lines: [L("PRINT hero")], spec: { line: "fin" }, see: "Fin" },
      { goal: "PRINT Hello.", lines: [L('PRINT "Hello"')], spec: { line: "hello" }, see: "Hello" },
      { goal: "MOV 3 into R1.", lines: [L("MOV R1, 3")], spec: { code: /MOV\s+R1\s*,\s*3/i }, see: "your old lines" },
      { goal: "PRINT R1.", lines: [L("PRINT R1")], spec: { line: "3" }, see: "3" },
      { goal: "ADD 1 to R1 and PRINT it.", lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { code: /ADD\s+R1\s*,\s*1/i, line: "4" }, see: "4" },
      { goal: "PRINT the word big.", lines: [L('PRINT "big"')], spec: { line: "big" }, see: "big" },
      { goal: "MOV a friend name.", lines: [L('MOV friend, "Bubbles"')], spec: { code: /MOV\s+friend/i }, see: "your old lines" },
      { goal: "PRINT the friend.", lines: [L("PRINT friend")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "REPEAT to print 1, 2, 3.", lines: [L("MOV R2, 1"), L("REPEAT 3"), L("PRINT R2", true), L("ADD R2, 1", true), L("END")], spec: { code: /REPEAT\s+3/i, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "PRINT yay.", lines: [L('PRINT "yay"')], spec: { line: "yay" }, see: "yay" },
      { goal: "REPEAT splash twice.", lines: [L("REPEAT 2"), L('PRINT "splash"', true), L("END")], spec: { minCount: { line: "splash", n: 2 } }, see: "splash twice" },
      { goal: "PRINT The end.", lines: [L('PRINT "The end"')], spec: { contains: "the end" }, see: "The end" },
      { goal: "PRINT You did it!", lines: [L('PRINT "You did it!"')], spec: { contains: "you did it" }, see: "You did it!" },
      { goal: "PRINT a star line.", lines: [L('PRINT "star"')], spec: { line: "star" }, see: "star" },
    ]),
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Store two fish names and count them.",
    plan: ["Print a title.", "MOV two names.", "ADD and REPEAT."],
    steps: buildAsmSteps("Project step", [
      { goal: "PRINT a title.", fresh: true, lines: [L('PRINT "Fish Names"')], spec: { contains: "fish names" }, see: "Fish Names" },
      { goal: "MOV Bubbles into name.", lines: [L('MOV name, "Bubbles"')], spec: { code: /MOV\s+name/i }, see: "the title" },
      { goal: "PRINT the name.", lines: [L("PRINT name")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "PRINT Hello.", lines: [L('PRINT "Hello"')], spec: { line: "hello" }, see: "Hello" },
      { goal: "MOV Coral into friend.", lines: [L('MOV friend, "Coral"')], spec: { code: /MOV\s+friend/i }, see: "your old lines" },
      { goal: "PRINT the friend.", lines: [L("PRINT friend")], spec: { line: "coral" }, see: "Coral" },
      { goal: "PRINT Meet.", lines: [L('PRINT "Meet"')], spec: { line: "meet" }, see: "Meet" },
      { goal: "MOV 2 into R1.", lines: [L("MOV R1, 2")], spec: { code: /MOV\s+R1\s*,\s*2/i }, see: "your old lines" },
      { goal: "PRINT R1.", lines: [L("PRINT R1")], spec: { line: "2" }, see: "2" },
      { goal: "ADD 1 and PRINT.", lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "3" }, see: "3" },
      { goal: "PRINT many.", lines: [L('PRINT "many"')], spec: { line: "many" }, see: "many" },
      { goal: "PRINT one.", lines: [L('PRINT "one"')], spec: { line: "one" }, see: "one" },
      { goal: "REPEAT hi twice.", lines: [L("REPEAT 2"), L('PRINT "hi"', true), L("END")], spec: { minCount: { line: "hi", n: 2 } }, see: "hi twice" },
      { goal: "PRINT both names again.", lines: [L("PRINT name"), L("PRINT friend")], spec: { line: "coral" }, see: "Coral" },
      { goal: "PRINT splash.", lines: [L('PRINT "splash"')], spec: { line: "splash" }, see: "splash" },
      { goal: "REPEAT go twice.", lines: [L("REPEAT 2"), L('PRINT "go"', true), L("END")], spec: { minCount: { line: "go", n: 2 } }, see: "go twice" },
      { goal: "PRINT All named!", lines: [L('PRINT "All named!"')], spec: { contains: "all named" }, see: "All named!" },
      { goal: "PRINT Bye fish!", lines: [L('PRINT "Bye fish!"')], spec: { contains: "bye fish" }, see: "Bye fish!" },
    ]),
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question and keep a score in a box.",
    plan: ["Print a question.", "MOV the answer.", "ADD the score."],
    steps: buildAsmSteps("Project step", [
      { goal: "PRINT Quiz Time.", fresh: true, lines: [L('PRINT "Quiz Time"')], spec: { contains: "quiz time" }, see: "Quiz Time" },
      { goal: "PRINT a question.", lines: [L('PRINT "How many arms?"')], spec: { contains: "?" }, see: "the question" },
      { goal: "MOV answer 5.", lines: [L('MOV answer, "5"')], spec: { code: /MOV\s+answer/i }, see: "your old lines" },
      { goal: "PRINT the answer.", lines: [L("PRINT answer")], spec: { line: "5" }, see: "5" },
      { goal: "PRINT The answer is.", lines: [L('PRINT "The answer is"')], spec: { contains: "the answer is" }, see: "The answer is" },
      { goal: "MOV 10 into R1.", lines: [L("MOV R1, 10")], spec: { code: /MOV\s+R1\s*,\s*10/i }, see: "your old lines" },
      { goal: "PRINT the score.", lines: [L("PRINT R1")], spec: { line: "10" }, see: "10" },
      { goal: "ADD nothing? Take a new box and show 8.", lines: [L("MOV R2, 8"), L("PRINT R2")], spec: { line: "8" }, see: "8" },
      { goal: "PRINT pass.", lines: [L('PRINT "pass"')], spec: { line: "pass" }, see: "pass" },
      { goal: "PRINT try.", lines: [L('PRINT "try"')], spec: { line: "try" }, see: "try" },
      { goal: "MOV 1 into R3.", lines: [L("MOV R3, 1")], spec: { code: /MOV\s+R3\s*,\s*1/i }, see: "your old lines" },
      { goal: "PRINT R3.", lines: [L("PRINT R3")], spec: { line: "1" }, see: "1" },
      { goal: "REPEAT 1 and 2.", lines: [L("MOV R1, 1"), L("REPEAT 2"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], spec: { line: ["1", "2"] }, see: "1 and 2" },
      { goal: "PRINT five arms.", lines: [L('PRINT "five arms"')], spec: { contains: "five arms" }, see: "five arms" },
      { goal: "PRINT lives in the sea.", lines: [L('PRINT "lives in the sea"')], spec: { contains: "lives in the sea" }, see: "lives in the sea" },
      { goal: "PRINT quiz done.", lines: [L('PRINT "quiz done"')], spec: { contains: "quiz done" }, see: "quiz done" },
      { goal: "REPEAT yay twice.", lines: [L("REPEAT 2"), L('PRINT "yay"', true), L("END")], spec: { minCount: { line: "yay", n: 2 } }, see: "yay twice" },
      { goal: "PRINT You finished the quiz!", lines: [L('PRINT "You finished the quiz!"')], spec: { contains: "you finished the quiz" }, see: "You finished the quiz!" },
    ]),
  },
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ocean adventure",
    blurb: "A hero box, a counting REPEAT, and a win line.",
    plan: ["Name the hero.", "Count with REPEAT.", "Print You win!"],
    steps: buildAsmSteps("Advanced step", [
      { goal: "PRINT Ocean Adventure.", fresh: true, lines: [L('PRINT "Ocean Adventure"')], spec: { contains: "ocean adventure" }, see: "Ocean Adventure" },
      { goal: "MOV hero Fin.", lines: [L('MOV hero, "Fin"')], spec: { code: /MOV\s+hero/i }, see: "the title" },
      { goal: "PRINT the hero.", lines: [L("PRINT hero")], spec: { line: "fin" }, see: "Fin" },
      { goal: "PRINT Go.", lines: [L('PRINT "Go"')], spec: { line: "go" }, see: "Go" },
      { goal: "MOV 3 into R1.", lines: [L("MOV R1, 3")], spec: { code: /MOV\s+R1\s*,\s*3/i }, see: "your old lines" },
      { goal: "PRINT R1.", lines: [L("PRINT R1")], spec: { line: "3" }, see: "3" },
      { goal: "REPEAT to print 1, 2, 3.", lines: [L("MOV R2, 1"), L("REPEAT 3"), L("PRINT R2", true), L("ADD R2, 1", true), L("END")], spec: { line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "PRINT strong.", lines: [L('PRINT "strong"')], spec: { line: "strong" }, see: "strong" },
      { goal: "PRINT rest.", lines: [L('PRINT "rest"')], spec: { line: "rest" }, see: "rest" },
      { goal: "MOV pal Bubbles.", lines: [L('MOV pal, "Bubbles"')], spec: { code: /MOV\s+pal/i }, see: "your old lines" },
      { goal: "PRINT the pal.", lines: [L("PRINT pal")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "PRINT You win!", lines: [L('PRINT "You win!"')], spec: { contains: "you win" }, see: "You win!" },
    ]),
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "A question, a score box, and a clap.",
    plan: ["Ask and answer.", "ADD the score.", "Clap at the end."],
    steps: buildAsmSteps("Advanced step", [
      { goal: "PRINT Hard Quiz.", fresh: true, lines: [L('PRINT "Hard Quiz"')], spec: { contains: "hard quiz" }, see: "Hard Quiz" },
      { goal: "PRINT a math question.", lines: [L('PRINT "What is 2 + 3?"')], spec: { contains: "2 + 3" }, see: "What is 2 + 3?" },
      { goal: "MOV answer 5.", lines: [L('MOV answer, "5"')], spec: { code: /MOV\s+answer/i }, see: "your old lines" },
      { goal: "PRINT the answer.", lines: [L("PRINT answer")], spec: { line: "5" }, see: "5" },
      { goal: "MOV 10 into R1.", lines: [L("MOV R1, 10")], spec: { code: /MOV\s+R1\s*,\s*10/i }, see: "your old lines" },
      { goal: "PRINT the points.", lines: [L("PRINT R1")], spec: { line: "10" }, see: "10" },
      { goal: "Show 9 in R2.", lines: [L("MOV R2, 9"), L("PRINT R2")], spec: { line: "9" }, see: "9" },
      { goal: "PRINT super.", lines: [L('PRINT "super"')], spec: { line: "super" }, see: "super" },
      { goal: "PRINT ok.", lines: [L('PRINT "ok"')], spec: { line: "ok" }, see: "ok" },
      { goal: "PRINT clap.", lines: [L('PRINT "clap"')], spec: { line: "clap" }, see: "clap" },
      { goal: "REPEAT clap twice.", lines: [L("REPEAT 2"), L('PRINT "clap"', true), L("END")], spec: { minCount: { line: "clap", n: 2 } }, see: "clap again" },
      { goal: "PRINT Quiz star!", lines: [L('PRINT "Quiz star!"')], spec: { contains: "quiz star" }, see: "Quiz star!" },
    ]),
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "Three animals and a counting REPEAT.",
    plan: ["Print three animals.", "Save a name.", "Finish the catalog."],
    steps: buildAsmSteps("Advanced step", [
      { goal: "PRINT Sea Catalog.", fresh: true, lines: [L('PRINT "Sea Catalog"')], spec: { contains: "sea catalog" }, see: "Sea Catalog" },
      { goal: "PRINT crab.", lines: [L('PRINT "crab"')], spec: { line: "crab" }, see: "crab" },
      { goal: "PRINT eel.", lines: [L('PRINT "eel"')], spec: { line: "eel" }, see: "eel" },
      { goal: "PRINT whale.", lines: [L('PRINT "whale"')], spec: { line: "whale" }, see: "whale" },
      { goal: "MOV first crab.", lines: [L('MOV first, "crab"')], spec: { code: /MOV\s+first/i }, see: "your old lines" },
      { goal: "PRINT first.", lines: [L("PRINT first")], spec: { minCount: { line: "crab", n: 2 } }, see: "crab again" },
      { goal: "MOV 3 into R1.", lines: [L("MOV R1, 3")], spec: { code: /MOV\s+R1\s*,\s*3/i }, see: "your old lines" },
      { goal: "PRINT the count.", lines: [L("PRINT R1")], spec: { line: "3" }, see: "3" },
      { goal: "REPEAT swim twice.", lines: [L("REPEAT 2"), L('PRINT "swim"', true), L("END")], spec: { minCount: { line: "swim", n: 2 } }, see: "swim twice" },
      { goal: "PRINT full tank.", lines: [L('PRINT "full tank"')], spec: { contains: "full tank" }, see: "full tank" },
      { goal: "ADD 1 and PRINT.", lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "4" }, see: "4" },
      { goal: "PRINT catalog done.", lines: [L('PRINT "catalog done"')], spec: { contains: "catalog done" }, see: "catalog done" },
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
