const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  registerEvent,
  getRegistrationsByEvent,
  deleteRegistration,
} = require("../controller/eventRegistrationController");

router.post("/eventregister", upload.single("screenshot"), registerEvent);
router.get("/eventregistrations/:eventId", getRegistrationsByEvent);
router.delete("/eventregistrations/:id", deleteRegistration);

module.exports = router;
