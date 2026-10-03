if (!getCurrentUser()) {
  window.location.href = "login.html";
}

const htmlCode = document.getElementById("html-code");
const cssCode = document.getElementById("css-code");
const preview = document.getElementById("preview");
const tip = document.getElementById("tip");
const helpLine = document.getElementById("help-line");
const taskGoal = document.getElementById("task-goal");
const helpBtn = document.getElementById("help-btn");
const nextBtn = document.getElementById("next-btn");
const taskBar = document.getElementById("task-bar");

let taskIndex = 0;
let taskDone = false;

const PATH_KEY = "htmlcss";
if (typeof CodeReefProgress !== "undefined") {
  CodeReefProgress.rememberLastPath(PATH_KEY);
}

const starterHtml = `<h1>Hello, reef!</h1>
<p>My name is Sam.</p>
<p class="fun">I like coding under the sea.</p>
`;

const starterCss = `body {
  font-family: Arial, sans-serif;
  background: #dff6ff;
  color: #123;
  padding: 20px;
}

h1 {
  color: #0b7285;
}

.fun {
  color: #e8590c;
  font-size: 20px;
}
`;

const projectHtml = `<h1>My reef project</h1>
<p>Hello from the ocean!</p>
`;

const projectCss = `body {
  font-family: Arial, sans-serif;
  background: #dff6ff;
  color: #123;
  padding: 20px;
}

h1 {
  color: #0b7285;
}
`;

