const BusinessConsultation = require("../Schema/BusinessConsultation");

// Create new consultation
exports.createConsultation = async (req, res) => {
  try {
    const formData = req.body;

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "district",
      "linkedinProfile",
      "businessName",
      "businessDescription",
      "website",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const consultationData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      district: formData.district,
      linkedin: formData.linkedinProfile,
      businessName: formData.businessName,
      businessDescription: formData.businessDescription,
      website: formData.website,
      status: "new",
    };

    const newConsultation = new BusinessConsultation(consultationData);
    await newConsultation.save();

    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({ message: "Error submitting form" });
  }
};

// Get all consultations
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await BusinessConsultation.find();
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching consultations" });
  }
};

// Delete a consultation
exports.deleteConsultation = async (req, res) => {
  try {
    await BusinessConsultation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Consultation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete consultation" });
  }
};

// Update consultation status
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["new", "Processing", "Accepted"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedConsultation = await BusinessConsultation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedConsultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.json({ message: "Status updated successfully", data: updatedConsultation });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
