const express = require("express");
const router = express.Router();
const {
  getAllCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer
} = require("../controller/careerController");

router.get("/careers", getAllCareers);
router.get("/careers/:id", getCareerById);
router.post("/careers", createCareer);
router.put("/careers/:id", updateCareer);
router.delete("/careers/:id", deleteCareer);

module.exports = router;
