const Career = require("../Schema/Career");

// Get all careers
exports.getAllCareers = async (req, res) => {
  try {
    const careers = await Career.find().sort({ createdAt: -1 });
    res.json(careers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single career by ID
exports.getCareerById = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new career
exports.createCareer = async (req, res) => {
  try {
    const newCareer = new Career(req.body);
    const savedCareer = await newCareer.save();
    res.status(201).json(savedCareer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update career
exports.updateCareer = async (req, res) => {
  try {
    const updatedCareer = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCareer) return res.status(404).json({ error: "Career not found" });
    res.json(updatedCareer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete career
exports.deleteCareer = async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: "Career deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
