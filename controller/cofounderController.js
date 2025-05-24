const Cofounder = require('../Schema/Cofounder');

// Register cofounder
exports.registerCofounder = async (req, res) => {
  try {
    const formData = req.body;
    if (req.file) {
      formData.resume = `/uploads/${req.file.filename}`;
    }

    const newCofounder = new Cofounder(formData);
    await newCofounder.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get all cofounders with search, filter, and date range
exports.getAllCofounders = async (req, res) => {
  try {
    const { search, filter, from, to, industry } = req.query;
    const query = {};

    if (search && filter) {
      query[filter] = { $regex: search, $options: "i" };
    }

    if (industry) {
      query.industries = industry;
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const cofounders = await Cofounder.find(query).sort({ createdAt: -1 });
    res.status(200).json(cofounders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cofounders" });
  }
};

// Delete cofounder by ID
exports.deleteCofounder = async (req, res) => {
  try {
    await Cofounder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Cofounder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete cofounder" });
  }
};

// Update cofounder status (hold field)
exports.updateCofounderStatus = async (req, res) => {
  try {
    const { hold } = req.body;
    const updated = await Cofounder.findByIdAndUpdate(
      req.params.id,
      { hold },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status" });
  }
};
