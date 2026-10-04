if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const tip = document.getElementById("tip");
const helpLine = document.getElementById("help-line");
const speech = document.getElementById("speech");
const canvas = document.getElementById("stage-canvas");
const ctx = canvas.getContext("2d");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

const CELL = 48;
let fishX = 0;
let fishY = 0;
let facing = 1;
let running = false;
let stopRequested = false;
let workspace = null;
let taskIndex = 0;
let taskDone = false;
let lastActions = [];

const PATH_KEY = "blocks";
if (typeof CodeReefProgress !== "undefined") {
  CodeReefProgress.rememberLastPath(PATH_KEY);
}

function getWorkspaceXml() {
  if (!workspace || typeof Blockly === "undefined") {
    return "";
  }
  try {
    var xml = Blockly.Xml.workspaceToDom(workspace);
    return Blockly.Xml.domToText(xml);
  } catch (err) {
    return "";
  }
}

function loadWorkspaceXml(xmlText) {
  if (!workspace || typeof Blockly === "undefined" || !xmlText) {
    return false;
  }
  try {
    workspace.clear();
    var xml = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xml, workspace);
    return true;
  } catch (err) {
    return false;
  }
}

function snapshotProgress() {
  return {
    taskIndex: taskIndex,
    taskDone: taskDone,
    code: "",
    workspaceXml: getWorkspaceXml(),
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
    setTip("You finished this task! Tap Next task when you are ready.");
  }
}

function numbered(lines) {
  const parts = [];
  for (let n = 0; n < lines.length; n += 1) {
    parts.push(n + 1 + ". " + lines[n]);
  }
  return parts.join("\n\n");
}

function moveHelp(fresh, label, steps, extra) {
  const lines = [];
  if (fresh) {
    lines.push("Keep the yellow block.");
    lines.push("It says when Go clicked.");
    lines.push("You can pull other blocks off if the stack is too long.");
  } else {
    lines.push("Keep your old blocks. Do not throw them away.");
    lines.push("Keep the yellow block that says when Go clicked.");
  }
  lines.push("Look at the left side of the screen.");
  lines.push("Tap the Motion group.");
  lines.push("Motion blocks are blue.");
  lines.push("Find the block that says " + label + ".");
  lines.push("Drag that block.");
  lines.push("Snap it under your last block so they stick together.");
  lines.push("Click the number on that " + label + " block.");
  lines.push("Delete the old number.");
  lines.push("Type " + steps + ".");
  if (extra) lines.push(extra);
  lines.push("Press the Go button. It is at the top.");
  lines.push("The fish should " + label + ".");
  return numbered(lines);
}

function sayHelp(fresh, label) {
  const lines = [];
  if (fresh) {
    lines.push("Keep the yellow block.");
    lines.push("It says when Go clicked.");
    lines.push("You can pull other blocks off.");
  } else {
    lines.push("Keep your old blocks. Do not throw them away.");
    lines.push("Keep the yellow block that says when Go clicked.");
  }
  lines.push("Look at the left side of the screen.");
  lines.push("Tap the Looks group.");
  lines.push("Find the block that says " + label + ".");
  lines.push("Drag that block.");
  lines.push("Snap it under your last block so they stick together.");
  lines.push("Press the Go button. It is at the top.");
  lines.push("The fish should " + label + ".");
  return numbered(lines);
}

function repeatHelp(label, times) {
  return numbered([
    "Keep the yellow block.",
    "It says when Go clicked.",
    "You can pull other blocks off so you can see the new ones.",
    "Look at the left side of the screen.",
    "Tap the Control group.",
    "Find the block that says repeat.",
    "Drag that block.",
    "Snap it under the yellow start block.",
    "Click the number on the repeat block.",
    "Delete the old number.",
    "Type " + times + ".",
    "Tap the Motion group.",
    "Drag " + label + ".",
    "Drop it inside the repeat block.",
    "Put it in the mouth that says do.",
    "Press the Go button. It is at the top.",
    "The fish should " + label + " more than once.",
  ]);
}

