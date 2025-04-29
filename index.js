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
const StartupSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: true
    },
    
    coFounder: String,
    status: {
      type: String,
      default: "hold", // or "pending", "hold"
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);


const Startup = mongoose.model("startup-reg", StartupSchema);

// API Route to Handle Form Submission
app.post("/api/register", upload.single("pitchDeck"), async (req, res) => {
  try {
    const formData = req.body;
    
    if (req.file) {
      formData.pitchDeck = `/uploads/${req.file.filename}`;
    }

    // Generate password using first 3 letters of fullName and startupName
    const namePart = (formData.fullName || "").slice(0, 3);
    const startupPart = (formData.startupName || "").slice(0, 3);
    formData.password = (namePart + startupPart).toLowerCase();

    const newStartup = new Startup(formData);
    await newStartup.save();

    res.status(201).json({ message: "Startup registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
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
// PUT /api/startups/hold/:id
app.put("/api/startups/hold/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Startup.findByIdAndUpdate(id, { $set: { status: "hold" } }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Startup not found" });
    }
    res.json({ message: "Startup held successfully", startup: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.put('/api/startups/activate/:id', async (req, res) => {
  try {
    const startup = await Startup.findByIdAndUpdate(req.params.id, 
      { status: 'active' }, { new: true }
    );
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }
    res.status(200).json({ message: "Startup activated successfully", startup });
  } catch (err) {
    res.status(500).json({ message: 'Error activating startup', error: err });
  }
});


// GET /api/startups/:id - Get a specific startup by ID
app.get("/api/startups/:id", async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    res.status(200).json(startup);
  } catch (error) {
    res.status(500).json({ message: "Error fetching startup", error });
  }
});
// PUT /api/startups/:id - Update full startup data
app.put("/api/startups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStartup = await Startup.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedStartup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    res.status(200).json({ message: "Startup updated successfully", startup: updatedStartup });
  } catch (error) {
    res.status(500).json({ message: "Error updating startup", error });
  }
});

// Install bcryptjs to hash passwords if needed (currently plain password is generated during register)

// Login Startup
app.post('/api/startup-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const startup = await Startup.findOne({ email });

    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    // Match password
    if (startup.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      startup: {
        id: startup._id,
        fullName: startup.fullName,
        email: startup.email,
        status: startup.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});



// Funding Schema
const fundingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Startup", required: true },
    youtube: String,
    location: String,
    sector: String,
    shortDescription: String,
    longDescription: String,
    logoUrl: String,
    stage: String,
    status: {
      type: String,
      enum: ["waiting", "approved","on hold"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

const Funding = mongoose.model('Funding', fundingSchema);


// GET /api/fundings/me
app.get('/api/fundings/me', async (req, res) => {
  try {
    const userId = req.query.userId; // get from query
    const fundings = await Funding.find({ userId });
    res.json(fundings);
  } catch (err) {
    console.error('Error fetching fundings:', err);
    res.status(500).json({ error: 'Failed to fetch fundings' });
  }
});

// POST /api/fundings
app.post('/api/fundings', upload.single('logo'), async (req, res) => {
  try {
    const userId = req.body.userId; // Get from body (change if you use auth middleware)
    const { youtube, location, sector, shortDescription, longDescription, stage } = req.body;
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const funding = new Funding({
      userId,
      youtube,
      location,
      sector,
      shortDescription,
      longDescription,
      stage,
      status: 'waiting',
      logoUrl,
    });

    await funding.save();
    res.status(201).json({ message: 'Funding entry created', funding });
  } catch (err) {
    console.error('Error creating funding:', err);
    res.status(500).json({ error: 'Failed to create funding' });
  }
});

// DELETE /api/fundings/:id
app.delete('/api/fundings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Funding.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Funding not found' });
    }

    res.status(200).json({ message: 'Funding deleted successfully' });
  } catch (err) {
    console.error('Error deleting funding:', err);
    res.status(500).json({ error: 'Failed to delete funding' });
  }
});

// PUT /api/fundings/approve/:id (admin only)
app.put('/api/fundings/approve/:id', async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id);
    if (!funding) return res.status(404).json({ error: 'Funding not found' });

    funding.status = 'approved';
    await funding.save();
    res.json({ message: 'Funding approved', funding });
  } catch (err) {
    console.error('Error approving funding:', err);
    res.status(500).json({ error: 'Failed to approve funding' });
  }
});

