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

const starterHtml = `<h1>Postcard blank!</h1>
<p>The sand is warm.</p>
<p class="fun">Bring a blanket.</p>
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

const projectHtml = `<h1>Picnic project</h1>
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
  add("Change blank to ready.", numbered(["Find the HTML tab. It is above the code box.","Tap the HTML tab.","HTML is the words on the page.","Keep your old line. Do not erase the whole title.","Click in the HTML box.","Click on the word blank.","Delete the letters b l a n k.","Type the word ready in that same spot.","The line should look like this: <h1>Postcard ready!</h1>","h1 means the biggest title.","Press the Show button. It is at the top.","You should see Postcard ready!"]), function () { return /<h1>\s*Postcard ready!\s*<\/h1>/i.test(htmlCode.value); });
  add("Make the fun words teal.", numbered(["Find the CSS tab. It is above the code box.","Tap the CSS tab.","CSS is the colors.","Keep your old CSS. Do not erase the other lines.","Find .fun { and the color line.","A class is a nickname, written with a dot.","Change the color to the word teal.","Type this exactly: color: teal;","color means the color of the letters.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see teal fun words"]), function () { return /\.fun\s*\{[^}]*color\s*:\s*teal/i.test(cssCode.value); });
  add("Add a sentence: Gulls flew past.", numbered(["Find the HTML tab.","Tap the HTML tab.","Keep your old HTML. Do not erase it.","Click at the end of the last line.","Press the Enter key.","Type this exactly: <p>Gulls flew past.</p>","p means a paragraph. A paragraph is one sentence.","The slash / in </p> means the sentence is finished.","Press the Show button. It is at the top.","You should see Gulls flew past."]), function () { return htmlCode.value.toLowerCase().indexOf("gulls flew past.") !== -1; });
  add("Add a sentence: We packed jam sandwiches.", numbered(["Find the HTML tab.","Tap the HTML tab.","Keep your old HTML. Do not erase it.","Click at the end of the last line.","Press the Enter key.","Type this exactly: <p>We packed jam sandwiches.</p>","p means a paragraph. A paragraph is one sentence.","The slash / in </p> means the sentence is finished.","Press the Show button. It is at the top.","You should see We packed jam sandwiches."]), function () { return htmlCode.value.toLowerCase().indexOf("we packed jam sandwiches.") !== -1; });
  add("Add a sentence: The blanket is red.", numbered(["Find the HTML tab.","Tap the HTML tab.","Keep your old HTML. Do not erase it.","Click at the end of the last line.","Press the Enter key.","Type this exactly: <p>The blanket is red.</p>","p means a paragraph. A paragraph is one sentence.","The slash / in </p> means the sentence is finished.","Press the Show button. It is at the top.","You should see The blanket is red."]), function () { return htmlCode.value.toLowerCase().indexOf("the blanket is red.") !== -1; });
  add("Add a sentence: A crab waved from the sand.", numbered(["Find the HTML tab.","Tap the HTML tab.","Keep your old HTML. Do not erase it.","Click at the end of the last line.","Press the Enter key.","Type this exactly: <p>A crab waved from the sand.</p>","p means a paragraph. A paragraph is one sentence.","The slash / in </p> means the sentence is finished.","Press the Show button. It is at the top.","You should see A crab waved from the sand."]), function () { return htmlCode.value.toLowerCase().indexOf("a crab waved from the sand.") !== -1; });
  add("Add a sentence: Juice sits in the basket.", numbered(["Find the HTML tab.","Tap the HTML tab.","Keep your old HTML. Do not erase it.","Click at the end of the last line.","Press the Enter key.","Type this exactly: <p>Juice sits in the basket.</p>","p means a paragraph. A paragraph is one sentence.","The slash / in </p> means the sentence is finished.","Press the Show button. It is at the top.","You should see Juice sits in the basket."]), function () { return htmlCode.value.toLowerCase().indexOf("juice sits in the basket.") !== -1; });
  add("Add a sentence: Kites tug on their string.", numbered(["Find the HTML tab.","Tap the HTML tab.","Keep your old HTML. Do not erase it.","Click at the end of the last line.","Press the Enter key.","Type this exactly: <p>Kites tug on their string.</p>","p means a paragraph. A paragraph is one sentence.","The slash / in </p> means the sentence is finished.","Press the Show button. It is at the top.","You should see Kites tug on their string."]), function () { return htmlCode.value.toLowerCase().indexOf("kites tug on their string.") !== -1; });
  add("Paint the page light yellow.", numbered(["Tap the CSS tab.","Keep your old CSS.","Find body { .","background is the color behind the words.","Type this exactly: background: #fff3bf;","#fff3bf is a light yellow code.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see a light yellow page"]), function () { return /body\s*\{[^}]*background\s*:\s*#fff3bf/i.test(cssCode.value); });
  add("Make the big title navy.", numbered(["Tap the CSS tab.","Keep your old CSS.","Find h1 { .","Type this exactly: color: navy;","navy is a dark blue color word.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see a navy title"]), function () { return /h1\s*\{[^}]*color\s*:\s*navy/i.test(cssCode.value); });
  add("Make the fun words bigger.", numbered(["Tap the CSS tab.","Find .fun { .","font-size means how big the letters are.","Type this exactly: font-size: 28px;","28px means 28 tiny screen dots.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see bigger fun words"]), function () { return /\.fun\s*\{[^}]*font-size\s*:\s*28px/i.test(cssCode.value); });
  add("Add a h2 that says Picnic spots.", numbered(["Tap the HTML tab.","Keep your old HTML.","Click at the end.","Press the Enter key.","Type this exactly: <h2>Picnic spots</h2>","h2 is a heading. h1 is biggest. h3 is smaller.","The slash / finishes the heading.","Press the Show button. It is at the top.","You should see Picnic spots"]), function () { return /<h2>\s*Picnic spots\s*<\/h2>/i.test(htmlCode.value); });
  add("Add a h2 that says Games.", numbered(["Tap the HTML tab.","Keep your old HTML.","Click at the end.","Press the Enter key.","Type this exactly: <h2>Games</h2>","h2 is a heading. h1 is biggest. h3 is smaller.","The slash / finishes the heading.","Press the Show button. It is at the top.","You should see Games"]), function () { return /<h2>\s*Games\s*<\/h2>/i.test(htmlCode.value); });
  add("Add a h3 that says Today.", numbered(["Tap the HTML tab.","Keep your old HTML.","Click at the end.","Press the Enter key.","Type this exactly: <h3>Today</h3>","h3 is a heading. h1 is biggest. h3 is smaller.","The slash / finishes the heading.","Press the Show button. It is at the top.","You should see Today"]), function () { return /<h3>\s*Today\s*<\/h3>/i.test(htmlCode.value); });
  add("Add a h3 that says Snacks.", numbered(["Tap the HTML tab.","Keep your old HTML.","Click at the end.","Press the Enter key.","Type this exactly: <h3>Snacks</h3>","h3 is a heading. h1 is biggest. h3 is smaller.","The slash / finishes the heading.","Press the Show button. It is at the top.","You should see Snacks"]), function () { return /<h3>\s*Snacks\s*<\/h3>/i.test(htmlCode.value); });
  add("Add a button that says Share.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key for a new line.","Type this exactly: <button>Share</button>","button means a word you could press.","Press the Show button. It is at the top.","You should see Share"]), function () { return /<button>\s*Share\s*<\/button>/i.test(htmlCode.value); });
  add("Add a button that says Save.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key for a new line.","Type this exactly: <button>Save</button>","button means a word you could press.","Press the Show button. It is at the top.","You should see Save"]), function () { return /<button>\s*Save\s*<\/button>/i.test(htmlCode.value); });
  add("Add a button that says Wave.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key for a new line.","Type this exactly: <button>Wave</button>","button means a word you could press.","Press the Show button. It is at the top.","You should see Wave"]), function () { return /<button>\s*Wave\s*<\/button>/i.test(htmlCode.value); });
  add("Start a snack list.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <ul></ul>","ul means a list. You will put items inside later.","Press the Show button. It is at the top.","You should see a list started"]), function () { return /<ul[\s>]/i.test(htmlCode.value); });
  add("Add a list item for jam.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <li>jam</li>","li means one item in a list.","Press the Show button. It is at the top.","You should see jam"]), function () { return /<li>\s*jam\s*<\/li>/i.test(htmlCode.value); });
  add("Add a list item for juice.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <li>juice</li>","li means one item in a list.","Press the Show button. It is at the top.","You should see juice"]), function () { return /<li>\s*juice\s*<\/li>/i.test(htmlCode.value); });
  add("Add a list item for shells.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <li>shells</li>","li means one item in a list.","Press the Show button. It is at the top.","You should see shells"]), function () { return /<li>\s*shells\s*<\/li>/i.test(htmlCode.value); });
  add("Add a box that says Basket.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <div>Basket</div>","div means a box that groups things.","Press the Show button. It is at the top.","You should see Basket"]), function () { return /<div>\s*Basket\s*<\/div>/i.test(htmlCode.value); });
  add("Add a box that says Blanket.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <div>Blanket</div>","div means a box that groups things.","Press the Show button. It is at the top.","You should see Blanket"]), function () { return /<div>\s*Blanket\s*<\/div>/i.test(htmlCode.value); });
  add("Add a box that says Cooler.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <div>Cooler</div>","div means a box that groups things.","Press the Show button. It is at the top.","You should see Cooler"]), function () { return /<div>\s*Cooler\s*<\/div>/i.test(htmlCode.value); });
  add("Make the word yummy strong.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <strong>yummy</strong>","strong makes a word look important.","Press the Show button. It is at the top.","You should see yummy"]), function () { return /<strong>\s*yummy\s*<\/strong>/i.test(htmlCode.value); });
  add("Make the word sunny strong.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <strong>sunny</strong>","strong makes a word look important.","Press the Show button. It is at the top.","You should see sunny"]), function () { return /<strong>\s*sunny\s*<\/strong>/i.test(htmlCode.value); });
  add("Make the word sandy strong.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <strong>sandy</strong>","strong makes a word look important.","Press the Show button. It is at the top.","You should see sandy"]), function () { return /<strong>\s*sandy\s*<\/strong>/i.test(htmlCode.value); });
  add("Add a link that says map.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <a href=\"#\">map</a>","a means a link.","href is where it goes. # means stay on this page.","Keep the quotes around #.","Press the Show button. It is at the top.","You should see map"]), function () { return /<a[^>]*>\s*map\s*<\/a>/i.test(htmlCode.value); });
  add("Add a link that says top.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <a href=\"#\">top</a>","a means a link.","href is where it goes. # means stay on this page.","Keep the quotes around #.","Press the Show button. It is at the top.","You should see top"]), function () { return /<a[^>]*>\s*top\s*<\/a>/i.test(htmlCode.value); });
  add("Add a link that says home.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <a href=\"#\">home</a>","a means a link.","href is where it goes. # means stay on this page.","Keep the quotes around #.","Press the Show button. It is at the top.","You should see home"]), function () { return /<a[^>]*>\s*home\s*<\/a>/i.test(htmlCode.value); });
  add("Add a note sentence.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <p class=\"note\">Meet at noon.</p>","class is a nickname the colors can use.","Keep the quotes around note.","Press the Show button. It is at the top.","You should see Meet at noon."]), function () { return /<p[^>]*class\s*=\s*["']note["'][^>]*>\s*Meet at noon\\./i.test(htmlCode.value); });
  add("Add a spot sentence.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <p class=\"spot\">The red blanket.</p>","class is a nickname the colors can use.","Keep the quotes around spot.","Press the Show button. It is at the top.","You should see The red blanket."]), function () { return /<p[^>]*class\s*=\s*["']spot["'][^>]*>\s*The red blanket\\./i.test(htmlCode.value); });
  add("Add a card sentence.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <p class=\"card\">Sunday picnic.</p>","class is a nickname the colors can use.","Keep the quotes around card.","Press the Show button. It is at the top.","You should see Sunday picnic."]), function () { return /<p[^>]*class\s*=\s*["']card["'][^>]*>\s*Sunday picnic\\./i.test(htmlCode.value); });
  add("Color a new .tomato class tomato.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end.","Press the Enter key.","Type this exactly: .tomato { color: tomato; }","The dot names the class.","color: tomato; paints the letters.","Keep the semicolon ; before the closing brace.","Press the Show button. It is at the top.","You should see tomato letters"]), function () { return /\.tomato\s*\{[^}]*color\s*:\s*tomato/i.test(cssCode.value); });
  add("Color a new .purple class purple.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end.","Press the Enter key.","Type this exactly: .purple { color: purple; }","The dot names the class.","color: purple; paints the letters.","Keep the semicolon ; before the closing brace.","Press the Show button. It is at the top.","You should see purple letters"]), function () { return /\.purple\s*\{[^}]*color\s*:\s*purple/i.test(cssCode.value); });
  add("Color a new .orange class orange.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end.","Press the Enter key.","Type this exactly: .orange { color: orange; }","The dot names the class.","color: orange; paints the letters.","Keep the semicolon ; before the closing brace.","Press the Show button. It is at the top.","You should see orange letters"]), function () { return /\.orange\s*\{[^}]*color\s*:\s*orange/i.test(cssCode.value); });
  add("Color a new .pink class pink.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end.","Press the Enter key.","Type this exactly: .pink { color: pink; }","The dot names the class.","color: pink; paints the letters.","Keep the semicolon ; before the closing brace.","Press the Show button. It is at the top.","You should see pink letters"]), function () { return /\.pink\s*\{[^}]*color\s*:\s*pink/i.test(cssCode.value); });
  add("Set margin to 12px.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: margin: 12px;","margin means space outside a box.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see margin 12px"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("margin:12px") !== -1; });
  add("Set margin to 24px.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: margin: 24px;","margin means a bigger outside space.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see margin 24px"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("margin:24px") !== -1; });
  add("Set padding to 8px.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: padding: 8px;","padding means space inside a box.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see padding 8px"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("padding:8px") !== -1; });
  add("Set padding to 18px.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: padding: 18px;","padding means a bigger inside space.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see padding 18px"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("padding:18px") !== -1; });
  add("Set text-align to center.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: text-align: center;","text-align means words in the middle.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see text-align center"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("text-align:center") !== -1; });
  add("Set text-align to right.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: text-align: right;","text-align means words on the right.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see text-align right"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("text-align:right") !== -1; });
  add("Set width to 240px.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: width: 240px;","width means a narrow card.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see width 240px"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("width:240px") !== -1; });
  add("Set width to 420px.", numbered(["Tap the CSS tab.","Keep your old CSS.","Click at the end of a block, or make a new line inside body { .","Type this exactly: width: 420px;","width means a wider card.","Keep the colon : and the semicolon ; .","Press the Show button. It is at the top.","You should see width 420px"]), function () { return cssCode.value.toLowerCase().replace(/\s+/g, "").indexOf("width:420px") !== -1; });
  add("Draw a 2px navy border.", numbered(["Tap the CSS tab.","Keep your old CSS.","Type this exactly: border: 2px solid navy;","border is a line around a box.","2px is how thick. solid means a plain line. navy is the color.","Keep the semicolon ; .","Press the Show button. It is at the top.","You should see a navy border"]), function () { return /border\s*:\s*2px\s+solid\s+navy/i.test(cssCode.value); });
  add("Draw a 4px tomato border.", numbered(["Tap the CSS tab.","Keep your old CSS.","Type this exactly: border: 4px solid tomato;","border is a line around a box.","4px is how thick. solid means a plain line. tomato is the color.","Keep the semicolon ; .","Press the Show button. It is at the top.","You should see a tomato border"]), function () { return /border\s*:\s*4px\s+solid\s+tomato/i.test(cssCode.value); });
  add("Draw a 3px teal border.", numbered(["Tap the CSS tab.","Keep your old CSS.","Type this exactly: border: 3px solid teal;","border is a line around a box.","3px is how thick. solid means a plain line. teal is the color.","Keep the semicolon ; .","Press the Show button. It is at the top.","You should see a teal border"]), function () { return /border\s*:\s*3px\s+solid\s+teal/i.test(cssCode.value); });
  add("Add a fun tag that says Send card.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"fun\">Send card</button>","class=\"fun\" gives this tag a nickname.","The words Send card sit in the middle.","The slash / finishes the tag.","Press the Show button. It is at the top.","You should see Send card"]), function () { return htmlCode.value.toLowerCase().indexOf("send card") !== -1 && /class\s*=\s*["']fun["']/i.test(htmlCode.value); });
  add("Add a spot tag that says Hold tight.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <p class=\"spot\">Hold tight</p>","class=\"spot\" gives this tag a nickname.","The words Hold tight sit in the middle.","The slash / finishes the tag.","Press the Show button. It is at the top.","You should see Hold tight"]), function () { return htmlCode.value.toLowerCase().indexOf("hold tight") !== -1 && /class\s*=\s*["']spot["']/i.test(htmlCode.value); });
  add("Add a note tag that says Back to top.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <a class=\"note\" href=\"#\">Back to top</a>","class=\"note\" gives this tag a nickname.","The words Back to top sit in the middle.","The slash / finishes the tag.","Press the Show button. It is at the top.","You should see Back to top"]), function () { return htmlCode.value.toLowerCase().indexOf("back to top") !== -1 && /class\s*=\s*["']note["']/i.test(htmlCode.value); });
  add("Add a card tag that says Sunday box.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <div class=\"card\">Sunday box</div>","class=\"card\" gives this tag a nickname.","The words Sunday box sit in the middle.","The slash / finishes the tag.","Press the Show button. It is at the top.","You should see Sunday box"]), function () { return htmlCode.value.toLowerCase().indexOf("sunday box") !== -1 && /class\s*=\s*["']card["']/i.test(htmlCode.value); });
  add("Add a spot tag that says Tide time.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h2 class=\"spot\">Tide time</h2>","class=\"spot\" gives this tag a nickname.","The words Tide time sit in the middle.","The slash / finishes the tag.","Press the Show button. It is at the top.","You should see Tide time"]), function () { return htmlCode.value.toLowerCase().indexOf("tide time") !== -1 && /class\s*=\s*["']spot["']/i.test(htmlCode.value); });
  add("Add a note tag that says Nap time.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3 class=\"note\">Nap time</h3>","class=\"note\" gives this tag a nickname.","The words Nap time sit in the middle.","The slash / finishes the tag.","Press the Show button. It is at the top.","You should see Nap time"]), function () { return htmlCode.value.toLowerCase().indexOf("nap time") !== -1 && /class\s*=\s*["']note["']/i.test(htmlCode.value); });
  add("Add a Kites heading and paint .kite.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Kites</h3>","Press the Enter key again.","Type this exactly: <p class=\"kite\">Hold the string.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .kite { color: purple; }","The dot plus kite matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Kites and Hold the string."]), function () { return /<h3>\s*Kites\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']kite["']/i.test(htmlCode.value) && /\.kite\s*\{[^}]*color\s*:\s*purple/i.test(cssCode.value); });
  add("Add a Shells heading and paint .shell.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Shells</h3>","Press the Enter key again.","Type this exactly: <p class=\"shell\">Listen to the shell.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .shell { color: teal; }","The dot plus shell matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Shells and Listen to the shell."]), function () { return /<h3>\s*Shells\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']shell["']/i.test(htmlCode.value) && /\.shell\s*\{[^}]*color\s*:\s*teal/i.test(cssCode.value); });
  add("Add a Jam heading and paint .jam.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Jam</h3>","Press the Enter key again.","Type this exactly: <p class=\"jam\">Spread it thick.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .jam { color: tomato; }","The dot plus jam matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Jam and Spread it thick."]), function () { return /<h3>\s*Jam\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']jam["']/i.test(htmlCode.value) && /\.jam\s*\{[^}]*color\s*:\s*tomato/i.test(cssCode.value); });
  add("Add a Juice heading and paint .juice.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Juice</h3>","Press the Enter key again.","Type this exactly: <p class=\"juice\">Pour a cup.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .juice { color: orange; }","The dot plus juice matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Juice and Pour a cup."]), function () { return /<h3>\s*Juice\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']juice["']/i.test(htmlCode.value) && /\.juice\s*\{[^}]*color\s*:\s*orange/i.test(cssCode.value); });
  add("Add a Nap heading and paint .nap.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Nap</h3>","Press the Enter key again.","Type this exactly: <p class=\"nap\">Rest on the blanket.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .nap { color: navy; }","The dot plus nap matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Nap and Rest on the blanket."]), function () { return /<h3>\s*Nap\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']nap["']/i.test(htmlCode.value) && /\.nap\s*\{[^}]*color\s*:\s*navy/i.test(cssCode.value); });
  add("Add a Crabs heading and paint .crab.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Crabs</h3>","Press the Enter key again.","Type this exactly: <p class=\"crab\">They wave hello.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .crab { color: pink; }","The dot plus crab matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Crabs and They wave hello."]), function () { return /<h3>\s*Crabs\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']crab["']/i.test(htmlCode.value) && /\.crab\s*\{[^}]*color\s*:\s*pink/i.test(cssCode.value); });
  add("Add a Games heading and paint .game.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Games</h3>","Press the Enter key again.","Type this exactly: <p class=\"game\">Race to the water.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .game { color: purple; }","The dot plus game matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Games and Race to the water."]), function () { return /<h3>\s*Games\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']game["']/i.test(htmlCode.value) && /\.game\s*\{[^}]*color\s*:\s*purple/i.test(cssCode.value); });
  add("Add a Maps heading and paint .mapnote.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <h3>Maps</h3>","Press the Enter key again.","Type this exactly: <p class=\"mapnote\">X marks the towel.</p>","Tap the CSS tab.","Keep your old CSS.","Type this exactly: .mapnote { color: teal; }","The dot plus mapnote matches the class on the sentence.","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Maps and X marks the towel."]), function () { return /<h3>\s*Maps\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']mapnote["']/i.test(htmlCode.value) && /\.mapnote\s*\{[^}]*color\s*:\s*teal/i.test(cssCode.value); });
  add("Add Picnic map and color it navy.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Picnic map</h3>","Press the Enter key.","Type this exactly: <p class=\"mapx\">towel</p>","Tap the CSS tab.","Type this exactly: .mapx { color: navy; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Picnic map"]), function () { return /<h3>\s*Picnic map\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']mapx["']/i.test(htmlCode.value) && /\.mapx\s*\{[^}]*color\s*:\s*navy/i.test(cssCode.value); });
  add("Add Snack card and color it purple.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Snack card</h3>","Press the Enter key.","Type this exactly: <p class=\"berry\">berries</p>","Tap the CSS tab.","Type this exactly: .berry { color: purple; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Snack card"]), function () { return /<h3>\s*Snack card\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']berry["']/i.test(htmlCode.value) && /\.berry\s*\{[^}]*color\s*:\s*purple/i.test(cssCode.value); });
  add("Add Wind note and color it teal.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Wind note</h3>","Press the Enter key.","Type this exactly: <p class=\"gust\">gust</p>","Tap the CSS tab.","Type this exactly: .gust { color: teal; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Wind note"]), function () { return /<h3>\s*Wind note\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']gust["']/i.test(htmlCode.value) && /\.gust\s*\{[^}]*color\s*:\s*teal/i.test(cssCode.value); });
  add("Add Sun card and color it orange.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Sun card</h3>","Press the Enter key.","Type this exactly: <p class=\"shadebox\">shade</p>","Tap the CSS tab.","Type this exactly: .shadebox { color: orange; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Sun card"]), function () { return /<h3>\s*Sun card\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']shadebox["']/i.test(htmlCode.value) && /\.shadebox\s*\{[^}]*color\s*:\s*orange/i.test(cssCode.value); });
  add("Add Tide note and color it pink.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Tide note</h3>","Press the Enter key.","Type this exactly: <p class=\"foam\">foam</p>","Tap the CSS tab.","Type this exactly: .foam { color: pink; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Tide note"]), function () { return /<h3>\s*Tide note\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']foam["']/i.test(htmlCode.value) && /\.foam\s*\{[^}]*color\s*:\s*pink/i.test(cssCode.value); });
  add("Add Friend card and color it tomato.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Friend card</h3>","Press the Enter key.","Type this exactly: <p class=\"milo\">Milo</p>","Tap the CSS tab.","Type this exactly: .milo { color: tomato; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Friend card"]), function () { return /<h3>\s*Friend card\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']milo["']/i.test(htmlCode.value) && /\.milo\s*\{[^}]*color\s*:\s*tomato/i.test(cssCode.value); });
  add("Add Cup note and color it navy.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Cup note</h3>","Press the Enter key.","Type this exactly: <p class=\"straw\">straw</p>","Tap the CSS tab.","Type this exactly: .straw { color: navy; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Cup note"]), function () { return /<h3>\s*Cup note\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']straw["']/i.test(htmlCode.value) && /\.straw\s*\{[^}]*color\s*:\s*navy/i.test(cssCode.value); });
  add("Add Hat card and color it purple.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h3>Hat card</h3>","Press the Enter key.","Type this exactly: <p class=\"ribbon\">ribbon</p>","Tap the CSS tab.","Type this exactly: .ribbon { color: purple; }","Keep the semicolon ; inside the braces.","Press the Show button. It is at the top.","You should see Hat card"]), function () { return /<h3>\s*Hat card\s*<\/h3>/i.test(htmlCode.value) && /class\s*=\s*["']ribbon["']/i.test(htmlCode.value) && /\.ribbon\s*\{[^}]*color\s*:\s*purple/i.test(cssCode.value); });
  add("Finish Sunday feast with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Sunday feast</h2>","Press the Enter key.","Type this exactly: <p class=\"feast\">pie</p>","Tap the CSS tab.","Type this exactly: .feast { font-size: 28px; text-align: center; border: 2px solid navy; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Sunday feast"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Sunday feast\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']feast["']/i.test(htmlCode.value) && css.indexOf(".feast{font-size:28px;text-align:center;border:2pxsolidnavy;}") !== -1; });
  add("Finish Monday feast with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Monday feast</h2>","Press the Enter key.","Type this exactly: <p class=\"monday\">corn</p>","Tap the CSS tab.","Type this exactly: .monday { font-size: 22px; text-align: left; border: 3px solid teal; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Monday feast"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Monday feast\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']monday["']/i.test(htmlCode.value) && css.indexOf(".monday{font-size:22px;text-align:left;border:3pxsolidteal;}") !== -1; });
  add("Finish Tuesday feast with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Tuesday feast</h2>","Press the Enter key.","Type this exactly: <p class=\"tuesday\">buns</p>","Tap the CSS tab.","Type this exactly: .tuesday { font-size: 24px; text-align: center; border: 4px solid tomato; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Tuesday feast"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Tuesday feast\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']tuesday["']/i.test(htmlCode.value) && css.indexOf(".tuesday{font-size:24px;text-align:center;border:4pxsolidtomato;}") !== -1; });
  add("Finish Wednesday feast with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Wednesday feast</h2>","Press the Enter key.","Type this exactly: <p class=\"wednesday\">chips</p>","Tap the CSS tab.","Type this exactly: .wednesday { font-size: 18px; text-align: right; border: 2px solid purple; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Wednesday feast"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Wednesday feast\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']wednesday["']/i.test(htmlCode.value) && css.indexOf(".wednesday{font-size:18px;text-align:right;border:2pxsolidpurple;}") !== -1; });
  add("Finish Thursday feast with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Thursday feast</h2>","Press the Enter key.","Type this exactly: <p class=\"thursday\">melon</p>","Tap the CSS tab.","Type this exactly: .thursday { font-size: 20px; text-align: center; border: 3px solid pink; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Thursday feast"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Thursday feast\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']thursday["']/i.test(htmlCode.value) && css.indexOf(".thursday{font-size:20px;text-align:center;border:3pxsolidpink;}") !== -1; });
  add("Finish Friday feast with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Friday feast</h2>","Press the Enter key.","Type this exactly: <p class=\"friday\">oats</p>","Tap the CSS tab.","Type this exactly: .friday { font-size: 26px; text-align: left; border: 4px solid orange; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Friday feast"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Friday feast\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']friday["']/i.test(htmlCode.value) && css.indexOf(".friday{font-size:26px;text-align:left;border:4pxsolidorange;}") !== -1; });
  add("Finish Saturday feast with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Saturday feast</h2>","Press the Enter key.","Type this exactly: <p class=\"saturday\">plums</p>","Tap the CSS tab.","Type this exactly: .saturday { font-size: 30px; text-align: center; border: 2px solid teal; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Saturday feast"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Saturday feast\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']saturday["']/i.test(htmlCode.value) && css.indexOf(".saturday{font-size:30px;text-align:center;border:2pxsolidteal;}") !== -1; });
  add("Finish Picnic finale with size, side, and a border.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Picnic finale</h2>","Press the Enter key.","Type this exactly: <p class=\"finale\">cake</p>","Tap the CSS tab.","Type this exactly: .finale { font-size: 32px; text-align: center; border: 4px solid navy; }","font-size, text-align, and border are three jobs on one class.","Keep every semicolon ; .","Press the Show button. It is at the top.","You should see Picnic finale"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Picnic finale\s*<\/h2>/i.test(htmlCode.value) && /<p[^>]*class\s*=\s*["']finale["']/i.test(htmlCode.value) && css.indexOf(".finale{font-size:32px;text-align:center;border:4pxsolidnavy;}") !== -1; });
  add("Build the basket list with a size and a side.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Basket list</h2>","Press the Enter key.","Type this exactly: <ul class=\"basket\"><li>napkins</li></ul>","Tap the CSS tab.","Type this exactly: .basket { font-size: 16px; text-align: center; }","font-size sets the letter size. text-align sets the side.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Basket list"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Basket list\s*<\/h2>/i.test(htmlCode.value) && /<li>\s*napkins\s*<\/li>/i.test(htmlCode.value) && css.indexOf(".basket{font-size:16px;text-align:center;}") !== -1; });
  add("Build the cooler list with a size and a side.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Cooler list</h2>","Press the Enter key.","Type this exactly: <ul class=\"cooler\"><li>ice</li></ul>","Tap the CSS tab.","Type this exactly: .cooler { font-size: 18px; text-align: left; }","font-size sets the letter size. text-align sets the side.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Cooler list"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Cooler list\s*<\/h2>/i.test(htmlCode.value) && /<li>\s*ice\s*<\/li>/i.test(htmlCode.value) && css.indexOf(".cooler{font-size:18px;text-align:left;}") !== -1; });
  add("Build the towel list with a size and a side.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Towel list</h2>","Press the Enter key.","Type this exactly: <ul class=\"towel\"><li>stripes</li></ul>","Tap the CSS tab.","Type this exactly: .towel { font-size: 22px; text-align: center; }","font-size sets the letter size. text-align sets the side.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Towel list"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Towel list\s*<\/h2>/i.test(htmlCode.value) && /<li>\s*stripes\s*<\/li>/i.test(htmlCode.value) && css.indexOf(".towel{font-size:22px;text-align:center;}") !== -1; });
  add("Build the hat list with a size and a side.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Hat list</h2>","Press the Enter key.","Type this exactly: <ul class=\"hat\"><li>brim</li></ul>","Tap the CSS tab.","Type this exactly: .hat { font-size: 14px; text-align: right; }","font-size sets the letter size. text-align sets the side.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Hat list"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Hat list\s*<\/h2>/i.test(htmlCode.value) && /<li>\s*brim\s*<\/li>/i.test(htmlCode.value) && css.indexOf(".hat{font-size:14px;text-align:right;}") !== -1; });
  add("Build the cup list with a size and a side.", numbered(["Tap the HTML tab.","Keep your old HTML.","Type this exactly: <h2>Cup list</h2>","Press the Enter key.","Type this exactly: <ul class=\"cup\"><li>lid</li></ul>","Tap the CSS tab.","Type this exactly: .cup { font-size: 20px; text-align: center; }","font-size sets the letter size. text-align sets the side.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Cup list"]), function () { const css = cssCode.value.toLowerCase().replace(/\s+/g, ""); return /<h2>\s*Cup list\s*<\/h2>/i.test(htmlCode.value) && /<li>\s*lid\s*<\/li>/i.test(htmlCode.value) && css.indexOf(".cup{font-size:20px;text-align:center;}") !== -1; });
  add("Add a tomato button that says Pack towels.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end0\">Pack towels</button>","Tap the CSS tab.","Type this exactly: .end0 { background: tomato; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Pack towels"]), function () { return /<button[^>]*class\s*=\s*["']end0["'][^>]*>\s*Pack towels\s*<\/button>/i.test(htmlCode.value) && /\.end0\s*\{[^}]*background\s*:\s*tomato/i.test(cssCode.value) && /\.end0\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a teal button that says Roll blanket.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end1\">Roll blanket</button>","Tap the CSS tab.","Type this exactly: .end1 { background: teal; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Roll blanket"]), function () { return /<button[^>]*class\s*=\s*["']end1["'][^>]*>\s*Roll blanket\s*<\/button>/i.test(htmlCode.value) && /\.end1\s*\{[^}]*background\s*:\s*teal/i.test(cssCode.value) && /\.end1\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a navy button that says Fill cups.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end2\">Fill cups</button>","Tap the CSS tab.","Type this exactly: .end2 { background: navy; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Fill cups"]), function () { return /<button[^>]*class\s*=\s*["']end2["'][^>]*>\s*Fill cups\s*<\/button>/i.test(htmlCode.value) && /\.end2\s*\{[^}]*background\s*:\s*navy/i.test(cssCode.value) && /\.end2\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a purple button that says Tie kites.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end3\">Tie kites</button>","Tap the CSS tab.","Type this exactly: .end3 { background: purple; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Tie kites"]), function () { return /<button[^>]*class\s*=\s*["']end3["'][^>]*>\s*Tie kites\s*<\/button>/i.test(htmlCode.value) && /\.end3\s*\{[^}]*background\s*:\s*purple/i.test(cssCode.value) && /\.end3\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a orange button that says Slice melon.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end4\">Slice melon</button>","Tap the CSS tab.","Type this exactly: .end4 { background: orange; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Slice melon"]), function () { return /<button[^>]*class\s*=\s*["']end4["'][^>]*>\s*Slice melon\s*<\/button>/i.test(htmlCode.value) && /\.end4\s*\{[^}]*background\s*:\s*orange/i.test(cssCode.value) && /\.end4\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a pink button that says Count shells.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end5\">Count shells</button>","Tap the CSS tab.","Type this exactly: .end5 { background: pink; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Count shells"]), function () { return /<button[^>]*class\s*=\s*["']end5["'][^>]*>\s*Count shells\s*<\/button>/i.test(htmlCode.value) && /\.end5\s*\{[^}]*background\s*:\s*pink/i.test(cssCode.value) && /\.end5\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a tomato button that says Wave back.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end6\">Wave back</button>","Tap the CSS tab.","Type this exactly: .end6 { background: tomato; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Wave back"]), function () { return /<button[^>]*class\s*=\s*["']end6["'][^>]*>\s*Wave back\s*<\/button>/i.test(htmlCode.value) && /\.end6\s*\{[^}]*background\s*:\s*tomato/i.test(cssCode.value) && /\.end6\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a teal button that says Share juice.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end7\">Share juice</button>","Tap the CSS tab.","Type this exactly: .end7 { background: teal; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Share juice"]), function () { return /<button[^>]*class\s*=\s*["']end7["'][^>]*>\s*Share juice\s*<\/button>/i.test(htmlCode.value) && /\.end7\s*\{[^}]*background\s*:\s*teal/i.test(cssCode.value) && /\.end7\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a navy button that says Fold napkins.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end8\">Fold napkins</button>","Tap the CSS tab.","Type this exactly: .end8 { background: navy; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Fold napkins"]), function () { return /<button[^>]*class\s*=\s*["']end8["'][^>]*>\s*Fold napkins\s*<\/button>/i.test(htmlCode.value) && /\.end8\s*\{[^}]*background\s*:\s*navy/i.test(cssCode.value) && /\.end8\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a purple button that says Mark the map.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end9\">Mark the map</button>","Tap the CSS tab.","Type this exactly: .end9 { background: purple; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Mark the map"]), function () { return /<button[^>]*class\s*=\s*["']end9["'][^>]*>\s*Mark the map\s*<\/button>/i.test(htmlCode.value) && /\.end9\s*\{[^}]*background\s*:\s*purple/i.test(cssCode.value) && /\.end9\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a orange button that says Shake sand.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end10\">Shake sand</button>","Tap the CSS tab.","Type this exactly: .end10 { background: orange; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Shake sand"]), function () { return /<button[^>]*class\s*=\s*["']end10["'][^>]*>\s*Shake sand\s*<\/button>/i.test(htmlCode.value) && /\.end10\s*\{[^}]*background\s*:\s*orange/i.test(cssCode.value) && /\.end10\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a pink button that says Pass berries.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end11\">Pass berries</button>","Tap the CSS tab.","Type this exactly: .end11 { background: pink; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Pass berries"]), function () { return /<button[^>]*class\s*=\s*["']end11["'][^>]*>\s*Pass berries\s*<\/button>/i.test(htmlCode.value) && /\.end11\s*\{[^}]*background\s*:\s*pink/i.test(cssCode.value) && /\.end11\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a tomato button that says Start the race.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end12\">Start the race</button>","Tap the CSS tab.","Type this exactly: .end12 { background: tomato; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Start the race"]), function () { return /<button[^>]*class\s*=\s*["']end12["'][^>]*>\s*Start the race\s*<\/button>/i.test(htmlCode.value) && /\.end12\s*\{[^}]*background\s*:\s*tomato/i.test(cssCode.value) && /\.end12\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a teal button that says Rest now.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end13\">Rest now</button>","Tap the CSS tab.","Type this exactly: .end13 { background: teal; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Rest now"]), function () { return /<button[^>]*class\s*=\s*["']end13["'][^>]*>\s*Rest now\s*<\/button>/i.test(htmlCode.value) && /\.end13\s*\{[^}]*background\s*:\s*teal/i.test(cssCode.value) && /\.end13\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a navy button that says Clap twice.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end14\">Clap twice</button>","Tap the CSS tab.","Type this exactly: .end14 { background: navy; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Clap twice"]), function () { return /<button[^>]*class\s*=\s*["']end14["'][^>]*>\s*Clap twice\s*<\/button>/i.test(htmlCode.value) && /\.end14\s*\{[^}]*background\s*:\s*navy/i.test(cssCode.value) && /\.end14\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  add("Add a purple button that says Head home.", numbered(["Tap the HTML tab.","Keep your old HTML.","Press the Enter key.","Type this exactly: <button class=\"end15\">Head home</button>","Tap the CSS tab.","Type this exactly: .end15 { background: purple; color: white; }","background paints the button. color paints the words.","Keep both semicolons ; .","Press the Show button. It is at the top.","You should see Head home"]), function () { return /<button[^>]*class\s*=\s*["']end15["'][^>]*>\s*Head home\s*<\/button>/i.test(htmlCode.value) && /\.end15\s*\{[^}]*background\s*:\s*purple/i.test(cssCode.value) && /\.end15\s*\{[^}]*color\s*:\s*white/i.test(cssCode.value); });
  if (list.length !== 100) throw new Error("expected 100 tasks, got " + list.length);
  return list;
})();

