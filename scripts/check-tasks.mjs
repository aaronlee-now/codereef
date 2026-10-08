/**
 * Skill-task checker audit.
 * Lesson files are browser scripts, so this loads them in a vm with a tiny DOM
 * stub and calls each task's real check(). It does not import them as modules.
 *
 * Prints FAIL lines only. Exit 0 when every language passes.
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const CODE_LANGS = [
  { name: "python", file: "python.js", run: "runTinyPython" },
  { name: "javascript", file: "javascript.js", run: "runKidJs" },
  { name: "go", file: "go.js", run: "runTinyGo" },
  { name: "java", file: "java.js", run: "runTinyJava" },
  { name: "cpp", file: "cpp.js", run: "runTinyCpp" },
  { name: "assembly", file: "assembly.js", run: "runTinyAsm" },
];

function makeEl() {
  const el = {
    value: "",
    textContent: "",
    hidden: false,
    srcdoc: "",
    width: 800,
    height: 600,
    clientWidth: 800,
    clientHeight: 600,
    style: {},
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() {
        return false;
      },
    },
    addEventListener() {},
    removeAttribute() {},
    setAttribute() {},
    getAttribute() {
      return "";
    },
    getContext() {
      const grad = { addColorStop() {} };
      return new Proxy(
        {},
        {
          get() {
            return () => grad;
          },
        }
      );
    },
  };
  return el;
}

function loadLesson(file, footer) {
  const code = fs.readFileSync(path.join(root, file), "utf8") + "\n" + footer;
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    getCurrentUser() {
      return { name: "kid" };
    },
    CodeReefProject: {
      attach() {
        return {
          isHandlingTasks() {
            return false;
          },
          getPhase() {
            return "";
          },
          showHelp() {
            return false;
          },
          handleNext() {
            return false;
          },
          guardElement() {},
          resumeIfNeeded() {
            return false;
          },
          beginFinal() {},
          tryCheck() {},
        };
      },
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = {
    getElementById() {
      return makeEl();
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
  };
  sandbox.window.addEventListener = function () {};
  sandbox.window.requestAnimationFrame = function () {};
  sandbox.window.location = { href: "http://local/lesson" };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  return sandbox.__audit;
}

const codeFooter = `
globalThis.__audit = {
  tasks: tasks,
  starter: typeof starterCode !== "undefined" ? starterCode : "",
  codeBox: codeBox,
  run: function (src) {
    if (typeof runTinyPython === "function") return runTinyPython(src);
    if (typeof runKidJs === "function") return runKidJs(src);
    if (typeof runTinyGo === "function") return runTinyGo(src);
    if (typeof runTinyJava === "function") return runTinyJava(src);
    if (typeof runTinyCpp === "function") return runTinyCpp(src);
    if (typeof runTinyAsm === "function") return runTinyAsm(src);
    throw new Error("no runner");
  },
  setOutput: function (text) { lastOutput = text; },
};
`;

function helpLines(help) {
  return String(help || "").split(/\n+/).map(function (line) {
    return line.replace(/^\d+\.\s*/, "").trim();
  }).filter(Boolean);
}

function exactSnippets(help) {
  const out = [];
  helpLines(help).forEach(function (line) {
    const m = line.match(/^Type this exactly:\s*(.+)$/);
    if (m) out.push(m[1].trim());
    const look = line.match(/^The line should look like this:\s*(.+)$/);
    if (look) out.push(look[1].trim());
  });
  return out;
}

function isWordChange(help) {
  const text = String(help || "");
  return /Click on the word/.test(text) && /The line should look like this:/.test(text);
}

function programFromHelp(task) {
  const steps = helpLines(task.help);
  if (isWordChange(task.help)) {
    for (let i = steps.length - 1; i >= 0; i -= 1) {
      const look = steps[i].match(/^The line should look like this:\s*(.+)$/);
      if (look) return look[1].trim() + "\n";
    }
  }
  const lines = [];
  let indent = "";
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    const spaces = step.match(/^Press the space bar (\d+) times/);
    if (spaces) indent = " ".repeat(Number(spaces[1]));
    if (/starts at the left edge/.test(step)) indent = "";
    const exact = step.match(/^Type this exactly:\s*(.+)$/);
    if (exact) lines.push(indent + exact[1].trim());
  }
  if (!lines.length) return "";
  return lines.join("\n") + "\n";
}

function codeFromHelp(task, starter, kept) {
  const fromHelp = programFromHelp(task);
  if (isWordChange(task.help)) {
    return fromHelp || task.sample || starter || "";
  }
  if (task.fresh) {
    return fromHelp || task.sample || "";
  }
  const base = kept && String(kept).trim() ? String(kept).replace(/\s*$/, "\n") : String(starter || "");
  const extra = fromHelp || task.sample || "";
  if (!extra.trim()) return base;
  if (base.indexOf(extra.trim()) !== -1) return base;
  return base.replace(/\s*$/, "\n") + extra;
}