app.put('/api/fundings/hold/:id', async (req, res) => {
  const fundingId = req.params.id;

  try {
    // Find the funding by its ID
    const funding = await Funding.findById(fundingId);

    if (!funding) {
      return res.status(404).json({ message: 'Funding not found' });
    }

    // Update the funding status to 'on hold'
    funding.status = 'on hold';
    
    // Save the updated funding back to the database
    const updatedFunding = await funding.save();
    
    // Send the updated funding as a response
    res.status(200).json(updatedFunding);
  } catch (error) {
    console.error('Error holding funding:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// PUT /api/fundings/:id (update with new image if provided)
app.put('/api/fundings/:id', upload.single('logo'), async (req, res) => {
  try {
    const { youtube, location, sector, shortDescription, longDescription, stage } = req.body;
    const { id } = req.params;

    const funding = await Funding.findById(id);
    if (!funding) {
      return res.status(404).json({ error: 'Funding not found' });
    }

    funding.youtube = youtube;
    funding.location = location;
    funding.sector = sector;
    funding.shortDescription = shortDescription;
    funding.longDescription = longDescription;
    funding.stage = stage;

    if (req.file) {
      funding.logoUrl = `/uploads/${req.file.filename}`;
    }

    await funding.save();
    res.json({ message: 'Funding updated', funding });
  } catch (err) {
    console.error('Error updating funding:', err);
    res.status(500).json({ error: 'Failed to update funding' });
  }
});

// GET /api/fundings/:id
app.get('/api/fundings/:id', async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id);
    if (!funding) {
      return res.status(404).json({ error: 'Funding not found' });
    }
    res.json(funding);
  } catch (err) {
    console.error('Error fetching funding:', err);
    res.status(500).json({ error: 'Failed to fetch funding' });
  }
});

// API Route to Get All Fundings
app.get("/api/fundings", async (req, res) => {
  try {
    const fundings = await Funding.find();
    res.status(200).json(fundings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fundings", error });
  }
});

// 1. MongoDB Schema
const interestSchema = new mongoose.Schema({
  fundingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Funding', // Assuming you have a 'Funding' model
    required: true,
  },
  type: {
    type: String,
    enum: ['Individual', 'Organization'],
    required: false, // You can make it true if you collect in form
  },
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Interest = mongoose.model('Interest', interestSchema);

// 2. POST API to Submit Interest
app.post('/api/interests', async (req, res) => {
  try {
    const { fundingId, type, name, email, phone } = req.body;

    if (!fundingId) {
      return res.status(400).json({ message: 'Funding ID is required' });
    }

    const newInterest = new Interest({
      fundingId,
      type,
      name,
      email,
      phone,
    });

    await newInterest.save();

    res.status(201).json({ message: 'Interest submitted successfully!' });
  } catch (error) {
    console.error('Error submitting interest:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching data for userId:', userId);  // Log the userId

    // Check if the userId is valid (24 characters long)
    if (userId.length !== 24) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Fetch funding data based on userId
    const fundings = await Funding.countDocuments({ userId });

    console.log('Fetched funding count:', fundings);  // Log the fetched funding count

    res.json({
      fundings,
    });
  } catch (error) {
    console.error('Error fetching funding data:', error);  // Log the error details
    res.status(500).json({ error: 'Failed to fetch funding data' });
  }
});


// --- Career Schema & Model ---
const jobSchema = new mongoose.Schema({
  userId: String,
  company: String,
  logo: String,
  isNew: Boolean,
  featured: Boolean,
  position: String,
  role: String,
  level: String,
  postedAt: String,
  contract: String,
  district: String,
  salary: String,
  experience: String,
  dateOfJoining: String,
  languages: [String],
  tools: [String],
});

const Job = mongoose.model("Job", jobSchema);

// --- API Routes ---

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Add a job
app.post("/api/jobs", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: "Failed to add job", details: err.message });
  }
});

// Update a job
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Job not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update job", details: err.message });
  }
});

