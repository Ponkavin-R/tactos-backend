const Funding = require("../Schema/Funding");

exports.createFunding = async (req, res) => {
    try {
      const {
        userId, youtube, location, sector, shortDescription, longDescription, stage,
        amountSeeking, equityOffered, valuation, fundUsage, minimumInvestment,
        ticketSize, roleProvided, amountRaised
      } = req.body;
  
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
  
      const logoUrl = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : undefined;
  
      const funding = new Funding({
        userId, youtube, location, sector, shortDescription, longDescription, stage,
        logoUrl, status: "waiting", amountSeeking, equityOffered, valuation,
        fundUsage, minimumInvestment, ticketSize, roleProvided, amountRaised
      });
  
      await funding.save();
      res.status(201).json({ message: "Funding entry created", funding });
    } catch (err) {
      console.error("Error creating funding:", err);
      res.status(500).json({ error: "Failed to create funding", details: err.message });
    }
  };
  

exports.getFundingById = async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id);
    if (!funding) return res.status(404).json({ error: "Funding not found" });
    res.json(funding);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch funding" });
  }
};

exports.getMyFundings = async (req, res) => {
  try {
    const userId = req.query.userId;
    const fundings = await Funding.find({ userId });
    res.json(fundings);
  } catch (err) {
    console.error('Error fetching fundings:', err);
    res.status(500).json({ error: 'Failed to fetch fundings' });
  }
};

exports.updateFunding = async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id);
    if (!funding) return res.status(404).json({ error: "Funding not found" });

    const {
      youtube, location, sector, shortDescription, longDescription,
      stage, amountSeeking, equityOffered, valuation, fundUsage,
      minimumInvestment, ticketSize, roleProvided, amountRaised
    } = req.body;

    funding.youtube = youtube;
    funding.location = location;
    funding.sector = sector;
    funding.shortDescription = shortDescription;
    funding.longDescription = longDescription;
    funding.stage = stage;
    funding.amountSeeking = amountSeeking;
    funding.equityOffered = equityOffered;
    funding.valuation = valuation;
    funding.fundUsage = fundUsage;
    funding.minimumInvestment = minimumInvestment;
    funding.ticketSize = ticketSize;
    funding.roleProvided = roleProvided;
    funding.amountRaised = amountRaised;

    if (req.file) {
      funding.logoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    await funding.save();
    res.json({ message: "Funding updated", funding });
  } catch (err) {
    res.status(500).json({ error: "Failed to update funding" });
  }
};

exports.getAllFundings = async (req, res) => {
    try {
      const fundings = await Funding.find();
      res.json(fundings);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch fundings" });
    }
  };
  
exports.deleteFunding = async (req, res) => {
  try {
    const deleted = await Funding.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Funding not found" });
    res.status(200).json({ message: "Funding deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete funding" });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!["waiting", "approved", "on hold"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const updated = await Funding.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Funding not found" });
    res.status(200).json({ message: "Status updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.setApproved = async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id);
    if (!funding) return res.status(404).json({ error: "Funding not found" });
    funding.status = "approved";
    await funding.save();
    res.json({ message: "Funding approved", funding });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve funding" });
  }
};

exports.setHold = async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id);
    if (!funding) return res.status(404).json({ message: "Funding not found" });
    funding.status = "on hold";
    await funding.save();
    res.status(200).json(funding);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAmountRaised = async (req, res) => {
  const { id } = req.params;
  const { amountRaised } = req.body;

  try {
    const updated = await Funding.findByIdAndUpdate(
      id,
      { amountRaised },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Funding not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
