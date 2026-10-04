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

const starterCode = `cout << "Vent cold!" << endl;\n`;
const projectStarter = `cout << "Trench project" << endl;\n`;

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

function explainCppLine(line) {
  const t = String(line || "").trim();
  const quote = 'A quote is this mark: "';
  const semi = "Then type a semicolon. A semicolon is this mark: ;";
  let m = t.match(/^cout\s*<<\s*"([^"]*)"\s*<<\s*endl;$/);
  if (m) {
    return [
      'Type this exactly: cout << "' + m[1] + '" << endl;',
      "cout means show words on the screen.",
      "<< means send this to the screen.",
      "Type the word cout.",
      "Then type a space, then <<, then a space.",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type a space, then <<, then a space.",
      "Then type endl.",
      "endl means end the line and start the next line.",
      semi,
    ];
  }
  m = t.match(/^cout\s*<<\s*"([^"]*)"\s*<<\s*([A-Za-z_][A-Za-z0-9_]*)\s*<<\s*endl;$/);
  if (m) {
    return [
      'Type this exactly: cout << "' + m[1] + '" << ' + m[2] + " << endl;",
      "First send the words in quotes.",
      "Then << sends " + m[2] + " with no quotes.",
      "Type cout, a space, <<, a space.",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type a space, <<, a space, then " + m[2],
      "Then type a space, <<, a space, then endl",
      semi,
    ];
  }
  m = t.match(/^cout\s*<<\s*([A-Za-z_][A-Za-z0-9_]*)\s*<<\s*endl;$/);
  if (m) {
    return [
      "Type this exactly: cout << " + m[1] + " << endl;",
      "cout means show this on the screen.",
      "Type the word cout.",
      "Then type a space, then <<, then a space.",
      "Then type " + m[1] + " with no quotes.",
      "Then type a space, then <<, then a space, then endl",
      semi,
    ];
  }
  m = t.match(/^cout\s*<<\s*(.+)\s*<<\s*endl;$/);
  if (m) {
    return [
      "Type this exactly: cout << " + m[1] + " << endl;",
      "This sends " + m[1] + " to the screen.",
      "Type cout, a space, <<, a space.",
      "Then type " + m[1],
      "Then type a space, <<, a space, then endl",
      semi,
    ];
  }
  m = t.match(/^string\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)";$/);
  if (m) {
    return [
      'Type this exactly: string ' + m[1] + ' = "' + m[2] + '";',
      "string means words.",
      "A variable is a name that remembers a word.",
      "Type the word string.",
      "Then type a space, then " + m[1],
      "Then type a space, then =, then a space.",
      "= means remember this.",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
      semi,
    ];
  }
  m = t.match(/^int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+);$/);
  if (m) {
    return [
      "Type this exactly: int " + m[1] + " = " + m[2] + ";",
      "int means a whole number.",
      "A variable is a name that remembers that number.",
      "Type the word int.",
      "Then type a space, then " + m[1],
      "Then type a space, then =, then a space.",
      "Then type " + m[2],
      semi,
      "Do not put quotes around a number.",
    ];
  }
  m = t.match(/^for\s*\(\s*int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\d+)\s*;\s*\1\s*(<=|<)\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means do the next lines again and again.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type a space, then this mark: (",
      "Then type int, a space, " + m[1] + " = " + m[2],
      semi,
      "Then type a space, then " + m[1] + " " + m[3] + " " + m[4],
      semi,
      "Then type a space, then " + m[1] + "++",
      m[1] + "++ means add 1 each time.",
      "Then type this mark: )",
      "Then type a space, then this mark: {",
      "{ opens the loop. The next line belongs inside.",
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
  m = t.match(/^void\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "void starts a function. A function is a recipe you can run later.",
      "Type the word void.",
      "Then type a space, then " + m[1],
      "Then type this mark: (",
      "Then type " + (m[2] || "nothing"),
      "Then type this mark: )",
      "Then type a space, then this mark: {",
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
    pushBits(steps, explainCppLine(line.text));
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

  add("Change cold to hot.", false, [L("cout << \"Vent hot!\" << endl;")], { contains: "vent hot!" }, "Vent hot!", "cout << \"Vent hot!\" << endl;\n");
  list[0].help = numbered(["Keep your old code. Do not erase the whole line.","Click in the code box.","Click on the word cold.","Delete those letters.","Type the new word in that same spot.","The line should look like this: cout << \"Vent hot!\" << endl;","cout means show words on the screen.","<< sends the words out.","endl means start the next line.","Keep the semicolon ; at the end.","Press the Run button. It is at the top.","You should see Vent hot!"]);
  add("Print angler.", false, [L("cout << \"angler\" << endl;")], { contains: "angler" }, "angler");
  add("Print squid.", false, [L("cout << \"squid\" << endl;")], { contains: "squid" }, "squid");
  add("Print plume.", false, [L("cout << \"plume\" << endl;")], { contains: "plume" }, "plume");
  add("Print rift.", false, [L("cout << \"rift\" << endl;")], { contains: "rift" }, "rift");
  add("Print the number 5.", true, [L("cout << 5 << endl;")], { line: "5" }, "5");
  add("Print the number 8.", true, [L("cout << 8 << endl;")], { line: "8" }, "8");
  add("Print the number 12.", true, [L("cout << 12 << endl;")], { line: "12" }, "12");
  add("Print two lines about the trench.", true, [L("cout << \"Angie lights up.\" << endl;"), L("cout << \"The vent puffs.\" << endl;")], { contains: ["angie lights up.","the vent puffs."] }, "The vent puffs.");
  add("Print two lines about the trench.", true, [L("cout << \"A squid darts.\" << endl;"), L("cout << \"The rift glows.\" << endl;")], { contains: ["a squid darts.","the rift glows."] }, "The rift glows.");
  add("Print two lines about the trench.", true, [L("cout << \"Plumes rise.\" << endl;"), L("cout << \"The deep is quiet.\" << endl;")], { contains: ["plumes rise.","the deep is quiet."] }, "The deep is quiet.");
  add("Remember Angie in fish.", true, [L("string fish = \"Angie\";"), L("cout << fish << endl;")], { line: "angie", code: /fish\s*:?=\s*["']Angie["']/ }, "Angie");
  add("Remember Squid in ink.", true, [L("string ink = \"Squid\";"), L("cout << ink << endl;")], { line: "squid", code: /ink\s*:?=\s*["']Squid["']/ }, "Squid");
  add("Remember Rift in crack.", true, [L("string crack = \"Rift\";"), L("cout << crack << endl;")], { line: "rift", code: /crack\s*:?=\s*["']Rift["']/ }, "Rift");
  add("Remember Plume in smoke.", true, [L("string smoke = \"Plume\";"), L("cout << smoke << endl;")], { line: "plume", code: /smoke\s*:?=\s*["']Plume["']/ }, "Plume");
  add("Remember Gloom in pal.", true, [L("string pal = \"Gloom\";"), L("cout << pal << endl;")], { line: "gloom", code: /pal\s*:?=\s*["']Gloom["']/ }, "Gloom");
  add("Remember Lure in lamp.", true, [L("string lamp = \"Lure\";"), L("cout << lamp << endl;")], { line: "lure", code: /lamp\s*:?=\s*["']Lure["']/ }, "Lure");
  add("Remember the number 3 in vents.", true, [L("int vents = 3;"), L("cout << vents << endl;")], { line: "3", code: /vents\s*:?=\s*3\b/ }, "3");
  add("Remember the number 8 in arms.", true, [L("int arms = 8;"), L("cout << arms << endl;")], { line: "8", code: /arms\s*:?=\s*8\b/ }, "8");
  add("Remember the number 2 in miles.", true, [L("int miles = 2;"), L("cout << miles << endl;")], { line: "2", code: /miles\s*:?=\s*2\b/ }, "2");
  add("Remember the number 5 in puffs.", true, [L("int puffs = 5;"), L("cout << puffs << endl;")], { line: "5", code: /puffs\s*:?=\s*5\b/ }, "5");
  add("Say Hey to Angie.", true, [L("string who = \"Angie\";"), L("cout << \"Hey \" << who << endl;")], { contains: "hey angie" }, "Hey Angie");
  add("Say Hi to Squid.", true, [L("string who = \"Squid\";"), L("cout << \"Hi \" << who << endl;")], { contains: "hi squid" }, "Hi Squid");
  add("Say Hello to Rift.", true, [L("string who = \"Rift\";"), L("cout << \"Hello \" << who << endl;")], { contains: "hello rift" }, "Hello Rift");
  add("Say Yo to Plume.", true, [L("string who = \"Plume\";"), L("cout << \"Yo \" << who << endl;")], { contains: "yo plume" }, "Yo Plume");
  add("Say Hey to Gloom.", true, [L("string who = \"Gloom\";"), L("cout << \"Hey \" << who << endl;")], { contains: "hey gloom" }, "Hey Gloom");
  add("Print the answer to 6 + 2.", true, [L("cout << 6 + 2 << endl;")], { line: "8", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "8");
  add("Print the answer to 9 - 1.", true, [L("cout << 9 - 1 << endl;")], { line: "8", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "8");
  add("Print the answer to 5 * 2.", true, [L("cout << 5 * 2 << endl;")], { line: "10", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "10");
  add("Print the answer to 7 - 4.", true, [L("cout << 7 - 4 << endl;")], { line: "3", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "3");
  add("Print the answer to 3 + 6.", true, [L("cout << 3 + 6 << endl;")], { line: "9", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "9");
  add("Print the answer to 2 * 6.", true, [L("cout << 2 * 6 << endl;")], { line: "12", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "12");
  add("Start vents at 3, then print vents + 4.", true, [L("int vents = 3;"), L("cout << vents + 4 << endl;")], { line: "7", code: /vents\s*\+\s*4/ }, "7");
  add("Start arms at 8, then print arms - 3.", true, [L("int arms = 8;"), L("cout << arms - 3 << endl;")], { line: "5", code: /arms\s*\-\s*3/ }, "5");
  add("Start miles at 2, then print miles * 3.", true, [L("int miles = 2;"), L("cout << miles * 3 << endl;")], { line: "6", code: /miles\s*\*\s*3/ }, "6");
  add("Start puffs at 5, then print puffs + 5.", true, [L("int puffs = 5;"), L("cout << puffs + 5 << endl;")], { line: "10", code: /puffs\s*\+\s*5/ }, "10");
  add("Start vents at 9, then print vents - 2.", true, [L("int vents = 9;"), L("cout << vents - 2 << endl;")], { line: "7", code: /vents\s*\-\s*2/ }, "7");
  add("Remember Angie and Squid.", true, [L("string one = \"Angie\";"), L("string two = \"Squid\";"), L("cout << one << endl;"), L("cout << two << endl;")], { line: ["angie","squid"] }, "Angie and Squid");
  add("Remember Rift and Gloom.", true, [L("string vent = \"Rift\";"), L("string ink = \"Gloom\";"), L("cout << vent << endl;"), L("cout << ink << endl;")], { line: ["rift","gloom"] }, "Rift and Gloom");
  add("Remember Plume and Lure.", true, [L("string a = \"Plume\";"), L("string b = \"Lure\";"), L("cout << a << endl;"), L("cout << b << endl;")], { line: ["plume","lure"] }, "Plume and Lure");
  add("Remember Angler and Squid.", true, [L("string top = \"Angler\";"), L("string low = \"Squid\";"), L("cout << top << endl;"), L("cout << low << endl;")], { line: ["angler","squid"] }, "Angler and Squid");
  add("If the number is > 3, print hot.", true, [L("int score = 9;"), L("if (score > 3) {"), L("cout << \"hot\" << endl;", true), L("}")], { line: "hot", code: /\bif\b/ }, "hot");
  add("If the number is > 2, print glow.", true, [L("int score = 5;"), L("if (score > 2) {"), L("cout << \"glow\" << endl;", true), L("}")], { line: "glow", code: /\bif\b/ }, "glow");
  add("If the number is < 4, print cold.", true, [L("int score = 1;"), L("if (score < 4) {"), L("cout << \"cold\" << endl;", true), L("}")], { line: "cold", code: /\bif\b/ }, "cold");
  add("If the number is > 6, print deep.", true, [L("int score = 8;"), L("if (score > 6) {"), L("cout << \"deep\" << endl;", true), L("}")], { line: "deep", code: /\bif\b/ }, "deep");
  add("If the number is < 9, print near.", true, [L("int score = 2;"), L("if (score < 9) {"), L("cout << \"near\" << endl;", true), L("}")], { line: "near", code: /\bif\b/ }, "near");
  add("If the number is > 1, print wide.", true, [L("int score = 7;"), L("if (score > 1) {"), L("cout << \"wide\" << endl;", true), L("}")], { line: "wide", code: /\bif\b/ }, "wide");
  add("Use if and else so you print cold.", true, [L("int score = 2;"), L("if (score > 6) {"), L("cout << \"hot\" << endl;", true), L("}"), L("else {"), L("cout << \"cold\" << endl;", true), L("}")], { line: "cold", code: /\bif\b[\s\S]*\belse\b/ }, "cold");
  add("Use if and else so you print glow.", true, [L("int score = 9;"), L("if (score > 4) {"), L("cout << \"glow\" << endl;", true), L("}"), L("else {"), L("cout << \"dark\" << endl;", true), L("}")], { line: "glow", code: /\bif\b[\s\S]*\belse\b/ }, "glow");
  add("Use if and else so you print risen.", true, [L("int score = 3;"), L("if (score < 3) {"), L("cout << \"low\" << endl;", true), L("}"), L("else {"), L("cout << \"risen\" << endl;", true), L("}")], { line: "risen", code: /\bif\b[\s\S]*\belse\b/ }, "risen");
  add("Use if and else so you print small.", true, [L("int score = 1;"), L("if (score < 5) {"), L("cout << \"small\" << endl;", true), L("}"), L("else {"), L("cout << \"huge\" << endl;", true), L("}")], { line: "small", code: /\bif\b[\s\S]*\belse\b/ }, "small");
  add("Use if and else so you print dark.", true, [L("int score = 0;"), L("if (score > 1) {"), L("cout << \"yes\" << endl;", true), L("}"), L("else {"), L("cout << \"dark\" << endl;", true), L("}")], { line: "dark", code: /\bif\b[\s\S]*\belse\b/ }, "dark");
  add("Use if and else so you print deeper.", true, [L("int score = 4;"), L("if (score > 4) {"), L("cout << \"max\" << endl;", true), L("}"), L("else {"), L("cout << \"deeper\" << endl;", true), L("}")], { line: "deeper", code: /\bif\b[\s\S]*\belse\b/ }, "deeper");
  add("Use if and else so you print venting.", true, [L("int score = 6;"), L("if (score < 8) {"), L("cout << \"venting\" << endl;", true), L("}"), L("else {"), L("cout << \"nope\" << endl;", true), L("}")], { line: "venting", code: /\bif\b[\s\S]*\belse\b/ }, "venting");
  add("Use if and else so you print rise.", true, [L("int score = 8;"), L("if (score > 2) {"), L("cout << \"rise\" << endl;", true), L("}"), L("else {"), L("cout << \"sink\" << endl;", true), L("}")], { line: "rise", code: /\bif\b[\s\S]*\belse\b/ }, "rise");
  add("Use a loop to print pulse 2 times.", true, [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"pulse\" << endl;", true), L("}")], { minCount: { line: "pulse", n: 2 }, code: /for\s*\(\s*int/ }, "pulse 2 times");
  add("Use a loop to print pulse 3 times.", true, [L("for (int i = 1; i <= 3; i++) {"), L("cout << \"pulse\" << endl;", true), L("}")], { minCount: { line: "pulse", n: 3 }, code: /for\s*\(\s*int/ }, "pulse 3 times");
  add("Use a loop to print dive 2 times.", true, [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"dive\" << endl;", true), L("}")], { minCount: { line: "dive", n: 2 }, code: /for\s*\(\s*int/ }, "dive 2 times");
  add("Use a loop to print sink 3 times.", true, [L("for (int i = 1; i <= 3; i++) {"), L("cout << \"sink\" << endl;", true), L("}")], { minCount: { line: "sink", n: 3 }, code: /for\s*\(\s*int/ }, "sink 3 times");
  add("Use a loop to print rise 2 times.", true, [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"rise\" << endl;", true), L("}")], { minCount: { line: "rise", n: 2 }, code: /for\s*\(\s*int/ }, "rise 2 times");
  add("Use a loop to print gleam 4 times.", true, [L("for (int i = 1; i <= 4; i++) {"), L("cout << \"gleam\" << endl;", true), L("}")], { minCount: { line: "gleam", n: 4 }, code: /for\s*\(\s*int/ }, "gleam 4 times");
  add("Use a loop to print 5, then 6, then 7, then 8.", true, [L("for (int i = 5; i <= 8; i++) {"), L("cout << i << endl;", true), L("}")], { line: ["5","6","7","8"], code: /for\s*\(\s*int/ }, "5 then 6 then 7 then 8");
  add("Use a loop to print 10, then 11, then 12.", true, [L("for (int i = 10; i <= 12; i++) {"), L("cout << i << endl;", true), L("}")], { line: ["10","11","12"], code: /for\s*\(\s*int/ }, "10 then 11 then 12");
  add("Use a loop to print 3.", true, [L("for (int i = 3; i <= 3; i++) {"), L("cout << i << endl;", true), L("}")], { line: ["3"], code: /for\s*\(\s*int/ }, "3");
  add("Use a loop to print 7, then 8, then 9, then 10.", true, [L("for (int i = 7; i <= 10; i++) {"), L("cout << i << endl;", true), L("}")], { line: ["7","8","9","10"], code: /for\s*\(\s*int/ }, "7 then 8 then 9 then 10");
  add("Use a loop to print 0, then 1, then 2.", true, [L("for (int i = 0; i <= 2; i++) {"), L("cout << i << endl;", true), L("}")], { line: ["0","1","2"], code: /for\s*\(\s*int/ }, "0 then 1 then 2");
  add("Use a loop to print 6.", true, [L("for (int i = 6; i <= 6; i++) {"), L("cout << i << endl;", true), L("}")], { line: ["6"], code: /for\s*\(\s*int/ }, "6");
  add("Add 3 and 2 from two names.", true, [L("int left = 3;"), L("int right = 2;"), L("cout << left + right << endl;")], { line: "5", code: /left\s*\+\s*right/ }, "5");
  add("Add 6 and 3 from two names.", true, [L("int left = 6;"), L("int right = 3;"), L("cout << left + right << endl;")], { line: "9", code: /left\s*\+\s*right/ }, "9");
  add("Add 1 and 7 from two names.", true, [L("int left = 1;"), L("int right = 7;"), L("cout << left + right << endl;")], { line: "8", code: /left\s*\+\s*right/ }, "8");
  add("Add 4 and 5 from two names.", true, [L("int left = 4;"), L("int right = 5;"), L("cout << left + right << endl;")], { line: "9", code: /left\s*\+\s*right/ }, "9");
  add("Add 8 and 1 from two names.", true, [L("int left = 8;"), L("int right = 1;"), L("cout << left + right << endl;")], { line: "9", code: /left\s*\+\s*right/ }, "9");
  add("Add 2 and 8 from two names.", true, [L("int left = 2;"), L("int right = 8;"), L("cout << left + right << endl;")], { line: "10", code: /left\s*\+\s*right/ }, "10");
  add("Make a recipe pulse that prints pulse.", true, [L("void pulse() {"), L("cout << \"pulse\" << endl;", true), L("}"), L("pulse();")], { line: "pulse", code: /void\s+pulse\s*\(/ }, "pulse");
  add("Make a recipe dive that prints dive.", true, [L("void dive() {"), L("cout << \"dive\" << endl;", true), L("}"), L("dive();")], { line: "dive", code: /void\s+dive\s*\(/ }, "dive");
  add("Make a recipe sink that prints sink.", true, [L("void sink() {"), L("cout << \"sink\" << endl;", true), L("}"), L("sink();")], { line: "sink", code: /void\s+sink\s*\(/ }, "sink");
  add("Make a recipe rise that prints rise.", true, [L("void rise() {"), L("cout << \"rise\" << endl;", true), L("}"), L("rise();")], { line: "rise", code: /void\s+rise\s*\(/ }, "rise");
  add("Make a recipe lurk that prints lurk.", true, [L("void lurk() {"), L("cout << \"lurk\" << endl;", true), L("}"), L("lurk();")], { line: "lurk", code: /void\s+lurk\s*\(/ }, "lurk");
  add("Make a recipe gleam that prints gleam.", true, [L("void gleam() {"), L("cout << \"gleam\" << endl;", true), L("}"), L("gleam();")], { line: "gleam", code: /void\s+gleam\s*\(/ }, "gleam");
  add("Make callangie print the name you give it.", true, [L("void callangie(name) {"), L("cout << name << endl;", true), L("}"), L("callangie(\"Angie\");")], { line: "angie", code: /void\s+callangie\s*\(/ }, "Angie");
  add("Make callsquid print the name you give it.", true, [L("void callsquid(name) {"), L("cout << name << endl;", true), L("}"), L("callsquid(\"Squid\");")], { line: "squid", code: /void\s+callsquid\s*\(/ }, "Squid");
  add("Make callrift print the name you give it.", true, [L("void callrift(name) {"), L("cout << name << endl;", true), L("}"), L("callrift(\"Rift\");")], { line: "rift", code: /void\s+callrift\s*\(/ }, "Rift");
  add("Make callgloom print the name you give it.", true, [L("void callgloom(name) {"), L("cout << name << endl;", true), L("}"), L("callgloom(\"Gloom\");")], { line: "gloom", code: /void\s+callgloom\s*\(/ }, "Gloom");
  add("Make calllure print the name you give it.", true, [L("void calllure(name) {"), L("cout << name << endl;", true), L("}"), L("calllure(\"Lure\");")], { line: "lure", code: /void\s+calllure\s*\(/ }, "Lure");
  add("Save a score, then print hot when it is big.", true, [L("int score = 9;"), L("if (score > 3) {"), L("cout << \"hot\" << endl;", true), L("}"), L("else {"), L("cout << \"cold\" << endl;", true), L("}")], { line: "hot", code: /\bif\b/ }, "hot");
  add("Print Trench log, then loop pulse twice.", true, [L("cout << \"Trench log\" << endl;"), L("for (int i = 1; i <= 2; i++) {"), L("cout << \"pulse\" << endl;", true), L("}")], { contains: "trench log", minCount: { line: "pulse", n: 2 }, code: /for\s*\(\s*int/ }, "Trench log and pulse");
  add("Remember two names, Angie and Squid.", true, [L("string one = \"Angie\";"), L("string two = \"Squid\";"), L("cout << one << endl;"), L("cout << two << endl;")], { line: ["angie","squid"] }, "Angie and Squid");
  add("Take 5 away from 11.", true, [L("int bag = 11;"), L("cout << bag - 5 << endl;")], { line: "6", code: /bag\s*-\s*5/ }, "6");
  add("Run a recipe, then print angler.", true, [L("string pet = \"angler\";"), L("void pulse() {"), L("cout << \"pulsed\" << endl;", true), L("}"), L("pulse();"), L("cout << pet << endl;")], { line: ["pulsed","angler"], code: /void\s+pulse\s*\(/ }, "pulsed and angler");
  add("Count 1 then 2, then print trench done.", true, [L("for (int i = 1; i <= 2; i++) {"), L("cout << i << endl;", true), L("}"), L("cout << \"trench done\" << endl;")], { contains: "trench done", line: ["1","2"], code: /for\s*\(\s*int/ }, "1, 2, and trench done");
  add("Use else so a tiny score prints cold.", true, [L("int score = 1;"), L("if (score > 5) {"), L("cout << \"hot\" << endl;", true), L("}"), L("else {"), L("cout << \"cold\" << endl;", true), L("}")], { line: "cold", code: /\belse\b/ }, "cold");
  add("Make two recipes, pulse and dive.", true, [L("void pulse() {"), L("cout << \"pulsed\" << endl;", true), L("}"), L("pulse();"), L("void dive() {"), L("cout << \"dived\" << endl;", true), L("}"), L("dive();")], { line: ["pulsed","dived"], code: /void\s+pulse\s*\(/ }, "pulsed and dived");
  add("Greet Angie, then print a big score.", true, [L("string who = \"Angie\";"), L("cout << \"Hey \" << who << endl;"), L("int score = 8;"), L("if (score > 3) {"), L("cout << \"hot\" << endl;", true), L("}"), L("else {"), L("cout << \"cold\" << endl;", true), L("}")], { contains: "hey angie", line: "hot" }, "Hey Angie");
  add("Add 2 to vents, then loop pulse.", true, [L("int vents = 3;"), L("cout << vents + 2 << endl;"), L("for (int i = 1; i <= 2; i++) {"), L("cout << \"pulse\" << endl;", true), L("}")], { line: "5", minCount: { line: "pulse", n: 2 }, code: /for\s*\(\s*int/ }, "5");
  add("Give callangie the name Angie.", true, [L("void callangie(name) {"), L("cout << name << endl;", true), L("}"), L("callangie(\"Angie\");")], { line: "angie", code: /void\s+callangie\s*\(/ }, "Angie");
  add("Count 1, 2, 3, then print trench done.", true, [L("for (int i = 1; i <= 3; i++) {"), L("cout << i << endl;", true), L("}"), L("cout << \"trench done\" << endl;")], { contains: "trench done", line: ["1","2","3"], code: /for\s*\(\s*int/ }, "1, 2, 3, and trench done");
  add("If Angie is the hero, print glowing.", true, [L("string hero = \"Angie\";"), L("cout << hero << endl;"), L("if (hero == \"Angie\") {"), L("cout << \"glowing\" << endl;", true), L("}")], { line: "glowing", code: /\bif\b/ }, "glowing");
  add("Mix a name, if, a loop, and a recipe.", true, [L("cout << \"Trench log\" << endl;"), L("string hero = \"Angie\";"), L("cout << hero << endl;"), L("if (hero == \"Angie\") {"), L("cout << \"glowing\" << endl;", true), L("}"), L("for (int i = 1; i <= 2; i++) {"), L("cout << \"pulse\" << endl;", true), L("}"), L("void dive() {"), L("cout << \"dived\" << endl;", true), L("}"), L("dive();")], { line: ["angie","glowing","dived"], minCount: { line: "pulse", n: 2 }, code: /void\s+dive\s*\(/ }, "glowing and dived");
  add("Take 5 from 11, then print hot.", true, [L("int bag = 11;"), L("cout << bag - 5 << endl;"), L("if (bag > 5) {"), L("cout << \"hot\" << endl;", true), L("}")], { line: ["6","hot"], code: /\bif\b/ }, "hot");
  add("Print Angie, then loop pulse three times.", true, [L("cout << \"Angie\" << endl;"), L("for (int i = 1; i <= 3; i++) {"), L("cout << \"pulse\" << endl;", true), L("}")], { line: "angie", minCount: { line: "pulse", n: 3 }, code: /for\s*\(\s*int/ }, "Angie and pulse");
  if (list.length !== 100) {
    throw new Error("expected 100 tasks, got " + list.length);
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
    title: "Trench Tale",
    blurb: "A deep-trench story with a name, a number, and if.",
    plan: ["Print the tale.","Remember Angie.","Choose a path."],
    steps: buildCppSteps("Project step", [
      { goal: "Print Trench Tale.", fresh: true, lines: [L("cout << \"Trench Tale\" << endl;")], spec: { contains: "trench tale" }, see: "Trench Tale" },
      { goal: "Add the line Angie lights up..", fresh: false, lines: [L("cout << \"Angie lights up.\" << endl;")], spec: { contains: "angie lights up." }, see: "Angie lights up." },
      { goal: "Add one more line.", fresh: false, lines: [L("cout << \"The vent puffs.\" << endl;")], spec: { contains: "the vent puffs." }, see: "The vent puffs." },
      { goal: "Remember the name Angie.", fresh: false, lines: [L("string hero = \"Angie\";")], spec: { code: /hero\s*:?=\s*["']Angie["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("cout << hero << endl;")], spec: { line: "angie" }, see: "Angie" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("cout << \"Hey \" << hero << endl;")], spec: { contains: "hey angie" }, see: "Hey Angie" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("int vents = 3;")], spec: { code: /vents\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("cout << vents << endl;")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("cout << vents + 1 << endl;")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print hot.", fresh: false, lines: [L("if (vents > 2) {"), L("cout << \"hot\" << endl;", true), L("}")], spec: { line: "hot", code: /\bif\b/ }, see: "hot" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("cout << \"cold\" << endl;", true), L("}")], spec: { code: /\belse\b/ }, see: "hot still", note: "Click after the line that prints hot." },
      { goal: "Loop pulse twice.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"pulse\" << endl;", true), L("}")], spec: { minCount: { line: "pulse", n: 2 }, code: /for\s*\(\s*int/ }, see: "pulse twice" }
    ]),
  },
  {
    id: "names",
    title: "Vent Names",
    blurb: "Name the deep animals and count vents.",
    plan: ["Print a title.","Save a name.","Add else."],
    steps: buildCppSteps("Project step", [
      { goal: "Print Vent Names.", fresh: true, lines: [L("cout << \"Vent Names\" << endl;")], spec: { contains: "vent names" }, see: "Vent Names" },
      { goal: "Add the line Squid darts past..", fresh: false, lines: [L("cout << \"Squid darts past.\" << endl;")], spec: { contains: "squid darts past." }, see: "Squid darts past." },
      { goal: "Add one more line.", fresh: false, lines: [L("cout << \"Rift glows blue.\" << endl;")], spec: { contains: "rift glows blue." }, see: "Rift glows blue." },
      { goal: "Remember the name Squid.", fresh: false, lines: [L("string hero = \"Squid\";")], spec: { code: /hero\s*:?=\s*["']Squid["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("cout << hero << endl;")], spec: { line: "squid" }, see: "Squid" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("cout << \"Hi \" << hero << endl;")], spec: { contains: "hi squid" }, see: "Hi Squid" },
      { goal: "Remember the number 8.", fresh: false, lines: [L("int arms = 8;")], spec: { code: /arms\s*:?=\s*8\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("cout << arms << endl;")], spec: { line: "8" }, see: "8" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("cout << arms + 1 << endl;")], spec: { line: "9" }, see: "9" },
      { goal: "If the number is big, print many.", fresh: false, lines: [L("if (arms > 7) {"), L("cout << \"many\" << endl;", true), L("}")], spec: { line: "many", code: /\bif\b/ }, see: "many" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("cout << \"few\" << endl;", true), L("}")], spec: { code: /\belse\b/ }, see: "many still", note: "Click after the line that prints many." },
      { goal: "Loop dive twice.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"dive\" << endl;", true), L("}")], spec: { minCount: { line: "dive", n: 2 }, code: /for\s*\(\s*int/ }, see: "dive twice" }
    ]),
  },
  {
    id: "quiz",
    title: "Vent Quiz",
    blurb: "A trench quiz with a score.",
    plan: ["Ask a question.","Save a score.","Print the path."],
    steps: buildCppSteps("Project step", [
      { goal: "Print Vent Quiz.", fresh: true, lines: [L("cout << \"Vent Quiz\" << endl;")], spec: { contains: "vent quiz" }, see: "Vent Quiz" },
      { goal: "Add the line What puffs from a vent?.", fresh: false, lines: [L("cout << \"What puffs from a vent?\" << endl;")], spec: { contains: "what puffs from a vent?" }, see: "What puffs from a vent?" },
      { goal: "Add one more line.", fresh: false, lines: [L("cout << \"A hot plume.\" << endl;")], spec: { contains: "a hot plume." }, see: "A hot plume." },
      { goal: "Remember the name Plume.", fresh: false, lines: [L("string hero = \"Plume\";")], spec: { code: /hero\s*:?=\s*["']Plume["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("cout << hero << endl;")], spec: { line: "plume" }, see: "Plume" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("cout << \"Hello \" << hero << endl;")], spec: { contains: "hello plume" }, see: "Hello Plume" },
      { goal: "Remember the number 5.", fresh: false, lines: [L("int score = 5;")], spec: { code: /score\s*:?=\s*5\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("cout << score << endl;")], spec: { line: "5" }, see: "5" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("cout << score + 1 << endl;")], spec: { line: "6" }, see: "6" },
      { goal: "If the number is big, print hot.", fresh: false, lines: [L("if (score > 4) {"), L("cout << \"hot\" << endl;", true), L("}")], spec: { line: "hot", code: /\bif\b/ }, see: "hot" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("cout << \"cold\" << endl;", true), L("}")], spec: { code: /\belse\b/ }, see: "hot still", note: "Click after the line that prints hot." },
      { goal: "Loop sink twice.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"sink\" << endl;", true), L("}")], spec: { minCount: { line: "sink", n: 2 }, code: /for\s*\(\s*int/ }, see: "sink twice" }
    ]),
  }
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Rift Adventure",
    blurb: "A harder rift path with a loop and a recipe.",
    plan: ["Name the rift.","Test the score.","Pulse and dive."],
    steps: buildCppSteps("Advanced step", [
      { goal: "Print Rift Adventure.", fresh: true, lines: [L("cout << \"Rift Adventure\" << endl;")], spec: { contains: "rift adventure" }, see: "Rift Adventure" },
      { goal: "Add the line The miles are deep..", fresh: false, lines: [L("cout << \"The miles are deep.\" << endl;")], spec: { contains: "the miles are deep." }, see: "The miles are deep." },
      { goal: "Add one more line.", fresh: false, lines: [L("cout << \"Gloom swims close.\" << endl;")], spec: { contains: "gloom swims close." }, see: "Gloom swims close." },
      { goal: "Remember the name Rift.", fresh: false, lines: [L("string hero = \"Rift\";")], spec: { code: /hero\s*:?=\s*["']Rift["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("cout << hero << endl;")], spec: { line: "rift" }, see: "Rift" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("cout << \"Hey \" << hero << endl;")], spec: { contains: "hey rift" }, see: "Hey Rift" },
      { goal: "Remember the number 2.", fresh: false, lines: [L("int miles = 2;")], spec: { code: /miles\s*:?=\s*2\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("cout << miles << endl;")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("cout << miles + 1 << endl;")], spec: { line: "3" }, see: "3" },
      { goal: "If the number is big, print deep.", fresh: false, lines: [L("if (miles > 1) {"), L("cout << \"deep\" << endl;", true), L("}")], spec: { line: "deep", code: /\bif\b/ }, see: "deep" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("cout << \"near\" << endl;", true), L("}")], spec: { code: /\belse\b/ }, see: "deep still", note: "Click after the line that prints deep." },
      { goal: "Loop pulse twice, then run a recipe.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"pulse\" << endl;", true), L("}"), L("void dive() {"), L("cout << \"dived\" << endl;", true), L("}"), L("dive();")], spec: { line: "dived", minCount: { line: "pulse", n: 2 }, code: /void\s+dive\s*\(/ }, see: "dived" }
    ]),
  },
  {
    id: "scorequiz",
    title: "Squid Quiz",
    blurb: "A harder squid quiz with a recipe.",
    plan: ["Print the quiz.","Add a score.","Rise at the end."],
    steps: buildCppSteps("Advanced step", [
      { goal: "Print Squid Quiz.", fresh: true, lines: [L("cout << \"Squid Quiz\" << endl;")], spec: { contains: "squid quiz" }, see: "Squid Quiz" },
      { goal: "Add the line How many arms?.", fresh: false, lines: [L("cout << \"How many arms?\" << endl;")], spec: { contains: "how many arms?" }, see: "How many arms?" },
      { goal: "Add one more line.", fresh: false, lines: [L("cout << \"Count them.\" << endl;")], spec: { contains: "count them." }, see: "Count them." },
      { goal: "Remember the name Gloom.", fresh: false, lines: [L("string hero = \"Gloom\";")], spec: { code: /hero\s*:?=\s*["']Gloom["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("cout << hero << endl;")], spec: { line: "gloom" }, see: "Gloom" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("cout << \"Hi \" << hero << endl;")], spec: { contains: "hi gloom" }, see: "Hi Gloom" },
      { goal: "Remember the number 9.", fresh: false, lines: [L("int points = 9;")], spec: { code: /points\s*:?=\s*9\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("cout << points << endl;")], spec: { line: "9" }, see: "9" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("cout << points + 1 << endl;")], spec: { line: "10" }, see: "10" },
      { goal: "If the number is big, print pass.", fresh: false, lines: [L("if (points > 8) {"), L("cout << \"pass\" << endl;", true), L("}")], spec: { line: "pass", code: /\bif\b/ }, see: "pass" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("cout << \"miss\" << endl;", true), L("}")], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the line that prints pass." },
      { goal: "Loop gleam twice, then run a recipe.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"gleam\" << endl;", true), L("}"), L("void rise() {"), L("cout << \"rose\" << endl;", true), L("}"), L("rise();")], spec: { line: "rose", minCount: { line: "gleam", n: 2 }, code: /void\s+rise\s*\(/ }, see: "rose" }
    ]),
  },
  {
    id: "catalog",
    title: "Trench Catalog",
    blurb: "Catalog the deep, then loop.",
    plan: ["Name the animals.","Count them.","Run a recipe."],
    steps: buildCppSteps("Advanced step", [
      { goal: "Print Trench Catalog.", fresh: true, lines: [L("cout << \"Trench Catalog\" << endl;")], spec: { contains: "trench catalog" }, see: "Trench Catalog" },
      { goal: "Add the line Angler..", fresh: false, lines: [L("cout << \"Angler.\" << endl;")], spec: { contains: "angler." }, see: "Angler." },
      { goal: "Add one more line.", fresh: false, lines: [L("cout << \"Squid.\" << endl;")], spec: { contains: "squid." }, see: "Squid." },
      { goal: "Remember the name Lure.", fresh: false, lines: [L("string hero = \"Lure\";")], spec: { code: /hero\s*:?=\s*["']Lure["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("cout << hero << endl;")], spec: { line: "lure" }, see: "Lure" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("cout << \"Hello \" << hero << endl;")], spec: { contains: "hello lure" }, see: "Hello Lure" },
      { goal: "Remember the number 4.", fresh: false, lines: [L("int count = 4;")], spec: { code: /count\s*:?=\s*4\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("cout << count << endl;")], spec: { line: "4" }, see: "4" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("cout << count + 1 << endl;")], spec: { line: "5" }, see: "5" },
      { goal: "If the number is big, print full.", fresh: false, lines: [L("if (count > 3) {"), L("cout << \"full\" << endl;", true), L("}")], spec: { line: "full", code: /\bif\b/ }, see: "full" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("cout << \"more\" << endl;", true), L("}")], spec: { code: /\belse\b/ }, see: "full still", note: "Click after the line that prints full." },
      { goal: "Loop lurk twice, then run a recipe.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("cout << \"lurk\" << endl;", true), L("}"), L("void gleam() {"), L("cout << \"gleamed\" << endl;", true), L("}"), L("gleam();")], spec: { line: "gleamed", minCount: { line: "lurk", n: 2 }, code: /void\s+gleam\s*\(/ }, see: "gleamed" }
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
  taskGoal.textContent = window.CodeReefGuide
    ? CodeReefGuide.instruction(task && task.goal ? task.goal : "Task " + (taskIndex + 1), task && task.help)
    : task && task.goal
      ? task.goal
      : "Task " + (taskIndex + 1);
  setTip(
    window.CodeReefGuide
      ? CodeReefGuide.startHint(task && task.goal, task && task.help, "Run")
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
    throw new Error('Try cout << "Vent hot!" << endl;');
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
