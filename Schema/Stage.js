const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema(
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

module.exports = mongoose.model('Stage', stageSchema);
