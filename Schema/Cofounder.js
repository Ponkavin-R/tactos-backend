const mongoose = require('mongoose');

const CofounderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  linkedin: { type: String, required: true },
  district: { type: String, required: true },
  employmentStatus: {
    type: String,
    enum: ["Employed", "Unemployed", "Student"],
    required: true
  },
  industries: [{ type: String, required: true }],
  resume: { type: String, required: true },
  hold: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Cofounder", CofounderSchema);
