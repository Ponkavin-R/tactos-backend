const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: String,
  quote: Number,
});

const solutionSchema = new mongoose.Schema(
  {
    startupName: String,
    founderName: String,
    email: String,
    phoneNumber: String,
    services: [serviceSchema],
    status: {
      type: String,
      enum: ["new", "processing", "accepted"],
      default: "new",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const FormData = mongoose.model("ITSolutions", solutionSchema);
module.exports = FormData;
