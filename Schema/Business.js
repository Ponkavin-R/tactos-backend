const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  district: { type: String, required: true },
  linkedin: { type: String },
  employmentStatus: { type: String, enum: ["Employed", "Unemployed", "Studying"], required: true },
  cv: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["new", "processing", "accept"], default: "new" }
});

module.exports = mongoose.model("Business", BusinessSchema);