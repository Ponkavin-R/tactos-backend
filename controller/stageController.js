const Stage = require("../Schema/Stage");

// CREATE a new stage
exports.createStage = async (req, res) => {
  try {
    const { stageName } = req.body;
    const newStage = new Stage({ stageName });
    const savedStage = await newStage.save();
    res.status(201).json(savedStage);
  } catch (err) {
    res.status(400).json({ error: "Failed to create stage", details: err.message });
  }
};

// READ all stages
exports.getAllStages = async (req, res) => {
  try {
    const stages = await Stage.find().sort({ createdAt: -1 });
    res.status(200).json(stages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stages" });
  }
};

// UPDATE a stage
exports.updateStage = async (req, res) => {
  try {
    const { stageName } = req.body;
    const updatedStage = await Stage.findByIdAndUpdate(
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

// DELETE a stage
exports.deleteStage = async (req, res) => {
  try {
    const deletedStage = await Stage.findByIdAndDelete(req.params.id);
    if (!deletedStage) return res.status(404).json({ error: "Stage not found" });
    res.status(200).json({ message: "Stage deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete stage" });
  }
};
