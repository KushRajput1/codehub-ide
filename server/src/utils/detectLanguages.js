const { execSync } = require("child_process");

const detectLanguages = () => {
  const languages = [];

  try {
    execSync("node -v", { stdio: "ignore" });
    languages.push({ key: "javascript", label: "JavaScript" });
  } catch {}

  try {
    execSync("python --version", { stdio: "ignore" });
    languages.push({ key: "python", label: "Python" });
  } catch {}

  try {
    execSync("javac -version", { stdio: "ignore" });
    languages.push({ key: "java", label: "Java" });
  } catch {}

  return languages;
};

module.exports = detectLanguages;