const tasks = (function buildBlockTasks() {
  const list = [];
  function add(goal, help, check, actions) {
    list.push({
      goal: "Task " + (list.length + 1) + ": " + goal,
      help: help,
      check: check,
      sampleActions: actions,
    });
  }
  add("Change move right to 3 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Look at the blue block that says move right.","Click on the word 2.","Delete that number.","Type 3.","The block should say move right 3.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 3; }, [{ type: "move_right", steps: 3 }]);
  add("Make the fish say Hi!", sayHelp(false, "say Hi!"), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 3 && countSteps(a, "say_hi") >= 1; }, [{ type: "move_right", steps: 3 }, { type: "say_hi", steps: 1 }]);
  add("Swim left 1 step.", moveHelp(false, "move left", 1), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 3 && countSteps(a, "move_left") >= 1 && countSteps(a, "say_hi") >= 1; }, [{ type: "move_right", steps: 3 }, { type: "move_left", steps: 1 }, { type: "say_hi", steps: 1 }]);
  add("Swim up 1 step.", moveHelp(false, "move up", 1), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 3 && countSteps(a, "move_left") >= 1 && countSteps(a, "move_up") >= 1 && countSteps(a, "say_hi") >= 1; }, [{ type: "move_right", steps: 3 }, { type: "move_left", steps: 1 }, { type: "move_up", steps: 1 }, { type: "say_hi", steps: 1 }]);
  add("Swim down 1 step.", moveHelp(false, "move down", 1), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 3 && countSteps(a, "move_left") >= 1 && countSteps(a, "move_up") >= 1 && countSteps(a, "move_down") >= 1 && countSteps(a, "say_hi") >= 1; }, [{ type: "move_right", steps: 3 }, { type: "move_left", steps: 1 }, { type: "move_up", steps: 1 }, { type: "move_down", steps: 1 }, { type: "say_hi", steps: 1 }]);
  add("Make the fish say Wow!", sayHelp(false, "say Wow!"), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 3 && countSteps(a, "move_left") >= 1 && countSteps(a, "move_up") >= 1 && countSteps(a, "move_down") >= 1 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1; }, [{ type: "move_right", steps: 3 }, { type: "move_left", steps: 1 }, { type: "move_up", steps: 1 }, { type: "move_down", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }]);
  add("Make the fish say Splash!", sayHelp(false, "say Splash!"), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 3 && countSteps(a, "move_left") >= 1 && countSteps(a, "move_up") >= 1 && countSteps(a, "move_down") >= 1 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1; }, [{ type: "move_right", steps: 3 }, { type: "move_left", steps: 1 }, { type: "move_up", steps: 1 }, { type: "move_down", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }]);
  add("Swim right 4 steps.", moveHelp(false, "move right", 4), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 4 && countSteps(a, "move_left") >= 1 && countSteps(a, "move_up") >= 1 && countSteps(a, "move_down") >= 1 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1; }, [{ type: "move_right", steps: 4 }, { type: "move_left", steps: 1 }, { type: "move_up", steps: 1 }, { type: "move_down", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }]);
  add("Swim left 2 steps.", moveHelp(false, "move left", 2), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 4 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 1 && countSteps(a, "move_down") >= 1 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1; }, [{ type: "move_right", steps: 4 }, { type: "move_left", steps: 2 }, { type: "move_up", steps: 1 }, { type: "move_down", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }]);
  add("Swim up 2 steps.", moveHelp(false, "move up", 2), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 4 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 1 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1; }, [{ type: "move_right", steps: 4 }, { type: "move_left", steps: 2 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }]);
  add("Swim down 2 steps.", moveHelp(false, "move down", 2), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 4 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1; }, [{ type: "move_right", steps: 4 }, { type: "move_left", steps: 2 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }]);
  add("Add a repeat block.", repeatHelp("move right", 2), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 4 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 4 }, { type: "move_left", steps: 2 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }]);
  add("Add a wait block.", numbered(["Keep your old blocks. Do not throw them away.", "Keep the yellow block that says when Go clicked.", "Look at the left side.", "Tap the Control group.", "Find the block that says wait.", "Drag that block.", "Snap it under your last block.", "Press the Go button. It is at the top.", "The fish should wait."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 4 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 4 }, { type: "move_left", steps: 2 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 5 steps.", moveHelp(false, "move right", 5), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 1 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 2 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Hi! a second time.", sayHelp(false, "say Hi!"), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 2 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 2 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 3 steps.", moveHelp(false, "move left", 3), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 2 && countSteps(a, "say_wow") >= 1 && countSteps(a, "say_splash") >= 1 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Wow! a second time.", sayHelp(false, "say Wow!"), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 2 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 2 && countSteps(a, "say_wow") >= 2 && countSteps(a, "say_splash") >= 1 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 2 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 3 steps.", moveHelp(false, "move up", 3), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 2 && countSteps(a, "say_wow") >= 2 && countSteps(a, "say_splash") >= 1 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Splash! a second time.", sayHelp(false, "say Splash!"), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 2 && countSteps(a, "say_hi") >= 2 && countSteps(a, "say_wow") >= 2 && countSteps(a, "say_splash") >= 2 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 2 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 3 steps.", moveHelp(false, "move down", 3), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 2 && countSteps(a, "say_wow") >= 2 && countSteps(a, "say_splash") >= 2 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Hi! until it happens 3 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Hi!.","Put that block inside a repeat, or snap on another one.","You need it to happen 3 times.","Press the Go button. It is at the top.","The fish should say Hi!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 2 && countSteps(a, "say_splash") >= 2 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Wow! until it happens 3 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Wow!.","Put that block inside a repeat, or snap on another one.","You need it to happen 3 times.","Press the Go button. It is at the top.","The fish should say Wow!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 2 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Splash! until it happens 3 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Splash!.","Put that block inside a repeat, or snap on another one.","You need it to happen 3 times.","Press the Go button. It is at the top.","The fish should say Splash!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 1 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Add wait until you have 2 waits.", numbered(["Keep your old blocks. Do not throw them away.", "Keep the yellow block that says when Go clicked.", "Look at the left side.", "Tap the Control group.", "Find the block that says wait.", "Drag that block.", "Snap it under your last block.", "Press the Go button. It is at the top.", "The fish should wait."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 5 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 5 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 6 steps.", moveHelp(false, "move right", 6), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 3 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 3 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 4 steps.", moveHelp(false, "move left", 4), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 3 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 3 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 4 steps.", moveHelp(false, "move up", 4), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 3 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 3 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 4 steps.", moveHelp(false, "move down", 4), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 3 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Hi! until it happens 4 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Hi!.","Put that block inside a repeat, or snap on another one.","You need it to happen 4 times.","Press the Go button. It is at the top.","The fish should say Hi!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 3 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Wow! until it happens 4 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Wow!.","Put that block inside a repeat, or snap on another one.","You need it to happen 4 times.","Press the Go button. It is at the top.","The fish should say Wow!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 3 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Splash! until it happens 4 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Splash!.","Put that block inside a repeat, or snap on another one.","You need it to happen 4 times.","Press the Go button. It is at the top.","The fish should say Splash!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 2 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Add wait until you have 3 waits.", numbered(["Keep your old blocks. Do not throw them away.", "Keep the yellow block that says when Go clicked.", "Look at the left side.", "Tap the Control group.", "Find the block that says wait.", "Drag that block.", "Snap it under your last block.", "Press the Go button. It is at the top.", "The fish should wait."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 6 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 6 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 7 steps.", moveHelp(false, "move right", 7), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 7 && countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 7 }, { type: "move_left", steps: 4 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 5 steps.", moveHelp(false, "move left", 5), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 7 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 4 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 7 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 4 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 5 steps.", moveHelp(false, "move up", 5), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 7 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 4 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 7 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 4 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 5 steps.", moveHelp(false, "move down", 5), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 7 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 4 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 7 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Hi! until it happens 5 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Hi!.","Put that block inside a repeat, or snap on another one.","You need it to happen 5 times.","Press the Go button. It is at the top.","The fish should say Hi!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 7 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 4 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 7 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Wow! until it happens 5 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Wow!.","Put that block inside a repeat, or snap on another one.","You need it to happen 5 times.","Press the Go button. It is at the top.","The fish should say Wow!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 7 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 4 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 7 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Splash! until it happens 5 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Splash!.","Put that block inside a repeat, or snap on another one.","You need it to happen 5 times.","Press the Go button. It is at the top.","The fish should say Splash!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 7 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 7 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 8 steps.", moveHelp(false, "move right", 8), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 8 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 8 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 9 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 9.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 9 && countSteps(a, "move_left") >= 5 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 9 }, { type: "move_left", steps: 5 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 6 steps.", moveHelp(false, "move left", 6), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 9 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 5 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 9 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 5 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 6 steps.", moveHelp(false, "move up", 6), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 9 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 5 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 9 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 5 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 6 steps.", moveHelp(false, "move down", 6), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 9 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 5 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 9 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Hi! until it happens 6 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Hi!.","Put that block inside a repeat, or snap on another one.","You need it to happen 6 times.","Press the Go button. It is at the top.","The fish should say Hi!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 9 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 5 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 9 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Wow! until it happens 6 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Wow!.","Put that block inside a repeat, or snap on another one.","You need it to happen 6 times.","Press the Go button. It is at the top.","The fish should say Wow!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 9 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 5 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 9 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Splash! until it happens 6 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Splash!.","Put that block inside a repeat, or snap on another one.","You need it to happen 6 times.","Press the Go button. It is at the top.","The fish should say Splash!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 9 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 9 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 10 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 10.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 10 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 10 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 11 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 11.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 11 && countSteps(a, "move_left") >= 6 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 11 }, { type: "move_left", steps: 6 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 7 steps.", moveHelp(false, "move left", 7), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 11 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 6 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 11 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 6 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 7 steps.", moveHelp(false, "move up", 7), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 11 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 6 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 11 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 6 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 7 steps.", moveHelp(false, "move down", 7), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 11 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 6 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 11 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Hi! until it happens 7 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Hi!.","Put that block inside a repeat, or snap on another one.","You need it to happen 7 times.","Press the Go button. It is at the top.","The fish should say Hi!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 11 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 6 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 11 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Wow! until it happens 7 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Wow!.","Put that block inside a repeat, or snap on another one.","You need it to happen 7 times.","Press the Go button. It is at the top.","The fish should say Wow!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 11 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 6 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 11 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Splash! until it happens 7 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Splash!.","Put that block inside a repeat, or snap on another one.","You need it to happen 7 times.","Press the Go button. It is at the top.","The fish should say Splash!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 11 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 11 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 12 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 12.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 12 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 12 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 13 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 13.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 13 && countSteps(a, "move_left") >= 7 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 13 }, { type: "move_left", steps: 7 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 8 steps.", moveHelp(false, "move left", 8), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 13 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 7 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 13 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 7 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 8 steps.", moveHelp(false, "move up", 8), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 13 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 7 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 13 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 7 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 8 steps.", moveHelp(false, "move down", 8), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 13 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 7 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 13 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Hi! until it happens 8 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Hi!.","Put that block inside a repeat, or snap on another one.","You need it to happen 8 times.","Press the Go button. It is at the top.","The fish should say Hi!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 13 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 7 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 13 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Wow! until it happens 8 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Wow!.","Put that block inside a repeat, or snap on another one.","You need it to happen 8 times.","Press the Go button. It is at the top.","The fish should say Wow!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 13 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 7 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 13 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Say Splash! until it happens 8 times.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","Find the block that says say Splash!.","Put that block inside a repeat, or snap on another one.","You need it to happen 8 times.","Press the Go button. It is at the top.","The fish should say Splash!."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 13 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 13 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 14 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 14.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 14 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 14 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 15 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 15.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 15 && countSteps(a, "move_left") >= 8 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 15 }, { type: "move_left", steps: 8 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 9 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 9.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 15 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 8 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 15 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 8 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 9 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 9.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 15 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 8 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 15 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 8 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 9 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 9.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 15 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 15 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 16 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 16.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 16 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 16 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 17 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 17.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 17 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 17 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 18 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 18.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 18 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 18 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 19 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 19.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 19 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 19 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim right 20 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move right inside the repeat.","Change the numbers until the steps add up to 20.","Repeat 3 times and move right 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move right."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 9 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 9 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 10 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 10.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 10 && countSteps(a, "move_up") >= 9 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 10 }, { type: "move_up", steps: 9 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 10 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 10.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 10 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 9 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 10 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 9 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 10 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 10.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 10 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 10 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 11 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 11.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 11 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 11 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 12 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 12.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 12 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 12 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 13 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 13.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 13 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 13 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 14 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 14.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 14 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 14 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 15 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 15.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 15 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 15 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 16 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 16.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 16 && countSteps(a, "move_up") >= 10 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 16 }, { type: "move_up", steps: 10 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 11 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 11.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 16 && countSteps(a, "move_up") >= 11 && countSteps(a, "move_down") >= 10 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 16 }, { type: "move_up", steps: 11 }, { type: "move_down", steps: 10 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 11 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 11.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 16 && countSteps(a, "move_up") >= 11 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 16 }, { type: "move_up", steps: 11 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 17 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 17.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 17 && countSteps(a, "move_up") >= 11 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 17 }, { type: "move_up", steps: 11 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim left 18 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move left inside the repeat.","Change the numbers until the steps add up to 18.","Repeat 3 times and move left 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move left."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 11 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 11 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 12 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 12.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 12 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 12 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 13 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 13.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 13 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 13 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 14 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 14.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 14 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 14 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 15 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 15.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 15 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 15 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 16 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 16.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 16 && countSteps(a, "move_down") >= 11 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 16 }, { type: "move_down", steps: 11 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 12 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 12.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 16 && countSteps(a, "move_down") >= 12 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 16 }, { type: "move_down", steps: 12 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 17 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 17.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 17 && countSteps(a, "move_down") >= 12 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 17 }, { type: "move_down", steps: 12 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim up 18 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move up inside the repeat.","Change the numbers until the steps add up to 18.","Repeat 3 times and move up 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move up."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 18 && countSteps(a, "move_down") >= 12 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 18 }, { type: "move_down", steps: 12 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 13 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 13.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 18 && countSteps(a, "move_down") >= 13 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 18 }, { type: "move_down", steps: 13 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 14 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 14.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 18 && countSteps(a, "move_down") >= 14 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 18 }, { type: "move_down", steps: 14 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 15 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 15.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 18 && countSteps(a, "move_down") >= 15 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 18 }, { type: "move_down", steps: 15 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 16 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 16.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 18 && countSteps(a, "move_down") >= 16 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 18 }, { type: "move_down", steps: 16 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 17 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 17.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 18 && countSteps(a, "move_down") >= 17 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 18 }, { type: "move_down", steps: 17 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  add("Swim down 18 steps.", numbered(["Keep your old blocks. Do not throw them away.","Keep the yellow block that says when Go clicked.","One move block only goes up to 8.","Find the block that says repeat.","Put move down inside the repeat.","Change the numbers until the steps add up to 18.","Repeat 3 times and move down 7 steps is 21 steps, which is enough.","Press the Go button. It is at the top.","The fish should move down."]), function (actions) { const a = actions || []; return countSteps(a, "move_right") >= 20 && countSteps(a, "move_left") >= 18 && countSteps(a, "move_up") >= 18 && countSteps(a, "move_down") >= 18 && countSteps(a, "say_hi") >= 8 && countSteps(a, "say_wow") >= 8 && countSteps(a, "say_splash") >= 8 && countSteps(a, "wait_block") >= 3 && usedRepeat(); }, [{ type: "move_right", steps: 20 }, { type: "move_left", steps: 18 }, { type: "move_up", steps: 18 }, { type: "move_down", steps: 18 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_hi", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_wow", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "say_splash", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }, { type: "wait_block", steps: 1 }]);
  if (list.length !== 100) throw new Error("expected 100 tasks, got " + list.length);
  return list;
})();

function blockStep(goal, help, check) {
  return { goal: goal, help: help, check: check };
}

const finalIdeas = [
  {
    id: "swimstory",
    title: "Shell hunt",
    blurb: "Swim to a shell, talk, then repeat the last dash.",
    plan: ["Swim toward the shell.","Say hello.","Repeat and wait."],
    steps: [
      blockStep("Project step 1: Swim right 2 toward the shell.", moveHelp(false, "move right", 2), function (ctx) { return countSteps(ctx.actions || [], "move_right") >= 2; }),
      blockStep("Project step 2: Say Hi! at the shell.", sayHelp(false, "say Hi!"), function (ctx) { return hasType(ctx.actions || [], "say_hi"); }),
      blockStep("Project step 3: Swim up 2.", moveHelp(false, "move up", 2), function (ctx) { return countSteps(ctx.actions || [], "move_up") >= 2; }),
      blockStep("Project step 4: Swim left 1.", moveHelp(false, "move left", 1), function (ctx) { return countSteps(ctx.actions || [], "move_left") >= 1; }),
      blockStep("Project step 5: Say Wow!", sayHelp(false, "say Wow!"), function (ctx) { return hasType(ctx.actions || [], "say_wow"); }),
      blockStep("Project step 6: Swim down 2.", moveHelp(false, "move down", 2), function (ctx) { return countSteps(ctx.actions || [], "move_down") >= 2; }),
      blockStep("Project step 7: Repeat right 3 times.", repeatHelp("move right", 3), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "move_right") >= 3; }),
      blockStep("Project step 8: Add a wait.", numbered(["Keep your old blocks. Do not throw them away.", "Keep the yellow block that says when Go clicked.", "Tap the Control group.", "Find the block that says wait.", "Drag that block under your stack.", "Press the Go button. It is at the top.", "The fish should wait."]), function (ctx) { return hasType(ctx.actions || [], "wait_block"); }),
      blockStep("Project step 9: Say Splash! to finish.", sayHelp(false, "say Splash!"), function (ctx) { return hasType(ctx.actions || [], "say_splash"); }),
      blockStep("Project step 10: Use all four directions.", numbered(["Keep your old blocks.", "Keep the yellow block.", "Make sure you have move right, move left, move up, and move down.", "Snap any missing one under the yellow block.", "Press the Go button.", "The fish should swim four ways."]), function (ctx) { const a = ctx.actions || []; return countSteps(a, "move_right") >= 1 && countSteps(a, "move_left") >= 1 && countSteps(a, "move_up") >= 1 && countSteps(a, "move_down") >= 1; })
    ],
  },
  {
    id: "dance",
    title: "Kelp dance",
    blurb: "A dance that goes up into the kelp and back down.",
    plan: ["Climb the kelp.","Add words.","Repeat the ending."],
    steps: [
      blockStep("Project step 1: Swim up 3 into the kelp.", moveHelp(false, "move up", 3), function (ctx) { return countSteps(ctx.actions || [], "move_up") >= 3; }),
      blockStep("Project step 2: Say Wow!", sayHelp(false, "say Wow!"), function (ctx) { return hasType(ctx.actions || [], "say_wow"); }),
      blockStep("Project step 3: Swim left 2.", moveHelp(false, "move left", 2), function (ctx) { return countSteps(ctx.actions || [], "move_left") >= 2; }),
      blockStep("Project step 4: Swim right 2.", moveHelp(false, "move right", 2), function (ctx) { return countSteps(ctx.actions || [], "move_right") >= 2; }),
      blockStep("Project step 5: Say Hi!", sayHelp(false, "say Hi!"), function (ctx) { return hasType(ctx.actions || [], "say_hi"); }),
      blockStep("Project step 6: Repeat up 2 times.", repeatHelp("move up", 2), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "move_up") >= 2; }),
      blockStep("Project step 7: Swim down 3.", moveHelp(false, "move down", 3), function (ctx) { return countSteps(ctx.actions || [], "move_down") >= 3; }),
      blockStep("Project step 8: Say Splash!", sayHelp(false, "say Splash!"), function (ctx) { return hasType(ctx.actions || [], "say_splash"); }),
      blockStep("Project step 9: Add a wait.", numbered(["Keep your old blocks. Do not throw them away.", "Keep the yellow block that says when Go clicked.", "Tap the Control group.", "Find the block that says wait.", "Drag that block under your stack.", "Press the Go button. It is at the top.", "The fish should wait."]), function (ctx) { return hasType(ctx.actions || [], "wait_block"); }),
      blockStep("Project step 10: Repeat Splash.", numbered(["Keep the yellow block.", "Tap the Control group.", "Drag repeat.", "Type 2 on the repeat block.", "Drag say Splash! inside the repeat.", "Press the Go button.", "The fish should say Splash! more than once."]), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "say_splash") >= 2; })
    ],
  },
  {
    id: "path",
    title: "Cave path",
    blurb: "A darker path that waits, then comes back up.",
    plan: ["Go down and left.","Wait.","Come back up."],
    steps: [
      blockStep("Project step 1: Swim down 2 into the cave.", moveHelp(false, "move down", 2), function (ctx) { return countSteps(ctx.actions || [], "move_down") >= 2; }),
      blockStep("Project step 2: Swim left 3.", moveHelp(false, "move left", 3), function (ctx) { return countSteps(ctx.actions || [], "move_left") >= 3; }),
      blockStep("Project step 3: Say Hi!", sayHelp(false, "say Hi!"), function (ctx) { return hasType(ctx.actions || [], "say_hi"); }),
      blockStep("Project step 4: Swim right 3.", moveHelp(false, "move right", 3), function (ctx) { return countSteps(ctx.actions || [], "move_right") >= 3; }),
      blockStep("Project step 5: Wait in the dark.", numbered(["Keep your old blocks. Do not throw them away.", "Keep the yellow block that says when Go clicked.", "Tap the Control group.", "Find the block that says wait.", "Drag that block under your stack.", "Press the Go button. It is at the top.", "The fish should wait."]), function (ctx) { return hasType(ctx.actions || [], "wait_block"); }),
      blockStep("Project step 6: Swim up 2.", moveHelp(false, "move up", 2), function (ctx) { return countSteps(ctx.actions || [], "move_up") >= 2; }),
      blockStep("Project step 7: Say Wow!", sayHelp(false, "say Wow!"), function (ctx) { return hasType(ctx.actions || [], "say_wow"); }),
      blockStep("Project step 8: Repeat left 2 times.", repeatHelp("move left", 2), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "move_left") >= 2; }),
      blockStep("Project step 9: Say Splash!", sayHelp(false, "say Splash!"), function (ctx) { return hasType(ctx.actions || [], "say_splash"); }),
      blockStep("Project step 10: Finish with every direction and a wait.", numbered(["Keep your old blocks.", "You need move right, left, up, and down.", "You need a wait block.", "Press the Go button.", "The fish should visit all four ways and wait."]), function (ctx) { const a = ctx.actions || []; return countSteps(a, "move_right") >= 2 && countSteps(a, "move_left") >= 2 && countSteps(a, "move_up") >= 1 && countSteps(a, "move_down") >= 1 && hasType(a, "wait_block"); })
    ],
  }
];