// Delete a job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete job", details: err.message });
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
  hold: { type: Boolean, default: true },
}, { timestamps: true }); // adds createdAt and updatedAt

  
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
  

  // GET all cofounders
  app.get("/api/cofounders", async (req, res) => {
    try {
      const { search, filter, from, to, industry } = req.query;
      const query = {};
  
      if (search && filter) {
        query[filter] = { $regex: search, $options: "i" };
      }
  
      if (industry) {
        query.industries = industry;
      }
  
      if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) query.createdAt.$lte = new Date(to);
      }
  
      const cofounders = await Cofounder.find(query).sort({ createdAt: -1 });
      res.status(200).json(cofounders);
    } catch (error) {
      console.error(error);
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

app.put("/api/cofounders/:id/status", async (req, res) => {
  try {
    const { hold } = req.body;
    const updated = await Cofounder.findByIdAndUpdate(
      req.params.id,
      { hold },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status" });
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
// ✅ Service Sub-Schema
const serviceSchema = new mongoose.Schema({
  name: String,
  quote: Number,
});

// ✅ Main Form Schema
const solutionSchema = new mongoose.Schema(
  {
    startupName: String,
    founderName: String,
    email: String,
    phoneNumber: String,
    services: [serviceSchema],
    status: {
      type: String,
      enum: ["new", "updated"],
      default: "new",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Mongoose Model
const FormData = mongoose.model("ITSolutions", solutionSchema);

// ✅ Create Record
app.post("/api/solutions", async (req, res) => {
  try {
    const newForm = new FormData(req.body);
    await newForm.save();
    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit form", details: error.message });
  }
});

// ✅ Get All Records
app.get("/api/solutions", async (req, res) => {
  try {
    const solutions = await FormData.find();
    res.status(200).json(solutions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Update solution
app.put("/api/solutions/:id", async (req, res) => {
  const updated = await FormData.findByIdAndUpdate(
    req.params.id,
    { ...req.body, status: "updated" },
    { new: true }
  );
  res.json(updated);
});

// ✅ Delete a Record
app.delete("/api/solutions/:id", async (req, res) => {
  try {
    await FormData.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data" });
  }
});

// ✅ Export Data to Excel
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
      { header: "Services", key: "services", width: 40 },
    ];

    solutions.forEach((solution) => {
      worksheet.addRow({
        startupName: solution.startupName,
        founderName: solution.founderName,
        email: solution.email,
        phoneNumber: solution.phoneNumber,
        services: solution.services.map(s => `${s.name} ($${s.quote})`).join(", "),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=solutions.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to export data", details: error.message });
  }
});

// Mongoose Schema for Investor
const investorSchema = new mongoose.Schema({
  type: String,
  name: String,
  image: String,
});

const OurInvestor = mongoose.model("OurInvestor", investorSchema);

// API Route to Fetch Investors
app.get("/api/ourinvestors", async (req, res) => {
  try {
    const data = await OurInvestor.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching investors", error: err });
  }
});

// API Route to Add a New Investor
app.post("/api/ourinvestors", async (req, res) => {
  try {
    const { type, name, image } = req.body;
    const newInvestor = new OurInvestor({ type, name, image });
    await newInvestor.save();
    res.status(201).json(newInvestor);
  } catch (err) {
    res.status(500).json({ message: "Error adding investor", error: err });
  }
});

// API Route to Update an Investor
app.put("/api/ourinvestors/:id", async (req, res) => {
  try {
    const { type, name, image } = req.body;
    const updatedInvestor = await OurInvestor.findByIdAndUpdate(
      req.params.id,
      { type, name, image },
      { new: true }
    );
    res.status(200).json(updatedInvestor);
  } catch (err) {
    res.status(500).json({ message: "Error updating investor", error: err });
  }
});

// API Route to Delete an Investor
app.delete("/api/ourinvestors/:id", async (req, res) => {
  try {
    await OurInvestor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Investor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting investor", error: err });
  }
});


// Mongoose Schema
const testimonialSchema = new mongoose.Schema({
  name: String,
  image: String,
  review: String,
  rating: Number
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// GET API for testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});
// POST - create a new testimonial
app.post('/api/testimonials', async (req, res) => {
  try {
    const { name, image, review, rating } = req.body;
    const newTestimonial = new Testimonial({ name, image, review, rating });
    await newTestimonial.save();
    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// PUT - update a testimonial
app.put('/api/testimonials/:id', async (req, res) => {
  try {
    const { name, image, review, rating } = req.body;
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { name, image, review, rating },
      { new: true }
    );
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE - delete a testimonial
app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
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
    const fundingCount= await Funding.countDocuments();

    res.status(200).json({
      startupCount,
      cofounderCount,
      businessCount,
      consultationCount,
      career,
      events,
      solution,
      fundingCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error retrieving stats" });
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
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Career', // Link to careers collection
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['new', 'viewed', 'shortlisted'],
    default: 'new',
  },
});

const Recruitment = mongoose.model("Recruitment", recruitmentSchema);

// API route
app.post("/api/recruitment/apply", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, jobId } = req.body;
    const resumeUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : "";

    const newApplication = new Recruitment({ name, email, phone, resumeUrl, jobId, });
    await newApplication.save();

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/applicants", async (req, res) => {
  try {
    const applicants = await Recruitment.find({ status: "new" }).populate("jobId", "role");
    res.json(applicants);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/recruitments", async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const query = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            $or: [
              { name: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
              { phone: new RegExp(search, "i") }
            ]
          }
        : {})
    };

    const applicants = await Recruitment.find(query).populate("jobId", "role");
    res.json(applicants);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/recruitments/:id", async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    const updated = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error updating applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/recruitments/:id", async (req, res) => {
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const ExcelJS = require("exceljs");

app.get("/api/recruitments/export", async (req, res) => {
  try {
    const data = await Recruitment.find().populate("jobId", "role");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applicants");

    worksheet.columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Phone", key: "phone" },
      { header: "Job Role", key: "role" },
      { header: "Status", key: "status" },
      { header: "Resume URL", key: "resumeUrl" },
      { header: "Applied At", key: "appliedAt" }
    ];

    data.forEach((app) => {
      worksheet.addRow({
        name: app.name,
        email: app.email,
        phone: app.phone,
        role: app.jobId?.role || "N/A",
        status: app.status,
        resumeUrl: app.resumeUrl,
        appliedAt: app.appliedAt.toISOString()
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=applicants.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting Excel:", err);
    res.status(500).json({ message: "Failed to export Excel" });
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
