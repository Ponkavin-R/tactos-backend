const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  fundingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Funding',
    required: true,
  },
  type: {
    type: String,
    enum: ['Individual', 'Organization'],
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Interest', interestSchema);
