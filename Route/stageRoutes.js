const express = require("express");
const router = express.Router();
const {
  createStage,
  getAllStages,
  updateStage,
  deleteStage,
} = require("../controller/stageController");

router.post("/stage", createStage);
router.get("/stage", getAllStages);
router.put("/stage/:id", updateStage);
router.delete("/stage/:id", deleteStage);

module.exports = router;
