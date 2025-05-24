const JobApplied = require('../Schema/JobApplied');

// POST: Apply for a job
exports.applyJob = async (req, res) => {
  try {
    const { name, email, phone, userId, company, jobId } = req.body;
    const resumeUrl = req.file?.path || "";

    const newApplication = new JobApplied({
      name,
      email,
      phone,
      resumeUrl,
      userId,
      company,
      jobId,
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Failed to submit application:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET: Get all applications for a specific job
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await JobApplied.find({ jobId }).exec();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