function snapshotProgress() {
  return {
    taskIndex: taskIndex,
    taskDone: taskDone,
    code: htmlCode.value + "\n" + cssCode.value,
    html: htmlCode.value,
    css: cssCode.value,
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

function applyPreview(html, css) {
  preview.srcdoc =
    "<!DOCTYPE html><html><head><style>" +
    css +
    "</style></head><body>" +
    html +
    "</body></html>";
}

function numbered(lines) {
  const parts = [];
  for (let n = 0; n < lines.length; n += 1) {
    parts.push(n + 1 + ". " + lines[n]);
  }
  return parts.join("\n\n");
}

function splitIdeas(text) {
  const bits = String(text || "").split(/(?<=[.!])\s+/);
  const out = [];
  for (let i = 0; i < bits.length; i += 1) {
    const bit = bits[i].trim();
    if (bit) out.push(bit);
  }
  return out;
}

function explainHtmlTag(tagLine) {
  const raw = String(tagLine || "").trim();
  if (raw === "</ul>") {
    return [
      "Type </ul>",
      "The slash / means this tag is finished.",
      "This ends the list.",
    ];
  }
  if (raw === "<ul>" || raw === "<ul></ul>") {
    return [
      "ul means a list.",
      "Type this mark: <",
      "Then type ul",
      "Then type this mark: >",
      raw.indexOf("</ul>") !== -1 ? "Then type </ul> so the list is closed." : "You can put list items inside later.",
      "The slash / means a tag is finished.",
    ];
  }
  const m = raw.match(/^<([a-z0-9]+)([^>]*)>([\s\S]*)<\/\1>$/i);
  if (!m) return [];
  const tag = m[1].toLowerCase();
  const attrs = m[2] || "";
  const inner = m[3];
  const names = {
    p: "p means a paragraph. A paragraph is one sentence block.",
    h1: "h1 means the biggest title.",
    h2: "h2 means a middle-size title.",
    h3: "h3 means a small title.",
    button: "button means a word you could press.",
    li: "li means one item in a list.",
    div: "div means a box that groups things.",
    strong: "strong makes the word look important. It is usually bold.",
    a: "a means a link. A link is a word you can tap.",
    ul: "ul means a list.",
  };
  const steps = [names[tag] || tag + " is a label for the page."];
  steps.push("Type this mark: <");
  steps.push("Then type " + tag);
  const classMatch = attrs.match(/class\s*=\s*"([^"]*)"/i);
  const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"/i);
  if (classMatch) {
    steps.push("Then type a space.");
    steps.push("Then type class=");
    steps.push('A quote is this mark: "');
    steps.push("Type a quote, then " + classMatch[1] + ", then a quote.");
    steps.push("class is a nickname the colors can use.");
  }
  if (hrefMatch) {
    steps.push("Then type a space.");
    steps.push("Then type href=");
    steps.push('A quote is this mark: "');
    steps.push("Type a quote, then " + hrefMatch[1] + ", then a quote.");
    steps.push("href is where the link goes.");
    steps.push("# means stay on this page.");
  }
  steps.push("Then type this mark: >");
  if (inner) steps.push("Then type " + inner);
  steps.push("Then type </" + tag + ">");
  steps.push("The slash / means this tag is finished.");
  return steps;
}

function explainCssLine(line) {
  const m = String(line || "").trim().match(/^([a-z-]+)\s*:\s*(.+);$/i);
  if (!m) {
    return [
      "Type every mark you see.",
      "A colon is this mark: :",
      "A semicolon is this mark: ;",
    ];
  }
  const prop = m[1].toLowerCase();
  const val = m[2];
  const meanings = {
    color: "color means the color of the letters.",
    background: "background means the color behind the words.",
    "font-size": "font-size means how big the letters are.",
    margin: "margin means empty space outside a box.",
    padding: "padding means empty space inside a box.",
    "text-align": "text-align means which side the words sit on.",
    width: "width means how wide the box is.",
    border: "border means a line around a box.",
  };
  const steps = [];
  if (meanings[prop]) steps.push(meanings[prop]);
  steps.push("Type " + prop);
  steps.push("Then type a colon. A colon is this mark: :");
  steps.push("Then type a space.");
  steps.push("Then type " + val);
  if (/px/i.test(val)) {
    steps.push("px means pixels. Pixels are tiny dots on the screen.");
  }
  steps.push("Then type a semicolon. A semicolon is this mark: ;");
  steps.push("The semicolon ends the line. Do not skip it.");
  return steps;
}

function htmlHelp(fresh, tagLine, what) {
  const steps = [];
  steps.push("Find the HTML tab. It is above the code box.");
  steps.push("Tap the HTML tab.");
  steps.push("HTML is the words on the page.");
  if (fresh) {
    steps.push("Start fresh in the HTML box.");
    steps.push("Highlight the old HTML.");
    steps.push("Press the Delete key.");
    steps.push("Leave the CSS tab alone.");
    steps.push("CSS is the colors.");
    steps.push("Click in the empty HTML box.");
  } else {
    steps.push("Keep your old HTML. Do not erase it.");
    steps.push("Click in the HTML box.");
    steps.push("Click at the end of the last line.");
    steps.push("Press the Enter key. That starts a new line.");
  }
  steps.push("Type this exactly: " + tagLine);
  const tagSteps = explainHtmlTag(tagLine);
  for (let i = 0; i < tagSteps.length; i += 1) steps.push(tagSteps[i]);
  if (!tagSteps.length) {
    const ideas = splitIdeas(what);
    for (let i = 0; i < ideas.length; i += 1) steps.push(ideas[i]);
  }
  steps.push("Press the Show button. It is at the top.");
  return numbered(steps);
}

function cssHelp(fresh, line, what) {
  const steps = [];
  steps.push("Find the CSS tab. It is above the code box.");
  steps.push("Tap the CSS tab.");
  steps.push("CSS is the colors and sizes.");
  if (fresh) {
    steps.push("You can keep the old CSS.");
    steps.push("Add this new line, or change the one line named below.");
  } else {
    steps.push("Keep your old CSS. Do not erase the other lines.");
  }
  steps.push("Click in the CSS box.");
  const ideas = splitIdeas(what);
  for (let i = 0; i < ideas.length; i += 1) steps.push(ideas[i]);
  steps.push("Type this exactly: " + line);
  const bits = explainCssLine(line);
  for (let i = 0; i < bits.length; i += 1) steps.push(bits[i]);
  steps.push("Press the Show button. It is at the top.");
  return numbered(steps);
}

const tasks = (function buildHtmlTasks() {
  const list = [];
  function add(goal, help, check) {
    list.push({
      goal: "Task " + (list.length + 1) + ": " + goal,
      help: help,
      check: check,
    });
  }

  add(
    "Change the big title to Hello, ocean!",
    numbered([
      "Find the HTML tab. It is above the code box.",
      "Tap the HTML tab.",
      "HTML is the words on the page.",
      "Keep your old line. Do not erase the whole title.",
      "Click in the HTML box.",
      "Click on the word reef inside the h1 line.",
      "Delete the letters r e e f.",
      "Type the word ocean in that same spot.",
      "The line should look like this: <h1>Hello, ocean!</h1>",
      "h1 means the biggest title.",
      "Type this mark: <",
      "Then type h1",
      "Then type this mark: >",
      "The words Hello, ocean! stay in the middle.",
      "Then type </h1>",
      "The slash / means this tag is finished.",
      "Press the Show button. It is at the top.",
    ]),
    function () { return /<h1>\s*Hello,\s*ocean!\s*<\/h1>/i.test(htmlCode.value); }
  );
  add(
    "Change the fun text color to blue.",
    cssHelp(
      false,
      "color: blue;",
      "Find .fun { and the line color. A class is a name you can reuse, written with a dot. Change the color to the word blue. Keep the colon : and the semicolon ; ."
    ),
    function () {
      const css = cssCode.value.toLowerCase();
      return css.indexOf(".fun") !== -1 && /color\s*:\s*(blue|#00f|#0000ff|#339af0)/.test(css);
    }
  );
  add(
    "Add a new paragraph about a fish.",
    htmlHelp(false, "<p>I love clownfish.</p>", "A paragraph is a sentence block. Type <p> then your words, then </p>."),
    function () { return (htmlCode.value.match(/<p[\s>]/gi) || []).length >= 3; }
  );
  add(
    "Change the page background to light yellow.",
    cssHelp(false, "background: #fff3bf;", "Find body { . background is the page color behind the words. #fff3bf is a light yellow code. Keep the colon and the semicolon."),
    function () {
      const css = cssCode.value.toLowerCase().replace(/\s+/g, "");
      return css.indexOf("background:#fff3bf") !== -1 || css.indexOf("background:lightyellow") !== -1 || css.indexOf("background:#ffffe0") !== -1;
    }
  );
  add(
    "Make the big title green.",
    cssHelp(false, "color: green;", "Find h1 { . Change the color line to color: green; Green is the color word. Keep the colon : and semicolon ; ."),
    function () {
      const css = cssCode.value.toLowerCase();
      return css.indexOf("h1") !== -1 && /color\s*:\s*(green|#2f9e44|#40c057)/.test(css);
    }
  );
  add(
    "Make the .fun text bigger.",
    cssHelp(false, "font-size: 28px;", "Find .fun { . font-size means how big the letters are. 28px means 28 pixels, which are tiny screen dots. Type font-size: 28px;"),
    function () {
      return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("font-size:28px") !== -1;
    }
  );
  add(
    "Add a heading that says Coral friends.",
    htmlHelp(false, "<h2>Coral friends</h2>", "h2 is a middle-size heading. Type <h2> then the words, then </h2>."),
    function () { return /<h2>\s*Coral friends\s*<\/h2>/i.test(htmlCode.value); }
  );

  const sentences = [
    "I see a crab.", "The eel is long.", "Whales are big.", "Sand feels soft.",
    "Shells are pretty.", "I like waves.", "Sharks swim fast.", "Stars live on rocks.",
    "Otters hold hands.", "Kelp is a plant.", "Pearls grow in shells.", "Tide comes in.",
  ];
  sentences.forEach(function (sentence) {
    add(
      "Add a paragraph that says " + sentence,
      htmlHelp(false, "<p>" + sentence + "</p>", "<p> starts a paragraph. </p> ends it. The slash / means this tag is finished."),
      function () { return htmlCode.value.toLowerCase().indexOf(sentence.toLowerCase()) !== -1; }
    );
  });

  ["Reef map", "Fish club", "Tide pool", "Coral city", "Sea songs", "Boat day"].forEach(function (title) {
    add(
      "Add a middle heading that says " + title + ".",
      htmlHelp(false, "<h2>" + title + "</h2>", "h2 is a heading smaller than h1. Type <h2> then the words, then </h2>."),
      function () { return htmlCode.value.toLowerCase().indexOf("<h2>" + title.toLowerCase()) !== -1 || new RegExp("<h2>\\s*" + title + "\\s*</h2>", "i").test(htmlCode.value); }
    );
  });
  ["Welcome", "Friends", "Today"].forEach(function (title) {
    add(
      "Add a small heading that says " + title + ".",
      htmlHelp(false, "<h3>" + title + "</h3>", "h3 is a small heading. Type <h3> then the words, then </h3>."),
      function () { return new RegExp("<h3>\\s*" + title + "\\s*</h3>", "i").test(htmlCode.value); }
    );
  });
  ["Swim", "Clap", "Go", "Look"].forEach(function (label) {
    add(
      "Add a button that says " + label + ".",
      htmlHelp(false, "<button>" + label + "</button>", "A button is something you could press. Type <button> then the word, then </button>."),
      function () { return new RegExp("<button>\\s*" + label + "\\s*</button>", "i").test(htmlCode.value); }
    );
  });
  ["crab", "eel", "whale"].forEach(function (animal) {
    add(
      "Add a list item for " + animal + ".",
      htmlHelp(false, "<li>" + animal + "</li>", "li means one item in a list. Type <li> then the word, then </li>."),
      function () { return new RegExp("<li>\\s*" + animal + "\\s*</li>", "i").test(htmlCode.value); }
    );
  });
  add(
    "Add a list that holds items.",
    htmlHelp(false, "<ul></ul>", "ul means a list. You can put <li> items inside later. Type <ul></ul>."),
    function () { return /<ul[\s>]/i.test(htmlCode.value); }
  );
  ["Home", "Shop", "Play"].forEach(function (name) {
    add(
      "Add a div named in the words " + name + ".",
      htmlHelp(false, "<div>" + name + "</div>", "div is a box that groups things. Type <div> then the word, then </div>."),
      function () { return new RegExp("<div>\\s*" + name + "\\s*</div>", "i").test(htmlCode.value); }
    );
  });
  ["big", "fun", "soft"].forEach(function (word) {
    add(
      "Make the word " + word + " strong.",
      htmlHelp(false, "<strong>" + word + "</strong>", "strong makes words look important, usually bold. Type <strong> then the word, then </strong>."),
      function () { return new RegExp("<strong>\\s*" + word + "\\s*</strong>", "i").test(htmlCode.value); }
    );
  });
  ["hello", "reef", "fish"].forEach(function (word) {
    add(
      "Add a link that says " + word + ".",
      htmlHelp(false, '<a href="#">' + word + "</a>", "a is a link. href is where it goes. # means stay on this page. Type <a href=\"#\"> then the word, then </a>."),
      function () { return new RegExp("<a[^>]*>\\s*" + word + "\\s*</a>", "i").test(htmlCode.value); }
    );
  });
  ["card", "note", "tag"].forEach(function (name) {
    add(
      "Add a paragraph with class " + name + ".",
      htmlHelp(false, '<p class="' + name + '">Hi</p>', "class is a nickname for CSS. Type <p class=\"" + name + "\"> then Hi, then </p>. Keep the quotes around " + name + "."),
      function () { return new RegExp("<p[^>]*class\\s*=\\s*[\"']" + name + "[\"']", "i").test(htmlCode.value); }
    );
  });

  const colors = ["tomato", "purple", "teal", "orange", "navy", "pink"];
  colors.forEach(function (color) {
    add(
      "Set the h1 color to " + color + ".",
      cssHelp(false, "color: " + color + ";", "In the h1 { block, type color: " + color + "; The colon : comes before the color. The semicolon ; ends the line."),
      function () { return new RegExp("h1[\\s\\S]*color\\s*:\\s*" + color, "i").test(cssCode.value) || new RegExp("color\\s*:\\s*" + color, "i").test(cssCode.value); }
    );
  });
  ["16px", "18px", "24px", "32px", "40px"].forEach(function (size) {
    add(
      "Set a font size to " + size + ".",
      cssHelp(false, "font-size: " + size + ";", "font-size is how big the letters are. px means pixels, tiny dots on the screen. Type font-size: " + size + ";"),
      function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("font-size:" + size) !== -1; }
    );
  });
  [["#dff6ff", "light blue"], ["#fff3bf", "light yellow"], ["#d3f9d8", "light green"], ["#ffe3e3", "light red"]].forEach(function (pair) {
    add(
      "Set the page background to " + pair[1] + ".",
      cssHelp(false, "background: " + pair[0] + ";", "In body { , background paints behind the words. Type background: " + pair[0] + ";"),
      function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("background:" + pair[0]) !== -1; }
    );
  });
  ["8px", "12px", "20px"].forEach(function (space) {
    add(
      "Add margin " + space + " around something.",
      cssHelp(false, "margin: " + space + ";", "margin is empty space outside a box. Type margin: " + space + ";"),
      function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("margin:" + space) !== -1; }
    );
  });
  ["8px", "16px"].forEach(function (space) {
    add(
      "Add padding " + space + " inside a box.",
      cssHelp(false, "padding: " + space + ";", "padding is empty space inside a box, between the edge and the words. Type padding: " + space + ";"),
      function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("padding:" + space) !== -1; }
    );
  });
  ["center", "left"].forEach(function (align) {
    add(
      "Align text to the " + align + ".",
      cssHelp(false, "text-align: " + align + ";", "text-align moves words to the " + align + ". Type text-align: " + align + ";"),
      function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("text-align:" + align) !== -1; }
    );
  });
  ["200px", "320px"].forEach(function (width) {
    add(
      "Set a width to " + width + ".",
      cssHelp(false, "width: " + width + ";", "width is how wide a box is. Type width: " + width + ";"),
      function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("width:" + width) !== -1; }
    );
  });
  add(
    "Add a border.",
    cssHelp(false, "border: 2px solid navy;", "border is a line around a box. 2px is the thickness. solid means a plain line. navy is the color. Type border: 2px solid navy;"),
    function () { return /border\s*:\s*2px\s+solid/i.test(cssCode.value); }
  );

  const extra = ["cove", "pier", "gull", "mist", "dune", "foam"];
  let pad = 0;
  while (list.length < 100) {
    const word = extra[pad % extra.length] + (pad >= extra.length ? String(pad) : "");
    pad += 1;
    add(
      "Add one more paragraph that says " + word + ".",
      htmlHelp(false, "<p>" + word + "</p>", "Type <p> then " + word + " then </p>."),
      function () { return htmlCode.value.toLowerCase().indexOf(word.toLowerCase()) !== -1; }
    );
  }
  return list;
})();

