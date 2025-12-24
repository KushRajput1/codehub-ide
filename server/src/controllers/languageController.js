const detectLanguages = require("../utils/detectLanguages");

const getLanguages = (req, res) => {
  try {
    const languages = detectLanguages();
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: "Failed to detect languages" });
  }
};

module.exports = { getLanguages };