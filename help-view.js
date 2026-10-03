// Shows Help one tip at a time so a kid can follow every language.

var CodeReefHelp = (function () {
  function stepsFrom(text) {
    var raw = String(text || "").trim();
    if (!raw) {
      return ["Try the task, then press the button at the top."];
    }
    var lines = raw.split(/\n+/);
    var steps = [];
    var current = "";
    var i;
    for (i = 0; i < lines.length; i += 1) {
      var line = lines[i].trim();
      if (!line) {
        continue;
      }
      if (/^\d+\.\s+/.test(line)) {
        if (current) {
          steps.push(current);
        }
        current = line.replace(/^\d+\.\s+/, "");
      } else if (current) {
        current += " " + line;
      } else {
        current = line;
      }
    }
    if (current) {
      steps.push(current);
    }
    if (steps.length === 0) {
      steps.push(raw);
    }
    return steps;
  }

  function show(el, text) {
    if (!el) {
      return;
    }
    if (window.CodeReefGuide) {
      text = CodeReefGuide.expandHelp(text);
    }
    var steps = stepsFrom(text);
    var index = 0;

    function draw() {
      var step = steps[index];
      var exact = step.match(/^(?:Type this exactly|Type this line|The line should look like this):\s*([\s\S]+)$/);
      el.innerHTML = "";
      el.classList.add("help-steps");

      var count = document.createElement("p");
      count.className = "help-steps__count";
      if (steps.length === 1 && /^Here is how to begin/.test(step)) {
        count.textContent = "Start here";
      } else {
        count.textContent = steps.length === 1 ? "Help" : "Tip " + (index + 1) + " of " + steps.length;
      }

      var body = document.createElement("p");
      body.className = "help-steps__now";
      if (exact) {
        body.textContent = "Type this line. Copy every letter and mark.";
        var code = document.createElement("code");
        code.className = "help-steps__code";
        code.textContent = exact[1];
        body.appendChild(document.createElement("br"));
        body.appendChild(code);
      } else {
        body.textContent = step;
      }

      if (steps.length > 1) {
        el.appendChild(count);
      }
      el.appendChild(body);

      if (steps.length < 2) {
        return;
      }

      var nav = document.createElement("div");
      nav.className = "help-steps__nav";

      var back = document.createElement("button");
      back.type = "button";
      back.className = "help-steps__back";
      back.textContent = "Back";
      back.disabled = index === 0;
      back.addEventListener("click", function () {
        if (index > 0) {
          index -= 1;
          draw();
        }
      });

      var next = document.createElement("button");
      next.type = "button";
      next.className = "help-steps__next";
      next.textContent = index === steps.length - 1 ? "Start over" : "Next tip";
      next.addEventListener("click", function () {
        if (index === steps.length - 1) {
          index = 0;
        } else {
          index += 1;
        }
        draw();
      });

      nav.appendChild(back);
      nav.appendChild(next);
      el.appendChild(nav);
    }

    draw();
  }

  return { show: show };
})();
