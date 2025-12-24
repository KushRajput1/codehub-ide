const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { runCode } = require("../controllers/runController");

router.post("/", protect, runCode);

module.exports = router;