const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const controller = require("../controller/fundingController");

router.post("/", upload.single("logo"), controller.createFunding);
router.get("/", controller.getAllFundings);
router.get("/me", controller.getMyFundings);
router.get("/:id", controller.getFundingById);
router.put("/:id", upload.single("logo"), controller.updateFunding);
router.delete("/:id", controller.deleteFunding);

router.put("/update-status/:id", controller.updateStatus);
router.put("/approve/:id", controller.setApproved);
router.put("/hold/:id", controller.setHold);
router.put("/update-amount/:id", controller.updateAmountRaised);

module.exports = router;
