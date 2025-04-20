const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Ensure the 'uploads' folder exists
const fs = require("fs");
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// File Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Schema & Model
const StartupSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  linkedin: String,
  startupName: String,
  industry: String,
  stage: String,
  website: String,
  location: String,
  incubation: String,
  pitchDeck: String, // Stores file path
  support: [String],
  coFounder: String,
});

const Startup = mongoose.model("startup-reg", StartupSchema);

// API Route to Handle Form Submission
app.post("/api/register", upload.single("pitchDeck"), async (req, res) => {
  try {
    const formData = req.body;
    if (req.file) {
      formData.pitchDeck = `/uploads/${req.file.filename}`;
    }
    
    const newStartup = new Startup(formData);
    await newStartup.save();

    res.status(201).json({ message: "Startup registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});




// Define the schema
const CofounderSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phone: String,
    linkedin: String,
    location: String,
    role: String,
    expertise: String,
    experience: Number,
    achievements: String,
    industries: [String],
    stagePreference: String,
    businessModel: String,
    skills: [String],
    expectedRole: String,
    investmentCapacity: Number,
    cofounderReason: String,
    resume: String, // File path
  });
  
  const Cofounder = mongoose.model("Cofounder", CofounderSchema);
  
  // API route to handle form submission
  app.post("/api/cofounderregister", upload.single("resume"), async (req, res) => {
    try {
      const formData = req.body;
      if (req.file) {
        formData.resume = `/uploads/${req.file.filename}`;
      }
      
      const newCofounder = new Cofounder(formData);
      await newCofounder.save();
  
      res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error. Please try again." });
    }
  });



  const BusinessSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phone: String,
    location: String,
    role: String,
    industry: String,
    experience: Number,
    skillset: [String],
    fieldOfStudy: String,
    businessReason: String,
    businessStage: String,
    cofoundingInterest: String,
    preferredIndustries: [String],
    budget: String,
    businessModel: String,
    challenges: [String],
    mentorship: String,
    networking: String,
    additionalComments: String
  });
  
  const Business = mongoose.model("Business", BusinessSchema);
  
  app.post("/api/businessideationhub", upload.none(), async (req, res) => {
    try {
      const businessData = new Business(req.body);
      await businessData.save();
      res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });




  // Define Schema
const BusinessConsultationSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phone: String,
    location: String,
    businessName: String,
    industry: String,
    businessStage: String,
    website: String,
    consultationNeeds: [String],
    businessDescription: String,
    keyChallenges: String,
    mentorship: String,
    consultationExpectations: String,
    preferredDateTime: String,
    supportingDocuments: [String],
  });
  
  const BusinessConsultation = mongoose.model(
    "BusinessConsultation",
    BusinessConsultationSchema
  );
  
  // API Route to handle form submission
  app.post("/api/businessconsultation", upload.array("supportingDocuments"), async (req, res) => {
    try {
      const formData = req.body;
      const uploadedFiles = req.files ? req.files.map((file) => file.path) : [];
  
      const newConsultation = new BusinessConsultation({
        ...formData,
        supportingDocuments: uploadedFiles,
      });
  
      await newConsultation.save();
      res.status(201).json({ message: "Form submitted successfully" });
    } catch (error) {
      console.error("Error saving form data:", error);
      res.status(500).json({ message: "Error submitting form" });
    }
  });


  // Define Mongoose Schema & Model
const formSchema = new mongoose.Schema({
    startupName: String,
    founderName: String,
    email: String,
    phoneNumber: String,
    service: [String],
    needQuote: Boolean,
    quoteAmount: Number,
  });
  
  const FormData = mongoose.model("ITSolutions", formSchema);
  
  // Route to Handle Form Submission
  app.post("/api/solutions", async (req, res) => {
    try {
      const newForm = new FormData(req.body);
      await newForm.save();
      res.status(201).json({ message: "Form submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit form", details: error });
    }
  });

  // Fetch all records
