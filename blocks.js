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

const tasks = [
  {
    goal: "Task 1: Press Go so the fish swims right.",
    help:
      "Keep the yellow start block. Add a new block under it. " +
      "Snap a blue “move right” under the start block, then press Go.",
    check: function (actions) {
      return countSteps(actions, "move_right") >= 1;
    },
  },
  {
    goal: "Task 2: Make the fish say Hi!",
    help:
      "Keep your old blocks. Add a new block under them. " +
      "Open Looks, drag “say Hi!” under your blocks, then press Go.",
    check: function (actions) {
      return hasType(actions, "say_hi");
    },
  },
  {
    goal: "Task 3: Make the fish swim left.",
    help:
      "Keep your old blocks. Add a new block under them. " +
      "Add a blue “move left” block, then press Go.",
    check: function (actions) {
      return countSteps(actions, "move_left") >= 1;
    },
  },
  {
    goal: "Task 4: Swim up 2 steps.",
    help:
      "Keep your old blocks. Add a new block under them. " +
      "Use “move up” and set the number to 2, then press Go.",
    check: function (actions) {
      return countSteps(actions, "move_up") >= 2;
    },
  },
  {
    goal: "Task 5: Use Repeat to move right 3 times.",
    help:
      "Keep your start block. You can rebuild the middle if it helps. " +
      "Open Control, drag “repeat”, put “move right” inside it, set times to 3, then press Go.",
    check: function (actions) {
      return countSteps(actions, "move_right") >= 3 && usedRepeat();
    },
  },
  {
    goal: "Task 6: Make the fish swim down.",
    help:
      "Keep your old blocks. Add a new block under them. " +
      "Add a blue “move down” block, then press Go.",
    check: function (actions) {
      return countSteps(actions, "move_down") >= 1;
    },
  },
  {
    goal: "Task 7: Swim right and say Hi! in the same run.",
    help:
      "Keep your start block. Make sure you have both a “move right” and a “say Hi!” " +
      "somewhere under start, then press Go.",
    check: function (actions) {
      return countSteps(actions, "move_right") >= 1 && hasType(actions, "say_hi");
    },
  },
  {
    goal: "Task 8: Use Repeat to move left 2 times.",
    help:
      "You can rebuild if it helps. Open Control, drag “repeat”, put “move left” inside it, " +
      "set times to 2, then press Go.",
    check: function (actions) {
      return countSteps(actions, "move_left") >= 2 && usedRepeat();
    },
  },
];

const finalIdeas = [
  {
    id: "swimstory",
    title: "Swim story",
    blurb: "Move, say Hi, and move again.",
    plan: [
      "Swim right at least once.",
      "Say Hi!",
      "Swim left or up too.",
    ],
    steps: [
      {
        goal: "Project step 1: Swim right.",
        help:
          "Keep the yellow start block. Add “move right”, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_right") >= 1;
        },
      },
      {
        goal: "Project step 2: Say Hi!",
        help:
          "Keep your old blocks. Add “say Hi!” from Looks, then press Go.",
        check: function (ctx) {
          return hasType(ctx.actions || [], "say_hi");
        },
      },
      {
        goal: "Project step 3: Swim another way.",
        help:
          "Keep your old blocks. Add move left or move up, then press Go.",
        check: function (ctx) {
          const a = ctx.actions || [];
          return countSteps(a, "move_left") >= 1 || countSteps(a, "move_up") >= 1;
        },
      },
    ],
  },
  {
    id: "dance",
    title: "Fish dance",
    blurb: "Move right, left, and say Hi.",
    plan: ["Move right.", "Move left.", "Say Hi!"],
    steps: [
      {
        goal: "Project step 1: Move right.",
        help: "Keep the yellow start block. Add move right, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_right") >= 1;
        },
      },
      {
        goal: "Project step 2: Move left.",
        help: "Keep your old blocks. Add move left, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_left") >= 1;
        },
      },
      {
        goal: "Project step 3: Say Hi!",
        help: "Keep your old blocks. Add say Hi!, then press Go.",
        check: function (ctx) {
          return hasType(ctx.actions || [], "say_hi");
        },
      },
    ],
  },
  {
    id: "repeatreef",
    title: "Repeat reef",
    blurb: "Use Repeat to swim right 3 times.",
    plan: ["Add a Repeat block.", "Put move right inside it.", "Set times to 3 and Go."],
    steps: [
      {
        goal: "Project step 1: Add a Repeat block.",
        help:
          "Keep the yellow start block. Open Control and snap Repeat under start, then press Go (even before filling it is OK if Repeat is there — or fill it first).",
        check: function () {
          return usedRepeat();
        },
      },
      {
        goal: "Project step 2: Put move right inside Repeat.",
        help:
          "Keep your blocks. Drag move right inside the Repeat mouth, then press Go.",
        check: function (ctx) {
          return usedRepeat() && countSteps(ctx.actions || [], "move_right") >= 1;
        },
      },
      {
        goal: "Project step 3: Repeat 3 right moves.",
        help:
          "Keep your blocks. Set Repeat times to 3 so the fish moves right 3 times, then press Go.",
        check: function (ctx) {
          return usedRepeat() && countSteps(ctx.actions || [], "move_right") >= 3;
        },
      },
    ],
  },
];

