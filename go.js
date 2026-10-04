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

const starterCode = `fmt.Println("Tug tied!")
`;

const projectStarter = `fmt.Println("Harbor project")
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

  add("Change tied to free.", false, [L("fmt.Println(\"Tug free!\")")], { contains: "tug free!" }, "Tug free!", "fmt.Println(\"Tug free!\")\n");
  list[0].help = numbered(["Keep your old code. Do not erase the whole line.","Click in the code box.","Click on the word tied.","Delete those letters.","Type the new word in that same spot.","The line should look like this: fmt.Println(\"Tug free!\")","fmt.Println means show these words on the screen.","A quote is this mark: \"","The words Tug free! stay between the quotes.","Press the Run button. It is at the top.","You should see Tug free!"]);
  add("Print ferry.", false, [L("fmt.Println(\"ferry\")")], { contains: "ferry" }, "ferry");
  add("Print buoy.", false, [L("fmt.Println(\"buoy\")")], { contains: "buoy" }, "buoy");
  add("Print cargo.", false, [L("fmt.Println(\"cargo\")")], { contains: "cargo" }, "cargo");
  add("Print pilot.", false, [L("fmt.Println(\"pilot\")")], { contains: "pilot" }, "pilot");
  add("Print the number 1.", true, [L("fmt.Println(1)")], { line: "1" }, "1");
  add("Print the number 5.", true, [L("fmt.Println(5)")], { line: "5" }, "5");
  add("Print the number 7.", true, [L("fmt.Println(7)")], { line: "7" }, "7");
  add("Print two lines about the harbor.", true, [L("fmt.Println(\"Skip ties the rope.\")"), L("fmt.Println(\"The ferry waits.\")")], { contains: ["skip ties the rope.","the ferry waits."] }, "The ferry waits.");
  add("Print two lines about the harbor.", true, [L("fmt.Println(\"A buoy bobs.\")"), L("fmt.Println(\"Cargo sits still.\")")], { contains: ["a buoy bobs.","cargo sits still."] }, "Cargo sits still.");
  add("Print two lines about the harbor.", true, [L("fmt.Println(\"The pilot waves.\")"), L("fmt.Println(\"Boats line up.\")")], { contains: ["the pilot waves.","boats line up."] }, "Boats line up.");
  add("Remember Skip in boat.", true, [L("boat := \"Skip\""), L("fmt.Println(boat)")], { line: "skip", code: /boat\s*:?=\s*["']Skip["']/ }, "Skip");
  add("Remember Buoy in mark.", true, [L("mark := \"Buoy\""), L("fmt.Println(mark)")], { line: "buoy", code: /mark\s*:?=\s*["']Buoy["']/ }, "Buoy");
  add("Remember Pier in dock.", true, [L("dock := \"Pier\""), L("fmt.Println(dock)")], { line: "pier", code: /dock\s*:?=\s*["']Pier["']/ }, "Pier");
  add("Remember Cargo in load.", true, [L("load := \"Cargo\""), L("fmt.Println(load)")], { line: "cargo", code: /load\s*:?=\s*["']Cargo["']/ }, "Cargo");
  add("Remember Dot in pal.", true, [L("pal := \"Dot\""), L("fmt.Println(pal)")], { line: "dot", code: /pal\s*:?=\s*["']Dot["']/ }, "Dot");
  add("Remember Tug in ride.", true, [L("ride := \"Tug\""), L("fmt.Println(ride)")], { line: "tug", code: /ride\s*:?=\s*["']Tug["']/ }, "Tug");
  add("Remember the number 2 in ropes.", true, [L("ropes := 2"), L("fmt.Println(ropes)")], { line: "2", code: /ropes\s*:?=\s*2\b/ }, "2");
  add("Remember the number 5 in boats.", true, [L("boats := 5"), L("fmt.Println(boats)")], { line: "5", code: /boats\s*:?=\s*5\b/ }, "5");
  add("Remember the number 3 in horns.", true, [L("horns := 3"), L("fmt.Println(horns)")], { line: "3", code: /horns\s*:?=\s*3\b/ }, "3");
  add("Remember the number 4 in docks.", true, [L("docks := 4"), L("fmt.Println(docks)")], { line: "4", code: /docks\s*:?=\s*4\b/ }, "4");
  add("Say Ahoy to Skip.", true, [L("who := \"Skip\""), L("fmt.Println(\"Ahoy \" + who)")], { contains: "ahoy skip" }, "Ahoy Skip");
  add("Say Hey to Buoy.", true, [L("who := \"Buoy\""), L("fmt.Println(\"Hey \" + who)")], { contains: "hey buoy" }, "Hey Buoy");
  add("Say Hi to Pier.", true, [L("who := \"Pier\""), L("fmt.Println(\"Hi \" + who)")], { contains: "hi pier" }, "Hi Pier");
  add("Say Hello to Cargo.", true, [L("who := \"Cargo\""), L("fmt.Println(\"Hello \" + who)")], { contains: "hello cargo" }, "Hello Cargo");
  add("Say Yo to Dot.", true, [L("who := \"Dot\""), L("fmt.Println(\"Yo \" + who)")], { contains: "yo dot" }, "Yo Dot");
  add("Print the answer to 4 + 2.", true, [L("fmt.Println(4 + 2)")], { line: "6", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "6");
  add("Print the answer to 7 - 4.", true, [L("fmt.Println(7 - 4)")], { line: "3", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "3");
  add("Print the answer to 2 * 5.", true, [L("fmt.Println(2 * 5)")], { line: "10", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "10");
  add("Print the answer to 1 + 8.", true, [L("fmt.Println(1 + 8)")], { line: "9", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "9");
  add("Print the answer to 6 - 1.", true, [L("fmt.Println(6 - 1)")], { line: "5", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "5");
  add("Print the answer to 4 * 2.", true, [L("fmt.Println(4 * 2)")], { line: "8", code: /print\s*\(|console\.log\s*\(|fmt\.Println\s*\(|System\.out\.println\s*\(|cout\s*<</ }, "8");
  add("Start ropes at 2, then print ropes + 3.", true, [L("ropes := 2"), L("fmt.Println(ropes + 3)")], { line: "5", code: /ropes\s*\+\s*3/ }, "5");
  add("Start boats at 5, then print boats - 2.", true, [L("boats := 5"), L("fmt.Println(boats - 2)")], { line: "3", code: /boats\s*\-\s*2/ }, "3");
  add("Start horns at 3, then print horns * 2.", true, [L("horns := 3"), L("fmt.Println(horns * 2)")], { line: "6", code: /horns\s*\*\s*2/ }, "6");
  add("Start docks at 4, then print docks + 4.", true, [L("docks := 4"), L("fmt.Println(docks + 4)")], { line: "8", code: /docks\s*\+\s*4/ }, "8");
  add("Start ropes at 9, then print ropes - 4.", true, [L("ropes := 9"), L("fmt.Println(ropes - 4)")], { line: "5", code: /ropes\s*\-\s*4/ }, "5");
  add("Remember Skip and Buoy.", true, [L("one := \"Skip\""), L("two := \"Buoy\""), L("fmt.Println(one)"), L("fmt.Println(two)")], { line: ["skip","buoy"] }, "Skip and Buoy");
  add("Remember Pier and Dot.", true, [L("tug := \"Pier\""), L("ferry := \"Dot\""), L("fmt.Println(tug)"), L("fmt.Println(ferry)")], { line: ["pier","dot"] }, "Pier and Dot");
  add("Remember Cargo and Tug.", true, [L("a := \"Cargo\""), L("b := \"Tug\""), L("fmt.Println(a)"), L("fmt.Println(b)")], { line: ["cargo","tug"] }, "Cargo and Tug");
  add("Remember Skip and Buoy.", true, [L("port := \"Skip\""), L("star := \"Buoy\""), L("fmt.Println(port)"), L("fmt.Println(star)")], { line: ["skip","buoy"] }, "Skip and Buoy");
  add("If the number is > 2, print busy.", true, [L("score := 7"), L("if score > 2 {"), L("fmt.Println(\"busy\")", true), L("}")], { line: "busy", code: /\bif\b/ }, "busy");
  add("If the number is > 1, print tied.", true, [L("score := 4"), L("if score > 1 {"), L("fmt.Println(\"tied\")", true), L("}")], { line: "tied", code: /\bif\b/ }, "tied");
  add("If the number is < 4, print quiet.", true, [L("score := 1"), L("if score < 4 {"), L("fmt.Println(\"quiet\")", true), L("}")], { line: "quiet", code: /\bif\b/ }, "quiet");
  add("If the number is > 5, print full.", true, [L("score := 9"), L("if score > 5 {"), L("fmt.Println(\"full\")", true), L("}")], { line: "full", code: /\bif\b/ }, "full");
  add("If the number is < 8, print room.", true, [L("score := 2"), L("if score < 8 {"), L("fmt.Println(\"room\")", true), L("}")], { line: "room", code: /\bif\b/ }, "room");
  add("If the number is > 3, print go.", true, [L("score := 6"), L("if score > 3 {"), L("fmt.Println(\"go\")", true), L("}")], { line: "go", code: /\bif\b/ }, "go");
  add("Use if and else so you print calm.", true, [L("score := 1"), L("if score > 4 {"), L("fmt.Println(\"busy\")", true), L("}"), L("else {"), L("fmt.Println(\"calm\")", true), L("}")], { line: "calm", code: /\bif\b[\s\S]*\belse\b/ }, "calm");
  add("Use if and else so you print sail.", true, [L("score := 8"), L("if score > 2 {"), L("fmt.Println(\"sail\")", true), L("}"), L("else {"), L("fmt.Println(\"stay\")", true), L("}")], { line: "sail", code: /\bif\b[\s\S]*\belse\b/ }, "sail");
  add("Use if and else so you print tall.", true, [L("score := 3"), L("if score < 3 {"), L("fmt.Println(\"low\")", true), L("}"), L("else {"), L("fmt.Println(\"tall\")", true), L("}")], { line: "tall", code: /\bif\b[\s\S]*\belse\b/ }, "tall");
  add("Use if and else so you print few.", true, [L("score := 2"), L("if score < 5 {"), L("fmt.Println(\"few\")", true), L("}"), L("else {"), L("fmt.Println(\"many\")", true), L("}")], { line: "few", code: /\bif\b[\s\S]*\belse\b/ }, "few");
  add("Use if and else so you print docked.", true, [L("score := 0"), L("if score > 0 {"), L("fmt.Println(\"yes\")", true), L("}"), L("else {"), L("fmt.Println(\"docked\")", true), L("}")], { line: "docked", code: /\bif\b[\s\S]*\belse\b/ }, "docked");
  add("Use if and else so you print short.", true, [L("score := 5"), L("if score > 5 {"), L("fmt.Println(\"max\")", true), L("}"), L("else {"), L("fmt.Println(\"short\")", true), L("}")], { line: "short", code: /\bif\b[\s\S]*\belse\b/ }, "short");
  add("Use if and else so you print ready.", true, [L("score := 4"), L("if score < 7 {"), L("fmt.Println(\"ready\")", true), L("}"), L("else {"), L("fmt.Println(\"nope\")", true), L("}")], { line: "ready", code: /\bif\b[\s\S]*\belse\b/ }, "ready");
  add("Use if and else so you print out.", true, [L("score := 6"), L("if score > 1 {"), L("fmt.Println(\"out\")", true), L("}"), L("else {"), L("fmt.Println(\"in\")", true), L("}")], { line: "out", code: /\bif\b[\s\S]*\belse\b/ }, "out");
  add("Use a loop to print toot 2 times.", true, [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"toot\")", true), L("}")], { minCount: { line: "toot", n: 2 }, code: /for\s+\w+\s*:=/ }, "toot 2 times");
  add("Use a loop to print toot 3 times.", true, [L("for i := 1; i <= 3; i++ {"), L("fmt.Println(\"toot\")", true), L("}")], { minCount: { line: "toot", n: 3 }, code: /for\s+\w+\s*:=/ }, "toot 3 times");
  add("Use a loop to print sail 2 times.", true, [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"sail\")", true), L("}")], { minCount: { line: "sail", n: 2 }, code: /for\s+\w+\s*:=/ }, "sail 2 times");
  add("Use a loop to print lash 3 times.", true, [L("for i := 1; i <= 3; i++ {"), L("fmt.Println(\"lash\")", true), L("}")], { minCount: { line: "lash", n: 3 }, code: /for\s+\w+\s*:=/ }, "lash 3 times");
  add("Use a loop to print moor 2 times.", true, [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"moor\")", true), L("}")], { minCount: { line: "moor", n: 2 }, code: /for\s+\w+\s*:=/ }, "moor 2 times");
  add("Use a loop to print chug 4 times.", true, [L("for i := 1; i <= 4; i++ {"), L("fmt.Println(\"chug\")", true), L("}")], { minCount: { line: "chug", n: 4 }, code: /for\s+\w+\s*:=/ }, "chug 4 times");
  add("Use a loop to print 3, then 4, then 5, then 6.", true, [L("for i := 3; i <= 6; i++ {"), L("fmt.Println(i)", true), L("}")], { line: ["3","4","5","6"], code: /for\s+\w+\s*:=/ }, "3 then 4 then 5 then 6");
  add("Use a loop to print 8, then 9, then 10.", true, [L("for i := 8; i <= 10; i++ {"), L("fmt.Println(i)", true), L("}")], { line: ["8","9","10"], code: /for\s+\w+\s*:=/ }, "8 then 9 then 10");
  add("Use a loop to print 1.", true, [L("for i := 1; i <= 1; i++ {"), L("fmt.Println(i)", true), L("}")], { line: ["1"], code: /for\s+\w+\s*:=/ }, "1");
  add("Use a loop to print 5, then 6, then 7, then 8.", true, [L("for i := 5; i <= 8; i++ {"), L("fmt.Println(i)", true), L("}")], { line: ["5","6","7","8"], code: /for\s+\w+\s*:=/ }, "5 then 6 then 7 then 8");
  add("Use a loop to print 0, then 1, then 2, then 3.", true, [L("for i := 0; i <= 3; i++ {"), L("fmt.Println(i)", true), L("}")], { line: ["0","1","2","3"], code: /for\s+\w+\s*:=/ }, "0 then 1 then 2 then 3");
  add("Use a loop to print 2.", true, [L("for i := 2; i <= 2; i++ {"), L("fmt.Println(i)", true), L("}")], { line: ["2"], code: /for\s+\w+\s*:=/ }, "2");
  add("Add 2 and 3 from two names.", true, [L("left := 2"), L("right := 3"), L("fmt.Println(left + right)")], { line: "5", code: /left\s*\+\s*right/ }, "5");
  add("Add 4 and 1 from two names.", true, [L("left := 4"), L("right := 1"), L("fmt.Println(left + right)")], { line: "5", code: /left\s*\+\s*right/ }, "5");
  add("Add 5 and 5 from two names.", true, [L("left := 5"), L("right := 5"), L("fmt.Println(left + right)")], { line: "10", code: /left\s*\+\s*right/ }, "10");
  add("Add 1 and 6 from two names.", true, [L("left := 1"), L("right := 6"), L("fmt.Println(left + right)")], { line: "7", code: /left\s*\+\s*right/ }, "7");
  add("Add 3 and 4 from two names.", true, [L("left := 3"), L("right := 4"), L("fmt.Println(left + right)")], { line: "7", code: /left\s*\+\s*right/ }, "7");
  add("Add 8 and 2 from two names.", true, [L("left := 8"), L("right := 2"), L("fmt.Println(left + right)")], { line: "10", code: /left\s*\+\s*right/ }, "10");
  add("Make a recipe toot that prints toot.", true, [L("func toot() {"), L("fmt.Println(\"toot\")", true), L("}"), L("toot()")], { line: "toot", code: /func\s+toot\s*\(/ }, "toot");
  add("Make a recipe sail that prints sail.", true, [L("func sail() {"), L("fmt.Println(\"sail\")", true), L("}"), L("sail()")], { line: "sail", code: /func\s+sail\s*\(/ }, "sail");
  add("Make a recipe lash that prints lash.", true, [L("func lash() {"), L("fmt.Println(\"lash\")", true), L("}"), L("lash()")], { line: "lash", code: /func\s+lash\s*\(/ }, "lash");
  add("Make a recipe moor that prints moor.", true, [L("func moor() {"), L("fmt.Println(\"moor\")", true), L("}"), L("moor()")], { line: "moor", code: /func\s+moor\s*\(/ }, "moor");
  add("Make a recipe haul that prints haul.", true, [L("func haul() {"), L("fmt.Println(\"haul\")", true), L("}"), L("haul()")], { line: "haul", code: /func\s+haul\s*\(/ }, "haul");
  add("Make a recipe chug that prints chug.", true, [L("func chug() {"), L("fmt.Println(\"chug\")", true), L("}"), L("chug()")], { line: "chug", code: /func\s+chug\s*\(/ }, "chug");
  add("Make callskip print the name you give it.", true, [L("func callskip(who) {"), L("fmt.Println(who)", true), L("}"), L("callskip(\"Skip\")")], { line: "skip", code: /func\s+callskip\s*\(/ }, "Skip");
  add("Make callbuoy print the name you give it.", true, [L("func callbuoy(who) {"), L("fmt.Println(who)", true), L("}"), L("callbuoy(\"Buoy\")")], { line: "buoy", code: /func\s+callbuoy\s*\(/ }, "Buoy");
  add("Make callpier print the name you give it.", true, [L("func callpier(who) {"), L("fmt.Println(who)", true), L("}"), L("callpier(\"Pier\")")], { line: "pier", code: /func\s+callpier\s*\(/ }, "Pier");
  add("Make calldot print the name you give it.", true, [L("func calldot(who) {"), L("fmt.Println(who)", true), L("}"), L("calldot(\"Dot\")")], { line: "dot", code: /func\s+calldot\s*\(/ }, "Dot");
  add("Make calltug print the name you give it.", true, [L("func calltug(who) {"), L("fmt.Println(who)", true), L("}"), L("calltug(\"Tug\")")], { line: "tug", code: /func\s+calltug\s*\(/ }, "Tug");
  add("Save a score, then print busy when it is big.", true, [L("score := 7"), L("if score > 2 {"), L("fmt.Println(\"busy\")", true), L("}"), L("else {"), L("fmt.Println(\"calm\")", true), L("}")], { line: "busy", code: /\bif\b/ }, "busy");
  add("Print Harbor log, then loop toot twice.", true, [L("fmt.Println(\"Harbor log\")"), L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"toot\")", true), L("}")], { contains: "harbor log", minCount: { line: "toot", n: 2 }, code: /for\s+\w+\s*:=/ }, "Harbor log and toot");
  add("Remember two names, Skip and Buoy.", true, [L("one := \"Skip\""), L("two := \"Buoy\""), L("fmt.Println(one)"), L("fmt.Println(two)")], { line: ["skip","buoy"] }, "Skip and Buoy");
  add("Take 3 away from 10.", true, [L("bag := 10"), L("fmt.Println(bag - 3)")], { line: "7", code: /bag\s*-\s*3/ }, "7");
  add("Run a recipe, then print ferry.", true, [L("pet := \"ferry\""), L("func toot() {"), L("fmt.Println(\"tooted\")", true), L("}"), L("toot()"), L("fmt.Println(pet)")], { line: ["tooted","ferry"], code: /func\s+toot\s*\(/ }, "tooted and ferry");
  add("Count 1 then 2, then print dock done.", true, [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(i)", true), L("}"), L("fmt.Println(\"dock done\")")], { contains: "dock done", line: ["1","2"], code: /for\s+\w+\s*:=/ }, "1, 2, and dock done");
  add("Use else so a tiny score prints calm.", true, [L("score := 1"), L("if score > 5 {"), L("fmt.Println(\"busy\")", true), L("}"), L("else {"), L("fmt.Println(\"calm\")", true), L("}")], { line: "calm", code: /\belse\b/ }, "calm");
  add("Make two recipes, toot and moor.", true, [L("func toot() {"), L("fmt.Println(\"tooted\")", true), L("}"), L("toot()"), L("func moor() {"), L("fmt.Println(\"moored\")", true), L("}"), L("moor()")], { line: ["tooted","moored"], code: /func\s+toot\s*\(/ }, "tooted and moored");
  add("Greet Skip, then print a big score.", true, [L("who := \"Skip\""), L("fmt.Println(\"Ahoy \" + who)"), L("score := 8"), L("if score > 3 {"), L("fmt.Println(\"busy\")", true), L("}"), L("else {"), L("fmt.Println(\"calm\")", true), L("}")], { contains: "ahoy skip", line: "busy" }, "Ahoy Skip");
  add("Add 2 to ropes, then loop toot.", true, [L("ropes := 2"), L("fmt.Println(ropes + 2)"), L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"toot\")", true), L("}")], { line: "4", minCount: { line: "toot", n: 2 }, code: /for\s+\w+\s*:=/ }, "4");
  add("Give callskip the name Skip.", true, [L("func callskip(who) {"), L("fmt.Println(who)", true), L("}"), L("callskip(\"Skip\")")], { line: "skip", code: /func\s+callskip\s*\(/ }, "Skip");
  add("Count 1, 2, 3, then print dock done.", true, [L("for i := 1; i <= 3; i++ {"), L("fmt.Println(i)", true), L("}"), L("fmt.Println(\"dock done\")")], { contains: "dock done", line: ["1","2","3"], code: /for\s+\w+\s*:=/ }, "1, 2, 3, and dock done");
  add("If Skip is the hero, print aboard.", true, [L("hero := \"Skip\""), L("fmt.Println(hero)"), L("if hero == \"Skip\" {"), L("fmt.Println(\"aboard\")", true), L("}")], { line: "aboard", code: /\bif\b/ }, "aboard");
  add("Mix a name, if, a loop, and a recipe.", true, [L("fmt.Println(\"Harbor log\")"), L("hero := \"Skip\""), L("fmt.Println(hero)"), L("if hero == \"Skip\" {"), L("fmt.Println(\"aboard\")", true), L("}"), L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"toot\")", true), L("}"), L("func moor() {"), L("fmt.Println(\"moored\")", true), L("}"), L("moor()")], { line: ["skip","aboard","moored"], minCount: { line: "toot", n: 2 }, code: /func\s+moor\s*\(/ }, "aboard and moored");
  add("Take 3 from 10, then print busy.", true, [L("bag := 10"), L("fmt.Println(bag - 3)"), L("if bag > 3 {"), L("fmt.Println(\"busy\")", true), L("}")], { line: ["7","busy"], code: /\bif\b/ }, "busy");
  add("Print Skip, then loop toot three times.", true, [L("fmt.Println(\"Skip\")"), L("for i := 1; i <= 3; i++ {"), L("fmt.Println(\"toot\")", true), L("}")], { line: "skip", minCount: { line: "toot", n: 3 }, code: /for\s+\w+\s*:=/ }, "Skip and toot");
  if (list.length !== 100) {
    throw new Error("expected 100 tasks, got " + list.length);
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
    title: "Harbor Tale",
    blurb: "A harbor story with a name, a number, and if.",
    plan: ["Print the tale.","Remember Skip.","Choose a path."],
    steps: buildGoSteps("Project step", [
      { goal: "Print Harbor Tale.", fresh: true, lines: [L("fmt.Println(\"Harbor Tale\")")], spec: { contains: "harbor tale" }, see: "Harbor Tale" },
      { goal: "Add the line Skip ties the rope..", fresh: false, lines: [L("fmt.Println(\"Skip ties the rope.\")")], spec: { contains: "skip ties the rope." }, see: "Skip ties the rope." },
      { goal: "Add one more line.", fresh: false, lines: [L("fmt.Println(\"The ferry waits.\")")], spec: { contains: "the ferry waits." }, see: "The ferry waits." },
      { goal: "Remember the name Skip.", fresh: false, lines: [L("hero := \"Skip\"")], spec: { code: /hero\s*:?=\s*["']Skip["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("fmt.Println(hero)")], spec: { line: "skip" }, see: "Skip" },
      { goal: "Say Ahoy to the name.", fresh: false, lines: [L("fmt.Println(\"Ahoy \" + hero)")], spec: { contains: "ahoy skip" }, see: "Ahoy Skip" },
      { goal: "Remember the number 2.", fresh: false, lines: [L("ropes := 2")], spec: { code: /ropes\s*:?=\s*2\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("fmt.Println(ropes)")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("fmt.Println(ropes + 1)")], spec: { line: "3" }, see: "3" },
      { goal: "If the number is big, print busy.", fresh: false, lines: [L("if ropes > 1 {"), L("fmt.Println(\"busy\")", true), L("}")], spec: { line: "busy", code: /\bif\b/ }, see: "busy" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("fmt.Println(\"calm\")", true), L("}")], spec: { code: /\belse\b/ }, see: "busy still", note: "Click after the line that prints busy." },
      { goal: "Loop toot twice.", fresh: false, lines: [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"toot\")", true), L("}")], spec: { minCount: { line: "toot", n: 2 }, code: /for\s+\w+\s*:=/ }, see: "toot twice" }
    ]),
  },
  {
    id: "names",
    title: "Boat Names",
    blurb: "Name the boats and count the ropes.",
    plan: ["Print a title.","Save a name.","Add else."],
    steps: buildGoSteps("Project step", [
      { goal: "Print Boat Names.", fresh: true, lines: [L("fmt.Println(\"Boat Names\")")], spec: { contains: "boat names" }, see: "Boat Names" },
      { goal: "Add the line Buoy bobs..", fresh: false, lines: [L("fmt.Println(\"Buoy bobs.\")")], spec: { contains: "buoy bobs." }, see: "Buoy bobs." },
      { goal: "Add one more line.", fresh: false, lines: [L("fmt.Println(\"Pier stands still.\")")], spec: { contains: "pier stands still." }, see: "Pier stands still." },
      { goal: "Remember the name Buoy.", fresh: false, lines: [L("hero := \"Buoy\"")], spec: { code: /hero\s*:?=\s*["']Buoy["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("fmt.Println(hero)")], spec: { line: "buoy" }, see: "Buoy" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("fmt.Println(\"Hey \" + hero)")], spec: { contains: "hey buoy" }, see: "Hey Buoy" },
      { goal: "Remember the number 5.", fresh: false, lines: [L("boats := 5")], spec: { code: /boats\s*:?=\s*5\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("fmt.Println(boats)")], spec: { line: "5" }, see: "5" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("fmt.Println(boats + 1)")], spec: { line: "6" }, see: "6" },
      { goal: "If the number is big, print many.", fresh: false, lines: [L("if boats > 4 {"), L("fmt.Println(\"many\")", true), L("}")], spec: { line: "many", code: /\bif\b/ }, see: "many" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("fmt.Println(\"few\")", true), L("}")], spec: { code: /\belse\b/ }, see: "many still", note: "Click after the line that prints many." },
      { goal: "Loop sail twice.", fresh: false, lines: [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"sail\")", true), L("}")], spec: { minCount: { line: "sail", n: 2 }, code: /for\s+\w+\s*:=/ }, see: "sail twice" }
    ]),
  },
  {
    id: "quiz",
    title: "Dock Quiz",
    blurb: "A harbor quiz with a score.",
    plan: ["Ask a question.","Save a score.","Print the path."],
    steps: buildGoSteps("Project step", [
      { goal: "Print Dock Quiz.", fresh: true, lines: [L("fmt.Println(\"Dock Quiz\")")], spec: { contains: "dock quiz" }, see: "Dock Quiz" },
      { goal: "Add the line Who guides the ferry?.", fresh: false, lines: [L("fmt.Println(\"Who guides the ferry?\")")], spec: { contains: "who guides the ferry?" }, see: "Who guides the ferry?" },
      { goal: "Add one more line.", fresh: false, lines: [L("fmt.Println(\"The pilot does.\")")], spec: { contains: "the pilot does." }, see: "The pilot does." },
      { goal: "Remember the name Dot.", fresh: false, lines: [L("hero := \"Dot\"")], spec: { code: /hero\s*:?=\s*["']Dot["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("fmt.Println(hero)")], spec: { line: "dot" }, see: "Dot" },
      { goal: "Say Hi to the name.", fresh: false, lines: [L("fmt.Println(\"Hi \" + hero)")], spec: { contains: "hi dot" }, see: "Hi Dot" },
      { goal: "Remember the number 4.", fresh: false, lines: [L("score := 4")], spec: { code: /score\s*:?=\s*4\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("fmt.Println(score)")], spec: { line: "4" }, see: "4" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("fmt.Println(score + 1)")], spec: { line: "5" }, see: "5" },
      { goal: "If the number is big, print right.", fresh: false, lines: [L("if score > 3 {"), L("fmt.Println(\"right\")", true), L("}")], spec: { line: "right", code: /\bif\b/ }, see: "right" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("fmt.Println(\"try\")", true), L("}")], spec: { code: /\belse\b/ }, see: "right still", note: "Click after the line that prints right." },
      { goal: "Loop lash twice.", fresh: false, lines: [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"lash\")", true), L("}")], spec: { minCount: { line: "lash", n: 2 }, code: /for\s+\w+\s*:=/ }, see: "lash twice" }
    ]),
  }
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ferry Adventure",
    blurb: "A harder trip with a loop and a recipe.",
    plan: ["Name the ferry.","Test the score.","Toot and sail."],
    steps: buildGoSteps("Advanced step", [
      { goal: "Print Ferry Adventure.", fresh: true, lines: [L("fmt.Println(\"Ferry Adventure\")")], spec: { contains: "ferry adventure" }, see: "Ferry Adventure" },
      { goal: "Add the line Cargo is heavy..", fresh: false, lines: [L("fmt.Println(\"Cargo is heavy.\")")], spec: { contains: "cargo is heavy." }, see: "Cargo is heavy." },
      { goal: "Add one more line.", fresh: false, lines: [L("fmt.Println(\"The horn is loud.\")")], spec: { contains: "the horn is loud." }, see: "The horn is loud." },
      { goal: "Remember the name Tug.", fresh: false, lines: [L("hero := \"Tug\"")], spec: { code: /hero\s*:?=\s*["']Tug["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("fmt.Println(hero)")], spec: { line: "tug" }, see: "Tug" },
      { goal: "Say Ahoy to the name.", fresh: false, lines: [L("fmt.Println(\"Ahoy \" + hero)")], spec: { contains: "ahoy tug" }, see: "Ahoy Tug" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("horns := 3")], spec: { code: /horns\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("fmt.Println(horns)")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("fmt.Println(horns + 1)")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print go.", fresh: false, lines: [L("if horns > 2 {"), L("fmt.Println(\"go\")", true), L("}")], spec: { line: "go", code: /\bif\b/ }, see: "go" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("fmt.Println(\"stay\")", true), L("}")], spec: { code: /\belse\b/ }, see: "go still", note: "Click after the line that prints go." },
      { goal: "Loop toot twice, then run a recipe.", fresh: false, lines: [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"toot\")", true), L("}"), L("func sail() {"), L("fmt.Println(\"sailed\")", true), L("}"), L("sail()")], spec: { line: "sailed", minCount: { line: "toot", n: 2 }, code: /func\s+sail\s*\(/ }, see: "sailed" }
    ]),
  },
  {
    id: "scorequiz",
    title: "Rope Quiz",
    blurb: "A harder rope quiz with a recipe.",
    plan: ["Print the quiz.","Add a score.","Moor at the end."],
    steps: buildGoSteps("Advanced step", [
      { goal: "Print Rope Quiz.", fresh: true, lines: [L("fmt.Println(\"Rope Quiz\")")], spec: { contains: "rope quiz" }, see: "Rope Quiz" },
      { goal: "Add the line How many knots?.", fresh: false, lines: [L("fmt.Println(\"How many knots?\")")], spec: { contains: "how many knots?" }, see: "How many knots?" },
      { goal: "Add one more line.", fresh: false, lines: [L("fmt.Println(\"Count the ropes.\")")], spec: { contains: "count the ropes." }, see: "Count the ropes." },
      { goal: "Remember the name Pier.", fresh: false, lines: [L("hero := \"Pier\"")], spec: { code: /hero\s*:?=\s*["']Pier["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("fmt.Println(hero)")], spec: { line: "pier" }, see: "Pier" },
      { goal: "Say Hey to the name.", fresh: false, lines: [L("fmt.Println(\"Hey \" + hero)")], spec: { contains: "hey pier" }, see: "Hey Pier" },
      { goal: "Remember the number 6.", fresh: false, lines: [L("points := 6")], spec: { code: /points\s*:?=\s*6\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("fmt.Println(points)")], spec: { line: "6" }, see: "6" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("fmt.Println(points + 1)")], spec: { line: "7" }, see: "7" },
      { goal: "If the number is big, print pass.", fresh: false, lines: [L("if points > 5 {"), L("fmt.Println(\"pass\")", true), L("}")], spec: { line: "pass", code: /\bif\b/ }, see: "pass" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("fmt.Println(\"miss\")", true), L("}")], spec: { code: /\belse\b/ }, see: "pass still", note: "Click after the line that prints pass." },
      { goal: "Loop chug twice, then run a recipe.", fresh: false, lines: [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"chug\")", true), L("}"), L("func moor() {"), L("fmt.Println(\"moored\")", true), L("}"), L("moor()")], spec: { line: "moored", minCount: { line: "chug", n: 2 }, code: /func\s+moor\s*\(/ }, see: "moored" }
    ]),
  },
  {
    id: "catalog",
    title: "Dock Catalog",
    blurb: "Catalog the harbor, then loop.",
    plan: ["Name the boats.","Count them.","Run a recipe."],
    steps: buildGoSteps("Advanced step", [
      { goal: "Print Dock Catalog.", fresh: true, lines: [L("fmt.Println(\"Dock Catalog\")")], spec: { contains: "dock catalog" }, see: "Dock Catalog" },
      { goal: "Add the line Ferry..", fresh: false, lines: [L("fmt.Println(\"Ferry.\")")], spec: { contains: "ferry." }, see: "Ferry." },
      { goal: "Add one more line.", fresh: false, lines: [L("fmt.Println(\"Tug.\")")], spec: { contains: "tug." }, see: "Tug." },
      { goal: "Remember the name Cargo.", fresh: false, lines: [L("hero := \"Cargo\"")], spec: { code: /hero\s*:?=\s*["']Cargo["']/ }, see: "your old lines" },
      { goal: "Print the name.", fresh: false, lines: [L("fmt.Println(hero)")], spec: { line: "cargo" }, see: "Cargo" },
      { goal: "Say Hello to the name.", fresh: false, lines: [L("fmt.Println(\"Hello \" + hero)")], spec: { contains: "hello cargo" }, see: "Hello Cargo" },
      { goal: "Remember the number 3.", fresh: false, lines: [L("count := 3")], spec: { code: /count\s*:?=\s*3\b/ }, see: "your old lines" },
      { goal: "Print that number.", fresh: false, lines: [L("fmt.Println(count)")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than that number.", fresh: false, lines: [L("fmt.Println(count + 1)")], spec: { line: "4" }, see: "4" },
      { goal: "If the number is big, print full.", fresh: false, lines: [L("if count > 2 {"), L("fmt.Println(\"full\")", true), L("}")], spec: { line: "full", code: /\bif\b/ }, see: "full" },
      { goal: "Add the other path, else.", fresh: false, lines: [L("else {"), L("fmt.Println(\"room\")", true), L("}")], spec: { code: /\belse\b/ }, see: "full still", note: "Click after the line that prints full." },
      { goal: "Loop haul twice, then run a recipe.", fresh: false, lines: [L("for i := 1; i <= 2; i++ {"), L("fmt.Println(\"haul\")", true), L("}"), L("func chug() {"), L("fmt.Println(\"chugged\")", true), L("}"), L("chug()")], spec: { line: "chugged", minCount: { line: "haul", n: 2 }, code: /func\s+chug\s*\(/ }, see: "chugged" }
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
