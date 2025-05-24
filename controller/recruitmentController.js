const Recruitment = require("../Schema/Recruitment");
const ExcelJS = require("exceljs");

exports.applyRecruitment = async (req, res) => {
  try {
    const { name, email, phone, jobId } = req.body;
    const resumeUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : "";

    const newApplication = new Recruitment({ name, email, phone, resumeUrl, jobId });
    await newApplication.save();

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getNewApplicants = async (req, res) => {
  try {
    const applicants = await Recruitment.find({ status: "new" }).populate("jobId", "role");
    res.json(applicants);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRecruitments = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const query = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            $or: [
              { name: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
              { phone: new RegExp(search, "i") },
            ]
          }
        : {})
    };

    const applicants = await Recruitment.find(query).populate("jobId", "role");
    res.json(applicants);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRecruitment = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    const updated = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error updating applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRecruitment = async (req, res) => {
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.exportRecruitments = async (req, res) => {
  try {
    const data = await Recruitment.find().populate("jobId", "role");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applicants");

    worksheet.columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Phone", key: "phone" },
      { header: "Job Role", key: "role" },
      { header: "Status", key: "status" },
      { header: "Resume URL", key: "resumeUrl" },
      { header: "Applied At", key: "appliedAt" }
    ];

    data.forEach((app) => {
      worksheet.addRow({
        name: app.name,
        email: app.email,
        phone: app.phone,
        role: app.jobId?.role || "N/A",
        status: app.status,
        resumeUrl: app.resumeUrl,
        appliedAt: app.appliedAt.toISOString()
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=applicants.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting Excel:", err);
    res.status(500).json({ message: "Failed to export Excel" });
  }
};
