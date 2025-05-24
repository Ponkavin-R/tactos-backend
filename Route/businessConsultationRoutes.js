const express = require("express");
const router = express.Router();
const {
  createConsultation,
  getAllConsultations,
  deleteConsultation,
  updateConsultationStatus,
} = require("../controller/businessConsultationController");

// POST: Submit form
router.post("/businessesconsulation", createConsultation);

// GET: Get all consultations
router.get("/businessesconsulation", getAllConsultations);

// DELETE: Delete consultation by ID
router.delete("/businessesconsulation/:id", deleteConsultation);

// PUT: Update status
router.put("/businessconsultation/:id", updateConsultationStatus);

module.exports = router;
