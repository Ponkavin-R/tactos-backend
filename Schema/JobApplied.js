const mongoose = require('mongoose');

const jobAppliedSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  resumeUrl: String,
  userId: String,
  company: String,
  jobId: String,
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JobApplied", jobAppliedSchema);
