const Startup = require("../Schema/Startup");
const transporter = require("../utils/sendMail");
const mongoose = require("mongoose");
const otpStore = {};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Your OTP for TACTOS Startup Registration',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false, message: 'Incorrect OTP' });
};

exports.registerStartup = async (req, res) => {
  try {
    const formData = req.body;
    const existingStartup = await Startup.findOne({ email: formData.email });
    if (existingStartup) {
      return res.status(400).json({ message: "Email already registered." });
    }

    if (req.file) {
      formData.pitchDeck = `/uploads/${req.file.filename}`;
    }

    const namePart = (formData.fullName || "").slice(0, 3);
    const startupPart = (formData.startupName || "").slice(0, 3);
    const generatedPassword = (namePart + startupPart).toLowerCase();
    formData.password = generatedPassword;

    const newStartup = new Startup(formData);
    await newStartup.save();

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: formData.email,
      subject: 'Your Startup Registration Credentials',
      html: `<h3>Welcome to Tactos!</h3>
             <p>Your startup <strong>${formData.startupName}</strong> has been registered.</p>
             <p><strong>Email:</strong> ${formData.email}<br/>
             <strong>Password:</strong> ${generatedPassword}</p>`,
    });

    res.status(201).json({ message: "Startup registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
};

exports.getAllStartups = async (req, res) => {
  try {
    const startups = await Startup.find();
    res.status(200).json(startups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching startups", error });
  }
};

exports.getStartupById = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: "Startup not found" });
    res.status(200).json(startup);
  } catch (error) {
    res.status(500).json({ message: "Error fetching startup", error });
  }
};

exports.updateStartup = async (req, res) => {
  try {
    const updated = await Startup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Startup not found" });
    res.status(200).json({ message: "Updated successfully", startup: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating startup", error });
  }
};

exports.deleteStartup = async (req, res) => {
  try {
    await Startup.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Startup deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting startup", error });
  }
};

exports.setHoldStatus = async (req, res) => {
  try {
    const updated = await Startup.findByIdAndUpdate(req.params.id, { status: "hold" }, { new: true });
    if (!updated) return res.status(404).json({ message: "Startup not found" });
    res.json({ message: "Startup held successfully", startup: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.activateStartup = async (req, res) => {
  try {
    const startup = await Startup.findByIdAndUpdate(req.params.id, { status: "active" }, { new: true });
    if (!startup) return res.status(404).json({ message: "Startup not found" });
    res.status(200).json({ message: "Startup activated", startup });
  } catch (err) {
    res.status(500).json({ message: "Error activating startup", error: err });
  }
};

exports.loginStartup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const startup = await Startup.findOne({ email });
    if (!startup) return res.status(404).json({ message: "Startup not found" });

    if (startup.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      startup: {
        id: startup._id,
        fullName: startup.fullName,
        email: startup.email,
        status: startup.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};

exports.getStartupByUserId = async (req, res) => {
    const userId = req.params.userId;
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }
  
    try {
      const startup = await Startup.findById(userId);  // find by _id = userId
      if (!startup) {
        return res.status(404).json({ message: "Startup not found for this userId" });
      }
      res.status(200).json(startup);
    } catch (error) {
      res.status(500).json({ message: "Error fetching startup", error });
    }
  };
  