function htmlStep(goal, help, check) {
  return { goal: goal, help: help, check: check };
}

const finalIdeas = [
  {
    id: "profile",
    title: "Mini profile card",
    blurb: "A long profile page with headings, a list, and colors.",
    plan: ["Build the words in HTML.", "Add a list and a button.", "Paint it with CSS."],
    steps: [
      htmlStep("Project step 1: Make a profile title.", htmlHelp(true, "<h1>My Profile</h1>", "h1 is the biggest title."), function (ctx) { return /<h1>/i.test(ctx.html); }),
      htmlStep("Project step 2: Add your name.", htmlHelp(false, "<p>My name is Sam.</p>", "p is a paragraph."), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 1; }),
      htmlStep("Project step 3: Add a fun fact.", htmlHelp(false, "<p>I like crabs.</p>", "Add another paragraph."), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2; }),
      htmlStep("Project step 4: Add a middle heading.", htmlHelp(false, "<h2>Favorites</h2>", "h2 is a middle heading."), function (ctx) { return /<h2>/i.test(ctx.html); }),
      htmlStep("Project step 5: Add a button.", htmlHelp(false, "<button>Say hi</button>", "button is a pressable word."), function (ctx) { return /<button>/i.test(ctx.html); }),
      htmlStep("Project step 6: Start a list.", htmlHelp(false, "<ul>", "ul starts a list. You will add items next."), function (ctx) { return /<ul/i.test(ctx.html); }),
      htmlStep("Project step 7: Add a crab item.", htmlHelp(false, "<li>crab</li>", "li is one list item."), function (ctx) { return /<li>/i.test(ctx.html); }),
      htmlStep("Project step 8: Add an eel item.", htmlHelp(false, "<li>eel</li>", "Add another li."), function (ctx) { return (ctx.html.match(/<li[\s>]/gi) || []).length >= 2; }),
      htmlStep("Project step 9: Close the list.", htmlHelp(false, "</ul>", "</ul> ends the list. The slash / means end."), function (ctx) { return /<\/ul>/i.test(ctx.html); }),
      htmlStep("Project step 10: Give a paragraph a class.", htmlHelp(false, '<p class="fun">Coding is fun.</p>', "class=\"fun\" is a nickname for CSS."), function (ctx) { return /class\s*=\s*["']fun["']/i.test(ctx.html); }),
      htmlStep("Project step 11: Color the title.", cssHelp(false, "color: teal;", "In h1 { type color: teal;"), function (ctx) { return /h1[\s\S]*color\s*:/i.test(ctx.css) || /color\s*:\s*teal/i.test(ctx.css); }),
      htmlStep("Project step 12: Make .fun bigger.", cssHelp(false, "font-size: 22px;", "Add .fun { font-size: 22px; } if you need a new block."), function (ctx) { return /font-size\s*:\s*22px/i.test(ctx.css); }),
      htmlStep("Project step 13: Paint the background.", cssHelp(false, "background: #dff6ff;", "In body { set background."), function (ctx) { return /background\s*:/i.test(ctx.css); }),
      htmlStep("Project step 14: Center the title.", cssHelp(false, "text-align: center;", "text-align: center; puts words in the middle."), function (ctx) { return /text-align\s*:\s*center/i.test(ctx.css); }),
      htmlStep("Project step 15: Add margin.", cssHelp(false, "margin: 12px;", "margin is space outside."), function (ctx) { return /margin\s*:/i.test(ctx.css); }),
      htmlStep("Project step 16: Add padding.", cssHelp(false, "padding: 8px;", "padding is space inside."), function (ctx) { return /padding\s*:/i.test(ctx.css); }),
      htmlStep("Project step 17: Set a width.", cssHelp(false, "width: 280px;", "width is how wide."), function (ctx) { return /width\s*:/i.test(ctx.css); }),
      htmlStep("Project step 18: Add a border.", cssHelp(false, "border: 2px solid navy;", "border draws a line around a box."), function (ctx) { return /border\s*:/i.test(ctx.css); }),
    ],
  },
  {
    id: "poster",
    title: "Colorful poster",
    blurb: "A poster with a title, sentences, and bright CSS.",
    plan: ["Write the poster words.", "Add a list.", "Color the page."],
    steps: [
      htmlStep("Project step 1: Poster title.", htmlHelp(true, "<h1>Ocean Poster</h1>", "h1 is the big title."), function (ctx) { return /<h1>/i.test(ctx.html); }),
      htmlStep("Project step 2: A poster sentence.", htmlHelp(false, "<p>Swim into coding!</p>", "p is a sentence."), function (ctx) { return /<p/i.test(ctx.html); }),
      htmlStep("Project step 3: Another sentence.", htmlHelp(false, "<p>Bring a friend.</p>", "Add one more p."), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2; }),
      htmlStep("Project step 4: Small heading.", htmlHelp(false, "<h3>Today</h3>", "h3 is a small heading."), function (ctx) { return /<h3>/i.test(ctx.html); }),
      htmlStep("Project step 5: A button.", htmlHelp(false, "<button>Join</button>", "button is a word you can press."), function (ctx) { return /<button>/i.test(ctx.html); }),
      htmlStep("Project step 6: A strong word.", htmlHelp(false, "<strong>Now</strong>", "strong makes a word important."), function (ctx) { return /<strong>/i.test(ctx.html); }),
      htmlStep("Project step 7: A link.", htmlHelp(false, '<a href="#">reef</a>', "a is a link. href=\"#\" stays on this page."), function (ctx) { return /<a[\s>]/i.test(ctx.html); }),
      htmlStep("Project step 8: A div box.", htmlHelp(false, "<div>Party</div>", "div is a box."), function (ctx) { return /<div>/i.test(ctx.html); }),
      htmlStep("Project step 9: A class.", htmlHelp(false, '<p class="note">Free snacks.</p>', "class=\"note\" names this paragraph."), function (ctx) { return /class\s*=/i.test(ctx.html); }),
      htmlStep("Project step 10: Background.", cssHelp(false, "background: #fff3bf;", "Paint body background."), function (ctx) { return /background\s*:/i.test(ctx.css); }),
      htmlStep("Project step 11: Title color.", cssHelp(false, "color: tomato;", "Color the h1."), function (ctx) { return /color\s*:/i.test(ctx.css); }),
      htmlStep("Project step 12: Big letters.", cssHelp(false, "font-size: 36px;", "Make letters bigger."), function (ctx) { return /font-size\s*:/i.test(ctx.css); }),
      htmlStep("Project step 13: Center words.", cssHelp(false, "text-align: center;", "Center the words."), function (ctx) { return /text-align\s*:\s*center/i.test(ctx.css); }),
      htmlStep("Project step 14: Margin.", cssHelp(false, "margin: 16px;", "Space outside."), function (ctx) { return /margin\s*:/i.test(ctx.css); }),
      htmlStep("Project step 15: Padding.", cssHelp(false, "padding: 12px;", "Space inside."), function (ctx) { return /padding\s*:/i.test(ctx.css); }),
      htmlStep("Project step 16: Width.", cssHelp(false, "width: 320px;", "How wide."), function (ctx) { return /width\s*:/i.test(ctx.css); }),
      htmlStep("Project step 17: Border.", cssHelp(false, "border: 2px solid teal;", "A line around the poster."), function (ctx) { return /border\s*:/i.test(ctx.css); }),
      htmlStep("Project step 18: One more sentence.", htmlHelp(false, "<p>See you at the reef.</p>", "Add a last paragraph."), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 3; }),
    ],
  },
  {
    id: "invite",
    title: "Party invite",
    blurb: "Invite friends with headings, a list, and colors.",
    plan: ["Write the invite.", "List the snacks.", "Style the page."],
    steps: [
      htmlStep("Project step 1: Invite title.", htmlHelp(true, "<h1>Reef Party!</h1>", "Big title."), function (ctx) { return /<h1>/i.test(ctx.html); }),
      htmlStep("Project step 2: When and where.", htmlHelp(false, "<p>Saturday at the coral reef.</p>", "A paragraph."), function (ctx) { return /<p/i.test(ctx.html); }),
      htmlStep("Project step 3: Who is invited.", htmlHelp(false, "<p>All fish are invited.</p>", "Another paragraph."), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2; }),
      htmlStep("Project step 4: Snacks heading.", htmlHelp(false, "<h2>Snacks</h2>", "Middle heading."), function (ctx) { return /<h2>/i.test(ctx.html); }),
      htmlStep("Project step 5: List start.", htmlHelp(false, "<ul>", "Start a list."), function (ctx) { return /<ul/i.test(ctx.html); }),
      htmlStep("Project step 6: Kelp item.", htmlHelp(false, "<li>kelp</li>", "One snack."), function (ctx) { return /<li>/i.test(ctx.html); }),
      htmlStep("Project step 7: Pearls item.", htmlHelp(false, "<li>pearls</li>", "Another snack."), function (ctx) { return (ctx.html.match(/<li/gi) || []).length >= 2; }),
      htmlStep("Project step 8: End the list.", htmlHelp(false, "</ul>", "End the list."), function (ctx) { return /<\/ul>/i.test(ctx.html); }),
      htmlStep("Project step 9: A button.", htmlHelp(false, "<button>I will come</button>", "A button."), function (ctx) { return /<button>/i.test(ctx.html); }),
      htmlStep("Project step 10: Title color.", cssHelp(false, "color: purple;", "Color the h1."), function (ctx) { return /color\s*:/i.test(ctx.css); }),
      htmlStep("Project step 11: Background.", cssHelp(false, "background: #ffe3e3;", "Paint the page."), function (ctx) { return /background\s*:/i.test(ctx.css); }),
      htmlStep("Project step 12: Font size.", cssHelp(false, "font-size: 28px;", "Bigger letters."), function (ctx) { return /font-size\s*:/i.test(ctx.css); }),
      htmlStep("Project step 13: Center.", cssHelp(false, "text-align: center;", "Center the words."), function (ctx) { return /text-align\s*:/i.test(ctx.css); }),
      htmlStep("Project step 14: Margin.", cssHelp(false, "margin: 10px;", "Outside space."), function (ctx) { return /margin\s*:/i.test(ctx.css); }),
      htmlStep("Project step 15: Padding.", cssHelp(false, "padding: 10px;", "Inside space."), function (ctx) { return /padding\s*:/i.test(ctx.css); }),
      htmlStep("Project step 16: A class paragraph.", htmlHelp(false, '<p class="fun">Bring a shell.</p>', "class fun."), function (ctx) { return /class\s*=/i.test(ctx.html); }),
      htmlStep("Project step 17: Width.", cssHelp(false, "width: 260px;", "How wide."), function (ctx) { return /width\s*:/i.test(ctx.css); }),
      htmlStep("Project step 18: Border.", cssHelp(false, "border: 2px solid purple;", "A line around the invite."), function (ctx) { return /border\s*:/i.test(ctx.css); }),
    ],
  },
];

