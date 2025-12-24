const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  createFile,
  getFiles,
  getFileById,
  updateFile,
  deleteFile,
} = require("../controllers/codeFileController");

router.post("/", protect, createFile);
router.get("/", protect, getFiles);
router.get("/:id", protect, getFileById);
router.put("/:id", protect, updateFile);
router.delete("/:id", protect, deleteFile);

module.exports = router;