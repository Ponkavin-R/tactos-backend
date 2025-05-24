const mongoose = require('mongoose');

const investorToggleSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
});

const InvestorToggle = mongoose.model("InvestorToggle", investorToggleSchema);

module.exports = InvestorToggle;
