const connectDB = require("./config/db");

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const protect = require("./middlewares/authMiddleware");
const codeFileRoutes = require("./routes/codeFileRoutes");
const runRoutes = require("./routes/runRoutes");
const snippetRoutes = require("./routes/snippetRoutes");
const languageRoutes = require("./routes/languageRoutes");

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/files", codeFileRoutes);
app.use("/api/run", runRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/languages", languageRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Code IDE Backend is running 🚀");
});

// Temporary test route
app.get("/api/test/protected", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