function htmlStep(goal, help, check) {
  return { goal: goal, help: help, check: check };
}

const finalIdeas = [
  {
    id: "profile",
    title: "Picnic card",
    blurb: "A card with a title, a list, and colors.",
    plan: ["Write the card.","Add a list.","Paint it."],
    steps: [
      htmlStep("Project step 1: Picnic title.", numbered(["Tap the HTML tab.","Start fresh in the HTML box.","Highlight the old HTML and press Delete.","Type this exactly: <h1>Picnic card</h1>","Press the Show button.","You should see Picnic card"]), function (ctx) { return /<h1>\s*Picnic card\s*<\/h1>/i.test(ctx.html); }),
      htmlStep("Project step 2: A sentence.", numbered(["Keep your old HTML.","Press Enter.","Type this exactly: <p>Meet on the sand.</p>","Press Show.","You should see Meet on the sand"]), function (ctx) { return /Meet on the sand/i.test(ctx.html); }),
      htmlStep("Project step 3: Another sentence.", numbered(["Keep your old HTML.","Type this exactly: <p>Bring a cup.</p>","Press Show.","You should see Bring a cup"]), function (ctx) { return /Bring a cup/i.test(ctx.html); }),
      htmlStep("Project step 4: A middle heading.", numbered(["Keep your old HTML.","Type this exactly: <h2>Menu</h2>","Press Show.","You should see Menu"]), function (ctx) { return /<h2>\s*Menu\s*<\/h2>/i.test(ctx.html); }),
      htmlStep("Project step 5: Start a list.", numbered(["Keep your old HTML.","Type this exactly: <ul>","ul starts a list.","Press Show."]), function (ctx) { return /<ul/i.test(ctx.html); }),
      htmlStep("Project step 6: Add jam.", numbered(["Keep your old HTML.","Type this exactly: <li>jam</li>","Press Show.","You should see jam"]), function (ctx) { return /<li>\s*jam\s*<\/li>/i.test(ctx.html); }),
      htmlStep("Project step 7: Add juice.", numbered(["Keep your old HTML.","Type this exactly: <li>juice</li>","Press Show.","You should see juice"]), function (ctx) { return /<li>\s*juice\s*<\/li>/i.test(ctx.html); }),
      htmlStep("Project step 8: End the list.", numbered(["Keep your old HTML.","Type this exactly: </ul>","The slash / ends the list.","Press Show."]), function (ctx) { return /<\/ul>/i.test(ctx.html); }),
      htmlStep("Project step 9: A button.", numbered(["Keep your old HTML.","Type this exactly: <button>I will come</button>","Press Show.","You should see I will come"]), function (ctx) { return /<button>/i.test(ctx.html); }),
      htmlStep("Project step 10: Navy title.", numbered(["Tap the CSS tab.","Find h1 { .","Type this exactly: color: navy;","Keep the semicolon ; .","Press Show.","You should see a navy title"]), function (ctx) { return /h1[\s\S]*color\s*:\s*navy/i.test(ctx.css); }),
      htmlStep("Project step 11: Yellow page.", numbered(["Stay on the CSS tab.","Find body { .","Type this exactly: background: #fff3bf;","Keep the semicolon ; .","Press Show."]), function (ctx) { return /background\s*:\s*#fff3bf/i.test(ctx.css); }),
      htmlStep("Project step 12: Center and a border.", numbered(["Stay on the CSS tab.","Type this exactly: text-align: center;","Type this exactly: border: 3px solid teal;","Keep both semicolons ; .","Press Show.","You should see a teal border"]), function (ctx) { return /text-align\s*:\s*center/i.test(ctx.css) && /border\s*:\s*3px\s+solid\s+teal/i.test(ctx.css); })
    ],
  },
  {
    id: "poster",
    title: "Kite poster",
    blurb: "A poster about kites.",
    plan: ["Write the poster.","Name a class.","Paint the class."],
    steps: [
      htmlStep("Project step 1: Kite title.", numbered(["Start fresh in the HTML box.","Type this exactly: <h1>Kite day</h1>","Press Show.","You should see Kite day"]), function (ctx) { return /<h1>\s*Kite day/i.test(ctx.html); }),
      htmlStep("Project step 2: A kite sentence.", numbered(["Keep your old HTML.","Type this exactly: <p class=\"kite\">The kite is red.</p>","Press Show."]), function (ctx) { return /class\s*=\s*["']kite["']/i.test(ctx.html); }),
      htmlStep("Project step 3: A wind sentence.", numbered(["Keep your old HTML.","Type this exactly: <p>The wind is strong.</p>","Press Show."]), function (ctx) { return /The wind is strong/i.test(ctx.html); }),
      htmlStep("Project step 4: A small heading.", numbered(["Type this exactly: <h3>Tips</h3>","Press Show."]), function (ctx) { return /<h3>\s*Tips/i.test(ctx.html); }),
      htmlStep("Project step 5: A button.", numbered(["Type this exactly: <button>Fly</button>","Press Show."]), function (ctx) { return /<button>\s*Fly/i.test(ctx.html); }),
      htmlStep("Project step 6: Paint .kite tomato.", numbered(["Tap the CSS tab.","Type this exactly: .kite { color: tomato; }","Keep the semicolon ; .","Press Show."]), function (ctx) { return /\.kite[\s\S]*color\s*:\s*tomato/i.test(ctx.css); }),
      htmlStep("Project step 7: Bigger kite words.", numbered(["Stay in .kite.","Type this exactly: font-size: 32px;","Keep the semicolon ; .","Press Show."]), function (ctx) { return /font-size\s*:\s*32px/i.test(ctx.css); }),
      htmlStep("Project step 8: Pink page.", numbered(["In body { type this exactly: background: #ffe3e3;","Press Show."]), function (ctx) { return /background\s*:\s*#ffe3e3/i.test(ctx.css); }),
      htmlStep("Project step 9: Center the poster.", numbered(["Type this exactly: text-align: center;","Press Show."]), function (ctx) { return /text-align\s*:\s*center/i.test(ctx.css); }),
      htmlStep("Project step 10: Outside space.", numbered(["Type this exactly: margin: 16px;","margin is space outside.","Press Show."]), function (ctx) { return /margin\s*:\s*16px/i.test(ctx.css); }),
      htmlStep("Project step 11: Inside space.", numbered(["Type this exactly: padding: 12px;","padding is space inside.","Press Show."]), function (ctx) { return /padding\s*:\s*12px/i.test(ctx.css); }),
      htmlStep("Project step 12: A pink border.", numbered(["Type this exactly: border: 4px solid pink;","Keep the semicolon ; .","Press Show."]), function (ctx) { return /border\s*:\s*4px\s+solid\s+pink/i.test(ctx.css); })
    ],
  },
  {
    id: "invite",
    title: "Beach invite",
    blurb: "Invite friends to the blanket.",
    plan: ["Write the invite.","List snacks.","Style the page."],
    steps: [
      htmlStep("Project step 1: Invite title.", numbered(["Start fresh in HTML.","Type this exactly: <h1>Beach invite</h1>","Press Show."]), function (ctx) { return /<h1>\s*Beach invite/i.test(ctx.html); }),
      htmlStep("Project step 2: When.", numbered(["Type this exactly: <p>Sunday at noon.</p>","Press Show."]), function (ctx) { return /Sunday at noon/i.test(ctx.html); }),
      htmlStep("Project step 3: Who.", numbered(["Type this exactly: <p>All friends can come.</p>","Press Show."]), function (ctx) { return /All friends can come/i.test(ctx.html); }),
      htmlStep("Project step 4: Snacks heading.", numbered(["Type this exactly: <h2>Snacks</h2>","Press Show."]), function (ctx) { return /<h2>\s*Snacks/i.test(ctx.html); }),
      htmlStep("Project step 5: List.", numbered(["Type this exactly: <ul>","Press Show."]), function (ctx) { return /<ul/i.test(ctx.html); }),
      htmlStep("Project step 6: Crackers.", numbered(["Type this exactly: <li>crackers</li>","Press Show."]), function (ctx) { return /<li>\s*crackers/i.test(ctx.html); }),
      htmlStep("Project step 7: Grapes.", numbered(["Type this exactly: <li>grapes</li>","Press Show."]), function (ctx) { return /<li>\s*grapes/i.test(ctx.html); }),
      htmlStep("Project step 8: End list.", numbered(["Type this exactly: </ul>","Press Show."]), function (ctx) { return /<\/ul>/i.test(ctx.html); }),
      htmlStep("Project step 9: Button.", numbered(["Type this exactly: <button>Count me in</button>","Press Show."]), function (ctx) { return /Count me in/i.test(ctx.html); }),
      htmlStep("Project step 10: Purple title.", numbered(["In h1 { type this exactly: color: purple;","Keep the semicolon ; .","Press Show."]), function (ctx) { return /color\s*:\s*purple/i.test(ctx.css); }),
      htmlStep("Project step 11: Width and padding.", numbered(["Type this exactly: width: 280px;","Type this exactly: padding: 14px;","Keep both semicolons ; .","Press Show."]), function (ctx) { return /width\s*:\s*280px/i.test(ctx.css) && /padding\s*:\s*14px/i.test(ctx.css); }),
      htmlStep("Project step 12: Purple border.", numbered(["Type this exactly: border: 2px solid purple;","Press Show."]), function (ctx) { return /border\s*:\s*2px\s+solid\s+purple/i.test(ctx.css); })
    ],
  }
];

const advancedIdeas = [
  {
    id: "cardstyle",
    title: "Styled picnic card",
    blurb: "A card that mixes a class, size, and a border.",
    plan: ["Build the words.","Name a class.","Style two things at once."],
    steps: [
      htmlStep("Advanced step 1: Title.", numbered(["Start fresh.","Type this exactly: <h1>My picnic</h1>","Press Show."]), function (ctx) { return /<h1>/i.test(ctx.html); }),
      htmlStep("Advanced step 2: Class sentence.", numbered(["Type this exactly: <p class=\"fun\">Blanket crew</p>","Press Show."]), function (ctx) { return /class\s*=\s*["']fun["']/i.test(ctx.html); }),
      htmlStep("Advanced step 3: Paint and size .fun.", numbered(["Type this exactly: .fun { color: teal; font-size: 26px; }","Keep both semicolons ; .","Press Show."]), function (ctx) { return /\.fun[\s\S]*color\s*:\s*teal/i.test(ctx.css) && /font-size\s*:\s*26px/i.test(ctx.css); }),
      htmlStep("Advanced step 4: A heading and a button.", numbered(["Type this exactly: <h2>Bring</h2>","Type this exactly: <button>Pack</button>","Press Show."]), function (ctx) { return /<h2>/i.test(ctx.html) && /<button>/i.test(ctx.html); }),
      htmlStep("Advanced step 5: Page color and center.", numbered(["Type this exactly: background: #d3f9d8;","Type this exactly: text-align: center;","Press Show."]), function (ctx) { return /background\s*:\s*#d3f9d8/i.test(ctx.css) && /text-align\s*:\s*center/i.test(ctx.css); }),
      htmlStep("Advanced step 6: Space and a border.", numbered(["Type this exactly: padding: 16px;","Type this exactly: border: 2px solid teal;","Press Show."]), function (ctx) { return /padding\s*:\s*16px/i.test(ctx.css) && /border\s*:/i.test(ctx.css); })
    ],
  },
  {
    id: "neonposter",
    title: "Night kite poster",
    blurb: "A darker poster with a bright title.",
    plan: ["Write two sentences.","Paint a dark page.","Add a bright border."],
    steps: [
      htmlStep("Advanced step 1: Night title.", numbered(["Start fresh.","Type this exactly: <h1>Night kite</h1>","Press Show."]), function (ctx) { return /Night kite/i.test(ctx.html); }),
      htmlStep("Advanced step 2: Two sentences.", numbered(["Type this exactly: <p>Glow on.</p>","Type this exactly: <p>Hold the string.</p>","Press Show."]), function (ctx) { return (ctx.html.match(/<p[\s>]/gi) || []).length >= 2; }),
      htmlStep("Advanced step 3: Dark page, pink title.", numbered(["Type this exactly: background: #222;","Type this exactly: color: pink;","Keep the semicolons ; .","Press Show."]), function (ctx) { return /background\s*:\s*#222/i.test(ctx.css) && /color\s*:\s*pink/i.test(ctx.css); }),
      htmlStep("Advanced step 4: Huge centered letters.", numbered(["Type this exactly: font-size: 40px;","Type this exactly: text-align: center;","Press Show."]), function (ctx) { return /font-size\s*:\s*40px/i.test(ctx.css) && /text-align\s*:\s*center/i.test(ctx.css); }),
      htmlStep("Advanced step 5: A button and a box.", numbered(["Type this exactly: <button>Glow</button>","Type this exactly: <div>Night sand</div>","Press Show."]), function (ctx) { return /<button>/i.test(ctx.html) && /<div>/i.test(ctx.html); }),
      htmlStep("Advanced step 6: Width and pink border.", numbered(["Type this exactly: width: 300px;","Type this exactly: border: 4px solid pink;","Press Show."]), function (ctx) { return /width\s*:\s*300px/i.test(ctx.css) && /border\s*:\s*4px\s+solid\s+pink/i.test(ctx.css); })
    ],
  },
  {
    id: "zoo",
    title: "Shell museum",
    blurb: "A list of shells with layout colors.",
    plan: ["Name the museum.","List three shells.","Style the list."],
    steps: [
      htmlStep("Advanced step 1: Museum title.", numbered(["Start fresh.","Type this exactly: <h1>Shell museum</h1>","Press Show."]), function (ctx) { return /Shell museum/i.test(ctx.html); }),
      htmlStep("Advanced step 2: Three shells.", numbered(["Type this exactly: <ul>","Type this exactly: <li>clam</li>","Type this exactly: <li>conch</li>","Type this exactly: <li>olive</li>","Type this exactly: </ul>","Press Show."]), function (ctx) { return /clam/i.test(ctx.html) && /conch/i.test(ctx.html) && /olive/i.test(ctx.html) && /<\/ul>/i.test(ctx.html); }),
      htmlStep("Advanced step 3: A note.", numbered(["Type this exactly: <p class=\"note\">Please do not take shells.</p>","Press Show."]), function (ctx) { return /class\s*=\s*["']note["']/i.test(ctx.html); }),
      htmlStep("Advanced step 4: Paint the note and the page.", numbered(["Type this exactly: .note { color: navy; font-size: 18px; }","Type this exactly: background: #dff6ff;","Keep the semicolons ; .","Press Show."]), function (ctx) { return /\.note[\s\S]*color\s*:\s*navy/i.test(ctx.css) && /background\s*:/i.test(ctx.css); }),
      htmlStep("Advanced step 5: Margin and padding.", numbered(["Type this exactly: margin: 14px;","Type this exactly: padding: 10px;","Press Show."]), function (ctx) { return /margin\s*:\s*14px/i.test(ctx.css) && /padding\s*:\s*10px/i.test(ctx.css); }),
      htmlStep("Advanced step 6: A navy border.", numbered(["Type this exactly: border: 2px solid navy;","Press Show."]), function (ctx) { return /border\s*:\s*2px\s+solid\s+navy/i.test(ctx.css); })
    ],
  }
];

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
  taskGoal.textContent = window.CodeReefGuide
    ? CodeReefGuide.instruction(tasks[taskIndex].goal, tasks[taskIndex].help)
    : tasks[taskIndex].goal;
  setTip(
    window.CodeReefGuide
      ? CodeReefGuide.startHint(tasks[taskIndex].goal, tasks[taskIndex].help, "Show")
      : "Do the task, then press Show. Tap Help if you get stuck."
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
