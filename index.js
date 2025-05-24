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
  origin: ['http://localhost:3000', 'https://tactos.in','https://tactosadmin.vercel.app','https://0998a2ee-0561-4879-a06b-af709d844eb7-00-hbvqeg6fn9z8.pike.replit.dev'], // adjust as needed
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



//Routes
const startupRoutes = require("./Route/startupRoutes.js");
const fundingRoutes = require("./Route/fundingRoutes");
const interestRoutes = require('./Route/interestRoutes');
const jobRoutes = require('./Route/jobRoutes');
const jobAppliedRoutes = require('./Route/jobAppliedRoutes');
const cofounderRoutes = require('./Route/cofounderRoutes');
const businessRoutes=require ('./Route/businessRoutes.js');
const businessConsultationRoutes = require("./Route/businessConsultationRoutes");
const solutionRoutes = require("./Route/solutionRoutes");
const investorRoutes = require("./Route/investorRoutes");
const testimonialRoutes = require("./Route/testimonialRoutes");
const careerRoutes = require("./Route/careerRoutes");
const recruitmentRoutes = require("./Route/recruitmentRoutes");
const eventRoutes = require("./Route/eventRoutes");
const eventRegistrationRoutes = require("./Route/eventRegistrationRoutes");
const adminRoutes = require("./Route/adminRoutes");
const stageRoutes = require("./Route/stageRoutes");
const sectorRoutes = require("./Route/sectorRoutes");
const startupStageRoutes = require("./Route/startupStageRoutes");
const industryRoutes = require('./Route/industryRoutes');
const investorToggleRoutes = require('./Route/investorToggleRoutes');
const clientsayRoutes = require('./Route/clientsayRoutes');


app.use("/api", startupRoutes);
app.use("/api/fundings", fundingRoutes);
app.use('/api', interestRoutes);
app.use('/api', jobRoutes);
app.use('/api', jobAppliedRoutes);
app.use('/api', cofounderRoutes);
app.use('/api',businessRoutes);
app.use("/api", businessConsultationRoutes);
app.use("/api", solutionRoutes);
app.use("/api", investorRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", careerRoutes);
app.use("/api/recruitments", recruitmentRoutes);
app.use("/api", eventRoutes);
app.use("/api", eventRegistrationRoutes);
app.use("/api", adminRoutes);
app.use("/api", stageRoutes);
app.use("/api", sectorRoutes);
app.use("/api", startupStageRoutes);
app.use('/api', industryRoutes);
app.use('/api', investorToggleRoutes);
app.use('/api', clientsayRoutes);

const Startup = require('./Schema/Startup');
const Cofounder = require('./Schema/Cofounder');
const Business = require('./Schema/Business');
const BusinessConsultation = require('./Schema/BusinessConsultation');
const Career = require('./Schema/Career');
const Event = require('./Schema/Event');
// const FormData = require('./Schema/FormData');
const Funding = require('./Schema/Funding');

app.get("/api/stats", async (req, res) => {
  try {
    console.log("Fetching stats...");
    const startupCount = await Startup.countDocuments();
    const cofounderCount = await Cofounder.countDocuments();
    const businessCount = await Business.countDocuments();
    const consultationCount = await BusinessConsultation.countDocuments();
    const careerCount = await Career.countDocuments();
    const eventsCount = await Event.countDocuments();
    const fundingCount = await Funding.countDocuments();

    const stats = {
      startupCount,
      cofounderCount,
      businessCount,
      consultationCount,
      careerCount,
      eventsCount,
      fundingCount,
    };

    console.log(stats);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error retrieving stats" });
  }
});
  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