const advancedIdeas = [
  {
    id: "cardstyle",
    title: "Styled profile",
    blurb: "HTML plus class colors, size, and layout.",
    plan: ["Build the card.", "Name a class.", "Style the class."],
    steps: [
      htmlStep("Advanced step 1: Title.", htmlHelp(true, "<h1>My Card</h1>", "Big title."), function (ctx) { return /<h1>/i.test(ctx.html); }),
      htmlStep("Advanced step 2: Two paragraphs.", htmlHelp(false, "<p>Hello</p>", "Add a paragraph. Add a second <p> too if you only have one."), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 1; }),
      htmlStep("Advanced step 3: A class.", htmlHelp(false, '<p class="fun">Reef kid</p>', "class fun."), function (ctx) { return /class\s*=\s*["']fun["']/i.test(ctx.html); }),
      htmlStep("Advanced step 4: Color .fun.", cssHelp(false, ".fun { color: blue; }", "A dot before fun means the class. color: blue; inside the braces { }."), function (ctx) { return /\.fun[\s\S]*color\s*:/i.test(ctx.css) || /color\s*:\s*blue/i.test(ctx.css); }),
      htmlStep("Advanced step 5: Bigger .fun.", cssHelp(false, "font-size: 24px;", "Inside .fun, set font-size."), function (ctx) { return /font-size\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 6: Background.", cssHelp(false, "background: #d3f9d8;", "Page background."), function (ctx) { return /background\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 7: A heading.", htmlHelp(false, "<h2>About me</h2>", "Middle heading."), function (ctx) { return /<h2>/i.test(ctx.html); }),
      htmlStep("Advanced step 8: A button.", htmlHelp(false, "<button>Wave</button>", "A button."), function (ctx) { return /<button>/i.test(ctx.html); }),
      htmlStep("Advanced step 9: Center.", cssHelp(false, "text-align: center;", "Center words."), function (ctx) { return /text-align\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 10: Padding.", cssHelp(false, "padding: 16px;", "Inside space."), function (ctx) { return /padding\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 11: Margin.", cssHelp(false, "margin: 8px;", "Outside space."), function (ctx) { return /margin\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 12: Border.", cssHelp(false, "border: 2px solid teal;", "A line around the card."), function (ctx) { return /border\s*:/i.test(ctx.css); }),
    ],
  },
  {
    id: "neonposter",
    title: "Neon poster",
    blurb: "Bright colors, size, and a short list.",
    plan: ["Neon title.", "Two sentences.", "Bright CSS."],
    steps: [
      htmlStep("Advanced step 1: Neon title.", htmlHelp(true, "<h1>Neon Reef</h1>", "Big title."), function (ctx) { return /<h1>/i.test(ctx.html); }),
      htmlStep("Advanced step 2: First sentence.", htmlHelp(false, "<p>Glow on.</p>", "A paragraph."), function (ctx) { return /<p/i.test(ctx.html); }),
      htmlStep("Advanced step 3: Second sentence.", htmlHelp(false, "<p>Stay bright.</p>", "Another paragraph."), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2; }),
      htmlStep("Advanced step 4: Background.", cssHelp(false, "background: #111;", "A dark page. #111 is almost black."), function (ctx) { return /background\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 5: Title color.", cssHelp(false, "color: pink;", "A bright title."), function (ctx) { return /color\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 6: Huge letters.", cssHelp(false, "font-size: 40px;", "Very big letters."), function (ctx) { return /font-size\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 7: Center.", cssHelp(false, "text-align: center;", "Middle of the page."), function (ctx) { return /text-align\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 8: A button.", htmlHelp(false, "<button>Glow</button>", "A button."), function (ctx) { return /<button>/i.test(ctx.html); }),
      htmlStep("Advanced step 9: Padding.", cssHelp(false, "padding: 20px;", "Inside space."), function (ctx) { return /padding\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 10: A div.", htmlHelp(false, "<div>Night swim</div>", "A box."), function (ctx) { return /<div>/i.test(ctx.html); }),
      htmlStep("Advanced step 11: Width.", cssHelp(false, "width: 300px;", "How wide."), function (ctx) { return /width\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 12: Border.", cssHelp(false, "border: 2px solid pink;", "A pink line."), function (ctx) { return /border\s*:/i.test(ctx.css); }),
    ],
  },
  {
    id: "zoo",
    title: "Sea zoo list",
    blurb: "A title and animal list with simple layout CSS.",
    plan: ["Name the zoo.", "List three animals.", "Style the list page."],
    steps: [
      htmlStep("Advanced step 1: Zoo title.", htmlHelp(true, "<h1>Sea Zoo</h1>", "Big title."), function (ctx) { return /<h1>/i.test(ctx.html); }),
      htmlStep("Advanced step 2: Start the list.", htmlHelp(false, "<ul>", "ul starts the list."), function (ctx) { return /<ul/i.test(ctx.html); }),
      htmlStep("Advanced step 3: Crab.", htmlHelp(false, "<li>crab</li>", "First animal."), function (ctx) { return /<li>/i.test(ctx.html); }),
      htmlStep("Advanced step 4: Eel.", htmlHelp(false, "<li>eel</li>", "Second animal."), function (ctx) { return (ctx.html.match(/<li/gi) || []).length >= 2; }),
      htmlStep("Advanced step 5: Whale.", htmlHelp(false, "<li>whale</li>", "Third animal."), function (ctx) { return (ctx.html.match(/<li/gi) || []).length >= 3; }),
      htmlStep("Advanced step 6: End the list.", htmlHelp(false, "</ul>", "Close the list."), function (ctx) { return /<\/ul>/i.test(ctx.html); }),
      htmlStep("Advanced step 7: A note.", htmlHelp(false, "<p>Please do not tap the glass.</p>", "A paragraph under the list."), function (ctx) { return /<p/i.test(ctx.html); }),
      htmlStep("Advanced step 8: Background.", cssHelp(false, "background: #dff6ff;", "Light blue page."), function (ctx) { return /background\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 9: Title color.", cssHelp(false, "color: navy;", "Dark blue title."), function (ctx) { return /color\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 10: Font size.", cssHelp(false, "font-size: 20px;", "Letter size."), function (ctx) { return /font-size\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 11: Margin.", cssHelp(false, "margin: 14px;", "Outside space."), function (ctx) { return /margin\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 12: Padding.", cssHelp(false, "padding: 10px;", "Inside space."), function (ctx) { return /padding\s*:/i.test(ctx.css); }),
    ],
  },
];

function setTip(text) {
  if (helpLine) {
    helpLine.textContent = text;
  }
  if (tip) {
    tip.textContent = text;
  }
}

const projectApi = CodeReefProject.attach({
  pathKey: "htmlcss",
  actionLabel: "Show",
  ideas: finalIdeas,
  advancedIdeas: advancedIdeas,
  setTip: setTip,
  taskBar: taskBar,
  taskGoal: taskGoal,
  nextBtn: nextBtn,
  onProjectStart: function () {
    htmlCode.value = projectHtml;
    cssCode.value = projectCss;
    applyPreview(projectHtml, projectCss);
    persistLesson();
  },
  getParts: function () {
    return { html: htmlCode.value, css: cssCode.value };
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
  return {
    code: htmlCode.value + "\n" + cssCode.value,
    html: htmlCode.value,
    css: cssCode.value,
    output: htmlCode.value,
  };
}

function showTask() {
  taskDone = false;
  taskBar.classList.remove("is-done", "is-help", "is-project", "is-advanced");
  showNextButton(false);
  nextBtn.textContent = "Next task";
  taskGoal.textContent = tasks[taskIndex].goal;
  setTip("Do the task, then press Show. Tap Help if you get stuck.");
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
    openCoralTrail("htmlcss", {
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
    setTip("Not quite yet. Tap Help for a little hint.");
  }
}

function showPreview() {
  const doc =
    "<!DOCTYPE html><html><head><style>" +
    cssCode.value +
    "</style></head><body>" +
    htmlCode.value +
    "</body></html>";

  preview.srcdoc = doc;
  checkTask();
}

document.querySelectorAll(".web-tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    const name = tab.getAttribute("data-tab");

    document.querySelectorAll(".web-tab").forEach(function (el) {
      el.classList.toggle("is-active", el === tab);
    });

    document.querySelectorAll(".web-code-wrap").forEach(function (panel) {
      const on = panel.getAttribute("data-panel") === name;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
  });
});

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

document.getElementById("run-btn").addEventListener("click", showPreview);

htmlCode.addEventListener("input", function () {
  projectApi.guardElement(htmlCode, "html");
  persistLessonSoon();
});
cssCode.addEventListener("input", function () {
  projectApi.guardElement(cssCode, "css");
  persistLessonSoon();
});

(function bootLesson() {
  var saved =
    typeof CodeReefProgress !== "undefined" ? CodeReefProgress.load(PATH_KEY) : null;
  if (saved) {
    taskIndex = CodeReefProgress.clampTaskIndex(saved.taskIndex, tasks.length);
    htmlCode.value =
      typeof saved.html === "string" && saved.html.length > 0
        ? saved.html
        : starterHtml;
    cssCode.value =
      typeof saved.css === "string" && saved.css.length > 0 ? saved.css : starterCss;
  } else {
    htmlCode.value = starterHtml;
    cssCode.value = starterCss;
  }
  applyPreview(htmlCode.value, cssCode.value);

  if (projectApi.resumeIfNeeded()) {
    return;
  }

  showTask();
  if (saved && saved.taskDone) {
    restoreDoneWaitingForNext();
  }
})();
