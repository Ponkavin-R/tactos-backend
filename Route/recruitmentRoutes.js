const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const recruitmentController = require("../controller/recruitmentController");

router.post("/apply", upload.single("resume"), recruitmentController.applyRecruitment);
router.get("/applicants", recruitmentController.getNewApplicants);
router.get("/", recruitmentController.getRecruitments);
router.put("/:id", recruitmentController.updateRecruitment);
router.delete("/:id", recruitmentController.deleteRecruitment);
router.get("/export/excel", recruitmentController.exportRecruitments);

module.exports = router;
