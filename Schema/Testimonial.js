const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: String,
  image: String,
  review: String,
  rating: Number
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;
