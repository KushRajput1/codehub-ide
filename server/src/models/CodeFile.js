const mongoose = require("mongoose");

const codeFileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Untitled File",
    },
    language: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      default: "",
    },
    input: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeFile", codeFileSchema);