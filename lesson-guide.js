// Turns every lesson task into a plain-words job, a how-to-start, and a stuck guide.

var CodeReefGuide = (function () {
  function parseSteps(text) {
    var raw = String(text || "").trim();
    if (!raw) {
      return [];
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
    return steps;
  }

  function numbered(steps) {
    var parts = [];
    var i;
    for (i = 0; i < steps.length; i += 1) {
      parts.push(i + 1 + ". " + steps[i]);
    }
    return parts.join("\n\n");
  }

  function readHelp(text) {
    var steps = parseSteps(text);
    var exacts = [];
    var see = "";
    var button = "";
    var block = "";
    var fresh = false;
    var keep = false;
    var editWord = false;
    var i;
    for (i = 0; i < steps.length; i += 1) {
      var step = steps[i];
      var exact = step.match(/^(?:Type this exactly|Type this line|The line should look like this):\s*([\s\S]+)$/);
      if (exact) {
        exacts.push(exact[1].trim());
      }
      var seen = step.match(/^You should see (.+)$/);
      if (seen) {
        see = seen[1].replace(/\.$/, "");
      }
      var fish = step.match(/^The fish should (.+)$/);
      if (fish && !see) {
        see = "the fish " + fish[1].replace(/\.$/, "");
      }
      var pressed = step.match(/Press the (Run|Show|Go) button/);
      if (pressed) {
        button = pressed[1];
      }
      if (/^Start fresh\b/i.test(step)) {
        fresh = true;
      }
      if (/^Keep your old code\b|^Keep your old blocks\b|^Keep the yellow block\b|^Keep your old line\b|^Keep your old CSS\b/i.test(step)) {
        keep = true;
      }
      if (/Click on the word /.test(step)) {
        editWord = true;
      }
      var found = step.match(/^Find the block that says (.+)\.$/);
      if (found && !block) {
        block = found[1];
      }
    }
    if (!button) {
      button = "Run";
    }
    return {
      steps: steps,
      exacts: exacts,
      exact: exacts.length ? exacts[0] : "",
      see: see,
      button: button,
      block: block,
      fresh: fresh,
      keep: keep,
      editWord: editWord,
      all: steps.join("\n"),
    };
  }

  function meaningOf(info) {
    var raw = info.all + "\n" + info.exacts.join("\n");
    var blob = raw.toLowerCase();
    var sample = info.exact;
    if (/console\.log/.test(blob)) {
      return "console.log means show words on the screen. The words go inside the ( ).";
    }
    if (/fmt\.println/.test(blob)) {
      return "fmt.Println means show words on the screen. The words go inside the ( ).";
    }
    if (/system\.out\.println/.test(blob)) {
      return "System.out.println means show words on the screen. The words go inside the ( ).";
    }
    if (/cout/.test(blob)) {
      return "cout means show words on the screen. << sends the words out. endl means start the next line.";
    }
    if (/\bmov\b/.test(blob)) {
      return "MOV means save a word or a number in a box. Later you can show what that box remembers.";
    }
    if (/\bfor\b/.test(blob) || /\brepeat\b/.test(blob)) {
      return "A loop means do the next lines again and again. The number says how many times.";
    }
    if (/\bif\b/.test(blob)) {
      return "if means pick a path. The lines inside run only when the test is true.";
    }
    if (/\belse\b/.test(blob)) {
      return "else means the other path. It runs when the if test is not true.";
    }
    if (/\bdef\b|\bfunction\b|\bvoid\b/.test(blob)) {
      return "A function is a recipe. You write the recipe once, then run it by saying its name.";
    }
    if (/<h1/.test(blob)) {
      return "h1 is the biggest title. The words sit between <h1> and </h1>. The slash / means the title is finished.";
    }
    if (/<p[\s>]/.test(blob)) {
      return "p means a paragraph. A paragraph is one sentence on the page. The words sit between <p> and </p>.";
    }
    if (/color\s*:/.test(blob)) {
      return "color changes the color of the words. Keep the colon : and the semicolon ; .";
    }
    if (/background\s*:/.test(blob)) {
      return "background changes the color behind the words. Keep the colon : and the semicolon ; .";
    }
    if (/move right|move left|move up|move down/.test(blob)) {
      return "A move block tells the fish which way to swim. The number on the block is how many steps.";
    }
    if (/\bsay\b/.test(blob)) {
      return "A say block makes the fish show words, like a speech bubble.";
    }
    if (/\bPRINT\b/.test(raw)) {
      return "PRINT means show words on the screen. The words sit between two quotes.";
    }
    if (/\bprint\b/.test(blob)) {
      return 'print means show words on the screen. A quote is this mark: " The words sit between two quotes.';
    }
    if (sample && /=/.test(sample) && sample.indexOf("==") === -1) {
      return "The = sign means remember this. The name on the left remembers the word or number on the right.";
    }
    return "";
  }

  function jobSentence(info) {
    var job = "This task, in plain words: ";
    if (info.editWord) {
      job += "keep the old line and change one word. ";
    } else if (info.fresh) {
      job += "erase the old code, then type the new lines. ";
    } else if (info.block) {
      job += "keep your old blocks, then snap on the new one. ";
    } else if (info.keep) {
      job += "keep your old code, then add the new part. ";
    } else {
      job += "change the part this task talks about. ";
    }
    if (info.exact) {
      job += "One line you need is " + info.exact + ". ";
    } else if (info.block) {
      job += "Drag the block that says " + info.block + ". ";
    }
    if (info.see) {
      job += "You are done when you see " + info.see + ".";
    } else {
      job += "Then press the " + info.button + " button at the top.";
    }
    return job;
  }

  function stuckTips(info) {
    var tips = ["If you are stuck, stay on these tips. They help you find the mistake."];
    var sample = info.exact || "";
    var last = info.exacts.length ? info.exacts[info.exacts.length - 1] : "";
    if (sample) {
      tips.push("Look at your code next to this line. Every letter and mark should match. The line should look like this: " + sample);
    }
    if (last && last !== sample) {
      tips.push("Check the other new line too. The line should look like this: " + last);
    }
    if (sample.indexOf('"') !== -1 || sample.indexOf("'") !== -1) {
      tips.push('Quotes come in a pair. One quote starts the words. The other quote ends them. A quote looks like this: "');
    }
    if (/[A-Z]/.test(sample)) {
      tips.push("Copy the big letters too. A big H and a small h are not the same letter to the computer.");
    }
    if (sample.indexOf("(") !== -1 || sample.indexOf(")") !== -1) {
      tips.push("Parentheses come in a pair. ( opens. ) closes. You need one of each.");
    }
    if (/:\s*$/.test(sample) && sample.indexOf(";") === -1) {
      tips.push("This line ends with a colon. A colon is this mark: :  Do not put a semicolon ; on this line.");
    }
    if (sample.indexOf(";") !== -1) {
      tips.push("This line needs a semicolon at the end. A semicolon is this mark: ;");
    }
    if (sample.indexOf("{") !== -1 || sample.indexOf("}") !== -1) {
      tips.push("Curly braces come in a pair. { opens. } closes. If one is missing, the computer stops.");
    }
    if (sample.indexOf("<") !== -1 && sample.indexOf(">") !== -1) {
      tips.push("A tag starts with < and ends with >. The closing tag has a slash, like </p>.");
    }
    if (/space bar|indent|sits inside/i.test(info.all)) {
      tips.push("A line that sits inside needs spaces at the start. Count them. Too many or too few will not work.");
    }
    if (info.editWord) {
      tips.push("Do not erase the whole line. Change only the one word. If the rest of the line disappeared, type the whole line again.");
    } else if (info.fresh) {
      tips.push("This task starts fresh. If old code is still in the box, highlight all of it and press the Delete key.");
    } else if (info.block) {
      tips.push("This task keeps your old blocks. If you threw one away, drag that block back on.");
    } else if (info.keep) {
      tips.push("This task keeps your old work. If you erased an old line, type that line back, then add the new one.");
    }
    if (info.block) {
      tips.push("If the blocks are not stuck together, drag the new block until it snaps under the yellow start block.");
    }
    if (info.see && info.block) {
      tips.push("Press the " + info.button + " button again. You want to see " + info.see + ". If that does not happen, the new block is not snapped on yet.");
    } else if (info.see) {
      tips.push("Press the " + info.button + " button again. A good run shows " + info.see + ". If you see something else, the new line does not match yet.");
    } else {
      tips.push("Press the " + info.button + " button again after you fix one thing.");
    }
    tips.push("Press Back until you find the tip for the part that looks wrong. Fix that one part, then press " + info.button + ".");
    return tips;
  }

  function instruction(goal, help) {
    var info = readHelp(help);
    var job = String(goal || "").trim();
    var button = info.button || "Run";
    if (info.see) {
      var see = info.see;
      if (!/[.!?]$/.test(see)) {
        see += ".";
      }
      return job + " Press " + button + ". You should see " + see;
    }
    return job + " Press " + button + " when you are done.";
  }

  function startHint(goal, help, buttonFallback) {
    var info = readHelp(help);
    var button = info.button || buttonFallback || "Run";
    var start = "Try the change, then press " + button + ".";
    if (info.editWord) {
      start = "Change one word, then press " + button + ".";
    } else if (info.fresh) {
      start = "Type the new lines, then press " + button + ".";
    } else if (info.block) {
      start = "Snap on one new block, then press " + button + ".";
    } else if (info.keep) {
      start = "Add the new part, then press " + button + ".";
    }
    return start + " Press Help and it will walk you through it.";
  }

  function expandHelp(text) {
    var raw = String(text || "");
    if (raw.indexOf("This task, in plain words:") !== -1) {
      return raw;
    }
    var info = readHelp(raw);
    if (info.steps.length < 4) {
      return raw;
    }
    var intro = [jobSentence(info)];
    var meaning = meaningOf(info);
    if (meaning) {
      intro.push(meaning);
    }
    intro.push("Do the next tips in order. One tip, then press Next tip. Press Back if you want to hear a tip again.");
    return numbered(intro.concat(info.steps).concat(stuckTips(info)));
  }

  return {
    instruction: instruction,
    startHint: startHint,
    expandHelp: expandHelp,
  };
})();