app.get("/api/solutions", async (req, res) => {
  try {
    const solutions = await FormData.find();
    res.status(200).json(solutions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Add a new record
app.post("/api/solutions", async (req, res) => {
  try {
    const newForm = new FormData(req.body);
    await newForm.save();
    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit form", details: error });
  }
});

// Update a record
app.put("/api/solutions/:id", async (req, res) => {
  try {
    const updatedData = await FormData.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to update data" });
  }
});

// Delete a record
app.delete("/api/solutions/:id", async (req, res) => {
  try {
    await FormData.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data" });
  }
});

// Download Excel
app.get("/api/solutions/export", async (req, res) => {
  try {
    const solutions = await FormData.find();
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("ITSolutions Data");

    worksheet.columns = [
      { header: "Startup Name", key: "startupName", width: 20 },
      { header: "Founder Name", key: "founderName", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone Number", key: "phoneNumber", width: 15 },
      { header: "Service", key: "service", width: 20 },
      { header: "Need Quote", key: "needQuote", width: 10 },
      { header: "Quote Amount", key: "quoteAmount", width: 15 },
      { header: "Status", key: "status", width: 10 },
    ];

    solutions.forEach((solution) => worksheet.addRow(solution));
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=solutions.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to export data" });
  }
});


  // Backend Update - Express API

app.get("/api/stats", async (req, res) => {
  try {
    const startupCount = await Startup.countDocuments();
    const cofounderCount = await Cofounder.countDocuments();
    const businessCount = await Business.countDocuments();
    const consultationCount = await BusinessConsultation.countDocuments();
    const career= await Career.countDocuments();
    const events= await Event.countDocuments();
    const solution= await FormData.countDocuments();

    res.status(200).json({
      startupCount,
      cofounderCount,
      businessCount,
      consultationCount,
      career,
      events,
      solution,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error retrieving stats" });
  }
});
  

// API Route to Get All Startups
app.get("/api/startups", async (req, res) => {
  try {
    const startups = await Startup.find();
    res.status(200).json(startups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching startups", error });
  }
});

// API Route to Delete a Startup
app.delete("/api/startups/:id", async (req, res) => {
  try {
    await Startup.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Startup deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting startup", error });
  }
});


const careerSchema = new mongoose.Schema({
  company: String,
  logo: String,
  isNew: Boolean,
  featured: Boolean,
  position: String,
  role: String,
  level: String,
  postedAt: String,
  contract: String,
  location: String,
  salary: String,
  experience: String,
  dateOfJoining: String,
  languages: [String],
  tools: [String],
}, { timestamps: true });

const Career=mongoose.model("Career", careerSchema);


app.get("/api/careers", async (req, res) => {
  const careers = await Career.find().sort({ createdAt: -1 });
  res.json(careers);
});

// Add new career
app.post("/api/careers", async (req, res) => {
  try {
    const newCareer = new Career(req.body);
    const savedCareer = await newCareer.save();
    res.status(201).json(savedCareer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a career by ID
app.delete("/api/careers/:id", async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: "Career deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/careers/:id", async (req, res) => {
  try {
    const updatedCareer = await Career.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated document
    );
    if (!updatedCareer) return res.status(404).json({ error: "Career not found" });
    res.json(updatedCareer);
  } catch (error) {
    console.error("Error updating career:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get('/api/careers/:id', async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mongoose schema
const recruitmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  resumeUrl: String,
  jobId: String,
  appliedAt: { type: Date, default: Date.now },
});

const Recruitment = mongoose.model("Recruitment", recruitmentSchema);

// API route
app.post("/api/recruitment/apply", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, jobId } = req.body;
    const resumeUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : "";

    const newApplication = new Recruitment({ name, email, phone, resumeUrl, jobId });
    await newApplication.save();

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



const EventSchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  type: String,
  status: String,
  amount: String,
  paymentLink: String,
  mode: String,
  date: String,
  time: String,
  link: String,
  location: String,
  logo: String,
});

const Event = mongoose.model("Event", EventSchema);

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post("/api/events", upload.single("logo"), async (req, res) => {
  try {
    const formData = req.body;
    if (req.file) {
      formData.logo = `/uploads/${req.file.filename}`;
    }
    const event = new Event(formData);
    await event.save();
    res.status(201).json({ message: "Event saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Error saving event" });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.patch("/api/events/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event status" });
  }
});
app.delete("/api/events/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Get a particular event by ID
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});


// Mongoose Schema
const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventId: { type: String, required: true },
  eventName: { type: String, default: null },
  eventType: { type: String, default: null },
  screenshot: { type: String, default: null },
});

const EventRegistration = mongoose.model("eventregistration", registrationSchema);

// Route to handle registration
app.post("/api/register", upload.single("screenshot"), async (req, res) => {
  try {
    const { name, email, phone, eventId, eventName, eventType } = req.body;

    // Log request data for debugging
    console.log("Body:", req.body);
    console.log("File:", req.file);

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
});





// GET all cofounders
app.get("/api/cofounders", async (req, res) => {
  try {
    const cofounders = await Cofounder.find();
    res.status(200).json(cofounders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cofounders" });
  }
});

// DELETE a cofounder
app.delete("/api/cofounders/:id", async (req, res) => {
  try {
    await Cofounder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Cofounder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete cofounder" });
  }
});


// GET all businesses
app.get("/api/businesses", async (req, res) => {
  try {
    const cofounders = await Business.find();
    res.status(200).json(cofounders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cofounders" });
  }
});

// DELETE a businesses
app.delete("/api/businesses/:id", async (req, res) => {
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Cofounder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete cofounder" });
  }
});

// GET all businesses-consultation
app.get("/api/businessesconsulation", async (req, res) => {
  try {
    const cofounders = await BusinessConsultation.find();
    res.status(200).json(cofounders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cofounders" });
  }
});

// DELETE a businesses-consultation
app.delete("/api/businessesconsultation/:id", async (req, res) => {
  try {
    await BusinessConsultation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Cofounder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete cofounder" });
  }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
