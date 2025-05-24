const Business = require('../Schema/Business');

exports.registerBusiness = async (req, res) => {
  try {
    const businessData = new Business({
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      district: req.body.district,
      linkedin: req.body.linkedin,
      employmentStatus: req.body.employmentStatus,
      cv: req.file ? req.file.path : "",
      date: new Date(),
      status: "new",
    });
    await businessData.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching businesses" });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Business deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete business" });
  }
};

exports.updateBusinessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["new", "processing", "accept"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({ message: "Status updated successfully", data: updatedBusiness });
  } catch (error) {
    console.error("Error updating business status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};