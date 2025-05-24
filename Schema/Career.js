const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema({
  company: String,
  logo: String,
  isNew: Boolean,
  featured: Boolean,
  position: String,
  role: String,
  level: String,
  postedAt: String,
  contract: String,
  location: String,
  salary: String,
  experience: String,
  dateOfJoining: String,
  languages: [String],
  tools: [String],
}, { timestamps: true });

const Career = mongoose.model("Career", careerSchema);

module.exports = Career;
