const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getAllEvents,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getEventById,
} = require("../controller/eventController");

router.get("/events", getAllEvents);
router.post("/events", upload.single("logo"), createEvent);
router.get("/events/:id", getEventById);
router.put("/events/:id", updateEvent);
router.patch("/events/:id", updateEventStatus);
router.delete("/events/:id", deleteEvent);

module.exports = router;