function applyCode(audit, source) {
  let output = "";
  let error = "";
  try {
    output = audit.run(source);
  } catch (err) {
    error = err && err.message ? err.message : String(err);
    output = "";
  }
  audit.codeBox.value = source;
  audit.setOutput(output);
  return { output: output, error: error };
}

function wrongAccepted(task, audit) {
  audit.codeBox.value = "zzzz-not-the-answer";
  audit.setOutput("zzzz-not-the-answer");
  try {
    return !!task.check();
  } catch (err) {
    return false;
  }
}

function checkCodeLang(lang) {
  const fails = [];
  let audit;
  try {
    audit = loadLesson(lang.file, codeFooter);
  } catch (err) {
    fails.push("FAIL " + lang.name + " load: " + (err && err.message ? err.message : err));
    return { checked: 0, fails: fails };
  }
  const tasks = audit.tasks || [];
  if (tasks.length !== 100) {
    fails.push("FAIL " + lang.name + " count: expected 100 tasks, got " + tasks.length);
  }
  let kept = audit.starter || "";
  for (let i = 0; i < tasks.length; i += 1) {
    const task = tasks[i];
    const source = codeFromHelp(task, audit.starter, kept);
    if (task.fresh || isWordChange(task.help)) {
      kept = source;
    } else {
      kept = source;
    }
    const ran = applyCode(audit, source);
    let ok = false;
    try {
      ok = !!task.check();
    } catch (err) {
      fails.push(
        "FAIL " + lang.name + " task " + (i + 1) + ": " + task.goal + " — check threw " + err.message
      );
      continue;
    }
    if (!ok) {
      const why = ran.error ? "runner: " + ran.error : "output: " + JSON.stringify(ran.output);
      fails.push("FAIL " + lang.name + " task " + (i + 1) + ": " + task.goal + " — " + why);
    } else if (wrongAccepted(task, audit)) {
      fails.push(
        "FAIL " + lang.name + " task " + (i + 1) + ": " + task.goal + " — wrong answer was accepted"
      );
    }
  }
  return { checked: tasks.length, fails: fails };
}

function isCssSnippet(text) {
  const t = String(text || "").trim();
  if (t.startsWith("<")) return false;
  return /[{};:]/.test(t) || t.startsWith(".");
}

