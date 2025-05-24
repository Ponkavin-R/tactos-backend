const EventRegistration = require("../Schema/EventRegistration");

exports.registerEvent = async (req, res) => {
  try {
    const { name, email, phone, eventId, eventName, eventType } = req.body;

    let screenshotPath = null;

    if (eventType?.toLowerCase() === "paid") {
      if (!req.file) {
        return res.status(400).json({ error: "Screenshot is required for paid events" });
      }
      screenshotPath = `/uploads/${req.file.filename}`;
    }

    const newRegistration = new EventRegistration({
      name,
      email,
      phone,
      eventId,
      eventName: eventName || null,
      eventType: eventType || null,
      screenshot: screenshotPath,
    });

    await newRegistration.save();
    res.status(201).json({ message: "Event saved successfully!" });
  } catch (err) {
    console.error("Error saving event:", err);
    res.status(500).json({ error: "Error saving event", detail: err.message });
  }
};

exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await EventRegistration.find({ eventId });
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Failed to fetch registrations." });
  }
};

exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    await EventRegistration.findByIdAndDelete(id);
    res.status(200).json({ message: "Registration deleted successfully" });
  } catch (err) {
    console.error("Error deleting registration:", err);
    res.status(500).json({ error: "Error deleting registration", detail: err.message });
  }
};
