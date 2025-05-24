const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
  industryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

const Industry = mongoose.model('Industry', industrySchema);

module.exports = Industry;
