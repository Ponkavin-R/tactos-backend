const mongoose = require("mongoose");

const investorSchema = new mongoose.Schema({
  type: String,
  name: String,
  image: String,
});

const OurInvestor = mongoose.model("OurInvestor", investorSchema);

module.exports = OurInvestor;
