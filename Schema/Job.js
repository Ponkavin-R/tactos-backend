const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: String,
  company: String,
  logo: String,
  isNew: Boolean,
  featured: Boolean,
  position: String,
  role: String,
  level: String,
  postedAt: String,
  contract: String,
  district: String,
  salary: String,
  experience: String,
  dateOfJoining: String,
  languages: [String],
  tools: [String],
  shortDescription: {
    type: String,
    maxlength: 300,
  },
  longDescription: {
    type: String,
  },
});

module.exports = mongoose.model("Job", jobSchema);
