const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  type: String,
  status: String,
  amount: String,
  paymentLink: String,
  mode: String,
  date: String,
  time: String,
  link: String,
  location: String,
  logo: String,
});

module.exports = mongoose.model("Event", EventSchema);
