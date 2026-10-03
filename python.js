if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const codeBox = document.getElementById("py-code");
const outputBox = document.getElementById("py-output");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;
let lastOutput = "";

const PATH_KEY = "python";
if (typeof CodeReefProgress !== "undefined") {
  CodeReefProgress.rememberLastPath(PATH_KEY);
}

const starterCode = `print("Hello, reef!")
`;

const projectStarter = `print("My reef project")
`;

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

function outHas(line) {
  const lines = normalizeOut(lastOutput).split("\n");
  return lines.indexOf(String(line).toLowerCase()) !== -1;
}

function outContains(bit) {
  return normalizeOut(lastOutput).indexOf(String(bit).toLowerCase()) !== -1;
}

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
        return (line.indent ? "    " : "") + line.text;
      })
      .join("\n") + "\n"
  );
}

function explainPyLine(line) {
  const t = String(line || "").trim();
  const quote = 'A quote is this mark: "';
  let m = t.match(/^print\("([^"]*)"\)$/);
  if (m) {
    return [
      'Type this exactly: print("' + m[1] + '")',
      "print means show these words on the screen.",
      "Type the word print.",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\("([^"]*)"\s*\+\s*([A-Za-z_][A-Za-z0-9_]*)\)$/);
  if (m) {
    return [
      'Type this exactly: print("' + m[1] + '" + ' + m[2] + ")",
      "print means show words on the screen.",
      "A plus sign + sticks words together.",
      "Type the word print.",
      "Then type this mark: (",
      quote,
      "Then type " + m[1],
      "Then type a quote again.",
      "Then type a space, then +, then a space.",
      "Then type " + m[2] + " with no quotes.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\[(\d+)\]\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + "[" + m[2] + "])",
      "print means show this on the screen.",
      "[" + m[2] + "] means spot " + m[2] + " in the list.",
      "Lists start at 0. So 0 is the first word.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: [",
      "Then type " + m[2],
      "Then type this mark: ]",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + ")",
      "print means show what " + m[1] + " remembers.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1] + " with no quotes.",
      "Then type this mark: )",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\s*\+\s*(\d+)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + " + " + m[2] + ")",
      "print means show the answer on the screen.",
      "Plus + adds numbers.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then +, then a space.",
      "Then type " + m[2],
      "Then type this mark: )",
      "Do not put quotes around the number.",
    ];
  }
  m = t.match(/^print\(([A-Za-z_][A-Za-z0-9_]*)\s*-\s*(\d+)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + " - " + m[2] + ")",
      "print means show the answer on the screen.",
      "Minus - takes away.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then -, then a space.",
      "Then type " + m[2],
      "Then type this mark: )",
      "Do not put quotes around the number.",
    ];
  }
  m = t.match(/^print\((\d+)\s*([+\-*])\s*(\d+)\)$/);
  if (m) {
    const word = m[2] === "+" ? "Plus + adds." : m[2] === "-" ? "Minus - takes away." : "The star * means times.";
    return [
      "Type this exactly: print(" + m[1] + " " + m[2] + " " + m[3] + ")",
      "print means show the answer on the screen.",
      word,
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type a space, then " + m[2] + ", then a space.",
      "Then type " + m[3],
      "Then type this mark: )",
      "Do not put quotes around the numbers.",
    ];
  }
  m = t.match(/^print\((.+)\)$/);
  if (m) {
    return [
      "Type this exactly: print(" + m[1] + ")",
      "print means show this on the screen.",
      "Type the word print.",
      "Then type this mark: (",
      "Then type " + m[1],
      "Then type this mark: )",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\[.*\])$/);
  if (m) {
    return [
      "Type this exactly: " + m[1] + " = " + m[2],
      "A list is a box that holds words.",
      "Type " + m[1],
      "Then type a space, then =, then a space.",
      "= means remember this.",
      "Then type " + m[2],
      "The [ starts the list. The ] ends the list.",
      quote,
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)"$/);
  if (m) {
    return [
      'Type this exactly: ' + m[1] + ' = "' + m[2] + '"',
      "A variable is a name that remembers a word.",
      "Type " + m[1],
      "Then type a space, then =, then a space.",
      "= means remember this.",
      quote,
      "Then type " + m[2],
      "Then type a quote again.",
    ];
  }
  m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+)$/);
  if (m) {
    return [
      "Type this exactly: " + m[1] + " = " + m[2],
      "A variable is a name that remembers a number.",
      "Type " + m[1],
      "Then type a space, then =, then a space.",
      "Then type " + m[2],
      "Do not put quotes around a number.",
    ];
  }
  m = t.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+range\(([^)]+)\):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means do the next lines again and again.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type a space, then " + m[1] + ", then a space.",
      "Then type the word in, then a space.",
      "Then type range.",
      "Then type this mark: (",
      "Then type " + m[2],
      "Then type this mark: )",
      "Then type a colon. A colon is this mark: :",
      "The colon means the next line belongs inside.",
    ];
  }
  m = t.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+([A-Za-z_][A-Za-z0-9_]*):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "for means walk through the list, one word at a time.",
      "That is called a loop.",
      "A loop means do it again and again.",
      "Type the word for.",
      "Then type a space, then " + m[1] + ", then a space.",
      "Then type the word in, then a space.",
      "Then type " + m[2],
      "Then type a colon. A colon is this mark: :",
    ];
  }
  m = t.match(/^if\s+(.+):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "if means pick a path. Do this only when it is true.",
      "Type the word if.",
      "Then type a space.",
      "Then type " + m[1],
      "Then type a colon. A colon is this mark: :",
      "The next line belongs inside this if.",
    ];
  }
  if (t === "else:") {
    return [
      "Type this exactly: else:",
      "else means the other path.",
      "Type the word else.",
      "Then type a colon. A colon is this mark: :",
    ];
  }
  m = t.match(/^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\):$/);
  if (m) {
    return [
      "Type this exactly: " + t,
      "def makes a function. A function is a recipe you can run later.",
      "Type the word def.",
      "Then type a space, then " + m[1],
      "Then type this mark: (",
      "Then type " + (m[2] || "nothing"),
      "Then type this mark: )",
      "Then type a colon. A colon is this mark: :",
      "The next line belongs inside the recipe.",
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
  if (!bits) {
    return;
  }
  if (Array.isArray(bits)) {
    for (let i = 0; i < bits.length; i += 1) {
      if (bits[i]) {
        steps.push(bits[i]);
      }
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
      if (bit) {
        steps.push(bit);
      }
    }
  }
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if ((!fresh && i === 0) || i > 0) {
      steps.push("Press the Enter key. That starts a new line.");
    }
    if (line.indent) {
      steps.push("Press the space bar 4 times.");
      steps.push("This line sits inside the line above.");
    } else if (i > 0 && lines[i - 1].indent) {
      steps.push("Press Backspace until this line starts at the left edge.");
    }
    pushBits(steps, explainPyLine(line.text));
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
      if (output.indexOf(String(bits[b]).toLowerCase()) === -1) {
        return false;
      }
    }
  }
  if (spec.line) {
    const lines = output.split("\n");
    const bits = Array.isArray(spec.line) ? spec.line : [spec.line];
    for (let b = 0; b < bits.length; b += 1) {
      if (lines.indexOf(String(bits[b]).toLowerCase()) === -1) {
        return false;
      }
    }
  }
  if (spec.minCount) {
    const want = String(spec.minCount.line).toLowerCase();
    const n = output.split("\n").filter(function (item) {
      return item === want;
    }).length;
    if (n < spec.minCount.n) {
      return false;
    }
  }
  if (spec.code && !spec.code.test(code)) {
    return false;
  }
  if (spec.minLines && output.split("\n").filter(Boolean).length < spec.minLines) {
    return false;
  }
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

