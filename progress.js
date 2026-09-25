// Saves lesson progress per kid + path (this browser only).
// Keys: codereef_progress_<kid>_<path>
// Does NOT touch trail, wallet, fish, or project.js keys.

(function (global) {
  "use strict";

  var debounceTimers = Object.create(null);

  function kidName() {
    var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    return user && user.kidName ? String(user.kidName).toLowerCase() : "guest";
  }

  function storageKey(path) {
    return "codereef_progress_" + kidName() + "_" + String(path || "unknown");
  }

  function loadProgress(path) {
    var raw = localStorage.getItem(storageKey(path));
    if (!raw) {
      return null;
    }
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") {
        return null;
      }
      return {
        taskIndex: typeof data.taskIndex === "number" ? data.taskIndex : 0,
        taskDone: !!data.taskDone,
        code: typeof data.code === "string" ? data.code : "",
        html: typeof data.html === "string" ? data.html : undefined,
        css: typeof data.css === "string" ? data.css : undefined,
        workspaceXml:
          typeof data.workspaceXml === "string" ? data.workspaceXml : undefined,
      };
    } catch (err) {
      return null;
    }
  }

  function saveProgress(path, data) {
    if (!path || !data || typeof data !== "object") {
      return;
    }
    var payload = {
      taskIndex: typeof data.taskIndex === "number" ? data.taskIndex : 0,
      taskDone: !!data.taskDone,
      code: typeof data.code === "string" ? data.code : "",
    };
    if (typeof data.html === "string") {
      payload.html = data.html;
    }
    if (typeof data.css === "string") {
      payload.css = data.css;
    }
    if (typeof data.workspaceXml === "string") {
      payload.workspaceXml = data.workspaceXml;
    }
    try {
      localStorage.setItem(storageKey(path), JSON.stringify(payload));
    } catch (err) {
      // Quota or private mode — ignore quietly.
    }
  }

  function clearProgress(path) {
    try {
      localStorage.removeItem(storageKey(path));
    } catch (err) {
      // ignore
    }
    if (debounceTimers[path]) {
      clearTimeout(debounceTimers[path]);
      debounceTimers[path] = null;
    }
  }

  // Debounced save so typing does not spam localStorage (~400ms).
  function saveProgressDebounced(path, data, waitMs) {
    var wait = typeof waitMs === "number" ? waitMs : 400;
    if (debounceTimers[path]) {
      clearTimeout(debounceTimers[path]);
    }
    debounceTimers[path] = setTimeout(function () {
      debounceTimers[path] = null;
      saveProgress(path, data);
    }, wait);
  }

  function clampTaskIndex(index, taskCount) {
    var n = typeof index === "number" ? index : 0;
    var max = Math.max(0, (taskCount || 1) - 1);
    if (n < 0) {
      return 0;
    }
    if (n > max) {
      return max;
    }
    return n;
  }

  // Friendly names + pages for the home laptop screen.
  var PATH_META = {
    blocks: { label: "Block Coding", href: "blocks.html" },
    htmlcss: { label: "HTML / CSS", href: "htmlcss.html" },
    python: { label: "Python", href: "python.html" },
    javascript: { label: "JavaScript", href: "javascript.html" },
    go: { label: "Go", href: "go.html" },
    java: { label: "Java", href: "java.html" },
    cpp: { label: "C++", href: "cpp.html" },
    assembly: { label: "Assembly", href: "assembly.html" },
  };

  function lastPathStorageKey() {
    return "codereef_last_path_" + kidName();
  }

  function rememberLastPath(path) {
    var key = String(path || "");
    var meta = PATH_META[key];
    if (!meta) {
      return;
    }
    try {
      localStorage.setItem(
        lastPathStorageKey(),
        JSON.stringify({
          key: key,
          label: meta.label,
          href: meta.href,
        })
      );
    } catch (err) {
      // ignore
    }
  }

  function getLastPath() {
    try {
      var raw = localStorage.getItem(lastPathStorageKey());
      if (!raw) {
        return null;
      }
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") {
        return null;
      }
      var key = typeof data.key === "string" ? data.key : "";
      var meta = PATH_META[key];
      if (!meta) {
        return null;
      }
      return {
        key: key,
        label: meta.label,
        href: meta.href,
      };
    } catch (err) {
      return null;
    }
  }

  global.CodeReefProgress = {
    save: saveProgress,
    load: loadProgress,
    clear: clearProgress,
    saveDebounced: saveProgressDebounced,
    clampTaskIndex: clampTaskIndex,
    rememberLastPath: rememberLastPath,
    getLastPath: getLastPath,
    // Aliases matching the request wording
    saveProgress: saveProgress,
    loadProgress: loadProgress,
    clearProgress: clearProgress,
  };
})(window);
