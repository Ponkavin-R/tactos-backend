const mongoose = require('mongoose');

const StartupSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  linkedin: String,
  startupName: String,
  industry: String,
  stage: String,
  website: String,
  location: String,
  incubation: String,
  pitchDeck: String,
  support: [String],
  password: {
    type: String,
    required: true
  },
  coFounder: String,
  status: {
    type: String,
    default: "hold",
  },
}, { timestamps: true });

module.exports = mongoose.model("Startup", StartupSchema); // Use consistent name
