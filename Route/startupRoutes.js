const express = require("express");
const upload = require("../middleware/upload"); // create if needed
const router = express.Router();
const controller = require("../controller/startupController");

router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);
router.post("/register", upload.single("pitchDeck"), controller.registerStartup);
router.get("/startups", controller.getAllStartups);
router.get("/startups/:id", controller.getStartupById);
router.put("/startups/:id", controller.updateStartup);
router.delete("/startups/:id", controller.deleteStartup);
router.put("/startups/hold/:id", controller.setHoldStatus);
router.put("/startups/activate/:id", controller.activateStartup);
router.post("/startup-login", controller.loginStartup);
router.get('/startups/user/:userId', controller.getStartupByUserId);

module.exports = router;
