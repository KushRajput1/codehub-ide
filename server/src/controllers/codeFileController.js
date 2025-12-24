const CodeFile = require("../models/CodeFile");

// Create new file
const createFile = async (req, res) => {
  try {
    const { language, title, code } = req.body;

    if (!language) {
      return res.status(400).json({ message: "Language is required" });
    }

    const file = await CodeFile.create({
      user: req.user.id,
      language,
      title,
      code: code || "",
    });


    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all files of user
const getFiles = async (req, res) => {
  try {
    const files = await CodeFile.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single file
const getFileById = async (req, res) => {
  try {
    const file = await CodeFile.findById(req.params.id);

    if (!file || file.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update file
const updateFile = async (req, res) => {
  try {
    const { code, input, title, language } = req.body;

    const file = await CodeFile.findById(req.params.id);

    if (!file || file.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "File not found" });
    }

    file.code = code ?? file.code;
    file.input = input ?? file.input;
    file.title = title ?? file.title;
    file.language = language ?? file.language; // ✅ allow language change

    await file.save();

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const file = await CodeFile.findById(req.params.id);

    if (!file || file.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "File not found" });
    }

    await file.deleteOne();
    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createFile,
  getFiles,
  getFileById,
  updateFile,
  deleteFile,
};