const advancedIdeas = [
  {
    id: "show",
    title: "Reef show",
    blurb: "A longer show with repeat, two words, and a bow.",
    plan: ["Move farther.","Say two words.","Repeat the ending."],
    steps: [
      blockStep("Advanced step 1: Swim right 4.", moveHelp(false, "move right", 4), function (ctx) { return countSteps(ctx.actions || [], "move_right") >= 4; }),
      blockStep("Advanced step 2: Say Hi! and Wow!", numbered(["Keep your old blocks.", "Drag say Hi! under the yellow block.", "Drag say Wow! under that.", "Press the Go button.", "The fish should say Hi! and Wow!."]), function (ctx) { const a = ctx.actions || []; return hasType(a, "say_hi") && hasType(a, "say_wow"); }),
      blockStep("Advanced step 3: Repeat right 3 times.", repeatHelp("move right", 3), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "move_right") >= 3; }),
      blockStep("Advanced step 4: Swim left 4 and up 3.", numbered(["Keep your old blocks.", "Set move left to 4.", "Set move up to 3.", "Press the Go button."]), function (ctx) { const a = ctx.actions || []; return countSteps(a, "move_left") >= 4 && countSteps(a, "move_up") >= 3; }),
      blockStep("Advanced step 5: Wait, then Splash! twice.", numbered(["Keep your old blocks.", "Add a wait block.", "Add a repeat of 2.", "Put say Splash! inside that repeat.", "Press the Go button.", "The fish should say Splash! more than once."]), function (ctx) { const a = ctx.actions || []; return hasType(a, "wait_block") && usedRepeat() && countSteps(a, "say_splash") >= 2; }),
      blockStep("Advanced step 6: Swim down 4 to bow.", moveHelp(false, "move down", 4), function (ctx) { return countSteps(ctx.actions || [], "move_down") >= 4; })
    ],
  },
  {
    id: "parade",
    title: "Kelp parade",
    blurb: "A parade with every word and two waits.",
    plan: ["Climb higher.","Say every word.","Wait twice."],
    steps: [
      blockStep("Advanced step 1: Swim up 4.", moveHelp(false, "move up", 4), function (ctx) { return countSteps(ctx.actions || [], "move_up") >= 4; }),
      blockStep("Advanced step 2: Say all three words.", numbered(["Keep your old blocks.", "Snap on say Hi!.", "Snap on say Wow!.", "Snap on say Splash!.", "Press the Go button."]), function (ctx) { const a = ctx.actions || []; return hasType(a, "say_hi") && hasType(a, "say_wow") && hasType(a, "say_splash"); }),
      blockStep("Advanced step 3: Repeat left 4 times.", repeatHelp("move left", 4), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "move_left") >= 4; }),
      blockStep("Advanced step 4: Add two waits.", numbered(["Keep your old blocks.", "Drag one wait block.", "Drag a second wait block.", "Press the Go button.", "The fish should wait."]), function (ctx) { return countSteps(ctx.actions || [], "wait_block") >= 2; }),
      blockStep("Advanced step 5: Swim right 4 and down 3.", numbered(["Keep your old blocks.", "Set move right to 4.", "Set move down to 3.", "Press the Go button."]), function (ctx) { const a = ctx.actions || []; return countSteps(a, "move_right") >= 4 && countSteps(a, "move_down") >= 3; }),
      blockStep("Advanced step 6: Repeat Wow twice.", numbered(["Keep the yellow block.", "Use a repeat of 2.", "Put say Wow! inside it.", "Press the Go button."]), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "say_wow") >= 2; })
    ],
  },
  {
    id: "treasure",
    title: "Square treasure",
    blurb: "Swim a square, then cheer three times.",
    plan: ["Swim four sides.","Repeat Hi!.","Wait and cheer."],
    steps: [
      blockStep("Advanced step 1: Swim a square start, right 3.", moveHelp(false, "move right", 3), function (ctx) { return countSteps(ctx.actions || [], "move_right") >= 3; }),
      blockStep("Advanced step 2: Up 3.", moveHelp(false, "move up", 3), function (ctx) { return countSteps(ctx.actions || [], "move_up") >= 3; }),
      blockStep("Advanced step 3: Left 3.", moveHelp(false, "move left", 3), function (ctx) { return countSteps(ctx.actions || [], "move_left") >= 3; }),
      blockStep("Advanced step 4: Down 3.", moveHelp(false, "move down", 3), function (ctx) { return countSteps(ctx.actions || [], "move_down") >= 3; }),
      blockStep("Advanced step 5: Repeat the cheer.", numbered(["Keep the yellow block.", "Add a repeat of 3.", "Put say Hi! inside the repeat.", "Press the Go button.", "The fish should say Hi! more than once."]), function (ctx) { return usedRepeat() && countSteps(ctx.actions || [], "say_hi") >= 3; }),
      blockStep("Advanced step 6: Wait, Wow, and Splash.", numbered(["Keep your old blocks.", "Add a wait.", "Add say Wow!.", "Add say Splash!.", "Press the Go button."]), function (ctx) { const a = ctx.actions || []; return hasType(a, "wait_block") && hasType(a, "say_wow") && hasType(a, "say_splash"); })
    ],
  }
];

