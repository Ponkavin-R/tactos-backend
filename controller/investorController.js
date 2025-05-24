const OurInvestor = require("../Schema/Investor");

// Fetch all investors
exports.getInvestors = async (req, res) => {
  try {
    const data = await OurInvestor.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching investors", error: err });
  }
};

// Add new investor
exports.addInvestor = async (req, res) => {
  try {
    const { type, name, image } = req.body;
    const newInvestor = new OurInvestor({ type, name, image });
    await newInvestor.save();
    res.status(201).json(newInvestor);
  } catch (err) {
    res.status(500).json({ message: "Error adding investor", error: err });
  }
};

// Update investor
exports.updateInvestor = async (req, res) => {
  try {
    const { type, name, image } = req.body;
    const updatedInvestor = await OurInvestor.findByIdAndUpdate(
      req.params.id,
      { type, name, image },
      { new: true }
    );
    res.status(200).json(updatedInvestor);
  } catch (err) {
    res.status(500).json({ message: "Error updating investor", error: err });
  }
};

// Delete investor
exports.deleteInvestor = async (req, res) => {
  try {
    await OurInvestor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Investor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting investor", error: err });
  }
};
