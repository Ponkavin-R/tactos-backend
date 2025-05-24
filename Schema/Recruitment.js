const mongoose = require("mongoose");

const recruitmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  resumeUrl: String,
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['new', 'viewed', 'shortlisted'],
    default: 'new',
  },
});

module.exports = mongoose.model("Recruitment", recruitmentSchema);
