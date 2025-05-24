const Sector = require("../Schema/Sector");

// CREATE a new sector
exports.createSector = async (req, res) => {
  try {
    const { sectorName } = req.body;
    const newSector = new Sector({ sectorName });
    const savedSector = await newSector.save();
    res.status(201).json(savedSector);
  } catch (err) {
    res.status(400).json({ error: "Failed to create sector", details: err.message });
  }
};

// READ all sectors
exports.getAllSectors = async (req, res) => {
  try {
    const sectors = await Sector.find().sort({ createdAt: -1 });
    res.status(200).json(sectors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sectors" });
  }
};

// UPDATE a sector
exports.updateSector = async (req, res) => {
  try {
    const { sectorName } = req.body;
    const updatedSector = await Sector.findByIdAndUpdate(
      req.params.id,
      { sectorName },
      { new: true }
    );
    if (!updatedSector) return res.status(404).json({ error: "Sector not found" });
    res.status(200).json(updatedSector);
  } catch (err) {
    res.status(400).json({ error: "Failed to update sector", details: err.message });
  }
};

// DELETE a sector
exports.deleteSector = async (req, res) => {
  try {
    const deletedSector = await Sector.findByIdAndDelete(req.params.id);
    if (!deletedSector) return res.status(404).json({ error: "Sector not found" });
    res.status(200).json({ message: "Sector deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete sector" });
  }
};
