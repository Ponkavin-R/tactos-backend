const mongoose = require("mongoose");

const fundingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Startup", required: true },
    youtube: String,
    location: String,
    sector: String,
    shortDescription: String,
    longDescription: String,
    logoUrl: String,
    stage: String,
    status: {
      type: String,
      enum: ["waiting", "approved", "on hold"],
      default: "waiting",
    },
    amountSeeking: Number,
    equityOffered: Number,
    valuation: Number,
    fundUsage: String,
    minimumInvestment: Number,
    ticketSize: Number,
    roleProvided: String,
    amountRaised: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Funding", fundingSchema);
