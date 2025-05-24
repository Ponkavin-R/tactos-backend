const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    eventId: { type: String, required: true },
    eventName: { type: String, default: null },
    eventType: { type: String, default: null },
    screenshot: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("eventregistration", registrationSchema);
