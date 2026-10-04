if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("java-code");
const outputBox = document.getElementById("java-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "java";
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

const starterCode = `System.out.println("Garden quiet!");\n`;
const projectStarter = `System.out.println("Garden project");\n`;

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

function explainJavaLine(line) {
  const t = String(line || "").trim();
  const quote = 'A quote is this mark: "';
  const semi = "Then type a semicolon. A semicolon is this mark: ;";
  let m = t.match(/^System\.out\.println\("([^"]*)"\);$/);
  if (m) {
    return [
      'Type this exactly: System.out.println("' + m[1] + '");',
      "System.out.println means show these words on the screen.",
      "Type the word System.",
      "Then type a dot. A dot is this mark: .",
      "Then type out, then a dot, then println.",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type this mark: )",
      semi,
      "The semicolon ends the line.",
    ];
  }
  m = t.match(/^System\.out\.println\("([^"]*)"\s*\+\s*([A-Za-z_][A-Za-z0-9_]*)\);$/);
  if (m) {
    return [
      'Type this exactly: System.out.println("' + m[1] + '" + ' + m[2] + ");",
      "A plus sign + sticks words together.",
      "Type System.out.println",
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
  m = t.match(/^System\.out\.println\(([A-Za-z_][A-Za-z0-9_]*)\);$/);
  if (m) {
    return [
      "Type this exactly: System.out.println(" + m[1] + ");",
      "This shows what " + m[1] + " remembers.",
      "Type System.out.println",
      "Then type this mark: (",
      "Then type " + m[1] + " with no quotes.",
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^System\.out\.println\(([A-Za-z_][A-Za-z0-9_]*)\s*\+\s*(\d+)\);$/);
  if (m) {
    return [
      "Type this exactly: System.out.println(" + m[1] + " + " + m[2] + ");",
      "Plus + adds numbers.",
      "Type System.out.println",
      "Then type this mark: (",
      "Then type " + m[1] + ", a space, +, a space, " + m[2],
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^System\.out\.println\(([A-Za-z_][A-Za-z0-9_]*)\s*-\s*(\d+)\);$/);
  if (m) {
    return [
      "Type this exactly: System.out.println(" + m[1] + " - " + m[2] + ");",
      "Minus - takes away.",
      "Type System.out.println",
      "Then type this mark: (",
      "Then type " + m[1] + ", a space, -, a space, " + m[2],
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^System\.out\.println\((\d+)\s*([+\-*])\s*(\d+)\);$/);
  if (m) {
    const word = m[2] === "+" ? "Plus + adds." : m[2] === "-" ? "Minus - takes away." : "The star * means times.";
    return [
      "Type this exactly: System.out.println(" + m[1] + " " + m[2] + " " + m[3] + ");",
      word,
      "Type System.out.println",
      "Then type this mark: (",
      "Then type " + m[1] + ", a space, " + m[2] + ", a space, " + m[3],
      "Then type this mark: )",
      semi,
      "Do not put quotes around the numbers.",
    ];
  }
  m = t.match(/^System\.out\.println\((.+)\);$/);
  if (m) {
    return [
      "Type this exactly: System.out.println(" + m[1] + ");",
      "System.out.println means show this on the screen.",
      "Type System.out.println",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: )",
      semi,
    ];
  }
  m = t.match(/^String\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)";$/);
  if (m) {
    return [
      'Type this exactly: String ' + m[1] + ' = "' + m[2] + '";',
      "String means words.",
      "A variable is a name that remembers a word.",
      "Type the word String.",
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
    pushBits(steps, explainJavaLine(line.text));
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

const tasks = (function buildJavaTasks() {
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

  add("Change quiet to busy.", false, [L("System.out.println(\"Garden busy!\");")], { contains: "garden busy!" }, "Garden busy!", "System.out.println(\"Garden busy!\");\n");
  list[0].help = numbered(["Keep your old code. Do not erase the whole line.","Click in the code box.","Click on the word quiet.","Delete those letters.","Type the new word in that same spot.","The line should look like this: System.out.println(\"Garden busy!\");","System.out.println means show these words on the screen.","A quote is this mark: \"","The words Garden busy! stay between the quotes.","Then type a semicolon. A semicolon is this mark: ;","Press the Run button. It is at the top.","You should see Garden busy!"]);
  add("Print polyp.", false, [L("System.out.println(\"polyp\");")], { contains: "polyp" }, "polyp");
  add("Print frond.", false, [L("System.out.println(\"frond\");")], { contains: "frond" }, "frond");
  add("Print larva.", false, [L("System.out.println(\"larva\");")], { contains: "larva" }, "larva");
  add("Print bloom.", false, [L("System.out.println(\"bloom\");")], { contains: "bloom" }, "bloom");
  add("Print the number 4.", true, [L("System.out.println(4);")], { line: "4" }, "4");
  add("Print the number 7.", true, [L("System.out.println(7);")], { line: "7" }, "7");
  add("Print the number 11.", true, [L("System.out.println(11);")], { line: "11" }, "11");
  add("Print two lines about the garden.", true, [L("System.out.println(\"Nia plants a bud.\");"), L("System.out.println(\"The fan sways.\");")], { contains: ["nia plants a bud.","the fan sways."] }, "The fan sways.");
  add("Print two lines about the garden.", true, [L("System.out.println(\"A polyp opens.\");"), L("System.out.println(\"Fronds tickle fish.\");")], { contains: ["a polyp opens.","fronds tickle fish."] }, "Fronds tickle fish.");
  add("Print two lines about the garden.", true, [L("System.out.println(\"The garden wakes.\");"), L("System.out.println(\"Buds glow softly.\");")], { contains: ["the garden wakes.","buds glow softly."] }, "Buds glow softly.");
  add("Remember Nia in plant.", true, [L("String plant = \"Nia\";"), L("System.out.println(plant);")], { line: "nia", code: /plant\s*:?=\s*["']Nia["']/ }, "Nia");
  add("Remember Sway in fan.", true, [L("String fan = \"Sway\";"), L("System.out.println(fan);")], { line: "sway", code: /fan\s*:?=\s*["']Sway["']/ }, "Sway");
  add("Remember Pippa in bud.", true, [L("String bud = \"Pippa\";"), L("System.out.println(bud);")], { line: "pippa", code: /bud\s*:?=\s*["']Pippa["']/ }, "Pippa");
  add("Remember Frond in leaf.", true, [L("String leaf = \"Frond\";"), L("System.out.println(leaf);")], { line: "frond", code: /leaf\s*:?=\s*["']Frond["']/ }, "Frond");
  add("Remember Lila in pal.", true, [L("String pal = \"Lila\";"), L("System.out.println(pal);")], { line: "lila", code: /pal\s*:?=\s*["']Lila["']/ }, "Lila");
  add("Remember Reefy in spot.", true, [L("String spot = \"Reefy\";"), L("System.out.println(spot);")], { line: "reefy", code: /spot\s*:?=\s*["']Reefy["']/ }, "Reefy");
  add("Remember the number 5 in buds.", true, [L("int buds = 5;"), L("System.out.println(buds);")], { line: "5", code: /buds\s*:?=\s*5\b/ }, "5");
  add("Remember the number 3 in fans.", true, [L("int fans = 3;"), L("System.out.println(fans);")], { line: "3", code: /fans\s*:?=\s*3\b/ }, "3");
  add("Remember the number 4 in rows.", true, [L("int rows = 4;"), L("System.out.println(rows);")], { line: "4", code: /rows\s*:?=\s*4\b/ }, "4");
  add("Remember the number 6 in drops.", true, [L("int drops = 6;"), L("System.out.println(drops);")], { line: "6", code: /drops\s*:?=\s*6\b/ }, "6");
  add("Say Hello to Nia.", true, [L("String who = \"Nia\";"), L("System.out.println(\"Hello \" + who);")], { contains: "hello nia" }, "Hello Nia");
  add("Say Hi to Sway.", true, [L("String who = \"Sway\";"), L("System.out.println(\"Hi \" + who);")], { contains: "hi sway" }, "Hi Sway");
  add("Say Hey to Pippa.", true, [L("String who = \"Pippa\";"), L("System.out.println(\"Hey \" + who);")], { contains: "hey pippa" }, "Hey Pippa");
  add("Say Hello to Frond.", true, [L("String who = \"Frond\";"), L("System.out.println(\"Hello \" + who);")], { contains: "hello frond" }, "Hello Frond");
  add("Say Hiya to Lila.", true, [L("String who = \"Lila\";"), L("System.out.println(\"Hiya \" + who);")], { contains: "hiya lila" }, "Hiya Lila");
  add("Print the answer to 2 + 5.", true, [L("System.out.println(2 + 5);")], { line: "7", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "7");
  add("Print the answer to 9 - 2.", true, [L("System.out.println(9 - 2);")], { line: "7", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "7");
  add("Print the answer to 3 * 2.", true, [L("System.out.println(3 * 2);")], { line: "6", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "6");
  add("Print the answer to 8 - 5.", true, [L("System.out.println(8 - 5);")], { line: "3", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "3");
  add("Print the answer to 1 + 4.", true, [L("System.out.println(1 + 4);")], { line: "5", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "5");
  add("Print the answer to 4 * 1.", true, [L("System.out.println(4 * 1);")], { line: "4", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "4");
  add("Start buds at 5, then print buds + 2.", true, [L("int buds = 5;"), L("System.out.println(buds + 2);")], { line: "7", code: /buds\s*\+\s*2/ }, "7");
  add("Start fans at 3, then print fans - 1.", true, [L("int fans = 3;"), L("System.out.println(fans - 1);")], { line: "2", code: /fans\s*\-\s*1/ }, "2");
  add("Start rows at 4, then print rows * 2.", true, [L("int rows = 4;"), L("System.out.println(rows * 2);")], { line: "8", code: /rows\s*\*\s*2/ }, "8");
  add("Start drops at 6, then print drops - 3.", true, [L("int drops = 6;"), L("System.out.println(drops - 3);")], { line: "3", code: /drops\s*\-\s*3/ }, "3");
  add("Start buds at 1, then print buds + 6.", true, [L("int buds = 1;"), L("System.out.println(buds + 6);")], { line: "7", code: /buds\s*\+\s*6/ }, "7");
  add("Remember Nia and Sway.", true, [L("String one = \"Nia\";"), L("String two = \"Sway\";"), L("System.out.println(one);"), L("System.out.println(two);")], { line: ["nia","sway"] }, "Nia and Sway");
  add("Remember Pippa and Frond.", true, [L("String bud = \"Pippa\";"), L("String leaf = \"Frond\";"), L("System.out.println(bud);"), L("System.out.println(leaf);")], { line: ["pippa","frond"] }, "Pippa and Frond");
  add("Remember Lila and Reefy.", true, [L("String a = \"Lila\";"), L("String b = \"Reefy\";"), L("System.out.println(a);"), L("System.out.println(b);")], { line: ["lila","reefy"] }, "Lila and Reefy");
  add("Remember Bloom and Polyp.", true, [L("String top = \"Bloom\";"), L("String low = \"Polyp\";"), L("System.out.println(top);"), L("System.out.println(low);")], { line: ["bloom","polyp"] }, "Bloom and Polyp");
  add("If the number is > 2, print growing.", true, [L("int score = 6;"), L("if (score > 2) {"), L("System.out.println(\"growing\");", true), L("}")], { line: "growing", code: /\bif\b/ }, "growing");
  add("If the number is > 1, print open.", true, [L("int score = 4;"), L("if (score > 1) {"), L("System.out.println(\"open\");", true), L("}")], { line: "open", code: /\bif\b/ }, "open");
  add("If the number is < 3, print shut.", true, [L("int score = 1;"), L("if (score < 3) {"), L("System.out.println(\"shut\");", true), L("}")], { line: "shut", code: /\bif\b/ }, "shut");
  add("If the number is > 4, print tall.", true, [L("int score = 8;"), L("if (score > 4) {"), L("System.out.println(\"tall\");", true), L("}")], { line: "tall", code: /\bif\b/ }, "tall");
  add("If the number is < 7, print short.", true, [L("int score = 2;"), L("if (score < 7) {"), L("System.out.println(\"short\");", true), L("}")], { line: "short", code: /\bif\b/ }, "short");
  add("If the number is > 3, print ready.", true, [L("int score = 5;"), L("if (score > 3) {"), L("System.out.println(\"ready\");", true), L("}")], { line: "ready", code: /\bif\b/ }, "ready");
  add("Use if and else so you print asleep.", true, [L("int score = 1;"), L("if (score > 3) {"), L("System.out.println(\"growing\");", true), L("}"), L("else {"), L("System.out.println(\"asleep\");", true), L("}")], { line: "asleep", code: /\bif\b[\s\S]*\belse\b/ }, "asleep");
  add("Use if and else so you print bloom.", true, [L("int score = 7;"), L("if (score > 2) {"), L("System.out.println(\"bloom\");", true), L("}"), L("else {"), L("System.out.println(\"bud\");", true), L("}")], { line: "bloom", code: /\bif\b[\s\S]*\belse\b/ }, "bloom");
  add("Use if and else so you print above.", true, [L("int score = 2;"), L("if (score < 2) {"), L("System.out.println(\"low\");", true), L("}"), L("else {"), L("System.out.println(\"above\");", true), L("}")], { line: "above", code: /\bif\b[\s\S]*\belse\b/ }, "above");
  add("Use if and else so you print young.", true, [L("int score = 3;"), L("if (score < 6) {"), L("System.out.println(\"young\");", true), L("}"), L("else {"), L("System.out.println(\"old\");", true), L("}")], { line: "young", code: /\bif\b[\s\S]*\belse\b/ }, "young");
  add("Use if and else so you print closed.", true, [L("int score = 0;"), L("if (score > 2) {"), L("System.out.println(\"yes\");", true), L("}"), L("else {"), L("System.out.println(\"closed\");", true), L("}")], { line: "closed", code: /\bif\b[\s\S]*\belse\b/ }, "closed");
  add("Use if and else so you print smaller.", true, [L("int score = 4;"), L("if (score > 4) {"), L("System.out.println(\"max\");", true), L("}"), L("else {"), L("System.out.println(\"smaller\");", true), L("}")], { line: "smaller", code: /\bif\b[\s\S]*\belse\b/ }, "smaller");
  add("Use if and else so you print leafy.", true, [L("int score = 5;"), L("if (score < 9) {"), L("System.out.println(\"leafy\");", true), L("}"), L("else {"), L("System.out.println(\"nope\");", true), L("}")], { line: "leafy", code: /\bif\b[\s\S]*\belse\b/ }, "leafy");
  add("Use if and else so you print wide.", true, [L("int score = 8;"), L("if (score > 1) {"), L("System.out.println(\"wide\");", true), L("}"), L("else {"), L("System.out.println(\"thin\");", true), L("}")], { line: "wide", code: /\bif\b[\s\S]*\belse\b/ }, "wide");
  add("Use a loop to print sway 2 times.", true, [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"sway\");", true), L("}")], { minCount: { line: "sway", n: 2 }, code: /for\s*\(\s*int/ }, "sway 2 times");
  add("Use a loop to print sway 3 times.", true, [L("for (int i = 1; i <= 3; i++) {"), L("System.out.println(\"sway\");", true), L("}")], { minCount: { line: "sway", n: 3 }, code: /for\s*\(\s*int/ }, "sway 3 times");
  add("Use a loop to print bloom 2 times.", true, [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"bloom\");", true), L("}")], { minCount: { line: "bloom", n: 2 }, code: /for\s*\(\s*int/ }, "bloom 2 times");
  add("Use a loop to print sprout 3 times.", true, [L("for (int i = 1; i <= 3; i++) {"), L("System.out.println(\"sprout\");", true), L("}")], { minCount: { line: "sprout", n: 3 }, code: /for\s*\(\s*int/ }, "sprout 3 times");
  add("Use a loop to print root 2 times.", true, [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"root\");", true), L("}")], { minCount: { line: "root", n: 2 }, code: /for\s*\(\s*int/ }, "root 2 times");
  add("Use a loop to print shade 4 times.", true, [L("for (int i = 1; i <= 4; i++) {"), L("System.out.println(\"shade\");", true), L("}")], { minCount: { line: "shade", n: 4 }, code: /for\s*\(\s*int/ }, "shade 4 times");
  add("Use a loop to print 4, then 5, then 6, then 7.", true, [L("for (int i = 4; i <= 7; i++) {"), L("System.out.println(i);", true), L("}")], { line: ["4","5","6","7"], code: /for\s*\(\s*int/ }, "4 then 5 then 6 then 7");
  add("Use a loop to print 9, then 10, then 11.", true, [L("for (int i = 9; i <= 11; i++) {"), L("System.out.println(i);", true), L("}")], { line: ["9","10","11"], code: /for\s*\(\s*int/ }, "9 then 10 then 11");
  add("Use a loop to print 2.", true, [L("for (int i = 2; i <= 2; i++) {"), L("System.out.println(i);", true), L("}")], { line: ["2"], code: /for\s*\(\s*int/ }, "2");
  add("Use a loop to print 6, then 7, then 8, then 9.", true, [L("for (int i = 6; i <= 9; i++) {"), L("System.out.println(i);", true), L("}")], { line: ["6","7","8","9"], code: /for\s*\(\s*int/ }, "6 then 7 then 8 then 9");
  add("Use a loop to print 1, then 2, then 3, then 4.", true, [L("for (int i = 1; i <= 4; i++) {"), L("System.out.println(i);", true), L("}")], { line: ["1","2","3","4"], code: /for\s*\(\s*int/ }, "1 then 2 then 3 then 4");
  add("Use a loop to print 8.", true, [L("for (int i = 8; i <= 8; i++) {"), L("System.out.println(i);", true), L("}")], { line: ["8"], code: /for\s*\(\s*int/ }, "8");
  add("Add 1 and 2 from two names.", true, [L("int left = 1;"), L("int right = 2;"), L("System.out.println(left + right);")], { line: "3", code: /left\s*\+\s*right/ }, "3");
  add("Add 3 and 3 from two names.", true, [L("int left = 3;"), L("int right = 3;"), L("System.out.println(left + right);")], { line: "6", code: /left\s*\+\s*right/ }, "6");
  add("Add 4 and 4 from two names.", true, [L("int left = 4;"), L("int right = 4;"), L("System.out.println(left + right);")], { line: "8", code: /left\s*\+\s*right/ }, "8");
  add("Add 2 and 6 from two names.", true, [L("int left = 2;"), L("int right = 6;"), L("System.out.println(left + right);")], { line: "8", code: /left\s*\+\s*right/ }, "8");
  add("Add 5 and 1 from two names.", true, [L("int left = 5;"), L("int right = 1;"), L("System.out.println(left + right);")], { line: "6", code: /left\s*\+\s*right/ }, "6");
  add("Add 7 and 2 from two names.", true, [L("int left = 7;"), L("int right = 2;"), L("System.out.println(left + right);")], { line: "9", code: /left\s*\+\s*right/ }, "9");
  add("Make a recipe sway that prints sway.", true, [L("void sway() {"), L("System.out.println(\"sway\");", true), L("}"), L("sway();")], { line: "sway", code: /void\s+sway\s*\(/ }, "sway");
  add("Make a recipe bloom that prints bloom.", true, [L("void bloom() {"), L("System.out.println(\"bloom\");", true), L("}"), L("bloom();")], { line: "bloom", code: /void\s+bloom\s*\(/ }, "bloom");
  add("Make a recipe sprout that prints sprout.", true, [L("void sprout() {"), L("System.out.println(\"sprout\");", true), L("}"), L("sprout();")], { line: "sprout", code: /void\s+sprout\s*\(/ }, "sprout");
  add("Make a recipe unfurl that prints unfurl.", true, [L("void unfurl() {"), L("System.out.println(\"unfurl\");", true), L("}"), L("unfurl();")], { line: "unfurl", code: /void\s+unfurl\s*\(/ }, "unfurl");
  add("Make a recipe root that prints root.", true, [L("void root() {"), L("System.out.println(\"root\");", true), L("}"), L("root();")], { line: "root", code: /void\s+root\s*\(/ }, "root");
  add("Make a recipe shade that prints shade.", true, [L("void shade() {"), L("System.out.println(\"shade\");", true), L("}"), L("shade();")], { line: "shade", code: /void\s+shade\s*\(/ }, "shade");
  add("Make callnia print the name you give it.", true, [L("void callnia(name) {"), L("System.out.println(name);", true), L("}"), L("callnia(\"Nia\");")], { line: "nia", code: /void\s+callnia\s*\(/ }, "Nia");
  add("Make callsway print the name you give it.", true, [L("void callsway(name) {"), L("System.out.println(name);", true), L("}"), L("callsway(\"Sway\");")], { line: "sway", code: /void\s+callsway\s*\(/ }, "Sway");
  add("Make callpippa print the name you give it.", true, [L("void callpippa(name) {"), L("System.out.println(name);", true), L("}"), L("callpippa(\"Pippa\");")], { line: "pippa", code: /void\s+callpippa\s*\(/ }, "Pippa");
  add("Make calllila print the name you give it.", true, [L("void calllila(name) {"), L("System.out.println(name);", true), L("}"), L("calllila(\"Lila\");")], { line: "lila", code: /void\s+calllila\s*\(/ }, "Lila");
  add("Make callreefy print the name you give it.", true, [L("void callreefy(name) {"), L("System.out.println(name);", true), L("}"), L("callreefy(\"Reefy\");")], { line: "reefy", code: /void\s+callreefy\s*\(/ }, "Reefy");
  add("Save a score, then print growing when it is big.", true, [L("int score = 6;"), L("if (score > 2) {"), L("System.out.println(\"growing\");", true), L("}"), L("else {"), L("System.out.println(\"asleep\");", true), L("}")], { line: "growing", code: /\bif\b/ }, "growing");
  add("Print Garden log, then loop sway twice.", true, [L("System.out.println(\"Garden log\");"), L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"sway\");", true), L("}")], { contains: "garden log", minCount: { line: "sway", n: 2 }, code: /for\s*\(\s*int/ }, "Garden log and sway");
  add("Remember two names, Nia and Sway.", true, [L("String one = \"Nia\";"), L("String two = \"Sway\";"), L("System.out.println(one);"), L("System.out.println(two);")], { line: ["nia","sway"] }, "Nia and Sway");
  add("Take 4 away from 12.", true, [L("int bag = 12;"), L("System.out.println(bag - 4);")], { line: "8", code: /bag\s*-\s*4/ }, "8");
  add("Run a recipe, then print polyp.", true, [L("String pet = \"polyp\";"), L("void sway() {"), L("System.out.println(\"swayed\");", true), L("}"), L("sway();"), L("System.out.println(pet);")], { line: ["swayed","polyp"], code: /void\s+sway\s*\(/ }, "swayed and polyp");
  add("Count 1 then 2, then print garden done.", true, [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(i);", true), L("}"), L("System.out.println(\"garden done\");")], { contains: "garden done", line: ["1","2"], code: /for\s*\(\s*int/ }, "1, 2, and garden done");
  add("Use else so a tiny score prints asleep.", true, [L("int score = 1;"), L("if (score > 5) {"), L("System.out.println(\"growing\");", true), L("}"), L("else {"), L("System.out.println(\"asleep\");", true), L("}")], { line: "asleep", code: /\belse\b/ }, "asleep");
  add("Make two recipes, sway and bloom.", true, [L("void sway() {"), L("System.out.println(\"swayed\");", true), L("}"), L("sway();"), L("void bloom() {"), L("System.out.println(\"bloomed\");", true), L("}"), L("bloom();")], { line: ["swayed","bloomed"], code: /void\s+sway\s*\(/ }, "swayed and bloomed");
  add("Greet Nia, then print a big score.", true, [L("String who = \"Nia\";"), L("System.out.println(\"Hello \" + who);"), L("int score = 8;"), L("if (score > 3) {"), L("System.out.println(\"growing\");", true), L("}"), L("else {"), L("System.out.println(\"asleep\");", true), L("}")], { contains: "hello nia", line: "growing" }, "Hello Nia");
  add("Add 2 to buds, then loop sway.", true, [L("int buds = 5;"), L("System.out.println(buds + 2);"), L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"sway\");", true), L("}")], { line: "7", minCount: { line: "sway", n: 2 }, code: /for\s*\(\s*int/ }, "7");
  add("Give callnia the name Nia.", true, [L("void callnia(name) {"), L("System.out.println(name);", true), L("}"), L("callnia(\"Nia\");")], { line: "nia", code: /void\s+callnia\s*\(/ }, "Nia");
  add("Count 1, 2, 3, then print garden done.", true, [L("for (int i = 1; i <= 3; i++) {"), L("System.out.println(i);", true), L("}"), L("System.out.println(\"garden done\");")], { contains: "garden done", line: ["1","2","3"], code: /for\s*\(\s*int/ }, "1, 2, 3, and garden done");
  add("If Nia is the hero, print planted.", true, [L("String hero = \"Nia\";"), L("System.out.println(hero);"), L("if (hero == \"Nia\") {"), L("System.out.println(\"planted\");", true), L("}")], { line: "planted", code: /\bif\b/ }, "planted");
  add("Mix a name, if, a loop, and a recipe.", true, [L("System.out.println(\"Garden log\");"), L("String hero = \"Nia\";"), L("System.out.println(hero);"), L("if (hero == \"Nia\") {"), L("System.out.println(\"planted\");", true), L("}"), L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"sway\");", true), L("}"), L("void bloom() {"), L("System.out.println(\"bloomed\");", true), L("}"), L("bloom();")], { line: ["nia","planted","bloomed"], minCount: { line: "sway", n: 2 }, code: /void\s+bloom\s*\(/ }, "planted and bloomed");
  add("Take 4 from 12, then print growing.", true, [L("int bag = 12;"), L("System.out.println(bag - 4);"), L("if (bag > 4) {"), L("System.out.println(\"growing\");", true), L("}")], { line: ["8","growing"], code: /\bif\b/ }, "growing");
  add("Print Nia, then loop sway three times.", true, [L("System.out.println(\"Nia\");"), L("for (int i = 1; i <= 3; i++) {"), L("System.out.println(\"sway\");", true), L("}")], { line: "nia", minCount: { line: "sway", n: 3 }, code: /for\s*\(\s*int/ }, "Nia and sway");
  if (list.length !== 100) {
    throw new Error("expected 100 tasks, got " + list.length);
  }
  return list;
})();

function buildJavaSteps(prefix, rows) {
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
    title: "Garden Tale",
    blurb: "A coral-garden story with a name, a number, and if.",
    plan: ["Print the tale.","Remember Nia.","Choose a path."],
    steps: buildJavaSteps("Project step", [
      { goal: "Print Garden Tale.", fresh: true, lines: [L("System.out.println(\"Garden Tale\");")], spec: { contains: "garden tale" }, see: "Garden Tale" },
      { goal: "Add the line Nia plants a bud..", fresh: false, lines: [L("System.out.println(\"Nia plants a bud.\");")], spec: { contains: "nia plants a bud." }, see: "Nia plants a bud." },
      { goal: "Add one more line.", fresh: false, lines: [L("System.out.println(\"The fan sways.\");")], spec: { contains: "the fan sways." }, see: "The fan sways." },
      { goal: "Remember the name Nia.", fresh: false, lines: [L("String hero = \"Nia\";")], spec: { code: /hero\s*:?=\s*["']Nia["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("System.out.println(hero);")], spec: { line: "nia" }, see: "Nia" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("System.out.println(\"Hello \" + hero);")], spec: { contains: "hello nia" }, see: "Hello Nia" },
      { goal: "Remember the number 5.", fresh: false, lines: [L("int buds = 5;")], spec: { code: /buds\s*:?=\s*5\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("System.out.println(buds);")], spec: { line: "5" }, see: "5" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("System.out.println(buds + 1);")], spec: { line: "6" }, see: "6" },
      { goal: "If the number is big, print growing.", fresh: false, lines: [L("if (buds > 4) {"), L("System.out.println(\"growing\");", true), L("}")], spec: { line: "growing", code: /\bif\b/ }, see: "growing" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("System.out.println(\"asleep\");", true), L("}")], spec: { code: /\belse\b/ }, see: "growing still", note: "Click after the line that prints growing." },
      { goal: "Loop sway twice.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"sway\");", true), L("}")], spec: { minCount: { line: "sway", n: 2 }, code: /for\s*\(\s*int/ }, see: "sway twice" }
    ]),
  },
  {
    id: "names",
    title: "Bud Names",
    blurb: "Name the plants and count the rows.",
    plan: ["Print a title.","Save a name.","Add else."],
    steps: buildJavaSteps("Project step", [
      { goal: "Print Bud Names.", fresh: true, lines: [L("System.out.println(\"Bud Names\");")], spec: { contains: "bud names" }, see: "Bud Names" },
      { goal: "Add the line Sway likes current..", fresh: false, lines: [L("System.out.println(\"Sway likes current.\");")], spec: { contains: "sway likes current." }, see: "Sway likes current." },
      { goal: "Add one more line.", fresh: false, lines: [L("System.out.println(\"Pippa is a bud.\");")], spec: { contains: "pippa is a bud." }, see: "Pippa is a bud." },
      { goal: "Remember the name Sway.", fresh: false, lines: [L("String hero = \"Sway\";")], spec: { code: /hero\s*:?=\s*["']Sway["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("System.out.println(hero);")], spec: { line: "sway" }, see: "Sway" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("System.out.println(\"Hi \" + hero);")], spec: { contains: "hi sway" }, see: "Hi Sway" },
      { goal: "Remember the number 4.", fresh: false, lines: [L("int rows = 4;")], spec: { code: /rows\s*:?=\s*4\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("System.out.println(rows);")], spec: { line: "4" }, see: "4" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("System.out.println(rows + 1);")], spec: { line: "5" }, see: "5" },
      { goal: "If the number is big, print tall.", fresh: false, lines: [L("if (rows > 3) {"), L("System.out.println(\"tall\");", true), L("}")], spec: { line: "tall", code: /\bif\b/ }, see: "tall" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("System.out.println(\"short\");", true), L("}")], spec: { code: /\belse\b/ }, see: "tall still", note: "Click after the line that prints tall." },
      { goal: "Loop bloom twice.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"bloom\");", true), L("}")], spec: { minCount: { line: "bloom", n: 2 }, code: /for\s*\(\s*int/ }, see: "bloom twice" }
    ]),
  },
  {
    id: "quiz",
    title: "Garden Quiz",
    blurb: "A garden quiz with a score.",
    plan: ["Ask a question.","Save a score.","Print the path."],
    steps: buildJavaSteps("Project step", [
      { goal: "Print Garden Quiz.", fresh: true, lines: [L("System.out.println(\"Garden Quiz\");")], spec: { contains: "garden quiz" }, see: "Garden Quiz" },
      { goal: "Add the line What opens at dawn?.", fresh: false, lines: [L("System.out.println(\"What opens at dawn?\");")], spec: { contains: "what opens at dawn?" }, see: "What opens at dawn?" },
      { goal: "Add one more line.", fresh: false, lines: [L("System.out.println(\"A polyp does.\");")], spec: { contains: "a polyp does." }, see: "A polyp does." },
      { goal: "Remember the name Pippa.", fresh: false, lines: [L("String hero = \"Pippa\";")], spec: { code: /hero\s*:?=\s*["']Pippa["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("System.out.println(hero);")], spec: { line: "pippa" }, see: "Pippa" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("System.out.println(\"Hey \" + hero);")], spec: { contains: "hey pippa" }, see: "Hey Pippa" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("int score = 3;")], spec: { code: /score\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("System.out.println(score);")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("System.out.println(score + 1);")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print open.", fresh: false, lines: [L("if (score > 2) {"), L("System.out.println(\"open\");", true), L("}")], spec: { line: "open", code: /\bif\b/ }, see: "open" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("System.out.println(\"shut\");", true), L("}")], spec: { code: /\belse\b/ }, see: "open still", note: "Click after the line that prints open." },
      { goal: "Loop sprout twice.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"sprout\");", true), L("}")], spec: { minCount: { line: "sprout", n: 2 }, code: /for\s*\(\s*int/ }, see: "sprout twice" }
    ]),
  }
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Bloom Adventure",
    blurb: "A harder garden path with a loop and a recipe.",
    plan: ["Name the bloom.","Test the score.","Sway and bloom."],
    steps: buildJavaSteps("Advanced step", [
      { goal: "Print Bloom Adventure.", fresh: true, lines: [L("System.out.println(\"Bloom Adventure\");")], spec: { contains: "bloom adventure" }, see: "Bloom Adventure" },
      { goal: "Add the line Fronds tickle fish..", fresh: false, lines: [L("System.out.println(\"Fronds tickle fish.\");")], spec: { contains: "fronds tickle fish." }, see: "Fronds tickle fish." },
      { goal: "Add one more line.", fresh: false, lines: [L("System.out.println(\"The rows are full.\");")], spec: { contains: "the rows are full." }, see: "The rows are full." },
      { goal: "Remember the name Frond.", fresh: false, lines: [L("String hero = \"Frond\";")], spec: { code: /hero\s*:?=\s*["']Frond["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("System.out.println(hero);")], spec: { line: "frond" }, see: "Frond" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("System.out.println(\"Hello \" + hero);")], spec: { contains: "hello frond" }, see: "Hello Frond" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("int fans = 3;")], spec: { code: /fans\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("System.out.println(fans);")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("System.out.println(fans + 1);")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print wide.", fresh: false, lines: [L("if (fans > 2) {"), L("System.out.println(\"wide\");", true), L("}")], spec: { line: "wide", code: /\bif\b/ }, see: "wide" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("System.out.println(\"thin\");", true), L("}")], spec: { code: /\belse\b/ }, see: "wide still", note: "Click after the line that prints wide." },
      { goal: "Loop sway twice, then run a recipe.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"sway\");", true), L("}"), L("void bloom() {"), L("System.out.println(\"bloomed\");", true), L("}"), L("bloom();")], spec: { line: "bloomed", minCount: { line: "sway", n: 2 }, code: /void\s+bloom\s*\(/ }, see: "bloomed" }
    ]),
  },
  {
    id: "scorequiz",
    title: "Polyp Quiz",
    blurb: "A harder polyp quiz with a recipe.",
    plan: ["Print the quiz.","Add a score.","Sprout at the end."],
    steps: buildJavaSteps("Advanced step", [
      { goal: "Print Polyp Quiz.", fresh: true, lines: [L("System.out.println(\"Polyp Quiz\");")], spec: { contains: "polyp quiz" }, see: "Polyp Quiz" },
      { goal: "Add the line How many rows?.", fresh: false, lines: [L("System.out.println(\"How many rows?\");")], spec: { contains: "how many rows?" }, see: "How many rows?" },
      { goal: "Add one more line.", fresh: false, lines: [L("System.out.println(\"Count the buds.\");")], spec: { contains: "count the buds." }, see: "Count the buds." },
      { goal: "Remember the name Lila.", fresh: false, lines: [L("String hero = \"Lila\";")], spec: { code: /hero\s*:?=\s*["']Lila["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("System.out.println(hero);")], spec: { line: "lila" }, see: "Lila" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("System.out.println(\"Hi \" + hero);")], spec: { contains: "hi lila" }, see: "Hi Lila" },
      { goal: "Remember the number 6.", fresh: false, lines: [L("int points = 6;")], spec: { code: /points\s*:?=\s*6\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("System.out.println(points);")], spec: { line: "6" }, see: "6" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("System.out.println(points + 1);")], spec: { line: "7" }, see: "7" },
      { goal: "If the number is big, print pass.", fresh: false, lines: [L("if (points > 5) {"), L("System.out.println(\"pass\");", true), L("}")], spec: { line: "pass", code: /\bif\b/ }, see: "pass" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("System.out.println(\"miss\");", true), L("}")], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the line that prints pass." },
      { goal: "Loop shade twice, then run a recipe.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"shade\");", true), L("}"), L("void sprout() {"), L("System.out.println(\"sprouted\");", true), L("}"), L("sprout();")], spec: { line: "sprouted", minCount: { line: "shade", n: 2 }, code: /void\s+sprout\s*\(/ }, see: "sprouted" }
    ]),
  },
  {
    id: "catalog",
    title: "Garden Catalog",
    blurb: "Catalog the plants, then loop.",
    plan: ["Name the plants.","Count them.","Run a recipe."],
    steps: buildJavaSteps("Advanced step", [
      { goal: "Print Garden Catalog.", fresh: true, lines: [L("System.out.println(\"Garden Catalog\");")], spec: { contains: "garden catalog" }, see: "Garden Catalog" },
      { goal: "Add the line Polyp..", fresh: false, lines: [L("System.out.println(\"Polyp.\");")], spec: { contains: "polyp." }, see: "Polyp." },
      { goal: "Add one more line.", fresh: false, lines: [L("System.out.println(\"Frond.\");")], spec: { contains: "frond." }, see: "Frond." },
      { goal: "Remember the name Reefy.", fresh: false, lines: [L("String hero = \"Reefy\";")], spec: { code: /hero\s*:?=\s*["']Reefy["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("System.out.println(hero);")], spec: { line: "reefy" }, see: "Reefy" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("System.out.println(\"Hello \" + hero);")], spec: { contains: "hello reefy" }, see: "Hello Reefy" },
      { goal: "Remember the number 4.", fresh: false, lines: [L("int count = 4;")], spec: { code: /count\s*:?=\s*4\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("System.out.println(count);")], spec: { line: "4" }, see: "4" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("System.out.println(count + 1);")], spec: { line: "5" }, see: "5" },
      { goal: "If the number is big, print full.", fresh: false, lines: [L("if (count > 3) {"), L("System.out.println(\"full\");", true), L("}")], spec: { line: "full", code: /\bif\b/ }, see: "full" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("System.out.println(\"more\");", true), L("}")], spec: { code: /\belse\b/ }, see: "full still", note: "Click after the line that prints full." },
      { goal: "Loop root twice, then run a recipe.", fresh: false, lines: [L("for (int i = 1; i <= 2; i++) {"), L("System.out.println(\"root\");", true), L("}"), L("void shade() {"), L("System.out.println(\"shaded\");", true), L("}"), L("shade();")], spec: { line: "shaded", minCount: { line: "root", n: 2 }, code: /void\s+shade\s*\(/ }, see: "shaded" }
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
  pathKey: "java",
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
    openCoralTrail("java", {
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
    throw new Error("Empty value inside println() or =");
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
        expr + " is not defined yet. Make it with String name = value; first."
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
      throw new Error("Use + - or * with numbers, like System.out.println(2 + 3);");
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
  if (/^public\s+class\s+[A-Za-z_][A-Za-z0-9_]*\s*\{\s*$/.test(line)) {
    return true;
  }
  if (
    /^public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*[A-Za-z_][A-Za-z0-9_]*\s*\)\s*\{\s*$/.test(
      line
    )
  ) {
    return true;
  }
  if (line === "}") {
    return true;
  }
  return false;
}

function runSimple(line, vars, output) {
  const stringDecl = line.match(
    /^String\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*;$/
  );
  if (stringDecl) {
    vars[stringDecl[1]] = evalExpr(stringDecl[2], vars);
    return;
  }

  const intDecl = line.match(
    /^int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*;$/
  );
  if (intDecl) {
    vars[intDecl[1]] = Number(evalExpr(intDecl[2], vars));
    return;
  }

  const printlnMatch = line.match(/^System\.out\.println\s*\((.*)\)\s*;$/);
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
    'Try System.out.println(...); or String name = value;. Got: ' + line
  );
}

function runTinyJava(source) {
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

    const callMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*(.*)\s*\)\s*;$/);
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
      /^for\s*\(\s*int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|<)\s*(-?\d+)\s*;\s*\1\+\+\s*\)\s*\{\s*$/
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
          "Your for loop needs a line inside the braces, like System.out.println(i);"
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
        "Use a Java for loop like: for (int i = 1; i <= 3; i++) { ... }"
      );
    }

    runSimple(line, vars, output);
    i += 1;
  }

  return output.join("\n");
}

function runCode() {
  try {
    lastOutput = runTinyJava(codeBox.value);
    outputBox.textContent =
      lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("Java got stuck. Read the red error, or tap Help.");
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