function hasType(actions, type) {
  return actions.some(function (a) {
    return a.type === type;
  });
}

function countSteps(actions, type) {
  let total = 0;
  actions.forEach(function (a) {
    if (a.type === type) {
      total += a.steps || 1;
    }
  });
  return total;
}

function usedRepeat() {
  if (!workspace) {
    return false;
  }
  const blocks = workspace.getAllBlocks(false);
  return blocks.some(function (b) {
    return b.type === "repeat_block";
  });
}

function blockTypesNow() {
  if (!workspace) {
    return [];
  }
  const types = [];
  workspace.getAllBlocks(false).forEach(function (block) {
    if (types.indexOf(block.type) === -1) {
      types.push(block.type);
    }
  });
  return types;
}

let restoringBlocks = false;

function putBlockBack(type) {
  if (!workspace || typeof Blockly === "undefined") {
    return;
  }
  Blockly.Events.disable();
  try {
    const block = workspace.newBlock(type);
    if (block.getField("STEPS")) {
      block.setFieldValue(1, "STEPS");
    }
    if (block.getField("TIMES")) {
      block.setFieldValue(3, "TIMES");
    }
    block.initSvg();
    block.render();
    if (type === "when_flag") {
      block.moveBy(40, 40);
      const tops = workspace.getTopBlocks(false);
      for (let i = 0; i < tops.length; i += 1) {
        if (
          tops[i] !== block &&
          tops[i].previousConnection &&
          block.nextConnection &&
          !block.getNextBlock()
        ) {
          block.nextConnection.connect(tops[i].previousConnection);
          break;
        }
      }
      return;
    }
    const start = findStartBlock();
    if (start && block.previousConnection) {
      let tail = start;
      while (tail.getNextBlock()) {
        tail = tail.getNextBlock();
      }
      if (tail.nextConnection) {
        tail.nextConnection.connect(block.previousConnection);
        return;
      }
    }
    block.moveBy(40, 160);
  } finally {
    Blockly.Events.enable();
  }
}

