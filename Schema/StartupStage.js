const mongoose = require("mongoose");

const startupstageSchema = new mongoose.Schema(
  {
    stageName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StartupStage", startupstageSchema);
