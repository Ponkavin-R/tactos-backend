const StartupStage = require("../Schema/StartupStage");

// CREATE
exports.createStartupStage = async (req, res) => {
  try {
    const { stageName } = req.body;
    const newStage = new StartupStage({ stageName });
    const savedStage = await newStage.save();
    res.status(201).json(savedStage);
  } catch (err) {
    res.status(400).json({ error: "Failed to create stage", details: err.message });
  }
};

// READ
exports.getAllStartupStages = async (req, res) => {
  try {
    const stages = await StartupStage.find().sort({ createdAt: -1 });
    res.status(200).json(stages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stages" });
  }
};

// UPDATE
exports.updateStartupStage = async (req, res) => {
  try {
    const { stageName } = req.body;
    const updatedStage = await StartupStage.findByIdAndUpdate(
      req.params.id,
      { stageName },
      { new: true }
    );
    if (!updatedStage) return res.status(404).json({ error: "Stage not found" });
    res.status(200).json(updatedStage);
  } catch (err) {
    res.status(400).json({ error: "Failed to update stage", details: err.message });
  }
};

// DELETE
exports.deleteStartupStage = async (req, res) => {
  try {
    const deletedStage = await StartupStage.findByIdAndDelete(req.params.id);
    if (!deletedStage) return res.status(404).json({ error: "Stage not found" });
    res.status(200).json({ message: "Stage deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete stage" });
  }
};
