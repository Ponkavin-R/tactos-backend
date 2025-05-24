const Industry = require('../Schema/Industry');

// CREATE a new industry
exports.createIndustry = async (req, res) => {
  try {
    const { industryName } = req.body;
    const newIndustry = new Industry({ industryName });
    const savedIndustry = await newIndustry.save();
    res.status(201).json(savedIndustry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create industry', details: err.message });
  }
};

// READ all industries
exports.getAllIndustries = async (req, res) => {
  try {
    const industries = await Industry.find().sort({ createdAt: -1 });
    res.status(200).json(industries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch industries' });
  }
};

// UPDATE an industry by ID
exports.updateIndustry = async (req, res) => {
  try {
    const { industryName } = req.body;
    const updatedIndustry = await Industry.findByIdAndUpdate(
      req.params.id,
      { industryName },
      { new: true }
    );
    if (!updatedIndustry) return res.status(404).json({ error: 'Industry not found' });
    res.status(200).json(updatedIndustry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update industry', details: err.message });
  }
};

// DELETE an industry by ID
exports.deleteIndustry = async (req, res) => {
  try {
    const deletedIndustry = await Industry.findByIdAndDelete(req.params.id);
    if (!deletedIndustry) return res.status(404).json({ error: 'Industry not found' });
    res.status(200).json({ message: 'Industry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete industry' });
  }
};
