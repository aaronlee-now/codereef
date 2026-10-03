// Shared final + advanced project flow for CodeReef lessons.
// Each path calls CodeReefProject.attach(...) once, then
// CodeReefProject.beginFinal() after the last skill task.

(function (global) {
  "use strict";

  var active = null;

  function kidName() {
    var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user || !user.kidName) {
      return "guest";
    }
    if (typeof normalizeName === "function") {
      return normalizeName(user.kidName);
    }
    return String(user.kidName).trim().toLowerCase();
  }

  function storageKey(pathKey) {
    return "codereef_project_" + kidName() + "_" + pathKey;
  }

  function loadProgress(pathKey) {
    var raw = localStorage.getItem(storageKey(pathKey));
    if (!raw) {
      return {
        phase: "skills",
        ideaId: null,
        customTitle: "",
        stepIndex: 0,
        advancedUnlocked: false,
        advancedIdeaId: null,
        advancedStepIndex: 0,
        finalDone: false,
        advancedDone: false,
      };
    }
    try {
      var data = JSON.parse(raw);
      return {
        phase: data.phase || "skills",
        ideaId: data.ideaId || null,
        customTitle: data.customTitle || "",
        stepIndex: typeof data.stepIndex === "number" ? data.stepIndex : 0,
        advancedUnlocked: !!data.advancedUnlocked,
        advancedIdeaId: data.advancedIdeaId || null,
        advancedStepIndex:
          typeof data.advancedStepIndex === "number" ? data.advancedStepIndex : 0,
        finalDone: !!data.finalDone,
        advancedDone: !!data.advancedDone,
      };
    } catch (err) {
      return {
        phase: "skills",
        ideaId: null,
        customTitle: "",
        stepIndex: 0,
        advancedUnlocked: false,
        advancedIdeaId: null,
        advancedStepIndex: 0,
        finalDone: false,
        advancedDone: false,
      };
    }
  }

  function saveProgress() {
    if (!active) {
      return;
    }
    localStorage.setItem(
      storageKey(active.pathKey),
      JSON.stringify({
        phase: active.phase,
        ideaId: active.ideaId,
        customTitle: active.customTitle,
        stepIndex: active.stepIndex,
        advancedUnlocked: active.advancedUnlocked,
        advancedIdeaId: active.advancedIdeaId,
        advancedStepIndex: active.advancedStepIndex,
        finalDone: active.finalDone,
        advancedDone: active.advancedDone,
      })
    );
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function removeOverlay() {
    var old = document.getElementById("codereef-project");
    if (old) {
      old.remove();
    }
  }

  function showNextButton(show, label) {
    if (!active || !active.nextBtn) {
      return;
    }
    var btn = active.nextBtn;
    if (label) {
      btn.textContent = label;
    }
    if (show) {
      btn.hidden = false;
      btn.removeAttribute("hidden");
    } else {
      btn.hidden = true;
      btn.setAttribute("hidden", "");
    }
  }

  function setTip(text) {
    if (active && typeof active.setTip === "function") {
      active.setTip(text);
    }
  }

  function renderStepDots() {
    if (!active || !active.taskBar) {
      return;
    }
    var bar = document.getElementById("project-step-bar");
    var steps = getCurrentSteps();
    if (!steps || steps.length === 0 || active.phase !== "building") {
      if (bar) {
        bar.remove();
      }
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "project-step-bar";
      bar.className = "project-step-bar";
      bar.setAttribute("aria-hidden", "true");
      active.taskBar.insertAdjacentElement("afterend", bar);
    }
    var idx = getCurrentStepIndex();
    var html = "";
    var i;
    for (i = 0; i < steps.length; i += 1) {
      var cls = "project-step-dot";
      if (i < idx) {
        cls += " is-done";
      } else if (i === idx) {
        cls += " is-current";
      }
      html += '<span class="' + cls + '"></span>';
    }
    bar.innerHTML = html;
  }

  function getIdeaList(isAdvanced) {
    return isAdvanced ? active.advancedIdeas || [] : active.ideas || [];
  }

  function findIdea(id, isAdvanced) {
    var list = getIdeaList(isAdvanced);
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].id === id) {
        return list[i];
      }
    }
    return null;
  }

  function makeCustomIdea(title, isAdvanced) {
    var verb = active.actionLabel || "Run";
    var name = title && title.trim() ? title.trim() : "My reef project";
    var printWord =
      active.pathKey === "javascript"
        ? "console.log"
        : active.pathKey === "blocks"
          ? "say or move"
          : active.pathKey === "htmlcss"
            ? "HTML text"
            : "print";

    if (isAdvanced) {
      return {
        id: "custom-advanced",
        title: name,
        blurb: "Your own advanced idea!",
        plan: [
          "Clear space and write a title line for " + name + ".",
          "Add a variable (or a name box) that stores something cool.",
          "Use a loop or repeat so something happens more than once.",
          "Show a final victory message.",
        ],
        steps: [
          {
            goal: "Advanced step 1: Print or show a title for your project.",
            help:
              "1. Start fresh. That means erase the old code.\n\n" +
              "2. Click in the code box.\n\n" +
              "3. Highlight the old code.\n\n" +
              "4. Press the Delete key.\n\n" +
              "5. Make " +
              printWord +
              " show a title.\n\n" +
              "6. The title should mention your idea.\n\n" +
              "7. Press the " +
              verb +
              " button. It is at the top.",
            check: function (ctx) {
              return outputHasAny(ctx, [name.toLowerCase(), "advanced", "project", "reef"]);
            },
          },
          {
            goal: "Advanced step 2: Use a variable (or named value).",
            help:
              "1. Keep your old code. Do not erase it.\n\n" +
              "2. Click in the code box.\n\n" +
              "3. Click at the end of the last line.\n\n" +
              "4. Press the Enter key. That starts a new line.\n\n" +
              "5. Add a variable. A variable is a name that remembers something.\n\n" +
              "6. Then show that name on the screen.\n\n" +
              "7. Press the " +
              verb +
              " button. It is at the top.",
            check: function (ctx) {
              return codeLooksLikeVariable(ctx);
            },
          },
          {
            goal: "Advanced step 3: Use a loop or repeat.",
            help:
              "1. Keep your old code. Do not erase it.\n\n" +
              "2. Click at the end of the last line.\n\n" +
              "3. Press the Enter key. That starts a new line.\n\n" +
              "4. Add a loop. A loop means do something again and again.\n\n" +
              "5. On Block Coding, use a Repeat block instead.\n\n" +
              "6. Press the " +
              verb +
              " button. It is at the top.",
            check: function (ctx) {
              return codeLooksLikeLoop(ctx);
            },
          },
        ],
      };
    }

    return {
      id: "custom",
      title: name,
      blurb: "Your own idea!",
      plan: [
        "Start with a welcome line about " + name + ".",
        "Add one more line that tells a fun fact.",
        "Use a variable (or a name) if you can.",
      ],
      steps: [
        {
          goal: "Project step 1: Show a welcome line for your idea.",
          help:
            "1. Start fresh. That means erase the old code.\n\n" +
            "2. Click in the code box.\n\n" +
            "3. Highlight the old code.\n\n" +
            "4. Press the Delete key.\n\n" +
            "5. Make " +
            printWord +
            " say something about your idea.\n\n" +
            "6. Press the " +
            verb +
            " button. It is at the top.",
          check: function (ctx) {
            return (
              outputHasAny(ctx, [name.toLowerCase(), "hello", "welcome", "reef", "ocean"]) ||
              (ctx.output && String(ctx.output).trim().length > 0)
            );
          },
        },
        {
          goal: "Project step 2: Add a second line of text.",
          help:
            "1. Keep your old code. Do not erase it.\n\n" +
            "2. Click at the end of the last line.\n\n" +
            "3. Press the Enter key. That starts a new line.\n\n" +
            "4. Add one more line that shows words.\n\n" +
            "5. Press the " +
            verb +
            " button. It is at the top.",
          check: function (ctx) {
            var lines = normalizeOut(ctx.output).split("\n").filter(Boolean);
            return lines.length >= 2 || (ctx.actions && ctx.actions.length >= 2);
          },
        },
        {
          goal: "Project step 3: Use a variable or named value (or say something new).",
          help:
            "1. Keep your old code. Do not erase it.\n\n" +
            "2. Click at the end of the last line.\n\n" +
            "3. Press the Enter key. That starts a new line.\n\n" +
            "4. Add a variable if you can. A variable is a name that remembers something.\n\n" +
            "5. Or add one more fun line.\n\n" +
            "6. Press the " +
            verb +
            " button. It is at the top.",
          check: function (ctx) {
            return (
              codeLooksLikeVariable(ctx) ||
              outputHasAny(ctx, ["fish", "name", "score", "fun", "love"]) ||
              (ctx.output && normalizeOut(ctx.output).split("\n").filter(Boolean).length >= 3)
            );
          },
        },
      ],
    };
  }

  function normalizeOut(text) {
    return String(text || "")
      .replace(/\r/g, "")
      .trim()
      .toLowerCase();
  }

  function outputHasAny(ctx, needles) {
    var out = normalizeOut(ctx && ctx.output);
    if (!out) {
      // htmlcss may check code instead
      out = normalizeOut(ctx && ctx.code);
    }
    var i;
    for (i = 0; i < needles.length; i += 1) {
      if (needles[i] && out.indexOf(String(needles[i]).toLowerCase()) !== -1) {
        return true;
      }
    }
    return false;
  }

  function codeLooksLikeVariable(ctx) {
    var code = String((ctx && ctx.code) || "").toLowerCase();
    if (
      /(?:let|var|const|string|int)\s+\w+\s*=/.test(code) ||
      /\w+\s*:=\s*/.test(code) ||
      /\w+\s*=\s*["']/.test(code) ||
      /mov\s+\w+\s*,/i.test(code)
    ) {
      return true;
    }
    if (ctx && ctx.html && /class\s*=/.test(String(ctx.html))) {
      return true;
    }
    return false;
  }

  function codeLooksLikeLoop(ctx) {
    var code = String((ctx && ctx.code) || "").toLowerCase();
    if (/for\s*\(/.test(code) || /for\s+\w+\s+in\s+range/.test(code) || /repeat\s+\d+/.test(code)) {
      return true;
    }
    if (ctx && ctx.usedRepeat) {
      return true;
    }
    return false;
  }

  function getCurrentIdea() {
    if (!active) {
      return null;
    }
    if (active.buildingAdvanced) {
      if (active.advancedIdeaId === "custom-advanced") {
        return makeCustomIdea(active.customTitle, true);
      }
      return findIdea(active.advancedIdeaId, true);
    }
    if (active.ideaId === "custom") {
      return makeCustomIdea(active.customTitle, false);
    }
    return findIdea(active.ideaId, false);
  }

  function getCurrentSteps() {
    var idea = getCurrentIdea();
    return idea && idea.steps ? idea.steps : [];
  }

  function getCurrentStepIndex() {
    if (!active) {
      return 0;
    }
    return active.buildingAdvanced ? active.advancedStepIndex : active.stepIndex;
  }

  function setCurrentStepIndex(n) {
    if (!active) {
      return;
    }
    if (active.buildingAdvanced) {
      active.advancedStepIndex = n;
    } else {
      active.stepIndex = n;
    }
  }

  function getActiveStep() {
    var steps = getCurrentSteps();
    var idx = getCurrentStepIndex();
    return steps[idx] || null;
  }

  // During a project, some code has to stay. Each step can set keep
  // (a string or a list of strings). If keep is missing, we read the
  // code sample out of that step's help text.
  var KEEP_NOTE = "Don't delete that part — you still need it.";

  function emptySaved() {
    return { code: [], html: [], css: [], blocks: [] };
  }

  function linesOf(text) {
    return String(text || "")
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return line.length > 0;
      });
  }

  function squash(text) {
    return String(text || "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function containsPiece(hay, piece) {
    var bit = squash(piece);
    if (!bit) {
      return true;
    }
    return squash(hay).indexOf(bit) !== -1;
  }

  function uniquePush(list, item) {
    if (!item || list.indexOf(item) !== -1) {
      return;
    }
    list.push(item);
  }

  function allowsFreshStart(step) {
    return /delete the old code|start fresh/i.test((step && step.help) || "");
  }

  function slotText(parts, slot) {
    if (!parts) {
      return "";
    }
    if (slot === "html") {
      return parts.html || "";
    }
    if (slot === "css") {
      return parts.css || "";
    }
    return parts.code || "";
  }

  function slotForSnippet(piece) {
    var text = String(piece || "");
    if (/<\s*\/?\s*[a-z]/i.test(text)) {
      return "html";
    }
    if (
      /background\s*:|font-size\s*:|^\s*\.[a-z0-9_-]+\s*\{/i.test(text) ||
      (/color\s*:/i.test(text) && text.indexOf("<") === -1)
    ) {
      return "css";
    }
    return "code";
  }

  function acceptPiece(piece) {
    if (/[="'()<>{}:]/.test(piece)) {
      return true;
    }
    if (/^(?:PRINT|MOV)\s+[A-Za-z_]\w*$/i.test(piece)) {
      return !/^(?:PRINT|MOV)\s+(?:under|another|a|the|your|it|line|lines)$/i.test(piece);
    }
    return false;
  }

  function guessSnippets(help) {
    var text = String(help || "");
    var found = [];
    function add(piece) {
      var bit = String(piece || "")
        .trim()
        .replace(/[.,]$/, "");
      if (!bit || bit.length > 220 || !acceptPiece(bit)) {
        return;
      }
      if (found.indexOf(bit) === -1) {
        found.push(bit);
      }
    }
    var patterns = [
      /print\s*\((?:[^)(]|\([^)]*\))*\)/gi,
      /console\.log\s*\((?:[^)(]|\([^)]*\))*\)/gi,
      /fmt\.Println\s*\((?:[^)(]|\([^)]*\))*\)/gi,
      /System\.out\.println\s*\((?:[^)(]|\([^)]*\))*\)/gi,
      /cout\s*<<[^;\n]+;/gi,
      /<\/?[a-zA-Z][^>\n]*>[^<\n]*<\/[a-zA-Z][^>\n]*>/g,
      /(?:let|var|const|string|String)\s+\w+\s*=\s*[^;\n]+;?/gi,
      /\b[A-Za-z_]\w*\s*:?=\s*["'][^"'\n]+["']/g,
      /\bMOV\s+\w+\s*,\s*["'][^"'\n]+["']/gi,
      /\bPRINT\s+["'][^"'\n]+["']/gi,
      /\bPRINT\s+[A-Za-z_]\w*/g,
      /\bfor\s+\w+\s+in\s+range\s*\([^)]*\)\s*:/gi,
      /\bfor\s*\([^)\n]*\)\s*\{?/gi,
      /\breturn\s+[^;\n]+;?/gi,
      /\bfunction\s+\w+\s*\([^)]*\)\s*\{/gi,
      /\.[A-Za-z_-]+\s*\{[^}]+\}/g,
      /background\s*:\s*[^;]+;/gi,
      /font-size\s*:\s*[^;]+;/gi,
      /color\s*:\s*[^;]+;/gi,
    ];
    var p;
    for (p = 0; p < patterns.length; p += 1) {
      var match;
      var re = new RegExp(patterns[p].source, patterns[p].flags);
      while ((match = re.exec(text))) {
        add(match[0]);
      }
    }
    return found;
  }

  function snippetsFromStep(step) {
    if (!step) {
      return [];
    }
    var raw = step.keep;
    var listed = [];
    var n;
    if (typeof raw === "string" && raw.trim()) {
      listed = [raw.trim()];
    } else if (raw && typeof raw.length === "number") {
      for (n = 0; n < raw.length; n += 1) {
        if (raw[n]) {
          listed.push(String(raw[n]).trim());
        }
      }
    }
    if (listed.length) {
      return listed;
    }
    return guessSnippets(step.help || "");
  }

  function watchersForStep(step) {
    var snippets = snippetsFromStep(step);
    var blob =
      snippets.join("\n") +
      "\n" +
      ((step && step.help) || "") +
      "\n" +
      ((step && step.goal) || "");
    var watches = [];
    function add(slot, test) {
      watches.push({ slot: slot, test: test });
    }
    if (/print\s*\(|\bPRINT\b/i.test(blob)) {
      add("code", function (line) {
        return /print\s*\(|\bPRINT\b/i.test(line);
      });
    }
    if (/console\.log/i.test(blob)) {
      add("code", function (line) {
        return /console\.log/i.test(line);
      });
    }
    if (/fmt\.Println/i.test(blob)) {
      add("code", function (line) {
        return /fmt\.Println/i.test(line);
      });
    }
    if (/System\.out|println/i.test(blob)) {
      add("code", function (line) {
        return /println/i.test(line);
      });
    }
    if (/cout\s*<</i.test(blob)) {
      add("code", function (line) {
        return /cout\s*<</i.test(line);
      });
    }
    if (/\bMOV\b/.test(blob)) {
      add("code", function (line) {
        return /\bMOV\b/.test(line);
      });
    }
    if (/<\s*h1/i.test(blob)) {
      add("html", function (line) {
        return /<\s*h1/i.test(line);
      });
    }
    if (/<\s*p[\s>]/i.test(blob)) {
      add("html", function (line) {
        return /<\s*p[\s>]/i.test(line);
      });
    }
    if (/class\s*=/i.test(blob)) {
      add("html", function (line) {
        return /class\s*=/i.test(line);
      });
    }
    if (/background/i.test(blob)) {
      add("css", function (line) {
        return /background\s*:/i.test(line);
      });
    }
    if (/color\s*:|color the|title color|h1 color|font-size/i.test(blob)) {
      add("css", function (line) {
        return /color\s*:|font-size\s*:/i.test(line);
      });
    }
    if (/for\s+loop|for\s*\(|for\s+\w+\s+in\s+range|\bREPEAT\b|\bloop\b/i.test(blob)) {
      add("code", function (line) {
        return /for\s*\(|for\s+\w+\s+in\s+range|\bREPEAT\b/i.test(line);
      });
    }
    if (
      /variable|(?:let|var|const|string|String)\s+\w+\s*=|\w+\s*:?=\s*["'\d]/i.test(blob)
    ) {
      add("code", function (line) {
        return (
          /(?:let|var|const|string|String)?\s*[A-Za-z_]\w*\s*:?=\s*/.test(line) &&
          !/[=!<>]=/.test(line)
        );
      });
    }
    return watches;
  }

  function blockTypesForStep(step) {
    var types = [];
    function add(type) {
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    }
    if (!step) {
      return types;
    }
    var raw = step.keepBlocks;
    var n;
    if (typeof raw === "string") {
      add(raw);
    } else if (raw && raw.length) {
      for (n = 0; n < raw.length; n += 1) {
        add(raw[n]);
      }
    }
    var help = String(step.help || "").toLowerCase();
    if (/yellow start|when go|start block/.test(help)) {
      add("when_flag");
    }
    if (/move right/.test(help)) {
      add("move_right");
    }
    if (/move left/.test(help)) {
      add("move_left");
    }
    if (/move up/.test(help)) {
      add("move_up");
    }
    if (/move down/.test(help)) {
      add("move_down");
    }
    if (/say hi/.test(help)) {
      add("say_hi");
    }
    if (/repeat/.test(help)) {
      add("repeat_block");
    }
    return types;
  }

  function savedIsEmpty() {
    var saved = active && active.saved;
    if (!saved) {
      return true;
    }
    return (
      saved.code.length + saved.html.length + saved.css.length + saved.blocks.length === 0
    );
  }

  function liveWatchLines(slot, text) {
    var step = getActiveStep();
    var watches = watchersForStep(step).filter(function (watch) {
      return watch.slot === slot;
    });
    var key = "watchlines::" + slot;
    if (!watches.length) {
      active.latched[key] = [];
      return [];
    }
    var lines = linesOf(text);
    var baseLines = linesOf(slotText(active.baseline, slot));
    var fresh = allowsFreshStart(step);
    var saved = (active.saved && active.saved[slot]) || [];
    var current = [];
    var i;
    var w;
    for (i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      var hit = false;
      for (w = 0; w < watches.length; w += 1) {
        if (watches[w].test(line)) {
          hit = true;
          break;
        }
      }
      if (!hit || saved.indexOf(line) !== -1) {
        continue;
      }
      if (fresh && baseLines.indexOf(line) !== -1) {
        continue;
      }
      uniquePush(current, line);
    }
    var prev = active.latched[key] || [];
    if (current.length >= prev.length) {
      active.latched[key] = current;
      return [];
    }
    var missing = [];
    for (i = 0; i < prev.length; i += 1) {
      if (!containsPiece(text, prev[i])) {
        missing.push(prev[i]);
      }
    }
    return missing;
  }

  function prepareStepGuards() {
    if (!active) {
      return;
    }
    if (!active.saved) {
      active.saved = emptySaved();
    }
    if (!active.latched) {
      active.latched = {};
    }
    var parts = typeof active.getParts === "function" ? active.getParts() || {} : {};
    var idx = getCurrentStepIndex();
    if (idx === 0) {
      active.saved = emptySaved();
      active.latched = {};
    } else if (savedIsEmpty()) {
      active.saved = {
        code: linesOf(parts.code),
        html: linesOf(parts.html),
        css: linesOf(parts.css),
        blocks: (parts.blocks || []).slice(),
      };
      active.latched = {};
    } else {
      active.latched = {};
    }
    active.baseline = {
      code: parts.code || "",
      html: parts.html || "",
      css: parts.css || "",
      blocks: (parts.blocks || []).slice(),
    };
    liveWatchLines("code", parts.code || "");
    liveWatchLines("html", parts.html || "");
    liveWatchLines("css", parts.css || "");
    var mentioned = blockTypesForStep(getActiveStep());
    var nowBlocks = parts.blocks || [];
    var fresh = allowsFreshStart(getActiveStep());
    var b;
    for (b = 0; b < mentioned.length; b += 1) {
      var type = mentioned[b];
      if (nowBlocks.indexOf(type) === -1) {
        continue;
      }
      if (fresh && (active.baseline.blocks || []).indexOf(type) !== -1) {
        continue;
      }
      active.latched["blocks::" + type] = true;
    }
  }

  function commitStepPieces() {
    if (!active || typeof active.getParts !== "function") {
      return;
    }
    if (!active.saved) {
      active.saved = emptySaved();
    }
    var parts = active.getParts() || {};
    var step = getActiveStep();
    var snippets = snippetsFromStep(step);
    var watches = watchersForStep(step);
    function slotRelevant(slot) {
      var i;
      for (i = 0; i < watches.length; i += 1) {
        if (watches[i].slot === slot) {
          return true;
        }
      }
      for (i = 0; i < snippets.length; i += 1) {
        if (slotForSnippet(snippets[i]) === slot) {
          return true;
        }
      }
      return false;
    }
    var anyHint = watches.length > 0 || snippets.length > 0 || (step && step.keepBlocks);
    var slots = ["code", "html", "css"];
    var s;
    for (s = 0; s < slots.length; s += 1) {
      var slot = slots[s];
      var text = slotText(parts, slot);
      var lines = linesOf(text);
      if (!lines.length) {
        continue;
      }
      var relevant = slotRelevant(slot);
      var combo = parts.html != null || parts.css != null;
      var saveThis = false;
      if (relevant) {
        saveThis = true;
      } else if (!anyHint) {
        // Custom ideas have no sample code, so keep the lines they wrote.
        if (combo) {
          saveThis = slot === "html" || slot === "css";
        } else {
          saveThis = slot === "code";
        }
      }
      if (saveThis) {
        active.saved[slot] = lines;
      }
    }
    if (Array.isArray(parts.blocks)) {
      var mentionedTypes = blockTypesForStep(step);
      var baseBlocks = (active.baseline && active.baseline.blocks) || [];
      var keepTypes = (active.saved.blocks || []).slice();
      var t;
      for (t = 0; t < parts.blocks.length; t += 1) {
        var blockType = parts.blocks[t];
        if (
          mentionedTypes.indexOf(blockType) !== -1 ||
          baseBlocks.indexOf(blockType) === -1 ||
          blockType === "when_flag"
        ) {
          uniquePush(keepTypes, blockType);
        }
      }
      active.saved.blocks = keepTypes;
    }
  }

  function guardText(slot, text) {
    var next = String(text || "");
    if (!active || active.phase !== "building") {
      return next;
    }
    if (!active.saved) {
      active.saved = emptySaved();
    }
    if (!active.latched) {
      active.latched = {};
    }
    var required = [];
    var saved = active.saved[slot] || [];
    var i;
    for (i = 0; i < saved.length; i += 1) {
      required.push(saved[i]);
    }
    var missingWatch = liveWatchLines(slot, next);
    for (i = 0; i < missingWatch.length; i += 1) {
      required.push(missingWatch[i]);
    }
    var snips = snippetsFromStep(getActiveStep()).filter(function (snip) {
      return slotForSnippet(snip) === slot;
    });
    for (i = 0; i < snips.length; i += 1) {
      var key = slot + "::" + snips[i];
      if (containsPiece(next, snips[i])) {
        active.latched[key] = true;
      }
      if (active.latched[key]) {
        required.push(snips[i]);
      }
    }
    var changed = false;
    var seen = {};
    for (i = 0; i < required.length; i += 1) {
      var piece = required[i];
      if (!piece || seen[piece]) {
        continue;
      }
      seen[piece] = true;
      if (!containsPiece(next, piece)) {
        if (next && !/\n$/.test(next)) {
          next += "\n";
        }
        next += piece + "\n";
        changed = true;
      }
    }
    if (changed) {
      setTip(KEEP_NOTE);
    }
    return next;
  }

  function guardElement(el, slot) {
    if (!el) {
      return;
    }
    var next = guardText(slot || "code", el.value);
    if (next === el.value) {
      return;
    }
    var pos = typeof el.selectionStart === "number" ? el.selectionStart : next.length;
    el.value = next;
    try {
      var caret = Math.min(pos, next.length);
      el.setSelectionRange(caret, caret);
    } catch (err) {
      // The restored code is what matters if the caret cannot move.
    }
  }

  function guardBlockTypes(typesNow) {
    if (!active || active.phase !== "building") {
      return [];
    }
    if (!active.latched) {
      active.latched = {};
    }
    var now = typesNow || [];
    var mentioned = blockTypesForStep(getActiveStep());
    var fresh = allowsFreshStart(getActiveStep());
    var base = (active.baseline && active.baseline.blocks) || [];
    var i;
    for (i = 0; i < mentioned.length; i += 1) {
      var type = mentioned[i];
      if (now.indexOf(type) === -1) {
        continue;
      }
      if (fresh && base.indexOf(type) !== -1) {
        continue;
      }
      active.latched["blocks::" + type] = true;
    }
    var need = [];
    var saved = (active.saved && active.saved.blocks) || [];
    for (i = 0; i < saved.length; i += 1) {
      uniquePush(need, saved[i]);
    }
    var keys = Object.keys(active.latched);
    for (i = 0; i < keys.length; i += 1) {
      if (keys[i].indexOf("blocks::") === 0 && active.latched[keys[i]]) {
        uniquePush(need, keys[i].slice("blocks::".length));
      }
    }
    var missing = [];
    for (i = 0; i < need.length; i += 1) {
      if (now.indexOf(need[i]) === -1) {
        missing.push(need[i]);
      }
    }
    if (missing.length) {
      setTip(KEEP_NOTE);
    }
    return missing;
  }

  function showBuildingStep() {
    if (!active) {
      return;
    }
    var idea = getCurrentIdea();
    var steps = getCurrentSteps();
    var idx = getCurrentStepIndex();
    var step = steps[idx];
    if (!step) {
      return;
    }

    active.phase = "building";
    active.stepDone = false;
    saveProgress();

    if (active.taskBar) {
      active.taskBar.classList.add("is-project");
      active.taskBar.classList.toggle("is-advanced", !!active.buildingAdvanced);
      active.taskBar.classList.remove("is-done", "is-help");
    }

    var prefix = active.buildingAdvanced ? "Advanced" : "Project";
    if (active.taskGoal) {
      active.taskGoal.textContent =
        prefix +
        " (" +
        (idx + 1) +
        "/" +
        steps.length +
        "): " +
        String(step.goal).replace(/^((Project|Advanced)\s+)?[Ss]tep\s+\d+:\s*/, "");
    }

    showNextButton(false);
    renderStepDots();
    setTip(
      "Build step " +
        (idx + 1) +
        " of " +
        steps.length +
        ' for "' +
        (idea ? idea.title : "your project") +
        '". Press ' +
        (active.actionLabel || "Run") +
        " when ready. Tap Help if you need a hint."
    );

    if (typeof active.onStepShow === "function") {
      active.onStepShow({
        idea: idea,
        step: step,
        stepIndex: idx,
        advanced: !!active.buildingAdvanced,
      });
    }
    prepareStepGuards();
  }

  function openIdeaPicker(isAdvanced) {
    if (!active) {
      return;
    }
    removeOverlay();
    active.phase = isAdvanced ? "pick-advanced" : "pick";
    active.buildingAdvanced = !!isAdvanced;
    saveProgress();

    var list = getIdeaList(isAdvanced);
    var overlay = document.createElement("div");
    overlay.id = "codereef-project";
    overlay.className = "project-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute(
      "aria-label",
      isAdvanced ? "Choose an advanced project" : "Choose a final project"
    );

    var ideasHtml = "";
    var i;
    for (i = 0; i < list.length; i += 1) {
      ideasHtml +=
        '<button type="button" class="project-idea" data-idea="' +
        escapeHtml(list[i].id) +
        '">' +
        '<span class="project-idea__title">' +
        escapeHtml(list[i].title) +
        "</span>" +
        '<span class="project-idea__blurb">' +
        escapeHtml(list[i].blurb) +
        "</span></button>";
    }

    overlay.innerHTML =
      '<div class="project-panel' +
      (isAdvanced ? " project-panel--advanced" : "") +
      '">' +
      '<p class="project-kicker">' +
      (isAdvanced ? "Advanced project" : "Final project") +
      "</p>" +
      '<h2 class="project-title">What do you want to build?</h2>' +
      '<p class="project-lead">' +
      (isAdvanced
        ? "You unlocked Advanced mode — pick a tougher idea. You’ve got this!"
        : "You finished the skill tasks. Pick a fun project (or type your own idea).") +
      "</p>" +
      '<div class="project-ideas">' +
      ideasHtml +
      "</div>" +
      '<div class="project-custom">' +
      '<label for="project-custom-input">Or type your own idea</label>' +
      '<input id="project-custom-input" type="text" maxlength="80" placeholder="Example: a fish joke machine" />' +
      "</div>" +
      '<div class="project-actions">' +
      '<button type="button" class="project-btn project-btn--ghost" id="project-pick-cancel">Not yet</button>' +
      '<button type="button" class="project-btn project-btn--primary" id="project-pick-custom">Use my idea</button>' +
      "</div></div>";

    document.body.appendChild(overlay);

    function choose(ideaId, customTitle) {
      if (isAdvanced) {
        active.advancedIdeaId = ideaId;
        active.advancedStepIndex = 0;
        if (customTitle) {
          active.customTitle = customTitle;
        }
      } else {
        active.ideaId = ideaId;
        active.stepIndex = 0;
        if (customTitle) {
          active.customTitle = customTitle;
        }
      }
      saveProgress();
      removeOverlay();
      showPlan(isAdvanced);
    }

    overlay.querySelectorAll(".project-idea").forEach(function (btn) {
      btn.addEventListener("click", function () {
        choose(btn.getAttribute("data-idea"), "");
      });
    });

    document.getElementById("project-pick-custom").addEventListener("click", function () {
      var input = document.getElementById("project-custom-input");
      var title = input && input.value ? input.value.trim() : "";
      if (!title) {
        if (input) {
          input.focus();
        }
        return;
      }
      choose(isAdvanced ? "custom-advanced" : "custom", title);
    });

    document.getElementById("project-pick-cancel").addEventListener("click", function () {
      removeOverlay();
      if (isAdvanced) {
        active.phase = "advanced-ready";
        saveProgress();
        setTip("Advanced is unlocked! Tap Start advanced when you want to begin.");
        showNextButton(true, "Start advanced");
      } else {
        active.phase = "ready-final";
        saveProgress();
        setTip("Whenever you’re ready, tap Final project to pick what to build.");
        showNextButton(true, "Final project");
      }
    });
  }

  function showPlan(isAdvanced) {
    if (!active) {
      return;
    }
    active.phase = "plan";
    active.buildingAdvanced = !!isAdvanced;
    saveProgress();
    removeOverlay();

    var idea =
      isAdvanced && active.advancedIdeaId === "custom-advanced"
        ? makeCustomIdea(active.customTitle, true)
        : !isAdvanced && active.ideaId === "custom"
          ? makeCustomIdea(active.customTitle, false)
          : findIdea(isAdvanced ? active.advancedIdeaId : active.ideaId, isAdvanced);

    if (!idea) {
      openIdeaPicker(isAdvanced);
      return;
    }

    var planHtml = "";
    var i;
    for (i = 0; i < (idea.plan || []).length; i += 1) {
      planHtml += "<li>" + escapeHtml(idea.plan[i]) + "</li>";
    }

    var overlay = document.createElement("div");
    overlay.id = "codereef-project";
    overlay.className = "project-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Project plan");

    overlay.innerHTML =
      '<div class="project-panel' +
      (isAdvanced ? " project-panel--advanced" : "") +
      '">' +
      '<p class="project-kicker">' +
      (isAdvanced ? "Advanced plan" : "Your plan") +
      "</p>" +
      '<h2 class="project-title">' +
      escapeHtml(idea.title) +
      "</h2>" +
      '<p class="project-lead">Here’s how we’ll build it — one small step at a time.</p>' +
      '<ol class="project-plan">' +
      planHtml +
      "</ol>" +
      '<div class="project-actions">' +
      '<button type="button" class="project-btn project-btn--ghost" id="project-plan-back">Pick again</button>' +
      '<button type="button" class="project-btn project-btn--primary" id="project-plan-go">Let’s build!</button>' +
      "</div></div>";

    document.body.appendChild(overlay);

    document.getElementById("project-plan-back").addEventListener("click", function () {
      removeOverlay();
      openIdeaPicker(isAdvanced);
    });

    document.getElementById("project-plan-go").addEventListener("click", function () {
      removeOverlay();
      if (typeof active.onProjectStart === "function") {
        active.onProjectStart({
          idea: idea,
          advanced: !!isAdvanced,
        });
      }
      showBuildingStep();
    });
  }

  function celebrateFinal() {
    removeOverlay();
    active.phase = "celebrate-final";
    active.finalDone = true;
    active.advancedUnlocked = true;
    saveProgress();

    var overlay = document.createElement("div");
    overlay.id = "codereef-project";
    overlay.className = "project-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Project complete");

    overlay.innerHTML =
      '<div class="project-panel project-panel--celebrate">' +
      '<p class="project-kicker">You did it</p>' +
      '<h2 class="project-title">Final project complete!</h2>' +
      '<p class="project-lead">Wow — you planned it and built it. That was real coding. Ready for a tougher Advanced project?</p>' +
      '<div class="project-actions">' +
      '<button type="button" class="project-btn project-btn--ghost" id="project-celebrate-later">Maybe later</button>' +
      '<button type="button" class="project-btn project-btn--advance" id="project-celebrate-adv">Start advanced</button>' +
      "</div></div>";

    document.body.appendChild(overlay);

    document.getElementById("project-celebrate-later").addEventListener("click", function () {
      removeOverlay();
      active.phase = "advanced-ready";
      saveProgress();
      if (active.taskBar) {
        active.taskBar.classList.add("is-project", "is-advanced");
      }
      if (active.taskGoal) {
        active.taskGoal.textContent = "Advanced unlocked!";
      }
      setTip("Advanced mode is ready whenever you are. Tap Start advanced.");
      showNextButton(true, "Start advanced");
      renderStepDots();
    });

    document.getElementById("project-celebrate-adv").addEventListener("click", function () {
      removeOverlay();
      openIdeaPicker(true);
    });
  }

  function languageLabel(pathKey) {
    var names = {
      blocks: "Block Coding",
      htmlcss: "HTML / CSS",
      python: "Python",
      javascript: "JavaScript",
      go: "Go",
      java: "Java",
      cpp: "C++",
      assembly: "Assembly",
    };
    return names[pathKey] || pathKey || "a coding path";
  }

  function celebrateAdvanced() {
    removeOverlay();
    active.phase = "celebrate-advanced";
    active.advancedDone = true;
    saveProgress();

    if (typeof notifyParentOfLanguageComplete === "function" && typeof getCurrentUser === "function") {
      var diver = getCurrentUser();
      if (diver) {
        notifyParentOfLanguageComplete(diver, languageLabel(active.pathKey)).catch(function () {
          // Finishing the path still counts if the email does not send.
        });
      }
    }

    var overlay = document.createElement("div");
    overlay.id = "codereef-project";
    overlay.className = "project-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Advanced project complete");

    overlay.innerHTML =
      '<div class="project-panel project-panel--celebrate">' +
      '<p class="project-kicker">Reef champion</p>' +
      '<h2 class="project-title">Advanced project done!</h2>' +
      '<p class="project-lead">You finished the hard path. Take a bow, explorer — you can rebuild any idea or try another language.</p>' +
      '<div class="project-actions">' +
      '<button type="button" class="project-btn project-btn--primary" id="project-adv-done">Awesome!</button>' +
      "</div></div>";

    document.body.appendChild(overlay);

    document.getElementById("project-adv-done").addEventListener("click", function () {
      removeOverlay();
      active.phase = "all-done";
      saveProgress();
      if (active.taskBar) {
        active.taskBar.classList.add("is-done");
        active.taskBar.classList.remove("is-help");
      }
      if (active.taskGoal) {
        active.taskGoal.textContent = "You finished Final + Advanced. Legend!";
      }
      setTip("Amazing diving today. Tap Back anytime to pick another reef path.");
      showNextButton(false);
      var bar = document.getElementById("project-step-bar");
      if (bar) {
        bar.remove();
      }
    });
  }

  function markStepDone() {
    if (!active || active.stepDone) {
      return;
    }
    commitStepPieces();
    active.stepDone = true;
    if (active.taskBar) {
      active.taskBar.classList.add("is-done");
      active.taskBar.classList.remove("is-help");
    }

    var steps = getCurrentSteps();
    var idx = getCurrentStepIndex();
    var idea = getCurrentIdea();

    if (active.taskGoal) {
      active.taskGoal.textContent =
        "Nice job! " +
        String((steps[idx] && steps[idx].goal) || "").replace(
          /^((Project|Advanced)\s+)?[Ss]tep\s+\d+:\s*/,
          ""
        );
    }

    if (idx >= steps.length - 1) {
      showNextButton(false);
      setTip(
        active.buildingAdvanced
          ? "Advanced project complete — celebrating!"
          : "Final project complete — celebrating!"
      );
      renderStepDots();
      window.setTimeout(function () {
        if (active.buildingAdvanced) {
          celebrateAdvanced();
        } else {
          celebrateFinal();
        }
      }, 450);
      return;
    }

    showNextButton(true, "Next step");
    setTip(
      "Step complete for \"" +
        (idea ? idea.title : "your project") +
        "\"! Tap Next step when ready."
    );
    renderStepDots();
  }

  function tryCheck(ctx) {
    if (!active || active.phase !== "building" || active.stepDone) {
      return false;
    }
    var step = getActiveStep();
    if (!step || typeof step.check !== "function") {
      return false;
    }
    var ok = false;
    try {
      ok = !!step.check(ctx || {});
    } catch (err) {
      ok = false;
    }
    if (ok) {
      markStepDone();
      return true;
    }
    setTip(
      "Not quite yet. Tap Help for a bigger hint, then press " +
        (active.actionLabel || "Run") +
        " again."
    );
    return false;
  }

  function showHelp() {
    if (!active || active.phase !== "building") {
      return false;
    }
    var step = getActiveStep();
    if (!step) {
      return false;
    }
    if (active.taskBar) {
      active.taskBar.classList.add("is-help");
    }
    setTip(step.help || "Try the step, then press " + (active.actionLabel || "Run") + ".");
    return true;
  }

  function handleNext() {
    if (!active) {
      return false;
    }
    if (active.phase === "ready-final") {
      openIdeaPicker(false);
      return true;
    }
    if (active.phase === "advanced-ready") {
      openIdeaPicker(true);
      return true;
    }
    if (active.phase === "building" && active.stepDone) {
      var steps = getCurrentSteps();
      var idx = getCurrentStepIndex();
      if (idx < steps.length - 1) {
        setCurrentStepIndex(idx + 1);
        saveProgress();
        showBuildingStep();
        return true;
      }
    }
    return false;
  }

  function isActive() {
    return !!(active && (active.phase === "building" || active.phase === "plan"));
  }

  function isHandlingTasks() {
    return !!(
      active &&
      (active.phase === "building" ||
        active.phase === "ready-final" ||
        active.phase === "advanced-ready" ||
        active.phase === "pick" ||
        active.phase === "pick-advanced" ||
        active.phase === "plan" ||
        active.phase === "celebrate-final" ||
        active.phase === "celebrate-advanced" ||
        active.phase === "all-done")
    );
  }

  function beginFinal() {
    if (!active) {
      return;
    }
    active.phase = "ready-final";
    saveProgress();
    if (active.taskBar) {
      active.taskBar.classList.add("is-project");
      active.taskBar.classList.remove("is-advanced", "is-help");
      active.taskBar.classList.add("is-done");
    }
    if (active.taskGoal) {
      active.taskGoal.textContent = "Skill tasks done — final project time!";
    }
    setTip("You practiced the skills. Tap Final project to choose what to build.");
    showNextButton(true, "Final project");
  }

  function resumeIfNeeded() {
    if (!active) {
      return;
    }
    var p = active.progressSeed;
    if (!p || p.phase === "skills") {
      return;
    }

    active.phase = p.phase;
    active.ideaId = p.ideaId;
    active.customTitle = p.customTitle;
    active.stepIndex = p.stepIndex;
    active.advancedUnlocked = p.advancedUnlocked;
    active.advancedIdeaId = p.advancedIdeaId;
    active.advancedStepIndex = p.advancedStepIndex;
    active.finalDone = p.finalDone;
    active.advancedDone = p.advancedDone;

    if (p.phase === "building") {
      active.buildingAdvanced = !!(p.advancedIdeaId && p.finalDone);
      // If final not done, building final; if final done and advanced idea set, building advanced
      if (p.finalDone && p.advancedIdeaId) {
        active.buildingAdvanced = true;
      } else {
        active.buildingAdvanced = false;
      }
      showBuildingStep();
      return true;
    }
    if (p.phase === "ready-final") {
      beginFinal();
      return true;
    }
    if (p.phase === "advanced-ready" || (p.finalDone && !p.advancedDone && p.phase !== "all-done")) {
      active.phase = "advanced-ready";
      if (active.taskBar) {
        active.taskBar.classList.add("is-project", "is-advanced", "is-done");
      }
      if (active.taskGoal) {
        active.taskGoal.textContent = "Advanced unlocked!";
      }
      setTip("Advanced mode is ready. Tap Start advanced when you want.");
      showNextButton(true, "Start advanced");
      return true;
    }
    if (p.phase === "all-done" || p.advancedDone) {
      active.phase = "all-done";
      if (active.taskBar) {
        active.taskBar.classList.add("is-project", "is-done");
      }
      if (active.taskGoal) {
        active.taskGoal.textContent = "You finished Final + Advanced. Legend!";
      }
      setTip("Amazing diving today. Tap Back anytime to pick another reef path.");
      showNextButton(false);
      return true;
    }
    return false;
  }

  function attach(config) {
    active = {
      pathKey: config.pathKey,
      actionLabel: config.actionLabel || "Run",
      ideas: config.ideas || [],
      advancedIdeas: config.advancedIdeas || [],
      setTip: config.setTip,
      taskBar: config.taskBar || document.getElementById("task-bar"),
      taskGoal: config.taskGoal || document.getElementById("task-goal"),
      nextBtn: config.nextBtn || document.getElementById("next-btn"),
      helpBtn: config.helpBtn || document.getElementById("help-btn"),
      onProjectStart: config.onProjectStart,
      onStepShow: config.onStepShow,
      getParts: config.getParts,
      phase: "skills",
      ideaId: null,
      customTitle: "",
      stepIndex: 0,
      advancedUnlocked: false,
      advancedIdeaId: null,
      advancedStepIndex: 0,
      finalDone: false,
      advancedDone: false,
      buildingAdvanced: false,
      stepDone: false,
      saved: emptySaved(),
      latched: {},
      baseline: { code: "", html: "", css: "", blocks: [] },
      progressSeed: loadProgress(config.pathKey),
    };
    return {
      beginFinal: beginFinal,
      tryCheck: tryCheck,
      showHelp: showHelp,
      handleNext: handleNext,
      isActive: isActive,
      isHandlingTasks: isHandlingTasks,
      resumeIfNeeded: resumeIfNeeded,
      guardText: guardText,
      guardElement: guardElement,
      guardBlockTypes: guardBlockTypes,
      getPhase: function () {
        return active ? active.phase : "skills";
      },
    };
  }

  function clearProgress(pathKey) {
    try {
      localStorage.removeItem(storageKey(pathKey));
    } catch (err) {
      // ignore
    }
  }

  global.CodeReefProject = {
    attach: attach,
    loadProgress: loadProgress,
    clearProgress: clearProgress,
  };
})(window);
