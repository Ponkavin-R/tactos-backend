const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema(
  {
    sectorName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sector', sectorSchema);
