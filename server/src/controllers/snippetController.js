const Snippet = require("../models/Snippet");
const CodeFile = require("../models/CodeFile");

// Create snippet
const createSnippet = async (req, res) => {
  try {
    const { fileId } = req.body;

    const file = await CodeFile.findById(fileId);
    if (!file || file.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "File not found" });
    }

    let snippet = await Snippet.findOne({ file: fileId });
    if (!snippet) {
      snippet = await Snippet.create({ file: fileId });
    }

    res.json({ snippetId: snippet._id });
  } catch (error) {
    res.status(500).json({ message: "Snippet creation failed" });
  }
};

// Get snippet (public)
const getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id).populate("file");
    if (!snippet || !snippet.isPublic) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    snippet.views += 1;
    await snippet.save();

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch snippet" });
  }
};

module.exports = { createSnippet, getSnippet };