function placeCss(css, snippet, help) {
  const line = snippet.trim();
  if (/^[\.a-zA-Z#][^{]*\{/.test(line)) {
    return css.replace(/\s*$/, "\n") + line + "\n";
  }
  const prop = line.match(/^([a-z-]+)\s*:/i);
  const rule = String(help || "").match(/Find\s+(\.[a-z0-9_-]+|body|h1|h2|h3)\s*\{/i);
  if (prop && rule) {
    const name = rule[1];
    const re = new RegExp("(" + name.replace(".", "\\.") + "\\s*\\{)([^}]*)(\\})", "i");
    if (re.test(css)) {
      return css.replace(re, function (_all, open, body, close) {
        const propRe = new RegExp("(^|\\n)(\\s*)" + prop[1] + "\\s*:[^;\\n]*;?", "i");
        if (propRe.test(body)) {
          return open + body.replace(propRe, "$1$2" + line.replace(/;$/, "") + ";") + close;
        }
        return open + body.replace(/\s*$/, "\n  ") + line.replace(/;$/, "") + ";\n" + close;
      });
    }
  }
  if (prop && /body\s*\{/.test(css)) {
    return css.replace(/(body\s*\{)([^}]*)(\})/i, function (_all, open, body, close) {
      return open + body.replace(/\s*$/, "\n  ") + line.replace(/;$/, "") + ";\n" + close;
    });
  }
  return css.replace(/\s*$/, "\n") + line + "\n";
}

function checkHtml() {
  const fails = [];
  const footer = `
globalThis.__audit = {
  tasks: tasks,
  starterHtml: starterHtml,
  starterCss: starterCss,
  htmlCode: htmlCode,
  cssCode: cssCode,
};
`;
  let audit;
  try {
    audit = loadLesson("htmlcss.js", footer);
  } catch (err) {
    fails.push("FAIL htmlcss load: " + (err && err.message ? err.message : err));
    return { checked: 0, fails: fails };
  }
  const tasks = audit.tasks || [];
  if (tasks.length !== 100) {
    fails.push("FAIL htmlcss count: expected 100 tasks, got " + tasks.length);
  }
  let html = audit.starterHtml;
  let css = audit.starterCss;
  for (let i = 0; i < tasks.length; i += 1) {
    const task = tasks[i];
    const help = String(task.help || "");
    if (/Start fresh in the HTML/.test(help)) html = "";
    const snippets = exactSnippets(help);
    if (isWordChange(help) && snippets.length) {
      const line = snippets[snippets.length - 1];
      if (line.startsWith("<")) html = line + "\n";
    }
    snippets.forEach(function (snippet) {
      if (isWordChange(help) && snippet.startsWith("<")) return;
      if (isCssSnippet(snippet)) css = placeCss(css, snippet, help);
      else html = html.replace(/\s*$/, "\n") + snippet + "\n";
    });
    audit.htmlCode.value = html;
    audit.cssCode.value = css;
    let ok = false;
    try {
      ok = !!task.check();
    } catch (err) {
      fails.push("FAIL htmlcss task " + (i + 1) + ": " + task.goal + " — check threw " + err.message);
      continue;
    }
    if (!ok) {
      fails.push("FAIL htmlcss task " + (i + 1) + ": " + task.goal + " — intended HTML/CSS did not pass");
    } else {
      audit.htmlCode.value = "<p>zzzz-not-the-answer</p>";
      audit.cssCode.value = "zzzz { color: zzzz; }";
      let loose = false;
      try {
        loose = !!task.check();
      } catch (err) {
        loose = false;
      }
      if (loose) {
        fails.push("FAIL htmlcss task " + (i + 1) + ": " + task.goal + " — wrong answer was accepted");
      }
      audit.htmlCode.value = html;
      audit.cssCode.value = css;
    }
  }
  return { checked: tasks.length, fails: fails };
}

const MOVE_MAX = 8;

function realizeBlocks(actions) {
  const out = [];
  let usedRepeat = false;
  (actions || []).forEach(function (action) {
    const type = action.type;
    const steps = Number(action.steps) || 1;
    const isMove = String(type || "").indexOf("move_") === 0;
    if (isMove && steps > MOVE_MAX) {
      // One move block stops at 8. The help uses repeat 3 times of 7 steps.
      usedRepeat = true;
      let produced = 0;
      while (produced < steps) {
        out.push({ type: type, steps: 7 });
        produced += 7;
      }
    } else if (!isMove && type !== "wait_block" && steps > 1) {
      for (let n = 0; n < steps; n += 1) out.push({ type: type, steps: 1 });
    } else {
      out.push({ type: type, steps: isMove ? Math.min(steps, MOVE_MAX) : steps });
    }
  });
  return { actions: out, usedRepeat: usedRepeat };
}

function checkBlocks() {
  const fails = [];
  const footer = `
globalThis.__audit = {
  tasks: tasks,
  setRepeat: function (on) {
    workspace = on ? { getAllBlocks: function () { return [{ type: "repeat_block" }]; } } : { getAllBlocks: function () { return []; } };
  },
};
`;
  let audit;
  try {
    audit = loadLesson("blocks.js", footer);
  } catch (err) {
    fails.push("FAIL blocks load: " + (err && err.message ? err.message : err));
    return { checked: 0, fails: fails };
  }
  const tasks = audit.tasks || [];
  if (tasks.length !== 100) {
    fails.push("FAIL blocks count: expected 100 tasks, got " + tasks.length);
  }
  let haveRepeat = false;
  for (let i = 0; i < tasks.length; i += 1) {
    const task = tasks[i];
    const help = String(task.help || "");
    if (/repeat/i.test(help)) haveRepeat = true;
    const realized = realizeBlocks(task.sampleActions || []);
    if (realized.usedRepeat) haveRepeat = true;
    audit.setRepeat(haveRepeat);
    let ok = false;
    try {
      ok = !!task.check(realized.actions);
    } catch (err) {
      fails.push("FAIL blocks task " + (i + 1) + ": " + task.goal + " — check threw " + err.message);
      continue;
    }
    if (!ok) {
      fails.push(
        "FAIL blocks task " +
          (i + 1) +
          ": " +
          task.goal +
          " — intended blocks did not pass " +
          JSON.stringify(realized.actions)
      );
    } else {
      audit.setRepeat(false);
      let loose = false;
      try {
        loose = !!task.check([]);
      } catch (err) {
        loose = false;
      }
      if (loose) {
        fails.push("FAIL blocks task " + (i + 1) + ": " + task.goal + " — wrong answer was accepted");
      }
      audit.setRepeat(haveRepeat);
    }
  }
  return { checked: tasks.length, fails: fails };
}

const results = [];
for (const lang of CODE_LANGS) {
  results.push({ name: lang.name, ...checkCodeLang(lang) });
}
results.push({ name: "blocks", ...checkBlocks() });
results.push({ name: "htmlcss", ...checkHtml() });

let totalFails = 0;
for (const result of results) {
  totalFails += result.fails.length;
  for (const line of result.fails) console.log(line);
}
process.exit(totalFails === 0 ? 0 : 1);
