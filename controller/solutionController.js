const FormData = require("../Schema/solutionSchema");
const excelJS = require("exceljs");

// Create Record
exports.createSolution = async (req, res) => {
  try {
    const newForm = new FormData(req.body);
    await newForm.save();
    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit form", details: error.message });
  }
};

// Get All Records
exports.getSolutions = async (req, res) => {
  try {
    const solutions = await FormData.find();
    res.status(200).json(solutions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

// Update Record
exports.updateSolution = async (req, res) => {
  try {
    const updated = await FormData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Solution not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update solution", details: error.message });
  }
};

// Delete Record
exports.deleteSolution = async (req, res) => {
  try {
    await FormData.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data" });
  }
};

// Export Data to Excel
exports.exportSolutions = async (req, res) => {
  try {
    const solutions = await FormData.find();
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("ITSolutions Data");

    worksheet.columns = [
      { header: "Startup Name", key: "startupName", width: 20 },
      { header: "Founder Name", key: "founderName", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "Services", key: "services", width: 40 },
    ];

    solutions.forEach((solution) => {
      worksheet.addRow({
        startupName: solution.startupName,
        founderName: solution.founderName,
        email: solution.email,
        phoneNumber: solution.phoneNumber,
        services: solution.services.map(s => `${s.name} ($${s.quote})`).join(", "),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=solutions.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to export data", details: error.message });
  }
};
