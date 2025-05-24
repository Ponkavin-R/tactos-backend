const express = require("express");
const router = express.Router();
const {
  createStartupStage,
  getAllStartupStages,
  updateStartupStage,
  deleteStartupStage,
} = require("../controller/startupStageController");

router.post("/startupstage", createStartupStage);
router.get("/startupstage", getAllStartupStages);
router.put("/startupstage/:id", updateStartupStage);
router.delete("/startupstage/:id", deleteStartupStage);

module.exports = router;