const advancedIdeas = [
  {
    id: "longstory",
    title: "Longer swim story",
    blurb: "Say Hi, move many ways, and use Repeat.",
    plan: [
      "Say Hi!",
      "Swim in two directions.",
      "Use Repeat for 3 right moves.",
    ],
    steps: [
      {
        goal: "Advanced step 1: Say Hi!",
        help: "Keep the yellow start block. Add say Hi!, then press Go.",
        check: function (ctx) {
          return hasType(ctx.actions || [], "say_hi");
        },
      },
      {
        goal: "Advanced step 2: Swim two ways.",
        help: "Keep your old blocks. Add move right and move left (or up), then press Go.",
        check: function (ctx) {
          const a = ctx.actions || [];
          const dirs =
            (countSteps(a, "move_right") > 0 ? 1 : 0) +
            (countSteps(a, "move_left") > 0 ? 1 : 0) +
            (countSteps(a, "move_up") > 0 ? 1 : 0) +
            (countSteps(a, "move_down") > 0 ? 1 : 0);
          return dirs >= 2;
        },
      },
      {
        goal: "Advanced step 3: Repeat move right 3 times.",
        help: "Keep your story blocks. Add Repeat with move right ×3, then press Go.",
        check: function (ctx) {
          return usedRepeat() && countSteps(ctx.actions || [], "move_right") >= 3;
        },
      },
    ],
  },
  {
    id: "uploop",
    title: "Up the reef",
    blurb: "Climb up and cheer.",
    plan: ["Move up 2 steps.", "Say Hi!", "Move right too."],
    steps: [
      {
        goal: "Advanced step 1: Move up 2 steps.",
        help: "Keep the yellow start block. Add move up set to 2, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_up") >= 2;
        },
      },
      {
        goal: "Advanced step 2: Say Hi!",
        help: "Keep your old blocks. Add say Hi!, then press Go.",
        check: function (ctx) {
          return hasType(ctx.actions || [], "say_hi");
        },
      },
      {
        goal: "Advanced step 3: Also move right.",
        help: "Keep your old blocks. Add move right, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_right") >= 1;
        },
      },
    ],
  },
  {
    id: "squareish",
    title: "Box swim",
    blurb: "Right, up, left — a little path.",
    plan: ["Move right.", "Move up.", "Move left."],
    steps: [
      {
        goal: "Advanced step 1: Move right.",
        help: "Keep the yellow start block. Add move right, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_right") >= 1;
        },
      },
      {
        goal: "Advanced step 2: Move up.",
        help: "Keep your old blocks. Add move up, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_up") >= 1;
        },
      },
      {
        goal: "Advanced step 3: Move left.",
        help: "Keep your old blocks. Add move left, then press Go.",
        check: function (ctx) {
          return countSteps(ctx.actions || [], "move_left") >= 1;
        },
      },
    ],
  },
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

function setTip(text) {
  if (helpLine) {
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
  taskGoal.textContent = task.goal;
  setTip("Try the task, then press Go. Need a hint? Tap Help.");
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
  const w = Math.max(320, stage.clientWidth);
  const h = Math.max(220, stage.clientHeight);
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
    } else if (action.type === "say_hi") {
      speech.hidden = false;
      speech.textContent = "Hi!";
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
    if (!event || event.isUiEvent) {
      return;
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
document.getElementById("reset-btn").addEventListener("click", function () {
  if (typeof CodeReefProgress !== "undefined") {
    CodeReefProgress.clear(PATH_KEY);
  }
  resetFish();
  if (workspace) {
    workspace.clear();
    seedStarterBlocks();
  }
  if (projectApi.isHandlingTasks() && projectApi.getPhase() === "building") {
    persistLesson();
    setTip("Blocks reset for your project. Press Go when ready.");
    return;
  }
  showTask();
  persistLesson();
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
