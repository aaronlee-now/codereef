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

const starterCode = `PRINT "Chest shut!"\n`;
const projectStarter = `PRINT "Chest project"\n`;

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
  add("Change shut to open.", false, [L("PRINT \"Chest open!\"")], { contains: "chest open!" }, "Chest open!", "PRINT \"Chest open!\"\n");
  list[0].help = numbered(["Keep your old code. Do not erase the whole line.","Click in the code box.","Click on the word shut.","Delete those letters.","Type the new word in that same spot.","The line should look like this: PRINT \"Chest open!\"","PRINT means show these words on the screen.","Type the word PRINT.","Then type a space.","A quote is this mark: \"","The words Chest open! stay between the quotes.","Press the Run button. It is at the top.","You should see Chest open!"]);
  add("PRINT coin.", false, [L("PRINT \"coin\"")], { contains: "coin" }, "coin");
  add("PRINT map.", false, [L("PRINT \"map\"")], { contains: "map" }, "map");
  add("PRINT key.", false, [L("PRINT \"key\"")], { contains: "key" }, "key");
  add("PRINT gem.", false, [L("PRINT \"gem\"")], { contains: "gem" }, "gem");
  add("PRINT flag.", false, [L("PRINT \"flag\"")], { contains: "flag" }, "flag");
  add("Save 2 in R1 and PRINT it.", true, [L("MOV R1, 2"), L("PRINT R1")], { line: "2", code: /MOV\s+R1\s*,\s*2\b/i }, "2");
  add("Save 6 in R1 and PRINT it.", true, [L("MOV R1, 6"), L("PRINT R1")], { line: "6", code: /MOV\s+R1\s*,\s*6\b/i }, "6");
  add("Save 9 in R1 and PRINT it.", true, [L("MOV R1, 9"), L("PRINT R1")], { line: "9", code: /MOV\s+R1\s*,\s*9\b/i }, "9");
  add("PRINT two treasure lines.", true, [L("PRINT \"The map is old.\""), L("PRINT \"A key waits.\"")], { contains: ["the map is old.","a key waits."] }, "A key waits.");
  add("PRINT two treasure lines.", true, [L("PRINT \"Coins clink.\""), L("PRINT \"The flag flaps.\"")], { contains: ["coins clink.","the flag flaps."] }, "The flag flaps.");
  add("PRINT two treasure lines.", true, [L("PRINT \"Gem sits inside.\""), L("PRINT \"The chest is ready.\"")], { contains: ["gem sits inside.","the chest is ready."] }, "The chest is ready.");
  add("MOV Coin into label and PRINT it.", true, [L("MOV label, \"Coin\""), L("PRINT label")], { line: "coin", code: /MOV\s+label\s*,\s*["']Coin["']/i }, "Coin");
  add("MOV Map into spot and PRINT it.", true, [L("MOV spot, \"Map\""), L("PRINT spot")], { line: "map", code: /MOV\s+spot\s*,\s*["']Map["']/i }, "Map");
  add("MOV Key into tool and PRINT it.", true, [L("MOV tool, \"Key\""), L("PRINT tool")], { line: "key", code: /MOV\s+tool\s*,\s*["']Key["']/i }, "Key");
  add("MOV Gem into prize and PRINT it.", true, [L("MOV prize, \"Gem\""), L("PRINT prize")], { line: "gem", code: /MOV\s+prize\s*,\s*["']Gem["']/i }, "Gem");
  add("MOV Flag into mark and PRINT it.", true, [L("MOV mark, \"Flag\""), L("PRINT mark")], { line: "flag", code: /MOV\s+mark\s*,\s*["']Flag["']/i }, "Flag");
  add("MOV Dot into pal and PRINT it.", true, [L("MOV pal, \"Dot\""), L("PRINT pal")], { line: "dot", code: /MOV\s+pal\s*,\s*["']Dot["']/i }, "Dot");
  add("MOV Skiff into boat and PRINT it.", true, [L("MOV boat, \"Skiff\""), L("PRINT boat")], { line: "skiff", code: /MOV\s+boat\s*,\s*["']Skiff["']/i }, "Skiff");
  add("MOV Cove into cave and PRINT it.", true, [L("MOV cave, \"Cove\""), L("PRINT cave")], { line: "cove", code: /MOV\s+cave\s*,\s*["']Cove["']/i }, "Cove");
  add("MOV 1 into R1 and PRINT the box.", true, [L("MOV R1, 1"), L("PRINT R1")], { line: "1", code: /MOV\s+R1\s*,\s*1\b/i }, "1");
  add("MOV 4 into R1 and PRINT the box.", true, [L("MOV R1, 4"), L("PRINT R1")], { line: "4", code: /MOV\s+R1\s*,\s*4\b/i }, "4");
  add("MOV 7 into R1 and PRINT the box.", true, [L("MOV R1, 7"), L("PRINT R1")], { line: "7", code: /MOV\s+R1\s*,\s*7\b/i }, "7");
  add("MOV 3 into R1 and PRINT the box.", true, [L("MOV R1, 3"), L("PRINT R1")], { line: "3", code: /MOV\s+R1\s*,\s*3\b/i }, "3");
  add("MOV 8 into R1 and PRINT the box.", true, [L("MOV R1, 8"), L("PRINT R1")], { line: "8", code: /MOV\s+R1\s*,\s*8\b/i }, "8");
  add("MOV 5 into R1 and PRINT the box.", true, [L("MOV R1, 5"), L("PRINT R1")], { line: "5", code: /MOV\s+R1\s*,\s*5\b/i }, "5");
  add("ADD 3 onto 2 and PRINT the box.", true, [L("MOV R1, 2"), L("ADD R1, 3"), L("PRINT R1")], { line: "5", code: /ADD\s+R1\s*,\s*3\b/i }, "5");
  add("ADD 4 onto 4 and PRINT the box.", true, [L("MOV R1, 4"), L("ADD R1, 4"), L("PRINT R1")], { line: "8", code: /ADD\s+R1\s*,\s*4\b/i }, "8");
  add("ADD 6 onto 1 and PRINT the box.", true, [L("MOV R1, 1"), L("ADD R1, 6"), L("PRINT R1")], { line: "7", code: /ADD\s+R1\s*,\s*6\b/i }, "7");
  add("ADD 2 onto 5 and PRINT the box.", true, [L("MOV R1, 5"), L("ADD R1, 2"), L("PRINT R1")], { line: "7", code: /ADD\s+R1\s*,\s*2\b/i }, "7");
  add("ADD 3 onto 3 and PRINT the box.", true, [L("MOV R1, 3"), L("ADD R1, 3"), L("PRINT R1")], { line: "6", code: /ADD\s+R1\s*,\s*3\b/i }, "6");
  add("ADD 1 onto 8 and PRINT the box.", true, [L("MOV R1, 8"), L("ADD R1, 1"), L("PRINT R1")], { line: "9", code: /ADD\s+R1\s*,\s*1\b/i }, "9");
  add("ADD 3 onto 6 and PRINT the box.", true, [L("MOV R1, 6"), L("ADD R1, 3"), L("PRINT R1")], { line: "9", code: /ADD\s+R1\s*,\s*3\b/i }, "9");
  add("ADD 2 onto 2 and PRINT the box.", true, [L("MOV R1, 2"), L("ADD R1, 2"), L("PRINT R1")], { line: "4", code: /ADD\s+R1\s*,\s*2\b/i }, "4");
  add("ADD 3 onto 7 and PRINT the box.", true, [L("MOV R1, 7"), L("ADD R1, 3"), L("PRINT R1")], { line: "10", code: /ADD\s+R1\s*,\s*3\b/i }, "10");
  add("ADD 1 onto 1 and PRINT the box.", true, [L("MOV R1, 1"), L("ADD R1, 1"), L("PRINT R1")], { line: "2", code: /ADD\s+R1\s*,\s*1\b/i }, "2");
  add("Start at 3, ADD 1, and PRINT.", true, [L("MOV R1, 3"), L("ADD R1, 1"), L("PRINT R1")], { line: "4", code: /ADD\s+R1/i }, "4");
  add("Start at 5, ADD 2, and PRINT.", true, [L("MOV R1, 5"), L("ADD R1, 2"), L("PRINT R1")], { line: "7", code: /ADD\s+R1/i }, "7");
  add("Start at 2, ADD 4, and PRINT.", true, [L("MOV R1, 2"), L("ADD R1, 4"), L("PRINT R1")], { line: "6", code: /ADD\s+R1/i }, "6");
  add("Start at 6, ADD 1, and PRINT.", true, [L("MOV R1, 6"), L("ADD R1, 1"), L("PRINT R1")], { line: "7", code: /ADD\s+R1/i }, "7");
  add("Start at 4, ADD 3, and PRINT.", true, [L("MOV R1, 4"), L("ADD R1, 3"), L("PRINT R1")], { line: "7", code: /ADD\s+R1/i }, "7");
  add("Start at 1, ADD 5, and PRINT.", true, [L("MOV R1, 1"), L("ADD R1, 5"), L("PRINT R1")], { line: "6", code: /ADD\s+R1/i }, "6");
  add("Use two boxes. PRINT 4 and coin.", true, [L("MOV R1, 4"), L("MOV label, \"coin\""), L("PRINT R1"), L("PRINT label")], { line: ["4","coin"] }, "4 and coin");
  add("Use two boxes. PRINT 6 and map.", true, [L("MOV R2, 6"), L("MOV label, \"map\""), L("PRINT R2"), L("PRINT label")], { line: ["6","map"] }, "6 and map");
  add("Use two boxes. PRINT 1 and key.", true, [L("MOV R1, 1"), L("MOV label, \"key\""), L("PRINT R1"), L("PRINT label")], { line: ["1","key"] }, "1 and key");
  add("Use two boxes. PRINT 8 and gem.", true, [L("MOV R2, 8"), L("MOV label, \"gem\""), L("PRINT R2"), L("PRINT label")], { line: ["8","gem"] }, "8 and gem");
  add("Use two boxes. PRINT 3 and flag.", true, [L("MOV R1, 3"), L("MOV label, \"flag\""), L("PRINT R1"), L("PRINT label")], { line: ["3","flag"] }, "3 and flag");
  add("Use two boxes. PRINT 2 and dot.", true, [L("MOV R2, 2"), L("MOV label, \"dot\""), L("PRINT R2"), L("PRINT label")], { line: ["2","dot"] }, "2 and dot");
  add("REPEAT clink 2 times.", true, [L("REPEAT 2"), L("PRINT \"clink\"", true), L("END")], { minCount: { line: "clink", n: 2 }, code: /REPEAT\s+2\b/i }, "clink 2 times");
  add("REPEAT clink 3 times.", true, [L("REPEAT 3"), L("PRINT \"clink\"", true), L("END")], { minCount: { line: "clink", n: 3 }, code: /REPEAT\s+3\b/i }, "clink 3 times");
  add("REPEAT jingle 2 times.", true, [L("REPEAT 2"), L("PRINT \"jingle\"", true), L("END")], { minCount: { line: "jingle", n: 2 }, code: /REPEAT\s+2\b/i }, "jingle 2 times");
  add("REPEAT jingle 4 times.", true, [L("REPEAT 4"), L("PRINT \"jingle\"", true), L("END")], { minCount: { line: "jingle", n: 4 }, code: /REPEAT\s+4\b/i }, "jingle 4 times");
  add("REPEAT spark 2 times.", true, [L("REPEAT 2"), L("PRINT \"spark\"", true), L("END")], { minCount: { line: "spark", n: 2 }, code: /REPEAT\s+2\b/i }, "spark 2 times");
  add("REPEAT spark 3 times.", true, [L("REPEAT 3"), L("PRINT \"spark\"", true), L("END")], { minCount: { line: "spark", n: 3 }, code: /REPEAT\s+3\b/i }, "spark 3 times");
  add("REPEAT hooray 2 times.", true, [L("REPEAT 2"), L("PRINT \"hooray\"", true), L("END")], { minCount: { line: "hooray", n: 2 }, code: /REPEAT\s+2\b/i }, "hooray 2 times");
  add("REPEAT hooray 3 times.", true, [L("REPEAT 3"), L("PRINT \"hooray\"", true), L("END")], { minCount: { line: "hooray", n: 3 }, code: /REPEAT\s+3\b/i }, "hooray 3 times");
  add("REPEAT shine 2 times.", true, [L("REPEAT 2"), L("PRINT \"shine\"", true), L("END")], { minCount: { line: "shine", n: 2 }, code: /REPEAT\s+2\b/i }, "shine 2 times");
  add("REPEAT shine 4 times.", true, [L("REPEAT 4"), L("PRINT \"shine\"", true), L("END")], { minCount: { line: "shine", n: 4 }, code: /REPEAT\s+4\b/i }, "shine 4 times");
  add("Count 1, then 2 with REPEAT.", true, [L("MOV R1, 1"), L("REPEAT 2"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["1","2"], code: /REPEAT\s+2\b/i }, "1 then 2");
  add("Count 1, then 2, then 3 with REPEAT.", true, [L("MOV R1, 1"), L("REPEAT 3"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["1","2","3"], code: /REPEAT\s+3\b/i }, "1 then 2 then 3");
  add("Count 2, then 3, then 4 with REPEAT.", true, [L("MOV R1, 2"), L("REPEAT 3"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["2","3","4"], code: /REPEAT\s+3\b/i }, "2 then 3 then 4");
  add("Count 0, then 1, then 2 with REPEAT.", true, [L("MOV R1, 0"), L("REPEAT 3"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["0","1","2"], code: /REPEAT\s+3\b/i }, "0 then 1 then 2");
  add("Count 4, then 5, then 6 with REPEAT.", true, [L("MOV R1, 4"), L("REPEAT 3"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["4","5","6"], code: /REPEAT\s+3\b/i }, "4 then 5 then 6");
  add("Count 5, then 6 with REPEAT.", true, [L("MOV R1, 5"), L("REPEAT 2"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["5","6"], code: /REPEAT\s+2\b/i }, "5 then 6");
  add("Count 3, then 4, then 5, then 6 with REPEAT.", true, [L("MOV R1, 3"), L("REPEAT 4"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["3","4","5","6"], code: /REPEAT\s+4\b/i }, "3 then 4 then 5 then 6");
  add("Count 6, then 7, then 8 with REPEAT.", true, [L("MOV R1, 6"), L("REPEAT 3"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["6","7","8"], code: /REPEAT\s+3\b/i }, "6 then 7 then 8");
  add("Count 2, then 3, then 4, then 5 with REPEAT.", true, [L("MOV R1, 2"), L("REPEAT 4"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["2","3","4","5"], code: /REPEAT\s+4\b/i }, "2 then 3 then 4 then 5");
  add("Count 1, then 2, then 3, then 4 with REPEAT.", true, [L("MOV R1, 1"), L("REPEAT 4"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["1","2","3","4"], code: /REPEAT\s+4\b/i }, "1 then 2 then 3 then 4");
  add("Count 8, then 9 with REPEAT.", true, [L("MOV R1, 8"), L("REPEAT 2"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["8","9"], code: /REPEAT\s+2\b/i }, "8 then 9");
  add("Count 0, then 1, then 2, then 3 with REPEAT.", true, [L("MOV R1, 0"), L("REPEAT 4"), L("PRINT R1", true), L("ADD R1, 1", true), L("END")], { line: ["0","1","2","3"], code: /REPEAT\s+4\b/i }, "0 then 1 then 2 then 3");
  add("ADD twice, then PRINT 6.", true, [L("MOV R1, 1"), L("ADD R1, 2"), L("ADD R1, 3"), L("PRINT R1")], { line: "6", code: /ADD\s+R1/i }, "6");
  add("ADD twice, then PRINT 6.", true, [L("MOV R1, 2"), L("ADD R1, 2"), L("ADD R1, 2"), L("PRINT R1")], { line: "6", code: /ADD\s+R1/i }, "6");
  add("ADD twice, then PRINT 6.", true, [L("MOV R1, 4"), L("ADD R1, 1"), L("ADD R1, 1"), L("PRINT R1")], { line: "6", code: /ADD\s+R1/i }, "6");
  add("ADD twice, then PRINT 7.", true, [L("MOV R1, 3"), L("ADD R1, 3"), L("ADD R1, 1"), L("PRINT R1")], { line: "7", code: /ADD\s+R1/i }, "7");
  add("ADD twice, then PRINT 9.", true, [L("MOV R1, 5"), L("ADD R1, 2"), L("ADD R1, 2"), L("PRINT R1")], { line: "9", code: /ADD\s+R1/i }, "9");
  add("ADD twice, then PRINT 7.", true, [L("MOV R1, 1"), L("ADD R1, 4"), L("ADD R1, 2"), L("PRINT R1")], { line: "7", code: /ADD\s+R1/i }, "7");
  add("ADD twice, then PRINT 10.", true, [L("MOV R1, 6"), L("ADD R1, 1"), L("ADD R1, 3"), L("PRINT R1")], { line: "10", code: /ADD\s+R1/i }, "10");
  add("ADD twice, then PRINT 9.", true, [L("MOV R1, 2"), L("ADD R1, 3"), L("ADD R1, 4"), L("PRINT R1")], { line: "9", code: /ADD\s+R1/i }, "9");
  add("PRINT Chest log, then REPEAT clink.", true, [L("PRINT \"Chest log\""), L("REPEAT 2"), L("PRINT \"clink\"", true), L("END")], { contains: "chest log", minCount: { line: "clink", n: 2 }, code: /REPEAT/i }, "Chest log");
  add("PRINT Map log, then REPEAT spark.", true, [L("PRINT \"Map log\""), L("REPEAT 2"), L("PRINT \"spark\"", true), L("END")], { contains: "map log", minCount: { line: "spark", n: 2 }, code: /REPEAT/i }, "Map log");
  add("PRINT Key log, then REPEAT jingle.", true, [L("PRINT \"Key log\""), L("REPEAT 3"), L("PRINT \"jingle\"", true), L("END")], { contains: "key log", minCount: { line: "jingle", n: 3 }, code: /REPEAT/i }, "Key log");
  add("PRINT Gem log, then REPEAT shine.", true, [L("PRINT \"Gem log\""), L("REPEAT 2"), L("PRINT \"shine\"", true), L("END")], { contains: "gem log", minCount: { line: "shine", n: 2 }, code: /REPEAT/i }, "Gem log");
  add("PRINT Flag log, then REPEAT hooray.", true, [L("PRINT \"Flag log\""), L("REPEAT 2"), L("PRINT \"hooray\"", true), L("END")], { contains: "flag log", minCount: { line: "hooray", n: 2 }, code: /REPEAT/i }, "Flag log");
  add("PRINT Coin log, then REPEAT clink.", true, [L("PRINT \"Coin log\""), L("REPEAT 3"), L("PRINT \"clink\"", true), L("END")], { contains: "coin log", minCount: { line: "clink", n: 3 }, code: /REPEAT/i }, "Coin log");
  add("PRINT Cave log, then REPEAT spark.", true, [L("PRINT \"Cave log\""), L("REPEAT 3"), L("PRINT \"spark\"", true), L("END")], { contains: "cave log", minCount: { line: "spark", n: 3 }, code: /REPEAT/i }, "Cave log");
  add("PRINT Dot log, then REPEAT shine.", true, [L("PRINT \"Dot log\""), L("REPEAT 3"), L("PRINT \"shine\"", true), L("END")], { contains: "dot log", minCount: { line: "shine", n: 3 }, code: /REPEAT/i }, "Dot log");
  add("ADD box R2 onto R1 and PRINT 10.", true, [L("MOV R1, 4"), L("MOV R2, 6"), L("ADD R1, R2"), L("PRINT R1")], { line: "10", code: /ADD\s+R1\s*,\s*R2/i }, "10");
  add("ADD box R2 onto R1 and PRINT 7.", true, [L("MOV R1, 2"), L("MOV R2, 5"), L("ADD R1, R2"), L("PRINT R1")], { line: "7", code: /ADD\s+R1\s*,\s*R2/i }, "7");
  add("ADD box R2 onto R1 and PRINT 10.", true, [L("MOV R1, 3"), L("MOV R2, 7"), L("ADD R1, R2"), L("PRINT R1")], { line: "10", code: /ADD\s+R1\s*,\s*R2/i }, "10");
  add("ADD box R2 onto R1 and PRINT 9.", true, [L("MOV R1, 1"), L("MOV R2, 8"), L("ADD R1, R2"), L("PRINT R1")], { line: "9", code: /ADD\s+R1\s*,\s*R2/i }, "9");
  add("ADD box R2 onto R1 and PRINT 10.", true, [L("MOV R1, 5"), L("MOV R2, 5"), L("ADD R1, R2"), L("PRINT R1")], { line: "10", code: /ADD\s+R1\s*,\s*R2/i }, "10");
  add("ADD box R2 onto R1 and PRINT 10.", true, [L("MOV R1, 8"), L("MOV R2, 2"), L("ADD R1, R2"), L("PRINT R1")], { line: "10", code: /ADD\s+R1\s*,\s*R2/i }, "10");
  add("ADD box R2 onto R1 and PRINT 10.", true, [L("MOV R1, 6"), L("MOV R2, 4"), L("ADD R1, R2"), L("PRINT R1")], { line: "10", code: /ADD\s+R1\s*,\s*R2/i }, "10");
  add("ADD box R2 onto R1 and PRINT 10.", true, [L("MOV R1, 9"), L("MOV R2, 1"), L("ADD R1, R2"), L("PRINT R1")], { line: "10", code: /ADD\s+R1\s*,\s*R2/i }, "10");
  add("Mix a title, two names, and a REPEAT.", true, [L("PRINT \"Treasure end\""), L("MOV one, \"Coin\""), L("MOV two, \"Map\""), L("PRINT one"), L("PRINT two"), L("REPEAT 2"), L("PRINT \"clink\"", true), L("END")], { contains: "treasure end", line: ["coin","map"], minCount: { line: "clink", n: 2 } }, "Treasure end");
  add("Mix a title, two names, and a REPEAT.", true, [L("PRINT \"Cave end\""), L("MOV one, \"Key\""), L("MOV two, \"Gem\""), L("PRINT one"), L("PRINT two"), L("REPEAT 2"), L("PRINT \"spark\"", true), L("END")], { contains: "cave end", line: ["key","gem"], minCount: { line: "spark", n: 2 } }, "Cave end");
  add("Mix a title, two names, and a REPEAT.", true, [L("PRINT \"Ship end\""), L("MOV one, \"Flag\""), L("MOV two, \"Dot\""), L("PRINT one"), L("PRINT two"), L("REPEAT 2"), L("PRINT \"jingle\"", true), L("END")], { contains: "ship end", line: ["flag","dot"], minCount: { line: "jingle", n: 2 } }, "Ship end");
  add("Mix a title, two names, and a REPEAT.", true, [L("PRINT \"Lock end\""), L("MOV one, \"Skiff\""), L("MOV two, \"Cove\""), L("PRINT one"), L("PRINT two"), L("REPEAT 2"), L("PRINT \"shine\"", true), L("END")], { contains: "lock end", line: ["skiff","cove"], minCount: { line: "shine", n: 2 } }, "Lock end");
  add("Mix a title, two names, and a REPEAT.", true, [L("PRINT \"Prize end\""), L("MOV one, \"Gem\""), L("MOV two, \"Coin\""), L("PRINT one"), L("PRINT two"), L("REPEAT 2"), L("PRINT \"hooray\"", true), L("END")], { contains: "prize end", line: ["gem","coin"], minCount: { line: "hooray", n: 2 } }, "Prize end");
  add("Mix a title, two names, and a REPEAT.", true, [L("PRINT \"Last chest\""), L("MOV one, \"Map\""), L("MOV two, \"Key\""), L("PRINT one"), L("PRINT two"), L("REPEAT 2"), L("PRINT \"clink\"", true), L("END")], { contains: "last chest", line: ["map","key"], minCount: { line: "clink", n: 2 } }, "Last chest");
  if (list.length !== 100) throw new Error("expected 100 tasks, got " + list.length);
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
    title: "Chest tale",
    blurb: "A treasure story using PRINT, MOV, ADD, and REPEAT.",
    plan: ["Print a title.","Save a name.","Count with ADD."],
    steps: buildAsmSteps("Project step", [
      { goal: "PRINT Chest Tale.", fresh: true, lines: [L("PRINT \"Chest Tale\"")], spec: { contains: "chest tale" }, see: "Chest Tale" },
      { goal: "Add a treasure line.", fresh: false, lines: [L("PRINT \"The lock clicks.\"")], spec: { contains: "the lock clicks." }, see: "The lock clicks." },
      { goal: "Add one more line.", fresh: false, lines: [L("PRINT \"A coin rolls out.\"")], spec: { contains: "a coin rolls out." }, see: "A coin rolls out." },
      { goal: "MOV the name Dot.", fresh: false, lines: [L("MOV hero, \"Dot\"")], spec: { code: /MOV\s+hero/i }, see: "your old lines" },
      { goal: "PRINT the name.", fresh: false, lines: [L("PRINT hero")], spec: { line: "dot" }, see: "Dot" },
      { goal: "PRINT hello.", fresh: false, lines: [L("PRINT \"Ahoy\"")], spec: { line: "ahoy" }, see: "Ahoy" },
      { goal: "MOV 3 into R1.", fresh: false, lines: [L("MOV R1, 3")], spec: { code: /MOV\s+R1\s*,\s*3\b/i }, see: "your old lines" },
      { goal: "PRINT R1.", fresh: false, lines: [L("PRINT R1")], spec: { line: "3" }, see: "3" },
      { goal: "ADD 1 and PRINT the box.", fresh: false, lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "4", code: /ADD\s+R1\s*,\s*1/i }, see: "4" },
      { goal: "PRINT open.", fresh: false, lines: [L("PRINT \"open\"")], spec: { line: "open" }, see: "open" },
      { goal: "REPEAT clink twice.", fresh: false, lines: [L("REPEAT 2"), L("PRINT \"clink\"", true), L("END")], spec: { minCount: { line: "clink", n: 2 } }, see: "clink twice" },
      { goal: "PRINT The end.", fresh: false, lines: [L("PRINT \"The end\"")], spec: { contains: "the end" }, see: "The end" }
    ]),
  },
  {
    id: "names",
    title: "Treasure names",
    blurb: "Name the loot and count it.",
    plan: ["Print a title.","MOV a name.","REPEAT a cheer."],
    steps: buildAsmSteps("Project step", [
      { goal: "PRINT Treasure Names.", fresh: true, lines: [L("PRINT \"Treasure Names\"")], spec: { contains: "treasure names" }, see: "Treasure Names" },
      { goal: "Add a treasure line.", fresh: false, lines: [L("PRINT \"Coin is first.\"")], spec: { contains: "coin is first." }, see: "Coin is first." },
      { goal: "Add one more line.", fresh: false, lines: [L("PRINT \"Map is next.\"")], spec: { contains: "map is next." }, see: "Map is next." },
      { goal: "MOV the name Skiff.", fresh: false, lines: [L("MOV hero, \"Skiff\"")], spec: { code: /MOV\s+hero/i }, see: "your old lines" },
      { goal: "PRINT the name.", fresh: false, lines: [L("PRINT hero")], spec: { line: "skiff" }, see: "Skiff" },
      { goal: "PRINT hello.", fresh: false, lines: [L("PRINT \"Ahoy\"")], spec: { line: "ahoy" }, see: "Ahoy" },
      { goal: "MOV 2 into R1.", fresh: false, lines: [L("MOV R1, 2")], spec: { code: /MOV\s+R1\s*,\s*2\b/i }, see: "your old lines" },
      { goal: "PRINT R1.", fresh: false, lines: [L("PRINT R1")], spec: { line: "2" }, see: "2" },
      { goal: "ADD 1 and PRINT the box.", fresh: false, lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "3", code: /ADD\s+R1\s*,\s*1/i }, see: "3" },
      { goal: "PRINT found.", fresh: false, lines: [L("PRINT \"found\"")], spec: { line: "found" }, see: "found" },
      { goal: "REPEAT spark twice.", fresh: false, lines: [L("REPEAT 2"), L("PRINT \"spark\"", true), L("END")], spec: { minCount: { line: "spark", n: 2 } }, see: "spark twice" },
      { goal: "PRINT The end.", fresh: false, lines: [L("PRINT \"The end\"")], spec: { contains: "the end" }, see: "The end" }
    ]),
  },
  {
    id: "quiz",
    title: "Chest quiz",
    blurb: "A tiny quiz with a score box.",
    plan: ["Ask with PRINT.","Store a number.","ADD the score."],
    steps: buildAsmSteps("Project step", [
      { goal: "PRINT Chest Quiz.", fresh: true, lines: [L("PRINT \"Chest Quiz\"")], spec: { contains: "chest quiz" }, see: "Chest Quiz" },
      { goal: "Add a treasure line.", fresh: false, lines: [L("PRINT \"How many keys?\"")], spec: { contains: "how many keys?" }, see: "How many keys?" },
      { goal: "Add one more line.", fresh: false, lines: [L("PRINT \"Count the gems.\"")], spec: { contains: "count the gems." }, see: "Count the gems." },
      { goal: "MOV the name Gem.", fresh: false, lines: [L("MOV hero, \"Gem\"")], spec: { code: /MOV\s+hero/i }, see: "your old lines" },
      { goal: "PRINT the name.", fresh: false, lines: [L("PRINT hero")], spec: { line: "gem" }, see: "Gem" },
      { goal: "PRINT hello.", fresh: false, lines: [L("PRINT \"Ahoy\"")], spec: { line: "ahoy" }, see: "Ahoy" },
      { goal: "MOV 4 into R1.", fresh: false, lines: [L("MOV R1, 4")], spec: { code: /MOV\s+R1\s*,\s*4\b/i }, see: "your old lines" },
      { goal: "PRINT R1.", fresh: false, lines: [L("PRINT R1")], spec: { line: "4" }, see: "4" },
      { goal: "ADD 1 and PRINT the box.", fresh: false, lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "5", code: /ADD\s+R1\s*,\s*1/i }, see: "5" },
      { goal: "PRINT right.", fresh: false, lines: [L("PRINT \"right\"")], spec: { line: "right" }, see: "right" },
      { goal: "REPEAT jingle twice.", fresh: false, lines: [L("REPEAT 2"), L("PRINT \"jingle\"", true), L("END")], spec: { minCount: { line: "jingle", n: 2 } }, see: "jingle twice" },
      { goal: "PRINT The end.", fresh: false, lines: [L("PRINT \"The end\"")], spec: { contains: "the end" }, see: "The end" }
    ]),
  }
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Cave dive",
    blurb: "A harder cave path with counting.",
    plan: ["Name the cave.","ADD a score.","REPEAT the ending."],
    steps: buildAsmSteps("Advanced step", [
      { goal: "PRINT Cave Dive.", fresh: true, lines: [L("PRINT \"Cave Dive\"")], spec: { contains: "cave dive" }, see: "Cave Dive" },
      { goal: "Add a treasure line.", fresh: false, lines: [L("PRINT \"The path bends.\"")], spec: { contains: "the path bends." }, see: "The path bends." },
      { goal: "Add one more line.", fresh: false, lines: [L("PRINT \"A flag shows the way.\"")], spec: { contains: "a flag shows the way." }, see: "A flag shows the way." },
      { goal: "MOV the name Cove.", fresh: false, lines: [L("MOV hero, \"Cove\"")], spec: { code: /MOV\s+hero/i }, see: "your old lines" },
      { goal: "PRINT the name.", fresh: false, lines: [L("PRINT hero")], spec: { line: "cove" }, see: "Cove" },
      { goal: "PRINT hello.", fresh: false, lines: [L("PRINT \"Ahoy\"")], spec: { line: "ahoy" }, see: "Ahoy" },
      { goal: "MOV 5 into R1.", fresh: false, lines: [L("MOV R1, 5")], spec: { code: /MOV\s+R1\s*,\s*5\b/i }, see: "your old lines" },
      { goal: "PRINT R1.", fresh: false, lines: [L("PRINT R1")], spec: { line: "5" }, see: "5" },
      { goal: "ADD 1 and PRINT the box.", fresh: false, lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "6", code: /ADD\s+R1\s*,\s*1/i }, see: "6" },
      { goal: "PRINT deep.", fresh: false, lines: [L("PRINT \"deep\"")], spec: { line: "deep" }, see: "deep" },
      { goal: "Count 1, 2, 3 with REPEAT.", fresh: false, lines: [L("MOV R2, 1"), L("REPEAT 3"), L("PRINT R2", true), L("ADD R2, 1", true), L("END")], spec: { line: ["1","2","3"], code: /REPEAT\s+3/i }, see: "1 then 2 then 3" },
      { goal: "REPEAT shine twice.", fresh: false, lines: [L("REPEAT 2"), L("PRINT \"shine\"", true), L("END")], spec: { minCount: { line: "shine", n: 2 } }, see: "shine twice" }
    ]),
  },
  {
    id: "scorequiz",
    title: "Coin quiz",
    blurb: "Harder counting and a repeated cheer.",
    plan: ["Print the quiz.","ADD coins.","REPEAT the win."],
    steps: buildAsmSteps("Advanced step", [
      { goal: "PRINT Coin Quiz.", fresh: true, lines: [L("PRINT \"Coin Quiz\"")], spec: { contains: "coin quiz" }, see: "Coin Quiz" },
      { goal: "Add a treasure line.", fresh: false, lines: [L("PRINT \"What is 2 plus 2?\"")], spec: { contains: "what is 2 plus 2?" }, see: "What is 2 plus 2?" },
      { goal: "Add one more line.", fresh: false, lines: [L("PRINT \"The pile grows.\"")], spec: { contains: "the pile grows." }, see: "The pile grows." },
      { goal: "MOV the name Coin.", fresh: false, lines: [L("MOV hero, \"Coin\"")], spec: { code: /MOV\s+hero/i }, see: "your old lines" },
      { goal: "PRINT the name.", fresh: false, lines: [L("PRINT hero")], spec: { line: "coin" }, see: "Coin" },
      { goal: "PRINT hello.", fresh: false, lines: [L("PRINT \"Ahoy\"")], spec: { line: "ahoy" }, see: "Ahoy" },
      { goal: "MOV 6 into R1.", fresh: false, lines: [L("MOV R1, 6")], spec: { code: /MOV\s+R1\s*,\s*6\b/i }, see: "your old lines" },
      { goal: "PRINT R1.", fresh: false, lines: [L("PRINT R1")], spec: { line: "6" }, see: "6" },
      { goal: "ADD 1 and PRINT the box.", fresh: false, lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "7", code: /ADD\s+R1\s*,\s*1/i }, see: "7" },
      { goal: "PRINT rich.", fresh: false, lines: [L("PRINT \"rich\"")], spec: { line: "rich" }, see: "rich" },
      { goal: "Count 1, 2, 3 with REPEAT.", fresh: false, lines: [L("MOV R2, 1"), L("REPEAT 3"), L("PRINT R2", true), L("ADD R2, 1", true), L("END")], spec: { line: ["1","2","3"], code: /REPEAT\s+3/i }, see: "1 then 2 then 3" },
      { goal: "REPEAT clink twice.", fresh: false, lines: [L("REPEAT 2"), L("PRINT \"clink\"", true), L("END")], spec: { minCount: { line: "clink", n: 2 } }, see: "clink twice" }
    ]),
  },
  {
    id: "catalog",
    title: "Chest list",
    blurb: "List the loot, then count it.",
    plan: ["Print the items.","MOV a name.","REPEAT the last cheer."],
    steps: buildAsmSteps("Advanced step", [
      { goal: "PRINT Chest List.", fresh: true, lines: [L("PRINT \"Chest List\"")], spec: { contains: "chest list" }, see: "Chest List" },
      { goal: "Add a treasure line.", fresh: false, lines: [L("PRINT \"Key\"")], spec: { contains: "key" }, see: "Key" },
      { goal: "Add one more line.", fresh: false, lines: [L("PRINT \"Flag\"")], spec: { contains: "flag" }, see: "Flag" },
      { goal: "MOV the name Map.", fresh: false, lines: [L("MOV hero, \"Map\"")], spec: { code: /MOV\s+hero/i }, see: "your old lines" },
      { goal: "PRINT the name.", fresh: false, lines: [L("PRINT hero")], spec: { line: "map" }, see: "Map" },
      { goal: "PRINT hello.", fresh: false, lines: [L("PRINT \"Ahoy\"")], spec: { line: "ahoy" }, see: "Ahoy" },
      { goal: "MOV 3 into R1.", fresh: false, lines: [L("MOV R1, 3")], spec: { code: /MOV\s+R1\s*,\s*3\b/i }, see: "your old lines" },
      { goal: "PRINT R1.", fresh: false, lines: [L("PRINT R1")], spec: { line: "3" }, see: "3" },
      { goal: "ADD 1 and PRINT the box.", fresh: false, lines: [L("ADD R1, 1"), L("PRINT R1")], spec: { line: "4", code: /ADD\s+R1\s*,\s*1/i }, see: "4" },
      { goal: "PRINT full.", fresh: false, lines: [L("PRINT \"full\"")], spec: { line: "full" }, see: "full" },
      { goal: "Count 1, 2, 3 with REPEAT.", fresh: false, lines: [L("MOV R2, 1"), L("REPEAT 3"), L("PRINT R2", true), L("ADD R2, 1", true), L("END")], spec: { line: ["1","2","3"], code: /REPEAT\s+3/i }, see: "1 then 2 then 3" },
      { goal: "REPEAT hooray twice.", fresh: false, lines: [L("REPEAT 2"), L("PRINT \"hooray\"", true), L("END")], spec: { minCount: { line: "hooray", n: 2 } }, see: "hooray twice" }
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
