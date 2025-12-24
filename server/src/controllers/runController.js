const { executeCode } = require("../utils/codeExecutor");

const runCode = async (req, res) => {
  try {
    const { language, code, input } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: "Language and code are required" });
    }

    const result = await executeCode(language, code, input || "");

    if (result.error) {
      return res.json({ error: result.error });
    }

    res.json({ output: result.output });
  } catch (error) {
    res.status(500).json({ message: "Execution failed" });
  }
};

module.exports = { runCode };