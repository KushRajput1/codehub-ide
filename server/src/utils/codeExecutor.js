const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const preparePythonCode = (code, input) => {
  if (!input || !input.trim()) return code;

  const inputs = input
    .split("\n")
    .map(line => `"${line.replace(/"/g, '\\"')}"`)
    .join(",\n");

  return `
__inputs__ = iter([
${inputs}
])

def input(prompt=""):
    try:
        return next(__inputs__)
    except StopIteration:
        raise RuntimeError("Program requested more input than provided")

${code}
`;
};

const prepareJSCode = (code, input) => {
  if (!input || !input.trim()) return code;

  const inputs = input
    .split("\n")
    .map(line => `"${line.replace(/"/g, '\\"')}"`)
    .join(",\n");

  return `
const __input__ = [
${inputs}
];

let __idx__ = 0;
function input() {
  if (__idx__ >= __input__.length) {
    throw new Error("Program requested more input than provided");
  }
  return __input__[__idx__++];
}

${code}
`;
};

const executeCode = (language, code, input = "") => {
  return new Promise((resolve) => {
    const jobId = uuidv4();
    const tempDir = path.join(__dirname, "../../temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    let filePath;
    let command;

    try {
      switch (language) {
        case "javascript": {
          filePath = path.join(tempDir, `${jobId}.js`);
          fs.writeFileSync(filePath, prepareJSCode(code, input));
          command = `node "${filePath}"`;
          break;
        }

        case "python": {
          filePath = path.join(tempDir, `${jobId}.py`);
          fs.writeFileSync(filePath, preparePythonCode(code, input));
          command = `python "${filePath}"`;
          break;
        }

        case "java": {
          const className = `Main${jobId.replace(/-/g, "")}`;
          filePath = path.join(tempDir, `${className}.java`);
          const javaCode = code.replace(/class\s+\w+/, `class ${className}`);
          fs.writeFileSync(filePath, javaCode);
          command = `javac "${filePath}" && java -cp "${tempDir}" ${className}`;
          break;
        }

        default:
          return resolve({ error: "Unsupported language" });
      }

      const child = exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          // 🔥 Prefer real runtime errors from stderr
          if (stderr && stderr.trim()) {
            return resolve({ error: stderr.trim() });
          }

          // Fallback (rare)
          return resolve({ error: error.message });
        }

        resolve({ output: stdout });
      });


      if (input && !["python", "javascript"].includes(language)) {
        child.stdin.write(input);
        child.stdin.end();
      }
    } catch (err) {
      resolve({ error: err.message });
    }
  });
};

module.exports = { executeCode };