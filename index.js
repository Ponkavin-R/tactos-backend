const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 5000;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'https://tactos.in','https://tactosadmin.vercel.app'], // adjust as needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.send("API is running");
});
let otpStore = {};
// Configure your email transporter (use your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or use your SMTP service provider
  auth: {
    user: process.env.SMTP_EMAIL, // your email
    pass: process.env.SMTP_PASSWORD, // your email password or app password
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], // Added pdf
      type: 'upload',
      resource_type: 'auto', // Important: Allows non-image files like PDFs
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

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'Your OTP for TACTOS Startup Registration',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });

    // Clear OTP after 5 mins
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email];
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Incorrect OTP' });
  }
});

// API Route to Handle Form Submission
// API Route to Handle Form Submission
app.post("/api/register", upload.single("pitchDeck"), async (req, res) => {
  try {
    const formData = req.body;

    // Check if email is already registered
    const existingStartup = await Startup.findOne({ email: formData.email });
    if (existingStartup) {
      return res.status(400).json({ message: "Email already registered. Please log in or use a different email." });
    }

    if (req.file) {
      formData.pitchDeck = `/uploads/${req.file.filename}`;
    }

    // Generate password using first 3 letters of fullName and startupName
    const namePart = (formData.fullName || "").slice(0, 3);
    const startupPart = (formData.startupName || "").slice(0, 3);
    const generatedPassword = (namePart + startupPart).toLowerCase();

    formData.password = generatedPassword;

    const newStartup = new Startup(formData);
    await newStartup.save();

    // Send email with login credentials
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: formData.email,
      subject: 'Your Startup Registration Credentials',
      html: `
        <h3>Welcome to Tactos!</h3>
        <p>Dear ${formData.fullName},</p>
        <p>Your startup <strong>${formData.startupName}</strong> has been registered successfully.</p>
        <p>Here are your login credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Password:</strong> ${generatedPassword}</li>
        </ul>
        <p>Use these credentials to log in and manage your startup profile.</p>
        <br/>
        <p>Best regards,<br/>Tactos Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Startup registered and credentials sent to email!" });
  } catch (error) {
    console.error("Error during registration:", error);
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

app.post('/api/startup-login', async (req, res) => {
  console.log('Request body:', req.body);

  const { email, password } = req.body;

  try {
    const startup = await Startup.findOne({ email });

    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    // Compare password exactly as is (case-sensitive)
    if (startup.password !== password) {
      console.log("Email from req.body:", email);
console.log("Password from req.body:", password);
console.log("Startup from DB:", startup);
console.log("Password from req.body:", req.body.password);
console.log("Password in DB:", user.password);

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




// ------------------ SCHEMA ------------------ //
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
      enum: ["waiting", "approved", "on hold"],
      default: "waiting",
    },

    // ✅ New Fields
    amountSeeking: Number,
    equityOffered: Number,
    valuation: Number,
    fundUsage: String,
    minimumInvestment: Number,
    ticketSize: Number,
    roleProvided: String,
    amountRaised: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Funding = mongoose.model('Funding', fundingSchema);

// ------------------ ROUTES ------------------ //

app.put('/api/fundings/update-status/:id', async (req, res) => {
  const { status } = req.body;

  if (!["waiting", "approved", "on hold"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const updatedFunding = await Funding.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedFunding) {
      return res.status(404).json({ message: 'Funding not found' });
    }

    res.status(200).json({
      message: 'Status updated successfully',
      data: updatedFunding,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/fundings/me
app.get('/api/fundings/me', async (req, res) => {
  try {
    const userId = req.query.userId;
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
    const {
      userId,
      youtube,
      location,
      sector,
      shortDescription,
      longDescription,
      stage,
      amountSeeking,
      equityOffered,
      valuation,
      fundUsage,
      minimumInvestment,
      ticketSize,
      roleProvided,
      amountRaised,
    } = req.body;

    const logoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const funding = new Funding({
      userId,
      youtube,
      location,
      sector,
      shortDescription,
      longDescription,
      stage,
      logoUrl,
      status: 'waiting',

      // Set new fields
      amountSeeking,
      equityOffered,
      valuation,
      fundUsage,
      minimumInvestment,
      ticketSize,
      roleProvided,
      amountRaised,
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

// PUT /api/fundings/approve/:id
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

// PUT /api/fundings/hold/:id
app.put('/api/fundings/hold/:id', async (req, res) => {
  try {
    const funding = await Funding.findById(req.params.id);
    if (!funding) return res.status(404).json({ message: 'Funding not found' });

    funding.status = 'on hold';
    const updatedFunding = await funding.save();
    res.status(200).json(updatedFunding);
  } catch (error) {
    console.error('Error holding funding:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/fundings/amount/:id
app.put('/api/update-amount/:id', async (req, res) => {
  const { id } = req.params;
  const { amountRaised } = req.body;

  try {
    const updated = await Funding.findByIdAndUpdate(
      id,
      { amountRaised },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Funding not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// PUT /api/fundings/:id (update with or without new image)
app.put('/api/fundings/:id', upload.single('logo'), async (req, res) => {
  try {
    const {
      youtube,
      location,
      sector,
      shortDescription,
      longDescription,
      stage,
      amountSeeking,
      equityOffered,
      valuation,
      fundUsage,
      minimumInvestment,
      ticketSize,
      roleProvided,
      amountRaised,
    } = req.body;

    const { id } = req.params;
    const funding = await Funding.findById(id);
    if (!funding) return res.status(404).json({ error: 'Funding not found' });

    // Update fields
    funding.youtube = youtube;
    funding.location = location;
    funding.sector = sector;
    funding.shortDescription = shortDescription;
    funding.longDescription = longDescription;
    funding.stage = stage;

    // New fields
    funding.amountSeeking = amountSeeking;
    funding.equityOffered = equityOffered;
    funding.valuation = valuation;
    funding.fundUsage = fundUsage;
    funding.minimumInvestment = minimumInvestment;
    funding.ticketSize = ticketSize;
    funding.roleProvided = roleProvided;
    funding.amountRaised = amountRaised;

    // Update logo if provided
    if (req.file) {
      funding.logoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
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
    if (!funding) return res.status(404).json({ error: 'Funding not found' });
    res.json(funding);
  } catch (err) {
    console.error('Error fetching funding:', err);
    res.status(500).json({ error: 'Failed to fetch funding' });
  }
});

// GET all fundings
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
    const jobs = await Job.countDocuments({ userId });

    console.log('Fetched funding count:', fundings);  // Log the fetched funding count

    res.json({
      fundings,
      jobs,
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
  shortDescription: {
    type: String,
    maxlength: 300, // limit short description length
  },
  longDescription: {
    type: String,
  },
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
app.get('/api/jobs/:id', async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  res.json(job);
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

const jobAppliedSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  resumeUrl: String,
  userId: String,
  company: String,
  jobId: String,
  appliedAt: { type: Date, default: Date.now },
});

const JobApplied= mongoose.model("JobApplied", jobAppliedSchema);
app.post("/api/jobapplied/", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, userId, company, jobId } = req.body;
    const resumeUrl = req.file?.path || "";

    const newApplication = new JobApplied({
      name,
      email,
      phone,
      resumeUrl,
      userId,
      company,
      jobId,
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Failed to submit application:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Assuming you're using Express and MongoDB
app.get("/api/jobapplied/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await JobApplied.find({ jobId }).exec();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const CofounderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true }, // renamed from phone
  linkedin: { type: String, required: true },
  district: { type: String, required: true }, // maps to district
  employmentStatus: { type: String, enum: ["Employed", "Unemployed", "Student"], required: true },
  industries: [{ type: String, required: true }],
  resume: { type: String, required: true }, // path or URL to uploaded file

  // Existing fields kept if still needed later
  // role: String,
  // expertise: String,
  // experience: Number,
  // achievements: String,
  // stagePreference: String,
  // businessModel: String,
  // skills: [String],
  // expectedRole: String,
  // investmentCapacity: Number,
  // cofounderReason: String,

  hold: { type: Boolean, default: true },
}, { timestamps: true });


  
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
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  district: { type: String, required: true },
  linkedin: { type: String },
  employmentStatus: { type: String, enum: ["Employed", "Unemployed", "Studying"], required: true },
  cv: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["new", "processing", "accept"], default: "new" }
});

  
  const Business = mongoose.model("Business", BusinessSchema);
  
  app.post("/api/businessideationhub", upload.single("cv"), async (req, res) => {
    try {
      const businessData = new Business({
        fullName: req.body.fullName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        district: req.body.district,
        linkedin: req.body.linkedin,
        employmentStatus: req.body.employmentStatus,
        cv: req.file ? req.file.path : "", // Save file path
        date: new Date(), // Set the current date and time
        status: "new", // Default status
      });
  
      await businessData.save();
      res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  




  const BusinessConsultationSchema = new mongoose.Schema(
    {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      district: { type: String, required: true },
      linkedin: { type: String },
      businessName: { type: String, required: true },
      businessDescription: { type: String, required: true },
      website: { type: String, required: true },
      status: {
        type: String,
        enum: ["new","process", "approve"],
        default: "new",
      },
    },
    {
      timestamps: true, // ✅ adds createdAt and updatedAt fields
    }
  );
  
  // Create the model
  const BusinessConsultation = mongoose.model(
    "BusinessConsultation",
    BusinessConsultationSchema
  );
  
  // API Route to handle form submission
  app.post("/api/businessconsultation", async (req, res) => {
    try {
      const formData = req.body;
      console.log("Received form data:", formData);
  
      const requiredFields = [
        "fullName",
        "email",
        "phone",
        "district",
        "linkedinProfile",
        "businessName",
        "businessDescription",
        "website",
      ];
  
      // Validate required fields
      const missingFields = requiredFields.filter(
        (field) => !formData[field]
      );
  
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }
  
      // Map frontend 'linkedinProfile' to schema 'linkedin'
      const consultationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        district: formData.district,
        linkedin: formData.linkedinProfile,
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        website: formData.website,
        status: "new", // default status
      };
  
      const newConsultation = new BusinessConsultation(consultationData);
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
      enum: ["new", "processing", "accepted"],
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

app.put("/api/solutions/:id", async (req, res) => {
  try {
    // Update with the data from req.body (including status)
    const updated = await FormData.findByIdAndUpdate(
      req.params.id,
      req.body,  // <-- directly use req.body without forcing status
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Solution not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update solution", details: error.message });
  }
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


const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    eventId: { type: String, required: true },
    eventName: { type: String, default: null },
    eventType: { type: String, default: null },
    screenshot: { type: String, default: null },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt fields automatically
  }
);

const EventRegistration = mongoose.model("eventregistration", registrationSchema);

// Route to handle registration
app.post("/api/eventregister", upload.single("screenshot"), async (req, res) => {
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
// Add this route to your Express backend
app.get("/api/eventregistrations/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await EventRegistration.find({ eventId });
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Failed to fetch registrations." });
  }
});

// DELETE /api/eventregistrations/:id
app.delete("/api/eventregistrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await EventRegistration.findByIdAndDelete(id);
    res.status(200).json({ message: "Registration deleted successfully" });
  } catch (err) {
    console.error("Error deleting registration:", err);
    res.status(500).json({ error: "Error deleting registration", detail: err.message });
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
app.put("/api/businesses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["new", "processing", "accept"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({ message: "Status updated successfully", data: updatedBusiness });
  } catch (error) {
    console.error("Error updating business status:", error);
    res.status(500).json({ message: "Internal server error" });
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

app.put("/api/businessconsultation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value if needed
    const allowedStatuses = ["new", "Processing", "Accepted"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update the status field
    const updatedConsultation = await BusinessConsultation.findByIdAndUpdate(
      id,
      { status },
      { new: true } // return the updated document
    );

    if (!updatedConsultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.json({ message: "Status updated successfully", data: updatedConsultation });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//Admin login
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const Admin = mongoose.model("Admin", adminSchema);

app.post("/api/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email, password }); // Direct match (plain text)
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", adminId: admin._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/admins", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    // Check if email exists
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const newAdmin = new Admin({ email, password });
    await newAdmin.save();

    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get All Admins
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Update Admin
app.put('/api/admins/:id', async (req, res) => {
  try {
    const { email, password } = req.body;
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { email, password },
      { new: true }
    );
    if (!updatedAdmin) return res.status(404).json({ error: 'Admin not found' });
    res.status(200).json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Admin
app.delete('/api/admins/:id', async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) return res.status(404).json({ error: 'Admin not found' });
    res.status(200).json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



//add data

const stageSchema = new mongoose.Schema({
  stageName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

const Stage=mongoose.model('Stage', stageSchema);
// CREATE a new stage
app.post('/api/stage', async (req, res) => {
  try {
    const { stageName } = req.body;
    const newStage = new Stage({ stageName });
    const savedStage = await newStage.save();
    res.status(201).json(savedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create stage', details: err.message });
  }
});

// READ all stages
app.get('/api/stage', async (req, res) => {
  try {
    const stages = await Stage.find().sort({ createdAt: -1 });
    res.status(200).json(stages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stages' });
  }
});

// UPDATE a stage by ID
app.put('/api/stage/:id', async (req, res) => {
  try {
    const { stageName } = req.body;
    const updatedStage = await Stage.findByIdAndUpdate(
      req.params.id,
      { stageName },
      { new: true }
    );
    if (!updatedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json(updatedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update stage', details: err.message });
  }
});

// DELETE a stage by ID
app.delete('/api/stage/:id', async (req, res) => {
  try {
    const deletedStage = await Stage.findByIdAndDelete(req.params.id);
    if (!deletedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json({ message: 'Stage deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stage' });
  }
});

const sectorSchema = new mongoose.Schema({
  sectorName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

const Sector=mongoose.model('Sector', sectorSchema);
// CREATE a new stage
app.post('/api/sector', async (req, res) => {
  try {
    const { stageName } = req.body;
    const newStage = new Sector({ stageName });
    const savedStage = await newStage.save();
    res.status(201).json(savedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create stage', details: err.message });
  }
});

// READ all stages
app.get('/api/sector', async (req, res) => {
  try {
    const stages = await Sector.find().sort({ createdAt: -1 });
    res.status(200).json(stages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stages' });
  }
});

// UPDATE a stage by ID
app.put('/api/sector/:id', async (req, res) => {
  try {
    const { stageName } = req.body;
    const updatedStage = await Sector.findByIdAndUpdate(
      req.params.id,
      { stageName },
      { new: true }
    );
    if (!updatedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json(updatedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update stage', details: err.message });
  }
});

// DELETE a stage by ID
app.delete('/api/sector/:id', async (req, res) => {
  try {
    const deletedStage = await Sector.findByIdAndDelete(req.params.id);
    if (!deletedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json({ message: 'Stage deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stage' });
  }
});

const startupstageSchema = new mongoose.Schema({
  stageName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

const StartupStage=mongoose.model('StartupStage', startupstageSchema);
// CREATE a new stage
app.post('/api/startupstage', async (req, res) => {
  try {
    const { stageName } = req.body;
    const newStage = new StartupStage({ stageName });
    const savedStage = await newStage.save();
    res.status(201).json(savedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create stage', details: err.message });
  }
});

// READ all stages
app.get('/api/startupstage', async (req, res) => {
  try {
    const stages = await StartupStage.find().sort({ createdAt: -1 });
    res.status(200).json(stages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stages' });
  }
});

// UPDATE a stage by ID
app.put('/api/startupstage/:id', async (req, res) => {
  try {
    const { stageName } = req.body;
    const updatedStage = await StartupStage.findByIdAndUpdate(
      req.params.id,
      { stageName },
      { new: true }
    );
    if (!updatedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json(updatedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update stage', details: err.message });
  }
});

// DELETE a stage by ID
app.delete('/api/startupstage/:id', async (req, res) => {
  try {
    const deletedStage = await StartupStage.findByIdAndDelete(req.params.id);
    if (!deletedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json({ message: 'Stage deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stage' });
  }
});

const industory = new mongoose.Schema({
  stageName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: true });

const Industory=mongoose.model('Industory', industory);
// CREATE a new stage
app.post('/api/industory', async (req, res) => {
  try {
    const { stageName } = req.body;
    const newStage = new Industory({ stageName });
    const savedStage = await newStage.save();
    res.status(201).json(savedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create stage', details: err.message });
  }
});

// READ all stages
app.get('/api/industory', async (req, res) => {
  try {
    const stages = await Industory.find().sort({ createdAt: -1 });
    res.status(200).json(stages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stages' });
  }
});

// UPDATE a stage by ID
app.put('/api/industory/:id', async (req, res) => {
  try {
    const { stageName } = req.body;
    const updatedStage = await Industory.findByIdAndUpdate(
      req.params.id,
      { stageName },
      { new: true }
    );
    if (!updatedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json(updatedStage);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update stage', details: err.message });
  }
});

// DELETE a stage by ID
app.delete('/api/industory/:id', async (req, res) => {
  try {
    const deletedStage = await Industory.findByIdAndDelete(req.params.id);
    if (!deletedStage) return res.status(404).json({ error: 'Stage not found' });
    res.status(200).json({ message: 'Stage deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stage' });
  }
});


const investorToggleSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
});

const InvestorToggle=mongoose.model("InvestorToggle", investorToggleSchema);

app.get("/api/investortoggle", async (req, res) => {
  let toggle = await InvestorToggle.findOne();
  if (!toggle) {
    toggle = await InvestorToggle.create({ enabled: false });
  }
  res.json(toggle);
});

// PUT update toggle state
app.put("/api/investortoggle", async (req, res) => {
  let toggle = await InvestorToggle.findOne();
  if (!toggle) {
    toggle = new InvestorToggle();
  }
  toggle.enabled = req.body.enabled;
  await toggle.save();
  res.json(toggle);
});


const ClientSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
});

const Clientsay=mongoose.model("Clientsay", ClientSchema);

app.get("/api/clientsay", async (req, res) => {
  let toggle = await Clientsay.findOne();
  if (!toggle) {
    toggle = await Clientsay.create({ enabled: false });
  }
  res.json(toggle);
});

// PUT update toggle state
app.put("/api/clientsay", async (req, res) => {
  let toggle = await Clientsay.findOne();
  if (!toggle) {
    toggle = new Clientsay();
  }
  toggle.enabled = req.body.enabled;
  await toggle.save();
  res.json(toggle);
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