function setTip(text) {
  if (helpLine && window.CodeReefHelp) {
    CodeReefHelp.show(helpLine, text);
  } else if (helpLine) {
    helpLine.textContent = text;
  }
  if (tip) {
    tip.textContent = text;
  }
}

const projectApi = CodeReefProject.attach({
  pathKey: "blocks",
  actionLabel: "Go",
  ideas: finalIdeas,
  advancedIdeas: advancedIdeas,
  setTip: setTip,
  taskBar: taskBar,
  taskGoal: taskGoal,
  nextBtn: nextBtn,
  onProjectStart: function () {
    resetFish();
    persistLesson();
  },
  getParts: function () {
    return { blocks: blockTypesNow() };
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

function projectContext(actions) {
  return {
    actions: actions || lastActions,
    code: "",
    output: "",
    usedRepeat: usedRepeat(),
  };
}

function showTask() {
  const task = tasks[taskIndex];
  taskDone = false;
  taskBar.classList.remove("is-done", "is-help", "is-project", "is-advanced");
  showNextButton(false);
  nextBtn.textContent = "Next task";
  taskGoal.textContent = window.CodeReefGuide
    ? CodeReefGuide.instruction(task.goal, task.help)
    : task.goal;
  setTip(
    window.CodeReefGuide
      ? CodeReefGuide.startHint(task.goal, task.help, "Go")
      : "Try the task, then press Go. Need a hint? Tap Help."
  );
}

function afterSkillsComplete() {
  projectApi.beginFinal();
}

function markTaskDone() {
  taskDone = true;
  taskBar.classList.add("is-done");
  taskBar.classList.remove("is-help");
  taskGoal.textContent = "Nice job! " + tasks[taskIndex].goal.replace(/^Task \d+:\s*/, "");
  persistLesson();

  if (shouldShowCoralTrail(taskIndex)) {
    showNextButton(false);
    setTip("Coral trail time! Swim up to earn coins!");
    openCoralTrail("blocks", {
      onComplete: function () {
        if (taskIndex < tasks.length - 1) {
          taskIndex += 1;
          resetFish();
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
    setTip("You finished this task! Tap Next task when you are ready.");
  } else {
    afterSkillsComplete();
  }
}

function checkTask(actions) {
  if (projectApi.isHandlingTasks() && projectApi.getPhase() === "building") {
    projectApi.tryCheck(projectContext(actions));
    return;
  }
  if (taskDone || stopRequested) {
    return;
  }
  if (tasks[taskIndex].check(actions)) {
    markTaskDone();
  } else {
    setTip("Not yet. Tap Help for a little hint, then try Go again.");
  }
}

function resizeCanvas() {
  const stage = document.getElementById("stage");
  const w = Math.max(1, stage.clientWidth);
  const h = Math.max(1, stage.clientHeight);
  canvas.width = w;
  canvas.height = h;
  drawStage();
}

function drawStage() {
  const w = canvas.width;
  const h = canvas.height;
  const midX = w / 2;
  const midY = h / 2;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#7ec8e3");
  sky.addColorStop(0.7, "#3fa7c5");
  sky.addColorStop(1, "#2f90ad");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  for (let x = midX % CELL; x < w; x += CELL) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = midY % CELL; y < h; y += CELL) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#e2c57c";
  ctx.fillRect(0, h * 0.82, w, h * 0.18);
  ctx.fillStyle = "#d7b56a";
  ctx.beginPath();
  ctx.ellipse(w * 0.2, h * 0.9, 40, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.75, h * 0.92, 55, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e07a5f";
  ctx.fillRect(w * 0.12, h * 0.62, 18, h * 0.2);
  ctx.beginPath();
  ctx.arc(w * 0.12 + 9, h * 0.62, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2cc8f";
  ctx.fillRect(w * 0.85, h * 0.66, 16, h * 0.16);
  ctx.beginPath();
  ctx.arc(w * 0.85 + 8, h * 0.66, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.arc(w * 0.3, h * 0.25, 8, 0, Math.PI * 2);
  ctx.arc(w * 0.33, h * 0.18, 5, 0, Math.PI * 2);
  ctx.arc(w * 0.7, h * 0.3, 6, 0, Math.PI * 2);
  ctx.stroke();

  drawFish(midX + fishX, midY + fishY, facing);
}

function drawFish(x, y, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * 1.15, 1.15);

  ctx.fillStyle = "rgba(0,40,60,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 26, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef8f45";
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-50, -20);
  ctx.lineTo(-44, 0);
  ctx.lineTo(-50, 20);
  ctx.closePath();
  ctx.fill();

  const body = ctx.createLinearGradient(-20, -20, 30, 20);
  body.addColorStop(0, "#ffe08a");
  body.addColorStop(0.55, "#ffb347");
  body.addColorStop(1, "#f08a4b");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 36, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, -18);
  ctx.quadraticCurveTo(-2, 0, -8, 18);
  ctx.moveTo(6, -18);
  ctx.quadraticCurveTo(12, 0, 6, 18);
  ctx.stroke();

  ctx.fillStyle = "#f4a261";
  ctx.beginPath();
  ctx.moveTo(-2, -10);
  ctx.quadraticCurveTo(8, -36, 20, -8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(16, -5, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b2b34";
  ctx.beginPath();
  ctx.arc(18, -5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(19.5, -6.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#c45d2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(20, 6, 6, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.restore();
}

function clampFish() {
  const maxX = canvas.width / 2 - 50;
  const maxY = canvas.height / 2 - 50;
  fishX = Math.max(-maxX, Math.min(maxX, fishX));
  fishY = Math.max(-maxY, Math.min(maxY, fishY));
}

function sleep(ms) {
  return new Promise(function (resolve) {
    window.setTimeout(resolve, ms);
  });
}

function defineBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "when_flag",
      message0: "when Go clicked",
      nextStatement: null,
      colour: 45,
      tooltip: "Start here",
      hat: "cap",
    },
    {
      type: "move_right",
      message0: "move right %1",
      args0: [{ type: "field_number", name: "STEPS", value: 1, min: 1, max: 8 }],
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: "move_left",
      message0: "move left %1",
      args0: [{ type: "field_number", name: "STEPS", value: 1, min: 1, max: 8 }],
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: "move_up",
      message0: "move up %1",
      args0: [{ type: "field_number", name: "STEPS", value: 1, min: 1, max: 8 }],
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: "move_down",
      message0: "move down %1",
      args0: [{ type: "field_number", name: "STEPS", value: 1, min: 1, max: 8 }],
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: "say_hi",
      message0: "say Hi!",
      previousStatement: null,
      nextStatement: null,
      colour: 290,
    },
    {
      type: "say_wow",
      message0: "say Wow!",
      previousStatement: null,
      nextStatement: null,
      colour: 290,
    },
    {
      type: "say_splash",
      message0: "say Splash!",
      previousStatement: null,
      nextStatement: null,
      colour: 290,
    },
    {
      type: "wait_block",
      message0: "wait %1 seconds",
      args0: [
        { type: "field_number", name: "SECS", value: 1, min: 0.5, max: 5, precision: 0.5 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 30,
    },
    {
      type: "repeat_block",
      message0: "repeat %1 times",
      args0: [{ type: "field_number", name: "TIMES", value: 2, min: 1, max: 10 }],
      message1: "do %1",
      args1: [{ type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
    },
  ]);
}

function findStartBlock() {
  const tops = workspace.getTopBlocks(true);
  for (let i = 0; i < tops.length; i += 1) {
    if (tops[i].type === "when_flag") {
      return tops[i];
    }
  }
  return null;
}

function expandStack(block) {
  const actions = [];
  let current = block;
  while (current) {
    if (current.type === "repeat_block") {
      const times = Number(current.getFieldValue("TIMES")) || 1;
      const inner = current.getInputTargetBlock("DO");
      const innerActions = expandStack(inner);
      for (let t = 0; t < times; t += 1) {
        for (let a = 0; a < innerActions.length; a += 1) {
          actions.push(innerActions[a]);
        }
      }
    } else if (current.type !== "when_flag") {
      actions.push({
        type: current.type,
        steps: Number(current.getFieldValue("STEPS")) || 1,
        secs: Number(current.getFieldValue("SECS")) || 1,
      });
    }
    current = current.getNextBlock();
  }
  return actions;
}

async function runProgram() {
  if (running) {
    return;
  }

  const start = findStartBlock();
  if (!start) {
    setTip("Drag a yellow “when Go clicked” block into the workspace first.");
    return;
  }

  const actions = expandStack(start.getNextBlock());
  if (actions.length === 0) {
    setTip("Snap motion blocks under the yellow start block, then press Go.");
    return;
  }

  running = true;
  stopRequested = false;
  speech.hidden = true;
  lastActions = actions;
  setTip("Running…");

  for (let i = 0; i < actions.length; i += 1) {
    if (stopRequested) {
      break;
    }
    const action = actions[i];

    if (action.type === "move_right") {
      facing = 1;
      for (let s = 0; s < action.steps; s += 1) {
        if (stopRequested) break;
        fishX += CELL;
        clampFish();
        drawStage();
        await sleep(180);
      }
    } else if (action.type === "move_left") {
      facing = -1;
      for (let s = 0; s < action.steps; s += 1) {
        if (stopRequested) break;
        fishX -= CELL;
        clampFish();
        drawStage();
        await sleep(180);
      }
    } else if (action.type === "move_up") {
      for (let s = 0; s < action.steps; s += 1) {
        if (stopRequested) break;
        fishY -= CELL;
        clampFish();
        drawStage();
        await sleep(180);
      }
    } else if (action.type === "move_down") {
      for (let s = 0; s < action.steps; s += 1) {
        if (stopRequested) break;
        fishY += CELL;
        clampFish();
        drawStage();
        await sleep(180);
      }
    } else if (action.type === "say_hi" || action.type === "say_wow" || action.type === "say_splash") {
      speech.hidden = false;
      speech.textContent = action.type === "say_wow" ? "Wow!" : action.type === "say_splash" ? "Splash!" : "Hi!";
      await sleep(900);
      if (!stopRequested) {
        speech.hidden = true;
      }
    } else if (action.type === "wait_block") {
      await sleep(action.secs * 1000);
    }
  }

  running = false;
  if (!stopRequested) {
    checkTask(actions);
  } else {
    setTip("Stopped. Press Go when you are ready.");
  }
}

function resetFish() {
  stopRequested = true;
  running = false;
  fishX = 0;
  fishY = 0;
  facing = 1;
  speech.hidden = true;
  drawStage();
  setTip("Fish is back at the start. Press Go to run.");
}

function seedStarterBlocks() {
  const xmlText =
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="when_flag" x="24" y="24">' +
    '<next><block type="move_right"><field name="STEPS">2</field></block></next>' +
    "</block></xml>";
  const xml = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(xml, workspace);
}

function startEditor() {
  defineBlocks();

  workspace = Blockly.inject("blocklyDiv", {
    toolbox: document.getElementById("toolbox"),
    trashcan: true,
    scrollbars: true,
    renderer: "zelos",
    theme: Blockly.Themes.Classic,
    move: {
      scrollbars: true,
      drag: true,
      wheel: true,
    },
    grid: {
      spacing: 20,
      length: 3,
      colour: "#dce4ee",
      snap: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.05,
      maxScale: 1.5,
      minScale: 0.7,
    },
  });

  var saved =
    typeof CodeReefProgress !== "undefined" ? CodeReefProgress.load(PATH_KEY) : null;
  if (saved) {
    taskIndex = CodeReefProgress.clampTaskIndex(saved.taskIndex, tasks.length);
  }

  var restored = saved && saved.workspaceXml && loadWorkspaceXml(saved.workspaceXml);
  if (!restored) {
    seedStarterBlocks();
  }

  workspace.addChangeListener(function (event) {
    if (!event || event.isUiEvent || restoringBlocks) {
      return;
    }
    if (projectApi.getPhase() === "building") {
      const missing = projectApi.guardBlockTypes(blockTypesNow());
      if (missing.length) {
        restoringBlocks = true;
        missing.forEach(putBlockBack);
        restoringBlocks = false;
      }
    }
    persistLessonSoon();
  });

  resizeCanvas();
  if (projectApi.resumeIfNeeded()) {
    return;
  }
  showTask();
  if (saved && saved.taskDone) {
    restoreDoneWaitingForNext();
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
    resetFish();
    showTask();
    persistLesson();
  }
});

document.getElementById("run-btn").addEventListener("click", function () {
  runProgram();
});
document.getElementById("stop-btn").addEventListener("click", function () {
  stopRequested = true;
});
window.addEventListener("resize", function () {
  resizeCanvas();
  if (workspace) {
    Blockly.svgResize(workspace);
  }
});

if (typeof Blockly === "undefined") {
  setTip("Could not load Blockly. Check your internet, then refresh.");
} else {
  window.requestAnimationFrame(function () {
    startEditor();
    window.requestAnimationFrame(function () {
      resizeCanvas();
      if (workspace) {
        Blockly.svgResize(workspace);
      }
    });
  });
}
