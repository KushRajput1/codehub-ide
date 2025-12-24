const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  createSnippet,
  getSnippet,
} = require("../controllers/snippetController");

router.post("/", protect, createSnippet);
router.get("/:id", getSnippet);

module.exports = router;