const express = require("express");
const router = express.Router();
const {
  createSolution,
  getSolutions,
  updateSolution,
  deleteSolution,
  exportSolutions,
} = require("../controller/solutionController");

router.post("/solutions", createSolution);
router.get("/solutions", getSolutions);
router.put("/solutions/:id", updateSolution);
router.delete("/solutions/:id", deleteSolution);
router.get("/solutions/export", exportSolutions);

module.exports = router;
