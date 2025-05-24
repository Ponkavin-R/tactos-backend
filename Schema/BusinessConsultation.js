const mongoose = require("mongoose");

const BusinessConsultationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    district: { type: String, required: true },
    linkedin: { type: String },
    businessName: { type: String, required: true },
    businessDescription: { type: String, required: true },
    website: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "process", "approve"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BusinessConsultation", BusinessConsultationSchema);