const tasks = (function buildPythonTasks() {
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

  add(
    "Make Python say Hello, ocean!",
    true,
    [L('print("Hello, ocean!")')],
    { contains: "hello, ocean!" },
    "Hello, ocean!",
    'print("Hello, ocean!")\n',
    "You can also keep the old line and only change the word reef to ocean."
  );
  list[0].help = numbered([
    "Keep your old code. Do not erase the whole line.",
    "Click in the code box.",
    "Click on the word reef.",
    "Delete the letters r e e f.",
    "Type the word ocean in that same spot.",
    'The line should look like this: print("Hello, ocean!")',
    "print means show these words on the screen.",
    "Type the word print.",
    "Then type this mark: (",
    'A quote is this mark: "',
    "The words Hello, ocean! stay between the quotes.",
    "Then type this mark: )",
    "Press the Run button. It is at the top.",
    "You should see Hello, ocean!",
  ]);

  add(
    "Print two lines — Hello, ocean! then I love Python!",
    false,
    [L('print("I love Python!")')],
    { contains: ["hello, ocean!", "i love python!"] },
    "I love Python!",
    'print("Hello, ocean!")\nprint("I love Python!")\n'
  );

  add(
    'Make a variable fish = "clownfish" and print it.',
    false,
    [L('fish = "clownfish"'), L("print(fish)")],
    { code: /fish\s*=\s*["']clownfish["']/, line: "clownfish" },
    "clownfish"
  );

  add(
    "Use a for loop to print 1, then 2, then 3.",
    true,
    [L("for i in range(1, 4):"), L("print(i)", true)],
    { code: /for\s+\w+\s+in\s+range\s*\(/, line: ["1", "2", "3"] },
    "1 then 2 then 3"
  );

  add(
    "Print the number 5.",
    true,
    [L("print(5)")],
    { line: "5" },
    "5"
  );

  add(
    'Make coral = "reef" and print it.',
    false,
    [L('coral = "reef"'), L("print(coral)")],
    { code: /coral\s*=\s*["']reef["']/, line: "reef" },
    "reef"
  );

  add(
    "Loop to print splash three times.",
    true,
    [L("for i in range(3):"), L('print("splash")', true)],
    { code: /for\s+\w+\s+in\s+range\s*\(/, minCount: { line: "splash", n: 3 } },
    "splash three times"
  );

  const printWords = [
    "bubble",
    "wave",
    "crab",
    "dolphin",
    "turtle",
    "coral",
    "sand",
    "shell",
    "whale",
    "shark",
    "starfish",
    "eel",
  ];
  printWords.forEach(function (word) {
    add(
      "Print the word " + word + ".",
      false,
      [L('print("' + word + '")')],
      { contains: word },
      word
    );
  });

  const varPairs = [
    ["pet", "crab"],
    ["boat", "blue"],
    ["hero", "Fin"],
    ["snack", "kelp"],
    ["home", "reef"],
    ["friend", "Nemo"],
    ["color", "teal"],
    ["toy", "shell"],
    ["pal", "otter"],
    ["ride", "wave"],
    ["team", "pods"],
    ["gem", "pearl"],
  ];
  varPairs.forEach(function (pair) {
    add(
      'Make ' + pair[0] + ' = "' + pair[1] + '" and print it.',
      false,
      [L(pair[0] + ' = "' + pair[1] + '"'), L("print(" + pair[0] + ")")],
      {
        code: new RegExp(pair[0] + "\\s*=\\s*[\"']" + pair[1] + "[\"']", "i"),
        line: pair[1].toLowerCase(),
      },
      pair[1]
    );
  });

  const mathRows = [
    ["2 + 3", "5"],
    ["4 + 1", "5"],
    ["10 - 3", "7"],
    ["8 - 2", "6"],
    ["2 * 3", "6"],
    ["4 * 2", "8"],
    ["1 + 6", "7"],
    ["9 - 4", "5"],
    ["3 * 3", "9"],
    ["5 + 5", "10"],
  ];
  mathRows.forEach(function (row) {
    add(
      "Print the math " + row[0] + ".",
      true,
      [L("print(" + row[0] + ")")],
      { line: row[1], code: /print\s*\(/ },
      row[1]
    );
  });

  const loopWords = ["splash", "bubble", "yay", "hi", "wave", "go"];
  loopWords.forEach(function (word) {
    add(
      'Use a loop to print "' + word + '" three times.',
      true,
      [L("for i in range(3):"), L('print("' + word + '")', true)],
      { code: /for\s+\w+\s+in\s+range\s*\(/, minCount: { line: word, n: 3 } },
      word + " three times"
    );
  });
  const numberLoops = [
    ["1, 4", ["1", "2", "3"]],
    ["1, 5", ["1", "2", "3", "4"]],
    ["0, 3", ["0", "1", "2"]],
    ["2, 5", ["2", "3", "4"]],
    ["1, 6", ["1", "2", "3", "4", "5"]],
    ["4, 7", ["4", "5", "6"]],
  ];
  numberLoops.forEach(function (row) {
    add(
      "Use a loop to print " + row[1].join(", then ") + ".",
      true,
      [L("for i in range(" + row[0] + "):"), L("print(i)", true)],
      { code: /for\s+\w+\s+in\s+range\s*\(/, line: row[1] },
      row[1].join(" then ")
    );
  });

  const ifRows = [
    ["9", ">", "5", "big", "small", "big"],
    ["1", ">", "5", "big", "small", "small"],
    ["8", ">", "3", "yes", "no", "yes"],
    ["2", "<", "4", "low", "high", "low"],
    ["10", ">", "7", "tall", "short", "tall"],
    ["0", ">", "2", "hot", "cold", "cold"],
    ["6", ">", "6", "same", "notyet", "notyet"],
    ["4", "<", "9", "ok", "nope", "ok"],
    ["3", ">", "1", "swim", "rest", "swim"],
    ["5", "<", "5", "up", "down", "down"],
    ["7", ">", "2", "pass", "try", "pass"],
    ["1", "<", "1", "a", "b", "b"],
  ];
  ifRows.forEach(function (row) {
    add(
      "Use if and else so the path prints " + row[5] + ".",
      true,
      [
        L("score = " + row[0]),
        L("if score " + row[1] + " " + row[2] + ":"),
        L('print("' + row[3] + '")', true),
        L("else:"),
        L('print("' + row[4] + '")', true),
      ],
      { code: /\bif\b[\s\S]*\belse\b/, line: row[5] },
      row[5]
    );
  });

  const listRows = [
    ["crab", "eel"],
    ["whale", "shark"],
    ["sand", "shell"],
    ["blue", "teal"],
    ["fin", "bubbles"],
    ["kelp", "coral"],
  ];
  listRows.forEach(function (pair) {
    add(
      'Make a list pets and print the first word "' + pair[0] + '".',
      true,
      [L('pets = ["' + pair[0] + '", "' + pair[1] + '"]'), L("print(pets[0])")],
      { code: /\[\s*["']/, line: pair[0] },
      pair[0]
    );
    add(
      "Loop through the list and print both " + pair[0] + " and " + pair[1] + ".",
      true,
      [
        L('pets = ["' + pair[0] + '", "' + pair[1] + '"]'),
        L("for pet in pets:"),
        L("print(pet)", true),
      ],
      { code: /for\s+\w+\s+in\s+pets\s*:/, line: [pair[0], pair[1]] },
      pair[0] + " and " + pair[1]
    );
  });

  const fnWords = ["wave", "splash", "hi", "yay", "wow", "go", "pop"];
  fnWords.forEach(function (word) {
    add(
      "Make a function " + word + " that prints " + word + ", then run it.",
      true,
      [L("def " + word + "():"), L('print("' + word + '")', true), L(word + "()")],
      { code: new RegExp("def\\s+" + word + "\\s*\\("), line: word },
      word
    );
  });
  const fnArgs = [
    ["cheer", "reef"],
    ["greet", "sam"],
    ["shout", "go"],
    ["call", "fin"],
    ["hail", "nemo"],
    ["sayhi", "otter"],
  ];
  fnArgs.forEach(function (pair) {
    add(
      "Make a function " + pair[0] + " that prints the name you give it.",
      true,
      [
        L("def " + pair[0] + "(name):"),
        L("print(name)", true),
        L(pair[0] + '("' + pair[1] + '")'),
      ],
      { code: new RegExp("def\\s+" + pair[0] + "\\s*\\("), line: pair[1] },
      pair[1]
    );
  });

  add(
    "Save a hero name, then use if to print found.",
    true,
    [
      L('hero = "Fin"'),
      L("print(hero)"),
      L('if hero == "Fin":'),
      L('print("found")', true),
    ],
    { code: /\bif\b/, line: "found" },
    "found"
  );
  add(
    "Add 1 to a number variable and print it.",
    true,
    [L("waves = 3"), L("print(waves + 1)")],
    { code: /waves\s*\+\s*1/, line: "4" },
    "4"
  );
  add(
    "Stick a hello onto a name.",
    true,
    [L('name = "Sam"'), L('print("Hello " + name)')],
    { contains: "hello sam" },
    "Hello Sam"
  );
  add(
    "Print the second word in a list. Spot 1 is the second word.",
    true,
    [L('pets = ["crab", "eel"]'), L("print(pets[1])")],
    { code: /pets\s*\[\s*1\s*\]/, line: "eel" },
    "eel"
  );
  add(
    "Use a function and a variable together.",
    true,
    [
      L('pet = "crab"'),
      L("def show():"),
      L('print("ready")', true),
      L("show()"),
      L("print(pet)"),
    ],
    { code: /def\s+show\s*\(/, line: ["ready", "crab"] },
    "ready and crab"
  );
  add(
    "Loop 2 times and also print a title.",
    true,
    [L('print("Title")'), L("for i in range(2):"), L('print("go")', true)],
    { code: /for\s+\w+\s+in\s+range\s*\(/, contains: "title", minCount: { line: "go", n: 2 } },
    "Title and go go"
  );
  add(
    "If a score is big, print pass.",
    true,
    [L("score = 10"), L("if score > 5:"), L('print("pass")', true), L("else:"), L('print("try")', true)],
    { code: /\bif\b/, line: "pass" },
    "pass"
  );
  add(
    "Take 2 away from a score and print it.",
    true,
    [L("score = 9"), L("print(score - 2)")],
    { code: /score\s*-\s*2/, line: "7" },
    "7"
  );
  add(
    "Print every animal in a list of three.",
    true,
    [
      L('animals = ["crab", "eel", "whale"]'),
      L("for animal in animals:"),
      L("print(animal)", true),
    ],
    { code: /for\s+\w+\s+in\s+animals\s*:/, line: ["crab", "eel", "whale"] },
    "crab, eel, and whale"
  );
  add(
    "Make two functions and run both.",
    true,
    [
      L("def ping():"),
      L('print("ping")', true),
      L("def pong():"),
      L('print("pong")', true),
      L("ping()"),
      L("pong()"),
    ],
    { code: /def\s+ping\s*\(/, line: ["ping", "pong"] },
    "ping and pong"
  );

  const padWords = ["pearl", "kelp", "otter", "foam", "tide", "cove", "pier", "gull", "dune", "mist"];
  let pad = 0;
  while (list.length < 100) {
    const word = padWords[pad % padWords.length] + (pad >= padWords.length ? String(pad) : "");
    pad += 1;
    add(
      "Print the extra word " + word + ".",
      false,
      [L('print("' + word + '")')],
      { contains: word },
      word
    );
  }

  return list;
})();

function buildPySteps(prefix, rows) {
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
    blurb: "A long story that uses words, a name, math, if, a list, and a function.",
    plan: [
      "Print a title and two story lines.",
      "Save a hero name and say hello.",
      "Count waves with a number.",
      "Use if, a list, and a function to finish.",
    ],
    steps: buildPySteps("Project step", [
      { goal: "Print a story title.", fresh: true, lines: [L('print("Ocean Story")')], spec: { contains: "ocean story" }, see: "Ocean Story" },
      { goal: "Add a story line.", lines: [L('print("A fish swam out.")')], spec: { minLines: 2 }, see: "A fish swam out." },
      { goal: "Add a blue-water line.", lines: [L('print("The water was blue.")')], spec: { minLines: 3 }, see: "The water was blue." },
      { goal: "Save the hero name Fin.", lines: [L('hero = "Fin"')], spec: { code: /hero\s*=\s*["']Fin["']/ }, see: "your old story lines" },
      { goal: "Print the hero name.", lines: [L("print(hero)")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Say hello to the hero.", lines: [L('print("Hello " + hero)')], spec: { contains: "hello fin" }, see: "Hello Fin" },
      { goal: "Save the number of waves.", lines: [L("waves = 3")], spec: { code: /waves\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print how many waves.", lines: [L("print(waves)")], spec: { line: "3" }, see: "3" },
      { goal: "Print one more than the waves.", lines: [L("print(waves + 1)")], spec: { code: /waves\s*\+\s*1/, line: "4" }, see: "4" },
      { goal: "If waves are more than 2, print big.", lines: [L("if waves > 2:"), L('print("big")', true)], spec: { code: /\bif\b/, line: "big" }, see: "big" },
      { goal: "Add the other path, else.", lines: [L("else:"), L('print("calm")', true)], spec: { code: /\belse\b/ }, see: "big still, because 3 is more than 2", note: "Click at the end of the line print(\"big\")." },
      { goal: "Make a list of two pets.", lines: [L('pets = ["crab", "eel"]')], spec: { code: /\[\s*["']crab["']/ }, see: "your old lines" },
      { goal: "Print the first pet.", lines: [L("print(pets[0])")], spec: { code: /pets\s*\[\s*0\s*\]/, line: "crab" }, see: "crab" },
      { goal: "Print every pet with a loop.", lines: [L("for pet in pets:"), L("print(pet)", true)], spec: { code: /for\s+\w+\s+in\s+pets\s*:/, line: "eel" }, see: "eel" },
      { goal: "Make a cheer function.", lines: [L("def cheer():"), L('print("yay")', true)], spec: { code: /def\s+cheer\s*\(/ }, see: "your old lines. Nothing new prints until you run cheer." },
      { goal: "Run the cheer function.", lines: [L("cheer()")], spec: { line: "yay" }, see: "yay" },
      { goal: "Print The end.", lines: [L('print("The end")')], spec: { contains: "the end" }, see: "The end" },
      { goal: "Print You did it!", lines: [L('print("You did it!")')], spec: { contains: "you did it" }, see: "You did it!" },
    ]),
  },
  {
    id: "names",
    title: "Fish name generator",
    blurb: "Name two fish, count them, and print the whole list.",
    plan: [
      "Print a title and save two names.",
      "Say hello to each name.",
      "Count, compare, list, and cheer.",
    ],
    steps: buildPySteps("Project step", [
      { goal: "Print a title.", fresh: true, lines: [L('print("Fish Names")')], spec: { contains: "fish names" }, see: "Fish Names" },
      { goal: "Save the name Bubbles.", lines: [L('name = "Bubbles"')], spec: { code: /name\s*=\s*["']Bubbles["']/ }, see: "the title" },
      { goal: "Print the name.", lines: [L("print(name)")], spec: { line: "bubbles" }, see: "Bubbles" },
      { goal: "Say hello to the name.", lines: [L('print("Hello " + name)')], spec: { contains: "hello bubbles" }, see: "Hello Bubbles" },
      { goal: "Save a friend name.", lines: [L('friend = "Coral"')], spec: { code: /friend\s*=\s*["']Coral["']/ }, see: "your old lines" },
      { goal: "Print the friend.", lines: [L("print(friend)")], spec: { line: "coral" }, see: "Coral" },
      { goal: "Say meet the friend.", lines: [L('print("Meet " + friend)')], spec: { contains: "meet coral" }, see: "Meet Coral" },
      { goal: "Save the number 2.", lines: [L("count = 2")], spec: { code: /count\s*=\s*2/ }, see: "your old lines" },
      { goal: "Print the count.", lines: [L("print(count)")], spec: { line: "2" }, see: "2" },
      { goal: "Print one more than the count.", lines: [L("print(count + 1)")], spec: { line: "3" }, see: "3" },
      { goal: "If count is more than 1, print many.", lines: [L("if count > 1:"), L('print("many")', true)], spec: { code: /\bif\b/, line: "many" }, see: "many" },
      { goal: "Add else for the other path.", lines: [L("else:"), L('print("one")', true)], spec: { code: /\belse\b/ }, see: "many still", note: "Click at the end of print(\"many\")." },
      { goal: "Make a list of both names.", lines: [L('names = ["Bubbles", "Coral"]')], spec: { code: /\[\s*["']Bubbles["']/ }, see: "your old lines" },
      { goal: "Print the first list name.", lines: [L("print(names[0])")], spec: { code: /names\s*\[\s*0\s*\]/ }, see: "Bubbles" },
      { goal: "Loop over the names.", lines: [L("for fish in names:"), L("print(fish)", true)], spec: { code: /for\s+\w+\s+in\s+names\s*:/, line: "coral" }, see: "Coral" },
      { goal: "Make a splash function.", lines: [L("def yay():"), L('print("splash")', true)], spec: { code: /def\s+yay\s*\(/ }, see: "your old lines" },
      { goal: "Run yay.", lines: [L("yay()")], spec: { minCount: { line: "splash", n: 1 } }, see: "splash" },
      { goal: "Print All named!", lines: [L('print("All named!")')], spec: { contains: "all named" }, see: "All named!" },
    ]),
  },
  {
    id: "quiz",
    title: "Mini quiz",
    blurb: "Ask a question, save the answer, and keep a score.",
    plan: [
      "Print a question and save the answer.",
      "Use a score and math.",
      "Use if, a list, and a function to finish.",
    ],
    steps: buildPySteps("Project step", [
      { goal: "Print Quiz Time.", fresh: true, lines: [L('print("Quiz Time")')], spec: { contains: "quiz time" }, see: "Quiz Time" },
      { goal: "Print a question.", lines: [L('print("How many arms does a starfish have?")')], spec: { contains: "?" }, see: "the question" },
      { goal: "Save the answer 5.", lines: [L('answer = "5"')], spec: { code: /answer\s*=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("print(answer)")], spec: { line: "5" }, see: "5" },
      { goal: "Print The answer is plus the answer.", lines: [L('print("The answer is " + answer)')], spec: { contains: "the answer is 5" }, see: "The answer is 5" },
      { goal: "Save score = 10.", lines: [L("score = 10")], spec: { code: /score\s*=\s*10/ }, see: "your old lines" },
      { goal: "Print the score.", lines: [L("print(score)")], spec: { line: "10" }, see: "10" },
      { goal: "Print score minus 2.", lines: [L("print(score - 2)")], spec: { line: "8" }, see: "8" },
      { goal: "If score is more than 5, print pass.", lines: [L("if score > 5:"), L('print("pass")', true)], spec: { code: /\bif\b/, line: "pass" }, see: "pass" },
      { goal: "Add else.", lines: [L("else:"), L('print("try again")', true)], spec: { code: /\belse\b/ }, see: "pass still", note: "Click at the end of print(\"pass\")." },
      { goal: "Save bonus = 1.", lines: [L("bonus = 1")], spec: { code: /bonus\s*=\s*1/ }, see: "your old lines" },
      { goal: "Print the bonus.", lines: [L("print(bonus)")], spec: { line: "1" }, see: "1" },
      { goal: "Make a list of two facts.", lines: [L('facts = ["five arms", "lives in the sea"]')], spec: { code: /facts\s*=\s*\[/ }, see: "your old lines" },
      { goal: "Print fact spot 1.", lines: [L("print(facts[1])")], spec: { contains: "lives in the sea" }, see: "lives in the sea" },
      { goal: "Loop over the facts.", lines: [L("for fact in facts:"), L("print(fact)", true)], spec: { code: /for\s+\w+\s+in\s+facts\s*:/, contains: "five arms" }, see: "five arms" },
      { goal: "Make a done function.", lines: [L("def done():"), L('print("quiz done")', true)], spec: { code: /def\s+done\s*\(/ }, see: "your old lines" },
      { goal: "Run done.", lines: [L("done()")], spec: { contains: "quiz done" }, see: "quiz done" },
      { goal: "Print You finished the quiz!", lines: [L('print("You finished the quiz!")')], spec: { contains: "you finished the quiz" }, see: "You finished the quiz!" },
    ]),
  },
];

const advancedIdeas = [
  {
    id: "adventure",
    title: "Ocean adventure",
    blurb: "A hero, a loop of waves, a list, and a victory function.",
    plan: ["Name the hero.", "Count and loop.", "Finish with a list and a function."],
    steps: buildPySteps("Advanced step", [
      { goal: "Print Ocean Adventure.", fresh: true, lines: [L('print("Ocean Adventure")')], spec: { contains: "ocean adventure" }, see: "Ocean Adventure" },
      { goal: "Save hero Fin.", lines: [L('hero = "Fin"')], spec: { code: /hero\s*=\s*["']/ }, see: "the title" },
      { goal: "Print the hero.", lines: [L("print(hero)")], spec: { line: "fin" }, see: "Fin" },
      { goal: "Print Go plus the hero.", lines: [L('print("Go " + hero)')], spec: { contains: "go fin" }, see: "Go Fin" },
      { goal: "Save hearts = 3.", lines: [L("hearts = 3")], spec: { code: /hearts\s*=\s*3/ }, see: "your old lines" },
      { goal: "Print hearts.", lines: [L("print(hearts)")], spec: { line: "3" }, see: "3" },
      { goal: "Loop to print 1, 2, 3.", lines: [L("for i in range(1, 4):"), L("print(i)", true)], spec: { code: /for\s+\w+\s+in\s+range\s*\(/, line: ["1", "2", "3"] }, see: "1 then 2 then 3" },
      { goal: "If hearts are more than 2, print strong.", lines: [L("if hearts > 2:"), L('print("strong")', true)], spec: { code: /\bif\b/, line: "strong" }, see: "strong" },
      { goal: "Add else.", lines: [L("else:"), L('print("rest")', true)], spec: { code: /\belse\b/ }, see: "strong still", note: "Click at the end of print(\"strong\")." },
      { goal: "Make a crew list.", lines: [L('crew = ["Fin", "Bubbles"]')], spec: { code: /crew\s*=\s*\[/ }, see: "your old lines" },
      { goal: "Loop over the crew.", lines: [L("for pal in crew:"), L("print(pal)", true)], spec: { code: /for\s+\w+\s+in\s+crew\s*:/, line: "bubbles" }, see: "Bubbles" },
      { goal: "Make win and run it.", lines: [L("def win():"), L('print("You win!")', true), L("win()")], spec: { code: /def\s+win\s*\(/, contains: "you win" }, see: "You win!" },
    ]),
  },
  {
    id: "scorequiz",
    title: "Score quiz",
    blurb: "A harder question, a score, and a clap function.",
    plan: ["Ask and answer.", "Do score math.", "Clap at the end."],
    steps: buildPySteps("Advanced step", [
      { goal: "Print Hard Quiz.", fresh: true, lines: [L('print("Hard Quiz")')], spec: { contains: "hard quiz" }, see: "Hard Quiz" },
      { goal: "Print a math question.", lines: [L('print("What is 2 + 3?")')], spec: { contains: "2 + 3" }, see: "What is 2 + 3?" },
      { goal: "Save answer 5.", lines: [L('answer = "5"')], spec: { code: /answer\s*=\s*["']5["']/ }, see: "your old lines" },
      { goal: "Print the answer.", lines: [L("print(answer)")], spec: { line: "5" }, see: "5" },
      { goal: "Save points = 10.", lines: [L("points = 10")], spec: { code: /points\s*=\s*10/ }, see: "your old lines" },
      { goal: "Print the points.", lines: [L("print(points)")], spec: { line: "10" }, see: "10" },
      { goal: "Print points minus 1.", lines: [L("print(points - 1)")], spec: { line: "9" }, see: "9" },
      { goal: "If points are more than 8, print super.", lines: [L("if points > 8:"), L('print("super")', true)], spec: { code: /\bif\b/, line: "super" }, see: "super" },
      { goal: "Add else.", lines: [L("else:"), L('print("ok")', true)], spec: { code: /\belse\b/ }, see: "super still", note: "Click at the end of print(\"super\")." },
      { goal: "Make a clap function.", lines: [L("def clap():"), L('print("clap")', true)], spec: { code: /def\s+clap\s*\(/ }, see: "your old lines" },
      { goal: "Run clap.", lines: [L("clap()")], spec: { line: "clap" }, see: "clap" },
      { goal: "Print Quiz star!", lines: [L('print("Quiz star!")')], spec: { contains: "quiz star" }, see: "Quiz star!" },
    ]),
  },
  {
    id: "catalog",
    title: "Creature catalog",
    blurb: "Three animals, a list, and a goodbye function.",
    plan: ["Print three animals.", "Put them in a list.", "Finish the catalog."],
    steps: buildPySteps("Advanced step", [
      { goal: "Print Sea Catalog.", fresh: true, lines: [L('print("Sea Catalog")')], spec: { contains: "sea catalog" }, see: "Sea Catalog" },
      { goal: "Print crab.", lines: [L('print("crab")')], spec: { line: "crab" }, see: "crab" },
      { goal: "Print eel.", lines: [L('print("eel")')], spec: { line: "eel" }, see: "eel" },
      { goal: "Print whale.", lines: [L('print("whale")')], spec: { line: "whale" }, see: "whale" },
      { goal: "Save first = crab.", lines: [L('first = "crab"')], spec: { code: /first\s*=\s*["']crab["']/ }, see: "your old lines" },
      { goal: "Print first.", lines: [L("print(first)")], spec: { minCount: { line: "crab", n: 2 } }, see: "crab again" },
      { goal: "Make an animals list.", lines: [L('animals = ["crab", "eel", "whale"]')], spec: { code: /animals\s*=\s*\[/ }, see: "your old lines" },
      { goal: "Print list spot 2.", lines: [L("print(animals[2])")], spec: { code: /animals\s*\[\s*2\s*\]/ }, see: "whale" },
      { goal: "Loop over the animals.", lines: [L("for animal in animals:"), L("print(animal)", true)], spec: { code: /for\s+\w+\s+in\s+animals\s*:/ }, see: "crab, eel, and whale again" },
      { goal: "Save count = 3.", lines: [L("count = 3")], spec: { code: /count\s*=\s*3/ }, see: "your old lines" },
      { goal: "If count is 3, print full tank.", lines: [L("if count == 3:"), L('print("full tank")', true)], spec: { code: /\bif\b/, contains: "full tank" }, see: "full tank" },
      { goal: "Make bye and run it.", lines: [L("def bye():"), L('print("catalog done")', true), L("bye()")], spec: { code: /def\s+bye\s*\(/, contains: "catalog done" }, see: "catalog done" },
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
  pathKey: "python",
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
    openCoralTrail("python", {
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
    } else if (ch === "#") {
      return line.slice(0, c);
    }
  }
  return line;
}

function splitCommaArgs(inner) {
  const parts = [];
  let buf = "";
  let inStr = null;
  for (let c = 0; c < inner.length; c += 1) {
    const ch = inner[c];
    if (inStr) {
      buf += ch;
      if (ch === "\\" && c + 1 < inner.length) {
        buf += inner[c + 1];
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
      buf += ch;
      continue;
    }
    if (ch === ",") {
      parts.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) {
    parts.push(buf.trim());
  }
  return parts;
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

function evalExpr(expr, vars) {
  expr = expr.trim();
  if (!expr) {
    throw new Error("Empty value inside print() or =");
  }

  const strMatch = expr.match(/^(["'])([\s\S]*)\1$/);
  if (strMatch) {
    return strMatch[2];
  }

  if (/^-?\d+$/.test(expr)) {
    return Number(expr);
  }

  if (expr[0] === "[") {
    if (expr[expr.length - 1] !== "]") {
      throw new Error("A list starts with [ and ends with ].");
    }
    const inner = expr.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return splitCommaArgs(inner).map(function (part) {
      return evalExpr(part, vars);
    });
  }

  const indexMatch = expr.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*(\d+)\s*\]$/);
  if (indexMatch) {
    const arr = evalExpr(indexMatch[1], vars);
    const idx = Number(indexMatch[2]);
    if (!Array.isArray(arr)) {
      throw new Error(indexMatch[1] + ' is not a list. Try name = ["a", "b"].');
    }
    if (idx >= arr.length) {
      throw new Error("That list spot is empty. The first spot is 0.");
    }
    return arr[idx];
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(expr)) {
    if (!(expr in vars)) {
      throw new Error(expr + " is not defined yet. Make it with name = value first.");
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
      throw new Error("Use + - or * with numbers, like print(2 + 3).");
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

function evalCond(cond, vars) {
  const text = String(cond || "").trim();
  const m = text.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!m) {
    throw new Error("Try if score > 5: with a compare sign in the middle.");
  }
  const left = evalExpr(m[1], vars);
  const right = evalExpr(m[3], vars);
  if (m[2] === "==") {
    return left == right;
  }
  if (m[2] === "!=") {
    return left != right;
  }
  if (m[2] === ">") {
    return Number(left) > Number(right);
  }
  if (m[2] === "<") {
    return Number(left) < Number(right);
  }
  if (m[2] === ">=") {
    return Number(left) >= Number(right);
  }
  if (m[2] === "<=") {
    return Number(left) <= Number(right);
  }
  return false;
}

function runTinyPython(source) {
  const lines = String(source || "").replace(/\r/g, "").split("\n");
  const vars = Object.create(null);
  const funcs = Object.create(null);
  const output = [];
  let i = 0;

  function runSimple(line, scope) {
    const box = scope || vars;
    const assign = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (assign) {
      box[assign[1]] = evalExpr(assign[2], box);
      return;
    }

    const printMatch = line.match(/^print\s*\((.*)\)\s*$/);
    if (printMatch) {
      const inner = printMatch[1].trim();
      if (!inner) {
        output.push("");
        return;
      }
      output.push(String(evalExpr(inner, box)));
      return;
    }

    const callMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*(.*)\s*\)\s*$/);
    if (callMatch && funcs[callMatch[1]]) {
      runFunc(callMatch[1], callMatch[2], box);
      return;
    }

    throw new Error("Try print(...), name = value, if, or def. Got: " + line);
  }

  function runFunc(name, argSrc, scope) {
    const fn = funcs[name];
    const local = Object.assign(Object.create(null), vars);
    if (fn.param) {
      const arg = String(argSrc || "").trim();
      if (!arg) {
        throw new Error(name + " needs a value inside the parentheses.");
      }
      local[fn.param] = evalExpr(arg, scope || vars);
    }
    fn.body.forEach(function (bodyLine) {
      runSimple(bodyLine, local);
    });
  }

  function readIndented() {
    const body = [];
    while (i < lines.length) {
      const bodyNoComment = stripComment(lines[i]);
      if (!bodyNoComment.trim()) {
        i += 1;
        continue;
      }
      const bodyIndent = (bodyNoComment.match(/^\s*/) || [""])[0].length;
      if (bodyIndent === 0) {
        break;
      }
      body.push(bodyNoComment.trim());
      i += 1;
    }
    return body;
  }

  while (i < lines.length) {
    const noComment = stripComment(lines[i]);
    const indent = (noComment.match(/^\s*/) || [""])[0].length;
    const line = noComment.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (indent > 0) {
      throw new Error(
        "Line " +
          (i + 1) +
          " is pushed in, but it is not inside a loop, if, or function. Press Backspace."
      );
    }

    const defMatch = line.match(
      /^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)?\s*\)\s*:\s*$/
    );
    if (defMatch) {
      i += 1;
      const body = readIndented();
      if (body.length === 0) {
        throw new Error('Your def needs a pushed-in line under it, like print("hi").');
      }
      funcs[defMatch[1]] = { param: defMatch[2] || "", body: body };
      continue;
    }

    const ifMatch = line.match(/^if\s+(.+):\s*$/);
    if (ifMatch) {
      const cond = evalCond(ifMatch[1], vars);
      i += 1;
      const body = readIndented();
      if (body.length === 0) {
        throw new Error('Your if needs a pushed-in line under it, like print("yes").');
      }
      let elseBody = [];
      if (i < lines.length && /^else\s*:\s*$/.test(stripComment(lines[i]).trim())) {
        i += 1;
        elseBody = readIndented();
      }
      const chosen = cond ? body : elseBody;
      chosen.forEach(function (bodyLine) {
        runSimple(bodyLine);
      });
      continue;
    }

    const forMatch = line.match(
      /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+range\s*\(([^)]+)\)\s*:$/
    );
    if (forMatch) {
      const loopVar = forMatch[1];
      const argParts = forMatch[2].split(",").map(function (part) {
        return Number(evalExpr(part.trim(), vars));
      });
      let start = 0;
      let end = 0;
      if (argParts.length === 1) {
        end = argParts[0];
      } else if (argParts.length === 2) {
        start = argParts[0];
        end = argParts[1];
      } else {
        throw new Error("Use range(n) or range(start, stop).");
      }
      i += 1;
      const body = readIndented();
      if (body.length === 0) {
        throw new Error("Your for loop needs a pushed-in line under it, like print(i).");
      }
      for (let n = start; n < end; n += 1) {
        vars[loopVar] = n;
        body.forEach(function (bodyLine) {
          runSimple(bodyLine);
        });
      }
      continue;
    }

    const forIn = line.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+):\s*$/);
    if (forIn) {
      const seq = evalExpr(forIn[2], vars);
      if (!Array.isArray(seq)) {
        throw new Error('for ... in needs a list, like pets = ["crab", "eel"].');
      }
      i += 1;
      const body = readIndented();
      if (body.length === 0) {
        throw new Error("Your for loop needs a pushed-in line under it, like print(pet).");
      }
      seq.forEach(function (item) {
        vars[forIn[1]] = item;
        body.forEach(function (bodyLine) {
          runSimple(bodyLine);
        });
      });
      continue;
    }

    runSimple(line);
    i += 1;
  }

  return output.join("\n");
}


function runCode() {
  try {
    lastOutput = runTinyPython(codeBox.value);
    outputBox.textContent = lastOutput === "" ? "(nothing printed yet)" : lastOutput;
    outputBox.classList.remove("is-error");
    checkTask();
  } catch (err) {
    lastOutput = "";
    outputBox.textContent = "Oops: " + err.message;
    outputBox.classList.add("is-error");
    if (!taskDone && !(projectApi.isHandlingTasks() && projectApi.getPhase() === "building")) {
      setTip("Python got stuck. Read the red error, or tap Help.");
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
