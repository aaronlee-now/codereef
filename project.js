// Shared final + advanced project flow for CodeReef lessons.
// Each path calls CodeReefProject.attach(...) once, then
// CodeReefProject.beginFinal() after the last skill task.

(function (global) {
  "use strict";

  var active = null;

  function kidName() {
    var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    return user && user.kidName ? String(user.kidName).toLowerCase() : "guest";
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
              "You can delete the old code and start fresh for this advanced project. " +
              "Make " +
              printWord +
              " show a title that mentions your idea. Then press " +
              verb +
              ".",
            check: function (ctx) {
              return outputHasAny(ctx, [name.toLowerCase(), "advanced", "project", "reef"]);
            },
          },
          {
            goal: "Advanced step 2: Use a variable (or named value).",
            help:
              "Keep your old code. Add a variable under it. " +
              "Then show that variable. Press " +
              verb +
              ".",
            check: function (ctx) {
              return codeLooksLikeVariable(ctx);
            },
          },
          {
            goal: "Advanced step 3: Use a loop or repeat.",
            help:
              "Keep your old code. Add a loop (or Repeat block) so something runs more than once. Press " +
              verb +
              ".",
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
            "You can delete the old code and start fresh for this project. " +
            "Make " +
            printWord +
            " say something about your idea. Then press " +
            verb +
            ".",
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
            "Keep your old code. Add another print/log/say line under it. Then press " +
            verb +
            ".",
          check: function (ctx) {
            var lines = normalizeOut(ctx.output).split("\n").filter(Boolean);
            return lines.length >= 2 || (ctx.actions && ctx.actions.length >= 2);
          },
        },
        {
          goal: "Project step 3: Use a variable or named value (or say something new).",
          help:
            "Keep your old code. Add a variable if your language has one, or add one more fun line. Press " +
            verb +
            ".",
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

  function celebrateAdvanced() {
    removeOverlay();
    active.phase = "celebrate-advanced";
    active.advancedDone = true;
    saveProgress();

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
