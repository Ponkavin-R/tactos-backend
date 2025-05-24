const Testimonial = require("../Schema/Testimonial");

// GET all testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// POST - create new testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { name, image, review, rating } = req.body;
    const newTestimonial = new Testimonial({ name, image, review, rating });
    await newTestimonial.save();
    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(500).json({ error: "Failed to create testimonial" });
  }
};

// PUT - update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { name, image, review, rating } = req.body;
    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, image, review, rating },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
};

// DELETE - delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
};
