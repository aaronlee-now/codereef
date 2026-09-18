// Smoke-test tiny Java runner (mirrors java.js logic)
function normalizeOut(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .trim()
    .toLowerCase();
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
    } else if (ch === "/" && line[c + 1] === "/") {
      return line.slice(0, c);
    }
  }
  return line;
}

function evalExpr(expr, vars) {
  expr = expr.trim();
  if (!expr) {
    throw new Error("Empty value");
  }
  const strMatch = expr.match(/^(["'])([\s\S]*)\1$/);
  if (strMatch) {
    return strMatch[2];
  }
  if (/^-?\d+$/.test(expr)) {
    return Number(expr);
  }
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(expr)) {
    if (!(expr in vars)) {
      throw new Error(expr + " undefined");
    }
    return vars[expr];
  }
  const plus = expr.match(/^(.+?)\s*\+\s*(.+)$/);
  if (plus) {
    return evalExpr(plus[1], vars) + evalExpr(plus[2], vars);
  }
  throw new Error("bad: " + expr);
}

function isIgnorableLine(line) {
  return (
    /^public\s+class\s+[A-Za-z_][A-Za-z0-9_]*\s*\{\s*$/.test(line) ||
    /^public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*[A-Za-z_][A-Za-z0-9_]*\s*\)\s*\{\s*$/.test(
      line
    ) ||
    line === "}"
  );
}

function runSimple(line, vars, output) {
  const stringDecl = line.match(
    /^String\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*;$/
  );
  if (stringDecl) {
    vars[stringDecl[1]] = evalExpr(stringDecl[2], vars);
    return;
  }
  const intDecl = line.match(
    /^int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*;$/
  );
  if (intDecl) {
    vars[intDecl[1]] = Number(evalExpr(intDecl[2], vars));
    return;
  }
  const printlnMatch = line.match(/^System\.out\.println\s*\((.*)\)\s*;$/);
  if (printlnMatch) {
    const inner = printlnMatch[1].trim();
    output.push(inner ? String(evalExpr(inner, vars)) : "");
    return;
  }
  throw new Error("bad line: " + line);
}

function runTinyJava(source) {
  const lines = String(source || "").replace(/\r/g, "").split("\n");
  const vars = Object.create(null);
  const output = [];
  let i = 0;
  while (i < lines.length) {
    const line = stripComment(lines[i]).trim();
    if (!line) {
      i += 1;
      continue;
    }
    if (isIgnorableLine(line)) {
      i += 1;
      continue;
    }
    const forMatch = line.match(
      /^for\s*\(\s*int\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|<)\s*(-?\d+)\s*;\s*\1\+\+\s*\)\s*\{\s*$/
    );
    if (forMatch) {
      const loopVar = forMatch[1];
      const start = Number(forMatch[2]);
      const op = forMatch[3];
      const end = Number(forMatch[4]);
      i += 1;
      const body = [];
      let depth = 1;
      while (i < lines.length && depth > 0) {
        const bodyLine = stripComment(lines[i]).trim();
        i += 1;
        if (!bodyLine) {
          continue;
        }
        if (/\{\s*$/.test(bodyLine) && !/^\}/.test(bodyLine)) {
          depth += 1;
        }
        if (bodyLine === "}") {
          depth -= 1;
          if (depth === 0) {
            break;
          }
          continue;
        }
        if (depth === 1) {
          body.push(bodyLine);
        }
      }
      for (let n = start; op === "<=" ? n <= end : n < end; n += 1) {
        vars[loopVar] = n;
        body.forEach(function (b) {
          runSimple(b, vars, output);
        });
      }
      continue;
    }
    runSimple(line, vars, output);
    i += 1;
  }
  return output.join("\n");
}

const tests = [
  ["t1", 'System.out.println("Hello, ocean!");', "hello, ocean!"],
  [
    "t2",
    'System.out.println("Hello, ocean!");\nSystem.out.println("I love Java!");',
    "hello, ocean!\ni love java!",
  ],
  [
    "t3",
    'String fish = "clownfish";\nSystem.out.println(fish);',
    "clownfish",
  ],
  [
    "t4",
    "for (int i = 1; i <= 3; i++) {\n  System.out.println(i);\n}",
    "1\n2\n3",
  ],
  [
    "wrap",
    'public class Main {\npublic static void main(String[] args) {\nSystem.out.println("Hello, ocean!");\n}\n}',
    "hello, ocean!",
  ],
];

let ok = true;
for (const [name, code, expect] of tests) {
  const got = normalizeOut(runTinyJava(code));
  const pass = got === expect;
  console.log(name, pass ? "PASS" : "FAIL", JSON.stringify(got));
  if (!pass) {
    ok = false;
  }
}
process.exit(ok ? 0 : 1);
